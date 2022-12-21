import { db, logDbErr } from './mysql';

const stmtInsertHelpUs: string = `INSERT INTO HelpUs (idInteraction, idUniqueID, helpUsType, question, answer, start) VALUES (insert_interaction(?,?), ?, ?, ?, null, CURRENT_TIMESTAMP);`;
const stmtUpdateHelpUsClosed: string = `UPDATE HelpUs SET closed = CURRENT_TIMESTAMP WHERE idHelpUs = ?`;
const stmtUpdateHelpUsAnswered: string = `UPDATE HelpUs SET answered = CURRENT_TIMESTAMP answer = ? WHERE idHelpUs = ?`;
const stmtUpdateHelpUsShowAnother: string = `UPDATE HelpUs SET showAnother = CURRENT_TIMESTAMP WHERE idHelpUs = ?`;
const stmtUpdateHelpUs_UpdateInteraction: string = 'INSERT INTO Interaction (idSession, idInteractionType) VALUES (?,?);';


/**
* function to update database
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function insertHelpUs(idSession: string, idUniqueID: string, helpUsType: string, question: string) {
    console.log(`insertHelpUs...`);
    try {
        const idInteractionType: number = 39; // create new HelpUs
        const [results] = await db.query(stmtInsertHelpUs, [idSession, idInteractionType, idUniqueID, helpUsType, question]);
        return [null, results];
    } catch (error) {
        logDbErr(error, 'error during insert HelpUs', 'warn');
        return [error];
    }
}

export async function updateHelpUsClosed(idSession: string, idHelpUs: string | number) {
    try {
        db.query(stmtUpdateHelpUsClosed, [idHelpUs]);
        const idInteractionType: number = 40; // update closed HelpUs
        db.query(stmtUpdateHelpUs_UpdateInteraction, [idSession, idInteractionType]);
    } catch (error) {
        logDbErr(error, 'error during updateHelpUs', 'warn');
    }
}

export async function updateHelpUsAnswered(idSession: string, idHelpUs: string | number, answer: string) {
    try {
        db.query(stmtUpdateHelpUsAnswered, [answer, idHelpUs]);
        const idInteractionType: number = 41; // update answered HelpUs
        db.query(stmtUpdateHelpUs_UpdateInteraction, [idSession, idInteractionType]);
    } catch (error) {
        logDbErr(error, 'error during updateHelpUs', 'warn');
    }
}

export async function updateHelpUsShowAnother(idSession: string, idHelpUs: string | number) {
    try {
        db.query(stmtUpdateHelpUsShowAnother, [idHelpUs]);
        const idInteractionType: number = 42; // update show another HelpUs
        db.query(stmtUpdateHelpUs_UpdateInteraction, [idSession, idInteractionType]);
    } catch (error) {
        logDbErr(error, 'error during updateHelpUs', 'warn');
    }
}
