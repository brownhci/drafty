import logger from "../util/logger";
import mysql from "mysql2/promise";
import { MysqlError } from "mysql";
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
   connectionLimit: 1000, // Maximum number of connection in pool.
   //debug: true,
   multipleStatements: true
});

// promisePool: MySQL2 exposes a .promise() function on Connections, 
// to "upgrade" an existing non-promise connection to use promise
// const promisePool = pool.promise(); // error cannot find promise

pool.getConnection()
  .then(conn => {
    logger.debug(`Congratulations! We have connected the ${DB_DATABASE} database!`);
    conn.release(); //release to pool
  })
  .catch(() => {
    logger.error(`Error connecting to database ${DB_DATABASE} from ${DB_HOST} as ${DB_USER} identified with ${DB_PASSWORD}`);
  });

// DATABASE OPERATIONS
/**
 * Logs a database operation error
 *
 * Args:
 *    error: A MysqlError.
 *    message: Additional custom message, default to empty.
 *    level: The level of logging, default to warning.
 * Returns:
 *    None, error will be logged.
 */
function logDatabaseError(error: MysqlError, message="", level="warn") {
  logger.log({
    level: level,
    message: `${error.code}: ${error.sqlMessage}${message ? " - " + message : ""}`
  });
}

// exports
export {
  pool as db,
  logDatabaseError as logDbErr
};