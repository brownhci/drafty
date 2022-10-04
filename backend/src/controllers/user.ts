import async from 'async';
import crypto from 'crypto';
import moment from 'moment';
import passport from 'passport';
import logger from '../util/logger';
//import process from "../util/process"; sw - npm warning never used :/
import { Request, Response, NextFunction } from 'express';
import { UserModel, usernameFieldName, passwordFieldName, passwordResetToken, passwordResetExpires } from '../models/user';
import { findUserByField, createUser, updateUser, insertSession, updateSession, updateUserNewSignup } from '../database/user';
import { usernameExists, usernameNotTaken, isNotEmail, isValidUsername, checkPasswordLength, confirmMatchPassword } from '../validation/validators';
import { encryptPassword } from '../util/encrypt';
import { makeRenderObject } from '../config/handlebars-helpers';
import '../config/passport';
import { throws } from 'assert';

/**
 * GET /login
 * Login page
 */
export const getLogin = (req: Request, res: Response) => {
  if (req.session.user.isAuth) {
    // current user is already logged in
    req.flash('info', { msg: 'You are already logged in, please log out first' });
    return res.redirect(req.session.returnTo || '/');
  }
  res.render('account/login', makeRenderObject({ title: 'Login' }, req));
};

/**
 * POST /login
 * Sign in using email and password.
 */
export const postLogin = async (req: Request, res: Response, next: NextFunction) => {
  const idProfile = req.session.user.idProfile;
  const idSession = req.session.user.idSession;
  // check for errors
  if (
    idProfile && idSession && (
      await isNotEmail(req) === false ||
      await isValidUsername(req) === false ||
      await checkPasswordLength(req) === false
    )) {
      return res.redirect('/login');
  }
  // we're good, do something
  passport.authenticate('local', (err: Error, user: UserModel) => {
    if (err) { 
      logger.info(err);
      return next(err); 
    }
    if (!user) {
      // authentication error
      return res.redirect('/login');
    }
    req.login(user, (err) => {
      if (err) { 
        logger.info(err);
        return next(err); 
      }
      // update the sessions user.idProfile to match and update the Session tables idProfile
      updateSession(idProfile, idSession);
    });
    req.session.user.idProfile = user.idProfile;
    req.session.user.isAuth = true;
    req.session.user.username = user.username;
    res.redirect(req.session.returnTo || '/');
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
  //req.logout();
  try {
    req.session.user.isAuth = false;
    res.redirect(req.session.returnTo || '/');
  } catch (error) {
    logger.info('user controller logout() error: ' + error);
  }
};

/**
 * GET /signup
 * Signup page.
 */
export const getSignup = (req: Request, res: Response) => {
  if (req.session.user.isAuth) {
    req.flash('info', { msg: 'You are already logged in, please log out first' });
    return res.redirect('/');
  }
  res.render('account/signup', makeRenderObject({ title: 'Signup', showEmailUsageExplanation: true }, req));
};

/**
 * POST /signup
 * Create a new local account.
 */
export const postSignup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // check for errors
    if (
      await isNotEmail(req) === false ||
      await isValidUsername(req) === false ||
      await checkPasswordLength(req) === false ||
      await confirmMatchPassword(req) === false ||
      await usernameNotTaken(req) === false
    ) {
      return res.redirect('/signup');
    }

    // creates new user
    const username = req.body.username;
    const password: string = await encryptPassword(req.body.password);
    const [error] = await updateUserNewSignup(username, password, req.session.user.idProfile);
    if (error) {
      return next(error);
    }

    // successful insertion, need to update session server side
    req.session.user.isAuth = true;
    req.session.user.username = username;
    res.redirect(req.session.returnTo || '/');
  } catch (err) {
    logger.error(err);
  }
};

/**
 * Function to create AnonymousUser
 */
export async function createAnonUser() {
  const username: null = null;
  const password: null = null;
  // creates new user
  const newUser = {
    [usernameFieldName]: username,
    [passwordFieldName]: password,
  };
  try {
    const [error, results] = await createUser(newUser);
    if (error) {
      throws;
    }
    return results.insertId;
  } catch (err) {
    logger.error(err);
  }
}

/**
 * Function to create new Session in our DB (not express-session)
 */
export async function createSessionDB(idProfile: number, idExpressSession: string) {
  const idSession = await insertSession(idProfile, idExpressSession);
  return idSession;
}

/**
 * GET /account
 * Profile page.
 */
export const getAccount = (req: Request, res: Response) => {
  let username = 'Anonymous User';
  if (req.session.user.isAuth) {
    username = req.session.user.username;
  }
  let source = false;
  console.log('req.session.user.source');
  console.log(req.session.user.source);
  if(req.session.user.source) {
    console.log(typeof req.session.user.source);
    if(req.session.user.source.includes('prolific')) {
    source = true;
  }}
  res.render('account/profile', makeRenderObject({ title: 'Account Management', username: username, idProfile: req.session.user.idProfile, idSession: req.session.user.idSession, idExpress: req.sessionID, source: source }, req));
};

/**
 * POST /account/password
 * Update current password.
 */
export const postUpdatePassword = async (req: Request, res: Response, next: NextFunction) => {
  if (await checkPasswordLength(req) === false ||
    await confirmMatchPassword(req) === false
  ) {
    return res.redirect('/account');
  }

  //const user = req.user as Partial<UserModel>;
  const username = req.session.user.username;
  const password: string = await encryptPassword(req.body.password);
  const updatedUser = {
    [passwordFieldName]: password,
  };

  const [error] = await updateUser(updatedUser, { [usernameFieldName]: username });
  if (error) {
    return next(error);
  }

  // successfully updated password
  req.flash('success', { msg: 'Password has been changed' });
  res.redirect('/account');
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
export const getReset = async (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }

  const token = req.params.token;
  const [error, user] = await findUserByField(passwordResetToken, token);
  if (user == null) {
    req.flash('errors', { msg: 'Password reset token is invalid' });
    return res.redirect('/forget');
  }
  if (!user) {
    return next(error);
  }
  const expiration = user[passwordResetExpires];
  if (moment().isSameOrAfter(expiration)) {
    // reset token has expired
    req.flash('errors', { msg: 'Password reset token has expired' });
    return res.redirect('/forget');
  }

  // successful password reset
  res.render('account/reset', makeRenderObject({ title: 'Reset', username: user.username }, req));
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
export const postReset = async (req: Request, res: Response, next: NextFunction) => {
  if (await checkPasswordLength(req) === false ||
    await confirmMatchPassword(req) === false
  ) {
    return res.redirect('back');
  }

  async.waterfall([
    async function resetPassword(done: any) {
      const token = req.params.token;
      const [error, user] = await findUserByField(passwordResetToken, token);
      if (user == null) {
        req.flash('errors', { msg: 'Password reset token is invalid' });
        return res.redirect('back');
      }
      if (!user) {
        return next(error);
      }
      const expiration = user[passwordResetExpires];
      if (moment().isSameOrAfter(expiration)) {
        // reset token has expired
        req.flash('errors', { msg: 'Password reset token has expired' });
        return res.redirect('back');
      }
      // pass reset validation
      const password = req.body.password;
      const updatedUser: Partial<UserModel> = {
        [passwordFieldName]: password,
        [passwordResetToken]: null,
        [passwordResetExpires]: null,
      };

      const [updateError] = await updateUser(updatedUser, { [passwordResetToken]: token });
      if (updateError) {
        return done(updateError);
      }
      Object.assign(user, updatedUser);
      req.logIn(user, (err) => {
        done(err, user);
      });
    }
  ], (err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
};

/**
 * GET /forget
 * Forget Password page.
 */
export const getForget = (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('account/forget', makeRenderObject({ title: 'Forget Password' }, req));
};

/**
 * POST /forget
 * Create a random token
 */
export const postForget = async (req: Request, res: Response, next: NextFunction) => {
  if (
    await isNotEmail(req) === false ||
    await isValidUsername(req) === false ||
    await usernameExists(req) === false) {
    return res.redirect('/forget');
  }

  const username = req.body.username;
  async.waterfall([
    function createRandomToken(done: any) {
      crypto.randomBytes(256, (err, buf) => {
        const token = buf.toString('hex');
        done(err, token);
      });
    },
    async function setRandomToken(token: string, done: any) {
      const [error, user] = await findUserByField(usernameFieldName, username);
      if (user == null) {
        req.flash('errors', { msg: 'Account with that name does not exist.' });
        return res.redirect('/forget');
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

      const [updateError] = await updateUser(updatedUser, { [usernameFieldName]: username });
      if (updateError) {
        return done(updateError);
      }
      // successful
      Object.assign(user, updatedUser);
      done(error, token, user);
    }
  ], (err) => {
    if (err) { return next(err); }
    res.redirect('/forget');
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
 * GET /usrsession
 */
 export const getSession = (req: Request, res: Response) => {
  return res.status(200).json(req.session.user.idSession);
};

/**
 * GLOBAL MIDDLEWARE
 */
export async function checkSessionUser(req: Request, res: Response, next: NextFunction) {
  const uuid = req.cookies['draftyUnique'];
  const url = req.url;
  if (!req.session.user) {
    if (req.user) {
      logger.debug(req.sessionID + ' :: NO USER but there is a passport :: ' + req.user);
    }
    // sw: only place to create a new idProfile - this will get triggered before any login
    req.session.user = {
      idSession: -1,
      idProfile: await createAnonUser(),
      username: 'AnonymousUser',
      isAuth: false,
      isAdmin: false,
      activeExperiments: {},
      source: '',
      views: 0,
      trafficUUID: uuid,
      lastURL: url,
      seenWelcome: 0,
      lastInteraction: Date.now(),
      failedLoginAttempts: 0
    };
    next();
  } else {
    req.session.user.trafficUUID = uuid;
    req.session.user.lastURL = url;
    next();
  }
}

/**
 * GLOBAL MIDDLEWARE
 */
const heartbeat = 20 * 60000; // mins * 60000 milliseconds
export async function checkSessionId(req: Request, res: Response, next: NextFunction) {
  const interactionTime = Date.now();
  if (((interactionTime - await req.session.user.lastInteraction) > heartbeat) || (await req.session.user.idSession === -1)) {
    req.session.user.idSession = await createSessionDB(req.session.user.idProfile, req.sessionID);
  }
  req.session.user.lastInteraction = interactionTime;
  req.session.user.views++;
  next();
}


/**
 * GLOBAL MIDDLEWARE
 */
export async function checkReturnPath(req: Request, res: Response, next: NextFunction) {
  if (!req.path.includes('favicon') && !req.path.includes('service-worker.js')) {
    req.session.returnTo = req.path;
  }
  next();
}