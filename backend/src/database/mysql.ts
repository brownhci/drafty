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
  [userTableEmailFieldName]: string;
  [userTablePasswordFieldName]: string;
}

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
// Result type of findUserByField
export type findUserByFieldResultType = UserRow | null | undefined;
export type findUserByFieldCallbackType = (error: Error | null, user?: findUserByFieldResultType) => any;
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
export async function findUserByField(fieldName: string, fieldValue: string | number, callback: findUserByFieldCallbackType) {
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
    logDatabaseError(error, "error during finding user", "warn");
    callback(error);
  }
}

// Result type of createUser
/**
 * Save a new user in database
 *
 * Args:
 *    user: An object containing row fields to field values.
 *    callback: A callback function that will either
 *      - receive [error] if the insertion fails
 *      - receive [null, results, fields] if the insertion succeeds
 * Returns:
 *    None, callback will be called.
 */
export async function createUser(user: Partial<UserRow>, callback: Function) {
  try {
    const [results, fields] = await pool.query("INSERT INTO ?? SET ?", [userTableName, user]);
    callback(null, results, fields);
  } catch (error) {
    logDatabaseError(error, "error during creating user", "warn");
    callback(error);
  }
}

/**
 * Updates an existing user in database.
 *
 * Args:
 *    updates: an object of field name and values to be updated.
 *    constraints: an object of equalities between field name and field value.
 *    callback: A callback function that will either
 *      - receive [error] if the insertion fails
 *      - receive [null, results, fields] if the update succeeds
 * Returns:
 *    None, callback will be called.
 */
export async function updateUser(updates: Partial<UserRow>, constraints: Partial<UserRow>, callback: Function) {
  try {
    const [results, fields] = await pool.query("UPDATE ?? SET ? WHERE ?", [userTableName, updates, constraints]);
    callback(null, results, fields);
  } catch (error) {
    logDatabaseError(error, "error during updating existing user", "warn");
    callback(error);
  }
}

/**
 * Deletes an existing user in database.
 *
 * Args:
 *    constraints: an object of equalities between field name and field value, only the row matching
 *      these constraints will be deleted.
 *    callback: A callback function that will either
 *      - receive [error] if the insertion fails
 *      - receive [null, results, fields] if the delete succeeds
 * Returns:
 *    None, callback will be called.
 */
export async function deleteUser(constraints: Partial<UserRow>, callback: Function) {
  try {
    const [results, fields] = await pool.query("DELETE FROM ?? WHERE ? LIMIT 1", [userTableName, constraints]);
    callback(null, results, fields);
  } catch (error) {
    logDatabaseError(error, "error during deleting user", "warn");
    callback(error);
  }
}
// exports
export {
  pool as db
};
