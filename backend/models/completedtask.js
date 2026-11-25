const mongoose = require('mongoose');

const completedTaskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserParth',
        required: true,
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true,
    },
    completedAt: {
        type: Date,
        default: Date.now,
    },
    pointsEarned: {
        type: Number,
        default: 0,
        min: 0,
    },
    status: {
        type: String,
        enum: ['completed', 'verified'],
        default: 'completed',
    },
});

completedTaskSchema.index({ user: 1, task: 1 }, { unique: true });

module.exports = mongoose.model('CompletedTask', completedTaskSchema);
