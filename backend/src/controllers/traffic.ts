import { Request, Response, NextFunction } from "express";
import path from "path";
import { insertTraffic } from "../database/traffic";

const trackedViews = ["","csopenrankings","csprofessors","account","login","signup","help"];

function parseSid(data: string) {
    try {
        const sid = data.split("connect.sid=")[1];
        return sid;
    } catch (error) {
        return "none";
    }
}

/**
 * GLOBAL MIDDLEWARE
 */
export const trafficLogger = (req: Request, res: Response, next: NextFunction) => {
    const url  = path.basename(req.url);
    if (trackedViews.includes(url)) {
        let sid = req.headers.cookie || "none";
        if(sid !== "none") {
            sid = parseSid(sid);
        }
        const host = req.get("host");
        const origin = req.get("origin") || "none";
        //const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        insertTraffic(url, host, origin, sid);
    }
    next();
};