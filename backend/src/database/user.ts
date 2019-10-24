import { db, logDbErr } from "./mysql";
import async from "async";

// DATABASE Table Names and Field Names
const tableName: string = "Profile";

export const idFieldName       = "id";
export const usernameFieldName = "username";
export const emailFieldName    = "email";
export const passwordFieldName = "password";

// supported fields that can be used to look up a user
const validFieldNamesForLookup = [idFieldName, usernameFieldName, emailFieldName];

export interface UserModel {
  [idFieldName]: number;
  [usernameFieldName]: string;
  [emailFieldName]: String;
  [passwordFieldName]: string;
}

// Result type of findUserByField
export type findUserByFieldResultType = UserModel | null | undefined;
export type findUserByFieldCallbackType = (error: Error | null, user?: findUserByFieldResultType) => any;
/**
 * Try to find a user by table field.
 *
 * Args:
 *    fieldName: the table field name used in lookup, must be a member of validFieldNamesForLookup.
 *    fieldValue: the value of specified field name to match, must be either a number or a string.
 *    callback: a callback function that will receive [error, userRow] as arguments
 *      - if the query succeeds, error is none and the userRow is the first row of results
 *      - if the query fails, error is a custom Error about user with specified field name and value cannot not found and userRow is null
 *      - if the query throws an error, error is the original error object
 *      - if the field name is not a member of validFieldNamesForLookup, error is custom Error about unsupported field name
 * Returns:
 *    None, callback will be called
 */
export async function findUserByField(fieldName: string, fieldValue: string | number, callback: findUserByFieldCallbackType) {
  if (!validFieldNamesForLookup.includes(fieldName)) {
      callback(new Error(`Cannot look up a user using field - ${fieldName}`));
  }
  try {
    const [rows] = await db.query("SELECT * FROM ?? WHERE ?? = ?", [userTableName, fieldName, fieldValue]);
    if (Array.isArray(rows) && rows.length > 0) {
      const userRow = rows[0] as UserModel;
      callback(null, userRow);
    } else {
      callback(new Error(`Cannot find a user whose ${fieldName} is ${fieldValue}`), null);
    }
  } catch (error) {
    logDbErr(error, "error during finding user", "warn");
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
export async function createUser(user: Partial<UserModel>, callback: Function) {
  try {
    const [results, fields] = await db.query("INSERT INTO ?? SET ?", [userTableName, user]);
    callback(null, results, fields);
  } catch (error) {
    logDbErr(error, "error during creating user", "warn");
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
export async function updateUser(updates: Partial<UserModel>, constraints: Partial<UserModel>, callback: Function) {
  try {
    const [results, fields] = await db.query("UPDATE ?? SET ? WHERE ?", [userTableName, updates, constraints]);
    callback(null, results, fields);
  } catch (error) {
    logDbErr(error, "error during updating existing user", "warn");
    callback(error);
  }
}