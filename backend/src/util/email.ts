import logger from "./logger";
import nodemailer from "nodemailer";
import Mail = require("nodemailer/lib/mailer");
import { prod, EMAIL_HOST, EMAIL_PORT, EMAIL_ACCOUNT_NAME, EMAIL_ACCOUNT_USERNAME, EMAIL_ACCOUNT_PASSWORD } from "../util/secrets";

const noReplyEmailAccount = "no-reply@drafty.cs.brown.edu";
export const userFeedbackEmailAccount = "contact@drafty.cs.brown.edu";
export const userPasswordResetEmailAccount = noReplyEmailAccount;

export const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  auth: {
      user: EMAIL_ACCOUNT_USERNAME,
      pass: EMAIL_ACCOUNT_PASSWORD
  }
});

/**
 * Send an email using the configured transport layer
 *
 * Args:
 *    mail: see <a href="https://nodemailer.com/message/">MESSAGE CONFIGURATION</a> for more info
 * Returns:
 *    [error, info]
 *      - receive [error] if an error occurred during sending the email
 *      - receive [null, info] if the email is sent successfully
 */
export async function sendMail(mail: Mail.Options) {
  try {
    const info = await transporter.sendMail(mail);
    if (prod) {
      logger.debug(`Message sent from ${EMAIL_ACCOUNT_NAME}: ${info.messageId}`);
    } else {
      logger.debug(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    return [null, info];
  } catch (error) {
    logger.warn(error);
    return [error];
  }
}
