import { db,logDbErr } from "./mysql";
import { tableName as sugggestionTableName, idSuggestionType as idSuggestionTypeFieldName, suggestionText as suggestionTextFieldName } from "../models/suggestionTypeValues";
import { tableName as suggestionTypeTableName, name as nameTableFieldName } from "../models/suggestionType";

const stmtSuggestionExist: string = "SELECT count(*) as ct FROM Suggestions WHERE idSuggestionType = ? AND idUniqueId = ? AND suggestion = ?";
const stmtUpdateSuggestionConfidence: string = "UPDATE Suggestions s INNER JOIN  (SELECT MAX(s1.confidence) + 1 as max_conf, s2.idSuggestion as id_sugg_update FROM Suggestions s1 INNER JOIN Suggestions s2 ON s1.idSuggestionType = s2.idSuggestionType AND s1.idUniqueID = s2.idUniqueID WHERE s2.idSuggestion = ?) as s_max ON s_max.id_sugg_update = s.idSuggestion SET s.confidence = s_max.max_conf WHERE s.idSuggestion = ?";
const stmtInsertSuggestion: string = "INSERT INTO Suggestions (idSuggestion, idSuggestionTypeFieldName, idUniqueID, idProfile, suggestion, confidence) VALUES (null, ?, ?, ?, ?, ?)";
const stmtInsertUniqueId: string = "INSERT INTO UniqueId (idUniqueID, active) VALUES (null, 1)";
const stmtSelectPrevSuggestions: string = "SELECT * FROM Suggestions WHERE idUniqueID = ? AND idSuggestionTypeFieldName = ? GROUP BY suggestion ORDER BY suggestion";
const stmtSelectSuggestionTypeValues: string = "SELECT value as suggestion FROM SuggestionTypeValues WHERE idSuggestionType = ? ORDER BY suggestion asc";
const stmtSelectSuggestionsWithSuggestionType: string = "SELECT suggestion FROM Suggestions WHERE idSuggestionType = ? AND active = 1 group by suggestion ORDER BY suggestion asc";

/**
 * returns 0 or 1 if suggestion exists in DB
 */
export async function doesSuggestionExist(idSuggestion: number, idSuggestionType: number, idUniqueID: number, suggestion: string, callback: CallableFunction) {
  try {
      const [results, fields] = await db.query(stmtSuggestionExist, [idSuggestionType,idUniqueID,suggestion]);
  } catch (error) {
      logDbErr(error, "error during doesSuggestionExist", "warn");
  }
}

/**
 * updates new suggestion confidence
 * needs only the idSuggestion for the newly chosen suggestion ;)
 */
export function updateSuggestion(idSuggestion: number) {
  try {
      db.query(stmtUpdateSuggestionConfidence, [idSuggestion,idSuggestion]);
  } catch (error) {
      logDbErr(error, "error during update suggestion confidence", "warn");
  }
}

/**
 * save new suggestion
 */
export async function insertSuggestion(idSuggestionType: number, idUniqueID: number, idProfile: number, suggestion: string, callback: CallableFunction) {
    try {
        const [results, fields] = await db.query(stmtInsertSuggestion, [idSuggestionType, idUniqueID, idProfile, suggestion]);
        updateSuggestion(results.insertId); // increments confidence
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
 * @param {string} idSuggestionType - A number representing the suggestion type (between {@link ../models/suggestion.ts idSuggestionTypeLowerBound } and {@link ../models/suggestion.ts idSuggestionTypeUpperBound }
 * @returns {(Error|null, Array<SuggestionRow>)} Either an error when lookup fails or null and an array of SuggestionRow as results.
 */
export async function getSuggestionsWithSuggestionType(idSuggestionType: number) {
  try {
    // const [results] = await db.query("select ?? AS suggestion from ?? where ?? = ?", [suggestionTextFieldName, sugggestionTableName, idSuggestionTypeFieldName, idSuggestionType]);
    // only pull by idSuggestionType; add GROUP BY to reduce duplicates, and apply a default sorting
    const [results] = await db.query(stmtSelectSuggestionsWithSuggestionType, [idSuggestionType]);
    return [null, results];
  } catch (error) {
    logDbErr(error, "error during fetching suggestions", "warn");
    return [error];
  }
}

/**
 * Get suggestionTypeValues with specified suggestion type.
 *
 * @param {string} idSuggestionType - A number representing the suggestion type (between {@link ../models/suggestion.ts idSuggestionTypeLowerBound } and {@link ../models/suggestion.ts idSuggestionTypeUpperBound }
 * @returns {(Error|null, Array<SuggestionRow>)} Either an error when lookup fails or null and an array of SuggestionRow as results.
 */
export async function getSuggestionTypeValues(idSuggestionType: number) {
  try {
    // only pull by idSuggestionType; add GROUP BY to reduce duplicates, and apply a default sorting
    const [results] = await db.query(stmtSelectSuggestionTypeValues, [idSuggestionType]);
    return [null, results];
  } catch (error) {
    logDbErr(error, "error during fetching suggestions", "warn");
    return [error];
  }
}

// TODO POTENTIAL The following implementation pulls from SuggestionType instead of SuggestionTypeValues, could be used in the future for correct user suggestion
// export async function getSuggestionsWithSuggestionType(idSuggestionType: string, onlyActiveSuggestions = true, suggestionNonEmpty = true) {
//   const suggestionType: number = Number.parseInt(idSuggestionType);
//   const matchNameField = Number.isNaN(suggestionType);
//   const name = idSuggestionType;
//
//   const stmtSelSuggestions = `SELECT ??, max(??) as ?? FROM ?? WHERE${onlyActiveSuggestions ? " ?? = 1 AND " : ""}${suggestionNonEmpty ? " ?? != '' AND " : ""} ${matchNameField ? "?? IN (SELECT ?? from ?? WHERE ?? = ?)" : "?? = ?"} GROUP BY ?? ORDER BY max(??) DESC, ??;`;
//   try {
//     const values: Array<number | string> = [suggestion, confidence, confidence, suggestionTableName];
//     if (onlyActiveSuggestions) {
//       values.push(active);
//     }
//     if (suggestionNonEmpty) {
//       values.push(suggestion);
//     }
//     if (matchNameField) {
//       values.push(idSuggestionTypeFieldName, idSuggestionTypeFieldName, suggestionTypeTableName, nameTableFieldName, name);
//     } else {
//       values.push(idSuggestionTypeFieldName, suggestionType);
//     }
//
//     values.push(suggestion, confidence, suggestion);
//     const [results] = await db.query(stmtSelSuggestions, values);
//     return [null, results];
//   } catch (error) {
//     logDbErr(error, "error during fetching suggestions", "warn");
//     return [error];
//   }
// }