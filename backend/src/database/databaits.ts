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
