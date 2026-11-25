const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const DEFAULT_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:4173',
    'https://tracker-ksb7.vercel.app',
];

const VERCEL_PROJECT_ORIGIN_REGEX = /^https:\/\/tracker-ksb7(-[a-z0-9-]+)?\.vercel\.app$/;

const getAllowedOrigins = () =>
    process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
        : DEFAULT_ORIGINS;

const createSocketServer = (jwtSecret = process.env.JWT_SECRET) => {
    const app = express();
    app.use(express.json({ limit: '50kb' }));

    const server = http.createServer(app);
    const allowedOrigins = getAllowedOrigins();

    const io = new Server(server, {
        cors: {
            origin: (origin, callback) => {
                if (!origin || allowedOrigins.includes(origin) || VERCEL_PROJECT_ORIGIN_REGEX.test(origin)) {
                    return callback(null, true);
                }
                return callback(new Error('Origin not allowed by CORS'));
            },
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    // Map<userId, Set<socketId>>
    const onlineUsers = new Map();
    // Bounded deduplication cache for message IDs
    const recentMessageIds = new Map();

    const markAndCheckDuplicate = (messageId) => {
        if (!messageId) return false;
        const now = Date.now();
        if (recentMessageIds.has(messageId)) return true;
        recentMessageIds.set(messageId, now);
        if (recentMessageIds.size > 5000) {
            for (const [id, ts] of recentMessageIds.entries()) {
                if (now - ts > 5 * 60 * 1000) recentMessageIds.delete(id);
            }
        }
        return false;
    };

    const emitMessageToParticipants = (msg) => {
        if (!msg || !msg.receiverId || !msg.sender) return;
        if (markAndCheckDuplicate(msg._id)) return;

        io.to(`user:${msg.receiverId}`).emit('newMessage', msg);
        io.to(`user:${msg.sender}`).emit('newMessage', msg);
    };

    const getOnlineUserIds = () => Array.from(onlineUsers.keys());

    // Authenticate every socket connection via JWT
    io.use((socket, next) => {
        const secret = jwtSecret || process.env.JWT_SECRET;
        if (!secret) {
            return next(new Error('Socket authentication is not configured'));
        }

        const authHeader = socket.handshake.headers?.authorization;
        const token =
            socket.handshake.auth?.token ||
            (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

        if (!token) {
            return next(new Error('Authentication required'));
        }

        try {
            const decoded = jwt.verify(token, secret);
            if (!decoded?.id) {
                return next(new Error('Invalid authentication token'));
            }
            socket.userId = decoded.id.toString();
            socket.userRole = decoded.role || 'user';
            return next();
        } catch (err) {
            return next(new Error('Invalid or expired token'));
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.userId;

        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, new Set());
        }
        onlineUsers.get(userId).add(socket.id);
        socket.join(`user:${userId}`);

        io.emit('onlineUsers', getOnlineUserIds());

        // Clients can only join their own personal room; prevent room hijacking
        socket.on('join', (requestedId) => {
            if (requestedId && requestedId.toString() !== userId) {
                socket.emit('socketError', { message: 'Unauthorized room join rejected' });
                return;
            }
            socket.join(`user:${userId}`);
        });

        // Relay messages verified by a backend-signed socketReceipt JWT
        socket.on('sendMessage', (payload, ack) => {
            const secret = jwtSecret || process.env.JWT_SECRET;
            try {
                const token = payload?.socketReceipt;
                if (!token) {
                    if (typeof ack === 'function') ack({ ok: false, error: 'Missing signed message receipt' });
                    return;
                }

                const verified = jwt.verify(token, secret);
                if (verified.sender !== userId) {
                    if (typeof ack === 'function') ack({ ok: false, error: 'Sender mismatch' });
                    return;
                }

                emitMessageToParticipants({
                    _id: verified._id,
                    conversationId: verified.conversationId,
                    sender: verified.sender,
                    receiverId: verified.receiverId,
                    content: verified.content,
                    createdAt: verified.createdAt,
                });

                if (typeof ack === 'function') ack({ ok: true });
            } catch (err) {
                if (typeof ack === 'function') ack({ ok: false, error: 'Invalid message receipt' });
            }
        });

        socket.on('disconnect', () => {
            const sockets = onlineUsers.get(userId);
            if (sockets) {
                sockets.delete(socket.id);
                if (sockets.size === 0) {
                    onlineUsers.delete(userId);
                }
            }
            io.emit('onlineUsers', getOnlineUserIds());
        });
    });

    app.get('/health', (req, res) => {
        res.status(200).json({
            success: true,
            status: 'ok',
            onlineCount: onlineUsers.size,
        });
    });

    // Authenticated backend-to-socket internal emission endpoint
    app.post('/internal/emit', (req, res) => {
        const secret = jwtSecret || process.env.JWT_SECRET;
        const internalToken = req.headers['x-internal-token'];
        if (!secret || !internalToken) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        try {
            const verified = jwt.verify(internalToken, secret);
            emitMessageToParticipants({
                _id: verified._id,
                conversationId: verified.conversationId,
                sender: verified.sender,
                receiverId: verified.receiverId,
                content: verified.content,
                createdAt: verified.createdAt,
            });
            return res.status(200).json({ success: true });
        } catch (err) {
            return res.status(401).json({ success: false, message: 'Invalid internal token' });
        }
    });

    return { app, server, io, onlineUsers };
};

if (require.main === module) {
    if (!process.env.JWT_SECRET) {
        console.error('FATAL: JWT_SECRET environment variable is missing.');
        process.exit(1);
    }
    const PORT = process.env.PORT || 8000;
    const { server } = createSocketServer(process.env.JWT_SECRET);
    server.listen(PORT, () => {
        console.log(`Socket.io server running on port ${PORT}`);
    });
}

module.exports = { createSocketServer };
