import { db, logDbErr } from './mysql';

const stmtInsertTraffic: string = 'INSERT INTO users.Traffic (idTraffic, url, fullUrl, host, origin, sid) VALUES (NULL, ?, ?, ?, ?, ?);';

/**
 * save new page view (i.e. traffic) across drafty.cs.brown.edu
 */
// DB Code
export async function insertTraffic(url: string, fullUrl: string, host: string, origin: string, sid: string) {
    try {
        await db.query(stmtInsertTraffic, [url, fullUrl, host, origin, sid]);
    } catch (error) {
        logDbErr(error, 'error during insert traffic', 'warn');
    }
}