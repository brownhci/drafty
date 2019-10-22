import { Request, Response } from "express";
import { db } from "../database/mysql";
import async from "async";

/**
 * save new interaction id
 */
//DB Code
async function insertUserId(idSession: String, idInteractionType: String, callback: CallableFunction) {
    try {
        const [results, fields] = await db.query("INSERT INTO Interaction (idInteraction, idSession, idInteractionType) VALUES (null, ?, ?)", [idSession, idInteractionType]);
        callback(null, results, fields);
    } catch (error) {
        db.logDatabaseError(error, "error during insert interaction", "warn");
        callback(error);
    }
}

/**
 * POST /new-row
 * Add new row
 */
export const postNewRow = (req: Request, res: Response, next: NextFunction) => {
    //check for errors
    

    //
};

/**
 * POST /edit
 * Edit
 */
export const postEdit = (req: Request, res: Response, next: NextFunction) => {

};

/**
 * POST /click
 * Click
 */
export const postClick = (req: Request, res: Response, next: NextFunction) => {

};

/**
 * POST /click-double
 * Double click
 */
export const postClickDouble = (req: Request, res: Response, next: NextFunction) => {

};

/**
 * POST /sort
 * Sort
 */
export const postSort = (req: Request, res: Response, next: NextFunction) => {

};

/**
 * POST /search-partial
 * Partial search
 */
export const postSearchPartial = (req: Request, res: Response, next: NextFunction) => {

};

/**
 * POST /search-full
 * Full search
 */
export const postSearchFull = (req: Request, res: Response, next: NextFunction) => {

};