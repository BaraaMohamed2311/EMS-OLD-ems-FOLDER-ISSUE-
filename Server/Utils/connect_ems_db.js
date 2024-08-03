// configuring dotenv to access variables
require('dotenv').config()
const mysql  = require('mysql');

const connectionPool = mysql.createPool({
  host     : 'localhost',
  port:3307,
  user     : 'root',
  password : process.env.DB_PASSWORD,
  database : 'ems_db'
});

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