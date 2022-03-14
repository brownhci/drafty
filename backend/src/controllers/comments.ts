import { NextFunction, Request, Response } from 'express';
import { selectComments, insertNewComment, updateNewCommentVoteUp, updateNewCommentVoteDown } from '../database/interaction';

export const getComments = async (req: Request, res: Response, next: NextFunction) => {
  const idSession = req.session.user.idSession;
  const idRow = req.query.idrow.toString();
  const [error, results] = await selectComments(idSession, idRow);
  if (error) {
    return next(error);
  }
  return res.status(200).json(results);
};

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

export const postCommentVoteUp = (req: Request, res: Response) => {
  try {
    const idSession = req.session.user.idSession;
    const idComment = req.body.idComment;
    const vote = req.body.vote;
    updateNewCommentVoteUp(idSession, idComment, vote);
    return res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(500);
  }
};

export const postCommentVoteDown = (req: Request, res: Response) => {
  try {
    const idSession = req.session.user.idSession;
    const idComment = req.body.idComment;
    const vote = req.body.vote;
    updateNewCommentVoteDown(idSession, idComment, vote);
    return res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(500);
  }
};
