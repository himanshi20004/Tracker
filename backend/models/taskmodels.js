const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
        maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
        type: String,
        required: [true, 'Task description is required'],
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    points: {
        type: Number,
        required: [true, 'Points are required'],
        min: [0, 'Points cannot be negative'],
        max: [10000, 'Points cannot exceed 10000'],
    },
    deadline: {
        type: Date,
        required: [true, 'Deadline is required'],
    },
    assignedToGroups: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group',
        },
    ],
    status: {
        type: String,
        enum: ['pending', 'completed', 'expired'],
        default: 'pending',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserParth',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

TaskSchema.index({ deadline: 1 });
TaskSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Task', TaskSchema);
