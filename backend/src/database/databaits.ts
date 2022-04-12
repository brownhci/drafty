import { db, logDbErr } from './mysql';
import { DatabaitCreateType, InteractionTypeDatabaitCreate, DatabaitAction }  from '../types/databaits';

const stmtInsertDatabait: string = `INSERT INTO Databaits (idInteraction, idUniqueID, idDatabaitTemplateType, idDatabaitCreateType, databait, columns, vals, notes, nextAction) VALUES (insert_interaction(?,?), ?, ?, ?, ?, ?, ?, '', null);`;
const stmtUpdateDatabaitNextAction: string = 'UPDATE Databaits SET closed = CURRENT_TIMESTAMP, nextAction = ? WHERE idDatabait = ?';

const stmtInsertDatabaitTweet: string = 'INSERT INTO DatabaitTweet (idInteraction, idDatabait, url, likes, retweets, nextAction) VALUES (insert_interaction(?,?), ?, ?, null, null, null);';
const stmtUpdateDatabaitTweetNextAction: string = 'UPDATE DatabaitTweet SET  closed = CURRENT_TIMESTAMP, nextAction = ? WHERE idDatabaitTweet = ?';
const stmtUpdateDatabaitTweetLikes: string = 'UPDATE DatabaitTweet SET likes = ? WHERE idDatabaitTweet = ?';
const stmtUpdateDatabaitTweetRetweets: string = 'UPDATE DatabaitTweet SET retweets = ? WHERE idDatabaitTweet = ?';
const stmtInsertDatabaitVisit: string = 'INSERT INTO DatabaitVisit (idinteraction, idDatabait, source) VALUES(insert_interaction(?,?), ?, ?);';
const stmtInsertVisit: string = 'INSERT INTO Visit (idinteraction, source) VALUES(insert_interaction(?,?), ?);';


/**
* function to update database
 */

export async function insertDatabait(idSession: string, DatabaitCreateType: DatabaitCreateType) {
    try {
        const idInteractionType: number = 0; // create from DatabaitCreateType
        // `INSERT INTO Databaits (idInteraction, idUniqueID, idDatabaitTemplateType, idDatabaitCreateType, databait, columns, vals, notes, nextAction) VALUES (insert_interaction(?,?), ?, ?, ?, ?, ?, ?, '', null);`
        const [results] = await db.query(stmtInsertDatabait, [idSession, idInteractionType]);
        return [null, results];
    } catch (error) {
        logDbErr(error, 'error during insert Databait', 'warn');
        return [error];
    }
}

export async function updateDatabaitNextAction(idDatabait: string | number, nextAction: DatabaitAction) {
    try {
        await db.query(stmtUpdateDatabaitNextAction, [nextAction, idDatabait]);
    } catch (error) {
        logDbErr(error, 'error during updateDatabaitNextAction', 'warn');
    }
}

export async function insertDatabaitTweet(idSession: string, idDatabait: string | number, twitterUrl: string) {
    try {
        const idInteractionType: number = 34; // databait-tweet
        // 'INSERT INTO (idInteraction, idDatabait, url, likes, retweets, nextAction) VALUES (insert_interaction(?,?), ?, ?, null, null, null);'
        await db.query(stmtInsertDatabaitTweet, [idSession, idInteractionType, idDatabait, twitterUrl]);
    } catch (error) {
        logDbErr(error, 'error during insertDatabaitTweet', 'warn');
    }
}

export async function updateDatabaitTweetNextAction(nextAction: DatabaitAction, idDatabaitTweet: string | number) {
    try {
        // 'UPDATE DatabaitTweet SET nextActionTimestamp = CURRENT_TIMESTAMP, nextAction = ? WHERE idDatabaitTweet = ?'
        await db.query(stmtUpdateDatabaitTweetNextAction, [nextAction, idDatabaitTweet]);
    } catch (error) {
        logDbErr(error, 'error during updateDatabaitTweetNextAction', 'warn');
    }
}


export async function updateDatabaitTweetLikes(likes: string | number, idDatabaitTweet: string | number) {
    try {
        // 'UPDATE DatabaitTweet SET likes = ? WHERE idDatabaitTweet = ?'
        await db.query(stmtUpdateDatabaitTweetLikes, [likes, idDatabaitTweet]);
    } catch (error) {
        logDbErr(error, 'error during updateDatabaitTweetLikes', 'warn');
    }
}


export async function updateDatabaitTweetRetweets(retweets: string | number, idDatabaitTweet: string | number) {
    try {
        // 'UPDATE DatabaitTweet SET retweets = ? WHERE idDatabaitTweet = ?'
        await db.query(stmtUpdateDatabaitTweetRetweets, [retweets, idDatabaitTweet]);
    } catch (error) {
        logDbErr(error, 'error during updateDatabaitTweetRetweets', 'warn');
    }
}

/**
 * insert that someone came to drafty from clicking on a databait link
 */
//DB Code
export function insertDatabaitVisit(idSession: string, idDatabait: string , source: string | number) {
    try {
        const idInteractionType: number = 25; // databait-visit
        db.query(stmtInsertDatabaitVisit, [idSession, idInteractionType, idDatabait, source]);
    } catch (error) {
        logDbErr(error, 'error during insert databait visit', 'warn');
    }
}

/**
 * insert that someone came to drafty from clicking on a link with attribute src
 */
// DB Code
export async function insertVisitFromSrc(idSession: string | number, src: string, searchCol: string, searchVal: string) {
    try {
        const idInteractionType: number = 38; // 
        await db.query(stmtInsertVisit, [idSession, idInteractionType, src, searchCol, searchVal]);
    } catch (error) {
        logDbErr(error, 'error during insertVisitFromSrc', 'warn');
    }
}
