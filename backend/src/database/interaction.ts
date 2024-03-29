import { RowDataPacket } from 'mysql2/promise';
import { db, logDbErr } from './mysql';

const pipeDelim: string = '|';

// FUNCTION insert_interaction(idSession INT, idInteractionType INT)
const stmtInsertInteraction: string = 'INSERT INTO Interaction (idInteraction, idSession, idInteractionType) VALUES (null, ?, ?)';

const stmtInsertClick: string = 'INSERT INTO Click (idInteraction, idSuggestion, rowvalues) VALUES (insert_interaction(?,?), ?, ?);';

const stmtInsertPaste: string = 'INSERT INTO Paste (idInteraction, pasteValue, pasteCellValue, pasteCellIdSuggestion, copyCellValue, copyCellIdSuggestion) VALUES (insert_interaction(?,?), ?, ?, ?, ?, ?);';

const stmtInsertCopy: string = 'INSERT INTO Copy (idInteraction, idSuggestion) VALUES (insert_interaction(?,?), ?);';

const stmtInsertDoubleClick: string = 'INSERT INTO DoubleClick (idInteraction, idSuggestion, rowvalues) VALUES (insert_interaction(?,?), ?, ?);';

const stmtInsertSort: string = 'INSERT INTO Sort (idInteraction, idSuggestionType, isAsc, isTrigger, isMulti) VALUES (insert_interaction(?,?), ?, ?, ?, ?);';

const stmtSearch: string = 'INSERT INTO Search (idInteraction, idSuggestionType, idSearchType, isPartial, isMulti, isFromUrl, value, matchedValues) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

const stmtSearchMulti: string = 'INSERT INTO SearchMulti (idInteraction, idSuggestionType, idSearchType, value) VALUES (?, ?, ?, ?)';

const stmtInsertSearchGoogle: string = 'INSERT INTO SearchGoogle (idInteraction, idUniqueID, idSuggestion, searchValues) VALUES (insert_interaction(?,?), ?, ?, ?);';

const stmtInsertDataBaitVisit: string = 'INSERT INTO DataBaitVisit (idInteraction, idDataBait, source) VALUES (insert_interaction(?,?), ?, source);';

const stmtSelectComments: string = `SELECT IF(cv.userVote is null, 'nothing', cv.userVote) as userVote, c.*, i.timestamp, p.username
FROM Comments c
INNER JOIN Interaction i on c.idInteraction = i.idInteraction
LEFT JOIN users.Session s on s.idSession = i.idSession
LEFT JOIN users.Profile p on p.idProfile = s.idProfile
LEFT JOIN (
    SELECT cv.idComment, cv.idCommentVote, IF(cv.vote like '%deselect%', 'nothing', IF(cv.vote = 'voteUp', 'up', 'down')) as userVote
    FROM CommentVote cv
    INNER JOIN (select cv.idComment, MAX(cv.idCommentVote) idMax from CommentVote cv inner join Interaction i on i.idInteraction = cv.idInteraction where i.idSession = ? group by cv.idComment) cvm ON cvm.idMax = cv.idCommentVote
) cv on c.idComment = cv.idComment
WHERE c.idUniqueID = ? ORDER BY i.timestamp DESC;`;
const stmtInsertCommentView: string = ' INSERT INTO CommentsView (idInteraction, idUniqueID) VALUES (insert_interaction(?,?),?)';
const stmtInsertNewComment: string = 'INSERT INTO Comments (idInteraction, idUniqueID, comment, voteUp, voteDown) VALUES (insert_interaction(?,?), ?, ?, DEFAULT, DEFAULT);';
const stmtInsertNewCommentVote: string = 'INSERT INTO CommentVote (idInteraction, idComment, vote) VALUES (insert_interaction(?,?), ?, ?);';
const stmtUpdateCommentVoteUpCountADD: string = 'UPDATE Comments t SET t.voteUp = (t.voteUp + 1) WHERE t.idComment = ?;';
const stmtUpdateCommentVoteUpCountSUB: string = 'UPDATE Comments t SET t.voteUp = (t.voteUp - 1) WHERE t.idComment = ?;';
const stmtUpdateCommentVoteDownCountADD: string = 'UPDATE Comments t SET t.voteDown = (t.voteDown + 1) WHERE t.idComment = ?;';
const stmtUpdateCommentVoteDownCountSUB: string = 'UPDATE Comments t SET t.voteDown = (t.voteDown - 1) WHERE t.idComment = ?;';
const stmtContributionHistory: string = `
select i.idSession, addRow.interaction as addRow, IF(editCell.interaction>1,1,null) as editCell, IF(editCell.interaction=1,1,null) as editEmptyCell, delRow.interaction as delRow, note.interaction as note, helpus.interaction as helpus
from (select idSession from Interaction where idSession = ?) i
left join (select idSession, 1 as interaction from Interaction where idInteractionType = 5 and idSession = ?) addRow
    on addRow.idSession = i.idSession
left join (select idSession, count(*) as interaction from Interaction where idInteractionType = 6 and idSession = ?) editCell
    on editCell.idSession = i.idSession
left join (select idSession, 1 as interaction from Interaction where idInteractionType = 17 and idSession = ?) delRow
    on delRow.idSession = i.idSession
left join (select idSession, 1 as interaction from Interaction where idInteractionType = 19 and idSession = ?) note
    on note.idSession = i.idSession
left join (select idSession, 1 as interaction from Interaction where idInteractionType = 17 and idSession = ?) helpus
    on helpus.idSession = i.idSession
group by i.idSession, addRow.interaction, editCell.interaction, delRow.interaction
`;

/**
 * save new click
 */
//DB Code
export async function insertClick(idSession: string, idSuggestion: string, rowvalues: Array<string>) {
    try {
        const idInteractionType: number = 1;
        await db.query(stmtInsertClick, [idSession, idInteractionType, idSuggestion, rowvalues.join(pipeDelim)]);
    } catch (error) {
        logDbErr(error, 'error during insert click', 'warn');
    }
}

/**
 * save new double click
 */
//DB Code
export async function insertDoubleClick(idSession: string, idSuggestion: string, rowvalues: Array<string>) {
    try {
        const idInteractionType: number = 10;
        await db.query(stmtInsertDoubleClick, [idSession, idInteractionType, idSuggestion, rowvalues.join(pipeDelim)]);
    } catch (error) {
        logDbErr(error, 'error during insert double-click', 'warn');
    }
}

/**
 * 
 * saves paste on cell
 * 
 */
export async function insertPasteCell(idSession: string, pasteVal: string, pasteCellVal: string, pasteCellIdSuggestion: number, copyCellVal: string, copyCellIdSuggestion: number) {
    try {
        const idInteractionType: number = 9;
        await db.query(stmtInsertPaste, [idSession, idInteractionType, pasteVal, pasteCellVal, pasteCellIdSuggestion, copyCellVal, copyCellIdSuggestion]);
    } catch (error) {
        logDbErr(error, 'error during insert paste', 'warn');
    }
}

/**
 * save new copy cell
 */
//DB Code
export async function insertCopyCell(idSession: string, idSuggestion: number | string) {
    try {
        const idInteractionType: number = 8;
        await db.query(stmtInsertCopy, [idSession, idInteractionType, idSuggestion]);
    } catch (error) {
        logDbErr(error, 'error during insert copy', 'warn');
    }
}

/**
 * save new sort
 */
//DB Code
export async function insertSort(idSession: string, idSuggestionType: number | string, isAsc: number, isTrigger: number, isMulti: number) {
    try {
        const idInteractionType: number = 4;
        db.query(stmtInsertSort, [idSession, idInteractionType, idSuggestionType, isAsc, isTrigger, isMulti]);
    } catch (error) {
        logDbErr(error, 'error during insert sort', 'warn');
    }
}

/**
 * save new interaction id
 */
//DB Code
async function insertInteraction(idSession: string, idInteractionType: number | string) {
    try {
        const [results] = await db.query(stmtInsertInteraction, [idSession, idInteractionType]);
        return (results as any).insertId;
    } catch (error) {
        logDbErr(error, 'error during insert interaction', 'warn');
        return [error];
    }
}

/**
 * save new sort
 */
//DB Code
export function insertSearchMulti(idInteraction: number, multiSearchValues: string) {
    try {
        // each col search input is separated by ||
        const msVals: Array<string> = multiSearchValues.split('||');
        for (let i = 0; i < msVals.length; i++) {
            const valsToInsert: Array<string> = msVals[i].split('|');

            // idSuggestionType|idSearchType|value
            // value is the input on the search box
            const idSuggestionType: number | string = valsToInsert[0];
            const idSearchType: string = valsToInsert[1];
            const value: string = valsToInsert[2];
            db.query(stmtSearchMulti, [idInteraction, idSuggestionType, idSearchType, value]);
        }
    } catch (error) {
        logDbErr(error, 'error during insert insertSearchMulti', 'warn');
    }
}

/**
 * save new sort
 */
//DB Code
export async function insertSearch(idSession: string, idSuggestionType: number | string, isPartial: number, isMulti: number, isFromUrl: number, value: string, matchedValues: string, multiSearchValues: string) {
    try {
        let idInteractionType: number = 7; // 7 = search
        if (isMulti === 1 && isPartial === 1) {
            idInteractionType = 11; // 11 = searchMulti 
        } else if (isMulti === 1 && isPartial === 0) {
            idInteractionType = 16; // 11 = searchMulti-full
        } else if (isMulti === 0 && isPartial === 0) {
            idInteractionType = 15; // 11 = search-full
        }

        const idInteraction = await insertInteraction(idSession, idInteractionType);
        const idSearchType: number = 1; // default 1 = equals

        /*
        console.log("\n\nSEARCH: ", idInteraction,idInteractionType,idSearchType);
        console.log(idSession, idSuggestionType);
        console.log("isPartial, isMulti, isFromUrl :: ",isPartial, isMulti, isFromUrl);
        console.log(value, matchedValues, multiSearchValues);
        */

        ///////////////////// idInteraction, idSuggestionType, idSearchType, isPartial, isMulti, isFromUrl, value, matchedValues
        db.query(stmtSearch, [idInteraction, idSuggestionType, idSearchType, isPartial, isMulti, isFromUrl, value, matchedValues]);

        if (isMulti === 1) {
            insertSearchMulti(idInteraction, multiSearchValues);
        }
    } catch (error) {
        logDbErr(error, 'error during insert insertSearch', 'warn');
    }
}

/**
* insert Search Google
**/
export async function insertSearchGoogle(idSession: string, idRow: number | string, idSuggestion: number | string, searchValues: Array<string>) {
    try {
        const idInteractionType: number = 18;
        //console.log('insertSearchGoogle:',idSession, idInteractionType, idRow, idSuggestion, searchValues.join(pipeDelim));
        db.query(stmtInsertSearchGoogle, [idSession, idInteractionType, idRow, idSuggestion, searchValues.join(pipeDelim)]);
    } catch (error) {
        logDbErr(error, 'error during insert google search', 'warn');
    }
}

/**
 * insert that someone came to drafty from seeing a databait
 */
//DB Code
export async function insertDataBaitVisit(idSession: string, idDataBait: string, source: string) {
    try {
        const idInteractionType: number = 24;
        await db.query(stmtInsertDataBaitVisit, [idSession, idInteractionType, idDataBait, source]);
    } catch (error) {
        logDbErr(error, 'error during insert databait visit', 'warn');
    }
}

interface Contributions extends RowDataPacket {
    idSession: string;
    addRow: number;
    editCell: number;
    editEmptyCell: number;
    delRow: number;
    note: number;
    helpus: number;
}

/**
 * get all contribution interactions
 */
//DB Code
export async function getUserContributionHistory(idSession: string) {
    try {
        const [results] = await db.query<Contributions[]>(stmtContributionHistory, [idSession,idSession,idSession,idSession,idSession,idSession]);
        console.log(results);
        let mainContribution: string = 'COXYHI8H'; //nothing
        if(results.length > 0) {
            const interactions = results[0].addRow + results[0].delRow + results[0].editCell + results[0].editEmptyCell + results[0].note + results[0].helpus;
            if (interactions >= 2) {
                mainContribution = 'C199VGDK';
            } else if (results[0].addRow) {
                mainContribution = 'C13LZHQF';
            } else if (results[0].delRow) {
                mainContribution = 'C1L8MH5R';
            } else if (results[0].editCell) {
                mainContribution = 'C16SZZ9F';
            } else if (results[0].editEmptyCell) {
                mainContribution = 'C18JKUNH';
            } else if (results[0].note) {
                mainContribution = 'C141HZH1';
            } else if (results[0].helpus) {
                mainContribution = 'C1IFA3R2';
            }
        }
        //console.log(interactions);
        //console.log(mainContribution);
        return mainContribution;
    } catch (error) {
        logDbErr(error, 'error during stmtContributionHistory ' + idSession, 'warn');
        return [error];
    }
}

/**
 * get all comments for a row
 */
//DB Code
export async function selectComments(idSession: string, idUniqueID: string | number) {
    try {
        const idInteractionType: number = 24; // comments view
        db.query(stmtInsertCommentView, [idSession, idInteractionType, idUniqueID]);
        const [ results ] = await db.query(stmtSelectComments, [idSession, idUniqueID]);
        return [null, results];
    } catch (error) {
        logDbErr(error, 'error during selectComments', 'warn');
        return [error];
    }
}


/**
 * insert new comment
 */
//DB Code
export async function insertNewComment(idSession: string, idUniqueID: string | number, comment: string ) {
    try {
        const idInteractionType: number = 19;
        const [ results ] = await db.query(stmtInsertNewComment, [idSession, idInteractionType, idUniqueID, comment]);
        return [null, results];
    } catch (error) {
        logDbErr(error, 'error during insert insertNewComment', 'warn');
        return [error];
    }
}

// to match check in database
const deselect: string = 'deselect';
export type Vote = 'voteUp' | 'voteUp-deselect' | 'voteDown' | 'voteDown-deselect';
const voteIdInteractionType: Record<Vote, number> = {
    'voteUp': 20,
    'voteUp-deselect': 21,
    'voteDown': 22,
    'voteDown-deselect': 23
};

/**
 * update comment vote up
 */
//DB Code
export async function updateNewCommentVoteUp(idSession: string, idComment: string | number, vote: Vote) {
    try {
        let stmtUpdateCommentVoteUpCount: string = stmtUpdateCommentVoteUpCountADD;
        if(vote.includes(deselect)) {
            stmtUpdateCommentVoteUpCount = stmtUpdateCommentVoteUpCountSUB;
        }
        const idInteractionType = voteIdInteractionType[vote];
        db.query(stmtUpdateCommentVoteUpCount, [idComment]);
        db.query(stmtInsertNewCommentVote, [idSession, idInteractionType, idComment, vote]);
    } catch (error) {
        logDbErr(error, 'error during insert updateNewCommentVoteUp', 'warn');
    }
}

/**
 * update comment vote down
 */
//DB Code
export async function updateNewCommentVoteDown(idSession: string, idComment: string | number, vote: Vote) {
    try {
        let stmtUpdateCommentVoteUpCount: string = stmtUpdateCommentVoteDownCountADD;
        if(vote.includes(deselect)) {
            stmtUpdateCommentVoteUpCount = stmtUpdateCommentVoteDownCountSUB;
        }
        const idInteractionType = voteIdInteractionType[vote];
        db.query(stmtUpdateCommentVoteUpCount, [idComment]);
        db.query(stmtInsertNewCommentVote, [idSession, idInteractionType, idComment, vote]);
    } catch (error) {
        logDbErr(error, 'error during insert updateNewCommentVoteDown', 'warn');
    }
}
