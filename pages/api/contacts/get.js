import prisma from "../../../lib/db";
import { isAuthenticated } from "../../../lib/auth";
import moment from "moment-timezone";

export default async function handler(req, res) {
  if (req.method === "GET") {
    await isAuthenticated(req, res, async () => {
      const userId = req.user.id;

      try {
        const contacts = await prisma.contact.findMany({
          where: { userId },
          select: {
            // Explicitly select only necessary fields
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            timezone: true,
            created_at: true,
            updated_at: true,
          },
        });

        // Map the contacts to include only desired fields and format timestamps
        const formattedContacts = contacts.map((contact) => {
          const contactTimezone = contact.timezone || "UTC"; // Default to UTC if no timezone is set

          // Validate timezone
          if (!moment.tz.zone(contactTimezone)) {
            console.error("Invalid contact timezone:", contactTimezone);
            // Fall back to UTC if invalid
            return {
              id: contact.id,
              name: contact.name,
              email: contact.email,
              phone: contact.phone,
              address: contact.address,
              timezone: "UTC",
              createdAt: moment(contact.created_at).tz("UTC").format(),
              updatedAt: moment(contact.updated_at).tz("UTC").format(),
            };
          }

          return {
            id: contact.id,
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            address: contact.address,
            timezone: contact.timezone,
            createdAt: moment(contact.created_at).tz(contactTimezone).format(),
            updatedAt: moment(contact.updated_at).tz(contactTimezone).format(),
          };
        });

        return res.status(200).json(formattedContacts); // Respond with formatted contacts
      } catch (error) {
        console.error("Error retrieving contacts:", error);
        return res.status(500).json({
          message: `Error retrieving contacts: ${error.message}`,
        });
      }
    });
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`); // Respond with 405 if method not allowed
  }
}
