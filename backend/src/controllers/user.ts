import async from "async";
import crypto from "crypto";
import nodemailer from "nodemailer";
import passport from "passport";
import { Request, Response, NextFunction } from "express";
import { UserRow, userTableIdFieldName, userTableUsernameFieldName, userTableEmailFieldName, userTablePasswordFieldName, findUserByField, findUserByFieldResultType, createUser, updateUser, deleteUser } from "../database/mysql";
import { IVerifyOptions } from "passport-local";
import { check, body, sanitize, validationResult } from "express-validator";
import { emailAlreadyTaken } from "../validation/validators";
import { encryptPassword } from "../util/encrypt";
import "../config/passport";

/**
 * GET /login
 * Login page.
 */
export const getLogin = (req: Request, res: Response) => {
    if (req.user) {
        return res.redirect("/");
    }
    res.render("account/login", {
        title: "Login"
    });
};

/**
 * POST /login
 * Sign in using email and password.
 */
export const postLogin = (req: Request, res: Response, next: NextFunction) => {
    //check for errors
    body("email", "Email is not valid").isEmail();
    body("password", "Password cannot be blank").isLength({min: 1});
    // eslint-disable-next-line @typescript-eslint/camelcase
    sanitize("email").normalizeEmail({ gmail_remove_dots: false });

    const errors = validationResult(req);

    //if there are error redirect
    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("/login");
    }

    // we're good, do something
    passport.authenticate("local", (err: Error, user: UserRow, info: IVerifyOptions) => {
        if (err) { return next(err); }
        if (!user) {
          // authentication error
          req.flash("errors", {msg: info.message});
          return res.redirect("/login");
        }
        req.login(user, (err) => {
          if (err) { return next(err); }
          req.flash("success", { msg: "Success! You are logged in." });
          res.redirect(req.session.returnTo || "/");
        });
    })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
export const logout = (req: Request, res: Response) => {
    req.logout();
    res.redirect("/");
};

/**
 * GET /signup
 * Signup page.
 */
export const getSignup = (req: Request, res: Response) => {
    if (req.user) {
        return res.redirect("/");
    }
    res.render("account/signup", {
        title: "Create Account"
    });
};

/**
 * POST /signup
 * Create a new local account.
 */
export const postSignup = async (req: Request, res: Response, next: NextFunction) => {
    //check errors
    body("email", "Email is not valid").isEmail().custom(emailAlreadyTaken);
    body("password", "Password must be at least 4 characters long").isLength({ min: 4 });
    body("confirmPassword", "Passwords do not match").equals(req.body.password);
    // eslint-disable-next-line @typescript-eslint/camelcase
    sanitize("email").normalizeEmail({ gmail_remove_dots: false });

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("/signup");
    }

    const email: string = req.body.email;
    const password: string = await encryptPassword(req.body.password);
    // creates new user
    const newUser = {
      [userTableEmailFieldName]: email,
      [userTablePasswordFieldName]: password,
    };

    createUser(newUser, (err: Error) => {
      if (err) { return next(err); }
      req.logIn(newUser, (err) => {
          if (err) {
              return next(err);
          }
          res.redirect("/");
      });
    });
};

/**
 * GET /account
 * Profile page.
 */
export const getAccount = (req: Request, res: Response) => {
    res.render("account/profile", {
        title: "Account Management"
    });
};

/**
 * POST /account/profile
 * Update profile information.
 */
export const postUpdateProfile = (req: Request, res: Response, next: NextFunction) => {
    check("email", "Please enter a valid email address.").isEmail().custom(emailAlreadyTaken);
    // eslint-disable-next-line @typescript-eslint/camelcase
    sanitize("email").normalizeEmail({ gmail_remove_dots: false });

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("/account");
    }

    const user = req.user as UserRow;
    const userid = user[userTableIdFieldName];
    const email: string = req.body.email || "";
    const updatedUser = {
      [userTableEmailFieldName]: email,
    };
    updateUser(updatedUser, {[userTableIdFieldName]: userid}, (error: Error) => {
      if (error) {
        return next(error);
      }
      req.flash("success", { msg: "Profile information has been updated." });
      res.redirect("/account");
    });
};

/**
 * POST /account/password
 * Update current password.
 */
export const postUpdatePassword = async (req: Request, res: Response, next: NextFunction) => {
    check("password", "Password must be at least 4 characters long").isLength({ min: 4 });
    check("confirmPassword", "Passwords do not match").equals(req.body.password);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("/account");
    }

    const user = req.user as UserRow;
    const userid = user[userTableIdFieldName];
    const password: string = await encryptPassword(req.body.password);
    const updatedUser = {
      [userTablePasswordFieldName]: password,
    };
    updateUser(updatedUser, {[userTableIdFieldName]: userid}, (error: Error) => {
      if (error) {
        return next(error);
      }
      req.flash("success", { msg: "Password has been changed." });
      res.redirect("/account");
    });
};

/**
 * POST /account/delete
 * Delete user account.
 */
export const postDeleteAccount = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as UserRow;
    const userid = user[userTableIdFieldName];
    deleteUser({[userTableIdFieldName]: userid}, (error: Error) => {
      if (error) { return next(error); }
      req.logout();
      req.flash("info", { msg: "Your account has been deleted." });
      res.redirect("/");
    });
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
export const getReset = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    // User
    //     .findOne({ passwordResetToken: req.params.token })
    //     .where("passwordResetExpires").gt(Date.now())
    //     .exec((err, user) => {
    //         if (err) { return next(err); }
    //         if (!user) {
    //             req.flash("errors", { msg: "Password reset token is invalid or has expired." });
    //             return res.redirect("/forgot");
    //         }
    //         res.render("account/reset", {
    //             title: "Password Reset"
    //         });
    //     });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
export const postReset = (req: Request, res: Response, next: NextFunction) => {
    check("password", "Password must be at least 4 characters long.").isLength({ min: 4 });
    check("confirm", "Passwords must match.").equals(req.body.password);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("back");
    }

    // async.waterfall([
    //     function resetPassword(done: Function) {
    //         User
    //             .findOne({ passwordResetToken: req.params.token })
    //             .where("passwordResetExpires").gt(Date.now())
    //             .exec((err, user: any) => {
    //                 if (err) { return next(err); }
    //                 if (!user) {
    //                     req.flash("errors", { msg: "Password reset token is invalid or has expired." });
    //                     return res.redirect("back");
    //                 }
    //                 user.password = req.body.password;
    //                 user.passwordResetToken = undefined;
    //                 user.passwordResetExpires = undefined;
    //                 user.save((err: WriteError) => {
    //                     if (err) { return next(err); }
    //                     req.logIn(user, (err) => {
    //                         done(err, user);
    //                     });
    //                 });
    //             });
    //     },
    //     function sendResetPasswordEmail(user: UserDocument, done: Function) {
    //         const transporter = nodemailer.createTransport({
    //             service: "SendGrid",
    //             auth: {
    //                 user: process.env.SENDGRID_USER,
    //                 pass: process.env.SENDGRID_PASSWORD
    //             }
    //         });
    //         const mailOptions = {
    //             to: user.email,
    //             from: "express-ts@starter.com",
    //             subject: "Your password has been changed",
    //             text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
    //         };
    //         transporter.sendMail(mailOptions, (err) => {
    //             req.flash("success", { msg: "Success! Your password has been changed." });
    //             done(err);
    //         });
    //     }
    // ], (err) => {
    //     if (err) { return next(err); }
    //     res.redirect("/");
    // });
};

/**
 * GET /forgot
 * Forgot Password page.
 */
export const getForgot = (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    res.render("account/forgot", {
        title: "Forgot Password"
    });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
export const postForgot = (req: Request, res: Response, next: NextFunction) => {
    // check("email", "Please enter a valid email address.").isEmail();
    // // eslint-disable-next-line @typescript-eslint/camelcase
    // sanitize("email").normalizeEmail({ gmail_remove_dots: false });

    // const errors = validationResult(req);

    // if (!errors.isEmpty()) {
    //     req.flash("errors", errors.array());
    //     return res.redirect("/forgot");
    // }

    // async.waterfall([
    //     function createRandomToken(done: Function) {
    //         crypto.randomBytes(16, (err, buf) => {
    //             const token = buf.toString("hex");
    //             done(err, token);
    //         });
    //     },
    //     function setRandomToken(token: AuthToken, done: Function) {
    //         User.findOne({ email: req.body.email }, (err, user: any) => {
    //             if (err) { return done(err); }
    //             if (!user) {
    //                 req.flash("errors", { msg: "Account with that email address does not exist." });
    //                 return res.redirect("/forgot");
    //             }
    //             user.passwordResetToken = token;
    //             user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    //             user.save((err: WriteError) => {
    //                 done(err, token, user);
    //             });
    //         });
    //     },
    //     function sendForgotPasswordEmail(token: AuthToken, user: UserDocument, done: Function) {
    //         const transporter = nodemailer.createTransport({
    //             service: "SendGrid",
    //             auth: {
    //                 user: process.env.SENDGRID_USER,
    //                 pass: process.env.SENDGRID_PASSWORD
    //             }
    //         });
    //         const mailOptions = {
    //             to: user.email,
    //             from: "hackathon@starter.com",
    //             subject: "Reset your password on Hackathon Starter",
    //             text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
    //       Please click on the following link, or paste this into your browser to complete the process:\n\n
    //       http://${req.headers.host}/reset/${token}\n\n
    //       If you did not request this, please ignore this email and your password will remain unchanged.\n`
    //         };
    //         transporter.sendMail(mailOptions, (err) => {
    //             req.flash("info", { msg: `An e-mail has been sent to ${user.email} with further instructions.` });
    //             done(err);
    //         });
    //     }
    // ], (err) => {
    //     if (err) { return next(err); }
    //     res.redirect("/forgot");
    // });
};
