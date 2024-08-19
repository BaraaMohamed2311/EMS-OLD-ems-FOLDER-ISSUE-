const User = require("./User")

class Employee extends User {
    constructor(emp_email,role){
        super(emp_email,role);
        this.priority = 10; // we are going to use priority to check that user is editing people with lower or equal priority
    }

}



module.exports = Employee;