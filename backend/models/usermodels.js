const mongoose = require('mongoose');
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    completedTasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task'
        }
    ],
    timetable: {
        type: Map,
        of: [String], // Each date key in the timetable Map will store an array of strings (events)
        default: {},
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    },
    points: { type: Number, default: 0 },
},{ strict: false });

// Password hashing before saving user
UserSchema.pre("save", async function(next) {
    if (!this.isModified("password")) {
        return next();  // If password hasn't changed, move to the next middleware
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Generate JWT token
UserSchema.methods.getJWTToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// Compare passwords
UserSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate password reset token
UserSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    return resetToken;
};

module.exports = mongoose.model('UserParth', UserSchema);
