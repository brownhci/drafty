import { db,logDbErr } from "./mysql";
import { insertSuggestion, insertRowId } from  "./suggestion";

const stmtInsertInteraction: string = "INSERT INTO Interaction (idInteraction, idSession, idInteractionType) VALUES (null, ?, ?)";
const stmtInsertClick: string = "INSERT INTO Click (idInteraction, idSuggestion, rowvalues) VALUES (?, ?, ?);";
const stmtInsertCopy: string = "INSERT INTO Copy (idInteraction, idSuggestion) VALUES (?, ?);";
const stmtInsertDoubleClick: string = "INSERT INTO DoubleClick (idInteraction, idSuggestion, rowvalues) VALUES (?, ?, ?);";
const stmtInsertSort: string  = "INSERT INTO Sort (idInteraction, idSuggestionType) VALUES (?, ?);";

const stmtSearch: string  = "INSERT INTO Search (idInteraction, idSuggestionType, idSearchType, isPartial, isMulti, isFromUrl, value, matchedValues) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
const stmtSearchMulti: string  = "INSERT INTO SearchMulti (idInteraction, idSuggestionType, idSearchType, value) VALUES (?, ?, ?, ?)";

const stmtInsertEdit: string  = "INSERT INTO Edit (idInteraction, idSuggestion, idEntryType, chosen) VALUES (?, ?, ?, ?);";

/**
 * save new interaction id
 */
//DB Code
async function insertInteraction(idSession: string, idInteractionType: string) {
    try {
        const [results, fields] = await db.query(stmtInsertInteraction, [idSession, idInteractionType]);
        return results.insertId;
    } catch (error) {
        logDbErr(error, "error during insert interaction", "warn");
        return [error];
    }
}

/**
 * save new click
 */
//DB Code
export async function insertClick(idSession: string, idInteractionType: string, idSuggestion: string, rowvalues: string) {
    try {
        const idInteraction = await insertInteraction(idSession, idInteractionType);
        await db.query(stmtInsertClick, [idInteraction, idSuggestion, rowvalues]);
    } catch (error) {
        logDbErr(error, "error during insert click", "warn");
    }
}

/**
 * save new copy
 */
//DB Code
export async function insertCopy(idSession: string, idInteractionType: string, idSuggestion: string) {
    try {
        const idInteraction = await insertInteraction(idSession, idInteractionType);
        await db.query(stmtInsertCopy, [idInteraction, idSuggestion]);
    } catch (error) {
        logDbErr(error, "error during insert copy", "warn");
    }
}

/**
 * save new sort
 */
//DB Code
export async function insertSort(idSession: string, idInteractionType: string, idSuggestionType: string) {
    try {
        const idInteraction = await insertInteraction(idSession, idInteractionType);
        db.query(stmtInsertSort, [idInteraction, idSuggestionType]);
    } catch (error) {
        logDbErr(error, "error during insert sort", "warn");
    }
}

/**
 * save new sort
 */
//DB Code
export async function insertEdit(idSession: string, idInteractionType: string, idSuggestion: string, idEntryType: string, chosen: boolean) {
    try {
        const idInteraction = await insertInteraction(idSession, idInteractionType);
        db.query(stmtInsertEdit, [idInteraction, idSuggestion, idEntryType, chosen]);
    } catch (error) {
        logDbErr(error, "error during insert edit", "warn");
    }
}