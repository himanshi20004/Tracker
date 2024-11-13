const express=require('express')
const { isAuthenticatedUser } = require('../middleware/auth')
const { addMessage, getMessage } = require('../controllers/messageController')
const router=express.Router()

router.route("/send/:receiverId").post(isAuthenticatedUser,addMessage);
router.route("/read/:receiverId").get(isAuthenticatedUser,  getMessage);


module.exports=router;