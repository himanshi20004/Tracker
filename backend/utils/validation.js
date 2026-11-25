const mongoose = require('mongoose');
const validator = require('validator');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const isValidDateKey = (dateStr) =>
    typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr);

const validatePasswordStrength = (password) => {
    if (typeof password !== 'string' || password.length < 8) {
        return 'Password must be at least 8 characters long';
    }
    if (password.length > 128) {
        return 'Password cannot exceed 128 characters';
    }
    return null;
};

const validateEmailAddress = (email) =>
    typeof email === 'string' && validator.isEmail(email.trim());

const sanitizeText = (value, maxLength = 500) => {
    if (typeof value !== 'string') return '';
    return value.trim().slice(0, maxLength);
};

module.exports = {
    isValidObjectId,
    isValidDateKey,
    validatePasswordStrength,
    validateEmailAddress,
    sanitizeText,
};
