const express = require('express');
const router = express.Router();
const { solveDoubt } = require('../controllers/doubtController');
const { isAuthenticatedUser } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiters');

router.post('/solveDoubt', isAuthenticatedUser, aiLimiter, solveDoubt);

module.exports = router;
