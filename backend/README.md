# Drafty Backend

## How to Use

Steps:

1. Configure your mongoDB server
   ```bash
   # create the db directory
   sudo mkdir -p /data/db
   # give the db correct read/write permissions
   sudo chmod 777 /data/db
   ```
1. Start your mongoDB server (you'll probably want another command prompt)
   ```
   mongod
   ```
1. Create a MySQL (MariaDB) with user, permission, database correctly set up. Here is one of the various tutorials on how to [Create a MySQL user and assign access rights](https://gridscale.io/en/community/tutorials/create-a-mysql-user/).<br/>
   Steps including: *Don't foget to reflect your databases, users, passwords in .env file*:
   - create a database, user with correct privileges, password for main database<br/>
     [Create MySQL Database, Table & User From Command Line Guide](https://www.a2hosting.com/kb/developer-corner/mysql/managing-mysql-databases-and-users-from-the-command-line)
   - create another database, user with proper privileges, password for session database<br/>
1. Create an environment file in `./backend/` directory, you can copy over `./backend/.env.example` for quick start
1. Make sure MySQL (MariaDB) is serving
1. Depends on whether you need continuous build (detects your changes and updates build), usually you want this for development, run one of the following script
    - run with `npm run watch` for continuous build
    - run with `npm run build` and `npm start` for normal build


## Troubleshooting

-  `[Node] (node:36476) UnhandledPromiseRejectionWarning: Error: Client does not support authentication protocol requested by server; consider upgrading MySQL client`<br/>
   [Reason & Fix](https://stackoverflow.com/questions/50093144/mysql-8-0-client-does-not-support-authentication-protocol-requested-by-server)

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

## Contact
[Zhengyi Peng](mailto:zhengyi_peng@brown.edu)
