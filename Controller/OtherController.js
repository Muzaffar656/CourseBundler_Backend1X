import { catchAsyncError } from "../Middelware/catchAsyncError.js";
import { sendEmail } from "../Utils/sendEmail.js";
import ErrorHandler from "../Utils/errorHandler.js";
import { Stats } from "../Model/Stats.js";
export const contact = catchAsyncError(async (req,res,next)=>{
    const {name,email,message} = req.body;
    if(!name || !email || !message) return next(new ErrorHandler("all field are mandotry",400))
    const to = process.env.MY_MAIL
    const subject = 'Contact from CourseBundler'
    const text = `my name is ${name} and my email is ${email}.\n ${message}`
await sendEmail(to,subject,text)
    res.status(200).json({
        success : true,
    message:"your message has been send"
    })
})



export const courseRequest = catchAsyncError(async (req,res,next)=>{


    const {name,email,course} = req.body;
    if(!name || !email || !course) return next(new ErrorHandler("all field are mandotry",400))
    const to = process.env.MY_MAIL
    const subject = 'Request for a course from CourseBundler'
    const text = `my name is ${name} and my email is ${email}. \n ${course}`
await sendEmail(to,subject,text)
    res.status(200).json({
        success : true,
    message:"your request has been send"
    })
})


export const getDashboardStats = catchAsyncError(async (req,res,next)=>{

    const stats = await Stats.find({}).sort({createdAt:"desc"}).limit(12)

    const statsData = []

    
    for (let i = 0; i < stats.length; i++) {
        statsData.unshift(stats[i])
        
    }
    const requiredSize = 12 - stats.length

    for (let i = 0; i < requiredSize; i++) {
      statsData.unshift({
        users:0,
        subscription:0,
        views:0
      })
    }

    const userCount = statsData[11].users
    const subscriptionCount = statsData[11].subscription
    const viewCount = statsData[11].views


    let userPercentage = 0, subscriptionPercentage =  0, viewPercentage = 0
    let userProfit = true, subscriptionProfit =  true, viewProfit = true


    if (statsData[10].users === 0) userPercentage = userCount * 100
    if (statsData[10].subscription === 0) subscriptionPercentage = subscriptionCount * 100
    if (statsData[10].views === 0) viewPercentage = viewCount * 100
    else{
        difference = {
            users: statsData[11].users - statsData[10].users,
            views: statsData[11].views - statsData[10].views,
            subscription: statsData[11].subscription - statsData[10].subscription

        }

        userPercentage = (difference.users / statsData[10].users) * 100;
        subscriptionPercentage = (difference.subscription / statsData[10].subscription) * 100;
        viewPercentage = (difference.viewPercentage / statsData[10].viewPercentage) * 100;

        if(userPercentage < 0 ) userProfit = false
        if(subscriptionPercentage < 0 ) subscriptionProfit = false
        if(viewPercentage < 0 ) viewPercentage = false


    }

    res.status(200).json({
        success : true,
        stats : statsData,
    userCount,
    subscriptionCount,
    viewCount,
    userProfit,
    subscriptionProfit,
    viewProfit,
    userPercentage,
    subscriptionPercentage,
    viewPercentage
    
    })
})