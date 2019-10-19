import logger from "../util/logger";
import mysql from "mysql2/promise";
import {RowDataPacket} from "mysql2";
import { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE } from "../util/secrets";

/**
 * This file provides interface to MySQL (MariaDB database), it will:
 *    - open a connection
 *    - define all operations relevant with the database
 *      <a href="https://github.com/sidorares/node-mysql2">MySQL2 Promise API</a>
 *
 *  In the end, you want to export all database operations so that it can be called from controllers.
 */

// create a pool of connection to database
const pool = mysql.createPool({
   user: DB_USER,
   password: DB_PASSWORD,
   host: DB_HOST,
   database: DB_DATABASE,
  // connectionLimit: 10, // Maximum number of connection in pool.
});

pool.getConnection()
    .then(conn => {
      logger.debug("Congratulations! We have connected the database!");
      conn.release(); //release to pool
    })
    .catch(() => {
      logger.error(`Error connecting to database ${DB_DATABASE} from ${DB_HOST} as ${DB_USER} identified with ${DB_PASSWORD}`);
    });

// DATABASE Table Names and Field Names
const userTableName = "Profile";
const userTableUserIdFieldName = "idProfile";
interface UserRow {
  [userTableUserIdFieldName: string]: number;
}

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
      SeriesID INT,
      AuthorID INT)
    `
  );
  // demonstrates bulk inserts
  await pool.query("INSERT INTO books (Title,SeriesID,AuthorID) VALUES ?", [
    [
       ["The Fellowship of the Ring", 1, 1],
       ["The Two Towers", 1, 1],
       ["The Return of the King", 1, 1],
       ["The Sum of All Men", 2, 2],
       ["Brotherhood of the Wolf", 2, 2],
       ["Wizardborn", 2, 2],
       ["The Hobbbit", 0, 1]
    ]
  ]).then(
    res => console.log(res)
  );

  await pool.query("DROP TABLE IF EXISTS books");
}

/**
 * Try to find a user by a numeric ID.
 *
 * Args:
 *    id: the id of the user to be looked up.
 *    callback: a callback function that will receive [error, userRow] as arguments
 *      - if the query succeeds, error is none and the userRow is the first row of results
 *      - if the query fails, error is a custom Error about user with specified id cannot not found
 *      - if the query throws an error, error is the original error object
 * Returns:
 *    None, callback will be called
 */
export async function findUserById(id: number, callback: Function) {
  try {
  const [rows] = await pool.query("SELECT * FROM ?? WHERE ?? = ?", [userTableName, userTableUserIdFieldName, id]);
    if (Array.isArray(rows) && rows.length > 0) {
      const userRow = rows[0] as UserRow;
      callback(null, userRow);
    } else {
      callback(new Error(`Database Query Error: Cannot find user with id ${id}`));
    }
  } catch (error) {
    callback(error);
  }
}

// exports
export { testConnection as databaseTestFunctionality };
