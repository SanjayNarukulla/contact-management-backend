import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import prisma from "../../../lib/db";
import rateLimit from "express-rate-limit"; // Import the rate limiter

// Create a rate limiter for the registration endpoint
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many registration attempts, please try again later.",
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    // Apply rate limiting
    await registrationLimiter(req, res, async () => {
      const { email, password } = req.body;

      // Check if email and password are provided
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required." });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "User already exists. Please log in." });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password_hash: hashedPassword,
          is_verified: false, // Set to false until email verification
        },
      });

      // Validate environment variables
      if (
        !process.env.EMAIL_USER ||
        !process.env.EMAIL_PASS ||
        !process.env.JWT_SECRET
      ) {
        return res.status(500).json({ message: "Server configuration error." });
      }

      // Send verification email
      const transporter = nodemailer.createTransport({
        service: "gmail", // or your email provider
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Create a verification token
      const verificationToken = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      const verificationUrl = `http://localhost:3000/api/auth/verify?token=${verificationToken}`;

      // Sending the verification email
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER, // Add sender's email address
          to: email,
          subject: "Verify Your Email",
          text: `Please verify your email by clicking on the following link: ${verificationUrl}`,
        });
      } catch (error) {
        console.error("Error sending verification email:", error);
        return res
          .status(500)
          .json({ message: "Failed to send verification email." });
      }

      return res.status(201).json({
        message: "User registered. Please check your email for verification.",
      });
    });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}