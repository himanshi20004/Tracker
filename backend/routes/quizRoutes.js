const express = require("express");
const router = express.Router();

const { 
    isAuthenticatedUser, 
    authorizeRoles 
} = require("../middleware/auth");

const { 
    createQuiz, 
    getAllQuizzes, 
    submitQuiz, 
    getQuiz // Ensure this is imported!
} = require("../controllers/quizController");

// Admin: Create Quiz
router.route("/postquizzes").post(isAuthenticatedUser, authorizeRoles("admin"), createQuiz);

// User: Get All Quizzes
router.route("/getquizzes").get(isAuthenticatedUser, getAllQuizzes);

// User: Get Specific Quiz
router.route("/quizzes/:quizId").get(isAuthenticatedUser, getQuiz);

// User: Submit Quiz
router.route("/quizzes/:quizId/submit").post(isAuthenticatedUser, submitQuiz);

module.exports = router;