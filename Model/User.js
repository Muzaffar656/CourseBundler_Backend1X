import mongoose, { mongo } from "mongoose";
import validator from 'validator'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
const schema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter your name"]
    },
    email:{
        type:String,
        required:[true,"Please enter your email"],
        unique:true,
        validate:validator.isEmail
    },
    password:{
        type:String,
        unique:true,
        minLength:[6,"Password must be at least 6 characters"],
        select:false
    },
    role:{
        type:String,
        default:"user",
        enum:["admin", "user"],
    },
    subscription:{
        session_id:String,
        status:String,
        id:String
    },
    avatar:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    },
    playlist:[
        {
                course:{
                    type:mongoose.Schema.Types.ObjectId,
                    ref:"Course"
                },
                poster:String,
        }
    ],
    createdAt:{
        type:Date,
        default:Date.now
    },
    resetPasswordToken:String,
resetPasswordExpire:String
})

schema.pre('save',async function(next){
    if(!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password,10)
    next()
})

schema.methods.getJWTToken = function(){
    return jwt.sign(
        {_id:this._id},process.env.JWT_KEY,
     {   expiresIn:"15d"}
        )
}
schema.methods.comparePassword = async function(password){

    return await bcrypt.compare(password,this.password)
}


schema.methods.getResetToken = async function(){

 const resetToken = crypto.randomBytes(20).toString('hex')// the line mean is genrate random number  ghgfhgfhgfh
 this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest('hex') // this line mean they token hashed @@#$V^%&B^&^

 this.resetPasswordExpire = Date.now() + 15 * 60 * 1000 
    return resetToken
}
export const User = mongoose.model("User",schema)

// done 