import { logDbErr } from "../mysql";
import mysql from "mysql2/promise";
import { DB_HOST, DB_USER, DB_PASSWORD } from "../../util/secrets";

const pool = mysql.createPool({
   user: DB_USER,
   password: DB_PASSWORD,
   host: DB_HOST,
   database: "csprofessors",
  // connectionLimit: 10, // Maximum number of connection in pool.
});

const sqlGetCookiesWithEmails = `
SELECT session_id, data FROM users.sessions WHERE data LIKE '%@%';
`;

export async function getCookiesWithEmails() {
  try {
    const [rows] = await pool.query(sqlGetCookiesWithEmails);
    if (Array.isArray(rows) && rows.length > 0) {
      rows.forEach(async (row: any) => {
        // TODO read through emails
        const session_id = row.session_id;
        const cookie = row.data; // JSON
      });
    }
  } catch (error) {
    logDbErr(error, "error during rehashing passwords", "warn");
  }
}

/*
export async function dropPasswordRaw() {
  try {
    const [rows] = await pool.query("ALTER TABLE ?? DROP COLUMN passwordRaw", [tableName]);
    console.log(rows);
  } catch (error) {
    logDbErr(error, "error during dropping passwordRaw", "warn");
  }
}
*/