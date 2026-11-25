const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs, max, message) =>
    rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        message: { success: false, message },
    });

exports.apiLimiter = createLimiter(
    15 * 60 * 1000,
    300,
    'Too many requests from this IP, please try again later.'
);

exports.authLimiter = createLimiter(
    15 * 60 * 1000,
    25,
    'Too many authentication attempts, please try again after 15 minutes.'
);

exports.aiLimiter = createLimiter(
    15 * 60 * 1000,
    15,
    'AI tutor rate limit reached. Please wait a few minutes before asking more questions.'
);
