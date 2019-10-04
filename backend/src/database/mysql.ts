import mariadb from "mariadb";
import { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE } from "../util/secrets";

/**
 * This file provides interface to MySQL (MariaDB database), it will:
 *    - open a connection
 *    - define all operations relevant with the database
 *      <a href="https://mariadb.com/kb/en/library/connector-nodejs-promise-api/">mariadb Node.js Promise API</a>
 *
 *  In the end, you want to export all database operations so that it can be called from controllers.
 */

// create a pool of connection to database
const pool = mariadb.createPool({
   user: DB_USER,
   password: DB_PASSWORD,
   host: DB_HOST,
  database: DB_DATABASE,
  // connectionLimit: 5, // Maximum number of connection in pool.
});


// DATABASE OPERATIONS

// Provide one example of declaring one database operation using async / await
// TODO remove this when using for production
async function testConnection() {
  // pool.query is a shortcut to get a connection from pool, execute a query and release connection.
  // demonstrates a basic query
  await pool.query("SELECT NOW()")
      .then(rows => console.log(rows));

  // demonstrates how to write a multi-line query
  await pool.query(`
    CREATE TABLE IF NOT EXISTS books (
      BookID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
      Title VARCHAR(100) NOT NULL,
      SeriesID INT, AuthorID INT)
    `
  );
  // pool.batch is a shortcut to get a connection from pool, execute a batch and release connection.
  // demonstrates bulk inserts
  await pool.batch(`
    INSERT INTO books (Title,SeriesID,AuthorID) VALUES (?, ?, ?, ?)
  `, [
       ["The Fellowship of the Ring",1,1],
       ["The Two Towers",1,1],
       ["The Return of the King",1,1],
       ["The Sum of All Men",2,2],
       ["Brotherhood of the Wolf",2,2],
       ["Wizardborn",2,2],
       ["The Hobbbit",0,1]
  ]).then(
    res => console.log(res)
  );

  await pool.query("DROP TABLE IF EXISTS books");
}

// testing everything works
// TODO remove this when using for production
testConnection();


// exports
export { testConnection as databaseTestFunctionality };
