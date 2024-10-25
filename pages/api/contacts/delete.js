// pages/api/contacts/delete.js
import prisma from "../../../lib/db";
import { isAuthenticated } from "../../../lib/auth";

export default async function handler(req, res) {
  if (req.method === "DELETE") {
    await isAuthenticated(req, res, async () => {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ message: "Contact ID is required." });
      }

      try {
        // Check if the contact exists and belongs to the user
        const contact = await prisma.contact.findUnique({
          where: { id },
        });

        if (!contact || contact.userId !== req.user.id) {
          return res
            .status(404)
            .json({
              message:
                "Contact not found or you don't have permission to delete it.",
            });
        }

        // Proceed with deletion
        const deletedContact = await prisma.contact.delete({
          where: { id },
        });

        return res
          .status(200)
          .json({ message: "Contact deleted successfully.", deletedContact });
      } catch (error) {
        console.error("Error deleting contact:", error);
        return res.status(500).json({ message: "Internal server error." });
      }
    });
  } else {
    res.setHeader("Allow", ["DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
