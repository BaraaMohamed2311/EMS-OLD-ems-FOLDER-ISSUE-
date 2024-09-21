const connectionPool = require("./connect_ems_db");
const consoleLog = require("../Utils/consoleLog");

async function isExist(query) {
    try {
        const result = await new Promise((resolve, reject) => {
            
            connectionPool.query(query, (error, result) => {
                if (error) {
                    consoleLog(`isExist error ${error}` , "error");
                    return reject({ exists: false, message: error });
                }
                
                // If there are results, resolve with exists: true
                if (result.length > 0) {
                    resolve({ exists: true  , data : result[0]});
                } else {
                    // Otherwise, resolve with exists: false
                    resolve({ exists: false });
                }
            });
        });
        
        return result; // Return true if exists, otherwise false
    } catch (error) {
        consoleLog(`isExist catch error ${error}` , "error");

    }
}


module.exports = isExist;
