import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { insertTraffic } from "../database/traffic";
import { checkBot } from "../util/isBot";

const trackedViews = ["", "csopenrankings", "csprofessors", "edit_history", "account", "login", "signup", "help"];

/**
 * GLOBAL MIDDLEWARE
 */
export const trafficLogger = (req: Request, res: Response, next: NextFunction) => {
    if (!checkBot(req.get("User-Agent")).isBot) {
        const urlToCheck = req.path.replace(/\//g, "");

        if (trackedViews.includes(urlToCheck)) {
            const fullUrl = req.url;
            const host = req.get("host");
            const origin = req.get("origin") || "none";
            const cookieName = "draftyUnique";

            //console.log(req.session.user)

            if (!(cookieName in req.cookies)) {
                const sid = uuidv4();
                res.cookie(cookieName, sid);
                insertTraffic(urlToCheck, fullUrl, host, origin, sid);
            } else {
                const sid = req.cookies[cookieName];
                insertTraffic(urlToCheck, fullUrl, host, origin, sid);
            }
        }
    }
    next();
};