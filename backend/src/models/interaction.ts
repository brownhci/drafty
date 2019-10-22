const tableName = "Interaction";

export const idFieldName = "idInteraction";
export const idSessionFieldName = "idSession";
export const timestampFieldName = "timestamp"; // db auto gens this normally

// supported fields that can be used to look up a interaction
const validFieldNamesForLookup = [idFieldName];

export interface InteractionRow {
  [idFieldName]: number;
  [idSessionFieldName]: string;
  [timestampFieldName]: string;
}