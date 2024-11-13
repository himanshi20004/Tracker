const express = require("express");
const router = express.Router();
const upload = require('../middleware/upload')
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
    getUser,
    editEvent,
    deleteEvent,
    
} = require('../controllers/userController');
const { 
    isAuthenticatedUser, 
    authorizeRoles 
} = require("../middleware/auth");


// User authentication and profile routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/password/forgot").post(forgetPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/me").get(isAuthenticatedUser, getUserDetails);
router.route("/password/update").put(isAuthenticatedUser, updatePassword);
router.route("/me/update").put(isAuthenticatedUser, updateProfile);
router.route("/logout").get(logout);
router.route("/user/update").patch(isAuthenticatedUser, updateUser);
router.route("/leaderboard").get(isAuthenticatedUser, getLeaderboard);
router.route("/users").get(isAuthenticatedUser,getUserList)

// Admin user management routes
router.route("/admin/users")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getAllUser);

router.route("/admin/user/:id")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getSingleUser)
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateUserRole)
    
router.route("/timetable/:userId").get(isAuthenticatedUser,getTimetable);
router.route("/timetable/:userId").post(isAuthenticatedUser,saveTimetable);
router.route("/resource").post(isAuthenticatedUser,upload.single('file'), authorizeRoles("admin"), createResource);
router.route("/resources").get(isAuthenticatedUser,getAllResources);
//router.route("/:userId").get(getUser)

router.route("/timetable/:userId").put(editEvent);
router.route("/timetable/:userId/:eventID").delete(deleteEvent);
module.exports = router;
