import logger from "./logger";
import dotenv from "dotenv";
import fs from "fs";

if (fs.existsSync(".env")) {
  // synchronously look for .env file in file system
  logger.info("Using .env file to supply config environment variables");
  dotenv.config({ path: ".env" });
} else if (fs.existsSync(".env.example")) {
  // synchronously look for .env.example file in file system
  logger.warn("Using .env.example file to supply config environment variables -- this will often not work, please supply an .env file!");
  dotenv.config({ path: ".env.example" });
} else {
  logger.error("Both .env file and .env.example file do not exist! Please supply a .env file");
  process.exit(1);
}

export const ENVIRONMENT = process.env.NODE_ENV;
const prod = ENVIRONMENT === "production"; // Anything else is treated as 'dev'

export const SESSION_SECRET = process.env["SESSION_SECRET"];
if (!SESSION_SECRET) {
    logger.error("No client secret. Set SESSION_SECRET environment variable.");
    process.exit(1);
}

/**
 * Handle the case where a variable cannot be found in dot environment.
 *
 * Args:
 *    variableName: Name of the variable trying to resolve.
 * Returns:
 *    None, will exit.
 */
function defaultVariableNotFoundHandler(variableName: string) {
  logger.error(`Cannot find ${variableName} in dot environment!`);
  process.exit(1);
}

/**
 * Resolves a variable by doing a lookup in dot environment.
 *
 * Args:
 *    variableName: name of the variable in production environment.
 *    variableLocalName: name of the variable in environment other than production (dev, test for example).
 *    variableNotFoundHandler: A callback function that will be invoked with the name of the variable as the only argument when the variable is not found in the dot environment.
 * Returns:
 *    The value of the variable specified by variableName in dot environment.
 */
function resolveEnvironmentVariable(
     variableName: string,
     variableLocalName=`${variableName}_LOCAL`,
     variableNotFoundHandler=defaultVariableNotFoundHandler): string {
  const name: string = prod ? variableName : variableLocalName;
  const value: string = process.env[name];
  if (value) {
    return value;
  } else {
    variableNotFoundHandler(name);
  }
}


// Dot environment variables
export const MONGODB_URI = resolveEnvironmentVariable("MONGODB_URI");
// Main Database
export const DB_HOST = resolveEnvironmentVariable("DB_HOST");
export const DB_USER = resolveEnvironmentVariable("DB_USER");
export const DB_PASSWORD = resolveEnvironmentVariable("DB_PASSWORD");
export const DB_DATABASE = resolveEnvironmentVariable("DB_DATABASE");
// Session Database
export const SESSION_DB_HOST = resolveEnvironmentVariable("SESSION_DB_HOST");
export const SESSION_DB_USER = resolveEnvironmentVariable("SESSION_DB_USER");
export const SESSION_DB_PASSWORD = resolveEnvironmentVariable("SESSION_DB_PASSWORD");
export const SESSION_DB_DATABASE = resolveEnvironmentVariable("SESSION_DB_DATABASE");
