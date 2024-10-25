// lib/mailer.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail", // Use your email service
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});

export const sendVerificationEmail = (to, verificationLink) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Email Verification",
    text: `Click the link to verify your email: ${verificationLink}`,
  };

  return transporter.sendMail(mailOptions);
};
