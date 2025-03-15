// const mysql = require("mysql2");

// // Existing database connection pool (sql_project)
// const sqlProjectPool = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "sql_project",
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

// const db = sqlProjectPool.promise();

// // New database connection pool (run_query)
// const runQueryPool = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "sql_project_run_query",
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

// const db_query = runQueryPool.promise();

// // Export both database connection pools
// module.exports = {
//   db,
//   db_query,
// };



const mysql = require("mysql2");
require("dotenv").config();

// First database connection (sql_project)
const sqlProjectPool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  waitForConnections: true,
  connectionLimit: 100, // Increased for handling 10,000 users
  queueLimit: 0,
});

// Second database connection (sql_project_run_query)
const runQueryPool = mysql.createPool({
  host: process.env.MYSQLHOST_RUN,
  user: process.env.MYSQLUSER_RUN,
  password: process.env.MYSQLPASSWORD_RUN,
  database: process.env.MYSQLDATABASE_RUN,
  port: process.env.MYSQLPORT_RUN,
  waitForConnections: true,
  connectionLimit: 100, // Increased for handling 10,000 users
  queueLimit: 0,
});

// Export both database connections
const db = sqlProjectPool.promise();
const db_query = runQueryPool.promise();

module.exports = { db, db_query };
