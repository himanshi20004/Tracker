const express = require("express");
const router = express.Router();
const { solveStudentDoubt } = require("../controllers/doubtController");

router.post("/solveDoubt", solveStudentDoubt);

module.exports = router;
