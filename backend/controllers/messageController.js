const jwt = require('jsonwebtoken');
const Message = require('../models/messagemodel');
const Conversation = require('../models/chatmodels');
const User = require('../models/usermodels');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/errorhander');
const { isValidObjectId, sanitizeText } = require('../utils/validation');

const notifySocketServer = async (payload, socketReceipt) => {
    const socketUrl = process.env.SOCKET_URL;
    if (!socketUrl) return;

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        await fetch(`${socketUrl.replace(/\/$/, '')}/internal/emit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-internal-token': socketReceipt,
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });
        clearTimeout(timeout);
    } catch (err) {
        // Non-fatal: client also receives socketReceipt to relay through connected socket
        console.warn('Socket webhook notification skipped:', err.message);
    }
};

exports.addMessage = catchAsyncErrors(async (req, res, next) => {
    const { receiverId } = req.params;
    const senderId = req.user._id;
    const content = sanitizeText(req.body.content, 2000);

    if (!isValidObjectId(receiverId)) {
        return next(new ErrorHandler('Invalid receiver ID', 400));
    }
    if (senderId.toString() === receiverId) {
        return next(new ErrorHandler('Cannot send a message to yourself', 400));
    }
    if (!content) {
        return next(new ErrorHandler('Message content cannot be empty', 400));
    }

    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
        return next(new ErrorHandler('Recipient user not found', 404));
    }

    let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
        conversation = await Conversation.create({
            participants: [senderId, receiverId],
        });
    }

    const newMessage = await Message.create({
        conversationId: conversation._id,
        sender: senderId,
        content,
    });

    const messagePayload = {
        _id: newMessage._id.toString(),
        conversationId: conversation._id.toString(),
        sender: senderId.toString(),
        receiverId: receiverId.toString(),
        content: newMessage.content,
        createdAt: newMessage.createdAt,
    };

    const socketReceipt = process.env.JWT_SECRET
        ? jwt.sign(messagePayload, process.env.JWT_SECRET, { expiresIn: '2m' })
        : null;

    if (socketReceipt) {
        notifySocketServer(messagePayload, socketReceipt);
    }

    res.status(201).json({
        ...newMessage.toObject(),
        receiverId: receiverId.toString(),
        socketReceipt,
    });
});

exports.getMessage = catchAsyncErrors(async (req, res, next) => {
    const { receiverId } = req.params;
    const senderId = req.user._id;

    if (!isValidObjectId(receiverId)) {
        return next(new ErrorHandler('Invalid receiver ID', 400));
    }

    const conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
        return res.status(200).json([]);
    }

    const messages = await Message.find({ conversationId: conversation._id })
        .sort({ createdAt: 1 });

    return res.status(200).json(messages);
});
