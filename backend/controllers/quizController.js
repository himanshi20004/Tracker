const Quiz = require('../models/quizmodel');
const Score = require('../models/score');
const User = require('../models/usermodels');

// Create Quiz (Admin only)
exports.createQuiz = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const { title, questions, timer, deadline } = req.body;

        if (!title || !questions || !timer || !deadline) {
            return res.status(400).json({ message: 'Title, questions, timer, and deadline are required.' });
        }

        const questionsWithIds = questions.map((question, index) => ({
            id: question.id || index,
            ...question
        }));

        const totalPoints = questionsWithIds.reduce((sum, q) => sum + q.points, 0);

        const newQuiz = new Quiz({
            title,
            questions: questionsWithIds,
            timer,
            totalPoints,
            deadline,
            createdBy: req.user._id,
        });

        await newQuiz.save();
        res.status(201).json({ message: 'Quiz created successfully!', quiz: newQuiz });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create quiz.', error });
    }
};

// Get All Quizzes (User only)
exports.getAllQuizzes = async (req, res) => {
    try {
        if (req.user.role !== 'user') {
            return res.status(403).json({ message: 'Access denied. Users only.' });
        }
        const quizzes = await Quiz.find();
        res.status(200).json({ quizzes });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch quizzes.', error });
    }
};

// Get Single Quiz by ID (User only) - THIS WAS LIKELY MISSING
exports.getQuiz = async (req, res) => {
    try {
        if (req.user.role !== 'user') {
            return res.status(403).json({ message: 'Access denied. Users only.' });
        }
        const { quizId } = req.params;
        const quiz = await Quiz.findById(quizId);

        if (!quiz) return res.status(404).json({ message: 'Quiz not found.' });

        res.status(200).json({ quiz });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch quiz.', error });
    }
};

// Submit Quiz with Deadline and "Once Only" checks
exports.submitQuiz = async (req, res) => {
    try {
        if (req.user.role !== 'user') {
            return res.status(403).json({ message: 'Access denied. Users only.' });
        }

        const { quizId, answers } = req.body;
        const quiz = await Quiz.findById(quizId);

        if (!quiz) return res.status(404).json({ message: 'Quiz not found.' });

        // Check deadline
        if (new Date() > new Date(quiz.deadline)) {
            return res.status(400).json({ message: 'The deadline for this quiz has passed.' });
        }

        // Check if already attempted
        if (quiz.attemptedUsers.includes(req.user._id)) {
            return res.status(400).json({ message: 'You have already submitted this quiz.' });
        }

        let score = 0;
        answers.forEach((userAnswer) => {
            const question = quiz.questions.find((q) => q._id.toString() === userAnswer.questionId.toString());
            if (question && userAnswer.answer === question.correctAnswer) {
                score += question.points;
            }
        });

        // Save result
        const newScore = new Score({ user: req.user._id, quiz: quiz._id, score });
        await newScore.save();

        // Mark as attempted and update points
        quiz.attemptedUsers.push(req.user._id);
        await quiz.save();

        const user = await User.findById(req.user._id);
        user.points += score;
        await user.save();

        res.status(200).json({ message: 'Quiz submitted successfully!', score });
    } catch (error) {
        res.status(500).json({ message: 'Failed to submit quiz.', error });
    }
};