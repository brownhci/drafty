import express, { Request, Response, NextFunction } from 'express';
import compression from 'compression'; // compresses requests
import session from 'express-session';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import lusca from 'lusca';
import flash from 'express-flash';
import path from 'path';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import httpProxy from 'http-proxy';
import { DB_HOST, DB_USER, DB_PASSWORD, SESSION_SECRET } from './util/secrets';
import * as trafficLogger from './controllers/traffic';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const MySQLStore = require('express-mysql-session')(session); // MySQLStore
console.log(MySQLStore);

// Ctrls (route handlers)
import * as helpCtrl from './controllers/help';
import * as homeCtrl from './controllers/home';
import * as sheetCtrl from './controllers/sheet';
import * as userCtrl from './controllers/user';
import * as interactionCtrl from './controllers/interaction';
import * as suggestionCtrl from './controllers/suggestion';
import * as dataSharingCtrl from './controllers/datasharing';
import * as dataPrivacyCtrl from './controllers/dataprivacy';
import * as databaitsCtrl from './controllers/databaits';
import * as commentsCtrl from './controllers/comments';
import * as helpusCtrl from './controllers/helpus';
import * as experimentsCtrl from './controllers/experiments';
// import * as middlewareTests from "./util/middlewaretests";

// API keys and Passport configuration
import * as passportConfig from './config/passport';

// Create Express server
const app = express();

// prevent leaking server information
app.disable('x-powered-by');

// Express configuration
app.set('port', process.env.PORT || 3000);
app.set('trust proxy', true); // sw: for production reverse proxy

// global view logger middleware
app.use(cookieParser());
app.use(trafficLogger.trafficLogger);

// static files
app.use('/csopenrankings', express.static('/vol/csopenrankings'));
app.use('/csopenrankingslocal', express.static(path.join(__dirname, '../../../../CSRankings'), { maxAge: 30000 }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

// View Engine
import helpers from './config/handlebars-helpers';
import { engine } from 'express-handlebars';
import { IncomingMessage, ServerResponse } from 'http';
import { Middleware } from 'express-validator/src/base';
app.engine('handlebars', engine({
  helpers: helpers,
  layoutsDir: path.join(__dirname, '../views/layouts/'),
  partialsDir: path.join(__dirname, '../views/partials/')
}));
app.set('view engine', 'handlebars');

// Express configuration
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, '../views'));
app.use(compression());
// avoid proxy error on POST requests bc of bodyParser
const unless = function(path: string, middleware: Middleware) {
  return function(req: Request, res: Response, next: NextFunction) {  
    if (path === req.path) {
      return next();
    } else {
      return middleware(req, res, next);
    }
  };
};

// home site rendering
app.get('/', homeCtrl.index);

// Session
const days = 10800; // we will manually manage sessions
const age = days * 24 * 60 * 60 * 1000; // days * hours * minutes * seconds * milliseconds
app.use(session({
  secret: SESSION_SECRET,
  name: 'security_protection',
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
    database: 'users', // sw: change this to create sessions only db
  })
}));

// passport.session has to be used after express.session in order to work properly
app.use(passport.initialize());
app.use(passport.session());

// did you know api -  reverse proxy
const proxy = httpProxy.createProxyServer();
app.all('/api-dyk/*', function(req: IncomingMessage, res: ServerResponse) {
  proxy.web(req, res, {target: 'http://localhost:5000'});
});
app.use(unless('/api-dyk/*', bodyParser.json())); // must be after dyk proxy

// sw: required for lusca to handle csrf tokens on form POST requests
app.use(bodyParser.urlencoded({ extended: true })); 

app.use(flash());
app.use(lusca.csrf());
app.use(lusca.csp({
  policy: {
    'default-src': '\'self\'',
    'frame-ancestors': '\'none\'',
    'img-src': '\'self\' data:',
    'style-src': '\'self\' \'unsafe-inline\''
  }
}));
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use(lusca.nosniff());
app.use(lusca.referrerPolicy('same-origin'));

// added security: https://expressjs.com/en/advanced/best-practice-security.html#use-helmet
app.use(helmet());

//GLOBAL MIDDLEWARE
app.use(userCtrl.checkSessionUser);
app.use(userCtrl.checkSessionId);

/**
 * Primary app routes.
 */

// user related functionalities
app.get('/login', userCtrl.getLogin);
app.post('/login', userCtrl.postLogin);
app.get('/logout', userCtrl.logout);
app.get('/forget', userCtrl.getForget);
app.post('/forget', userCtrl.postForget);
app.get('/reset/:token', userCtrl.getReset);
app.post('/reset/:token', userCtrl.postReset);
app.get('/signup', userCtrl.getSignup);
app.post('/signup', userCtrl.postSignup);
app.get('/seenwelcome', userCtrl.getSeenWelcome);
app.get('/updatewelcome', userCtrl.postSeenWelcome);
app.get('/usrsession', userCtrl.getSession);

// getting help
app.get('/help', helpCtrl.getHelp);

// passport accounts
app.get('/account', userCtrl.checkReturnPath, userCtrl.getAccount);
app.post('/account/password', passportConfig.isAuthenticated, userCtrl.postUpdatePassword);

// data privacy
app.post('/account/delete', dataPrivacyCtrl.postRemoveData);

app.post('/experiment/survey/link', experimentsCtrl.postLinkPilot);
app.post('/experiment/survey/link/full', experimentsCtrl.postLink);

// edit history per user (prolific codes)
app.get('/contribution/history', interactionCtrl.getContributionHistory);

// data sharing
//app.get('/data/edithistory', dataSharingCtrl.getEditHistory); // unused
app.get('/data/csv/:name/:token', dataSharingCtrl.getCSV);

// databaits + twitter
app.post('/databaits/tweet', databaitsCtrl.postTweet);
app.post('/databaits/tweet/next', databaitsCtrl.postTweetNextAction);
app.post('/databaits/next', databaitsCtrl.postDatabaitNextAction);
app.post('/databaits/visit', databaitsCtrl.postDatabaitVisit);

// interactions
app.post('/click', interactionCtrl.postClick);
app.post('/click-double', interactionCtrl.postClickDouble);
app.post('/sort', interactionCtrl.postSort);
app.post('/search-partial', interactionCtrl.postSearchPartial);
app.post('/search-full', interactionCtrl.postSearchFull);
app.post('/search-google', interactionCtrl.postSearchGoogle);
app.post('/paste-cell', interactionCtrl.postPasteCell);
app.post('/copy-cell', interactionCtrl.postCopyCell);

// comments
app.get('/comments/row/:idrow', commentsCtrl.getComments);
app.post('/comments/new', commentsCtrl.postNewComment);
app.post('/comments/vote/update/up', commentsCtrl.postCommentVoteUp);
app.post('/comments/vote/update/down', commentsCtrl.postCommentVoteDown);

//helpus
app.post('/helpus/start', helpusCtrl.postHelpUsStart);
app.post('/helpus/closed', helpusCtrl.postHelpUsClosed);
app.post('/helpus/answered', helpusCtrl.postHelpUsAnswered);
app.post('/helpus/showanother', helpusCtrl.postHelpUsShowAnother);

// suggestions
app.post('/newrow', suggestionCtrl.postNewRow);
app.post('/delrow', suggestionCtrl.postDelRow);
app.get('/suggestions', suggestionCtrl.getSuggestions);
app.get('/suggestions/validation-rule', suggestionCtrl.getValidationRule);
app.get('/suggestions/fornewrow', suggestionCtrl.getSuggestionsForNewRow);
app.get('/suggestions/foredit', suggestionCtrl.getSuggestionsForEdit);
app.post('/suggestions/new', suggestionCtrl.postNewSuggestion);

// sheets
app.get('/:sheet', databaitsCtrl.checkVisitFromSrc, userCtrl.checkReturnPath, sheetCtrl.getSheet);
app.get('/:sheet/edit_history', userCtrl.checkReturnPath, sheetCtrl.getSheetEditHistory);

// handle missing pages
app.get('*', function (req, res) {
  console.log(`ERROR - Cannot find requested page ${req.originalUrl}`);
  res.redirect('/');
});

export default app;
