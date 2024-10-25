// pages/api/auth/users.js
import prisma from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // Fetch all users
      const users = await prisma.user.findMany();
      return res.status(200).json({ totalRegistrations: users.length, users });
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
