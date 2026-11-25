const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { authLimiter } = require('../middleware/rateLimiters');
const {
    registerUser,
    loginUser,
    logout,
    forgetPassword,
    resetPassword,
    getUserDetails,
    updatePassword,
    updateProfile,
    getAllUser,
    getSingleUser,
    updateUserRole,
    getLeaderboard,
    updateUser,
    getTimetable,
    saveTimetable,
    createResource,
    getAllResources,
    getUserList,
    editEvent,
    deleteEvent,
} = require('../controllers/userController');
const {
    isAuthenticatedUser,
    authorizeRoles,
} = require('../middleware/auth');

// Authentication & password management routes
router.route('/register').post(authLimiter, registerUser);
router.route('/login').post(authLimiter, loginUser);
router.route('/password/forgot').post(authLimiter, forgetPassword);
router.route('/password/reset/:token').put(authLimiter, resetPassword);
router.route('/logout').get(logout);

// Authenticated user routes
router.route('/me').get(isAuthenticatedUser, getUserDetails);
router.route('/password/update').put(isAuthenticatedUser, updatePassword);
router.route('/me/update').put(isAuthenticatedUser, updateProfile);
router.route('/user/update').patch(isAuthenticatedUser, updateUser);
router.route('/leaderboard').get(isAuthenticatedUser, getLeaderboard);
router.route('/users').get(isAuthenticatedUser, getUserList);

// Admin user management routes
router.route('/admin/users')
    .get(isAuthenticatedUser, authorizeRoles('admin'), getAllUser);

router.route('/admin/user/:id')
    .get(isAuthenticatedUser, authorizeRoles('admin'), getSingleUser)
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateUserRole);

// Timetable routes (authenticated owner only)
router.route('/timetable/:userId')
    .get(isAuthenticatedUser, getTimetable)
    .post(isAuthenticatedUser, saveTimetable)
    .put(isAuthenticatedUser, editEvent);

router.route('/timetable/:userId/:eventId')
    .delete(isAuthenticatedUser, deleteEvent);

// Resource routes (admin check runs BEFORE multer upload)
router.route('/resource')
    .post(isAuthenticatedUser, authorizeRoles('admin'), upload.single('file'), createResource);
router.route('/resources')
    .get(isAuthenticatedUser, getAllResources);

module.exports = router;
