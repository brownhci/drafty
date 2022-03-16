import { Request, Response, NextFunction } from 'express';
import { insertDataBaitVisit }  from '../database/databaits';

//middleware
export function checkDataBaitsVisit(req: Request, res: Response, next: NextFunction) {
    if(req.query.d) {
        const idSession = req.session.user.idSession;
        const idDataBait = req.query.d as string;
        let source: string = '';
        if(req.query.src) {
            source = req.query.src  as string;
        }
        insertDataBaitVisit(idSession, idDataBait, source);
    }
    next();
  }

/**
 * POST /databait/visit
 * 
 * @param {number} req.body.idDataBait
 *
 * @param {string} req.body.source
 */
 export const postDataBaitVisit = (req: Request, res: Response) => {
    const idSession = req.session.user.idSession;
    const idDataBait: string = req.body.idDataBait;
    const source: string = req.body.source; // is this reliable?
  
    try {
      //console.log('postDataBaitVisit:', idDataBait, source);
      insertDataBaitVisit(idSession, idDataBait, source);
      return res.sendStatus(200);
    } catch (error) {
      return res.sendStatus(500);
    }
  };