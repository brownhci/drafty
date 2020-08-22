import { Request, Response, NextFunction } from "express";
import { insertClick, insertDoubleClick, insertCopyCell, insertCopyColumn, insertSearch, insertSort } from "../database/interaction";

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
export const postNewRow = (req: Request, res: Response) => {
  // check for errors
  const rowvalues = req.body.rowValues;
  console.log("postNewRow: " + rowvalues);
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

/**
 * POST /click
 * Click
 *
 * @param {number} req.body.idSuggestion
 * @param {Array<string>} req.body.rowValues
 */
export const postClick = (req: Request, res: Response) => {
  const idSession = req.session.user.idSession;
  const idSuggestion = req.body.idSuggestion;
  const rowvalues = req.body.rowValues;
  try {
    insertClick(idSession, idSuggestion, rowvalues);
  return res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(500);
  }
};

/**
 * POST /click-double
 * Double click
 * @param {number} req.body.idSuggestion
 * @param {Array<string>} req.body.rowValues
 */
export const postClickDouble = (req: Request, res: Response) => {
  const idSession = req.session.user.idSession;
  const idSuggestion = req.body.idSuggestion;
  const rowvalues = req.body.rowValues;

  try {
    insertDoubleClick(idSession, idSuggestion, rowvalues);
    return res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(500);
  }
};

/**
 * POST /sort
 * Sort
 * @param {number} req.body.idSuggestionType
 * @param {number} req.body.isAsc
 * @param {number} req.body.isTrigger
 * @param {number} req.body.isMulti
 */
export const postSort = (req: Request, res: Response) => {
  const idSession = req.session.user.idSession;
  const idSuggestionType: number|string = req.body.idSuggestionType;
  const isAsc: number = req.body.isAsc;
  // sw - multi column sorting is not implemented yet
  const isTrigger: number = 1;
  const isMulti: number = 0;
  try {
    insertSort(idSession, idSuggestionType, isAsc, isTrigger, isMulti);
    return res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(500);
  }
};

/**
 * POST /search-partial
 * Partial search
 * @param {number|string} req.body.idSuggestionType
 * @param {number} req.body.isMulti
 * @param {string} req.body.value
 * @param {string} req.body.matchedValues
 *
 * (pipe delimited)-> idSuggestionType|idSearchType|value||idSuggestionType|idSearchType|value
 * @param {string} req.body.multiSearchValues
 */
export const postSearchPartial = (req: Request, res: Response) => {
  const idSession = req.session.user.idSession;
  const idSuggestionType: number|string = req.body.idSuggestionType;

  const isPartial: number = 1;
  const isMulti: number = req.body.isMulti;
  const isFromUrl: number = 0; // sw feature not implemented yet
  const value: string = req.body.value;
  const matchedValues: string = req.body.matchedValues;

  const multiSearchValues: string = req.body.multiSearchValues;

  try {
    insertSearch(idSession, idSuggestionType, isPartial, isMulti, isFromUrl, value, matchedValues, multiSearchValues);
    return res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(500);
  }
};

/**
 * POST /search-full
 * Full search
 * @param {number|string} req.body.idSuggestionType
 * @param {number} req.body.isMulti
 * @param {string} req.body.value
 * @param {string} req.body.matchedValues
 *
 * (pipe delimited)-> idSuggestionType|idSearchType|value||idSuggestionType|idSearchType|value
 * @param {string} req.body.multiSearchValues
 */
export const postSearchFull = (req: Request, res: Response) => {
  const idSession = req.session.user.idSession;
  const idSuggestionType: number|string = req.body.idSuggestionType;

  const isPartial: number = 0;
  const isMulti: number = req.body.isMulti;
  const isFromUrl: number = 0; // sw feature not implemented yet
  const value: string = req.body.value;
  const matchedValues: string = req.body.matchedValues;

  const multiSearchValues: string = req.body.multiSearchValues;

  try {
    insertSearch(idSession, idSuggestionType, isPartial, isMulti, isFromUrl, value, matchedValues, multiSearchValues);
  return res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(500);
  }
};


/**
 * POST /copy-cell
 * Copy
 *
 * @param {number} req.body.idSuggestion
*/
export const postCopyCell = (req: Request, res: Response) => {
  const idSession = req.session.user.idSession;
  const idSuggestion: number|string = req.body.idSuggestion;
  try {
    insertCopyCell(idSession,idSuggestion);
    return res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(500);
  }
};

/**
 * POST /copy-column
 * Copy entire column
 *
 * @param {number} req.body.idSuggestionType
 */
export const postCopyColumn = (req: Request, res: Response) => {
  const idSession = req.session.user.idSession;
  const idSuggestionType: number|string = req.body.idSuggestionType;

  try {
    insertCopyColumn(idSession,idSuggestionType);
  return res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(500);
  }
};