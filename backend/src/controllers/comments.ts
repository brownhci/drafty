import { Request, Response } from 'express';
import { insertNewComment, insertNewCommentVote } from '../database/interaction';


/**
 * POST /comment
 * 
 * @param {number} req.body.idUniqueID
 * @param {string} req.body.comment
 *
 * (pipe delimited)-> idSuggestionType|idSearchType|value||idSuggestionType|idSearchType|value
 * @param {Array<string>} req.body.searchValues
 */
 export const postNewComment = (req: Request, res: Response) => {
  const idSession = req.session.user.idSession;
  const idUniqueID: number = req.body.idUniqueID;
  const comment: string = req.body.comment;

  try {
    insertNewComment(idSession, idUniqueID, comment);
    return res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(500);
  }
};

/**
 * POST /comment
 * 
 * @param {number} req.body.idComment
 * @param {string} req.body.vote
 * @param {string} req.body.idInteractionType
 *
 * (pipe delimited)-> idSuggestionType|idSearchType|value||idSuggestionType|idSearchType|value
 * @param {Array<string>} req.body.searchValues
 */
 export const postNewCommentVote = (req: Request, res: Response) => {
    const idSession = req.session.user.idSession;
    const idComment: number = req.body.idComment;
    const vote: string = req.body.vote;
    const idInteractionType: string | number = req.body.idInteractionType;
  
    try {
      insertNewCommentVote(idSession, idComment, vote, idInteractionType);
      return res.sendStatus(200);
    } catch (error) {
      return res.sendStatus(500);
    }
  };