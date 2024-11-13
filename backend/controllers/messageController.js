const Message=require('../models/messagemodel');
const Conversation=require('../models/chatmodels')
exports.addMessage = async (req, res) => {
    console.log(req.body)
    try{
     const {receiverId} =req.params;
    const senderId= req.user._id;
    const {content}=req.body;
    
    //find conversation existing between two users
    let conversation =await Conversation.findOne({
        participants:{$all:[senderId,receiverId]}
    })
    //if no conversation exits create one

    if(!conversation){
        conversation=new Conversation({
            participants:[senderId,receiverId]
        })
        await conversation.save()
    }
    const newMessage= new Message({
        conversationId:conversation._id,
        sender:senderId,
        content:content,
        createdAt: new Date()
    })

    await newMessage.save()

    return res.json(newMessage)
    }catch(error){
        res.status(200).json({ message: 'An error occured' });
    }
};

exports.getMessage = async (req, res) => {
    try {
        const { receiverId } = req.params;
        const senderId = req.user._id;

        // Find if a conversation exists
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        if (!conversation) {
            // If no conversation, return an empty array with a success message
            return res.status(200).json({ message: "No messages yet", messages: [] });
        }

        // If conversation found, retrieve messages
        const messages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 });
        return res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred' });
    }
};
