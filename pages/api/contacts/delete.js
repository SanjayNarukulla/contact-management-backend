// pages/api/contacts/delete.js
import prisma from "../../../lib/db";
import { isAuthenticated } from "../../../lib/auth";

export default async function handler(req, res) {
  if (req.method === "DELETE") {
    await isAuthenticated(req, res, async () => {
      const { id } = req.body;

      // Validate the contact ID format
      if (!id) {
        return res.status(400).json({ message: "Contact ID is required." });
      }

      // Optional: Add ID format validation (e.g., check if it's a valid UUID)
      // if (!isValidUUID(id)) {
      //   return res.status(400).json({ message: "Invalid Contact ID format." });
      // }

      try {
        // Check if the contact exists and belongs to the user
        const contact = await prisma.contact.findUnique({
          where: { id },
        });

        if (!contact) {
          return res.status(404).json({ message: "Contact not found." });
        }

        if (contact.userId !== req.user.id) {
          return res.status(403).json({
            message: "You don't have permission to delete this contact.",
          });
        }

        // Proceed with deletion
        const deletedContact = await prisma.contact.delete({
          where: { id },
        });

        // Optionally, return only necessary fields
        const { userId, ...deletedContactResponse } = deletedContact;

        return res.status(200).json({
          message: "Contact deleted successfully.",
          deletedContact: deletedContactResponse,
        });
      } catch (error) {
        console.error("Error deleting contact:", {
          error: error.message,
          userId: req.user.id,
          contactId: id,
        });
        return res.status(500).json({ message: "Internal server error." });
      }
    });
  } else {
    res.setHeader("Allow", ["DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
