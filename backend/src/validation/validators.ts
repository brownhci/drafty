import { emailFieldName } from "../models/user";
import { findUserByField, findUserByFieldResultType } from "../database/user";


export const emailAlreadyTaken = (email: string) => {
    findUserByField(emailFieldName, email, (error: Error, user: findUserByFieldResultType) => {
      if (user) {
        // conflicts with existing user
        return Promise.reject("Account with that email address already exists.");
      }

      if (!user && error) {
        // QueryError
        throw new Error("Error when validating the email");
      }
    });
};