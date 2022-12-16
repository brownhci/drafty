import { Request, Response, NextFunction } from 'express';
import { updateHelpUs,insertHelpUs } from '../database/helpus';

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
 * POST /helpus/end
 * 
 */
export const postHelpUsEnd = (req: Request, res: Response) => {
    const idSession = req.session.user.idSession;
    const idInteraction: string = req.body.idInteraction;
    const nextAction: string = req.body.nextAction;
    const answer: string = req.body.answer;

    try {
      updateHelpUs(idSession, idInteraction, nextAction, answer);
      return res.sendStatus(200);
    } catch (error) {
      return res.sendStatus(500);
    }
};
