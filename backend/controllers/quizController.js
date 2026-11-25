const Quiz = require('../models/quizmodel');
const Score = require('../models/score');
const User = require('../models/usermodels');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/errorhander');
const { isValidObjectId, sanitizeText } = require('../utils/validation');

// Create Quiz (Admin only)
exports.createQuiz = catchAsyncErrors(async (req, res, next) => {
    const { title, questions, timer, deadline } = req.body;

    const cleanTitle = sanitizeText(title, 200);
    const parsedTimer = Number(timer);
    const deadlineDate = new Date(deadline);

    if (!cleanTitle || !Array.isArray(questions) || questions.length === 0) {
        return next(new ErrorHandler('Title and at least one question are required.', 400));
    }
    if (!Number.isFinite(parsedTimer) || parsedTimer < 10) {
        return next(new ErrorHandler('Timer must be at least 10 seconds.', 400));
    }
    if (Number.isNaN(deadlineDate.getTime())) {
        return next(new ErrorHandler('Valid deadline is required.', 400));
    }

    const normalizedQuestions = [];
    for (let i = 0; i < questions.length; i += 1) {
        const q = questions[i];
        const questionText = sanitizeText(q?.questionText, 1000);
        const options = Array.isArray(q?.options)
            ? q.options.map((o) => sanitizeText(o, 500)).filter(Boolean)
            : [];
        const correctAnswer = Number(q?.correctAnswer);
        const points = Number(q?.points);

        if (!questionText || options.length < 2) {
            return next(new ErrorHandler(`Question ${i + 1} must have text and at least 2 non-empty options.`, 400));
        }
        if (!Number.isInteger(correctAnswer) || correctAnswer < 0 || correctAnswer >= options.length) {
            return next(new ErrorHandler(`Question ${i + 1} has an invalid correctAnswer index.`, 400));
        }
        if (!Number.isFinite(points) || points < 0 || points > 1000) {
            return next(new ErrorHandler(`Question ${i + 1} must have valid non-negative points.`, 400));
        }

        normalizedQuestions.push({
            questionText,
            options,
            correctAnswer,
            points,
        });
    }

    const totalPoints = normalizedQuestions.reduce((sum, q) => sum + q.points, 0);

    const newQuiz = await Quiz.create({
        title: cleanTitle,
        questions: normalizedQuestions,
        timer: parsedTimer,
        totalPoints,
        deadline: deadlineDate,
        createdBy: req.user._id,
    });

    res.status(201).json({
        success: true,
        message: 'Quiz created successfully!',
        quiz: newQuiz,
    });
});

// Get All Quizzes (students never receive correctAnswer)
exports.getAllQuizzes = catchAsyncErrors(async (req, res, next) => {
    const query = Quiz.find().sort({ createdAt: -1 });
    if (req.user.role !== 'admin') {
        query.select('-questions.correctAnswer');
    }
    const quizzes = await query;

    res.status(200).json({
        success: true,
        quizzes,
    });
});

// Get Single Quiz by ID (students never receive correctAnswer)
exports.getQuiz = catchAsyncErrors(async (req, res, next) => {
    const { quizId } = req.params;
    if (!isValidObjectId(quizId)) {
        return next(new ErrorHandler('Invalid quiz ID.', 400));
    }

    const query = Quiz.findById(quizId);
    if (req.user.role !== 'admin') {
        query.select('-questions.correctAnswer');
    }
    const quiz = await query;

    if (!quiz) {
        return next(new ErrorHandler('Quiz not found.', 404));
    }

    res.status(200).json({
        success: true,
        quiz,
    });
});

// Submit Quiz (Atomic concurrency protection + server-side scoring + deduplicated answers)
exports.submitQuiz = catchAsyncErrors(async (req, res, next) => {
    if (req.user.role !== 'user') {
        return next(new ErrorHandler('Access denied. Students only.', 403));
    }

    const paramQuizId = req.params.quizId;
    const bodyQuizId = req.body.quizId;
    const quizId = paramQuizId || bodyQuizId;

    if (!isValidObjectId(quizId)) {
        return next(new ErrorHandler('Invalid quiz ID.', 400));
    }
    if (paramQuizId && bodyQuizId && paramQuizId !== bodyQuizId) {
        return next(new ErrorHandler('Mismatched quiz ID in request.', 400));
    }

    const { answers } = req.body;
    if (!Array.isArray(answers)) {
        return next(new ErrorHandler('Answers must be provided as an array.', 400));
    }

    // Deduplicate answers by questionId so a single question cannot be scored multiple times
    const answerMap = new Map();
    for (const item of answers) {
        if (item && item.questionId && Number.isInteger(item.answer)) {
            const qId = item.questionId.toString();
            if (!answerMap.has(qId)) {
                answerMap.set(qId, item.answer);
            }
        }
    }

    // Atomically claim the attempt only if deadline hasn't passed and user hasn't attempted yet
    const claimedQuiz = await Quiz.findOneAndUpdate(
        {
            _id: quizId,
            deadline: { $gte: new Date() },
            attemptedUsers: { $ne: req.user._id },
        },
        {
            $addToSet: { attemptedUsers: req.user._id },
        },
        { new: true }
    );

    if (!claimedQuiz) {
        const existingQuiz = await Quiz.findById(quizId).select('deadline attemptedUsers');
        if (!existingQuiz) {
            return next(new ErrorHandler('Quiz not found.', 404));
        }
        if (existingQuiz.attemptedUsers.some((id) => id.toString() === req.user._id.toString())) {
            return next(new ErrorHandler('You have already submitted this quiz.', 400));
        }
        if (new Date() > new Date(existingQuiz.deadline)) {
            return next(new ErrorHandler('The deadline for this quiz has passed.', 400));
        }
        return next(new ErrorHandler('Unable to submit quiz.', 400));
    }

    let score = 0;
    for (const question of claimedQuiz.questions) {
        const submittedAnswer = answerMap.get(question._id.toString());
        if (submittedAnswer !== undefined && submittedAnswer === question.correctAnswer) {
            score += question.points;
        }
    }

    try {
        await Score.create({
            user: req.user._id,
            quiz: claimedQuiz._id,
            score,
        });

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $inc: { points: score } },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Quiz submitted successfully!',
            score,
            totalPoints: claimedQuiz.totalPoints,
            totalUserPoints: updatedUser ? updatedUser.points : undefined,
        });
    } catch (error) {
        // Compensating rollback if score persistence or points update failed
        await Quiz.updateOne(
            { _id: claimedQuiz._id },
            { $pull: { attemptedUsers: req.user._id } }
        );
        await Score.deleteOne({ user: req.user._id, quiz: claimedQuiz._id });
        throw error;
    }
});
