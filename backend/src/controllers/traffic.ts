import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { insertTraffic } from "../database/traffic";
import path from "path";
import { isKnownBot } from "../util/isBot";

const trackedViews = ["","csopenrankings","csprofessors","edit_history","account","login","signup","help"];

/**
 * GLOBAL MIDDLEWARE
 */
export const trafficLogger = (req: Request, res: Response, next: NextFunction) => {
    if(!isKnownBot) {
        const urlToCheck  = path.basename(req.url);
   
        if (trackedViews.includes(urlToCheck)) {
            const host = req.get("host");
            const origin = req.get("origin") || "none";
            const cookieName = "draftyUnique";
            if(!(cookieName in req.cookies)) {
                const sid = uuidv4();
                res.cookie(cookieName, sid);
                insertTraffic(req.url, host, origin, sid);  
            } else {
                const sid = req.cookies[cookieName];
                insertTraffic(req.url, host, origin, sid);  
            }
        }
    }
    next();
};