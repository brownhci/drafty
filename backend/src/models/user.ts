// DATABASE Table Names and Field Names
export const tableName: string = 'users.Profile';

export const idFieldName       = 'idProfile';
export const usernameFieldName = 'username';
export const passwordFieldName = 'password';
export const passwordResetToken = 'passwordResetToken';
export const passwordResetExpires = 'passwordResetExpires';
export const minPasswordLength = 8;

// supported fields that can be used to look up a user
export const validFieldNamesForLookup = [idFieldName, usernameFieldName, passwordResetToken];

export interface UserModel {
  [idFieldName]: number;
  [usernameFieldName]: string;
  [passwordFieldName]: string;
  [passwordResetToken]: string | null;
  [passwordResetExpires]: Date | null;
}