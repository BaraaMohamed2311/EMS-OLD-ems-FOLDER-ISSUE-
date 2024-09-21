const executeMySqlQuery = require("../Utils/executeMySqlQuery");

class Perms {
    // because no need to create instances we make them static and access through class
     
    /* 
       "AR" => Accept Registered User
       "MD" => Modify Data Users
       "MR" => Modify Role
       "MP" => Modify Perms
       "MS" => Modify Salary
       */

       constructor(arrayOfPerms){
        this.perms = new Set(arrayOfPerms);
       }

       static async getAllPermsInTable(){
            const query = "SELECT * FROM Perms";
            // declare as let to use map and edit elements
            const PermsObjects =  await executeMySqlQuery(query , "Error Getting All Perms From Table");
            let Perms2DArray = [];
            PermsObjects.forEach((perm)=> Perms2DArray.push([perm.perm_name , perm.perm_id]));
            return new Map(Perms2DArray); // return hashing of all perms with it's id 
       }
     
     isPermExist(perm){
        return this.perms.has(perm)
    }

}


module.exports =  Perms // export an instance
