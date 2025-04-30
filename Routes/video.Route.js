const express=require('express');
const router=express.Router();
const checkAuth=require('../middleware/checkAuth');
const jwt=require('jsonwebtoken')
const Video=require('../models/Video');
const mongoose=require('mongoose');
const cloudinary=require('cloudinary').v2;
require('dotenv').config();

//configure the cloudinary 
cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API,
    api_secret:process.env.API_SECRET,
})

//upload a video 

router.post('/upload',checkAuth,async(req,res)=>{
    try
    {
        const token=req.header.authorization.split(' ')[1];
        const user=await jwt.verify(token,process.env.SECRET_KEY)
        // console.log(user)
        // console.log(req.body)
        // console.log(req.files.video)
        // console.log(req.files.thumbnail)
        const uploadedVideo= await cloudinary.uploader.upload(req.files.video.tempFilePath,{
            resource_type:'video',
        })
        const uploadedThumbnail= await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath)
        console.log(uploadedVideo)
        console.log(uploadedThumbnail)
        res.status(200).json({message:'video uploaded'})
        const newVideo=new video({
            _id:new mongoose.Types.ObjectId(),
            title:req.body.title,
            description:req.body.description,
            user_id:user._id,
            videoUrl:uploadedVideo.secure_url,
            videoId:uploadedVideo.public_id,
            thumbnailUrl:uploadedThumbnail.secure_url,
            thumbnailId:uploadedThumbnail.public_id,
            category:req.body.category,
            tags:req.body.tags.split(','),
        })
        const newUploadedVideoData=await newVideo.save()
        res.status(200).json({newUploadedVideoData})
    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({message:err})
    }
})


//update the video details
router.put('/:videoId',checkAuth,async(req,res)=>{
    try
    {    //check the token 
        const token=req.header.authorization.split(' ')[1];
        const VerifiedUser=await jwt.verify(token,process.env.SECRET_KEY)
        // console.log(VerifiedUser)
        const video =await Video.findById(req.params.videoId)
        if(video.user_id===VerifiedUser._id)
        {
            //update a video details
            // const updatedVideo=await Video.findByIdAndUpdate(req.params.videoId,req.body)
            // res.status(200).json({updatedVideo})
            if(req.files)
            {
                //update the thumbnail and text data
                await cloudinary.uploader.destroy(video.thumbnailId)
                const updatedThumbnail=await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath)
                const updatedData={
                    title:req.body.title,
                    description:req.body.description,
                    category:req.body.category,
                    tags:req.body.tags.split(','),
                    thumbnailUrl:updatedThumbnail.secure_url,
                    thumbnailId:updatedThumbnail.public_id,
                }
                const updatedVideoDetail=await Video.findByIdAndUpdate(req.params.videoId,updatedData,{new:true})
                res.status(200).json({
                    updatedVideo:updatedVideoDetail
                })
            }
            else
            {
                //update the text data
                const updatedData={
                    title:req.body.title,
                    description:req.body.description,
                    category:req.body.category,
                    tags:req.body.tags.split(','),
                }
                const updatedVideoDetail=await Video.findByIdAndUpdate(req.params.videoId,updatedData,
                    {new:true})
                res.status(200).json({
                    updatedVideo:updatedVideoDetail
                })
            }
        }
        else
        {
            res.status(400).json({message:'You are not authorized to update this video'})
        }
    }   
    catch(err)
    {
        res.status(500).json({message:err})
    } 

})

router.delete("/:videoId",checkAuth,async(req,res)=>{
    try{
        //to check the token 
        const token=req.header.authorization.split(' ')[1];
        const VerifiedUser=await jwt.verify(token,process.env.SECRET_KEY)
        //console.log(VerifiedUser)
        //taking the id from the database who is deleting the video
        const video =await Video.findById(req.params.videoId)
        //match the video of user id from  verifiedUser id 
        if(video.user_id===VerifiedUser._id)
        {   
            //delete the video ,thumbnail and data from database
            await cloudinary.uploader.destroy(video.videoId,{
                resource_type:'video',
            })
            await cloudinary.uploader.destroy(video.thumbnailId)
            await Video.findByIdAndDelete(req.params.videoId)
            res.status(200).json({message:'video deleted'})
        }
        else
        {
            res.status(400).json({message:'You are not authorized to delete this video'})
        }
    }
    catch(err)
    {
        res.status(500).json({message:err})
    }
})

router.put('/like/:videoId',checkAuth,async(req,res)=>{
    try{
        //to check the token
        const token=req.header.authorization.split(' ')[1];
        const VerifiedUser=await jwt.verify(token,process.env.SECRET_KEY)
        console.log(VerifiedUser)
        //find the video Id from database
        const video=await Video.findById(req.params.videoId)
        //console.log(video)
        if(video.likedBy.includes(VerifiedUser._id))
        {
            
            res.status(400).json({message:'You have already liked this video'})
        }
        //to  check user disliked the video
        if(video.dislikedBy.includes(VerifiedUser._id))
        {
            // res.status(400).json({message:'You have already disliked this video'})
            video.dislikes-=1
            video.dislikedBy=video.dislikedBy.filter((userId)=>userId.toString()!=VerifiedUser._id)
        }
        
        //to like the video
        video.likes+=1
        video.likedBy.push(VerifiedUser._id)
        await video.save()
        res.status(200).json({message:'Video liked'})

        }
    catch(err)
        {
            res.status(500).json({message:err})
        }

})


//dislike by user 
router.put('/dislike/:videoId',checkAuth,async(req,res)=>{
    try{
        //to check the token
        const token=req.header.authorization.split(' ')[1];
        const VerifiedUser=await jwt.verify(token,process.env.SECRET_KEY)
        console.log(VerifiedUser)
        //find the video Id from database
        const video=await Video.findById(req.params.videoId)
        if(video.dislikedBy.includes(VerifiedUser._id))
        {
            res.status(400).json({message:'You have already disliked this video'})
        }
        //to  check user liked the video
        if(video.likedBy.includes(VerifiedUser._id))
        {   
            video.likes-=1
            video.likedBy=video.likedBy.filter((userId)=>userId.toString()!=VerifiedUser._id)
        }
        video.dislikes+=1
        video.dislikedBy.push(VerifiedUser._id)
        await video.save()
        res.status(200).json({message:'Video disliked'})


    }
    catch(err)
    {
        res.status(500).json({message:err})
    }
})


//video of view
router.put('/views/:videoId',async (req,res)=>{
    try{
        const video=await video.findById(req.params.videoId)
        // console.log(video)
        video.views+=1
        await video.save()
        res.status(200).json({message:'Video viewed'})        

    }
    catch(err)
    {
        res.status(500).json({message:err})
    }
}) 

    
module.exports = router;




