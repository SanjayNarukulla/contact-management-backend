// pages/api/auth/verify.js
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

      // Check if the user is already verified
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (user.is_verified) {
        // Redirect to a confirmation page if already verified
        return res.redirect("/confirmation?message=Email is already verified.");
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

      // Redirect to a confirmation page upon successful verification
      return res.redirect("/confirmation?message=Email verified successfully!");
    } catch (error) {
      console.error("Token verification error: ", error);
      return res.status(400).json({ message: "Invalid or expired token." });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
