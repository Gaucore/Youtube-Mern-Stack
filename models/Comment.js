const mongoose = require('mongoose');
const commentSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    videoId:{
        type:String,
        required:true,
    },
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'user',
    },
    commentText:{
        type:String,
        required:true,
    }
},{
    timestamps:true,
}
)
module.exports = Comment = mongoose.model('comment', commentSchema);
