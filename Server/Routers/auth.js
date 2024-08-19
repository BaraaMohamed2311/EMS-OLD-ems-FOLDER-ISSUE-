const router = require("express").Router();
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const connectionPool = require("../Utils/connect_ems_db.js")
const jwtVerify = require("../middlewares/jwtVerify.js")
const createToken = require("../Utils/createToken.js");
const queryFunction = require("../Utils/queryFunction.js")
const isExist = require("../Utils/isExist.js")
    // Login
    router.post("/login", async function(req, res) {
        try {
            // Extract request data
            const { emp_email, password } = req.body;
    
            // Query db
            connectionPool.query(`SELECT * FROM employees WHERE emp_email = ?`, [emp_email], async (err, result) => {
                if (err) {
                    console.log("err", err);
                    return res.json({
                        success: false,
                        message: "Error in Query DB"
                    });
                }
    
                if (result.length === 0) {
                    return res.json({
                        success: false,
                        message: "User not found"
                    });
                }
    
                const user = result[0];
    
                // Compare request's password with hashed password
                const match = await bcrypt.compare(password, user.emp_password);
                if (!match) {
                    return res.json({
                        success: false,
                        message: 'Passwords Do Not Match'
                    });
                }

    
                const { emp_password, ...userInfo } = user;
                const token = await createToken(userInfo.emp_id, userInfo.emp_email);
    

                // Send response with user data with token added and without password
                return res.json({
                    success: true,
                    body: { ...userInfo, token },
                    message: "Successful Login"
                });
            });
            
        } catch (err) {
            console.log("Error in Logining", err);
            res.json({
                success: false,
                message: "Error in Logining"
            });
        }
    });

    // Register
    router.post("/register",async function(req , res){
        try {
    
                let user = req.body;
        
                console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
                const check_unregistered_table = await isExist(`SELECT * FROM unregistered_employees WHERE emp_email = "${user.emp_email}"`);
                const check_employees_table = await isExist(`SELECT * FROM employees WHERE emp_email = "${user.emp_email}"`);
                
        
                console.log("check_employees_table", check_employees_table, "check_unregistered_table", check_unregistered_table);
        
                if (check_unregistered_table) {
                    return res.json({ success: false, message: "User Already staged & Waiting For Approval" });
                } else if (check_employees_table) {
                    return res.json({ success: false, message: "User Already Registered & Approved" });
                } 
                /* If user is not staged or registered before we start registering it */
            const saltRounds = 12;
            let hashed_password = await bcrypt.hash(user["emp_password"], saltRounds);
            // assign hashed to user before preparing for inserting into db 
            user["emp_password"] = hashed_password
            // make entries array of hashed user
            let request_entries = Object.entries(user);
            /***************************************/ 
            
            let columns_field = "";
            let values_field = "";
            request_entries.forEach(([key , value ],indx)=>{
                columns_field += key;
                
                if(typeof value == 'string'){
                    // make sure to add the hashed password to db and not the original
                    values_field += `"${value}"`
                }
                if(indx !== request_entries.length - 1){
                    columns_field += ",";
                    values_field += ","
                }
                    
            })
            /***************************************/ 
  
            // this time we insert to unregistered_employees where they are staged & waiting for approval
            const query = `INSERT INTO unregistered_employees (${columns_field}) VALUES (${values_field})`
            // we cannot use id to select user before regestering so we use email as it's also unique
            const final_query = `SELECT * FROM employees WHERE emp_email = "${user.emp_email}";`;

            queryFunction( query , final_query ,
                res , connectionPool ,
                "Error Registering Employee" , "" , "Successfully Staged Employee Wait For Approval");
        
        }
        catch (err) {
            console.log("Error In Registering New User" ,err)
            res.json({
                success:false,
                message:"Error In Registering New User"
            })
        }
    })

    // forget password
    router.post("/forget-password",function(){
        try {

        }
        catch (err) {
            console.log("Error In Forgot Password Path ")
            res.json({
                success:false,
                message:"Error In Forgot Password Path "
            })
        }
    })

    // reset password
    router.put("/reset-password",function(){
        try {

        }
        catch (err) {
            console.log("Error In Forgot Reset Password Path ")
            res.json({
                success:false,
                message:"Error In Forgot Reset Password Path "
            })
        }
    })
    // private routes authentication
    router.post("/private-route",jwtVerify,function(req , res){
        try {
            res.json({
                success:true,
                message:"User Authenticated"
            })
        }
        catch (err) {
            console.log("Error In Private Route")
            res.json({
                success:false,
                message:"Error In Private Route"
            })
        }
    })

module.exports = router;