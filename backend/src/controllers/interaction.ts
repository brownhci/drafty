import { Request, Response, NextFunction } from "express";
import { insertClick, insertDoubleClick, insertCopyCell, insertCopyColumn, insertSearch, insertSearchMulti, insertSort } from "../database/interaction";

/**
 * POST /new-row
 * Add new row
 */
export const postNewRow = (req: Request, res: Response, next: NextFunction) => {
    //check for errors
    // TODO
    return res.sendStatus(200);
};

/**
 * POST /edit
 * Edit
 *
 * @param {number} req.body.idUniqueID
 * @param {number} req.body.idSuggestion
 * @param {string} req.body.value
 */
export const postEdit = (req: Request, res: Response, next: NextFunction) => {
  // TODO
  const edit = req.body.edit;
  console.log(`received user edit: ${edit}`);

  /*
  * Each Edit is one of 3 possible scenarios:
  * 1. The suggested value already exists, therefore we need to increment the confidence
  * 2. It is a new suggestion for that row/column (idUniqueId/idSuggestionType)
  * 3. It is an Alias: the edit is similar to an existing suggestion for that row/column (idUniqueId/idSuggestionType)
  * FINALLY: record the edit happened and return the idSuggestion if #1
  */

  return res.sendStatus(200);
};

/**
 * POST /click
 * Click
 *
 * @param {number} req.body.idSuggestion
 * @param {Array<string>} req.body.rowValues
 */
export const postClick = (req: Request, res: Response, next: NextFunction) => {
  const idSession = req.session.user.idSession; 
  const idSuggestion = req.body.idSuggestion;
  const rowvalues = req.body.rowValues;
  insertClick(idSession, idSuggestion, rowvalues);
  return res.sendStatus(200);
};

/**
 * POST /click-double
 * Double click
 * @param {number} req.body.idSuggestion
 * @param {Array<string>} req.body.rowValues
 */
export const postClickDouble = (req: Request, res: Response, next: NextFunction) => {
  const idSession = req.session.user.idSession; 
  const idSuggestion = req.body.idSuggestion;
  const rowvalues = req.body.rowValues;
  insertDoubleClick(idSession, idSuggestion, rowvalues);
  return res.sendStatus(200);
};

/**
 * POST /sort
 * Sort
 * @param {number} req.body.idSuggestionType
 * @param {number} req.body.isAsc
 * @param {number} req.body.isTrigger
 * @param {number} req.body.isMulti
 */
export const postSort = (req: Request, res: Response, next: NextFunction) => {
  const idSession = req.session.user.idSession; 
  const idSuggestionType: number|string = req.body.idSuggestionType;
  const isAsc: number = req.body.isAsc;
  // sw - multi column sorting is not implemented yet
  const isTrigger: number = 1;
  const isMulti: number = 0;
  insertSort(idSession, idSuggestionType, isAsc, isTrigger, isMulti);
  return res.sendStatus(200);
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
export const postSearchPartial = (req: Request, res: Response, next: NextFunction) => {
  const idSession = req.session.user.idSession;
  const idSuggestionType: number|string = req.body.idSuggestionType;

  const isPartial: number = 1;
  const isMulti: number = req.body.isMulti;
  const isFromUrl: number = 0; // sw feature not implemented yet
  const value: string = req.body.value;
  const matchedValues: string = req.body.matchedValues;

  const multiSearchValues: string = req.body.multiSearchValues;

  insertSearch(idSession, idSuggestionType, isPartial, isMulti, isFromUrl, value, matchedValues, multiSearchValues);
  return res.sendStatus(200);
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
export const postSearchFull = (req: Request, res: Response, next: NextFunction) => {
  const idSession = req.session.user.idSession;
  const idSuggestionType: number|string = req.body.idSuggestionType;

  const isPartial: number = 0;
  const isMulti: number = req.body.isMulti;
  const isFromUrl: number = 0; // sw feature not implemented yet
  const value: string = req.body.value;
  const matchedValues: string = req.body.matchedValues;

  const multiSearchValues: string = req.body.multiSearchValues;

  insertSearch(idSession, idSuggestionType, isPartial, isMulti, isFromUrl, value, matchedValues, multiSearchValues);
  return res.sendStatus(200);
};


/**
 * POST /copy-cell
 * Copy
 *
 * @param {number} req.body.idSuggestion
*/
export const postCopyCell = (req: Request, res: Response, next: NextFunction) => {
  const idSession = req.session.user.idSession;
  const idSuggestion: number|string = req.body.idSuggestion;
  insertCopyCell(idSession,idSuggestion);
  return res.sendStatus(200);
};

/**
 * POST /copy-column
 * Copy entire column
 *
 * @param {number} req.body.idSuggestionType
 */
export const postCopyColumn = (req: Request, res: Response, next: NextFunction) => {
  const idSession = req.session.user.idSession;
  const idSuggestionType: number|string = req.body.idSuggestionType;
  insertCopyColumn(idSession,idSuggestionType);
  return res.sendStatus(200);
};