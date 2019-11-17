import nodemailer from "nodemailer";
import { Request, Response } from "express";
import { sendMail, userFeedbackEmailAccount } from "../util/email";
import { fieldNonEmpty, isValidEmail } from "../validation/validators";

/**
 * POST /contact
 * Send a contact form via Nodemailer.
 */
export const postContact = async (req: Request, res: Response) => {
  if (await isValidEmail(req) === false ||
      await fieldNonEmpty(req, "subject") === false) {
    return res.redirect("/help");
  }

  const mailOptions = {
      to: userFeedbackEmailAccount,
      from: `${req.body.email}`,
      subject: req.body.subject,
      text: req.body.message
  };
  const [error] = await sendMail(mailOptions);
  if (error) {
      req.flash("errors", { msg: error.message });
  } else {
    req.flash("success", { msg: `Your email has been sent successfully to ${userFeedbackEmailAccount}!` });
  }
  res.redirect("/help");
};
