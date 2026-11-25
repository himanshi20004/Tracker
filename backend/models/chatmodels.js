const mongoose = require('mongoose');

const ChatSchema = mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'UserParth',
                required: true,
            },
        ],
    },
    {
        timestamps: true,
    }
);

ChatSchema.index({ participants: 1 });

module.exports = mongoose.model('Chat', ChatSchema);
