const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User=require('../models/User');
const mongoose=require('mongoose');
const jwt=require('jsonwebtoken');
const checkAuth = require('../middleware/checkAuth');
const cloudinary=require('cloudinary').v2;
 require('dotenv').config();

//configure the cloudinary 
cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API,
    api_secret:process.env.API_SECRET,
})


// signup a new user
router.post('/signup', async (req, res) => {
    try{
        const users=await User.find({email:req.body.email});
        if(users.length>0)
        {
            return res.status(400).json({message:'User already exists'});
        }

        const hashPassword =await bcrypt.hash(req.body.password, 10)
        const uploadedImage=await cloudinary.uploader.upload(req.files.logo.tempFilePath)
        // console.log(hashPassword);
        const newUser=new User({
            _id:new mongoose.Types.ObjectId(),
            channelName:req.body.channelName,
            email:req.body.email,
            phone:req.body.phone,
            password:hashPassword,
            logoUrl:uploadedImage.secure_url,
            logoId:uploadedImage.public_id,
        })
        const user=await newUser.save();
        res.status(200).json({newUser:user});
        
    }
    catch(err)
    {
        res.status(500).json({message: err.message})
    }
});


//login a user
router.post('/login',async (req,res)=>{
    try{
            // console.log(req.body)
            const user=await User.find({email:req.body.email}) 
            // console.log(user);
            if(user.length == 0)
            {
                return res.status(400).json({message:"User is not found....."})
            }
            const isvalid=await bcrypt.compare(req.body.password,user[0].password)
            if(!isvalid)
            {
                return res.status(400).json({message:"Invalid Passwordx"})
            }
            const token=jwt.sign({
                _id:user[0]._id,
                email:user[0].email,
                phone:user[0].phone,
                logoId:user[0].logoId,
            },process.env.SECRET_KEY,{expiresIn:'1h'})
            res.status(200).json({
                _id:user[0]._id,
                channelName:user[0].channelName,
                email:user[0].email,
                phone:user[0].phone,
                logoUrl:user[0].logoUrl,
                logoId:user[0].logoId,
                token:token,
                subscribers:user[0].subscribers,
                subscribedChannels:user[0].subscribedChannels,
            })
    }
    catch(err)
    {
        res.status(500).json({message:"something is wrong"})
    }
})


//subcrible api
router.put('/subscribe/userBId',checkAuth,async(req,res)=>{
    try
    {
        const token=req.header.authorization.split(' ')[1];
        const user=await jwt.verify(token,process.env.SECRET_KEY)
        const userB=await User.findById(req.body.userBId)
        //console.log(userB)
        if(userB.subscribedBy.includes(user._id))
        {
           return  res.status(400).json({message:'You have already subscribed this channel'})
        }
        //console.log(user)
        userB.subscribers+=1
        userB.subscribedBy.push(user._id)
        await userB.save()
        const userAFullInformation=await User.findById(user._id)
        userAFullInformation.subscribedChannels.push(userB._id)
        await userAFullInformation.save()
        res.status(200).json({message:'Subscribed.....'})
    }
    catch(err)
    {
        res.status(500).json({message:err})
    }
    })

router.put('/unsubscribe/:userBId',checkAuth,async(req,res)=>{
    try
    {
        //Step 1 to verify  the token 
        const token=req.header.authorization.split(' ')[1];
        const userA=await jwt.verify(token,process.env.SECRET_KEY)
        //Step 2 to find the user Id from the database
        const userB=await User.findById(req.params.userBId)
        // console.log(userA)
        // console.log(userB)
        //Step 3 to keep the userA data on the user B
        if(userB.subscribedBy.includes(userA._id))
        {
            //step 5 if user subscribed your channel but he wants to unsubscribed your channel 
           //unsubscribe logic
           userB.subscribers-=1
           userB.subscribedBy=userB.subscribedBy.filter((userId)=>userId.toString()!=userA._id)
           await userB.save()
           const userAFullInformation=await User.findById(userA._id)
           userAFullInformation.subscribedChannels=userAFullInformation.subscribedChannels.filter((userId)=>userId.toString()!=userB._id)
          //step 6 to save the userA data on the user B
           await userAFullInformation.save()
           res.status(200).json({message:'Unsubscribed.....'})
        }
        else
        {
            //step 4 if user is not subscribed your channel 
            return res.status(400).json({message:'You have not subscribed this channel'})
        }
    }   
    catch(err)
    {
        res.status(500).json({message:err})
    } 
})

module.exports = router;