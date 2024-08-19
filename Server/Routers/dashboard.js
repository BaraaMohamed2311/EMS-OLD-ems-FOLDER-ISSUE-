const router = require("express").Router();
const connectionPool = require("../Utils/connect_ems_db.js");
const queryFunction = require("../Utils/queryFunction.js")
const jwtVerify = require("../middlewares/jwtVerify.js")
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
                    return res.json({success:false, message:"Error Query Employees"})
                }
                // if no error but no employees
                if(!results)
                    return res.json({success:false, message:"No Employees Found"})
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
router.put("/update-employee",jwtVerify,async (req,res)=>{
    try{    
            // extracting id and rest of the data
        let { emp_id , ...restInfo } = req.body;

        // get keys and values to update certain key with certain value
        let entries = Object.entries(restInfo);


        /************************************************/
        let fields = ""
        // adding columns to be updated as col1 = newVal , col2 = newVal ....
        entries.forEach(([key,value] , indx) => {
            if(typeof value == 'string')
                fields += `${key} = "${value}"`
            if(indx !== entries.length - 1) fields += ','
        })
        // query mysql
        const query = `UPDATE employees SET ${fields} WHERE emp_id = ${emp_id}`;
        console.log("query" ,query )
            const final_query = `SELECT * FROM employees WHERE emp_id = ${emp_id}`
        /************************************************/
        
        // creating an array of promises for each update
        queryFunction( query , final_query ,
                        res , connectionPool ,
                        "Error Updating Employee" , "No User" , "Successfully Updated Employee");
        
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
router.delete("/delete-employee",jwtVerify,(req,res)=>{
    try{    
            const {emp_id,emp_email} = req.body
        connectionPool.query(`DELETE * WHERE emp_id = ${emp_id} OR emp_email = ${emp_email};`,
            (error, results)=>{
            if(error){
                return res.json({success:false, message:"Error Query Employees"})
            }
            return res.json({success:true , message:"Successfully Queried Employees"})
        }) 
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


