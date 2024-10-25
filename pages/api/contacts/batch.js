import prisma from "../../../lib/db";
import { isAuthenticated } from "../../../lib/auth";
import { validateContact } from "../../../utils/validation";
import moment from "moment-timezone";

const validTimezones = moment.tz.names();

export default async function handler(req, res) {
  if (req.method === "POST") {
    await isAuthenticated(req, res, async () => {
      const { contacts } = req.body;

      if (!Array.isArray(contacts)) {
        return res.status(400).json({ message: "Contacts must be an array." });
      }

      const validationErrors = [];
      const userId = req.user.id;

      for (const contact of contacts) {
        const errors = validateContact(contact);
        if (errors) {
          validationErrors.push({ contact, errors });
        }

        if (!contact.timezone || !validTimezones.includes(contact.timezone)) {
          validationErrors.push({
            contact,
            errors: ["Invalid timezone."],
          });
        }
      }

      if (validationErrors.length) {
        console.error("Validation errors:", { userId, validationErrors });
        return res.status(400).json({
          message: "Validation errors in contacts",
          errors: validationErrors,
        });
      }

      try {
        const createdContacts = await prisma.$transaction(async (prisma) => {
          return await prisma.contact.createMany({
            data: contacts.map((contact) => {
              const createdAt = moment().utc().toISOString();
              return {
                ...contact,
                created_at: createdAt,
                updated_at: createdAt,
                userId,
              };
            }),
          });
        });

        return res.status(201).json({
          message: `${contacts.length} contacts added.`,
        });
      } catch (error) {
        console.error("Error adding contacts in batch:", { userId, error });
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
