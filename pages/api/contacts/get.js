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
        });

        // Map the contacts to include only desired fields and format timestamps
        const formattedContacts = contacts.map((contact) => {
          const contactTimezone = contact.timezone || "UTC"; // Default to UTC if no timezone is set
          if (!moment.tz.zone(contactTimezone)) {
            console.log("Valid Timezones:", moment.tz.names()); // Log all valid timezones for debugging
            throw new Error("Invalid contact timezone.");
          }

          return {
            id: contact.id, // Keep the id
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            address: contact.address,
            timezone: contact.timezone,
            createdAt: moment(contact.created_at).tz(contactTimezone).format(), // Convert to contact's timezone
            updatedAt: moment(contact.updated_at).tz(contactTimezone).format(), // Convert to contact's timezone
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
