import bcrypt from "bcrypt";

const saltRounds = 10;

export async function encryptPassword(password: string) {
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Validates whether supplied password matches the password in database
 *
 * Args:
 *    candidatePassword: The password to be tested, usually provided by user input.
 *    passwordHash: The password hash to be tested against, usually retrieved from database.
 * Returns:
 *    A boolean representing whether two passwords matches.
 */
export async function comparePassword(candidatePassword: string, passwordHash: string) {
  return await bcrypt.compare(candidatePassword, passwordHash);
}
