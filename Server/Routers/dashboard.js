const router = require("express").Router();
const connectionPool = require("../Utils/connect_ems_db.js")
const jwtVerify = require("../Utils/jwtVerify")
/*Admins who can access dashboard page are 2 roles => read-only admin & full access admin*/

// GET Employees Data
router.get("/employees",async (req,res)=>{
    try{
        const {pagination ,size } = req.query;
        let cachedPages = new Set();
        if(!cachedPages.has(pagination)){
            cachedPages.add(pagination)
        // gets all data as chuncks / (pagination - 1) so when page is 1 in table the OFFSET is 0
            await connectionPool.query(`SELECT * FROM employees LIMIT ${size}  OFFSET ${(pagination - 1) * size} `,
                (error, results)=>{
                if(error){
                    res.json({success:false, message:"Error Query Employees"})
                }
                // if no error but no employees
                if(!results)
                    res.json({success:false, message:"No Employees Found"})
                /**/
                res.json({success:true, body:results , message:"Successfully Queried Employees"})
            }) 
        }
        else{
            // we don't query as currpage is cached at the front end
            res.json({success:true, message:"Successfully Queried Employees"})
        }
    }
    catch(err){
        console.log("Error Dashbord Employees Profile Data",err);
        res.json({
            success:false,
            message:"Error Dashbord Employees Data"
        })
    }
})


// Update Employee Data
router.put("update-employee",jwtVerify,(req,res)=>{
    try{

        connectionPool.query(``,
            (error, results)=>{
            if(error){
                res.json({success:false, message:"Error Query Employees"})
            }
            res.json({success:true, body:results , message:"Successfully Queried Employees"})
        }) 
    }
    catch(err){
        console.log("Error Update Employee Data");
        res.json({
            success:false,
            message:"Error Update Employee Data"
        })
    }
})

// Update Employee Data
router.delete("delete-employee",jwtVerify,(req,res)=>{
    try{

    }
    catch(err){
        console.log("Error Delete Employee Data");
        res.json({
            success:false,
            message:"Error Delete Employee Data"
        })
    }
})


module.exports = router;