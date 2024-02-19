import express from "express";
import { isAuthenticated } from "../Middelware/auth.js";
import { Buysubscription,GetRazorpayKey,PaymentVarification,CancelSubscribe } from "../Controller/PaymentController.js";

const router = express.Router()

router.route('/subscribe').get(isAuthenticated,Buysubscription)
router.route('/paymentverfication').post(isAuthenticated,PaymentVarification)
router.route('/razorpaykey').get(GetRazorpayKey)
router.route('/subscribe/cancel').delete(isAuthenticated,CancelSubscribe)

export default router