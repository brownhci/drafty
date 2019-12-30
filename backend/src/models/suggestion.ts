export const tableName = "Suggestions";

export const idSuggestion = "idSuggestion"; // id in all suggestions
export const idSuggestionType = "idSuggestionType"; // id for suggestion type "which field this suggestion is for"
export const idUniqueID = "idUniqueID";  // id in same suggestion type
export const idProfile = "idProfile"; // who provided this suggestion
export const suggestion = "suggestion"; // content of the suggestion
export const active = "active"; // whether the suggestion is active
export const confidence = "confidence"; // how useful this suggetsion is

// @TODO auto-update suggestion type lower bound and upper bound
export const idSuggestionTypeLowerBound = 1;
export const idSuggestionTypeUpperBound = 14;

export interface SuggestionRow {
  [suggestion]: string;
  [confidence]: number;
}
