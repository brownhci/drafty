import { Request, Response, NextFunction } from "express";
import { getSuggestionsWithSuggestionType, newSuggestion } from "../database/suggestion";
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
 * POST /suggestions/new?idSuggestion=val&suggestion=?
 * get suggestions
 */
export const postNewSuggestion = async (req: Request, res: Response, next: NextFunction) => {
  console.log('\n\n\npostNewSuggestion')
  console.log(req.query)
  
  const idSuggestion: number = Number.parseInt(req.query.idSuggestion);
  const suggestion: string = req.query.suggestion;
  const idProfile: number = Number.parseInt(req.session.user.idProfile);

  // will get new/old idSuggestion for the edited cell
  const [error, results] = await newSuggestion(idSuggestion, suggestion, idProfile);
  if (error) {
    return next(error);
  }

  return res.status(200).json(results);
};