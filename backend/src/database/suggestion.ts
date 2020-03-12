import { db,logDbErr } from "./mysql";
import { tableName as sugggestionTableName, idSuggestionType as idSuggestionTypeFieldName, suggestionText as suggestionTextFieldName } from "../models/suggestionTypeValues";
import { tableName as suggestionTypeTableName, name as nameTableFieldName } from "../models/suggestionType";

//idSuggestion, suggestion, idProfile
const stmtProcedureEdit: string = "SET @id = ?; CALL new_suggestion(@id,?,?); SELECT @id AS idSuggestion;";

//idSuggestionPrev_var, idSuggestionChosen_var, idSession_var, idInteractionType_var, idEntryType_var, mode_var
const stmtProcedureEditSuggestions: string = "CALL insert_edit_suggestions(?, ?, ?, ?, ?, ?);";

const stmtInsertUniqueId: string = "INSERT INTO UniqueId (idUniqueID, active) VALUES (null, 1)";

const stmtSelectSuggestionsWithSuggestionType: string = "SELECT suggestion FROM Suggestions WHERE idSuggestionType = ? AND active = 1 group by suggestion ORDER BY suggestion asc";
const stmtSelectSuggestionsForEdit: string = "SELECT suggestion, 1 as prevSugg FROM Suggestions  WHERE idSuggestionType = (SELECT idSuggestionType FROM Suggestions WHERE idSuggestion = ?) AND idUniqueID = (SELECT idUniqueID FROM Suggestions WHERE idSuggestion = ?) "
                                          + " UNION "
                                          + " SELECT value as suggestion, 0 as prevSugg FROM SuggestionTypeValues WHERE idSuggestionType = (SELECT idSuggestionType FROM Suggestions WHERE idSuggestion = ?) "
                                          + " ORDER BY prevSugg DESC, suggestion ASC ";

/**
 * returns current or new idSuggestion
 */
export async function newSuggestion(idSuggestion: number, suggestion: string, idProfile: number, idSession: number, idInteractionType: number, idEntryType: number, mode: string) {
  try {
      const [results, fields] = await db.query(stmtProcedureEdit, [idSuggestion,suggestion,idProfile]);
      
      //idSuggestionPrev_var, idSuggestionChosen_var, idSession_var, idInteractionType_var, idEntryType_var, mode_var
      const idSuggestionPrev = idSuggestion;
      const idSuggestionChosen = results[2][0]['idSuggestion']; // sw: this is bc of how procedures return data
      db.query(stmtProcedureEditSuggestions, [idSuggestionPrev, idSuggestionChosen, idSession, idInteractionType, idEntryType, mode]);
      
      return [null, results];
  } catch (error) {
    logDbErr(error, "error during newSuggestion procedure", "warn");
    return [error];
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
 * get prev suggestions and all suggestion type values for edit modal
 * @returns results will contain two fields: suggestion and prevSugg. prevSugg is a boolean if suggestion is a previous edit
 */
export async function selectSuggestionsForEdit(idSuggestion: number) {
  try {
      const [results, fields] = await db.query(stmtSelectSuggestionsForEdit, [idSuggestion,idSuggestion,idSuggestion]);
      return [null, results];
  } catch (error) {
      logDbErr(error, "error during selectSuggestionsForEdit", "warn");
      return [error];
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