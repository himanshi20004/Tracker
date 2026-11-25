const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
    questionText: {
        type: String,
        required: true,
        trim: true,
    },
    options: {
        type: [String],
        required: true,
        validate: {
            validator: (arr) => Array.isArray(arr) && arr.length >= 2,
            message: 'Each question must have at least 2 options',
        },
    },
    correctAnswer: {
        type: Number,
        required: true,
        min: 0,
    },
    points: {
        type: Number,
        required: true,
        min: 0,
    },
});

const quizSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
    },
    questions: {
        type: [questionSchema],
        required: true,
        validate: {
            validator: (arr) => Array.isArray(arr) && arr.length >= 1,
            message: 'Quiz must have at least one question',
        },
    },
    timer: {
        type: Number,
        required: true,
        min: [10, 'Timer must be at least 10 seconds'],
    },
    totalPoints: {
        type: Number,
        required: true,
        min: 0,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'UserParth',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    deadline: {
        type: Date,
        required: true,
    },
    attemptedUsers: [
        {
            type: Schema.Types.ObjectId,
            ref: 'UserParth',
        },
    ],
});

quizSchema.index({ createdAt: -1 });
quizSchema.index({ deadline: 1 });

module.exports = mongoose.model('Quiz', quizSchema);
