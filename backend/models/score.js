const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const scoreSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'UserParth',
        required: true,
    },
    quiz: {
        type: Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true,
    },
    score: {
        type: Number,
        required: true,
        min: 0,
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
});

scoreSchema.index({ user: 1, quiz: 1 }, { unique: true });

module.exports = mongoose.model('Score', scoreSchema);
