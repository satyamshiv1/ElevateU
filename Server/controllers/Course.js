const Course = require("../models/Course.js")
const Category = require("../models/Category.js")
const User = require("../models/User.js")
const {uploadImageToCloudinary} = require("../utils/imageUploader.js")


//createCourse Handler function
exports.createCourse = async(req,res) =>{
    try{
        //fetching the data from req
        const {courseName, courseDescription, whatYouWillLearn, price, category} = req.body;

        //get thumbnail image from files
        const thumbnail = req.files.thumbnailImage;

        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !thumbnail){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }

        //check for instructor for instructur details-if i am using an middleware of isInstructur then why we need
        //this -- we will need this bcoz instructor me is course ka details and is course me instructor ka details
        //hona cahhiye.
        const userId = req.user.id;
        const instructorDetails = await User.findById({userId});
        console.log("Instructor Details = ",instructorDetails);
        //TODO : verify that userId and instructorDetails._id are same or different ?

        if(!instructorDetails){
            return res.status(404).json({
                success: false,
                message: "Instructor Details Not Found",
            })
        }

        //check for category given is valid here we get the tag id because in models we have taken 
        //category_id as the details.
        const categoryDetails = await Category.findById({category});
        if(!categoryDetails){
            return res.status(404).json({
                success: false,
                message: "Category Details Not Found",
            })
        }

        //upload photo to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);

        //creation of course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn:whatYouWillLearn,
            price,  
            category:categoryDetails._id,
            thumbnail:thumbnailImage.secure_url,
        })

        //adding this course in course section of user.
        await User.findByIdAndUpdate(
            {_id:instructorDetails._id},
            //this is for pushing the value in courses array.
            {
                $push:{
                    courses:newCourse._id,
                }
            },
            {new:true}
        )

        //adding this course in course section of category.
        await Category.findByIdAndUpdate(
            {_id:categoryDetails._id},
            //this is for pushing the value in courses array.
            {
                $push:{
                    courses:newCourse._id,
                }
            },
            {new:true}
        )

        //returning successful response
        res.status(200).json({
            success: true,
            data: newCourse,
            message: "Course Created Successfully",
          })

    }
    catch(error)
    {
        console.log(error)
        return res.status(404).json({
            success: false,
            message: `Can't Fetch Course Data`,
            error: error.message,
        })
    }
}



//getAllcourse handler function

exports.getAllCourses = async(req,res) =>{
    try {
        const allCourses = await Course.find(
          { status: "Published" },
          {
            courseName: true,
            price: true,
            thumbnail: true,
            instructor: true,
            ratingAndReviews: true,
            studentsEnrolled: true,
          }
        )
          .populate("instructor")
          .exec()
    
        return res.status(200).json({
          success: true,
          data: allCourses,
        })
      } catch (error) {
        console.log(error)
        return res.status(404).json({
          success: false,
          message: `Can't Fetch Course Data`,
          error: error.message,
        })
      }
}

//GET all details of every course

exports.getCourseDetails = async(req,res) =>{
    try{
        //get id
        const {courseId} = req.id;

        //get all details
        const courseDetails= await Course.findById(
                                                {courseId})
                                                .populate(
                                                    {
                                                        path:"instructor",
                                                        populate:{
                                                            path:"additionalDetails"
                                                        },
                                                    }
                                                )
                                                .populate("category")
                                                .populate("ratingAndReviews")
                                                .populate(
                                                    {
                                                        path:"courseContent",
                                                        populate:{
                                                            path:"subSection",
                                                        },
                                                    }
                                                )
                                                .exec();
        //validation of details
        if(!courseDetails)
        {
            return res.status(400).json({
                success:false,
                message:`Couldn't find the course with ${courseId}`,
            })
        }

        //else return success response
        return res.status(200).json({
            success:true,
            message:`Find the course with ${courseId}`,
            data:courseDetails
        })
                                        
    }
    catch(error)
    {
        console.log(error);
        return res.status(400).json({
            success:false,
            message:error.message,
        });
    }
}