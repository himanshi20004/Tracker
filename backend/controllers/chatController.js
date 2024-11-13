const ChatModel=require('../models/chatmodels')
exports.crateChat = async(req,res)=>{
    const newChat=new ChatModel({
        memebers:[req.body.senderId,req.body.receiverId],
    });
    try{
       const result=await newChat.save();
       res.status(200).json(result);
    }catch(error){
        res.status(500).json({ message: 'An error occured' });
    }
};

//get all chat of a particular user 
exports.userChats=async(req,res)=>{
    try{
        const chat=await ChatModel.find({
            memebers:{$in:[req.params.userId]}
        })
        res.status(200).json(chat)
    }catch(error){
        res.status(500).json({ message: 'An error occured' });
    }
}
//find all chat between two users
exports.findChat=async(req,res)=>{
    try{
   const chat=await ChatModel.findOne({
    members:{$all:[req.params.firstId,req.params.secondId]}})
    res.status(200).json(chat)
   }
    catch(error){
        res.status(500).json({ message: 'An error occured' });
    }

}

