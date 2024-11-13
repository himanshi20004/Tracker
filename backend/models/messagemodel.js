const mongoose =require('mongoose');
const Conversation=require('./chatmodels')
const MessageSchema = mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    sender: { // Change this if you want senderId consistency
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
}, { timestamps: true });



module.exports = mongoose.model('Message', MessageSchema);