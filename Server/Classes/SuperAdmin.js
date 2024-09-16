const User = require("./User");
const executeMySqlQuery = require("../Utils/executeMySqlQuery");
const stringifyFields = require("../Utils/stringifyFields");
const Roles = require("./Roles");
const Perms = require("./Perms");

/*

SuperAdmin should be able to do
- change role of other users
- see salary and edit it for other users
- edit or remove employees data

*/
class SuperAdmin extends User {
    static priority = 100;// we are going to use priority to check that user is editing people with lower or equal priority
    constructor({emp_id,emp_email,emp_name,emp_role , emp_salary , emp_abscence , emp_bonus , emp_rate , emp_position , emp_password}){
        super(emp_id,emp_email,emp_name,emp_role , emp_salary , emp_abscence , emp_bonus , emp_rate , emp_position , emp_password);
        
    }

    getPriority(){
        return this.priority
    }


    
    // this updates role_name field in Roles table
    static async ChangeOtherUserRole( emp_id , otherUserRole , newRole , otherUserEmail){
        return new Promise(async (resolve , reject )=>{
            try{

            // compares user modifier priority with other user's 
                if( this.priority >= Roles.getRolePriority(otherUserRole)){
                    /*
                        -if user role is employee then it doesn't exist in table and we have to add if only new role is not Employee
                        -if new role is Employee we remove from table 
                        -if else then we just change role
                    */
                    if(otherUserRole === "Employee" && newRole !== "Employee"){
                        const query = `INSERT INTO (emp_id , emp_email , role_name) VALUES (${emp_id},${otherUserEmail},${newRole})`
                        await executeMySqlQuery(query ,"Error Updating User Role");
                    }
                    else if(otherUserRole !== "Employee" && newRole === "Employee"){
                        const query = `DELETE FROM Roles  WHERE emp_id = ${emp_id}`
                        console.log("query from ChangeOtherUserRole",query)
                        await executeMySqlQuery(query ,"Error Updating User Role");
                    }
                    else{
                        const query = `UPDATE Roles SET role_name = ${`"${newRole}"`} WHERE emp_id = ${emp_id}`
                        console.log("query from ChangeOtherUserRole",query)
                        await executeMySqlQuery(query ,"Error Updating User Role");
                    }
                    
                
                    resolve(true);
                }
            else{
                console.log("SuperAdmins Cannot Edit Users With Higher Role");
                resolve(false);
            }
        } catch(err){
            reject()
        }
        })
    }

    
    // this updates emp_perms field in Perms table
    static async ChangeOtherUserPerms(emp_id , otherUserRole , StringOfPerms){
        return new Promise(async (resolve , reject )=>{
            try{
                
                if( this.priority >= Roles.getRolePriority(otherUserRole)){

                    // SET emp_perms = "StringOfPerms"
                    const query = `UPDATE Perms SET emp_perms = ${`"${StringOfPerms}"`} WHERE emp_id = ${emp_id}`
                    await executeMySqlQuery(query ,"Error Updating User Perms");
                
                resolve(true);
            }
            else{
                console.log("SuperAdmins Cannot Edit Users With Higher Role");
                resolve(false);
            }
        } catch(err){
            console.error(err)
            reject(err)
        }
        })
    }


    // this updates any data field in employees table
    static async EditOtherUser(emp_id , otherUserRole , entries){
        
        return new Promise(async (resolve , reject )=>{
            try{
                
            if( this.priority >= Roles.getRolePriority(otherUserRole)){
                
                const fields = stringifyFields("joined",entries);
                console.log("fields",fields)
                const query = `UPDATE employees SET ${fields} WHERE emp_id = ${emp_id}`
                await executeMySqlQuery(query ,"Error Updating Other User  Data" , "Success Updating Other User Data");
                
                resolve(true);
            }
            else{
                console.log("SuperAdmins Cannot Edit Users With Higher Role");
                resolve(false);
            }
        } catch(err){
            console.error(err)
            reject(err)
        }
        })
    }

    static async RemoveOtherUser(emp_id){
        const fields = stringifyFields("joined",entries);
        // remove user data & refrenced role & perms
        const queries = [`DELETE FROM employees WHERE emp_id = ${emp_id}` , `DELETE FROM Perms WHERE emp_id = ${emp_id}` , `DELETE FROM Roles WHERE emp_id = ${emp_id}` ]
        const removeOtherUserPromises = [];
        queries.forEach((query)=>{
            const promise = new Promise(async (resolve , reject)=>{
                try{
                    const result = await executeMySqlQuery(query ,"Error Updating User Role" , "Success Updating Role");
                    resolve(result);
                }
                catch(err){
                    reject(err);
                }
            })

            removeOtherUserPromises.push(promise);
            
        })
        console.log("removeOtherUserPromises FROM Super",removeOtherUserPromises)
        Promise.allSettled(removeOtherUserPromises)

        
        
    }
}

module.exports = SuperAdmin;