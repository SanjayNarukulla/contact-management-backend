import nodemailer from "nodemailer";
import prisma from "../../../lib/db";
import rateLimit from "express-rate-limit";

// Create a rate limiter for the reset password endpoint
const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many requests, please try again later.",
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    // Apply rate limiting
    await resetPasswordLimiter(req, res, async () => {
      const { email } = req.body;

      // Validate email input
      if (!email) {
        return res.status(400).json({ message: "Email is required." });
      }

      try {
        // Check for environment variables
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
          console.error(
            "Email configuration error: missing environment variables."
          );
          return res
            .status(500)
            .json({ message: "Server configuration error." });
        }

        // Normalize email
        const normalizedEmail = email.toLowerCase();

        // Find the user
        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        // Security measure: don't indicate if the email doesn't exist
        if (!user) {
          return res.status(200).json({ message: "OTP sent." });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes

        // Check if OTP already exists for this email
        const existingOtp = await prisma.otp.findUnique({
          where: { email: normalizedEmail },
        });

        if (existingOtp) {
          // Update the existing OTP record and extend expiry
          await prisma.otp.update({
            where: { email: normalizedEmail },
            data: { otp, expires },
          });
        } else {
          // Store the OTP in the database if it doesn't exist
          await prisma.otp.create({
            data: { email: normalizedEmail, otp, expires },
          });
        }

        // Send OTP email
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          to: normalizedEmail,
          subject: "Your OTP Code",
          text: `Your OTP is: ${otp}`,
          html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
        });

        console.log(`OTP sent to ${normalizedEmail}`);
        return res.status(200).json({ message: "OTP sent." });
      } catch (error) {
        console.error("Error sending OTP: ", error);
        return res.status(500).json({ message: "Error sending OTP." });
      }
    });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
