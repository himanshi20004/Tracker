const jwt = require('jsonwebtoken');
const User = require('../models/usermodels');
const ErrorHandler = require('../utils/errorhander');

exports.isAuthenticatedUser = async (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].startsWith('Bearer') ? req.headers['authorization'].split(' ')[1] : null;

    if (!token) {
        return next(new ErrorHandler('Not logged in, please log in to access this resource', 401));
    }

    try {
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decodedData.id);
        next();
    } catch (error) {
        return next(new ErrorHandler('Invalid or expired token', 401));
    }
};

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`Role (${req.user.role}) is not allowed to access this resource`, 403));
        }
        next();
    };
};
