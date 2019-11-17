import passport from "passport";
import passportLocal from "passport-local";
import { emailFieldName, passwordFieldName } from "../models/user";
import { findUserByField } from "../database/user";
import { Request, Response, NextFunction } from "express";
import { comparePassword } from "../util/encrypt";
import { emailValidationFailure, passwordValidationFailure } from "../validation/validators";


const LocalStrategy = passportLocal.Strategy;

passport.serializeUser<any, any>((user, done) => {
  done(null, user[emailFieldName]);
});

passport.deserializeUser(async (email: number, done) => {
  // finding the user by email when deserializing
  const [error, user] = await findUserByField(emailFieldName, email);
  if (error) {
    done(error);
  } else {
    done(null, user);
  }
});


/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({
  usernameField: "email",
  passReqToCallback: true
},
  async (req, username, password, done) => {
  // support login with email
  const [error, user] = await findUserByField(emailFieldName, username);
  if (user == null) {
    const errorMessage = error.message;
    req.flash(emailValidationFailure, { msg: errorMessage });
    return done(null, false, { message: errorMessage });
  }

  if (!user) {
    // QueryError
    return done(error);
  }

  const samePassword = await comparePassword(password, user[passwordFieldName]);
  if (!samePassword) {
    const errorMessage = "Incorrect Password";
    req.flash(passwordValidationFailure, { msg: errorMessage });
    return done(null, false, { message: errorMessage });
  }

  return done(null, user);
}));


/**
 * OAuth Strategy Overview
 *
 * - User is already logged in.
 *   - Check if there is an existing account with a provider id.
 *     - If there is, return an error message. (Account merging not supported)
 *     - Else link new OAuth account with currently logged-in user.
 * - User is not logged in.
 *   - Check if it's a returning user.
 *     - If returning user, sign in and we are done.
 *     - Else check if there is an existing account with user's email.
 *       - If there is, return an error message.
 *       - Else create a new account.
 */

/**
 * Login Required middleware.
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
      return next();
  }
  req.flash("errors", { msg: "You need to log in first" });
  return res.redirect("/login");
};
