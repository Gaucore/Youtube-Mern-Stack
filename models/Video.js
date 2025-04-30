const mongoose=require('mongoose')
const videoSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    user_id:{
        type:String,
        required:true,
    },
    videoUrl:{
        type:String,
        required:true,
    },  
    videoId:{
        type:String,
        required:true,
    },
    thumbnailUrl:{
        type:String,
        required:true,
    },
    thumbnailId:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    tags:[{
        type:String,
        required:true,
    }],
    views:{
        type:Number,
        default:0,
    },
    likes:{
        type:Number,
        default:0,
    },
    dislikes:{
        type:Number,
        default:0,
    },
    likedBy:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
    }],
    dislikedBy:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
    }],
    // viewedBy:[{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:'user',
    // }]
},{
    timestamps:true,
}
)
module.exports = Video = mongoose.model('video', videoSchema);

