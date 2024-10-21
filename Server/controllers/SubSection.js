const subSection = require("../models/SubSection.js")
const Section = require("../models/Section.js");
const { uploadVideoToCloudinary } = require("../utils/videoUploader.js");

//creating SubSection
exports.createSubSection = async(req,res) =>{
    try{
        //fetching the data
        const {sectionId,title,timeDuration,description} = req.body;

        //fetching the video files
        const video = req.files.videoFile

        //validation
         // Check if all necessary fields are provided
        if (!sectionId || !title || !description || !video) {
            return res
            .status(404)
            .json({ success: false, message: "All Fields are Required" })
        }
        console.log(video)

        //upload to cloudinary
        const uploadDetails = await uploadVideoToCloudinary(video,process.env.FOLDER_NAME)
        console.log(uploadDetails)

        // Create a new sub-section with the necessary information
        const SubSectionDetails = await SubSection.create({
                                                            title: title,
                                                            timeDuration: `${uploadDetails.duration}`,
                                                            description: description,
                                                            videoUrl: uploadDetails.secure_url,
                                                            })

        // Update the corresponding section with the newly created sub-section
        const updatedSection = await Section.findByIdAndUpdate(
                                                                { _id: sectionId },
                                                                { 
                                                                    $push: { 
                                                                        subSection: SubSectionDetails._id 
                                                                    } 
                                                                },
                                                                { new: true }
                                                              ).populate("subSection")

        // Return the updated section in the response
        return res.status(200).json({ success: true, data: updatedSection })
    } 
    catch (error) {
        // Handle any errors that may occur during the process
        console.error("Error creating new sub-section:", error)
        return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
        })
    }
}

//update sub section

exports.updateSubSection = async (req, res) => {
    try {
      const { sectionId, subSectionId, title, description } = req.body
      const subSection = await subSection.findById(subSectionId)
  
      if (!subSection) {
        return res.status(404).json({
          success: false,
          message: "SubSection not found",
        })
      }
  
      if (title !== undefined) {
        subSection.title = title
      }
  
      if (description !== undefined) {
        subSection.description = description
      }
      if (req.files && req.files.videoFile !== undefined) {
        const video = req.files.videoFile
        const uploadDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME)
        subSection.videoUrl = uploadDetails.secure_url
        subSection.timeDuration = `${uploadDetails.duration}`
      }
  
      await subSection.save()
  
      // find updated section and return it
      const updatedSection = await Section.findById(sectionId).populate(
        "subSection"
      )
  
      console.log("updated section", updatedSection)
  
      return res.json({
        success: true,
        message: "Section updated successfully",
        data: updatedSection,
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the section",
      })
    }
  }
  
  //deleted sub section
  exports.deleteSubSection = async (req, res) => {
    try {
      const { subSectionId, sectionId } = req.body
      await Section.findByIdAndUpdate(
        { _id: sectionId },
        {
          $pull: {
            subSection: subSectionId,
          },
        }
      )
      const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })
  
      if (!subSection) {
        return res
          .status(404)
          .json({ success: false, message: "SubSection not found" })
      }
  
      // find updated section and return it
      const updatedSection = await Section.findById(sectionId).populate(
        "subSection"
      )
  
      return res.json({
        success: true,
        message: "SubSection deleted successfully",
        data: updatedSection,
      })
    } 
    catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the SubSection",
      })
    }
  }