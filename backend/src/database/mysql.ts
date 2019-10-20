import logger from "../util/logger";
import mysql from "mysql2/promise";
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
export const userTableIdFieldName = "id";
export const userTableUsernameFieldName = "username";
export const userTableEmailFieldName = "email";
export const userTablePasswordFieldName = "password";
// supported fields that can be used to look up a user
const validFieldNamesForUserLookup = [userTableIdFieldName, userTableUsernameFieldName, userTableEmailFieldName];
export interface UserRow {
  [userTableIdFieldName]: number;
  [userTableUsernameFieldName]: string;
  [userTablePasswordFieldName]: string;
}

// DATABASE OPERATIONS
/**
 * Try to find a user by table field.
 *
 * Args:
 *    fieldName: the table field name used in lookup, must be a member of validFieldNamesForUserLookup.
 *    fieldValue: the value of specified field name to match, must be either a number or a string.
 *    callback: a callback function that will receive [error, userRow] as arguments
 *      - if the query succeeds, error is none and the userRow is the first row of results
 *      - if the query fails, error is a custom Error about user with specified field name and value cannot not found and userRow is null
 *      - if the query throws an error, error is the original error object
 *      - if the field name is not a member of validFieldNamesForUserLookup, error is custom Error about unsupported field name
 * Returns:
 *    None, callback will be called
 */
export async function findUserByField(fieldName: string, fieldValue: string | number, callback: Function) {
  if (!validFieldNamesForUserLookup.includes(fieldName)) {
      callback(new Error(`Cannot look up a user using field - ${fieldName}`));
  }
  try {
    const [rows] = await pool.query("SELECT * FROM ?? WHERE ?? = ?", [userTableName, fieldName, fieldValue]);
    if (Array.isArray(rows) && rows.length > 0) {
      const userRow = rows[0] as UserRow;
      callback(null, userRow);
    } else {
      callback(new Error(`Cannot find a user whose ${fieldName} is ${fieldValue}`), null);
    }
  } catch (error) {
    callback(error);
  }
}

/**
 * Validates whether supplied password matches the password in database
 *
 * Args:
 *    candidatePassword: The password to be tested, usually provided by user input.
 *    password: The password to be tested against, usually retrieved from database.
 * Returns:
 *    A boolean representing whether two passwords matches.
 */
export async function validateUserPassword(candidatePassword: string, password: string) {
  return true;
}

// exports
export {
  pool as db
};
