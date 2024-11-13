
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the question schema
const questionSchema = new Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: {
    type: [String], // Array of options as strings
    required: true,
  },
  correctAnswer: {
    type: Number, // Index of the correct answer in the options array
    required: true,
  },
  points: {
    type: Number,
    required: true,
  },
});

// Define the quiz schema
const quizSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  questions: {
    type: [questionSchema], // Array of question objects
    required: true,
  },
  timer: {
    type: Number, // Total time in seconds
    required: true,
  },
  totalPoints: {
    type: Number,
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Export the model
module.exports = mongoose.model('Quiz', quizSchema);
