async function queryFunction(query, final_query, res, connectionPool, error_msg, fail_msg, success_msg) {
    console.log("queryLoop");

    try {
        // Promisify the query execution
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
        await executeQuery(query); // Wait for the first query to complete

        // Execute the final query
        connectionPool.query(final_query, (error, results) => {
            if (error) {
                console.log(error_msg, error);
                if (!res.headersSent) {
                    return res.json({ success: false, message: error_msg });
                }
                
            }

            if (!results) {
                if (!res.headersSent) {
                    return res.json({ success: false, message: fail_msg });
                }
                
            }

            if (!res.headersSent) {
                return res.json({ success: true, body: results, message: success_msg });
            }
        });
    } catch (error) {
        console.log("queryFunction error", error_msg);
        if (!res.headersSent) {
            // Only send response if headers haven't been sent
            return res.json({ success: false, message: error_msg });
        }
    }
}

module.exports = queryFunction;
