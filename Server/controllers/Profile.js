const User = require("../models/User.js")
const Profile = require("../models/Profile.js")

//updating the profile because we have created it at the time of signup
exports.updateProfile= async(req,res) =>{
    try{
        //fetching the profile data
        const {firstName="", lastName="", dateOfBirth="", about="", contactNumber="", gender=""} = req.body;

        //get UserId and its details
        const userId = req.user.id;
        const userDetails = User.findById(userId);
        console.log("User details for profile updation", userDetails);

        //get profileId and profileDetails
        const profileId = userDetails.accountType;
        const profileDetails = Profile.findById(profileId);
        console.log("Profile Details = ",profileDetails);

        //validation
        if(!userDetails || !profileDetails){
            return res.status(400).json({
                success:false,
                message:"user details or profile details can't be fetched"
            })
        }

        if(firstName){
            userDetails.firstName= firstName;
        }
        if(lastName){
            userDetails.lastName= lastName;
        }
        //saving the details to database
        await userDetails.save();

         // Update the profile fields
        profileDetails.dateOfBirth = dateOfBirth
        profileDetails.about = about
        profileDetails.contactNumber = contactNumber
        profileDetails.gender = gender

        //saving the details to database
        await profileDetails.save();

        //updatedUserDetails have to be save to transfer in response
        const updatedUserDetails = userDetails.populate("additionalDetails").exec();

        //return response
        return res.json({
            success: true,
            message: "Profile updated successfully",
            updatedUserDetails,
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            error:error.message,    
        })
    }
}

//delete account
//explore how can we schedule this deletion operation
exports.deleteAccount = async(req,res) =>{
    try{
        //get id
        const id = req.user.id

        //validation
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(404).json({
                success: false,
                message: "User not found",
              })
        }
        
        //Delete associated profile with the user
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
        
        //TODO- unenroll user from all enrolled courses
        //delete user
        await User.findByIdAndDelete({_id:id});

        //response
        res.status(200).json({
            success: true,
            message: "User deleted successfully",
          })
    }
    catch(error)
    {
        console.log(error)
        return res
            .status(500)
            .json({ success: false, message: "User Cannot be deleted successfully" })
    }
}

exports.getAllUserDetails = async (req, res) => {
    try {
      const id = req.user.id
      const userDetails = await User.findById(id)
        .populate("additionalDetails")
        .exec()
      console.log(userDetails)
      res.status(200).json({
        success: true,
        message: "User Data fetched successfully",
        data: userDetails,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }