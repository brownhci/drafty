// DATABASE Table Names and Field Names
export const tableName: string = "Profile";

export const idFieldName       = "idProfile";
export const usernameFieldName = "username";
export const emailFieldName    = "email";
export const passwordFieldName = "password";

// supported fields that can be used to look up a user
export const validFieldNamesForLookup = [idFieldName, usernameFieldName, emailFieldName];

export interface UserModel {
  [idFieldName]: number;
  [usernameFieldName]: string;
  [emailFieldName]: string;
  [passwordFieldName]: string;
}