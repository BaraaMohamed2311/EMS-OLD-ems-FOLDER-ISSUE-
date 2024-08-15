const jwt = require("jsonwebtoken");


function jwtVerify(req , res , next){
    try{
        //accessing header
        const AuthHeader = req.headers.authorization;

        //extract token from header
        const token = AuthHeader.split(" ")[1];
        jwt.verify(token , process.env.SECRET_KEY);
        // execute next middleware
            next();
        }
    catch(err){
        console.log("Error checking token ",err);
        res.json({
            success:false,
            message:"Error Checking Token"
        })
    }
}

module.exports = jwtVerify;