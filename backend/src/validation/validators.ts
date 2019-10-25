import { emailFieldName } from "../models/user";
import { findUserByField } from "../database/user";
import logger from "../util/logger";

export async function emailAlreadyTaken(email: string){
  const [error, user] = await findUserByField(emailFieldName, email);
  if (user == null) {
    // email not taken
    return [null];
  }

  if (!user) {
    // QueryError
    return [error];
  }

  // conflicts with existing user
  logger.debug("Account with that email address already exists.");
  return [new Error("Account with that email address already exists.")];
}