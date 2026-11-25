const ChatModel = require('../models/chatmodels');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/errorhander');
const { isValidObjectId } = require('../utils/validation');

// Create or return existing 1-on-1 chat (authenticated user must be a participant)
exports.crateChat = catchAsyncErrors(async (req, res, next) => {
    const senderId = req.user.id;
    const receiverId = req.body.receiverId;

    if (!isValidObjectId(receiverId)) {
        return next(new ErrorHandler('Invalid receiver ID', 400));
    }
    if (senderId === receiverId) {
        return next(new ErrorHandler('Cannot create a chat with yourself', 400));
    }

    let chat = await ChatModel.findOne({
        participants: { $all: [senderId, receiverId], $size: 2 },
    });

    if (!chat) {
        chat = await ChatModel.create({
            participants: [senderId, receiverId],
        });
    }

    res.status(200).json(chat);
});

// Get all chats of the authenticated user
exports.userChats = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.params;
    if (!isValidObjectId(userId)) {
        return next(new ErrorHandler('Invalid user ID', 400));
    }
    if (req.user.id !== userId) {
        return next(new ErrorHandler('Unauthorized access to user chats', 403));
    }

    const chats = await ChatModel.find({
        participants: { $in: [userId] },
    }).sort({ updatedAt: -1 });

    res.status(200).json(chats);
});

// Find chat between two users (authenticated user must be one of them)
exports.findChat = catchAsyncErrors(async (req, res, next) => {
    const { firstId, secondId } = req.params;
    if (!isValidObjectId(firstId) || !isValidObjectId(secondId)) {
        return next(new ErrorHandler('Invalid user IDs', 400));
    }
    if (req.user.id !== firstId && req.user.id !== secondId) {
        return next(new ErrorHandler('Unauthorized access to chat', 403));
    }

    const chat = await ChatModel.findOne({
        participants: { $all: [firstId, secondId] },
    });

    res.status(200).json(chat);
});
