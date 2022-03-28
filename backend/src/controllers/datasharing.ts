import { Request, Response } from 'express';
import path from 'path';

/**
 * GET /data/edithistory
 * Help page.
 */
/* unused
export const getEditHistory = (req: Request, res: Response) => {
  if(req.session.user.isAuth && req.originalUrl === '/data/edithistory') {
    const file = path.join(__dirname, '../../data_sharing/2300profs_edits.csv');
    res.download(file); // Set disposition and send it.
  } else {
    return res.sendStatus(500);
  }
};
*/

/**
 * GET /data/csv
 * Help page.
 * 
 * /data/csv/:name?auth=:name_drafty2015
 * 
 * http://localhost:3000/data/csv/2300profs/2300profs_93318b344889ccef41d46b5f83d63de5
 * 
 */
export const getCSV = (req: Request, res: Response) => {
  const token = req.params.token;
  const fileName = req.params.name;
  const check = fileName + '_93318b344889ccef41d46b5f83d63de5';
  if(token === check) {
    const file = path.join(__dirname, '../../data_sharing/' + fileName + '.csv');
    res.download(file); // Set disposition and send it.
  } else {
    return res.sendStatus(500);
  }
};
