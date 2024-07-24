const mongoose = require("mongoose");

const userSchema= new mongoose.Schema({
    firstName:{
        type:"string",
        required:true,
        trim:true,
    },
    lastName:{
        type:"string",
        required:true,
        trim:true,
    },
    // Define the email field with type String, required, and trimmed
    email: {
        type: String,
        required: true,
        trim: true,
    },

    // Define the password field with type String and required
    password: {
        type: String,
        required: true,
    },
    // Define the role field with type String and enum values of "Admin", "Student", or "Visitor"
    accountType: {
        type: String,
        enum: ["Admin", "Student", "Instructor"],
        required: true,
    },
    additionalDetails:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Profile",
        required:true,
    },
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
        },
    ],
    image: {
        // type of image is string because it is a url.
        type: String,
        required: true,
    },
    courseProgress: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "courseProgress",
        },
    ],
})

module.exports = mongoose.model("User",userSchema);