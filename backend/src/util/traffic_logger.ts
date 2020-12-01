import { Request, Response, NextFunction } from "express";
import path from "path";

const trackedViews = ['','csopenrankings','csprofessors','account','login','signup','help'];

/**
 * GLOBAL MIDDLEWARE
 */
export const trafficLogger = (req: Request, res: Response, next: NextFunction) => {
    let filename  = path.basename(req.url);
    if (trackedViews.includes(filename)) { 
        console.log("The file " + filename + " was requested.") 
    };
    next();
}