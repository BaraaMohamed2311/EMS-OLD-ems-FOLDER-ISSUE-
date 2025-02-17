// configuring dotenv to access variables
require('dotenv').config()

const mysql  = require('mysql2');

const connectionPool = mysql.createPool({
  host     :  process.env.DB_HOST,
  port     :  process.env.DB_PORT,
  user     : process.env.DB_USER,
  password : process.env.DB_PASSWORD,
  database : process.env.DB_NAME,
  connectionLimit: 10,
});

console.log("connectionPool",connectionPool)

//events for debugging and error handling
connectionPool.on('connection', (connection) => {
  console.log('A new connection was created.');
});

connectionPool.on('enqueue', () => {
  console.log('Waiting for an available connection slot.');
});

connectionPool.on('error', (err) => {
  console.error('An error occurred with the connection pool:', err);
});

module.exports = connectionPool;