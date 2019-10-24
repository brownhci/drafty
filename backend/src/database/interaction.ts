import { db,logDbErr } from "./mysql";
import { insertSuggestion, insertRowId } from  "./suggestion";

const stmtInsertInteraction: string = "INSERT INTO Interaction (idInteraction, idSession, idInteractionType) VALUES (null, ?, ?)"
const stmtInsertClick: string = "INSERT INTO Click (idInteraction, idSuggestion, rowvalues) VALUES (?, ?, ?);"
const stmtInsertSort: string  = "INSERT INTO Sort (idInteraction, idSuggestionType) VALUES (?, ?);"
const stmtInsertEdit: string  = "INSERT INTO Edit (idInteraction, idSuggestion, idEntryType, chosen) VALUES (?, ?, ?, ?);"

/**
 * save new interaction id
 */
//DB Code
async function insertInteraction(idSession: string, idInteractionType: string, callback: CallableFunction) {
    try {
        const [results, fields] = await db.query(stmtInsertInteraction, [idSession, idInteractionType]);
        callback(null, results, fields);
    } catch (error) {
        logDbErr(error, "error during insert interaction", "warn");
        callback(error);
    }
}