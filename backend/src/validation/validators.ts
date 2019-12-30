import { emailFieldName, minPasswordLength } from "../models/user";
import { findUserByField } from "../database/user";
import { Request } from "express";
import { body, validationResult } from "express-validator";
import { idSuggestionType,  idSuggestionTypeLowerBound, idSuggestionTypeUpperBound } from "../models/suggestion";

export const emailValidationFailure = "emailValidationFailure";
export const passwordValidationFailure = "passwordValidationFailure";
export const confirmValidationFailure = "confirmValidationFailure";

export async function fieldNonEmpty(req: Request, fieldName: string) {
  const result = await body(fieldName).not().isEmpty().run(req);
  if (!validationResult(req).isEmpty()) {
    req.flash(`${fieldName}ValidationFailure`, { msg: `${fieldName} should not be empty` });
    return false;
  }
  return result;
}

export async function emailNotTaken(req: Request) {
  const email = req.body.email;
  const [error, user] = await findUserByField(emailFieldName, email);
  if (user == null) {
    // email not taken
    return true;
  }

  if (!user) {
    // QueryError
    req.flash("errors", { msg: "Internal server error, please contact developer from help page" });
    return false;
  }

  // conflicts with existing user
  req.flash(emailValidationFailure, { msg: `Account with email address ${email} already exists` });
  return false;
}

export async function emailExists(req: Request) {
  const email = req.body.email;
  const [error, user] = await findUserByField(emailFieldName, email);
  if (user == null) {
    // email not taken
    req.flash(emailValidationFailure, { msg: `Account with email address ${email} does not exists` });
    return false;
  }

  if (!user) {
    // QueryError
    req.flash("errors", { msg: "Internal server error, please contact developer from help page" });
    return false;
  }

  // email belongs to an existing user
  return true;
}

export async function isValidEmail(req: Request) {
  // eslint-disable-next-line @typescript-eslint/camelcase
  const result = await body("email").normalizeEmail({ gmail_remove_dots: false }).isEmail().run(req);
  if (!validationResult(req).isEmpty()) {
    req.flash(emailValidationFailure, { msg: "Email not in valid format" });
    return false;
  }
  return result;
}

export async function checkPasswordLength(req: Request) {
  const result = await body("password").isLength({min: minPasswordLength}).run(req);
  if (!validationResult(req).isEmpty()) {
    req.flash(passwordValidationFailure, { msg: "Password should be at least 4 characters long" });
    return false;
  }
  return result;
}

export async function confirmMatchPassword(req: Request) {
  const result = await body("confirm").equals(req.body.password).run(req);
  if (!validationResult(req).isEmpty()) {
    req.flash(confirmValidationFailure, { msg: "Confirm password should match picked password" });
    return false;
  }
  return result;
}

export async function isValidIdSuggestionType(req: Request) {
  const suggestionType: number = Number.parseInt(req.query[idSuggestionType]);
  if (suggestionType >= idSuggestionTypeLowerBound && suggestionType <= idSuggestionTypeUpperBound) {
    return true;
  }

  req.flash("errors", { msg: `Invalid suggestion type ${suggestionType} passed` });
  return false;
}