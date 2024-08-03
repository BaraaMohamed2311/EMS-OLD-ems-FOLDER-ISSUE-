const jwt = require("jsonwebtoken");


function jwtVerify(req , res , next){
    try{
        //accessing header
        const AuthHeader = req.headers.authorization;
        //extract token from header
        const token = AuthHeadre.split(" ")[1];
        jwt.verify(token , process.env.JWT_KEY);

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