import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail", // Use your email service
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});

// Function to send verification email
export const sendVerificationEmail = async (to, verificationLink) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Email Verification",
    text: `Click the link to verify your email: ${verificationLink}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending verification email to ${to}:`, error);
    throw new Error("Could not send verification email."); // Re-throw the error for further handling
  }
};
