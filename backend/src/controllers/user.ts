import async from "async";
import crypto from "crypto";
import moment from "moment";
import passport from "passport";
import logger from "../util/logger";
//import process from "../util/process"; sw - npm warning never used :/
import { Request, Response, NextFunction } from "express";
import { UserModel, emailFieldName, passwordFieldName, passwordResetToken, passwordResetExpires } from "../models/user";
import { findUserByField, createUser, updateUser, insertSession, updateSession, updateUserNewSignup } from "../database/user";
import { emailExists, emailNotTaken, isValidUsername, checkPasswordLength, confirmMatchPassword } from "../validation/validators";
import { encryptPassword } from "../util/encrypt";
import { sendMail, userPasswordResetEmailAccount } from "../util/email";
import { makeRenderObject } from "../config/handlebars-helpers";
import "../config/passport";
import { throws } from "assert";

/**
 * GET /login
 * Login page
 */
export const getLogin = (req: Request, res: Response) => {
  if (req.user) {
    // current user is already logged in
    req.flash("info", {msg: "You are already logged in, please log out first"});
    return res.redirect(req.session.returnTo || "/");
  }
  res.render("account/login", makeRenderObject({ title: "Login" }, req));
};

/**
 * POST /login
 * Sign in using email and password.
 */
export const postLogin = async (req: Request, res: Response, next: NextFunction) => {
    // check for errors
    if (await isValidUsername(req) === false ||
        await checkPasswordLength(req) === false) {
        return res.redirect("/login");
    }
    // we're good, do something
    passport.authenticate("local", (err: Error, user: UserModel) => {
        if (err) { return next(err); }
        if (!user) {
          // authentication error
          return res.redirect("/login");
        }
        req.login(user, (err) => {
          if (err) { return next(err); }
          // update the sessions user.idProfile to match and update the Session tables idProfile
          const idProfile = user.idProfile;
          updateSession(idProfile, req.session.user.idSession);
          req.session.user.idProfile = idProfile;
          req.session.isAuth = true;
          req.session.user.isAuth = true;
          res.redirect(req.session.returnTo || "/");
        });
    })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
export const logout = async (req: Request, res: Response) => {
  /*
  req.logout(); // this should destroy the cookie
  */
  req.logout();
  req.session.user.isAuth = false;
  req.session.isAuth = false;
  res.redirect(req.session.returnTo || "/");
};

/**
 * GET /signup
 * Signup page.
 */
export const getSignup = (req: Request, res: Response) => {
    if (req.user) {
        req.flash("info", {msg: "You are already logged in, please log out first"});
        return res.redirect("/");
    }
    res.render("account/signup", makeRenderObject({ title: "Signup", showEmailUsageExplanation: true }, req));
};

/**
 * POST /signup
 * Create a new local account.
 */
export const postSignup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // check for errors
    if (await isValidUsername(req) === false ||
      await checkPasswordLength(req) === false ||
      await confirmMatchPassword(req) === false ||
      await emailNotTaken(req) === false
    ) {
      return res.redirect("/signup");
    }

    const email = req.body.email;
    const password: string = await encryptPassword(req.body.password);
    // creates new user
    const newUser = {
      [emailFieldName]: email,
      [passwordFieldName]: password,
    };

    const [error] = await updateUserNewSignup(email, password, req.session.user.idProfile);
    if (error) {
      return next(error);
    }

    // successful insertion
    req.logIn(newUser, (err) => {
      if (err) {
        return next(err);
      }
      // need to update session
      req.session.user.isAuth = true;
      req.session.isAuth = true;
      res.redirect(req.session.returnTo || "/");
    });
  } catch(err) {
      logger.error(err);
  }
};

/**
 * Function to ceate AnonymousUser
 */
export async function createAnonUser() {
  const email: null = null;
  const password: null = null;
  // creates new user
  const newUser = {
    [emailFieldName]: email,
    [passwordFieldName]: password,
  };
  try{
    const [error, results] = await createUser(newUser);
    if(error) {
      throws;
    }
    return results.insertId;
  } catch(err) {
      logger.error(err);
  }
}

/**
 * Function to create new Session in our DB (not express-session)
 */
export async function createSessionDB(idProfile: number,idExpressSession: string) {
  const idSession = await insertSession(idProfile,idExpressSession);
  return idSession;
}

/**
 * GET /account
 * Profile page.
 */
export const getAccount = (req: Request, res: Response) => {
  let username = "Anonymous User";
  if (req.user) {
    const user = req.user as Partial<UserModel>;
    username = user.email;
  }
  res.render("account/profile", makeRenderObject({ title: "Account Management", username: username, idProfile: req.session.user.idProfile, idSession: req.session.user.idSession, idExpress: req.sessionID }, req));
};

/**
 * POST /account/profile
 * Update profile information.
 * 
 * TODO implement
 * 
 */
export const postUpdateProfile = async (req: Request, res: Response, next: NextFunction) => {
  // TODO implement this
  // await body("email", "Please enter a valid email address.").isEmail() // eslint-disable-next-line @typescript-eslint/camelcase
  //                                                           .normalizeEmail({ gmail_remove_dots: false });

  // const errors = validationResult(req);

  // if (!errors.isEmpty()) {
  //     req.flash("errors", errors.array());
  //     return res.redirect("/account");
  // }

  // const user = req.user as UserModel;
  // const userid = user[idFieldName];
  // const email: string = req.body.email || "";
  // let [error] = await emailAlreadyTaken(email);
  // if (error) {
  //   req.flash("errors", { msg: error.message });
  //   return res.redirect("/signup");
  // }

  // const updatedUser = {
  //   [emailFieldName]: email,
  // };

  // [error] = await updateUser(updatedUser, {[idFieldName]: userid});
  // if (error) {
  //   return next(error);
  // }

  // // successful update
  // req.flash("success", { msg: "Profile information has been updated." });
  // res.redirect("/account");

  next();
};

/**
 * POST /account/password
 * Update current password.
 */
export const postUpdatePassword = async (req: Request, res: Response, next: NextFunction) => {
  if (await checkPasswordLength(req) === false ||
      await confirmMatchPassword(req) === false
  ) {
      return res.redirect("/account");
  }

  const user = req.user as Partial<UserModel>;
  const email = user.email;
  const password: string = await encryptPassword(req.body.password);
  const updatedUser = {
    [passwordFieldName]: password,
  };

  const [error] = await updateUser(updatedUser, {[emailFieldName]: email});
  if (error) {
    return next(error);
  }

  // successfully updated password
  req.flash("success", { msg: "Password has been changed" });
  res.redirect("/account");
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
export const getReset = async (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }

  const token = req.params.token;
  const [error, user] = await findUserByField(passwordResetToken, token);
  if (user == null) {
      req.flash("errors", { msg: "Password reset token is invalid" });
      return res.redirect("/forget");
  }
  if (!user) {
    return next(error);
  }
  const expiration = user[passwordResetExpires];
  if (moment().isSameOrAfter(expiration)) {
    // reset token has expired
    req.flash("errors", { msg: "Password reset token has expired" });
    return res.redirect("/forget");
  }

  // successful password reset
  res.render("account/reset", makeRenderObject({ title: "Reset", email: user.email }, req));
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
export const postReset = async (req: Request, res: Response, next: NextFunction) => {
  if (await checkPasswordLength(req) === false ||
      await confirmMatchPassword(req) === false
  ) {
      return res.redirect("back");
  }

  async.waterfall([
    async function resetPassword(done: Function) {
      const token = req.params.token;
      const [error, user] = await findUserByField(passwordResetToken, token);
      if (user == null) {
          req.flash("errors", { msg: "Password reset token is invalid" });
          return res.redirect("back");
      }
      if (!user) {
        return next(error);
      }
      const expiration = user[passwordResetExpires];
      if (moment().isSameOrAfter(expiration)) {
        // reset token has expired
        req.flash("errors", { msg: "Password reset token has expired" });
        return res.redirect("back");
      }
      // pass reset validation
      const password = req.body.password;
      const updatedUser: Partial<UserModel> = {
        [passwordFieldName]: password,
        [passwordResetToken]: null,
        [passwordResetExpires]: null,
      };

      const [updateError] = await updateUser(updatedUser, {[passwordResetToken]: token});
      if (updateError) {
        return done(updateError);
      }
      Object.assign(user, updatedUser);
      req.logIn(user, (err) => {
          done(err, user);
      });
    },
    async function sendResetPasswordEmail(user: UserModel, done: Function) {
      const mailOptions = {
          to: user.email,
          from: userPasswordResetEmailAccount,
          subject: "Your password has been changed",
          text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
      };
      const [error] = await sendMail(mailOptions);
      req.flash("success", { msg: "Success! Your password has been changed." });
      done(error);
    }
  ], (err) => {
      if (err) { return next(err); }
      res.redirect("/");
  });
};

/**
 * GET /forget
 * Forget Password page.
 */
export const getForget = (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    res.render("account/forget", makeRenderObject({ title: "Forget Password" }, req));
};

/**
 * POST /forget
 * Create a random token, then the send user an email with a reset link.
 */
export const postForget = async (req: Request, res: Response, next: NextFunction) => {
  if (await isValidUsername(req) === false ||
      await emailExists(req) === false) {
    return res.redirect("/forget");
  }

  const email = req.body.email;
  async.waterfall([
      function createRandomToken(done: Function) {
        crypto.randomBytes(256, (err, buf) => {
            const token = buf.toString("hex");
            done(err, token);
        });
      },
    async function setRandomToken(token: string, done: Function) {
      const [error, user] = await findUserByField(emailFieldName, email);
      if (user == null) {
          req.flash("errors", { msg: "Account with that name does not exist." });
          return res.redirect("/forget");
      }
      if (!user) {
        // QueryError or cannot find user by given email
        return done(error);
      }

      const expiration = moment();
      expiration.hour(expiration.hour() + 1); // 1 hour
      const updatedUser = {
        [passwordResetToken]: token,
        [passwordResetExpires]: expiration.toDate(),
      };

      const [updateError] = await updateUser(updatedUser, {[emailFieldName]: email});
      if (updateError) {
        return done(updateError);
      }
      // successful
      Object.assign(user, updatedUser);
      done(error, token, user);
    },
    async function sendForgetPasswordEmail(token: string, user: UserModel, done: Function) {
      const mailOptions = {
          to: user.email,
          from: userPasswordResetEmailAccount,
          subject: "Reset your password on Drafty",
          text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
    Please click on the following link, or paste this into your browser to complete the process:\n\n
    http://${req.headers.host}/reset/${token}\n\n
    If you did not request this, please ignore this email and your password will remain unchanged.\n`
      };
      const [error] = await sendMail(mailOptions);
      req.flash("info", { msg: `An e-mail has been sent to ${user.email} with further instructions.` });
      done(error);
    }
  ], (err) => {
      if (err) { return next(err); }
      res.redirect("/forget");
  });
};

/**
 * GET /seenwelcome
 */
export const getSeenWelcome = (req: Request, res: Response) => {
  return res.status(200).json(req.session.user.seenWelcome);
};

/**
 * POST /seenwelcome
 */
export const postSeenWelcome = (req: Request, res: Response) => {
  req.session.user.seenWelcome = req.body.seenWelcome; // should be 0 or 1
  return res.status(200);
};

/**
 * GLOBAL MIDDLEWARE
 */
export async function checkSessionUser(req: Request, res: Response, next: NextFunction) {
  if (await !req.session.user) {
    if(req.user) {
      logger.debug(req.sessionID + " :: NO USER but there is a passport :: " + req.user);
    }
    // sw: only place to create a new idProfile - this will get triggered before any login
    req.session.user = {
      idSession: -1,
      idProfile: await createAnonUser(),
      isAuth: false,
      isAdmin: false,
      views: 0,
      seenWelcome: 0,
      lastInteraction: Date.now(),
      failedLoginAttempts: 0
    };
    //logger.debug("NEW Profile created! " + req.sessionID + " :: " + req.session.user.idProfile);
    next();
  } else {
    // logger.debug(req.sessionID + " :: " + req.session.user.idProfile + " :: " + req.session.user.isAuth  + " :: " + req.session.isAuth);
    // logger.debug(req.user); // sw: this is created by passport
    next();
  }
}

/**
 * GLOBAL MIDDLEWARE
 */
const heartbeat = 20 * 60000; // mins * 60000 milliseconds
export async function checkSessionId(req: Request, res: Response, next: NextFunction) {
  const interactionTime = Date.now();
  //logger.debug(await req.session.user.lastInteraction + ' == ' + interactionTime);
  //logger.debug(interactionTime - await req.session.user.lastInteraction);
  if(((interactionTime - await req.session.user.lastInteraction) > heartbeat) || (await req.session.user.idSession === -1)) {
    req.session.user.idSession = await createSessionDB(req.session.user.idProfile,req.sessionID);
  }
  req.session.user.lastInteraction = interactionTime;
  req.session.user.views++;
  next();
}

/**
 * GLOBAL MIDDLEWARE
 */
export async function checkReturnPath(req: Request, res: Response, next: NextFunction) {
  if(req.path !== "/favicon.ico") {
    req.session.returnTo = req.path;
  }
  next();
}