import prisma from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { page = 1, limit = 10 } = req.query; // Default values for pagination

    // Parse query parameters to integers
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    if (
      isNaN(pageNumber) ||
      isNaN(limitNumber) ||
      pageNumber < 1 ||
      limitNumber < 1
    ) {
      return res
        .status(400)
        .json({ message: "Invalid pagination parameters." });
    }

    try {
      // Fetch total count of users
      const totalUsers = await prisma.user.count();

      // Fetch users with pagination
      const users = await prisma.user.findMany({
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
      });

      // Calculate total pages
      const totalPages = Math.ceil(totalUsers / limitNumber);

      return res.status(200).json({
        totalRegistrations: totalUsers,
        totalPages,
        currentPage: pageNumber,
        users,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
