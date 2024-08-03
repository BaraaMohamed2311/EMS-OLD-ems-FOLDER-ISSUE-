const router = require("express").Router();
const mysql = require("mysql");
const connectionPool = require("../Utils/connect_ems_db.js")
const jwtVerify = require("../Utils/jwtVerify")
const createToken = require("../Utils/createToken.js")
    // Login
    router.post("/login",async function(req , res){
        try {
            const {email , password} = req.body;
            console.log("req.body",req.body)
            await connectionPool.query(`SELECT * FROM employees WHERE emp_email = ${email}`,(err , result)=>{
                if(err){
                    res.json({
                        success:false,
                        message:"Error in Query DB"
                    })
                }
                // compare request's paswword with hashed password
                bcrypt.compare(password, process.env.saltRounds,async function(err, res) {
                    if(req.body.password != result.emp_password){
                      res.json({success: false, message: 'passwords do not match'});
                    } else {
                        const {emp_password ,...userInfo } = result;
                        const token = await createToken(userInfo.emp_id,userInfo.emp_email) ;
                        console.log("result",result,"token",token)
                        res.json({
                            success:false,
                            body:{userInfo , token},
                            message:"Error in Query DB"
                        })
                    }
                  });
                
            })
        }
        catch (err) {
            console.log("Error in ")
            res.json({
                success:false,
                message:"Error in "
            })
        }
    })

    // Register
    router.post("/register",function(){
        try {

        }
        catch (err) {
            console.log("Error in ")
            res.json({
                success:false,
                message:"Error in "
            })
        }
    })

    // forget password
    router.post("/forget-password",function(){
        try {

        }
        catch (err) {
            console.log("Error in ")
            res.json({
                success:false,
                message:"Error in "
            })
        }
    })

    // reset password
    router.post("/reset-password",function(){
        try {

        }
        catch (err) {
            console.log("Error in ")
            res.json({
                success:false,
                message:"Error in "
            })
        }
    })
    // private routes authentication
    router.post("/private-route",jwtVerify,function(){
        try {
            res.json({
                success:true,
                message:"User Authenticated"
            })
        }
        catch (err) {
            console.log("Error in ")
            res.json({
                success:false,
                message:"Error in Authenticating User"
            })
        }
    })

module.exports = router;