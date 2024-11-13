
const mongoose = require('mongoose');

const completedTaskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true,
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task', // Reference to the Task model
        required: true,
    },
    completedAt: {
        type: Date,
        default: Date.now, 
    },
    pointsEarned: {
        type: Number,
        default: 0, 
    },
    status: {
        type: String,
        enum: ['completed', 'verified'],
        default: 'completed', 
    }
});

module.exports = mongoose.model('CompletedTask', completedTaskSchema);
