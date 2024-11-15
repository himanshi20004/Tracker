const Task = require('../models/taskmodels');
const User = require('../models/usermodels');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/errorhander');
const mongoose = require('mongoose')

// Create a new task
exports.createTask = catchAsyncErrors(async (req, res, next) => {
    const { title, description, points,deadline } = req.body;

    const task = await Task.create({
        title,
        description,
        points,
        deadline,
        assignedTo: req.user.id, // task assigned to user
    });

    res.status(201).json({
        success: true,
        task,
    });
    
});

// Complete a task and update user's points
exports.completeTask = catchAsyncErrors(async (req, res, next) => {
    const { taskId } = req.body; // Get task ID from request body
    const userId = req.user.id; // Get user ID from authenticated user

    // Find the task by ID
    const task = await Task.findById(taskId);
    if (!task) {
        return next(new ErrorHandler("Task not found", 404));
    }

    // Check if the deadline has passed
    const currentDate = new Date();
    if (currentDate > new Date(task.deadline)) {
        return next(new ErrorHandler("Task deadline has ended", 400));
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    // Check if the task is already in the completedTasks to avoid duplication
    if (user.completedTasks.includes(taskId)) {
        return next(new ErrorHandler("Task already completed", 400));
    }

    // Update user points and add task to completedTasks
    user.points += task.points;
    user.completedTasks.push(taskId);
    await user.save();

    // Populate completed tasks to include task details for the response
    const populatedUser = await User.findById(userId).populate({
        path: 'completedTasks', // Assuming completedTasks is a reference field
        select: 'title points deadline' // Select fields to return
    });

    res.status(200).json({
        success: true,
        message: "Task completed successfully",
        user: populatedUser,
    });
});



exports.getCompletedTaskDetails = catchAsyncErrors(async (req, res, next) => {
    const { taskIds } = req.body; // Array of task IDs passed from the client

    if (!taskIds || taskIds.length === 0) {
        return next(new ErrorHandler("No task IDs provided", 400));
    }

    // Find tasks with the provided IDs
    const tasks = await Task.find({ _id: { $in: taskIds } });

    if (!tasks || tasks.length === 0) {
        return next(new ErrorHandler("No tasks found with the provided IDs", 404));
    }

    res.status(200).json({
        success: true,
        tasks,
    });
});



// Get all tasks
exports.getAllTasks = catchAsyncErrors(async (req, res, next) => {
    const tasks = await Task.find();
    res.status(200).json({
        success: true,
        tasks,
    });
});

// Get a single task by ID
exports.getSingleTask = catchAsyncErrors(async (req, res, next) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        return next(new ErrorHandler(`Task not found with id ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        task,
    });
});

// Update a task
exports.updateTask = catchAsyncErrors(async (req, res, next) => {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
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

// Delete a task
exports.deleteTask = catchAsyncErrors(async (req, res, next) => {
    const taskId = req.params.id;

    // Check if the task ID is valid
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return next(new ErrorHandler("Invalid task ID", 400));
    }

    // Try to find and delete the task
    const task = await Task.findByIdAndDelete(taskId);

    // Check if the task was found
    if (!task) {
        return next(new ErrorHandler(`Task not found with id ${taskId}`, 404));
    }

    res.status(200).json({
        success: true,
        message: "Task deleted successfully",
    });
});
