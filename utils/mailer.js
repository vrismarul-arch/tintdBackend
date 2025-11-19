import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.in",     // 🇮🇳 India Zoho Server (best for your domain vrism.in)
  port: 465,                // SSL Port
  secure: true,             // SSL must be true on 465
  auth: {
    user: process.env.MAIL_USER,  // your Zoho email (full email)
    pass: process.env.MAIL_PASS,  // your Zoho App Password
  },
});

export default transporter;
