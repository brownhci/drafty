import { Request, Response } from 'express';
import { insertClick, insertDoubleClick, insertPasteCell, insertCopyCell, insertSearch, insertSort, insertSearchGoogle, getUserContributionHistory } from '../database/interaction';

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
  const idSuggestionType: number | string = req.body.idSuggestionType;
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
  const idSuggestionType: number | string = req.body.idSuggestionType;

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
  const idSuggestionType: number | string = req.body.idSuggestionType;

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
 * POST /search-google
 * 
 * @param {number} req.body.idSuggestion
 * @param {number} req.body.idRow
 *
 * (pipe delimited)-> idSuggestionType|idSearchType|value||idSuggestionType|idSearchType|value
 * @param {Array<string>} req.body.searchValues
 */
export const postSearchGoogle = (req: Request, res: Response) => {
  const idSession = req.session.user.idSession;
  const idRow: number = req.body.idRow;
  const idSuggestion: number = req.body.idSuggestion;
  const searchValues: Array<string> = req.body.searchValues;

  try {
    //console.log('postSearchGoogle:',idSession, idRow, idSuggestion, searchValues);
    insertSearchGoogle(idSession, idRow, idSuggestion, searchValues);
    return res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(500);
  }
};

/**
 * POST /paste-cell
 * Copy
 *
 * @param {number} req.body.idSuggestion
*/
export const postPasteCell = (req: Request, res: Response) => {
  const idSession = req.session.user.idSession;
  const pasteVal: string | any = req.body.pasteVal;
  const pasteCellVal: string | any = req.body.pasteCellVal;
  const pasteCellIdSuggestion: number = req.body.pasteCellIdSuggestion;
  const copyCellVal: string | any = req.body.copyCellVal;
  const copyCellIdSuggestion: number = req.body.copyCellIdSuggestion;
  try {
    insertPasteCell(idSession, pasteVal, pasteCellVal, pasteCellIdSuggestion, copyCellVal, copyCellIdSuggestion);
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
  const idSuggestion: number | string = req.body.idSuggestion;
  try {
    insertCopyCell(idSession, idSuggestion);
    return res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(500);
  }
};

export async function getContributionHistory(idSession: string) {
  const contributionHistory = await getUserContributionHistory(idSession);
  return contributionHistory;
}