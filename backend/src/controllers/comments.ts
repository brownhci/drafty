import { NextFunction, Request, Response } from 'express';
import { selectComments, insertNewComment, updateNewCommentVoteUp, updateNewCommentVoteDown } from '../database/interaction';

/**
 * POST /comments/:idrow
 * 
 * @param {string} req.query.idrow
 *
 */
export const getComments = async (req: Request, res: Response, next: NextFunction) => {
  const idSession = req.session.user.idSession;
  const idRow = req.params.idrow.toString();
  const [error, results] = await selectComments(idSession, idRow);
  if (error) {
    return next(error);
  }
  console.log(results);
  return res.status(200).json(results);
};

/**
 * POST /comments/new
 * 
 * @param {string} req.body.idrow
 * @param {string} req.body.comment
 *
 */
export const postNewComment = async (req: Request, res: Response, next: NextFunction) => {
  const idSession = req.session.user.idSession;
  const idRow = req.body.idrow;
  const comment = req.body.comment;
  const [error, results] = await insertNewComment(idSession, idRow, comment);
  if (error) {
    return next(error);
  }
  return res.status(200).json(results.insertId);
};

/**
 * POST /comments/vote/update/up
 * 
 * @param {number} req.body.idComment
 * @param {string} req.body.vote
 *
 */
export const postCommentVoteUp = (req: Request, res: Response) => {
  try {
    const idSession = req.session.user.idSession;
    const idComment = req.body.idComment;
    const vote = req.body.vote;
    const selected = req.body.selected;
    updateNewCommentVoteUp(idSession, idComment, vote, selected);
    return res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(500);
  }
};

/**
 * POST /comments/vote/update/down
 * 
 * @param {number} req.body.idComment
 * @param {string} req.body.vote
 *
 */
export const postCommentVoteDown = (req: Request, res: Response) => {
  try {
    const idSession = req.session.user.idSession;
    const idComment = req.body.idComment;
    const vote = req.body.vote;
    const selected = req.body.selected;
    updateNewCommentVoteDown(idSession, idComment, vote, selected);
    return res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(500);
  }
};
