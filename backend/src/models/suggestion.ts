export const tableName = "Suggestions";

export const idSuggestion = "idSuggestion"; // id in all suggestions
export const idSuggestionType = "idSuggestionType"; // id for suggestion type "which field this suggestion is for"
export const idUniqueID = "idUniqueID";  // id in same suggestion type
export const idProfile = "idProfile"; // who provided this suggestion
export const suggestion = "suggestion"; // content of the suggestion
export const active = "active"; // whether the suggestion is active
export const confidence = "confidence"; // how useful this suggetsion is

export interface SuggestionRow {
  [suggestion]: string;
  [confidence]: number;
}
