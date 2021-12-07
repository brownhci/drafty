import bcrypt from 'bcrypt';
import logger from '../util/logger';

const saltRounds = 10;

export async function encryptPassword(password: string) {
  try {
    return await bcrypt.hash(password, saltRounds);
  } catch(err) {
      logger.error(err);
  }
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
  try {
    return await bcrypt.compare(candidatePassword, passwordHash);
  } catch(err) {
      logger.error(err);
  }
}
