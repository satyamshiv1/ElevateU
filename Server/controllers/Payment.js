const {instance} = require("../config/Razorpay.js");
const User = require("../models/User.js");
const Course = require("../models/Course.js");
const mailsender = require("../utils/mailSender.js")
const {courseEnrollementEmail} = require("../mail/templates/courseEnrollmentEmail.js")
const {default:mongoose} = require("mongoose");

//capture the payment and initiate the razorpay order
exports.capturePayment = async(req,res) =>
{
    //get courseId and UserId
    const {courseId} = req.body;
    const userId = req.user.id;

    //validation of courseId
    if(!courseId){
        return res.json({
            success:false,
            message:'please provide a valid courseId'
        })
    }
    //validation of course details
    let courseDetails;
    try{
        courseDetails = await Course.findById(courseId);
        if(!courseDetails)
        {
            return res.json({
                success:false,
                message:'please provide a valid course details'
            })
        }

        //if user already enrolled in the course
        const uid = new mongoose.Types.ObjectId(userId);
        if(courseDetails.studentsEnrolled.includes(uid))
        {
            return res.status(200).json({
                success:false,
                message:"Student is already enrolled in"
            })
        }
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }

    //order create
    const amount = courseDetails.price;
    const currency = 'INR';

    const options = {
        amount : amount*100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        //we are passing notes here so that after payment when razorpay hit webhook then they will go to verifysign
        //function and there we need userId and courseId to update themselves with updated list. But we can't fetch
        //it using req.body bcoz wo req frontend se nh aayi hai wo req razorpay se aayi hai so we need notes to
        //to transfer in razorpay.
        notes:{
            courseId,
            userId,
        }
    };

    try{
        //initiate the payment using razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);
        
        //return response for payment
        return res.status(200).json({
            success:true,
            courseName:courseDetails.courseName,
            courseDescription:courseDetails.courseDescription,
            thumbnail:courseDetails.thumbnail,
            orderId:paymentResponse.id,
            currency:paymentResponse.currency,
            amount:paymentResponse.amount,
        })
    }
    catch(error){
        console.log(error);
        return res.status(400).json({
            success:false,
            message:"Could not initiate order"
        });
    }
};

//verify signature of Razorpay and  Server

exports.verifySignature = async(req,res) =>{
    //defining
    const webhookSecret = "12345678";
    //fetching webhook secret from razorpay
    const signature = req.headers("x-razorpay-signature");

    //creating a hmac object for hashing of secret-- hmac means hash based message authentication course.
    const shasum = crypto.craeteHmac("sha256",webhookSecret);

    //converting hmac object in string form
    shasum.update(JSON.stringify(req.body));

    //generlly jab ham text par hashing algo lagate h to kuch cases ke andar hamm use kehte hai digest.it is in 
    //hexadecimal form ke andar rehta hai
    const digest = shasum.digest("hex");

    //the above three lines are rule to convert it in a hashed form so that we can match the data.


    //ab match kar lete hai for authorisation
    if(signature === digest){
        console.log("Payment is authorised");

        //fetching userId and courseId to fetch from notes of razorpay request.
        const {userId,courseId} = req.body.payload.payment.entity.notes;

        try{
            //find the course and enroll the student in it.
                const enrolledCourse = await Course.findOneAndupdate(
                                                                    {_id:courseId},
                                                                    {
                                                                        $push:{
                                                                            studentsEnrolled:userId,
                                                                        }
                                                                    },
                                                                    {new:true}
                )

                if(!enrolledCourse)
                {
                    return res.status(500).json({
                        success:false,
                        message:"Course Not Found"
                    })
                }

                console.log("Enrolled Courses");

                //find the student and add the course to their list enrolled courses me
                const enrolledStudent = await User.findOneAndupdate(
                                                                    {_id:userId},
                                                                    {
                                                                        $push:{
                                                                            courses:courseId,
                                                                        }
                                                                    },
                                                                    {new:true},
                )
                console.log(enrolledStudent);

                //mail send kar do confirmation wala
                const emailResponse = await mailSender(
                                                        enrolledStudent.email,
                                                        "Congratulation from Codehelp",
                                                        "Congratulations,you are onboarded into new Codehelp Course"
                );
                console.log("Email Response ->",emailResponse)
                return res.status(200).json({
                    success:true,
                    message:"Signature verified and course added"
                })
        }
        catch(error){
            console.log(error);
            return res.status(500).json({
                success:false,
                message:error.message,
            });
        }
    }
    else{
        return res.status(400).json({
            success:false,
            message:'Invalid request in verify signature',
        });
    }

    

}
