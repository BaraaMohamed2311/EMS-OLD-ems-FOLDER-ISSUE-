
/*Any user can get his data or modify it */
const connectionPool = require("../Utils/connect_ems_db");
const stringifyFields = require("../Utils/stringifyFields");
const updateUserData = require("../Utils/updateUserData")
class User {
    constructor(emp_email,role){
       
        this.emp_email = emp_email ;
        this.role = role;
        this.emp_name = emp_name ;
        this.emp_salary = emp_salary  ;
        this.emp_abscence = emp_abscence ;
        this.emp_bonus = emp_bonus ;
        this.emp_rate = emp_rate ;
        this.emp_position = emp_position ;
        this.emp_password = emp_password ;
     
        }


    editUserData(emp_email ,entries){
        // to get convert entries into field = val , field = val
        const fields = stringifyFields("joined",entries);
        // update data query
        const query = `UPDATE employees SET ${fields} WHERE emp_email = ${emp_email};`
        console.log("editUserData",query)
        // update in db
        updateUserData(query ,connectionPool, "Error editUserData Method", "Success Editing User Data")

    }

    getUserRole(emp_email){
        
    }

    getUserPerms(emp_email){
        
    }

    extractUserfields(keysToBeExtracted){
        // to extract fields like emp_password & emp_salary if needed
        //this will be for privacy when returning res to client side only , so no need to change anything in db
        for(const key of keysToBeExtracted){
            this[key] = null; // set them to null
        }
    }

}


module.exports = User;