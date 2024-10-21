const Category = require("../models/Category.js")


//creation of Tags
exports.createCategory = async(req,res) =>{
    try{
        //fetching the name and desc. from body to create tag
        const {name,description} = req.body;

        //validating the data
        if (!name  || !description) {
			return res.status(400).json({ 
                success: false, 
                message: "All fields are required" 
            });
		}

        //create entry in dB
        const categoryDetails = await Category.create({
            name:name,
            description:description
        });
        console.log(categoryDetails);
        
        //returning successful response
        return res.status(200).json({
            success:true,
            message:"Tag created successfully"
        })
    }
    catch(error)
    {
        return res.status(500).json({
			success: true,
			message: error.message,
		});
    }
}

//get all tags together
exports.showAllCategory = async(req,res) =>{
    try{
        const allCategory = await Category.find({},{name:true,description:true});

        return res.status(200).json({
            success:true,
            allTags,
            message:"All Category returned successfully"
        })
    }
    catch(error){
        return res.status(500).json({
			success: true,
			message: error.message,
		});
    }

    
}