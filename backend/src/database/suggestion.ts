import { db,logDbErr } from "./mysql";
import { tableName, suggestion, active, confidence } from "../models/suggestion";

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

/**
 * Get suggestions with specified suggestion type.
 */
export async function getSuggestionsWithSuggestionType(idSuggestionType: string, onlyActiveSuggestions = true, suggestionNonEmpty = true) {
  const stmtSelSuggestions = `SELECT ??, max(??) as ?? FROM ?? WHERE${onlyActiveSuggestions ? " ?? = 1 AND " : ""}${suggestionNonEmpty ? " ?? != '' AND " : ""}idSuggestionType = ? GROUP BY ?? ORDER BY max(??) DESC, ??;`;
  try {
    const values = [suggestion, confidence, confidence, tableName];
    if (onlyActiveSuggestions) {
      values.push(active);
    }
    if (suggestionNonEmpty) {
      values.push(suggestion);
    }
    values.push(idSuggestionType, suggestion, confidence, suggestion);
    const [results] = await db.query(stmtSelSuggestions, values);
    return [null, results];
  } catch (error) {
    logDbErr(error, "error during updating existing user", "warn");
    return [error];
  }
}