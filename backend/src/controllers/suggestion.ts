import { Request, Response, NextFunction } from 'express';
import { getSuggestionsWithSuggestionType, getValidationRule as _getValidationRule, newSuggestion, selectSuggestionsForEdit, insertNewRowId, insertInteractionAndEdit, insertNewRowSuggestion, insertNewRowSuggestionUserCredit, deactivateRow } from '../database/suggestion';
import { isValidIdSuggestionType } from '../validation/validators';

/**
 * GET /suggestions?idSuggestionType=...
 * get suggestions
 */
export const getSuggestions = async (req: Request, res: Response, next: NextFunction) => {
  if (await isValidIdSuggestionType(req) === false) {
    return res.sendStatus(400);
  }
  const idSuggestionType = req.query.idSuggestionType as string;
  const suggestionType: number = Number.parseInt(idSuggestionType);

  // valid suggestion type, get suggestions from database
  const [error, results] = await getSuggestionsWithSuggestionType(suggestionType);
  if (error) {
    return next(error);
  }

  return res.status(200).json(results);
};


/**
 * GET /suggestions/foredit?idSuggestion=...
 * get suggestions
 */
export const getSuggestionsForEdit = async (req: Request, res: Response, next: NextFunction) => {
  const idSuggestion: number = Number.parseInt(req.query.idSuggestion as string);

  // valid suggestion type, get suggestions from database
  const [error, results] = await selectSuggestionsForEdit(idSuggestion);
  if (error) {
    return next(error);
  }

  return res.status(200).json(results);
};

/**
 * GET /suggestions/validation-rule
 * Get validation rule which determines whether an edit is valid. For example, cells for Join Year might be limited to numeric only.
 */
export async function getValidationRule(req: Request, res: Response, next: NextFunction) {
  const [error, results] = await _getValidationRule();
  if (error) {
    return next(error);
  }

  return res.status(200).json(results);
}

/**
 * POST /suggestions/new
 * save suggestion (edit)
 *
 * @param {number} req.body.idUniqueID
 * @param {number} req.body.idSuggestion
 * @param {string} req.body.value
 */
export const postNewSuggestion = async (req: Request, res: Response, next: NextFunction) => {
  //const idUniqueID: string = req.body.idUniqueID; //sw: unused
  const idSuggestion: number = Number.parseInt(req.body.idSuggestion);
  const suggestion: string = req.body.suggestion;

  const idProfile: number = Number.parseInt(req.session.user.idProfile);
  const idSession: number = req.session.user.idSession;

  const idInteractionType = 6; // 6 = editRecord
  const idEntryType = 2; // 2 = EditOnline
  const mode = 'normal'; // normal is default

  // will get new/old idSuggestion for the edited cell
  const [error, results] = await newSuggestion(idSuggestion, suggestion, idProfile, idSession, idInteractionType, idEntryType, mode);
  if (error) {
    return next(error);
  }

  return res.status(200).json(results);
};

/**
 * POST /newrow
 * Add new row
 *
 * @param {Array<String>} req.body.newRowValues - Contains each value for the new row stored in an array.
 * @param {Array<number>} req.body.newRowFields - Contains the idSuggestionType for each corresponding value in newRowValues.
 * @return {Record<string, number | Array<number> | Array<string>}
 *
 *    {
 *        "idUniqueID": <idUniqueID>,
 *        "newRowIds": Array<idSuggestion>,
 *        "newRowFields": Array<idSuggestionType>
 *    }
 */
export const postNewRow = async (req: Request, res: Response) => {
  const idProfile: number = Number.parseInt(req.session.user.idProfile);
  const idSession: number = req.session.user.idSession;

  const idInteractionType = 6; // 6 = editRecord
  const idEntryType = 1; // 1 = NewRow
  const mode = 'normal'; // normal is default

  const rowValues = req.body.newRowValues;
  const rowFields = req.body.newRowFields;

  //logger.info("postNewRow - rowValues: " + rowValues);
  //logger.info("postNewRow - rowFields: " + rowFields);
  try {
    const idUniqueID = await getNewUniqueId();
    const idEdit = await getIdEdit(idSession,idInteractionType,idEntryType,mode);

    const newRowIds: number[] = [];
    const newRowFields: number[] = [];
    for(let i = 0; i < rowFields.length; ++i ) {
      const newSuggestion = rowValues[i];
      const newIdSuggestionType = rowFields[i];
      const idSuggestion = await insertNewRowSuggestion(newSuggestion, idEdit, idProfile, newIdSuggestionType, idUniqueID);
      insertNewRowSuggestionUserCredit(idProfile, idUniqueID);
      newRowIds.push(idSuggestion);
      newRowFields.push(newIdSuggestionType);
    }

    //console.log("idUniqueID", idUniqueID,"newRowIds", newRowIds,"newRowFields", newRowFields);
    return res.status(200).json({
      idUniqueID: idUniqueID,
      newRowIds: newRowIds,
      newRowFields: newRowFields
    });
  } catch (error) {
    return res.sendStatus(400);
  }
};

const getNewUniqueId = async () => {
  const [error,results] = await insertNewRowId();
  if (error) {
    return error;
  }
  return results.insertId;
};

/**
 * POST /delrow
 * Deactivate Row
 *
 * @param {String} req.body.idUniqueID - idUniqueID for the row to be deactivated
 * @param {String} req.body.comment - comment left by the user
 * 
 * @return nothing or confirmation?
 * 
 */
export const delRow = async (req: Request, res: Response) => {
  try {
    const idSession: number = req.session.user.idSession;
    const idUniqueID: string = req.body.idUniqueID;
    const comment: string = req.body.comment;
    await deactivateRow(idSession, idUniqueID, comment);
    return res.status(200);
  } catch (error) {
    return res.sendStatus(400);
  }
};

const getIdEdit = async (idSession: number,idInteractionType: number,idEntryType: number,mode: string) => {
  const [error,results] = await insertInteractionAndEdit(idSession,idInteractionType,idEntryType,mode);
  if (error) {
    return error;
  }
  return results.insertId;
};



/**
 * POST /new-row
 * Add new row
 *
 * @param {Array<String>} req.body.newRowValues - Contains each value for the new row stored in an array.
 * @param {Array<number>} req.body.newRowFields - Contains the idSuggestionType for each corresponding value in newRowValues.
 * @return {Record<string, number | Array<number> | Array<string>}
 *
 *    {
 *        "idUniqueID": <idUniqueID>,
 *        "newRowIds": Array<idSuggestion>,
 *        "newRowFields": Array<idSuggestionType>
 *    }
 */
export const postNewRowTest = (req: Request, res: Response) => {
  // check for errors
  //const rowvalues = req.body.rowValues; // sw - unused
  try {
    // TODO change stub
    return res.status(200).json({
      idUniqueID: 100000,
      newRowIds: [1000000, 1000001, 1000002, 1000003, 1000004, 1000005, 1000006],
      newRowFields: [1, 2, 3, 5, 7, 8, 9]
    });
  } catch (error) {
    return res.sendStatus(400);
  }
};
