const User = require("user");
const OTP = require("OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require(dotenv).config()


//send OTP
exports.sendOTP = async(req,res) => {
    
    try{
        //fetching email from the req.body.
        const {email} = req.body;

        //check if user already exist.
        const checkUserPresent = await User.findOne({email});

        //if already exist, then return a response.  
        if(checkUserPresent)
        {
            return res.status(401).json({
                success:false,
                message:"User already exists"
            })
        }

        //generate OTP
        var otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false
        })
        console.log("OTP Generated = ",otp);

        // check unique otp or not.
        let result = await OTP.findOne({otp:otp});

        while(result)
        {
            otp = otpGenerator.generate(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false
            })
            
            let result = await OTP.findOne({otp:otp});
        }

        const otpPayload = {email,otp};

        //creating an otp in database.
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        //return successful response
        res.status(200).json({
            success:true,
            message:"OTP sent successfully",
            otp
        })
    }
    catch(error){
        console.log("Error in sending OTP",error);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }

};

//Signup
exports.signUp = async(req,res) =>{
    
    try{
        //fetching data from req ki body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        //validare karlo for all the req field.
        if (
            !firstName ||
            !lastName ||
            !email ||
            !password ||
            !confirmPassword ||
            !otp
        ) 
        {
            return res.status(403).send({
            success: false,
            message: "All Fields are required",
            })
        }

        //dono password match karke dekh lo
        if(password!==confirmPassword)
        {
            return res.status(400).send({
                success: false,
                message: "Confirm Password is not matching",
            })
        }

        //check user already exist or not
        const existingUser = await User.findOne({email});
        if(existingUser)
        {
            res.status(400).json({
                success:false,
                message:"User already exists"
            })
        }

        //find most recent otp stored for the user
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log("Recent Otp = ",recentOtp);

        //validateOtp
        if(recentOtp.length===0)
        {
            res.status(400).json({
                success:false,
                message:"Otp not found"
            });
        }
        else if(otp!==recentOtp.otp)
        {
            //Invalid Otp
            res.status(400).json({
                success:false,
                message:"Otp don't match"
            });
        }

        //Hash Password
        const hashedPassword = await bcrypt.hash(password,10);

        //create entry in db
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        })

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType: accountType,
            approved: approved,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/9.x/initials/svg?seed=${firstName} ${lastName}`,
        })

        return res.status(200).json({
            success:true,
            message:"Entry successfully created in DB"  
        })
    }
    catch(error)
    {
        console.log(error)
        return res.status(400).json({
          success:false,
          message:"User can't be registered. Please try again"  
        })
    }

}

//Login
exports.login = async(req,res) =>{
    try{
        //get data from req body
        const {email,password} =req.body;

        //validation data
        if(!email||!password)
        {
            return res.status(400).json({
                success:false,
                message:"All fields are required"  
            })
        }

        //user check exist or not
        const user = await User.findOne({email})

        if(!user)
        {
            return res.status(400).json({
                success:false,
                message:"User not exist"  
            })
        }

        //generate JWT after password matching

        if(await bcrypt.compare(password,user.password))
        {
            const payload = {
                email:user.email, 
                id:user._id,
                accountType:user.accountType
            }
            
            const token = jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:"2h"})

            user.token = token;
            user.password = undefined;

            //create cookies and send response
            const options = {
                expires:new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,
            }
            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:"Login Successfully"
            })
        }
        else{
            return res.status(400).json({
                success:false,
                message:"Password is incorrect"
            })
        }
    }
    catch(error)
    {
        console.log(error);
        return res.status(400).json({
            success:false,
            message:"Login failure, please try again"
        });
    }
};


//Change Password

exports.changePassword = async(req,res) => {
    //get data from req body


    //get oldPassword,newPassword,confirmPassword


    //validation

    //update pwd in Db

    //sending mail - Password Updated

    //return response
}