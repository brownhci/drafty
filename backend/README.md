# Drafty Backend

## How to Use

Steps:
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

## Getting on board

Supporting libraries used:

- [compression](https://github.com/expressjs/compression)<br/>
  The middleware will attempt to compress response bodies for all request that traverse through the middleware.
- [express-session](https://github.com/expressjs/session)<br/>
  Simple session middleware for Express.<br/> Choose to store with [express-mysql-session](https://github.com/chill117/express-mysql-session)

## Contact
[Zhengyi Peng](mailto:zhengyi_peng@brown.edu)
