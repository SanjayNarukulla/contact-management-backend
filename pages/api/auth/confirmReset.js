import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { token, newPassword } = req.body;

    // Basic input validation
    if (!newPassword) {
      return res.status(400).json({ message: "Password is required." });
    }
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long." });
    }
    if (!/[A-Z]/.test(newPassword)) {
      return res
        .status(400)
        .json({
          message: "Password must contain at least one uppercase letter.",
        });
    }
    if (!/[a-z]/.test(newPassword)) {
      return res
        .status(400)
        .json({
          message: "Password must contain at least one lowercase letter.",
        });
    }
    if (!/[0-9]/.test(newPassword)) {
      return res
        .status(400)
        .json({ message: "Password must contain at least one number." });
    }
    if (!/[!@#$%^&*]/.test(newPassword)) {
      return res
        .status(400)
        .json({
          message: "Password must contain at least one special character.",
        });
    }

    // Verify the token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if user exists
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user's password
      await prisma.user.update({
        where: { id: decoded.id },
        data: { password_hash: hashedPassword },
      });

      return res.status(200).json({ message: "Password reset successfully." });
    } catch (error) {
      // Handling different errors
      if (error.name === "TokenExpiredError") {
        return res.status(400).json({ message: "Token has expired." });
      } else if (error.name === "JsonWebTokenError") {
        return res.status(400).json({ message: "Invalid token." });
      } else {
        console.error("Server error: ", error); // Logging unexpected errors
        return res.status(500).json({ message: "Internal server error." });
      }
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(405)
      .json({ message: `Method ${req.method} Not Allowed` });
  }
}
