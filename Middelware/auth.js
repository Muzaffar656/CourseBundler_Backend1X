import  jwt  from "jsonwebtoken";
import ErrorHandler from "../Utils/errorHandler.js";
import { catchAsyncError } from "./catchAsyncError.js";
import { User } from "../Model/User.js";



export const isAuthenticated = catchAsyncError(async (req,res,next)=>{

    const {token} = req.cookies;
    if(!token) return next(new ErrorHandler('Not Logged In',401))
        const decoded = jwt.verify(token,process.env.JWT_KEY)

   req.user = await User.findById(decoded._id)

   next()
})

export const authorizedAdmin = (req,res,next)=>{
    if(req.user.role !== "admin") return next(new ErrorHandler(`${req.user.role} is not allowed this resource`,403))

    next()
}

export const authorizedSubscribers = (req,res,next)=>{
    if(req.user.subscription.status !== "active" && req.user.role !== "admin") return next(new ErrorHandler("Only subscribers can access this resours",403))
    next()
}