import { db,logDbErr } from "./mysql";

const stmtInsertTraffic: string = "INSERT INTO users.Traffic (idTraffic, ip, url, host, origin, sid) VALUES (NULL, NULL, ?, ?, ?, ?);";

/**
 * save new page view (i.e. traffic) across drafty.cs.brown.edu
 */
// DB Code
export async function insertTraffic(url: string, host: string, origin: string, sid: string) {
    try {
        await db.query(stmtInsertTraffic, [url, host, origin, sid]);
    } catch (error) {
        logDbErr(error, "error during insert traffic", "warn");
    }
}