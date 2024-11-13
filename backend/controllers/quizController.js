
const Quiz = require('../models/quizmodel');
const Score = require('../models/score');
const User=require('../models/usermodels')
// Create Quiz (Admin only)
exports.createQuiz = async (req, res) => {
    try {
      // Check if the user is an admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
      }
  
      const { title, questions, timer } = req.body;
  
      // Validate input
      if (!title || !questions || !timer) {
        return res.status(400).json({ message: 'Title, questions, and timer are required.' });
      }
  
      // Add unique ids for each question if not already present
      const questionsWithIds = questions.map((question, index) => ({
        id: question.id || index,  // Use the provided id or fallback to index
        ...question
      }));
  
      // Calculate total points
      const totalPoints = questionsWithIds.reduce((sum, q) => sum + q.points, 0);
  
      // Create a new quiz
      const newQuiz = new Quiz({
        title,
        questions: questionsWithIds,
        timer,
        totalPoints,
        createdBy: req.user._id,
      });
  
      await newQuiz.save();
  
      res.status(201).json({ message: 'Quiz created successfully!', quiz: newQuiz });
    } catch (error) {
      console.error('Error creating quiz:', error);
      res.status(500).json({ message: 'Failed to create quiz.', error });
    }
  };
  

// Get All Quizzes (User only)
exports.getAllQuizzes = async (req, res) => {
  try {
    // Check if the user is a regular user
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Access denied. Users only.' });
    }

    const quizzes = await Quiz.find();
    
    res.status(200).json({ quizzes });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ message: 'Failed to fetch quizzes.', error });
  }
};

// Get Single Quiz by ID (User only)
exports.getQuiz = async (req, res) => {
  try {
    // Check if the user is a regular user
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Access denied. Users only.' });
    }

    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found.' });
    }

    res.status(200).json({ quiz });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ message: 'Failed to fetch quiz.', error });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    // Check if the user is a regular user
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Access denied. Users only.' });
    }

    const { quizId, answers } = req.body;

    if (!quizId || !answers || answers.length === 0) {
      return res.status(400).json({ message: 'Quiz ID and answers are required.' });
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found.' });
    }

    // Initialize score variable
    let score = 0;

    // Iterate over the answers and calculate the score
    answers.forEach((userAnswer) => {
      // Find the question by its ID
      const question = quiz.questions.find((q) => q._id.toString() === userAnswer.questionId.toString());
      if (question && userAnswer.answer === question.correctAnswer) {
        score += question.points; // Add points if answer is correct
      }
    });

    // Save the score
    const newScore = new Score({
      user: req.user._id,
      quiz: quiz._id,
      score,
    });

    await newScore.save();
    // Update user points
    const user = await User.findById(req.user._id);
    user.points += score;  // Add the quiz score to user's points
    await user.save();


    res.status(200).json({ message: 'Quiz submitted successfully!', score });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ message: 'Failed to submit quiz.', error });
  }
};
