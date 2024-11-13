const express= require('express')
const { isAuthenticatedUser } = require('../middleware/auth')
const { crateChat, userChats, findChat } = require('../controllers/chatController')
const router = express.Router()

router.route('/').post(isAuthenticatedUser,crateChat);
router.route('/:userId').get(isAuthenticatedUser,userChats);
router.route('/find/:firstId/:secondId').get(isAuthenticatedUser,findChat);

module.exports = router;