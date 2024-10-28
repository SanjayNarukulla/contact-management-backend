//pages/api/contacts/batchDelete.js
import prisma from "../../../lib/db";
import { isAuthenticated } from "../../../lib/auth";

export default async function handler(req, res) {
  if (req.method === "DELETE") {
    await isAuthenticated(req, res, async () => {
      const { contactIds } = req.body; // Expecting an array of contact IDs

      // Validate input
      if (!Array.isArray(contactIds) || contactIds.length === 0) {
        return res.status(400).json({
          message: "Invalid input: contactIds must be a non-empty array.",
        });
      }

      // Optional: Validate that all contactIds are of the expected type (e.g., strings)
      const invalidIds = contactIds.filter((id) => typeof id !== "string"); // Change 'string' if your ID type is different
      if (invalidIds.length > 0) {
        return res.status(400).json({
          message: "Invalid input: all contactIds must be strings.",
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
            message: "No contacts found matching the provided IDs.",
          });
        }

        // Log the deleted contact IDs along with user ID
        console.log(
          `User ID: ${req.user.id}, Deleted contacts IDs: ${contactIds.join(
            ", "
          )}`
        );

        return res.status(200).json({
          message: `${deletedContacts.count} contacts deleted successfully.`,
          deletedContactCount: deletedContacts.count, // Return the count of deleted contacts
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
