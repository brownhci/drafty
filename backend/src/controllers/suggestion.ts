import { Request, Response, NextFunction } from "express";
import { getSuggestionsWithSuggestionType } from "../database/suggestion";
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

  // valid suggestion type, get suggestions from database
  const [error, results] = await getSuggestionsWithSuggestionType(idSuggestionType);
  if (error) {
    return next(error);
  }

  return res.status(200).json(results);
};
