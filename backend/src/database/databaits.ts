import { db, logDbErr } from './mysql';

const stmtInsertDatabait: string = `INSERT INTO Databaits (idInteraction, idUniqueID, idDatabaitTemplateType, idDatabaitCreateType, databait, columns, vals, notes, nextAction) VALUES (insert_interaction(?,?), ?, ?, ?, ?, ?, ?, '', null);`;
const stmtUpdateDatabaitClosed: string = 'UPDATE Databaits SET closed = CURRENT_TIMESTAMP WHERE idDatabait = ?;';
const stmtUpdateDatabaitNextAction: string = 'UPDATE Databaits SET nextAction = ? WHERE idDatabait = ?';
const stmtInsertDatabaitTweet: string = 'INSERT INTO (idInteraction, idDatabait, url, likes, retweets, nextAction) VALUES (insert_interaction(?,?), ?, ?, null, null, null);';
const stmtUpdateDatabaitTweetNextAction: string = 'UPDATE DatabaitTweet SET nextAction = ? WHERE idDatabaitTweet = ?';
const stmtUpdateDatabaitTweetLikes: string = 'UPDATE DatabaitTweet SET likes = ? WHERE idDatabaitTweet = ?';
const stmtUpdateDatabaitTweetRetweets: string = 'UPDATE DatabaitTweet SET retweets = ? WHERE idDatabaitTweet = ?';
const stmtInsertDatabaitVisit: string = 'INSERT INTO DatabaitVisit (idinteraction, idDatabait) VALUES(insert_interaction(?,?), ?);';

// used for how databaits were created
export const databaitCreateType = {
    modal_like: 1,
    modal_random: 2,
    right_click: 3,
    edit: 4,
    new_row: 5,
    delete_row: 6,
    navbar_menu: 7,
    welcome_modal: 8,
} as const;

/* TS magic to allow flexible lookup */
export type databaitCreateType  =  typeof databaitCreateType [ keyof typeof databaitCreateType ]

// used for how databaits were created
export const databaitCreateInteractionType = {
    modal_like: 31,
    modal_random: 32,
    right_click: 26,
    edit: 27,
    new_row: 28,
    delete_row: 29,
    navbar_menu: 30,
    welcome_modal: 33,
} as const;

/* TS magic to allow flexible lookup */
export type databaitCreateInteractionType  =  typeof databaitCreateInteractionType [ keyof typeof databaitCreateInteractionType ]

//next action after seeing a databait // tweets are implied
export const databaitAction = {
    modal_like: 1,
    modal_random: 2,
    right_click: 3,
    edit: 4,
    new_row: 5,
    delete_row: 6,
    navbar_menu: 7,
    window_closed: 8,
} as const;

/* TS magic to allow flexible lookup */
export type databaitAction  =  typeof databaitAction [ keyof typeof databaitAction ]

/**
* function to update database
 */

export async function insertDatabait(idSession: string, databaitCreateType: databaitCreateType) {
    try {
        const idInteractionType: number = 0; // create from databaitCreateType
        // `INSERT INTO Databaits (idInteraction, idUniqueID, idDatabaitTemplateType, idDatabaitCreateType, databait, columns, vals, notes, nextAction) VALUES (insert_interaction(?,?), ?, ?, ?, ?, ?, ?, '', null);`
        const [results] = await db.query(stmtInsertDatabait, [idSession, idInteractionType]);
        return [null, results];
    } catch (error) {
        logDbErr(error, 'error during insert Databait', 'warn');
        return [error];
    }
}

export async function updateDatabaitClosed(idDataBait: string | number) {
    try {
        await db.query(stmtUpdateDatabaitClosed, [idDataBait]);
    } catch (error) {
        logDbErr(error, 'error during updateDatabaitClosed', 'warn');
    }
}

export async function updateDatabaitNextAction(idDataBait: string | number, nextAction: databaitAction) {
    try {
        await db.query(stmtUpdateDatabaitNextAction, [idDataBait, nextAction]);
    } catch (error) {
        logDbErr(error, 'error during updateDatabaitNextAction', 'warn');
    }
}

export async function insertDatabaitTweet(idSession: string) {
    try {
        const idInteractionType: number = 34;
        // 'INSERT INTO (idInteraction, idDatabait, url, likes, retweets, nextAction) VALUES (insert_interaction(?,?), ?, ?, null, null, null);'
        await db.query(stmtInsertDatabaitTweet, [idSession, idInteractionType]);
    } catch (error) {
        logDbErr(error, 'error during insertDatabaitTweet', 'warn');
    }
}

export async function updateDatabaitTweetNextAction(nextAction: databaitAction, idDatabaitTweet: string | number) {
    try {
        // 'UPDATE DatabaitTweet SET nextAction = ? WHERE idDatabaitTweet = ?'
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
export async function insertDataBaitVisit(idSession: string, idDataBait: string | number) {
    try {
        const idInteractionType: number = 25;
        await db.query(stmtInsertDatabaitVisit, [idSession, idInteractionType, idDataBait]);
    } catch (error) {
        logDbErr(error, 'error during insert databait visit', 'warn');
    }
}