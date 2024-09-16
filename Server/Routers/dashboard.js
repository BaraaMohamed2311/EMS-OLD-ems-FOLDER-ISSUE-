const jwtVerify = require("../middlewares/jwtVerify");
const executeMySqlQuery = require("../Utils/executeMySqlQuery");

const router = require("express").Router();



/**           Get User Image           **/
// if user doesn't exist create it
  router.get("/main" ,jwtVerify,async (req,res)=>{
    try{ 
        const GetNumOfEmps = `SELECT COUNT(*) as count ,SUM(emp_abscence) as abscence , SUM(emp_salary) as salaries , SUM(emp_bonus) as bonus  FROM employees`;
        const GetNumOfSuperAdmins = `SELECT COUNT(*) as count FROM employees e JOIN Roles r ON e.emp_id = r.emp_id WHERE r.role_name = 'SuperAdmin' `;
        const GetNumOfAdmins = `SELECT COUNT(*) as count FROM employees e JOIN Roles r ON e.emp_id = r.emp_id WHERE r.role_name = 'Admin'`;


        const NumOfEmps = await executeMySqlQuery(GetNumOfEmps,"Error Getting Num Of Emps");
        const NumOfSuperAdmins = await executeMySqlQuery(GetNumOfSuperAdmins,"Error Getting Num Of Emps");
        const NumOfAdmins = await executeMySqlQuery(GetNumOfAdmins,"Error Getting Num Of Emps");


        if(NumOfEmps[0] && NumOfSuperAdmins[0] && NumOfAdmins[0] )
            res.json({success: true , body:{
                        numOfEmployees : NumOfEmps[0].count,
                        numOfSuperAdmins : NumOfSuperAdmins[0].count,
                        numOfAdmins : NumOfAdmins[0].count,
                        totalAbscence :NumOfEmps[0].abscence,
                        totalSalariesPaid :NumOfEmps[0].salaries,
                        totalBonusPaid :NumOfEmps[0].bonus
                    }, message:"Successful Get Data Dashboard" });
        else{
            res.json({success: false , message:"Something Went Wrong" });
        }
    }
    catch(err){
        console.error("Error GET Dashboard Data",err);
        res.json({
            success:false,
            message:"Error GET Dashboard Data"
        })
    }
})




module.exports = router;