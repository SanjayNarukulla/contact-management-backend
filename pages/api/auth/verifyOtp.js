// pages/api/auth/verifyOtp.js
import prisma from "../../../lib/db";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { email, otp, newPassword } = req.body;

    // Basic input validation
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase();

    // Check OTP from the database
    const storedOtp = await prisma.otp.findUnique({
      where: { email: normalizedEmail },
    });

    if (
      !storedOtp ||
      storedOtp.otp !== otp ||
      Date.now() > new Date(storedOtp.expires)
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    try {
      // Check if the user exists
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the user's password
      await prisma.user.update({
        where: { email: normalizedEmail },
        data: { password_hash: hashedPassword },
      });

      // Clear the OTP from the database after successful reset
      await prisma.otp.delete({ where: { email: normalizedEmail } });

      return res.status(200).json({ message: "Password reset successfully." });
    } catch (error) {
      console.error("Error resetting password: ", error);
      return res.status(500).json({ message: "Server error." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
