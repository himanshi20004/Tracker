const mongoose= require('mongoose');
const resourceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    fileUrl: { type: String, required: true }, // This will store the URL of the PDF file
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Resource', resourceSchema);
