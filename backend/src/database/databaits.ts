import { db, logDbErr } from './mysql';

// stmtInsertDatabait
// stmtUpdateDatabaitClosed
// stmtUpdateDatabaitNextAction
// stmtInsertDatabaitTweet
// stmtUpdateDatabaitTweetNextAction
// stmtUpdateDatabaitTweetLikes
// stmtUpdateDatabaitTweetRetweets
// stmtInsertDatabaitVisit

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
