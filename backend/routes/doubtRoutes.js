const express = require('express');
const router = express.Router();
const { solveDoubt } = require('../controllers/doubtController');
// const { authMiddleware } = require('../middleware/auth'); // Uncomment if you have auth

// Matching the endpoint in your React code: /api/v1/solveDoubt
router.post('/solveDoubt', solveDoubt); 

module.exports = router;