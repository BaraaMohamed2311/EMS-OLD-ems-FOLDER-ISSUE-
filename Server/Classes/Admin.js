const User = require("./User")
/*

Admin should be able to do


*/
class Admin extends User {
    constructor(emp_email,role){
        super(emp_email,role);
        this.priority = 50; // we are going to use priority to check that user is editing people with lower or equal priority
    }

    // other user must be admin or less role, cannot be superAdmin
    EditOtherUser(employee){
        
    }
    // other user must be admin or less role, cannot be superAdmin
    RemoveOtherUser(employee){
        
    }
}


module.exports = Admin;