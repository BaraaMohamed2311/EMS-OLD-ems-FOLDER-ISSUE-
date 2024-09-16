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
                console.log("--------------- can change Role ---------------",this.priority >= Roles.getRolePriority(otherUserRole))
            // compares user modifier priority with other user's 
                if( this.priority >= Roles.getRolePriority(otherUserRole)){
                    /*
                        if Role was Employee and new Role is not then we add user with new Role
                        if both not Employee we only need to update

                    */
                    if(otherUserRole === "Employee" && newRole !== "Employee"){
                        const query = `INSERT INTO Roles (emp_id , emp_email , role_name) VALUES (${emp_id},'${otherUserEmail}','${newRole}')`
                        await executeMySqlQuery(query ,"Error Updating User Role");
                    }
                    else if(otherUserRole !== "Employee" && newRole !== "Employee"){
                        const query = `UPDATE Roles SET role_name = '${newRole}' WHERE emp_id = ${emp_id}`
                        await executeMySqlQuery(query ,"Error Updating User Role");
                    }
                    else{
                        const query = `DELETE FROM Roles  WHERE emp_id = ${emp_id}`
                        await executeMySqlQuery(query ,"Error Updating User Role");
                    }
                    
                
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

    
    // this updates emp_perms field in Perms table
    static async ChangeOtherUserPerms(emp_id , otherUserRole , StringOfNewPerms , oldUserPermsSet){
        
        console.log("eeeeeeeeeeeexxxxxxxxxxxxxxxxxxxxxx")
        console.log("parameters" , emp_id , otherUserRole , StringOfNewPerms , oldUserPermsSet)
        return new Promise(async (resolve , reject )=>{
            try{
                console.log("check priority role" , this.priority >= Roles.getRolePriority(otherUserRole))
                if( this.priority >= Roles.getRolePriority(otherUserRole)){
                    // fetch map hash of perms and their ids
                    const permsHash =  await Perms.getAllPermsInTable();
                    console.log("permsHash" ,permsHash)
                    const newPermsArray = StringOfNewPerms.split(", ");
                    const newPermsSet = new Set(newPermsArray);
                    console.log("newPermsSet" ,newPermsSet)
                    // if user had old perms we delete those deleted 
                    if(!oldUserPermsSet.has("None")){
                        let deletePermsIDS = [];

                        // only add id of perm to be deleted if it's not in old perms
                        Array.from(oldUserPermsSet).forEach((oldPerm , indx)=>{
                            if(!newPermsSet.has(oldPerm)){
                                deletePermsIDS.push(` ${permsHash.get(oldPerm)}  `);
                            }
                        })
                        
                        // if there is perms to delete execute query
                        if(deletePermsIDS.length > 0){
                            // First we delete all perms related with user
                            const deleteQuery = `DELETE FROM  Employee_Perms WHERE emp_id = ${emp_id} AND perm_id IN ( ${deletePermsIDS.join(",")} )` 
                            console.log("deleteQuery",deleteQuery)
                            await executeMySqlQuery(deleteQuery,"Error Deleting User Perms");
                        }
                        
                    }

                    // no new perms will be added to user
                    if(StringOfNewPerms === "None") return resolve(true); 
                    
                    
                    let addingPermsQuery = [];
                    

                    // if perm wasn't exist in old perms and exists in all hashed perms then insert it 
                    StringOfNewPerms.split(", ").forEach((perm)=>{
                        if(permsHash.has(perm) && !oldUserPermsSet.has(perm))
                            addingPermsQuery.push(`(${emp_id},${permsHash.get(perm)})`); // to get perm id
                    })

                    if(addingPermsQuery.length > 0)
                     await executeMySqlQuery("INSERT INTO Employee_Perms (emp_id , perm_id) VALUES" + addingPermsQuery.join(",") ,"Error Updating User Perms");
                
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