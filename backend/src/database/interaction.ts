import { db,logDbErr } from "./mysql";

const pipeDelim: string = "|";

// FUNCTION insert_interaction(idSession INT, idInteractionType INT)
const stmtInsertInteraction: string = "INSERT INTO Interaction (idInteraction, idSession, idInteractionType) VALUES (null, ?, ?)";

const stmtInsertClick: string = "INSERT INTO Click (idInteraction, idSuggestion, rowvalues) VALUES (insert_interaction(?,?), ?, ?);";

const stmtInsertPaste: string = "INSERT INTO Paste (idInteraction, pasteValue, pasteCellValue, pasteCellIdSuggestion, copyCellValue, copyCellIdSuggestion) VALUES (insert_interaction(?,?), ?, ?, ?, ?, ?);";

const stmtInsertCopy: string = "INSERT INTO Copy (idInteraction, idSuggestion) VALUES (insert_interaction(?,?), ?);";

const stmtInsertDoubleClick: string = "INSERT INTO DoubleClick (idInteraction, idSuggestion, rowvalues) VALUES (insert_interaction(?,?), ?, ?);";

const stmtInsertSort: string  = "INSERT INTO Sort (idInteraction, idSuggestionType, isAsc, isTrigger, isMulti) VALUES (insert_interaction(?,?), ?, ?, ?, ?);";

const stmtSearch: string  = "INSERT INTO Search (idInteraction, idSuggestionType, idSearchType, isPartial, isMulti, isFromUrl, value, matchedValues) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

const stmtSearchMulti: string  = "INSERT INTO SearchMulti (idInteraction, idSuggestionType, idSearchType, value) VALUES (?, ?, ?, ?)";

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
 * 
 * saves paste on cell
 * 
 */
export async function insertPasteCell(idSession: string, pasteVal: string, pasteCellVal: string, pasteCellIdSuggestion: number, copyCellVal: string, copyCellIdSuggestion: number) {
    try {
        const idInteractionType: number = 9;
        await db.query(stmtInsertPaste, [idSession,idInteractionType,pasteVal,pasteCellVal,pasteCellIdSuggestion,copyCellVal,copyCellIdSuggestion]);
    } catch (error) {
        logDbErr(error, "error during insert paste", "warn");
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
        // each col search input is separated by ||
        const msVals: Array<string> = multiSearchValues.split("||");
        for (let i = 0; i < msVals.length; i++) {
            const valsToInsert: Array<string> = msVals[i].split("|");

            // idSuggestionType|idSearchType|value
            // value is the input on the search box
            const idSuggestionType: number|string = valsToInsert[0];
            const idSearchType: string = valsToInsert[1];
            const value: string = valsToInsert[2];
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
        let idInteractionType: number = 7; // 7 = search
        if(isMulti === 1 && isPartial === 1) { 
            idInteractionType = 11; // 11 = searchMulti 
        } else if(isMulti === 1 && isPartial === 0) { 
            idInteractionType = 16; // 11 = searchMulti-full
        } else if(isMulti === 0 && isPartial === 0) { 
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

        if(isMulti === 1) {
            insertSearchMulti(idInteraction, multiSearchValues);
        }
    } catch (error) {
        logDbErr(error, "error during insert insertSearch", "warn");
    }
}