import express from "express";
import compression from "compression";  // compresses requests
import session from "express-session";
import bodyParser from "body-parser";
import lusca from "lusca";
import flash from "express-flash";
import path from "path";
import mongoose from "mongoose";
import passport from "passport";
import bluebird from "bluebird";
import { MONGODB_URI, SESSION_DB_HOST, SESSION_DB_USER, SESSION_DB_PASSWORD, SESSION_DB_DATABASE, SESSION_SECRET } from "./util/secrets";
import { databaseTestFunctionality } from "./database/mysql";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const MySQLStore = require("express-mysql-session")(session);

// Controllers (route handlers)
import * as homeController from "./controllers/home";
import * as userController from "./controllers/user";
import * as contactController from "./controllers/contact";
import * as interactionController from "./controllers/interaction";

// API keys and Passport configuration
import * as passportConfig from "./config/passport";

// Create Express server
const app = express();

// Database
// demonstrate we can also connect to mariaDB
// databaseTestFunctionality();


// Connect to MongoDB
const mongoUrl = MONGODB_URI;
mongoose.Promise = bluebird;

mongoose.connect(mongoUrl, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true } ).then(
    () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
).catch(err => {
    console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
    process.exit();
});

// Express configuration
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: SESSION_SECRET,
    store: new MySQLStore({
      host: SESSION_DB_HOST,
      user: SESSION_DB_USER,
      password: SESSION_DB_PASSWORD,
      database: SESSION_DB_DATABASE,
    })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca.csrf());
app.use(lusca.csp({
  policy: {
    // TODO remove localhost origin in production
    "default-src": "self http://localhost:3000",
    "img-src": "*"
  }
}));
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use(lusca.nosniff());
app.use(lusca.referrerPolicy("same-origin"));
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
app.get("/", homeController.index);
app.get("/login", userController.getLogin);
app.post("/login", userController.postLogin);
app.get("/logout", userController.logout);
app.get("/forgot", userController.getForgot);
app.post("/forgot", userController.postForgot);
app.get("/reset/:token", userController.getReset);
app.post("/reset/:token", userController.postReset);
app.get("/signup", userController.getSignup);
app.post("/signup", userController.postSignup);
app.get("/contact", contactController.getContact);
app.post("/contact", contactController.postContact);
app.get("/account", passportConfig.isAuthenticated, userController.getAccount);
app.post("/account/profile", passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post("/account/password", passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post("/account/delete", passportConfig.isAuthenticated, userController.postDeleteAccount);
app.get("/account/unlink/:provider", passportConfig.isAuthenticated, userController.getOauthUnlink);
app.post("/new-row", interactionController.postNewRow);
app.post("/edit", interactionController.postEdit);
app.post("/click", interactionController.postClick);
app.post("/click-double", interactionController.postClickDouble);
app.post("/sort", interactionController.postSort);
app.post("/search-partial", interactionController.postSearchPartial);
app.post("/search-full", interactionController.postSearchFull);

export default app;
