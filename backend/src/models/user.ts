// DATABASE Table Names and Field Names
export const tableName: string = "Profile";

export const idFieldName       = "id";
export const usernameFieldName = "username";
export const emailFieldName    = "email";
export const passwordFieldName = "password";

// supported fields that can be used to look up a user
const validFieldNamesForUserLookup = [idFieldName, usernameFieldName, emailFieldName];

export interface UserRow {
  [idFieldName]: number;
  [usernameFieldName]: string;
  [emailFieldName]: String;
  [passwordFieldName]: string;
}