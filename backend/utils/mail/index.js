import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const mailer = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: process.env.MAIL_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

mailer.send = (options) =>
  mailer.sendMail({
    from: process.env.MAIL_FROM,
    ...options,
  });

export default mailer;
