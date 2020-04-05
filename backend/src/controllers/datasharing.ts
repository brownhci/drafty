import { Request, Response } from "express";
import path from "path";

/**
 * GET /data/edithistory
 * Help page.
 */
export const getFile = (req: Request, res: Response) => {
  if(req.session.user.isAuth && req.originalUrl === '/data/edithistory') {
    const file = path.join(__dirname, "../../data_sharing/2300profs_edits.csv");
    res.download(file); // Set disposition and send it.
  } else {
    return res.sendStatus(500);
  }
};
