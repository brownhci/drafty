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
 * 
 * /data/csv/:name?auth=:name_drafty2015
 * 
 * http://localhost:3000/data/csv/2300profs?2300profs_drafty2015
 * 
 */
export const getCSV = (req: Request, res: Response) => {
  const token = req.params.token;
  const fileName = req.params.name;
  const check = fileName + "_93318b344889ccef41d46b5f83d63de5";
  if(token === check) {
    const file = path.join(__dirname, "../../data_sharing/" + fileName + ".csv");
    res.download(file); // Set disposition and send it.
  } else {
    return res.sendStatus(500);
  }
};

/**
 * GET /data/csv
 * Help page.
 */
export const getCSV_old = (req: Request, res: Response) => {
  if(req.session.user.isAuth) {
    console.log(req.originalUrl);
    const fileName = req.originalUrl.substring(req.originalUrl.lastIndexOf("/") + 1);
    const file = path.join(__dirname, "../../data_sharing/" + fileName + ".csv");
    res.download(file); // Set disposition and send it.
  } else {
    return res.sendStatus(500);
  }
};
