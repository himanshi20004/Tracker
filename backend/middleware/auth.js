const jwt = require('jsonwebtoken');
const User = require('../models/usermodels');
const ErrorHandler = require('../utils/errorhander');

exports.isAuthenticatedUser = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return next(new ErrorHandler('Not logged in, please log in to access this resource', 401));
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return next(new ErrorHandler('Server authentication configuration error', 500));
    }

    try {
        const decodedData = jwt.verify(token, secret);
        const user = await User.findById(decodedData.id);

        if (!user) {
            return next(new ErrorHandler('User no longer exists. Please log in again.', 401));
        }

        if (user.passwordChangedAt && decodedData.iat) {
            const changedTimestamp = Math.floor(user.passwordChangedAt.getTime() / 1000);
            if (decodedData.iat < changedTimestamp - 1) {
                return next(new ErrorHandler('Password was recently changed. Please log in again.', 401));
            }
        }

        req.user = user;
        next();
    } catch (error) {
        return next(new ErrorHandler('Invalid or expired token', 401));
    }
};

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            const roleName = req.user ? req.user.role : 'unknown';
            return next(new ErrorHandler(`Role (${roleName}) is not allowed to access this resource`, 403));
        }
        next();
    };
};
