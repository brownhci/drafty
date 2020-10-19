import { Request, Response, NextFunction } from "express";

/**
 * GLOBAL MIDDLEWARE
 */
export async function urls(req: Request, res: Response, next: NextFunction) {
    console.log("\n\nTEST URLS:");
    console.log("req.originalUrl =",req.originalUrl);
    console.log(req.headers.referrer);
    console.log(req.headers.referer);
    console.log(req.get("Referer"));
    next();
}