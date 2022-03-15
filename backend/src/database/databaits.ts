import { db, logDbErr } from './mysql';

// stmtInsertDatabait
// stmtUpdateDatabaitClosed
// stmtUpdateDatabaitNextAction
// stmtInsertDatabaitTweet
// stmtUpdateDatabaitTweetNextAction
// stmtUpdateDatabaitTweetLikes
// stmtUpdateDatabaitTweetRetweets

export const databaitAction = {
    tweet: 'tweet',
    rightClick: 'right-click', 
    edit: 'edit', 
    newRow: 'new-row', 
    deleteRow: 'delete-row', 
    navbarMenu: 'navbar-menu', 
    modalLike: 'modal-like', 
    modalRandom: 'modal-random'
} as const;

/* TS magic to allow flexible lookup */
export type databaitAction = typeof databaitAction [ keyof typeof databaitAction ]
