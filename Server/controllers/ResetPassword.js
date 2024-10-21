const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

//Reset Password Token
exports.resetPasswordToken = async(req,res) =>{
    try{
        //get email from req body
        const {email} = req.body;

        //check user for this email, email validation
        const user = await User.findOne({email:email});
        if(!user)
        {
            return res.json({
                success: false,
                message: `This Email: ${email} is not Registered With Us Enter a Valid Email `,
            });
        }

        //generate token
        const token = crypto.randomUUID();

        //update user by adding token and expiring time

        //here we have to add two properties in user model 1.token 2.resetPasswordExpires
        //this is done so that we can uniquely identify the user for reset password bcoz at that time we don't
        //have anything to fetch so that we can identify the user so we have to add token in user details.
        const updateDetails = await User.findOneAndUpdate(
                                                        {email:email},//is basis pe hame id find karna hai

                                                        {//and is basis pe hame details update karna hai
                                                            token:token,
                                                            resetPasswordExpires:Date.now()+5*60*1000,//5min
                                                        })
        //creating URL
        const url = `http://localhost:3000/update-password/${token}`

        //send mail containing the url
        await mailSender(email,"Reset Password Link",`Reset Password Link = ${url}`);

        //return response
        res.json({
            success: true,
            message:
                "Email Sent Successfully, Please Check Your Email to Continue Further",
        });
    }
    catch (error) {
		return res.status(400).json({
			error: error.message,
			success: false,
			message: `Some Error in Sending the Reset Message`,
		});
	}
}

//now controller for reset password
exports.resetPassword = async(req,res) =>{
    try{
        //data fetch
        //yahan pe token kaise aaya req ke body me balki hamne to url me token bheja tha mail per. so iska ans hai
        //ki ye req aaya hai frontend se to hamm is token ko req ke body me frontend me daalenge.
        const {password,confirmPassword,token} = req.body;

        //validation
        if(password!==confirmPassword)
        {
            return res.json({
                success: false,
                message: "Password and Confirm Password Does not Match",
            });
        }

        //get userdetails from db using token
        const userDetails = await findOne({token:token});

        // if no entry- invalid token
        if(!userDetails)
        {
            return res.json({
                success: false,
                message: "Token is Invalid",
            });
        }

        //token time check  
        if(userDetails.resetPasswordExpires < Date.now())
        {
            return res.status(403).json({
                success: false,
                message: `Token is Expired, Please Regenerate Your Token`,
            });
        }

        //hash psswd
        const hashedPassword = await bcrypt.hash(password,10);

        //password update in DB- maine upar ke userDetails pe change kyun nhi kiya bcoz wo bas ek instance hai
        //uspe change karne se real database me kabhi change nh hoga.
        await User.findOneAndUpdate(
                                        {token:token},
                                        {password:hashedPassword},
                                        {new:true}
                                    )
        //return response
        res.json({
            success: true,
            message: `Password Reset Successful`,
        });
    }
    catch (error) {
		return res.json({
			error: error.message,
			success: false,
			message: `Some Error in Updating the Password`,
		});
    }
}