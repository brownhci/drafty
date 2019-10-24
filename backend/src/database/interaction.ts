import { db } from "./mysql";
import { insertSuggestion, insertRowId } from  './suggestion'
import async from "async";

const stmtInsertInteraction: String = "INSERT INTO Interaction (idInteraction, idSession, idInteractionType) VALUES (null, ?, ?)"
const stmtInsertClick: String = "INSERT INTO Click (idInteraction, idSuggestion, rowvalues) VALUES (?, ?, ?);"
const stmtInsertSort: String  = "INSERT INTO Sort (idInteraction, idSuggestionType) VALUES (?, ?);"
const stmtInsertEdit: String  = "INSERT INTO Edit (idInteraction, idSuggestion, idEntryType, chosen) VALUES (?, ?, ?, ?);"

/**
 * save new interaction id
 */
//DB Code
async function insertInteraction(idSession: String, idInteractionType: String, callback: CallableFunction) {
    try {
        const [results, fields] = await db.query(stmtInsertInteraction, [idSession, idInteractionType]);
        callback(null, results, fields);
    } catch (error) {
        db.logDatabaseError(error, "error during insert interaction", "warn");
        callback(error);
    }
}