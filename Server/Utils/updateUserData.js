async function updateUserData(query, connectionPool, error_msg, success_msg) {
    console.log("queryLoop");

    try {
        // we use promise to get returned results from resolve
        const executeQuery = (query) => {
            return new Promise((resolve, reject) => {
                connectionPool.query(`${query};`, (error, results) => {
                    if (error) {
                        console.log(error_msg, error);
                        return reject(error); // Reject on error
                    }
                    resolve(results); // Resolve if no error
                });
            });
        };

        // Execute the first query
        const result = await executeQuery(query); // Wait for the first query to complete
        console.log(success_msg , result)
        return result;
    } catch (error) {
        console.log("queryFunction error", error_msg);

    }
}

module.exports = updateUserData;
