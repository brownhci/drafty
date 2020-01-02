import { db,logDbErr } from "./mysql";
import { tableName as suggestionTableName, suggestion, active, confidence, idSuggestionType as idSuggestionTypeFieldName } from "../models/suggestion";
import { tableName as suggestionTypeTableName, name as nameTableFieldName } from "../models/suggestionType";

const stmtInsertSuggestion: string = "INSERT INTO Suggestions (idSuggestion, idSuggestionTypeFieldName, idUniqueID, idProfile, suggestion, confidence) VALUES (null, ?, ?, ?, ?, ?)";
const stmtInsertUniqueId: string = "INSERT INTO UniqueId (idUniqueID, active) VALUES (null, 1)";
const stmtSelectPrevSuggestions: string = "SELECT * FROM Suggestions WHERE idUniqueID = ? AND idSuggestionTypeFieldName = ? GROUP BY suggestion ORDER BY suggestion";

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
 *
 * @param {string} idSuggestionType - Either a numberic string representing the suggestion type (between {@link ../models/suggestion.ts idSuggestionTypeLowerBound } and {@link ../models/suggestion.ts idSuggestionTypeUpperBound } or a string value from {@link ../models/suggestion.ts names}
 * @returns {(Error|null, Array<SuggestionRow>)} Either an error when lookup fails or null and an array of SuggestionRow as results.
 */
export async function getSuggestionsWithSuggestionType(idSuggestionType: string, onlyActiveSuggestions = true, suggestionNonEmpty = true) {
  const suggestionType: number = Number.parseInt(idSuggestionType);
  const matchNameField = Number.isNaN(suggestionType);
  const name = idSuggestionType;

  const stmtSelSuggestions = `SELECT ??, max(??) as ?? FROM ?? WHERE${onlyActiveSuggestions ? " ?? = 1 AND " : ""}${suggestionNonEmpty ? " ?? != '' AND " : ""} ${matchNameField ? "?? IN (SELECT ?? from ?? WHERE ?? = ?)" : "?? = ?"} GROUP BY ?? ORDER BY max(??) DESC, ??;`;
  try {
    const values: Array<number | string> = [suggestion, confidence, confidence, suggestionTableName];
    if (onlyActiveSuggestions) {
      values.push(active);
    }
    if (suggestionNonEmpty) {
      values.push(suggestion);
    }
    if (matchNameField) {
      values.push(idSuggestionTypeFieldName, idSuggestionTypeFieldName, suggestionTypeTableName, nameTableFieldName, name);
    } else {
      values.push(idSuggestionTypeFieldName, suggestionType);
    }

    values.push(suggestion, confidence, suggestion);
    const [results] = await db.query(stmtSelSuggestions, values);
    return [null, results];
  } catch (error) {
    logDbErr(error, "error during fetching suggestions", "warn");
    return [error];
  }
}