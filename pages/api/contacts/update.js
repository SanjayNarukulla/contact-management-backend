// pages/api/contacts/update.js
import prisma from "../../../lib/db";
import { isAuthenticated } from "../../../lib/auth";
import { validateContact } from "../../../utils/validation";

export default async function handler(req, res) {
  if (req.method === "PUT") {
    await isAuthenticated(req, res, async () => {
      const { id, name, email, phone, address, timezone } = req.body;

      // Validate contact details
      const validationErrors = validateContact({
        name,
        email,
        phone,
        address,
        timezone,
      });

      if (validationErrors && Object.keys(validationErrors).length > 0) {
        return res
          .status(400)
          .json({ message: "Validation failed", errors: validationErrors });
      }

      if (!id) {
        return res.status(400).json({ message: "Contact ID is required." });
      }

      // Check if at least one field is provided for the update
      if (!name && !email && !phone && !address && !timezone) {
        return res
          .status(400)
          .json({
            message: "At least one field must be provided for the update.",
          });
      }

      try {
        const updatedContact = await prisma.contact.update({
          where: {
            id,
            userId: req.user.id, // Ensure user can only update their own contacts
          },
          data: {
            name,
            email,
            phone,
            address,
            timezone,
          },
        });

        return res.status(200).json(updatedContact);
      } catch (error) {
        console.error("Error updating contact:", error);

        if (error.code === "P2025") {
          // Prisma specific error for record not found
          return res.status(404).json({
            message:
              "Contact not found or you don't have permission to update it.",
          });
        }

        return res.status(500).json({ message: "Internal Server Error" });
      }
    });
  } else {
    res.setHeader("Allow", ["PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
