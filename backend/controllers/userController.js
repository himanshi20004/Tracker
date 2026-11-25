const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const ErrorHander = require('../utils/errorhander');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const User = require('../models/usermodels');
const sendToken = require('../utils/jwtToken');
const { toSafeUser } = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const Resource = require('../models/resource');
const {
    isValidObjectId,
    isValidDateKey,
    validatePasswordStrength,
    validateEmailAddress,
    sanitizeText,
} = require('../utils/validation');

// Register a student user (public admin registration is strictly disabled)
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    const { username, email, password, role } = req.body;

    if (role !== undefined && role !== 'user') {
        return next(new ErrorHander('Public admin registration is not allowed', 403));
    }

    const cleanUsername = sanitizeText(username, 50);
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!cleanUsername || cleanUsername.length < 2) {
        return next(new ErrorHander('Username must be at least 2 characters', 400));
    }
    if (!validateEmailAddress(cleanEmail)) {
        return next(new ErrorHander('Please provide a valid email address', 400));
    }

    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
        return next(new ErrorHander(passwordError, 400));
    }

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
        return next(new ErrorHander('An account with this email already exists', 409));
    }

    const user = await User.create({
        username: cleanUsername,
        email: cleanEmail,
        password,
        role: 'user',
    });

    res.status(201).json({
        success: true,
        user: {
            id: user._id,
            _id: user._id,
            username: user.username,
            role: user.role,
        },
        message: 'Registration successful!',
    });
});

// Login user
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
        return next(new ErrorHander('Please provide email and password', 400));
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user) {
        return next(new ErrorHander('Invalid email or password', 401));
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHander('Invalid email or password', 401));
    }

    const token = user.getJWTToken();
    const cookieExpireDays = Number(process.env.COOKIE_EXPIRE) || 5;
    const isProduction = process.env.NODE_ENV === 'production';

    res.status(200)
        .cookie('token', token, {
            expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
            httpOnly: true,
            sameSite: isProduction ? 'none' : 'lax',
            secure: isProduction,
        })
        .json({
            success: true,
            user: {
                id: user._id,
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                points: user.points,
            },
            token,
        });
});

// Leaderboard based on points (paginated)
exports.getLeaderboard = catchAsyncErrors(async (req, res, next) => {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const skip = (page - 1) * limit;

    const users = await User.find({ role: 'user' })
        .sort({ points: -1, createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .select('username points');

    res.status(200).json({
        success: true,
        leaderboard: users,
    });
});

// Update user (restricted — never accepts points, completedTasks, role, or password)
exports.updateUser = catchAsyncErrors(async (req, res, next) => {
    const forbiddenFields = ['points', 'completedTasks', 'role', 'password', 'resetPasswordToken', 'resetPasswordExpire'];
    const attemptedForbidden = forbiddenFields.some((field) => req.body[field] !== undefined);

    if (attemptedForbidden) {
        return next(new ErrorHander('Direct modification of points, completed tasks, or role is forbidden', 403));
    }

    const updates = {};
    if (req.body.username !== undefined) {
        const cleanUsername = sanitizeText(req.body.username, 50);
        if (cleanUsername.length < 2) {
            return next(new ErrorHander('Username must be at least 2 characters', 400));
        }
        updates.username = cleanUsername;
    }

    if (Object.keys(updates).length === 0) {
        return next(new ErrorHander('No valid fields provided for update', 400));
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
        new: true,
        runValidators: true,
    });

    if (!user) {
        return next(new ErrorHander('User not found', 404));
    }

    res.status(200).json({
        success: true,
        user: toSafeUser(user),
    });
});

// Logout user
exports.logout = catchAsyncErrors(async (req, res, next) => {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', '', {
        expires: new Date(0),
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
        secure: isProduction,
    });

    res.status(200).json({
        success: true,
        message: 'Logged Out',
    });
});

// Forgot password
exports.forgetPassword = catchAsyncErrors(async (req, res, next) => {
    const cleanEmail = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!validateEmailAddress(cleanEmail)) {
        return next(new ErrorHander('Please provide a valid email address', 400));
    }

    const user = await User.findOne({ email: cleanEmail });

    // Prevent account enumeration while preserving valid flow
    if (!user) {
        return res.status(200).json({
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent.',
        });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const frontendUrl = process.env.FRONTEND_URL || req.get('origin') || `${req.protocol}://${req.get('host')}`;
    const resetPasswordUrl = `${frontendUrl.replace(/\/$/, '')}/reset-password/${resetToken}`;
    const message = `You requested a password reset for your StudyWave account.\n\nReset your password here (valid for 15 minutes):\n${resetPasswordUrl}\n\nIf you did not request this, please ignore this email.`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'StudyWave Password Recovery',
            message,
        });

        res.status(200).json({
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent.',
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new ErrorHander('Unable to send password reset email at this time. Please try again later.', 500));
    }
});

// Reset password (atomic token consumption to prevent reuse)
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    const rawToken = req.params.token;
    if (!rawToken || typeof rawToken !== 'string') {
        return next(new ErrorHander('Invalid reset token', 400));
    }

    const { password, confirmPassword } = req.body;
    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
        return next(new ErrorHander(passwordError, 400));
    }
    if (password !== confirmPassword) {
        return next(new ErrorHander('Password does not match confirm password', 400));
    }

    const resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.findOneAndUpdate(
        {
            resetPasswordToken,
            resetPasswordExpire: { $gt: new Date() },
        },
        {
            $set: {
                password: hashedPassword,
                passwordChangedAt: new Date(),
            },
            $unset: {
                resetPasswordToken: 1,
                resetPasswordExpire: 1,
            },
        },
        { new: true }
    );

    if (!user) {
        return next(new ErrorHander('Reset password token is invalid or has expired', 400));
    }

    sendToken(user, 200, res);
});

// Get logged-in user details
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return next(new ErrorHander('User not found', 404));
    }

    res.status(200).json({
        success: true,
        user: toSafeUser(user),
    });
});

// Update user password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || typeof oldPassword !== 'string') {
        return next(new ErrorHander('Old password is required', 400));
    }

    const passwordError = validatePasswordStrength(newPassword);
    if (passwordError) {
        return next(new ErrorHander(passwordError, 400));
    }

    if (newPassword !== confirmPassword) {
        return next(new ErrorHander('New password and confirm password do not match', 400));
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
        return next(new ErrorHander('User not found', 404));
    }

    const isPasswordMatched = await user.comparePassword(oldPassword);
    if (!isPasswordMatched) {
        return next(new ErrorHander('Old password is incorrect', 400));
    }

    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    sendToken(user, 200, res);
});

// Update user profile (safe fields only: username, email)
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    const incomingUsername = req.body.username !== undefined ? req.body.username : req.body.name;
    const updates = {};

    if (incomingUsername !== undefined) {
        const cleanUsername = sanitizeText(incomingUsername, 50);
        if (cleanUsername.length < 2) {
            return next(new ErrorHander('Username must be at least 2 characters', 400));
        }
        updates.username = cleanUsername;
    }

    if (req.body.email !== undefined) {
        const cleanEmail = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
        if (!validateEmailAddress(cleanEmail)) {
            return next(new ErrorHander('Please provide a valid email address', 400));
        }
        const duplicate = await User.findOne({ email: cleanEmail, _id: { $ne: req.user.id } });
        if (duplicate) {
            return next(new ErrorHander('Email is already in use by another account', 409));
        }
        updates.email = cleanEmail;
    }

    if (Object.keys(updates).length === 0) {
        return next(new ErrorHander('No valid profile fields provided', 400));
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        user: toSafeUser(user),
    });
});

// Admin: Get all users (paginated, sanitized)
exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 200);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const skip = (page - 1) * limit;

    const [users, totalUsers] = await Promise.all([
        User.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('username email role points completedTasks createdAt'),
        User.countDocuments(),
    ]);

    res.status(200).json({
        success: true,
        users: users.map(toSafeUser),
        totalUsers,
        page,
        limit,
    });
});

// Admin: Get single user
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
    if (!isValidObjectId(req.params.id)) {
        return next(new ErrorHander('Invalid user ID', 400));
    }

    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new ErrorHander(`User does not exist with id ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        user: toSafeUser(user),
    });
});

// Admin: Update user role/profile
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
    if (!isValidObjectId(req.params.id)) {
        return next(new ErrorHander('Invalid user ID', 400));
    }

    const updates = {};
    const incomingUsername = req.body.username !== undefined ? req.body.username : req.body.name;
    if (incomingUsername !== undefined) {
        const cleanUsername = sanitizeText(incomingUsername, 50);
        if (cleanUsername.length < 2) {
            return next(new ErrorHander('Username must be at least 2 characters', 400));
        }
        updates.username = cleanUsername;
    }

    if (req.body.email !== undefined) {
        const cleanEmail = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
        if (!validateEmailAddress(cleanEmail)) {
            return next(new ErrorHander('Please provide a valid email address', 400));
        }
        updates.email = cleanEmail;
    }

    if (req.body.role !== undefined) {
        if (!['user', 'admin'].includes(req.body.role)) {
            return next(new ErrorHander('Role must be either user or admin', 400));
        }
        updates.role = req.body.role;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
    });

    if (!user) {
        return next(new ErrorHander(`User does not exist with id ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        user: toSafeUser(user),
    });
});

// Get timetable (owner only)
exports.getTimetable = catchAsyncErrors(async (req, res, next) => {
    if (!isValidObjectId(req.params.userId)) {
        return next(new ErrorHander('Invalid user ID', 400));
    }

    if (req.user.id !== req.params.userId) {
        return next(new ErrorHander('Unauthorized access to timetable', 403));
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
        return next(new ErrorHander('User not found', 404));
    }

    res.status(200).json(user.timetable || {});
});

// Save timetable event (owner only)
exports.saveTimetable = catchAsyncErrors(async (req, res, next) => {
    if (!isValidObjectId(req.params.userId)) {
        return next(new ErrorHander('Invalid user ID', 400));
    }

    if (req.user.id !== req.params.userId) {
        return next(new ErrorHander('Unauthorized access to timetable', 403));
    }

    const { date, detail } = req.body;
    if (!isValidDateKey(date)) {
        return next(new ErrorHander('Invalid date format. Expected YYYY-MM-DD', 400));
    }

    const cleanDetail = sanitizeText(detail, 300);
    if (!cleanDetail) {
        return next(new ErrorHander('Event detail is required', 400));
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
        return next(new ErrorHander('User not found', 404));
    }

    if (!user.timetable) {
        user.timetable = new Map();
    }

    const existingEvents = user.timetable.get(date) || [];
    existingEvents.push(cleanDetail);
    user.timetable.set(date, existingEvents);
    user.markModified('timetable');

    await user.save();
    res.status(200).json({
        success: true,
        message: 'Timetable saved successfully',
        timetable: user.timetable,
    });
});

// Delete timetable event (owner only)
exports.deleteEvent = catchAsyncErrors(async (req, res, next) => {
    const userId = req.params.userId;
    const rawEventId = req.params.eventId !== undefined ? req.params.eventId : req.params.eventID;
    const { date } = req.query;

    if (!isValidObjectId(userId)) {
        return next(new ErrorHander('Invalid user ID', 400));
    }

    if (req.user.id !== userId) {
        return next(new ErrorHander('Unauthorized access to timetable', 403));
    }

    if (!isValidDateKey(date)) {
        return next(new ErrorHander('Invalid date query parameter. Expected YYYY-MM-DD', 400));
    }

    if (typeof rawEventId !== 'string' || !/^\d+$/.test(rawEventId)) {
        return next(new ErrorHander('Invalid event index', 400));
    }
    const eventIndex = Number(rawEventId);

    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHander('User not found', 404));
    }

    if (!user.timetable || !user.timetable.has(date)) {
        return next(new ErrorHander('Date not found in timetable', 404));
    }

    const events = user.timetable.get(date);
    if (eventIndex < 0 || eventIndex >= events.length) {
        return next(new ErrorHander('Event index out of bounds', 404));
    }

    events.splice(eventIndex, 1);
    if (events.length === 0) {
        user.timetable.delete(date);
    } else {
        user.timetable.set(date, events);
    }

    user.markModified('timetable');
    await user.save();

    res.status(200).json({
        success: true,
        timetable: user.timetable,
    });
});

// Edit timetable event (owner only)
exports.editEvent = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.params;
    const { date, index, detail } = req.body;

    if (!isValidObjectId(userId)) {
        return next(new ErrorHander('Invalid user ID', 400));
    }

    if (req.user.id !== userId) {
        return next(new ErrorHander('Unauthorized access to timetable', 403));
    }

    if (!isValidDateKey(date)) {
        return next(new ErrorHander('Invalid date format. Expected YYYY-MM-DD', 400));
    }

    const cleanDetail = sanitizeText(detail, 300);
    if (!cleanDetail) {
        return next(new ErrorHander('Event detail is required', 400));
    }

    if (!Number.isInteger(index) || index < 0) {
        return next(new ErrorHander('Invalid event index', 400));
    }

    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHander('User not found', 404));
    }

    if (!user.timetable || !user.timetable.has(date)) {
        return next(new ErrorHander('Date not found in timetable', 404));
    }

    const events = user.timetable.get(date);
    if (index >= events.length) {
        return next(new ErrorHander('Event index out of bounds', 404));
    }

    events[index] = cleanDetail;
    user.timetable.set(date, events);
    user.markModified('timetable');

    await user.save();
    res.status(200).json({
        success: true,
        timetable: user.timetable,
    });
});

// Admin sharing resource
exports.createResource = catchAsyncErrors(async (req, res, next) => {
    const cleanTitle = sanitizeText(req.body.title, 200);
    const cleanDescription = sanitizeText(req.body.description, 2000);

    if (!cleanTitle || !cleanDescription) {
        return next(new ErrorHander('Title and description are required', 400));
    }

    if (!req.file) {
        return next(new ErrorHander('Please upload a valid PDF file', 400));
    }

    const fileUrl = req.file.path.replace(/\\/g, '/');

    const resource = await Resource.create({
        title: cleanTitle,
        description: cleanDescription,
        fileUrl,
        createdBy: req.user.id,
    });

    res.status(201).json({
        success: true,
        message: 'Resource shared successfully!',
        resource,
    });
});

// Authenticated users (students and admins) getting resources
exports.getAllResources = catchAsyncErrors(async (req, res, next) => {
    const resources = await Resource.find().sort({ createdAt: -1 }).lean();
    const normalized = resources.map((r) => ({
        ...r,
        fileUrl: typeof r.fileUrl === 'string' ? r.fileUrl.replace(/\\/g, '/') : r.fileUrl,
    }));
    res.status(200).json(normalized);
});

// Chat contact list (excludes current user, exposes only id, username, role)
exports.getUserList = catchAsyncErrors(async (req, res, next) => {
    const currentUserId = req.user.id;
    const users = await User.find(
        { _id: { $ne: currentUserId } },
        { _id: 1, username: 1, role: 1 }
    ).sort({ username: 1 });

    res.status(200).json(users);
});
