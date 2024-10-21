const mongoose= require("mongoose");
const mailSender = require("../utils/mailSender");

const OTPSchema= new mongoose.Schema({
    email:{
        type:String,
        required:true,
        trim:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        required:true,
        expires: 5*60, //this means 5 min
    }
});

async function sendVerificationMails(email,otp)
{
    try{
        const mailResponse =  await mailSender(email,"Verification Mail for StudyNotion",otp)
        console.log("email sent successfully ",mailResponse)
    }
    catch(error)
    {
        console.log("Error in sendVerificationMails",error)
    }
}

OTPSchema.pre("save",async function(next){
    await sendVerificationMails(this.email,this.otp); 
    next();
})

module.exports = mongoose.model("OTP",OTPSchema);