# How to setup prisma?
https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project/relational-databases-typescript-postgres

For now, we use prisma to handle migrations to drafty's schema.

## Where is the prisma schema and how to reflect the current DB schema

```
The Prisma schema is schema.prisma
We recommend using vs code and its extensions for prisma

Next steps:
1. Set the DATABASE_URL in the .env file to point to your existing database. If your database has no tables yet, read https://pris.ly/d/getting-started
2. Set the provider of the datasource block in schema.prisma to match your database: postgresql, mysql, sqlite, sqlserver, mongodb or cockroachdb (Preview).
3. Run prisma db pull to turn your database schema into a Prisma schema.
4. Run prisma generate to generate the Prisma Client. You can then start querying your database.
```

```
npm install prisma --save-dev
cd prisma

# if new
npx prisma init --datasource-provider mariadb

# if not proceed to update schema from live db
npx prisma db pull

# push changes from prisma schema to db
npx prisma migrate dev --name init

```