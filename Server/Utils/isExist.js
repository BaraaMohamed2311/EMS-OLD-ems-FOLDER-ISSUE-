const connectionPool = require("./connect_ems_db");
async function isExist(query) {
    try {
        const result = await new Promise((resolve, reject) => {
            connectionPool.query(query, (error, result) => {
                if (error) {
                    console.log("Error in isExist Query", error);
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
        
        console.log("result", result);
        return result; // Return true if exists, otherwise false
    } catch (error) {
        console.log("isExist error", error);
        throw new Error("Error in isExist function");
    }
}


module.exports = isExist;
