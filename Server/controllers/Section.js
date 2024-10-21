const Section = require("../models/Section.js")
const Course = require("../models/Course.js")

exports.createSection = async(req,res) =>{
    try{
        //fetching the data
        const {sectionName, courseId} = req.body;

        //data validation
        if(!sectionName || !courseId)
        {
            return res.status(400).json({
				success: false,
				message: "Missing required properties",
			});
        }

        //create section
        const newSection = await Section.create({sectionName});

        //update course with section onjectId
        const updatedCourseDetails = await Course.findByIdAndUpdate(
                                                                        courseId,
                                                                        {
                                                                            $push:{
                                                                                courseContent:newSection._id,
                                                                            }
                                                                        },
                                                                        {new:true},
                                                                    )
        //HW : use populate to replace sections/subsections both in the updatedCourseDetails
        //return response
        res.status(200).json({
			success: true,
			message: "Section created successfully",
			updatedCourse,
		});
    }
    catch(error)
    {
        res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
    }
}

//update ka section 
exports.updateSection = async(req,res) =>{
    try{
        //fetching the details to update the section
        const {sectionName,sectionId} = req.body;

        //data validation
        if(!sectionName || !sectionId)
        {
            res.status(403).json({
                success: false,
                message: "Send all the properties req. to update section details.",
                error: error.message,
            });
        }

        //updating the section part.
        const updatedSection = await Section.findByIdAndUpdate(sectionId,{sectionName:sectionName},{new:true})

        //return res
        res.status(200).json({
			success: true,
			message: section,
			data:course,
		});
    }
    catch(error){
        console.error("Error updating section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
    }
}

//delete section
exports.deleteSection = async(req,res) =>{
    try{
        //fetching the data
        const {courseId,sectionId} = req.body;
        
        //deleting the section
        await Section.findByIdAndDelete(sectionId);

        //deleting it from course section also
        const updatedCourse = await Course.findByIdAndUpdate(courseId,
                                                            {
                                                                $pull:{
                                                                courseContent:sectionId
                                                                }
                                                            },//showing the course here by populating it
                                                            {new:true}
                                                        ).populate({
                                                            path:"courseContent",
                                                            populate:{
                                                                path:"subSection"
                                                            }
                                                        })

        //return response
        return res.status(200).json({
            success:true,
            message:"Section Deleted Successfully"
        })
    }
    catch(error)
    {
        console.error("Error deleting section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
    }
}