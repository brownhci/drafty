import { Request, Response } from "express";
import path from "path";

/**
 * GET /data/edithistory
 * Help page.
 */
export const getEditHistory = (req: Request, res: Response) => {
  if(req.session.user.isAuth && req.originalUrl === "/data/edithistory") {
    const file = path.join(__dirname, "../../data_sharing/2300profs_edits.csv");
    res.download(file); // Set disposition and send it.
  } else {
    return res.sendStatus(500);
  }
};

/**
 * GET /data/csv
 * Help page.
 */
export const getCSV = (req: Request, res: Response) => {
  if(req.session.user.isAuth) {
    console.log(req.originalUrl);
    let fileName = req.originalUrl.substring(req.originalUrl.lastIndexOf('/') + 1);
    const file = path.join(__dirname, "../../data_sharing/" + fileName + ".csv");
    res.download(file); // Set disposition and send it.
  } else {
    return res.sendStatus(500);
  }
};