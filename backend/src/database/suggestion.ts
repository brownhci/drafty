import { db,logDbErr } from "./mysql";

const stmtInsertSuggestion: string = "INSERT INTO Suggestions (idSuggestion, idSuggestionType, idUniqueID, idProfile, suggestion, confidence) VALUES (null, ?, ?, ?, ?, ?)";
const stmtInsertUniqueId: string = "INSERT INTO UniqueId (idUniqueID, active) VALUES (null, 1)";
const stmtSelectPrevSuggestions: string = "SELECT * FROM Suggestions WHERE idUniqueID = ? AND idSuggestionType = ? GROUP BY suggestion ORDER BY suggestion"

/**
 * save new suggestion
 */
export async function insertSuggestion(idSuggestionType: number, idUniqueID: number, idProfile: number, suggestion: string, confidence: number, callback: CallableFunction) {
    try {
        const [results, fields] = await db.query(stmtInsertSuggestion, [idSuggestionType, idUniqueID, idProfile, suggestion, confidence]);
        callback(null, results, fields);
    } catch (error) {
        logDbErr(error, "error during insert interaction", "warn");
        callback(error);
    }
}

/**
 * save new row
 */
export async function insertRowId(callback: CallableFunction) {
    try {
        const [results, fields] = await db.query(stmtInsertUniqueId);
        callback(null, results, fields);
    } catch (error) {
        logDbErr(error, "error during insert row (UniqueID)", "warn");
        callback(error);
    }
}