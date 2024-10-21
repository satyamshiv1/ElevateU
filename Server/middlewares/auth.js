
const jwt = require("jsonwebtoken")


//for authentication
exports.auth = async(req,res,next) =>{

    try{
        //fetching the token
        const {token} = req.cookies.token || req.body.token ||  req.header("Authorization").replace("Bearer","");

        if(!token)
        {
            return res.status(401).json({ 
                success: false, 
                message: `Token Missing` 
            });
        }
        //if token is present verify the token
        try{
            // Verifying the JWT using the secret key stored in environment variables
            const payload = jwt.verify(token,process.env.JWT_SECRET);
            console.log(payload);
            req.user = payload;
        }
        catch(error)
        {
            return res.status(401).json({ 
                success: false, 
                message: `Token is invalid Unauthorized response` 
            });
        }

        // If JWT is valid, move on to the next middleware or request handler
        next();
    }
    catch(error)
    {
        // If there is an error during the authentication process, return 401 Unauthorized response
		return res.status(401).json({
			success: false,
			message: `Something Went Wrong While Validating the Token`,
		});
    }
}

//checking authorization for isStudent
exports.isStudent = async(req,res,next) =>{
    try{
        if(req.user.accountType!=="Student")
        {
            return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Students",
			});
        }

        next();
    }
    catch(error){
        return res.status(500).json({ 
            success: false, 
            message: `User Role Can't be Verified` 
        });
    }
}

//checking authorization for isInstructor
exports.isInstructor = async(req,res,next) =>{
    try{
        if(req.user.accountType!=="Instructor")
        {
            return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Instructor",
			});
        }

        next();
    }
    catch(error){
        return res.status(500).json({ 
            success: false, 
            message: `User Role Can't be Verified` 
        });
    }
}

//checking authorization for isAdmin
exports.isAdmin = async(req,res,next) =>{
    try{
        if(req.user.accountType!=="Admin")
        {
            return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Admin",
			});
        }

        next();
    }
    catch(error){
        return res.status(500).json({ 
            success: false, 
            message: `User Role Can't be Verified` 
        });
    }
}