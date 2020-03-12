import { Request, Response, NextFunction } from "express";
import { getSuggestionsWithSuggestionType, newSuggestion, selectSuggestionsForEdit } from "../database/suggestion";
import { isValidIdSuggestionType } from "../validation/validators";

/**
 * GET /suggestions?idSuggestionType=...
 * get suggestions
 */
export const getSuggestions = async (req: Request, res: Response, next: NextFunction) => {
  if (await isValidIdSuggestionType(req) === false) {
    return res.sendStatus(400);
  }
  const idSuggestionType: string = req.query.idSuggestionType;
  const suggestionType: number = Number.parseInt(idSuggestionType);

  // valid suggestion type, get suggestions from database
  const [error, results] = await getSuggestionsWithSuggestionType(suggestionType);
  if (error) {
    return next(error);
  }

  return res.status(200).json(results);
};


/**
 * GET /suggestions?idSuggestionType=...
 * get suggestions
 */
export const getSuggestionsForEdit = async (req: Request, res: Response, next: NextFunction) => {
  const idSuggestion: number = req.query.idSuggestion;

  // valid suggestion type, get suggestions from database
  const [error, results] = await selectSuggestionsForEdit(idSuggestion);
  if (error) {
    return next(error);
  }

  return res.status(200).json(results);
};

/**
 * POST /suggestions/new
 * save suggestion (edit)
 *
 * @param {number} req.body.idUniqueID
 * @param {number} req.body.idSuggestion
 * @param {string} req.body.value
 */
export const postNewSuggestion = async (req: Request, res: Response, next: NextFunction) => {
  const idSuggestion: number = Number.parseInt(req.body.idSuggestion);
  const suggestion: string = req.body.suggestion;

  const idProfile: number = Number.parseInt(req.session.user.idProfile);
  const idSession: number = req.session.user.idSession;

  const idInteractionType = 6; // 6 = editRecord
  const idEntryType = 2; // 2 = EditOnline
  const mode = "normal"; // normal is default

  // will get new/old idSuggestion for the edited cell
  const [error, results] = await newSuggestion(idSuggestion, suggestion, idProfile, idSession, idInteractionType, idEntryType, mode);
  if (error) {
    return next(error);
  }

  return res.status(200).json(results);
};