import prisma from "../../../lib/db";
import { isAuthenticated } from "../../../lib/auth";

export default async function handler(req, res) {
  if (req.method === "DELETE") {
    await isAuthenticated(req, res, async () => {
      const { contactIds } = req.body; // Expecting an array of contact IDs

      if (!Array.isArray(contactIds) || contactIds.length === 0) {
        return res.status(400).json({
          message: "Invalid input: contactIds must be a non-empty array.",
        });
      }

      try {
        // Delete contacts by their IDs
        const deletedContacts = await prisma.contact.deleteMany({
          where: {
            id: {
              in: contactIds, // Use `in` to match multiple IDs
            },
            userId: req.user.id, // Ensure only the authenticated user's contacts are deleted
          },
        });

        // Check how many contacts were deleted
        if (deletedContacts.count === 0) {
          return res.status(404).json({
            message: "No contacts found to delete.",
          });
        }

        // Log the deleted contact IDs for tracking
        console.log(`Deleted contacts IDs: ${contactIds.join(", ")}`);

        return res.status(200).json({
          message: `${deletedContacts.count} contacts deleted successfully.`,
          deletedContactCount: deletedContacts.count, // Optionally return the count of deleted contacts
        });
      } catch (error) {
        console.error("Error deleting contacts:", error);
        return res.status(500).json({
          message: `Internal Server Error: ${error.message}`,
        });
      }
    });
  } else {
    res.setHeader("Allow", ["DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
