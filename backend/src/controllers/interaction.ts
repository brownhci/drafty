import { Request, Response } from "express";
import { db } from "../database/mysql";
import async from "async";

/**
 * save new interaction id
 */
//DB Code
async function insertUserId(idSession: String, idInteractionType: String, callback: CallableFunction) {
    db.run('INSERT INTO Interaction (idInteraction, idSession, idInteractionType) VALUES (null, ?, ?)', [idSession, idInteractionType], function (err) {
        if (err) {
        //console.log('ERROR - INSERT INTO users: ' + err.message)
        }
        callback(this.lastID)
    })
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