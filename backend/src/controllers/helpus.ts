import { Request, Response } from 'express';
import { updateHelpUs,insertHelpUs } from '../database/helpus';

/**
 * POST /helpus/start
 * 
 */
export const postHelpUsStart = async (req: Request, res: Response) => {
    const idSession = req.session.user.idSession;
    const idUniqueID: string = req.body.idUniqueID;
    const helpUsType: string = req.body.helpUsType;
    const question: string = req.body.question;

    try {
      const idInteraction = await insertHelpUs(idSession, idUniqueID, helpUsType, question);
      return res.status(200).json({
        idInteraction: idInteraction 
      });
    } catch (error) {
      return res.sendStatus(500);
    }
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
