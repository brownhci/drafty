# Drafty Backend

## Getting on board

## How to Use

Steps:
- Create a MySQL (MariaDB) with user, permission, database correctly set up. Here is one of the various tutorials on how to [Create a MySQL user and assign access rights](https://gridscale.io/en/community/tutorials/create-a-mysql-user/)
- Create an environment file in `./backend/` directory, you can copy over `./backend/.env.example` for quick start
- Make sure MySQL (MariaDB) is serving
- Depends on whether you need continuous build (detects your changes and updates build), usually you want this for development, run one of the following script
    - run with `npm run watch` for continuous build
    - run with `npm run build` and `npm start` for normal build


## Troubleshooting

-  `[Node] (node:36476) UnhandledPromiseRejectionWarning: Error: Client does not support authentication protocol requested by server; consider upgrading MySQL client`<br/>
   [Reason & Fix](https://stackoverflow.com/questions/50093144/mysql-8-0-client-does-not-support-authentication-protocol-requested-by-server)

## Contact
[Zhengyi Peng](mailto:zhengyi_peng@brown.edu)
