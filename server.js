import app from "./app.js";
import { connectDB } from "./config/database.js";
import {v2 as cloudinary} from 'cloudinary';
import Razorpay from 'razorpay'
import nodeCron from  'node-cron'
import { Stats } from "./Model/Stats.js";

connectDB()
          
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key:process.env.CLOUD_API_KEY , 
  api_secret:process.env.CLOUD_SECRET_KEY 
});

export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret:process.env.RAZORPAY_API_SECRET,
});

nodeCron.schedule("0 0 0 1 * *",async()=>{
 try {
 
  await Stats.create({})
 } catch (error) {
  console.log(`Error in nodeCrone`+ error)
 }

})



app.listen(process.env.PORT,()=>{
    console.log(`Server is Working on ${process.env.PORT} Properly`)
})