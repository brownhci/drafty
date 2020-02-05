import { db,logDbErr } from "./mysql";
import { insertSuggestion, insertRowId } from  "./suggestion";

const stmtInsertInteraction: string = "INSERT INTO Interaction (idInteraction, idSession, idInteractionType) VALUES (null, ?, ?)";
const stmtInsertClick: string = "INSERT INTO Click (idInteraction, idSuggestion, rowvalues) VALUES (?, ?, ?);";
const stmtInsertSort: string  = "INSERT INTO Sort (idInteraction, idSuggestionType) VALUES (?, ?);";
const stmtInsertEdit: string  = "INSERT INTO Edit (idInteraction, idSuggestion, idEntryType, chosen) VALUES (?, ?, ?, ?);";

/**
 * save new interaction id
 */
//DB Code
async function insertInteraction(idSession: string, idInteractionType: string) {
    try {
        const [results, fields] = await db.query(stmtInsertInteraction, [idSession, idInteractionType]);
        return [results.insertId];
    } catch (error) {
        logDbErr(error, "error during insert interaction", "warn");
        return [error];
    }
}

/**
 * save new click
 */
//DB Code
export async function insertClick(idSession: string, idInteractionType: string, idSuggestion: string, rowvalues: string, callback: CallableFunction) {
    try {
        const idInteraction = await insertInteraction(idSession, idInteractionType);
        const [results, fields] = await db.query(stmtInsertClick, [idInteraction, idSuggestion, rowvalues]);
        callback(null, results, fields);
    } catch (error) {
        logDbErr(error, "error during insert click", "warn");
        callback(error);
    }
}

/**
 * save new sort
 */
//DB Code
export async function insertSort(idSession: string, idInteractionType: string, idSuggestionType: string, callback: CallableFunction) {
    try {
        const idInteraction = await insertInteraction(idSession, idInteractionType);
        const [results, fields] = await db.query(stmtInsertSort, [idInteraction, idSuggestionType]);
        callback(null, results, fields);
    } catch (error) {
        logDbErr(error, "error during insert sort", "warn");
        callback(error);
    }
}

/**
 * save new sort
 */
//DB Code
export async function insertEdit(idSession: string, idInteractionType: string, idSuggestion: string, idEntryType: string, chosen: boolean, callback: CallableFunction) {
    try {
        const idInteraction = await insertInteraction(idSession, idInteractionType);
        const [results, fields] = await db.query(stmtInsertEdit, [idInteraction, idSuggestion, idEntryType, chosen]);
        callback(null, results, fields);
    } catch (error) {
        logDbErr(error, "error during insert edit", "warn");
        callback(error);
    }
}