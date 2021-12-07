import { logDbErr } from '../mysql';
import mysql from 'mysql2/promise';
import { encryptPassword } from '../../util/encrypt';
import { DB_HOST, DB_USER, DB_PASSWORD } from '../../util/secrets';
import { tableName, idFieldName, passwordFieldName, passwordResetToken, passwordResetExpires } from '../../models/user';

const pool = mysql.createPool({
   user: DB_USER,
   password: DB_PASSWORD,
   host: DB_HOST,
   database: 'profs',
  // connectionLimit: 10, // Maximum number of connection in pool.
});

export async function hashPassword() {
  try {
    const [rows] = await pool.query('SELECT ??, passwordRaw FROM ?? WHERE passwordRaw IS NOT NULL', [idFieldName, tableName]);
    if (Array.isArray(rows) && rows.length > 0) {
      rows.forEach(async (row: any) => {
        const idProfile = row.idProfile;
        const rawPassword = row.passwordRaw;
        const encryptedPassword = await encryptPassword(rawPassword);
        await pool.query('UPDATE ?? SET password = ? WHERE ?? = ?', [tableName, encryptedPassword, idFieldName, idProfile]);
      });
    }
  } catch (error) {
    logDbErr(error, 'error during rehashing passwords', 'warn');
  }
}


export async function dropPasswordRaw() {
  try {
    const [rows] = await pool.query('ALTER TABLE ?? DROP COLUMN passwordRaw', [tableName]);
    console.log(rows);
  } catch (error) {
    logDbErr(error, 'error during dropping passwordRaw', 'warn');
  }
}

export async function addPasswordTokenColumn() {
  try {
    const [rows] = await pool.query('ALTER TABLE ?? ADD COLUMN ?? VARCHAR(1000) NULL AFTER ??', [tableName, passwordResetToken, passwordFieldName]);
    console.log(rows);
  } catch (error) {
    logDbErr(error, 'error during adding password token column', 'warn');
  }
}

export async function addPasswordExpirationColumn() {
  try {
    const [rows] = await pool.query('ALTER TABLE ?? ADD COLUMN ?? DATETIME NULL AFTER ??', [tableName, passwordResetExpires, passwordFieldName]);
    console.log(rows);
  } catch (error) {
    logDbErr(error, 'error during adding password token expiration column', 'warn');
  }
}
