const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Resource title is required'],
        trim: true,
        maxlength: 200,
    },
    description: {
        type: String,
        required: [true, 'Resource description is required'],
        trim: true,
        maxlength: 2000,
    },
    fileUrl: {
        type: String,
        required: [true, 'File URL is required'],
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

resourceSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Resource', resourceSchema);
