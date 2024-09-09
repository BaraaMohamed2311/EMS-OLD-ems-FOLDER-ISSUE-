const router = require("express").Router();
const jwtVerify = require("../middlewares/jwtVerify.js");
const User = require("../Classes/User.js");
const Perms = require("../Classes/Perms.js");
const SuperAdmin = require("../Classes/SuperAdmin.js");
const Admin = require("../Classes/Admin.js");
const stringifyFields = require("../Utils/stringifyFields.js");
const executeMySqlQuery = require("../Utils/executeMySqlQuery.js");
const JoinFiltering = require("../Utils/JoinFiltering.js");
/*Admins who can access dashboard page are 2 roles => read-only admin & full access admin*/

// GET Employees Data
router.get("/employees",jwtVerify,async (req,res)=>{
    try{
        const { pagination, size, emp_id, role_name, emp_perms, ...restFilters } = req.query;
        console.log("restFilters",restFilters)
    const Modifier_role = await User.getUserRole(emp_id, "Error Getting Role of modifier /employees");
    const Modifier_Perms = new Set(await User.getUserPerms(emp_id, "Error Getting Perms of modifier /employees"));
    console.log("Modifier_role", Modifier_role);

    if (Modifier_role === "Employee") {
        return res.json({ success: false, message: "Employee Role cannot access The Dashboard" });
    }


    /** Define Joining TYPE  **/
    // if we left joining no need to add on conditions as not all users are going to exist in employee and other tables
    const Roles_JOIN = !role_name || role_name === "Employee"  ? " LEFT JOIN Roles r ON e.emp_id = r.emp_id " : " JOIN Roles r ON e.emp_id = r.emp_id " ;
    const Perms_JOIN = emp_perms ? " JOIN Employee_Perms ep ON e.emp_id = ep.emp_id \n JOIN Perms p  ON ep.perm_id = p.perm_id " : "  LEFT JOIN Employee_Perms ep ON e.emp_id = ep.emp_id \n LEFT JOIN Perms p ON ep.perm_id = p.perm_id  ";

    /**  Filter Conditions **/
    const Rest_CONDITION = restFilters ? JoinFiltering(Object.entries(restFilters),"e") : "" ;
    const Roles_CONDITION = !role_name || role_name === "Employee" ? "" : JoinFiltering(Object.entries({role_name:role_name}),"r") ;
    // filtering gouped values on perms will be done using HAVING keyword & FIND_IN_SET which searches for string in string seperated by ", "
    const Perms_CONDITION = emp_perms ? `
            HAVING 
            FIND_IN_SET('${emp_perms}', GROUP_CONCAT(DISTINCT p.perm_name)) > 0 ` : "";

    console.log("Roles_CONDITION" , Roles_CONDITION ,"Perms_CONDITION" , Perms_CONDITION )
    /**  Is Accessible Conditions **/
    // default value of those columns would be '' if user doen't have their perms
    // logically if user have permission to modify salary then he could see it but other props like roles, perms he can see it anyway even with no role to modify
    const access_salary = (Modifier_Perms.has("Modify Salary") || Modifier_Perms.has("Display Salary")) ? " e.emp_salary, e.emp_bonus " : " '' AS emp_salary , '' AS emp_bonus "

    // Build the final query
    const query = `
      SELECT 
        e.emp_id, 
        e.emp_name, 
        COALESCE(NULLIF(GROUP_CONCAT(DISTINCT p.perm_name SEPARATOR ', '), ''), 'None') AS emp_perms, 
        COALESCE(NULLIF(r.role_name, ''), 'Employee') AS role_name, 
        e.emp_abscence, 
        e.emp_rate, 
        e.emp_position, 
        e.emp_email,
        ${access_salary} 
        FROM employees e 
        ${Roles_JOIN}
        ${Perms_JOIN}
        ${Roles_CONDITION || Rest_CONDITION ? " WHERE " : ""} /* roles filtering exists any way no need to check*/
        ${Rest_CONDITION}
        ${Roles_CONDITION && Rest_CONDITION ? " AND " : ""}
        ${Roles_CONDITION}
        GROUP BY /* so we could group rows instead of repeating for each new perm */
            e.emp_id, e.emp_name, r.role_name, e.emp_abscence, e.emp_rate, e.emp_position, e.emp_email, e.emp_salary, e.emp_bonus
        ${Perms_CONDITION}
        LIMIT ${size} OFFSET ${(pagination - 1) * size}`;
      console.log("query",query)
      const users = await executeMySqlQuery(query , "Error executing /employees dashboard GET");


    console.log("users",users)
      if( users && users.length > 0){
        res.json({success : true , body:users, message:"Successfully Fetched Data"})
      }
      else{
        res.json({success : false , message:"No Users Found !"})
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

/**
 * // Join Filtering is used to return filters refrenced to db as employees.emp_email = email_value
        const filters_employee_table = JoinFiltering(Object.entries(restFilters),"e");

        const filters_Roles_table = JoinFiltering(Object.entries({role_name:role_name}),"r");
        const filter_Perms_table = role_name !== "Employee" ? JoinFiltering(Object.entries({emp_perms:emp_perms}),"p") : " r.role_name != 'Admin' AND r.role_name != 'SuperAdmin' ";
        let All_filters = "";

        // if we filter using both role & data then we inner join to get shared data & roles only
        if(filters_employee_table && filters_Roles_table && filter_Perms_table){
            console.log("===================>filters_employee_table && filters_Roles_table && filter_Perms_table")
            All_filters = " JOIN Roles r ON e.emp_email = r.emp_email JOIN Perms p ON e.emp_id = p.emp_id  WHERE " + filters_employee_table + " AND " + filters_Roles_table

        }
        else if(filters_employee_table ){ 
            console.log("===================>filters_employee_table ")
            // if we filter using data only we left join to get all employees data even those who don't exist in Roles table and set default Employee Role
            All_filters = "LEFT JOIN Roles r ON e.emp_email = r.emp_email LEFT JOIN Perms p ON e.emp_id = r.emp_id WHERE " + filters_employee_table

        }
        else if(filters_Roles_table){ 
            console.log("===================>filters_Roles_table ")
            if(role_name !== "Employee"){
                // if filtering role is not employee we inner join cuz that means user is 100% exist in Roles table
                All_filters = " JOIN Roles r ON e.emp_email = r.emp_email LEFT JOIN Perms p ON e.emp_id = p.emp_id  WHERE " + filters_Roles_table
            }
            else{
                // if Employee and user that doesn't exist in Roles is by default an Employee  then we join but with no ON condition and filters_Roles_table is r.role_name != 'Admin' AND r.role_name != 'SuperAdmin' this include users who doesn't exist in Roles table
                All_filters = " LEFT JOIN Roles r  LEFT JOIN Perms p ON e.emp_id = p.emp_id  WHERE " + filters_Roles_table
            }
            

        }
        else if(filter_Perms_table){ 
            console.log("===================> filter_Perms_table")
            // if we filter using data only we inner join to only users with certain role
            All_filters = " JOIN Perms p ON e.emp_id = p.emp_id  WHERE " + filters_Roles_table

        }
        else if(!filters_employee_table && !filters_Roles_table && !filter_Perms_table){
            console.log("===================>!filters_employee_table && !filters_Roles_table && !filter_Perms_table")
            All_filters = "LEFT JOIN Roles r ON e.emp_email = r.emp_email LEFT JOIN Perms p ON e.emp_id = p.emp_id"
        }
 */



    /*
    Kinds of requests sent to /update-others

    - update user data then we check modifier perms and role and both  action & toUpdate must be MD
    - update user Role same goes but MR
    - update user Perms same but MP
    - update user Salary same but MS
    
    */
    router.put("/update-others",jwtVerify ,async function(req , res){
        try {   
                /*
                    -newRole is string of newRole that will be assigned to user
                    -newPerms is string of all perms will be set to user 
                   
                */
            // let & not const as we will delete emp_salary from userData if no perms
                let { modifier_id , emp_id , role_name : newRole, emp_perms : newPerms ,   ...userData} = req.body;
            // actions to decide which operation is executed otherwise it will do any operation related with first perm exists at user
                const {actions} = req.query;

                let final_message_respond = [];

                    // then modifier is different user 
                    const modifierRole = await User.getUserRole(modifier_id ,"Error Getting modifier Role");
            
                    const userRole = await User.getUserRole(emp_id ,"Error Getting user Role",  );

                    // if modifier have same role or higher and permession he can update others
                    const  modifierPerms = await User.getUserPerms(modifier_id ,"Error Getting modifier perms");
                    // create set instance of it 
                    let modifierSetPerms = new Perms(modifierPerms);
                    
                    /**********************************Data Update*********************************************/
                    if(actions.includes("MD") && modifierSetPerms.isPermExist("MD")){
                        // if modifier has MS do nothing if not remove emp_salary as he dont have access to edit it
                        userData = modifierSetPerms.isPermExist("MS") ? userData : delete userData.emp_salary ;
                        
                        if(modifierRole === "SuperAdmin"){
                            console.log("Object.entries(userData)",Object.entries(userData))
                            SuperAdmin.EditOtherUser(emp_id ,userRole , Object.entries(userData))
                            .then((succeeded)=>{
                                 
                                if(!succeeded){
                                    final_message_respond.push({success:false , message: "You Have To Be Admin Or SuperAdmin"})
                                }
                                }).catch(err =>{
                                    console.log("Error Updating other User as SuperAdmin " , err);
                                    final_message_respond.push({success:false , message: "Error Updating other User as SuperAdmin"})
                            })
                        }
                        else if (modifierRole === "Admin"){
                            
                            Admin.EditOtherUser(emp_id ,userRole , Object.entries(userData)  )
                            .then((succeeded)=>{
                                if(!succeeded){
                                    final_message_respond.push({success:false , message: "You Have To Be Admin Or SuperAdmin"})
                                }
                                
                            }).catch(err =>{
                                console.log("Error Updating other User as Admin " , err);
                                final_message_respond.push({success:false , message: "Error Updating other User as Admin "})
                            })
                        }
                        

                    }
                    else{ // when modifier doesn't have required perm
                        final_message_respond.push({success:false , message: "You Don't Have The Required Permession"})
                    }
                    /**********************************Role Update*********************************************/
                    if (actions.includes("MR")   && modifierSetPerms.isPermExist("MR")){
                        // Modidify Role
                        console.log("role is changed")
                        if(modifierRole === "SuperAdmin"){
          
                            SuperAdmin.ChangeOtherUserRole(emp_id,modifierRole,newRole , userData.emp_email)
                            .then((succeeded)=>{
                                if(!succeeded){
                                    final_message_respond.push({success:false , message: "You Have To Be SuperAdmin"})
                                }
                                
                            }).catch(err =>{
                                final_message_respond.push({success:false , message: "Error Updating other User as Admin"})
                            })
                        }
                        

                    } 
                    else{ // when modifier doesn't have required perm
                        final_message_respond.push({success:false , message: "You Don't Have The Required Permession"})
                    }

                    /**********************************Perms Update*********************************************/
                    if (actions.includes("MP")   && modifierSetPerms.isPermExist("MP")){
                        // Modidify Perms
                        if(modifierRole === "SuperAdmin"){
                            SuperAdmin.ChangeOtherUserPerms(emp_id , userRole , newPerms)
                            .then((succeeded)=>{
                                if(!succeeded){
                                    final_message_respond.push({success:false , message: "Your Are Not Allowed To Update User's Perms"})
                                }
                                
                            }).catch(err =>{
                                console.log("Error Updating other User as Admin " , err);
                                final_message_respond.push({success:false , message: "Error Updating other User as Admin "})
                            })
                        }
                        
                    }
                    else{ // when modifier doesn't have required perm
                        final_message_respond.push({success:false , message: "You Don't Have The Required Permession"})
                    }
                    console.log("final_message_respond",final_message_respond)
                res.json({success:true , location:"dashboard", messages : final_message_respond})
        }
        catch (err) {
            console.log("Error In Update Others Api Path " , err)
            res.json({
                success:false,
                message:"Error In Update Others Api Path "
            })
        }
    })


    

// Update Employee Data
router.delete("/delete-employee",jwtVerify,async (req,res)=>{
    try{    
            const {emp_id,emp_email} = req.body;
            let ModifierPermsSet = new Perms(await User.getUserPerms(emp_id , "Error Getting User Perm /delete-employee" , "Success Getting User Perm /delete-employee"));

            if(ModifierPermsSet.isPermExist("MD")){
                const query = `DELETE * WHERE emp_id = ${emp_id} OR emp_email = ${emp_email}`;
                const isDeleted = await executeMySqlQuery(query , "Error Delete Employee Quiery", "Success Delete Employee Quiery");

                if(isDeleted){
                    return res.json({success:true , message:  "User Deleted Successfully"})
                }
                else{   
                    return res.json({success:false , message:  "User Wasn't Deleted"})
                }
            }
            else{
                return res.json({success:false , message:  "You Don't Have The Permission To Delete"})
            }

        
             
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


