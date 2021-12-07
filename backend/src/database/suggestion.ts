import { db, logDbErr } from './mysql';

/*
* var used idSuggestion, suggestion, idProfile
*/
const stmtProcedureEdit: string = 'SET @p0=?; SET @p1=?; SET @p2=?; CALL new_suggestion(@p0, @p1, @p2, @p3); SELECT @p0 AS idSuggestion, @p3 AS isNewSuggestion; ';

/*
* idSuggestionPrev_var, idSuggestionChosen_var, idSession_var, idInteractionType_var, idEntryType_var, mode_var
*/
const stmtProcedureEditSuggestions: string = 'CALL insert_edit_suggestions(?, ?, ?, ?, ?, ?, ?) ';

const stmtInsertUniqueId: string = 'INSERT INTO UniqueId (idUniqueID, active) VALUES (null, 1) ';

//INSERT INTO Edit (idInteraction, idEntryType, mode) VALUES (insert_interaction(idSession_var,idInteractionType_var), idEntryType_var, mode_var);
const stmtInsertInteractionAndEdit: string = 'INSERT INTO Edit (idInteraction, idEntryType, mode) VALUES (insert_interaction(?,?), ?, ?) ';

// suggestion_var, idEdit_var, idProfile_var, idSuggestionType_var, idUniqueId_var
const stmtInsertNewRowSuggestion: string = 'SET @p0=?; SET @p1=?; SET @p2=?; SET @p3=?; SET @p4=?; CALL new_suggestion_new_row(@p0, @p1, @p2, @p3, @p4, @p5);  SELECT @p5 AS idSuggestion_new;';

//idProfile_var, idUniqueId_var
const stmtInsertNewRowSuggestionUserCredit: string = 'CALL new_user_credit_suggestion_new_row(?, ?) ';

const stmtInsertDelRow: string = 'INSERT INTO Edit_DelRow (idInteraction, idUniqueID, comment) VALUES (insert_interaction(?,?), ?, ?)';

const stmtDeactivateRow: string = 'UPDATE UniqueId SET active = 0, notes = ? WHERE idUniqueID = ?;';

const stmtSelectSuggestionsWithSuggestionType: string = 'SELECT suggestion FROM Suggestions WHERE idSuggestionType = ? AND active = 1 GROUP BY suggestion ORDER BY suggestion asc';
const stmtSelectSuggestionsForEdit: string = 'SELECT suggestion, 1 as prevSugg FROM Suggestions  WHERE idSuggestionType = (SELECT idSuggestionType FROM Suggestions WHERE idSuggestion = ?) AND idUniqueID = (SELECT idUniqueID FROM Suggestions WHERE idSuggestion = ?) '
  + ' UNION '
  + ' SELECT stv.value as suggestion, 0 as prevSugg  FROM (SELECT * FROM SuggestionTypeValues WHERE active = 1) stv WHERE stv.idSuggestionType = (SELECT idSuggestionType FROM Suggestions WHERE idSuggestion = ?) '
  + ' ORDER BY prevSugg DESC, suggestion ASC ';

const stmtGetSuggestionTypeValidationRule: string = 'SELECT idSuggestionType, regex FROM SuggestionType;';

/**
 * returns current or new idSuggestion
 */
export async function newSuggestion(idSuggestion: number, suggestion: string, idProfile: number, idSession: number, idInteractionType: number, idEntryType: number, mode: string) {
  try {
    const [results] = await db.query(stmtProcedureEdit, [idSuggestion, suggestion, idProfile]);

    //idSuggestionPrev_var, idSuggestionChosen_var, idSession_var, idInteractionType_var, idEntryType_var, mode_var
    const idSuggestionPrev = idSuggestion;
    const pos = Object.keys(results).pop(); // get last
    const idSuggestionChosen = (results as any)[pos][0]['idSuggestion']; // sw: this is bc of how procedures return data

    db.query(stmtProcedureEditSuggestions, [idSuggestionPrev, idSuggestionChosen, idSession, idInteractionType, idEntryType, mode, idProfile]);

    return [null, idSuggestionChosen];
  } catch (error) {
    logDbErr(error, 'error during newSuggestion procedure', 'warn');
    return [error];
  }
}

/***
 *
 * save new row
 *
 ***/
export async function insertNewRowId() {
  try {
    const [results] = await db.query(stmtInsertUniqueId);
    return [null, results];
  } catch (error) {
    logDbErr(error, 'error during insert row (UniqueID)', 'warn');
    return error;
  }
}

/***
*
* Only used for New Row
* @returns results contain idEdit
*
***/
export async function insertInteractionAndEdit(idSession: number, idInteractionType: number, idEntryType: number, mode: string) {
  try {
    const [results] = await db.query(stmtInsertInteractionAndEdit, [idSession, idInteractionType, idEntryType, mode]);
    return [null, results];
  } catch (error) {
    console.log(error);
    logDbErr(error, 'error during insertInteractionAndEdit', 'warn');
    return error;
  }
}

/***
*
* Only used for New Row
* @returns results contain idSuggestion
*
***/
export async function insertNewRowSuggestion(suggestion: string, idEdit: number, idProfile: number, idSuggestionType: number, idUniqueId: number) {
  try {
    //console.log("stmtInsertNewRowSuggestion: ", "suggestion", suggestion, "idEdit", idEdit, "idProfile", idProfile, "idSuggestionType", idSuggestionType, "idUniqueId", idUniqueId)

    const [results] = await db.query(stmtInsertNewRowSuggestion, [suggestion, idEdit, idProfile, idSuggestionType, idUniqueId]);
    console.log(results);

    const pos = Object.keys(results).pop(); // get last
    const idSuggestionNew = (results as any)[pos][0]['idSuggestion_new']; // sw: this is bc of how procedures return data
    //console.log("idSuggestionNew = " + idSuggestionNew);

    return idSuggestionNew;
  } catch (error) {
    console.log(error);
    logDbErr(error, 'error during insertNewRowSuggestion', 'warn');
  }
}

/***
*
* Only used for New Row
*
***/
export async function insertNewRowSuggestionUserCredit(idProfile: number, idUniqueId: number) {
  try {
    //console.log("stmtInsertNewRowSuggestionUserCredit: ", idProfile, idUniqueId);
    db.query(stmtInsertNewRowSuggestionUserCredit, [idProfile, idUniqueId]);
  } catch (error) {
    console.log(error);
    logDbErr(error, 'error during insertNewRowSuggestionUserCredit', 'warn');
  }
}

/***
*
* Only used for Del Row
*
***/
export async function deactivateRow(idSession: number, idUniqueID: string, comment: string) {
  try {
    const idInteractionType: number = 17;
    db.query(stmtInsertDelRow, [idSession, idInteractionType, idUniqueID, comment]);
    db.query(stmtDeactivateRow, [idUniqueID, comment]);
  } catch (error) {
    console.log(error);
    logDbErr(error, 'error during deactivateRow', 'warn');
  }
}

/**
 * get prev suggestions and all suggestion type values for edit modal
 * @returns results will contain two fields: suggestion and prevSugg. prevSugg is a boolean if suggestion is a previous edit
 */
export async function selectSuggestionsForEdit(idSuggestion: number) {
  try {
    console.log(`stmtSelectSuggestionsForEdit - idSuggestion ${idSuggestion}`);
    const [results] = await db.query(stmtSelectSuggestionsForEdit, [idSuggestion, idSuggestion, idSuggestion]);
    return [null, results];
  } catch (error) {
    logDbErr(error, 'error during selectSuggestionsForEdit', 'warn');
    return [error];
  }
}

/**
 * Get validation rule for edits. Validation rule is column scoped -- for example, Join Year might be limited to be numeric only.
 * @returns results will be a list of object where each object contains an `idSuggestionType` and a `regex` field.
 */
export async function getValidationRule() {
  try {
    const [results] = await db.query(stmtGetSuggestionTypeValidationRule);
    return [null, results];
  } catch (error) {
    logDbErr(error, 'error during retrieving validation rules', 'warn');
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
    // only pull by idSuggestionType; add GROUP BY to reduce duplicates, and apply a default sorting
    //console.log(`stmtSelectSuggestionsWithSuggestionType - idSuggestionType ${idSuggestionType}`)
    const [results] = await db.query(stmtSelectSuggestionsWithSuggestionType, [idSuggestionType]);
    return [null, results];
  } catch (error) {
    logDbErr(error, 'error during fetching suggestions', 'warn');
    return [error];
  }
}
