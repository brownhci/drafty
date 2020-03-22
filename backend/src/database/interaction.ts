import { db,logDbErr } from "./mysql";

const pipeDelim: string = "|";

// FUNCTION insert_interaction(idSession INT, idInteractionType INT)
const stmtInsertInteraction: string = "INSERT INTO Interaction (idInteraction, idSession, idInteractionType) VALUES (null, ?, ?)";

const stmtInsertClick: string = "INSERT INTO Click (idInteraction, idSuggestion, rowvalues) VALUES (insert_interaction(?,?), ?, ?);";

const stmtInsertCopy: string = "INSERT INTO Copy (idInteraction, idSuggestion) VALUES (insert_interaction(?,?), ?);";

const stmtInsertDoubleClick: string = "INSERT INTO DoubleClick (idInteraction, idSuggestion, rowvalues) VALUES (insert_interaction(?,?), ?, ?);";

const stmtInsertSort: string  = "INSERT INTO Sort (idInteraction, idSuggestionType, isAsc, isTrigger, isMulti) VALUES (insert_interaction(?,?), ?, ?, ?, ?);";

const stmtSearch: string  = "INSERT INTO Search (idInteraction, idSuggestionType, idSearchType, isPartial, isMulti, isFromUrl, value, matchedValues) VALUES (insert_interaction(?,?), ?, ?, ?, ?, ?, ?, ?)";

const stmtSearchMulti: string  = "INSERT INTO SearchMulti (idInteraction, idSuggestionType, idSearchType, value) VALUES (insert_interaction(?,?), ?, ?, ?)";

//const stmtInsertEdit: string  = "INSERT INTO Edit (idInteraction, idSuggestion, idEntryType, chosen) VALUES (?, ?, ?, ?);";

/**
 * save new click
 */
//DB Code
export async function insertClick(idSession: string, idSuggestion: string, rowvalues: Array<string>) {
    try {
        const idInteractionType: number = 1;
        await db.query(stmtInsertClick, [idSession, idInteractionType, idSuggestion, rowvalues.join(pipeDelim)]);
    } catch (error) {
        logDbErr(error, "error during insert click", "warn");
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
        logDbErr(error, "error during insert double-click", "warn");
    }
}

/**
 * save new copy cell
 */
//DB Code
export async function insertCopyCell(idSession: string, idSuggestion: number|string) {
    try {
        const idInteractionType: number = 8;
        await db.query(stmtInsertCopy, [idSession, idInteractionType, idSuggestion]);
    } catch (error) {
        logDbErr(error, "error during insert copy", "warn");
    }
}

/**
 * save new copy column
 */
//DB Code
export async function insertCopyColumn(idSession: string, idSuggestionType: number|string) {
    try {
        const idInteractionType: number = 14;
        await db.query(stmtInsertCopy, [idSession, idInteractionType, idSuggestionType]);
    } catch (error) {
        logDbErr(error, "error during insert copy column", "warn");
    }
}

/**
 * save new sort
 */
//DB Code
export async function insertSort(idSession: string, idSuggestionType: number|string, isAsc: number, isTrigger: number, isMulti: number) {
    try {
        const idInteractionType: number = 4;
        db.query(stmtInsertSort, [idSession, idInteractionType, idSuggestionType, isAsc, isTrigger, isMulti]);
    } catch (error) {
        logDbErr(error, "error during insert sort", "warn");
    }
}

/**
 * save new interaction id
 */
//DB Code
async function insertInteraction(idSession: string, idInteractionType: number|string) {
    try {
        const [results] = await db.query(stmtInsertInteraction, [idSession, idInteractionType]);
        return (results as any).insertId;
    } catch (error) {
        logDbErr(error, "error during insert interaction", "warn");
        return [error];
    }
}

/**
 * save new sort
 */
//DB Code
export function insertSearchMulti(idInteraction: number, multiSearchValues: string) {
    try {
        const idInteractionType: number = 11;

        // each col search input is separated by ||
        const msVals: Array<string> = multiSearchValues.split("||");
        for (let i = 0; i < msVals.length; i++) {
            const valsToInsert: Array<string> = msVals[i].split("|");

            // idSuggestionType|idSearchType|value
            // value is the input on the search box
            const idSuggestionType: number|string = valsToInsert[0];
            const idSearchType: string = valsToInsert[1];
            const : string = valsToInsert[2];
            db.query(stmtSearchMulti, [idInteraction, idSuggestionType, idSearchType, value]);
        }
    } catch (error) {
        logDbErr(error, "error during insert insertSearchMulti", "warn");
    }
}

/**
 * save new sort
 */
//DB Code
export async function insertSearch(idSession: string, idSuggestionType: number|string, isPartial: number, isMulti: number, isFromUrl: number, value: string, matchedValues: string, multiSearchValues: string) {
    try {
        const idInteractionType: number = 7;
        const idInteraction = await insertInteraction(idSession, idInteractionType);
        const idSearchType: number = 1; // default 1 = equals


        if(isMulti === 1) {
            insertSearchMulti(idInteraction, multiSearchValues);
        }

        // idInteraction, idSuggestionType, idSearchType, isPartial, isMulti, isFromUrl, value, matchedValues
        db.query(stmtSearch, [idSession, idInteractionType, idSuggestionType, idSearchType, isPartial, isMulti, isFromUrl, value, matchedValues]);
    } catch (error) {
        logDbErr(error, "error during insert insertSearch", "warn");
    }
}