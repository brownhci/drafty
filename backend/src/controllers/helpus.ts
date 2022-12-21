import { Request, Response, NextFunction } from 'express';
import { updateHelpUsClosed,updateHelpUsAnswered,updateHelpUsShowAnother,insertHelpUs } from '../database/helpus';

/**
 * POST /helpus/start
 * 
 */export const postHelpUsStart = async (req: Request, res: Response, next: NextFunction) => {
  const idSession = req.session.user.idSession;
    const idUniqueID: string = req.body.idUniqueID;
    const helpUsType: string = req.body.helpUsType;
    const question: string = req.body.question;
  const [error, results] = await insertHelpUs(idSession, idUniqueID, helpUsType, question);
  if (error) {
    return next(error);
  }

  return res.status(200).json(results.insertId);
};

/**
 * POST /helpus/closed
 * 
 */
export const postHelpUsClosed = (req: Request, res: Response) => {
    const idSession = req.session.user.idSession;
    const idHelpUs: string = req.body.idHelpUs;

    try {
      updateHelpUsClosed(idSession, idHelpUs);
      return res.sendStatus(200);
    } catch (error) {
      return res.sendStatus(500);
    }
};

/**
 * POST /helpus/answered
 * 
 */
export const postHelpUsAnswered = (req: Request, res: Response) => {
  const idSession = req.session.user.idSession;
  const idHelpUs: string = req.body.idHelpUs;
  const answer: string = req.body.answer;

  try {
    updateHelpUsAnswered(idSession, idHelpUs, answer);
    return res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(500);
  }
};

/**
 * POST /helpus/showanother
 * 
 */
export const postHelpUsShowAnother = (req: Request, res: Response) => {
  const idSession = req.session.user.idSession;
  const idHelpUs: string = req.body.idHelpUs;

  try {
    updateHelpUsShowAnother(idSession, idHelpUs);
    return res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(500);
  }
};