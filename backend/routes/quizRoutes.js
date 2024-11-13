
const express = require("express");
const router = express.Router();

const { 
    isAuthenticatedUser, 
    authorizeRoles 
} = require("../middleware/auth");
const { createQuiz, getAllQuizzes, submitQuiz,getQuiz } = require("../controllers/quizController");
//const { getQuiz } = require("../controllers/userController");

router.route("/getquizzes").get(isAuthenticatedUser, getAllQuizzes); // Moved up for priority
router.route("/postquizzes").post(isAuthenticatedUser, authorizeRoles("admin"), createQuiz);
router.route("/quizzes/:quizId").get(isAuthenticatedUser, getQuiz);
router.route("/quizzes/:quizId/submit").post(isAuthenticatedUser, submitQuiz);

module.exports = router;
