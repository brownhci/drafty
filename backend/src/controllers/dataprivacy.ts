import { Request, Response } from 'express';
import { removeUserData } from '../database/user';

/**
 * POST /account/delete
 *
 */
export const postRemoveData = (req: Request, res: Response) => {
  const idProfile = req.session.user.idProfile;
  const idSession = req.session.user.idSession;
  try {
    removeUserData(idProfile, idSession);
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};
