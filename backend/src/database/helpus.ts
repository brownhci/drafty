import { db, logDbErr } from './mysql';

const stmtInsertHelpUs: string = `INSERT INTO HelpUs (idInteraction, idUniqueID, helpUsType, question, nextAction, answer, start) VALUES (insert_interaction(?,?), ?, ?, ?, null, null, CURRENT_TIMESTAMP);`;
const stmtUpdateHelpUs: string = `UPDATE HelpUs SET end = CURRENT_TIMESTAMP, nextAction = ?, answer = ? WHERE idHelpUs = ?`;
const stmtUpdateHelpUs_UpdateInteraction: string = 'insert_interaction(?,?)';


/**
* function to update database
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function insertHelpUs(idSession: string, idUniqueID: string, helpUsType: string, question: string) {
    try {
        const idInteractionType: number = 39; // create new HelpUs
        const [results] = await db.query(stmtInsertHelpUs, [idSession, idInteractionType, idUniqueID, helpUsType, question]);
        return [null, results];
    } catch (error) {
        logDbErr(error, 'error during insert HelpUs', 'warn');
        return [error];
    }
}

export async function updateHelpUs(idSession: string, idHelpUs: string | number, nextAction: string, answer: string) {
    console.log(nextAction, answer, idHelpUs);
    try {
        // UPDATE HelpUs SET end = CURRENT_TIMESTAMP, nextAction = ?, answer = ? WHERE idHelpUs = ?
        db.query(stmtUpdateHelpUs, [nextAction, answer, idHelpUs]);

        const idInteractionType: number = 40; // update new HelpUs
        db.query(stmtUpdateHelpUs_UpdateInteraction, [idSession, idInteractionType]);
    } catch (error) {
        logDbErr(error, 'error during updateHelpUs', 'warn');
    }
}
