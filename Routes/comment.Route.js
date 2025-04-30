const express=require('express')
const router=express.Router()
const Comment=require('../models/Comment')
const jwt=require('jsonwebtoken')
const checkAuth=require('../middleware/checkAuth')

//new comment 
//post method for creating 
router.post('/new-comment/:videoId',checkAuth,async(req,res)=>{
    try{
        const token=req.header.authorization.split(' ')[1];
        const user=await jwt.verify(token,process.env.SECRET_KEY)
        console.log(user)
        const newComment=new Comment({
            _id:new mongoose.Types.ObjectId(),
            videoId:req.params.videoId,
            user_id:user._id,
            commentText:req.body.commentText,
        })
        const comment=await newComment.save()
        res.status(200).json({comment})
    }
    catch(err)
    {
        res.status(500).json({message:err})
    }
})

//get all  comment  
//this is get-method
router.get('/all-comment/:videoId',async(req,res)=>{
    try{
        //step 1 to find all the comment from the video details   
        //populate means for all user details if you want to only user channel and logourl you can use this method
        const comment=await Comment.find({videoId:req.params.videoId}).populate('user_id','channelName logoUrl')
        res.status(200).json({comment})
    }
    catch(err)
    {
        res.status(500).json({message:err})
    }
    
})

//update the comment
router.put('/:commentId',checkAuth,async(req,res)=>{
    try{
        const token=req.header.authorization.split(' ')[1];
        const user=await jwt.verify(token,process.env.SECRET_KEY)
        const comment=await Comment.findById(req.params.commentId)
        if(comment.user_id===user._id)
        {
            const updatedComment=await Comment.findByIdAndUpdate(req.params.commentId,req.body)
            //comment.commentText =req.body.commentText;
            //const updatedComment=await comment.save()
            res.status(200).json({updatedComment})
        }
        else
        {
            res.status(400).json({message:'You are not authorized to update this comment'})
        }
    }
    catch(err)
    {
        res.status(500).json({message:err})
    }
})

router.delete('/delete-comment/:commentId',checkAuth,async(req,res)=>{
    try{
        const token=req.header.authorization.split(' ')[1];
        const user=await jwt.verify(token,process.env.SECRET_KEY)
        const comment=await Comment.findById(req.params.commentId)
        // if(comment.user_id===user._id)
        // {
        //     await Comment.findByIdAndDelete(req.params.commentId)
        //     res.status(200).json({message:'Comment deleted'})
        // }
        // else
        // {
        //     res.status(400).json({message:'You are not authorized to delete this comment'})
        // }
        if(comment.user_id != user._id)
        {
            return res.status(500).json({
                message:'You are not authorized to delete this comment'
            })
        }
        await Comment.findByIdAndDelete(req.params.commentId)
        res.status(200).json({message:'Comment deleted'})
        
    }
    catch(err)
    {
        res.status(500).json({message:err})
    }
})
module.exports=router