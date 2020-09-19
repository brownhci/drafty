import express from "express";
import compression from "compression"; // compresses requests
import session from "express-session";
import bodyParser from "body-parser";
import helmet from "helmet";
import lusca from "lusca";
import flash from "express-flash";
import path from "path";
import passport from "passport";
import fs from "fs";
import { DB_HOST, DB_USER, DB_PASSWORD, SESSION_SECRET } from "./util/secrets";

// Create session file store
// import sessionFileStore from "session-file-store";
// const sessionStore = sessionFileStore(session); // FileStore
// eslint-disable-next-line @typescript-eslint/no-var-requires
const MySQLStore = require("express-mysql-session")(session); // MySQLStore

// Ctrls (route handlers)
import * as helpCtrl from "./controllers/help";
import * as homeCtrl from "./controllers/home";
import * as sheetCtrl from "./controllers/sheet";
import * as userCtrl from "./controllers/user";
import * as contactCtrl from "./controllers/contact";
import * as interactionCtrl from "./controllers/interaction";
import * as suggestionCtrl from "./controllers/suggestion";
import * as dataSharingCtrl from "./controllers/datasharing";

// API keys and Passport configuration
import * as passportConfig from "./config/passport";

// Create Express server
const app = express();

// prevent leaking server information
app.disable("x-powered-by");

// Express configuration
app.set("port", process.env.PORT || 3000);
app.set("trust proxy", true); // sw: for production reverse proxy

//static files
app.use( express.static(path.join(__dirname, "public"), { maxAge: 31557600000 }) );

let csMultiRankerLive  = path.join(__dirname, "/vol/CSMultiRanker");
let csMultiRankerLocal = path.join(__dirname, "../../../../CSRankings");
if (fs.existsSync(csMultiRankerLive)) {
  //console.log("on LIVE server, serving csmultiranker from",csMultiRankerLive);
  app.use('/csmultiranker', express.static(csMultiRankerLive));
} else {
  //console.log("on LOCAL server, serving  csmultiranker from",csMultiRankerLocal);
  app.use('/csmultiranker', express.static(csMultiRankerLocal));
}

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


// home site rendering
app.get("/flask", homeCtrl.flaskTest);
app.get("/", homeCtrl.index);

// Session
const days = 10800; // we will manually manage sessions
const age = days * 24 * 60 * 60 * 1000; // days * hours * minutes * seconds * milliseconds

app.use(session({
    secret: SESSION_SECRET,
    name: "security_protection",
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false, // sw: should be set to true on production server; which means cookies will only be used over https
        httpOnly: true,
        sameSite: true,
        maxAge: age
    },
    store: new MySQLStore({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: "users", // sw: change this to create sessions only db
    })
}));

// passport.session has to be used after express.session in order to work properly
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca.csrf());
app.use(lusca.csp({
  policy: {
    "default-src": "'self'",
    "frame-ancestors": "'none'",
    "img-src": "'self' data:"
  }
}));
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use(lusca.nosniff());
app.use(lusca.referrerPolicy("same-origin"));

// added security: https://expressjs.com/en/advanced/best-practice-security.html#use-helmet
app.use(helmet());

//GLOBAL MIDDLEWARE
app.use(userCtrl.checkSessionUser);
app.use(userCtrl.checkSessionId);
/* sw - commenting out for now since we are not using the FileStore sessions
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});
*/

/**
 * Primary app routes.
 */

// user related functionalities
app.get("/login", userCtrl.getLogin);
app.post("/login", userCtrl.postLogin);
app.get("/logout", userCtrl.logout);
app.get("/forget", userCtrl.getForget);
app.post("/forget", userCtrl.postForget);
app.get("/reset/:token", userCtrl.getReset);
app.post("/reset/:token", userCtrl.postReset);
app.get("/signup", userCtrl.getSignup);
app.post("/signup", userCtrl.postSignup);
app.get("/seenwelcome", userCtrl.getSeenWelcome);
app.get("/updatewelcome", userCtrl.postSeenWelcome);

// getting help
app.get("/help", helpCtrl.getHelp);

// contacting developers
app.post("/contact", contactCtrl.postContact);

// passport accounts
app.get("/account", userCtrl.checkReturnPath, userCtrl.getAccount);
app.post("/account/profile", passportConfig.isAuthenticated, userCtrl.postUpdateProfile);
app.post("/account/password", passportConfig.isAuthenticated, userCtrl.postUpdatePassword);

// data sharing
app.get("/data/edithistory", dataSharingCtrl.getEditHistory);
app.get("/data/csv/:name/:token", dataSharingCtrl.getCSV);

// interactions
app.post("/click", interactionCtrl.postClick);
app.post("/click-double", interactionCtrl.postClickDouble);
app.post("/sort", interactionCtrl.postSort);
app.post("/search-partial", interactionCtrl.postSearchPartial);
app.post("/search-full", interactionCtrl.postSearchFull);
app.post("/search-google", interactionCtrl.postSearchGoogle);
app.post("/paste-cell", interactionCtrl.postPasteCell);
app.post("/copy-cell", interactionCtrl.postCopyCell);
app.post("/copy-column", interactionCtrl.postCopyColumn);

// suggestions
app.post("/newrow", suggestionCtrl.postNewRow);
app.get("/suggestions", suggestionCtrl.getSuggestions);
app.get("/suggestions/validation-rule", suggestionCtrl.getValidationRule);
app.get("/suggestions/foredit", suggestionCtrl.getSuggestionsForEdit);
app.post("/suggestions/new", suggestionCtrl.postNewSuggestion);

// sheets
app.get("/:sheet", userCtrl.checkReturnPath, sheetCtrl.getSheet);


// handle missing pages
app.get("*", function(req, res) {
  console.log(`ERROR - Cannot find requested page ${req.originalUrl}`);
  //sw: bc homepage was moved flash errors do not show up 
  //req.flash("errors", { msg: `Cannot find requested page ${req.originalUrl}`});
  res.redirect("/");
});

export default app;