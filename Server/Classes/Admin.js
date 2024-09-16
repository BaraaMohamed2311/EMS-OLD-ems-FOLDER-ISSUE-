const User = require("./User");
const executeMySqlQuery = require("../Utils/executeMySqlQuery");
const stringifyFields = require("../Utils/stringifyFields");
const Roles = require("./Roles")
/*

Admin should be able to do


*/
class Admin extends User {
    static priority = 50; // we are going to use priority to check that user is editing people with lower or equal priority
    constructor(emp_email,role){
        super(emp_email,role);
        
    }
    getPriority(){
        return this.priority
    }
    // other user must be admin or less role, cannot be superAdmin
    static  EditOtherUser(emp_id , otherUserRole , entries){
    
        return new Promise(async (resolve , reject )=>{
            try{
                console.log("check roles in admin " ,this.priority ,Roles.getRolePriority(otherUserRole) ,this.priority >= Roles.getRolePriority(otherUserRole))
            if( this.priority >= Roles.getRolePriority(otherUserRole)){
                const fields = stringifyFields("joined",entries);
                const query = `UPDATE employees SET ${fields} WHERE emp_id = ${emp_id}`
                await executeMySqlQuery(query ,"Error Updating User Role");

                resolve(true);
            }
            else{
                console.log("Admins Cannot Edit Users With Higher Role");
                resolve(false);
            }
        } catch(err){
            console.error(err)
            reject(err)
        }
        })
       
        
    }
    // other user must be admin or less role, cannot be superAdmin
    async RemoveOtherUser(emp_id){
        if( this.priority >= Roles.getRolePriority(otherUserRole)){
            const fields = stringifyFields("joined",entries);
        // remove user data & refrenced role & perms
        const queries = [`DELETE FROM employees WHERE emp_id = ${emp_id}` , `DELETE FROM Perms WHERE emp_id = ${emp_id}` , `DELETE FROM Roles WHERE emp_id = ${emp_id}` ]
        const removeOtherUserPromises = [];
        queries.forEach((query)=>{
            const promise = new Promise(async (resolve , reject)=>{
                try{
                    const result = await executeMySqlQuery(query ,"Error Updating User Role" );
                    resolve(result);
                }
                catch(err){
                    reject(err);
                }
            })

            removeOtherUserPromises.push(promise);
            
        })
        console.log("removeOtherUserPromises FROM ADMIN",removeOtherUserPromises)
        Promise.allSettled(removeOtherUserPromises)
        }
        else{
            console.log("Admins Cannot Edit Users With Higher Role")
        }
    }
}


module.exports = Admin;