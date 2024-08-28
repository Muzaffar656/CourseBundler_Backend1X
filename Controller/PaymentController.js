import { catchAsyncError } from "../Middelware/catchAsyncError.js";
import { User } from "../Model/User.js";
import ErrorHandler from "../Utils/errorHandler.js";
import {instance} from '../server.js'
import crypto from 'crypto'
import { Payment } from "../Model/Payment.js"; 





export const Buysubscription = catchAsyncError(async (req,res,next)=>{
    const user = await User.findById(req.user._id)

    if(user.role === 'admin') return next(new ErrorHandler("Admin can't buy subscription"))
    const plan_id = process.env.PLAN_ID
console.log(plan_id)
    const subscription = await instance.subscriptions.create({
        plan_id,
        customer_notify: 1,
        quantity: 5,
        total_count: 12,
      })
      user.subscription.id = subscription.id
      user.subscription.status = subscription.status
      await user.save()
      res.status(200).json({
        succsess : true,
      subscriptionId : subscription.id      })
})


export const PaymentVarification = catchAsyncError(async (req,res,next)=>{
  const {razorpay_signature,razorpay_payment_id,razorpay_subscription_id} = req.body
  const user = await User.findById(req.user._id)

  const subscription_id = user.subscription.id

  const generated_signature = crypto.createHmac("sha256",process.env.RAZORPAY_API_SECRET).update(
    razorpay_payment_id + '|' + subscription_id, "utf-8"
  ).digest("hex")

    const isAuthenticate = generated_signature  === razorpay_signature

    if(!isAuthenticate) return res.redirect(`${process.env.FRONTEND_URL}/paymentfailed`)


    await Payment.create({
      razorpay_signature,
      razorpay_payment_id,
      razorpay_subscription_id
    })
user.subscription.status = "active"
await user.save()

res.redirect(`${process.env.FRONTEND_URL}/paymentsuccess?reference=${razorpay_payment_id}`)

    
})


export const CancelSubscribe  = catchAsyncError(async (req,res,next) =>{
  const user = await User.findById(req.user._id)
  const subscriptionID = user.subscription.id
  let refund = false
  await instance.subscriptions.cancel(subscriptionID)
  const payment = await Payment.findOne({
    razorpay_subscription_id : subscriptionID
  })
  const gap = Date.now() - payment.createdAt
  const refundays = process.env.REFUD_DAYS * 24 * 60 * 60 * 1000

  if(refundays>gap){
    // await instance.payments.refund(payment.razorpay_payment_id)
    refund = true
  }
  await payment.deleteOne()
  user.subscription.id = undefined
  user.subscription.status = undefined
  await user.save()
  res.status(200).json({
    success:true,
    message: refund ?"Subscription Canelled Refund amount wiil be transferd in your bank account": "sorry your refund is not tranfer because refund tranfer in 7 days "
  })
})



export const GetRazorpayKey  = catchAsyncError(async(req,res,next)=>{
  res.status(200).json({
    success:true,
    key:process.env.RAZORPAY_API_KEY
  })
})