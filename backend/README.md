# Drafty Backend

## How to Use

Steps:

1. Start your mysql server
   ```bash
   mysql.server start
   ```
1. If you need to import any existing MySQL database:
   ```bash
   mysql -u [username] -p [database_name] < [path_to_.sql file]
   ```
   For example, `mysql -uroot -p test < src/database/profs.sql` will import the professors' database.

   - username need to have correct permissions, consider using root user if you are not sure
   - database_name should be an existing database
   - remember to give the user specified in `.env` proper privileges to the databases you imported.<br/>
     For example, the following MySQL statement is executed within MySQL prompt to give *testuser* privileges to *profs* database<br/>
     `GRANT ALL PRIVILEGES ON profs.* TO 'testuser'@'localhost';`
1. Create a MySQL (MariaDB) with user, permission, database correctly set up. Here is one of the various tutorials on how to [Create a MySQL user and assign access rights](https://gridscale.io/en/community/tutorials/create-a-mysql-user/).<br/>
   Steps including: *Don't foget to reflect your databases, users, passwords in .env file*:
   - create a database, user with correct privileges, password for main database<br/>
     [Create MySQL Database, Table & User From Command Line Guide](https://www.a2hosting.com/kb/developer-corner/mysql/managing-mysql-databases-and-users-from-the-command-line)
   - create another database, user with proper privileges, password for session database (*okay to reuse previous database, user, password*)<br/>
1. Create an environment file in `./backend/` directory, you can copy over `./backend/.env.example` for quick start
1. Run `npm install` to install necessary dependencies
1. Run `npm run build` to fully build the directory
1. Depends on whether you need continuous build (detects your changes and updates build), usually you want this for development, run one of the following script
    - run with `npm run watch` for continuous build
    - run with `npm start` for normal build


## Directory Structure

+ `.vscode/` Contains VS Code specific settings
+ `dist/` Contains the distributable (or output) from build (typescript, sass, handlebars...). This is the code actually deployed.
+ `node_modules/` Contains all npm dependencies
+ **`src/`** Contains source code that will be compiled to the dist dir
    + `config/` Passport authentication strategies, login middleware, handlebars helpers and render function helper (**use makeRenderObject(renderObject, request)** to include user information and sheet information necessary for navbar rendering**).
    + **`controllers/`** Controllers define functions that respond to various http requests
    + **`database/`** Define MySQL connection (`mysql.ts`); SQL statements and common operations (for example, `user.ts` contains function to add user, update user)
    + **`models/`** Define table and column name strings (**modify the corresponding model file after changing database schema**) and util functions that do not involve querying the database
    + **`public/`** Static assets that will be used client side
        + **`css/`** Page-wide and app-wide stylesheets (Sass is used and directory structure follows [7-1 Pattern](https://sass-guidelin.es/#the-7-1-pattern) )<br/>
          To add new partials (*think it as modules to be imported*), put a new partial under correct directory and import it in the file with the same name as the directory
            + `abstracts/` The `abstracts/` folder gathers all Sass tools and helpers used across the project. Every global variable, function, mixin and placeholder should be put in here.
            + `base/` The `base/` folder holds what we might call the boilerplate code for the project. In there, you might find the reset file, some typographic rules, and probably a stylesheet defining some standard styles for commonly used HTML elements
            + **`components/`** For smaller components, there is the `components/` folder. While `layout/` is macro (defining the global wireframe), `components/` is more focused on widgets. It contains all kind of specific modules like a slider, a loader, a widget, and basically anything along those lines. There are usually a lot of files in components/ since the whole site/application should be mostly composed of tiny modules.
            + `layout/` The layout/ folder contains everything that takes part in laying out the site or application. This folder could have stylesheets for the main parts of the site (header, footer, navigation, sidebar…), the grid system or even CSS styles for all the forms.
            + **`pages/`** page-specific styles. Each file should be named after the page.
            + `themes/` Different themes. Not currently used.
            + `vendors/` A folder containing all the CSS files from external libraries and frameworks
        + `fonts/` Display required fonts
        + `images/` Display required images and icons
        + **`js/`** Client-side scripts
        + `webfonts/` FontAwesome required fonts
    + `types/` Holds .d.ts files not found on DefinitelyTyped.
    + **`util/`** Wrappers for third party libraries (for example, password authentifcation using bcrypt)
    + `validation/` Custom vaidation middleware, see [Custom validators/sanitizers](https://express-validator.github.io/docs/custom-validators-sanitizers.html
    + `src/server.ts` Entry point to your express app
    + **`src/app.ts`** Register all routes and corresponding controllers, import all third party libraries used for entire app.
+ `test/` Contains tests
+ **`views/`** Views define how the website renders on the client.
    + `account/` Views for account related pages (user sign in / sign out...)
    + `layouts/` Basic layout for all pages
    + `partial/` Reusable components
    + `sheets/` Views for individual sheets
    + `*.hbs` Views for other pages
+ **`.env.example`** Example configuration of database config, email config. Make sure to use a different `.env` file for production. **Do not commit actual `.env` file as it contains important secrets**.
+ `.eslintignore` Config settings for paths to exclude from linting
+ `.eslintrc` Config settings for ESLint code style checking
+ `.gitignore` Files and directories to be excluded from git commits
+ `.travis.yml` Used to configure Travis CI build
+ **`README.md`** Detailed information about this project. **Please update README when you introduce new functionalities or new directories**
+ `.copyStaticAssets.ts` Build script that copies images, fonts, and JS libs to the dist folder
+ `debug.log` A log of all error, warnings during running the application, a useful script to see the end of logs is `tail debug.log`
+ `jest.config.js` Used to configure Jest running tests written in TypeScript
+ `package.json` File that contains npm dependencies as well as build scripts
+ `tsconfig.json` Config settings for compiling server code written in TypeScript



## Troubleshooting

-  `[Node] (node:36476) UnhandledPromiseRejectionWarning: Error: Client does not support authentication protocol requested by server; consider upgrading MySQL client`<br/>
   [Reason & Fix](https://stackoverflow.com/questions/50093144/mysql-8-0-client-does-not-support-authentication-protocol-requested-by-server)
- `SASS` install node-sass globally: npm install -g node-sass
- Missing directory, page not displayed properly<br/>
  Try run `npm run build` to fully rebuild the directory

## Dependencies

Supporting libraries used:

- [compression](https://github.com/expressjs/compression)<br/>
  The middleware will attempt to compress response bodies for all request that traverse through the middleware.
- [express-session](https://github.com/expressjs/session)<br/>
  Simple session middleware for Express.<br/> Choose to store with [express-mysql-session](https://github.com/chill117/express-mysql-session)
- [body-parser](https://github.com/expressjs/body-parser)<br/>
  Parse incoming request bodies in a middleware before your handlers, available under the req.body property.
- [lusca](https://github.com/krakenjs/lusca)<br/>
  Web application security middleware.
- [Express Flash](https://github.com/RGBboy/express-flash)<br/>
  Flash is an extension of connect-flash with the ability to define a flash message and render it without redirecting the request.
- [express-validator](https://github.com/express-validator/express-validator)<br/>
  An express.js middleware for validator
- [node.bcrypt.js](https://github.com/kelektiv/node.bcrypt.js)<br/>
  A library to help you hash passwords.
- [node-sass](https://github.com/sass/node-sass)<br/>
  Node-sass is a library that provides binding for Node.js to LibSass, the C version of the popular stylesheet preprocessor, Sass.

## Contact
[Shaun Wallace](mailto:shaun_wallace@brown.edu)
