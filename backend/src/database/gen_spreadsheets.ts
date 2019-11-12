import { db,logDbErr } from "./mysql";

const stmtSelectSuggestionsAjobs: string = "SELECT * " + 
                                            "FROM Suggestions " + 
                                            "WHERE idProfile = 2 " + 
                                            "OR (idSuggestionType = 11 AND idProfile = ?) " + // private cols
                                            "OR (idSuggestionType = 14 AND idProfile = ?) " + // private cols
                                            "OR (idSuggestionType != 11 AND idSuggestionType != 14) " +
                                            "AND active = 1 " +
                                            "ORDER BY idUniqueID, idSuggestionType, confidence desc";

const stmtSelectSuggestionsProfs: string = "SELECT * FROM Suggestions WHERE active = 1 ORDER BY idUniqueID, idSuggestionType, confidence desc";

/**
 * generate static spreadsheets
 */
export async function genSheets(idProfile: number) {
    try {
        const [rows] = await db.query(stmtSelectSuggestionsProfs);
        if (Array.isArray(rows) && rows.length > 0) {
            rows.forEach(row => {
                console.log(row)
            });
        }
    } catch (error) {
        logDbErr(error, "error during generate spreadsheets", "warn");
        return error
    }
}