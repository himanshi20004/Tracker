const express = require("express");
const router = express.Router();
const { 
    createTask, 
    getAllTasks, 
    getSingleTask, 
    updateTask, 
    deleteTask ,
    completeTask,
    getCompletedTaskDetails
} = require('../controllers/taskController');
const { 
    isAuthenticatedUser, 
    authorizeRoles 
} = require("../middleware/auth");

// Task management routes
router.route("/task")
    .post(isAuthenticatedUser, authorizeRoles("admin"), createTask) 
    .get(isAuthenticatedUser, getAllTasks); // All users can get all tasks

router.route("/task/:id")
    .get(isAuthenticatedUser, getSingleTask) // All users can get a single task by ID
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateTask) // Admin can update a task
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteTask); // Admin can delete a task
router.route('/complete-task').post(isAuthenticatedUser, completeTask); 
router.post('/details', isAuthenticatedUser, getCompletedTaskDetails);

module.exports = router;
