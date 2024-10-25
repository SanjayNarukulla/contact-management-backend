// pages/api/auth/deleteUser.js
import prisma from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method === "DELETE") {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    try {
      // Find the user by email to get the userId
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // Check for related contacts using userId
      const contacts = await prisma.contact.findMany({
        where: { userId: user.id }, // Use userId here
      });

      // If there are related contacts, delete them
      if (contacts.length > 0) {
        await prisma.contact.deleteMany({
          where: { userId: user.id }, // Use userId here as well
        });
        console.log(`${contacts.length} contacts deleted for user ${email}.`);
      }

      // Now delete the user
      await prisma.user.delete({
        where: { email },
      });

      return res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
      console.error("Error deleting user:", error);
      if (error.code === "P2025") {
        return res.status(404).json({ message: "User not found." });
      }
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    res.setHeader("Allow", ["DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
