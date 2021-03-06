import { db, logDbErr } from "./mysql";
import { tableName, validFieldNamesForLookup, UserModel } from "../models/user";

// SQL Statements
const stmtSelUser: string    = "SELECT * FROM ?? WHERE ?? = ?";
const stmtInsertUser: string = "INSERT INTO ?? SET ?";
const stmtUpdateUser: string = "UPDATE ?? SET ? WHERE ?";
const stmtUpdateUserNewSignUp: string = "UPDATE users.Profile SET email = ?, password = ? WHERE idProfile = ?";
const stmtInsertSession: string = "INSERT INTO users.Session (idProfile,idExpressSession) VALUES (?,?);";
const stmtUpdateSession: string = "UPDATE users.Session SET idProfile = ? WHERE idSession = ?";

// Result type of findUserByField
export type findUserByFieldResultType = UserModel | null | undefined;
export type findUserByFieldCallbackType = (error: Error | null, user?: findUserByFieldResultType) => any;
/**
 * Try to find a user by table field.
 *
 * Args:
 *    fieldName: the table field name used in lookup, must be a member of validFieldNamesForLookup.
 *    fieldValue: the value of specified field name to match, must be either a number or a string.
 * Returns:
 *    [error, userRow]
 *      - if the query succeeds, error is none and the userRow is the first row of results
 *      - if the query fails, error is a custom Error about user with specified field name and value cannot not found and userRow is null
 *      - if the query throws an error, error is the original error object
 *      - if the field name is not a member of validFieldNamesForLookup, error is custom Error about unsupported field name
 */
export async function findUserByField(fieldName: string, fieldValue: string | number) {
  if (!validFieldNamesForLookup.includes(fieldName)) {
      return [new Error(`Cannot look up a user using field - ${fieldName}`)];
  }
  try {
    const [rows] = await db.query(stmtSelUser, [tableName, fieldName, fieldValue]);
    if (Array.isArray(rows) && rows.length > 0) {
      const userRow = rows[0] as UserModel;
      return [null, userRow];
    } else {
      return [new Error(`Cannot find a user whose ${fieldName} is ${fieldValue}`), null];
    }
  } catch (error) {
    logDbErr(error, "error during finding user", "warn");
    return [error];
  }
}

// Result type of createUser
/**
 * Save a new user in database
 *
 * Args:
 *    user: An object containing row fields to field values.
 * Returns:
 *    [error, results, fields]
 *      - receive [error] if the insertion fails
 *      - receive [null, results, fields] if the insertion succeeds
 */
export async function createUser(user: Partial<UserModel>) {
  try {
    const [results] = await db.query(stmtInsertUser, [tableName, user]);
    return [null, results];
  } catch (error) {
    logDbErr(error, "error during creating user", "warn");
    return [error];
  }
}

/**
 * Updates an existing user in database.
 *
 * Args:
 *    updates: an object of field name and values to be updated.
 *    constraints: an object of equalities between field name and field value.
 *    callback: A callback function that will either
 * Returns:
 *    [error, results, fields]
 *      - receive [error] if the insertion fails
 *      - receive [null, results, fields] if the update succeeds
 */
export async function updateUser(updates: Partial<UserModel>, constraints: Partial<UserModel>) {
  try {
    const [results, fields] = await db.query(stmtUpdateUser, [tableName, updates, constraints]);
    return [null, results, fields];
  } catch (error) {
    logDbErr(error, "error during updating existing user", "warn");
    return [error];
  }
}

// sw: this is just way simpler way to do things
export async function updateUserNewSignup(email: string, password: string, idProfile: number) {
  try {
    const [results, fields] = await db.query(stmtUpdateUserNewSignUp, [email, password, idProfile]);
    return [null, results, fields];
  } catch (error) {
    logDbErr(error, "error during updating existing user", "warn");
    return [error];
  }
}

// Result type of insertSession
/**
 * Save a new session in database
 *
 * Args:
 *    user: An object containing row fields to field values.
 * Returns:
 *    [error, results, fields]
 *      - receive [error] if the insertion fails
 *      - receive [null, results, fields] if the insertion succeeds
 */
export async function insertSession(idProfile: number, idExpressSession: string) {
  try {
    const [results] = await db.query(stmtInsertSession, [idProfile,idExpressSession]);
    return (results as any).insertId;
  } catch (error) {
    logDbErr(error, "error during creating session", "warn");
    return [error];
  }
}

/**
 * Update session in database after user login
 */
export async function updateSession(idProfile: number, idSession: number) {
  try {
    const [results] = await db.query(stmtUpdateSession, [idProfile, idSession]);
    return [results];
  } catch (error) {
    logDbErr(error, "error during updating session", "warn");
    return [error];
  }
}