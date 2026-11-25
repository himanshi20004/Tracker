const Task = require('../models/taskmodels');
const User = require('../models/usermodels');
const CompletedTask = require('../models/completedtask');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/errorhander');
const { toSafeUser } = require('../utils/jwtToken');
const { isValidObjectId, sanitizeText } = require('../utils/validation');

// Create a new task (Admin only)
exports.createTask = catchAsyncErrors(async (req, res, next) => {
    const cleanTitle = sanitizeText(req.body.title, 150);
    const cleanDescription = sanitizeText(req.body.description, 2000);
    const points = Number(req.body.points);
    const deadlineDate = new Date(req.body.deadline);

    if (!cleanTitle || !cleanDescription) {
        return next(new ErrorHandler('Title and description are required', 400));
    }
    if (!Number.isFinite(points) || points < 0 || points > 10000) {
        return next(new ErrorHandler('Points must be a valid number between 0 and 10000', 400));
    }
    if (Number.isNaN(deadlineDate.getTime())) {
        return next(new ErrorHandler('Please provide a valid deadline date', 400));
    }

    const task = await Task.create({
        title: cleanTitle,
        description: cleanDescription,
        points,
        deadline: deadlineDate,
        createdBy: req.user.id,
    });

    res.status(201).json({
        success: true,
        task,
    });
});

// Complete a task and atomically award points on the server
exports.completeTask = catchAsyncErrors(async (req, res, next) => {
    const { taskId } = req.body;
    const userId = req.user.id;

    if (!isValidObjectId(taskId)) {
        return next(new ErrorHandler('Invalid task ID', 400));
    }

    const task = await Task.findById(taskId);
    if (!task) {
        return next(new ErrorHandler('Task not found', 404));
    }

    if (new Date() > new Date(task.deadline)) {
        return next(new ErrorHandler('Task deadline has ended', 400));
    }

    // Atomic conditional update prevents concurrent/duplicate point awards
    const updatedUser = await User.findOneAndUpdate(
        { _id: userId, completedTasks: { $ne: task._id } },
        {
            $addToSet: { completedTasks: task._id },
            $inc: { points: task.points },
        },
        { new: true }
    ).populate({
        path: 'completedTasks',
        select: 'title points deadline',
    });

    if (!updatedUser) {
        const userExists = await User.exists({ _id: userId });
        if (!userExists) {
            return next(new ErrorHandler('User not found', 404));
        }
        return next(new ErrorHandler('Task already completed', 400));
    }

    await CompletedTask.updateOne(
        { user: userId, task: task._id },
        {
            $setOnInsert: {
                user: userId,
                task: task._id,
                pointsEarned: task.points,
                status: 'completed',
            },
        },
        { upsert: true }
    );

    res.status(200).json({
        success: true,
        message: 'Task completed successfully',
        pointsEarned: task.points,
        user: toSafeUser(updatedUser),
    });
});

// Get details for completed tasks
exports.getCompletedTaskDetails = catchAsyncErrors(async (req, res, next) => {
    const { taskIds } = req.body;

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
        return next(new ErrorHandler('No task IDs provided', 400));
    }

    const validIds = taskIds.filter((id) => isValidObjectId(id));
    if (validIds.length === 0) {
        return next(new ErrorHandler('No valid task IDs provided', 400));
    }

    const tasks = await Task.find({ _id: { $in: validIds } });

    res.status(200).json({
        success: true,
        tasks,
    });
});

// Get all tasks (sorted newest first, optional pagination)
exports.getAllTasks = catchAsyncErrors(async (req, res, next) => {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 200);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const skip = (page - 1) * limit;

    const tasks = await Task.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        success: true,
        tasks,
    });
});

// Get a single task by ID
exports.getSingleTask = catchAsyncErrors(async (req, res, next) => {
    if (!isValidObjectId(req.params.id)) {
        return next(new ErrorHandler('Invalid task ID', 400));
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
        return next(new ErrorHandler(`Task not found with id ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        task,
    });
});

// Update a task (Admin only, whitelisted fields)
exports.updateTask = catchAsyncErrors(async (req, res, next) => {
    if (!isValidObjectId(req.params.id)) {
        return next(new ErrorHandler('Invalid task ID', 400));
    }

    const updates = {};
    if (req.body.title !== undefined) {
        const cleanTitle = sanitizeText(req.body.title, 150);
        if (!cleanTitle) return next(new ErrorHandler('Title cannot be empty', 400));
        updates.title = cleanTitle;
    }
    if (req.body.description !== undefined) {
        const cleanDescription = sanitizeText(req.body.description, 2000);
        if (!cleanDescription) return next(new ErrorHandler('Description cannot be empty', 400));
        updates.description = cleanDescription;
    }
    if (req.body.points !== undefined) {
        const points = Number(req.body.points);
        if (!Number.isFinite(points) || points < 0 || points > 10000) {
            return next(new ErrorHandler('Points must be between 0 and 10000', 400));
        }
        updates.points = points;
    }
    if (req.body.deadline !== undefined) {
        const deadlineDate = new Date(req.body.deadline);
        if (Number.isNaN(deadlineDate.getTime())) {
            return next(new ErrorHandler('Invalid deadline date', 400));
        }
        updates.deadline = deadlineDate;
    }
    if (req.body.status !== undefined) {
        if (!['pending', 'completed', 'expired'].includes(req.body.status)) {
            return next(new ErrorHandler('Invalid task status', 400));
        }
        updates.status = req.body.status;
    }

    const task = await Task.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
    });

    if (!task) {
        return next(new ErrorHandler(`Task not found with id ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        task,
    });
});

// Delete a task (Admin only)
exports.deleteTask = catchAsyncErrors(async (req, res, next) => {
    const taskId = req.params.id;
    if (!isValidObjectId(taskId)) {
        return next(new ErrorHandler('Invalid task ID', 400));
    }

    const task = await Task.findByIdAndDelete(taskId);
    if (!task) {
        return next(new ErrorHandler(`Task not found with id ${taskId}`, 404));
    }

    res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
    });
});
