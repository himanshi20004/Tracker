const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');

const errorMiddleware = require('./middleware/error');
const { apiLimiter } = require('./middleware/rateLimiters');
const ErrorHandler = require('./utils/errorhander');

const app = express();

app.set('trust proxy', 1);

app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
);

const defaultOrigins = [
    'http://localhost:5173',
    'http://localhost:4173',
    'https://tracker-ksb7.vercel.app',
];

const VERCEL_PROJECT_ORIGIN_REGEX = /^https:\/\/tracker-ksb7(-[a-z0-9-]+)?\.vercel\.app$/;

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
    : defaultOrigins;

const isAllowedOrigin = (origin) =>
    !origin || allowedOrigins.includes(origin) || VERCEL_PROJECT_ORIGIN_REGEX.test(origin);

app.use(
    cors({
        origin: (origin, callback) => {
            if (isAllowedOrigin(origin)) {
                return callback(null, true);
            }
            return callback(new ErrorHandler('Not allowed by CORS', 403));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser());
app.use(mongoSanitize());

app.use('/api/v1', apiLimiter);

app.use(
    '/uploads',
    (req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        next();
    },
    express.static(path.join(__dirname, 'uploads'))
);

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});

// Routes
const task = require('./routes/taskRoutes');
const user = require('./routes/userRoutes');
const quiz = require('./routes/quizRoutes');
const chat = require('./routes/chatRoutes');
const messages = require('./routes/messageRoute');
const doubt = require('./routes/doubtRoutes');

app.use('/api/v1', task);
app.use('/api/v1', user);
app.use('/api/v1', quiz);
app.use('/api/v1', chat);
app.use('/api/v1', messages);
app.use('/api/v1', doubt);

app.use((req, res, next) => {
    next(new ErrorHandler(`Route not found: ${req.originalUrl}`, 404));
});

app.use(errorMiddleware);

module.exports = app;
