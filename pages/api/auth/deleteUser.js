//pages/api/auth/deleteUser.js
import prisma from "../../../lib/db";
import jwt from "jsonwebtoken";

// Middleware to authenticate user
const authenticateUser = async (req) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) throw new Error("Authentication token is required.");

  return jwt.verify(token, process.env.JWT_SECRET);
};

export default async function handler(req, res) {
  if (req.method === "DELETE") {
    try {
      // Authenticate user
      const decoded = await authenticateUser(req);
      const email = decoded.email; // Assuming the email is part of the token payload

      if (!email) {
        return res.status(400).json({ message: "Email is required." });
      }

      // Find the user by email to get the userId
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // Check for related contacts using userId
      const contacts = await prisma.contact.findMany({
        where: { userId: user.id },
      });

      // If there are related contacts, delete them
      if (contacts.length > 0) {
        await prisma.contact.deleteMany({
          where: { userId: user.id },
        });
        console.log(`${contacts.length} contacts deleted for user ${email}.`);
      }

      // Now delete the user
      await prisma.user.delete({
        where: { email },
      });

      // Log the deletion (optional)
      console.log(`User deleted: ${email} at ${new Date().toISOString()}`);

      return res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
      console.error("Error deleting user:", error);
      if (error.code === "P2025") {
        return res.status(404).json({ message: "User not found." });
      } else if (error.message === "Authentication token is required.") {
        return res.status(401).json({ message: error.message });
      } else {
        return res.status(500).json({ message: "Internal Server Error" });
      }
    }
  } else {
    res.setHeader("Allow", ["DELETE"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
