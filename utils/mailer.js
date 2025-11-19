import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Gmail requires SSL on port 465
  auth: {
    user: process.env.MAIL_USER, // your full Gmail address
    pass: process.env.MAIL_PASS, // your 16-digit App Password
  },
});

export default transporter;
