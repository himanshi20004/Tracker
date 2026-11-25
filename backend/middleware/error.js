const ErrorHander = require('../utils/errorhander');

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    if (err.name === 'CastError') {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHander(message, 400);
    }

    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((val) => val.message);
        err = new ErrorHander(messages.join(', '), 400);
    }

    if (err.code === 11000) {
        const fields = Object.keys(err.keyValue || {});
        const message = fields.length > 0
            ? `Duplicate ${fields.join(', ')} entered`
            : 'Duplicate value entered';
        err = new ErrorHander(message, 409);
    }

    if (err.name === 'JsonWebTokenError') {
        err = new ErrorHander('Json Web Token is invalid, try again', 401);
    }

    if (err.name === 'TokenExpiredError') {
        err = new ErrorHander('Json Web Token has expired', 401);
    }

    if (err.name === 'MulterError') {
        const message = err.code === 'LIMIT_FILE_SIZE'
            ? 'File too large. Maximum allowed size is 10MB.'
            : err.message;
        err = new ErrorHander(message, 400);
    }

    if (err.statusCode === 500) {
        console.error(`[Server Error] ${req.method} ${req.originalUrl}:`, err.message);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.statusCode === 500 && process.env.NODE_ENV === 'production'
            ? 'Internal Server Error'
            : err.message,
    });
};
