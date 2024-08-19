class Roles {
    constructor (roleName, arrOfPerms){
        this.role = roleName;
        this.permissions = new Set(arrOfPerms); // set for easy access & unque perms
    }


    getRole(){
        return this.role
    }

    getPerms(){
        return this.permissions
    }

    addPerm(perm){
        this.permissions.add(perm);
    }

    removePerm(perm){
        this.permissions.delete(perm);
    }

}


const SuperRole =new Roles("Super",["Modify-Perms","Modify-Role","Modify-User","Modify-Salary", "Remove-User"]) ;
const AdminRole = new Roles("Admin",["Modify-User", "Remove-User"]);
const EmployeeRole = new Roles("Employee",[]);



module.exports = {SuperRole , AdminRole , EmployeeRole};
