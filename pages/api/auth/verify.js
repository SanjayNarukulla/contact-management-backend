//pages/api/auth/verify.js
import jwt from "jsonwebtoken";
import prisma from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { token } = req.query;

    // Verify the token
    if (!token) {
      return res.status(400).json({ message: "Token is required." });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if the user exists
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // Check if the user is already verified
      if (user.is_verified) {
        return res.status(200).json({ message: "Email is already verified." });
      }

      // Update the user's verification status
      const updatedUser = await prisma.user.update({
        where: { id: decoded.id },
        data: { is_verified: true },
        select: {
          id: true,
          email: true,
          is_verified: true,
          created_at: true,
          updated_at: true,
        },
      });

      // Return success response
      return res.status(200).json({
        message: "Email verified successfully!",
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          is_verified: updatedUser.is_verified,
        },
      });
    } catch (error) {
      console.error("Token verification error: ", error);
      if (error.name === "JsonWebTokenError") {
        return res.status(400).json({ message: "Invalid token." });
      }
      if (error.name === "TokenExpiredError") {
        return res.status(400).json({ message: "Token expired." });
      }
      return res.status(500).json({ message: "Internal Server Error." });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
