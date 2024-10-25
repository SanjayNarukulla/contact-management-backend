// pages/api/auth/login.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../../lib/db";
import rateLimit from "express-rate-limit"; // Import the rate limiter

// Create a rate limiter for the login endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many login attempts, please try again later.",
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    // Apply rate limiting
    await loginLimiter(req, res, async () => {
      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials." });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(
        password,
        user.password_hash
      );
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid credentials." });
      }

      // Create JWT token
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      return res.status(200).json({ token });
    });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
