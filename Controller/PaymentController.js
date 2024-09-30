import { catchAsyncError } from "../Middelware/catchAsyncError.js";
import { User } from "../Model/User.js";
import ErrorHandler from "../Utils/errorHandler.js";
import { instance } from "../server.js";
import crypto from "crypto";
import { Payment } from "../Model/Payment.js";
import Stripe from "stripe";
import moment from "moment/moment.js";
const stripe = new Stripe(
  "sk_test_51Pokm0Kk8xEJZ57ZyfEzM6VbPVYg2y8asJWH3POAp4Cw3RLQcEqvHCByLcZi6rDytbDXqpZfcqiKvLcyuxJbAcca008zsdPz5E"
);

const stripeSession = async (plan) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan,
          quantity: 1,
        },
      ],
      success_url: "http://localhost:3000/paymentsuccess",
      cancel_url: "http://localhost:3000/paymentfail",
    });
    return session;
  } catch (error) {
    console.log(error);
  }
};

export const Buysubscription = catchAsyncError(async (req, res, next) => {

  const user = await User.findById(req.user._id);
  if (user.role === "admin")
    return next(new ErrorHandler("Admin can't buy subscription"));
  const plan_id = process.env.STRIPE_PLAN_ID;
  const session = await stripeSession(plan_id);
  user.subscription.session_id = session.id;

  user.subscription.status = session.status;
  await user.save();
  res.status(200).json({
    succsess: true,
    subscriptionId: session,
   
  });
});

export const PaymentVarification = catchAsyncError(async (req, res, next) => {
  // const { razorpay_signature, razorpay_payment_id, razorpay_subscription_id } =
  //   req.body;
  // const user = await User.findById(req.user._id);

  // const subscription_id = user.subscription.id;

  // const generated_signature = crypto
  //   .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
  //   .update(razorpay_payment_id + "|" + subscription_id, "utf-8")
  //   .digest("hex");

  // const isAuthenticate = generated_signature === razorpay_signature;

  // if (!isAuthenticate)
  //   return res.redirect(`${process.env.FRONTEND_URL}/paymentfailed`);

  // await Payment.create({
  //   razorpay_signature,
  //   razorpay_payment_id,
  //   razorpay_subscription_id,
  // });
  // user.subscription.status = "active";
  // await user.save();

  // res.redirect(
  //   `${process.env.FRONTEND_URL}/paymentsuccess?reference=${razorpay_payment_id}`
  // );
  const {sessionID} = req.body
  let user = await User.findById(req.user._id)
  const session = await stripe.checkout.sessions.retrieve(sessionID)
  let subcriptionID  = session.subscription
  const subscription = await stripe.subscriptions.retrieve(subcriptionID)
  const start_date = moment.unix(subscription.current_period_start).format('YYYY-MM-DD')
  const end_data = moment.unix(subscription.current_period_end).format('YYYY-MM-DD')
  const durationInSeconds = subscription.current_period_end - subscription.current_period_start;
  const durationInDays = moment.duration(durationInSeconds, 'seconds').asDays();
  user.subscription.id = subcriptionID
await user.save()
  res.json({
    subcriptionID,
      start_date,
      end_data,
      durationInDays,
      durationInSeconds
  })
});

export const CancelSubscribe = catchAsyncError(async (req, res, next) => {
  
  const user = await User.findById(req.user._id);
  console.log(user + 'user')
  const subscriptionID = user.subscription.id;
  // let refund = false;
  // await instance.subscriptions.cancel(subscriptionID);
  // const payment = await Payment.findOne({
  //   razorpay_subscription_id: subscriptionID,
  // });
  // const gap = Date.now() - payment.createdAt;
  // const refundays = process.env.REFUD_DAYS * 24 * 60 * 60 * 1000;

  // if (refundays > gap) {
  //   // await instance.payments.refund(payment.razorpay_payment_id)
  //   refund = true;
  // }
  // await payment.deleteOne();
  const subscription_cancel = await stripe.subscriptions.cancel(subscriptionID)
  user.subscription.status = undefined;
  user.subscription.id = undefined;
  user.subscription.session_id = undefined
  await user.save();
  res.status(200).json({
    success: true,
    message:  "Subscription Canelled Refund amount wiil be transferd in your bank account"
      //  "sorry your refund is not tranfer because refund tranfer in 7 days ",
  });
});

export const GetRazorpayKey = catchAsyncError(async (req, res, next) => {
  res.status(200).json({
    success: true,
    key: process.env.RAZORPAY_API_KEY,
  });
});
