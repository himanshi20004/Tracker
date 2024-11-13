
const mongoose = require('mongoose');

const ChatSchema=mongoose.Schema({
    participants:[
        {type:mongoose.Schema.Types.ObjectId,   //store Id of user 
            ref:'User'
        }
    ],
},{
    timeStamp:true,
});


module.exports = mongoose.model('Chat', ChatSchema);