const User = require("./User");
const {SuperRole} = new require("./Roles")
/*

SuperAdmin should be able to do
- change role of other users
- see salary and edit it for other users
- edit or remove employees data

*/
class SuperAdmin extends User {
    constructor(emp_email,role){
        super(emp_email,role);
        this.priority = 100; // we are going to use priority to check that user is editing people with lower or equal priority
    }

    

    ChangePermsRelatedWithRole(employee){
        Roles.addPerms()
        Roles.removePerms()
    }

    ChangeOtherUserRole(employee){
        
    }


    ChangeOtherUserPerms(employee){
        
    }

    EditOtherUser(employee){
        
    }

    RemoveOtherUser(employee){
        
    }
}

module.exports = SuperAdmin;