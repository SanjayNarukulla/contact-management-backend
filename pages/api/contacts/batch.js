import prisma from "../../../lib/db";
import { isAuthenticated } from "../../../lib/auth";
import { validateContact } from "../../../utils/validation"; // Assuming this includes necessary validation logic
import moment from "moment-timezone";

export default async function handler(req, res) {
  if (req.method === "POST") {
    await isAuthenticated(req, res, async () => {
      const { contacts } = req.body; // Expecting an array of contact objects

      // Check if contacts is provided and is an array
      if (!Array.isArray(contacts)) {
        return res.status(400).json({ message: "Contacts must be an array." });
      }

      const validationErrors = [];
      const userId = req.user.id; // Destructure user ID for clarity

      // Validate each contact
      for (const contact of contacts) {
        // Validate individual contact
        const errors = validateContact(contact);
        if (errors) {
          validationErrors.push({ contact, errors });
        }

        // Validate timezone
        if (!moment.tz.zone(contact.timezone)) {
          validationErrors.push({
            contact,
            errors: ["Invalid timezone."],
          });
        }
      }

      // Return all validation errors at once
      if (validationErrors.length) {
        console.error("Validation errors:", validationErrors); // Log errors for debugging
        return res.status(400).json({
          message: "Validation errors in contacts",
          errors: validationErrors,
        });
      }

      try {
        // Wrap the contact creation in a transaction for better reliability
        const createdContacts = await prisma.$transaction(async (prisma) => {
          return await prisma.contact.createMany({
            data: contacts.map((contact) => {
              // Store the current time in UTC
              const createdAt = moment().utc().toISOString();
              const updatedAt = createdAt; // Set updated time to created time for initial creation

              return {
                ...contact,
                created_at: createdAt, // Store in UTC
                updated_at: updatedAt, // Store in UTC
                userId, // Associate contacts with the authenticated user
              };
            }),
          });
        });

        return res.status(201).json({
          message: `${contacts.length} contacts added.`,
          // Optionally return the created contacts or their IDs
          // contacts: createdContacts, // Uncomment this line if you want to return created contacts
        });
      } catch (error) {
        console.error("Error adding contacts in batch:", error);
        return res.status(500).json({
          message: `Error adding contacts: ${error.message}`,
        });
      }
    });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
