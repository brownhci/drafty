import express from "express";
import compression from "compression"; // compresses requests
import session from "express-session";
import bodyParser from "body-parser";
import helmet from "helmet";
import lusca from "lusca";
import flash from "express-flash";
import path from "path";
import passport from "passport";
import { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE, SESSION_SECRET } from "./util/secrets";

//user session functions
import { createAnonUser, createSessionDB } from "./controllers/user"; //TODO: create createSession

// Create session file store
// import sessionFileStore from "session-file-store";
// const sessionStore = sessionFileStore(session); // FileStore
// eslint-disable-next-line @typescript-eslint/no-var-requires
const MySQLStore = require("express-mysql-session")(session); // MySQLStore


// Controllers (route handlers)
import * as helpController from "./controllers/help";
import * as homeController from "./controllers/home";
import * as sheetController from "./controllers/sheet";
import * as userController from "./controllers/user";
import * as contactController from "./controllers/contact";
import * as interactionController from "./controllers/interaction";
import * as suggestionController from "./controllers/suggestion";
import * as dataSharingController from "./controllers/datasharing";

// API keys and Passport configuration
import * as passportConfig from "./config/passport";


// Create Express server
const app = express();

// Express configuration
app.set("port", process.env.PORT || 3000);

// View Engine
import helpers from "./config/handlebars-helpers";
// handlebars express config
// eslint-disable-next-line @typescript-eslint/no-var-requires
const hbs = require( "express-handlebars");
app.engine("hbs", hbs({
  extname: "hbs",
  defaultView: "index",
  helpers: helpers,
  layoutsDir: path.join(__dirname, "../views/layouts/"),
  partialsDir: path.join(__dirname, "../views/partials/")
}));
app.set("view engine", "hbs");

// Express configuration
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "../views"));
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session
//const hours = .1;
//const expInMilliseconds = hours * 3600000;
//const expInMilliseconds = 1200000 // this is 20 minutes (1 min = 60000 ms)
const days = 10800; // we will manually manage sessions
const age = days * 24 * 60 * 60 * 1000; // days * hours * minutes * seconds * milliseconds

app.use(session({
    secret: SESSION_SECRET,
    name: "zomg_this_enhances_security",
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false, // sw after a change to session config not flipping this var true->false->true will result in multple sessionIDs
        httpOnly: true,
        maxAge: age
    },
    store: new MySQLStore({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: "users", // sw: change this to create sessions only db
    })
    /*
    store: new sessionStore({
       path: process.env.NOW ? `sessions` : `.sessions`,
       secret: "testing_please_change"
    })
    */
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca.csrf());
app.use(lusca.csp({
  policy: {
    // TODO remove localhost origin in production
    //"default-src": "self http://localhost:3000",
    //"img-src": "*"
  }
}));
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use(lusca.nosniff());
app.use(lusca.referrerPolicy("same-origin"));

// added security: https://expressjs.com/en/advanced/best-practice-security.html#use-helmet
app.use(helmet());

// Global Middleware
const heartbeat = 20 * 60000; // mins * 60000 milliseconds
const user = {
  idSession: -1,
  idProfile: -1,
  isAuth: false,
  isAdmin: false,
  views: 0,
  seenWelcome: 0,
  lastInteraction: Date.now(),
  failedLoginAttempts: 0
};
app.use(async (req, res, next) => {
  // detect bots: https://github.com/expressjs/session/issues/94
  //console.log(req.originalUrl);
  //console.log(req.method);

  //check if new user (req.sessionID)
  if(req.session.user === undefined) {
    // sw: this is the only place a new idProfile is created
    user.idProfile = await createAnonUser();
    req.session.user = user;
  }

  // if idProfile not found create new idProfile
  
  if(((Date.now() - req.session.user.lastInteraction) > heartbeat) || (req.session.user.idSession === -1)) {
    // new session
    req.session.user.idSession = await createSessionDB(req.session.user.idProfile,req.sessionID); 
  }
  req.session.user.lastInteraction = Date.now();
  //req.session.user.views++;

  next();
});
/* sw - commenting out for now since we are not using the FileStore sessions
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});
*/

app.use((req, res, next) => {
    // After successful login, redirect back to the intended page
    if (!req.user &&
    req.path !== "/login" &&
    req.path !== "/signup" &&
    !req.path.match(/^\/auth/) &&
    !req.path.match(/\./)) {
        req.session.returnTo = req.path;
    } else if (req.user && req.path == "/account") {
        req.session.returnTo = req.path;
    }
    next();
});

app.use(
    express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);

/**
 * Primary app routes.
 */
// home site rendering
app.get("/", homeController.index);

// user related functionalities
app.get("/login", userController.getLogin);
app.post("/login", userController.postLogin);
app.get("/logout", userController.logout);
app.get("/forget", userController.getForget);
app.post("/forget", userController.postForget);
app.get("/reset/:token", userController.getReset);
app.post("/reset/:token", userController.postReset);
app.get("/signup", userController.getSignup);
app.post("/signup", userController.postSignup);
app.get("/seenwelcome", userController.getSeenWelcome);
app.get("/updatewelcome", userController.postSeenWelcome);

// getting help
app.get("/help", helpController.getHelp);

// contacting developers
app.post("/contact", contactController.postContact);

// passport accounts
app.get("/account", userController.getAccount);
app.post("/account/profile", passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post("/account/password", passportConfig.isAuthenticated, userController.postUpdatePassword);

// data sharing
app.get("/data/:data", dataSharingController.getFile);

// interactions
app.post("/click", interactionController.postClick);
app.post("/click-double", interactionController.postClickDouble);
app.post("/sort", interactionController.postSort);
app.post("/search-partial", interactionController.postSearchPartial);
app.post("/search-full", interactionController.postSearchFull);
app.post("/copy-cell", interactionController.postCopyCell);
app.post("/copy-column", interactionController.postCopyColumn);

// suggestions
app.get("/suggestions", suggestionController.getSuggestions);
app.get("/suggestions/foredit", suggestionController.getSuggestionsForEdit);
app.post("/suggestions/new", suggestionController.postNewSuggestion);

// sheets
app.get("/:sheet", sheetController.getSheet);
// app.post("/gen", sheetController.genSheet);

// handle missing pages
app.get("*", function(req, res) {
  req.flash("errors", { msg: `Cannot find requested page ${req.originalUrl}`});
  res.redirect("/");
});

export default app;