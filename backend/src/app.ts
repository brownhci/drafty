import express from "express";
import compression from "compression"; // compresses requests
import session from "express-session";
import sessionFileStore from "session-file-store";
import bodyParser from "body-parser";
import helmet from "helmet";
import lusca from "lusca";
import flash from "express-flash";
import path from "path";
import passport from "passport";
import { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE, SESSION_SECRET } from "./util/secrets";

//user session functions
import { createAnonUser } from "./controllers/user"; //TODO: create createSession

// eslint-disable-next-line @typescript-eslint/no-var-requires
//const MySQLStore = require("express-mysql-session")(session);

// Controllers (route handlers)
import * as helpController from "./controllers/help";
import * as homeController from "./controllers/home";
import * as sheetController from "./controllers/sheet";
import * as userController from "./controllers/user";
import * as contactController from "./controllers/contact";
import * as interactionController from "./controllers/interaction";
import * as suggestionController from "./controllers/suggestion";

// API keys and Passport configuration
import * as passportConfig from "./config/passport";

// Create session file store
const FileStore = sessionFileStore(session);

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
const hours = .1;
const expInMilliseconds = hours * 3600000;
app.use(session({
    secret: SESSION_SECRET,
    name: "zomg_this_enhances_security",
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false, // sw after a change to session config not flipping this var true->false->true will result in multple sessionIDs
        httpOnly: true,
        maxAge: expInMilliseconds
    },
    store: new FileStore({
       path: process.env.NOW ? `sessions` : `.sessions`,
       secret: "testing_please_change"
    })
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
const user = {
  idSession: -1,
  idProfile: -1,
  isAuth: false,
  isAdmin: false,
  views: 0,
  failedLoginAttempts: 0
};
app.use(async (req, res, next) => {
  //check if new session (req.sessionID)
  if(req.session.user === undefined) {
    user.idProfile = await createAnonUser();
    req.session.user = user;
  }
  //const idSession = await createSession();
/*
  console.log("\n\n######");
  console.log(req.session);
  console.log(req.sessionID);
  console.log("\n");
  console.log(Date.now());
  console.log(req.session.__lastAccess);
  console.log("######\n\n");
*/
  next();
});
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});
app.use((req, res, next) => {
    // After successful login, redirect back to the intended page
    if (!req.user &&
    req.path !== "/login" &&
    req.path !== "/signup" &&
    !req.path.match(/^\/auth/) &&
    !req.path.match(/\./)) {
        req.session.returnTo = req.path;
    } else if (req.user &&
    req.path == "/account") {
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

// getting help
app.get("/help", helpController.getHelp);

// contacting developers
app.post("/contact", contactController.postContact);

// passport accounts
app.get("/account", userController.getAccount);
app.post("/account/profile", passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post("/account/password", passportConfig.isAuthenticated, userController.postUpdatePassword);

// interactions
app.post("/new-row", interactionController.postNewRow);
app.post("/edit", interactionController.postEdit);
app.post("/click", interactionController.postClick);
app.post("/click-double", interactionController.postClickDouble);
app.post("/sort", interactionController.postSort);
app.post("/search-partial", interactionController.postSearchPartial);
app.post("/search-full", interactionController.postSearchFull);
app.post("/copy-cell", interactionController.postCopyCell);
app.post("/copy-column", interactionController.postCopyColumn);

// suggestions
app.get("/suggestions", suggestionController.getSuggestions);

// sheets
app.get("/:sheet", sheetController.getSheet);
app.post("/gen", sheetController.genSheet);

// handle missing pages
app.get("*", function(req, res) {
  req.flash("errors", { msg: `Cannot find requested page ${req.originalUrl}`});
  res.redirect("/");
});

export default app;