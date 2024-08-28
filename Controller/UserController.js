import { catchAsyncError } from "../Middelware/catchAsyncError.js";
import { User } from "../Model/User.js";
import ErrorHandler from "../Utils/errorHandler.js";
import { sendEmail } from "../Utils/sendEmail.js";
import sendToken from "../Utils/sendToken.js";
import crypto from 'crypto'
import { Course } from "../Model/Course.js";
import cloudinary from 'cloudinary'
import getDataUri from "../Utils/dataUri.js";
import { Stats } from "../Model/Stats.js";



export const Register = catchAsyncError(async (req,res,next)=>{
   const {name,email,password} = req.body
   const file = req.file
   if(!name||!email||!password || !file) return next(new ErrorHandler("Please enter all field",400))
   let user = await User.findOne({email})
if(user) return next(new ErrorHandler('User Already Exist',409)) 
const fileUri = getDataUri(file)

const mycloud = await cloudinary.v2.uploader.upload(fileUri.content)

user = await User.create({
    name,
    email,
    password,
    avatar:{
        public_id: mycloud.public_id,
        url:mycloud.secure_url
    }
})
sendToken(res,user,"Registerd Succesfully",201)
})

export const Login = catchAsyncError(async (req,res,next)=>{
    const {email,password} = req.body

    if(!email||!password) return next(new ErrorHandler("Please enter all field",400))
    const  user = await User.findOne({email}).select("+password")
 if(!user) return next(new ErrorHandler('Incorrect Email and Password',401)) 

 const isMatch = await user.comparePassword(password)

 if(!isMatch) return next(new ErrorHandler("Incorrect Email and Password",401))

 sendToken(res,user,`Welcom back ${user.name}`,201)
 res.json({
    message:"working"
 })
 })

 export const Logout = catchAsyncError(async (req,res,next)=>{
    res.status(200).cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true,
        
        secure:true,
        sameSite:"none"
    }).json({
        message:"Logged Out Succesfully",
        success:true
    })
 })

 export const getMyProfile= catchAsyncError(async(req,res,next)=>{
 
    const user = await User.findById(req.user._id)
    res.status(200).json({
        success:true,
        user
    })
 })

 
 export const ChangePassword = catchAsyncError(async(req,res,next)=>{
    const {oldPassword,newPassword} = req.body;
    if(!oldPassword||!newPassword) return next(new ErrorHandler("Please enter all field",400))
    const user = await User.findById(req.user._id).select("+password")
    const isMatch = await user.comparePassword(oldPassword)
    if(!isMatch) return next(new ErrorHandler("Incorrect Old Password",400))
    user.password = newPassword
    await user.save()
    res.status(200).json({
        success:true,
        message:"Password Changed SuccessFully"
    })
 })


 export const UpdateProfile = catchAsyncError(async(req,res,next)=>{
    const {name,email} = req.body;
    const user = await User.findById(req.user._id)
   if(user) user.name = name
   if(email) user.email= email
    
    await user.save()
    res.status(200).json({
        success:true,
        message:"Profile Changed SuccessFully"
    })
 })

 export const UpdateProfilePicture = catchAsyncError(async(req,res,next)=>{
 const file = req.file
 const user = await User.findById(req.user._id)
 const fileUri = getDataUri(file)
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content)
     
    await cloudinary.v2.uploader.destroy(user.avatar.public_id)

    user.avatar = {
        public_id : mycloud.public_id,
        url : mycloud.secure_url
        }
await user.save()
    res.status(200).json({
        success:true,
        message:"Profile Picture Changed SuccessFully"
    })
 })


export const ForgetPassword = catchAsyncError(async(req,res,next) =>{

const {email} = req.body;

const user = await User.findOne({email})
if(!user) return next(new ErrorHandler("User not found",400))
const resetToken = await user.getResetToken()
await user.save()
// send token via email
const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`
const message = `Click on the link to reset your password. ${url}. if you have not request then please ignore`
await sendEmail(user.email,"CourseBundler Reset Password ",message)
            res.status(200).json({
                success:true,
                message:`Rest token has been sent to ${user.email}`
            })
})

export const ResetPassword =catchAsyncError(async (req,res,next)=>{
    const {token} = req.params
    const resetPasswordToken = crypto.createHash("sha256").update(token).digest('hex') 
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{
            $gt:Date.now()
            
        }
  
    })
    if(!user)
       return next(new ErrorHandler("Token is invalid or has been expired"))
    user.password = req.body.password
    user.resetPasswordExpire = undefined
    user.resetPasswordToken = undefined
    await user.save()
    res.status(200).json({ 
        success:true,
        token,
        message:"Password changed"
    })
})

export const addToPlayList = catchAsyncError(async (req,res,next)=>{
    const user = await User.findById(req.user._id)
    const course = await Course.findById(req.body.id)
    if(!course) return next(new  ErrorHandler("Invalid Course ID",404))

    const itemExists = user.playlist.find((item)=>{
        if(item.course.toString()=== course._id.toString()) return true
    })

    if(itemExists) return next(new ErrorHandler('item Already Exists',409))

    user.playlist.push({
        course:course._id,
        poster:course.poster.url
    })

   await user.save()
   res.status(200).json({ 
    success:true,
 
    message:"Added to playlist"
})
})



export const removefromToPlayList = catchAsyncError(async (req,res,next)=>{
const user = await User.findById(req.user._id)
const course = await Course.findById(req.query.id)
const newPlaylist = user.playlist.filter((item)=>{
    if(item.course.toString()!== course._id.toString()) return true
})

user.playlist = newPlaylist
user.save()

res.status(200).json({ 
    success:true,
 
    message:"removed from playlist"
})

})

// Admin Controllers

export const getAllUsers = catchAsyncError(async (req,res,next)=>{
    const user = await User.find()


    res.status(200).json({
        success:true,
        user
    })
})

export const UpdateUserRole = catchAsyncError(async (req,res,next)=>{
    const user = await User.findById(req.params.id)
    if(!user) return next(new ErrorHandler("User not found",404))

    if(user.role === 'user')   user.role = "admin"
   else user.role = 'user'

    await user.save()

    res.status(200).json({
        success:true,
        message : 'user role changed'
    })
})

export const DeleteUser = catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.params.id)
    if(!user) return next(new ErrorHandler("User not found",404))

    await cloudinary.v2.uploader.destroy(user.avatar.public_id)

    await user.deleteOne()

    res.status(200).json({
        success:true,
        message : 'user delete'
    })
})


export const DeleteMyProfile = catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.user._id)
    

    await cloudinary.v2.uploader.destroy(user.avatar.public_id)

    await user.deleteOne()

    res.status(200).cookie('token',null,{
        expires:new Date(Date.now())
    }).json({
        success:true,
        message : 'Your Profile is deleted'
    })
})

User.watch().on('change',async()=>{
    const stats = await Stats.find({}).sort({createdAt:"desc"}).limit(1)
    const subscription  = await User.find({"subscription.status":"active"})
    stats[0].users = await User.countDocuments()
    stats[0].subscription = subscription.length
    stats[0].createdAt = new Date(Date.now());
  await stats[0].save()  
})