//pages/api/contacts/date.js
import moment from "moment-timezone";
import prisma from "../../../lib/db";
import { isAuthenticated } from "../../../lib/auth";

export default async function handler(req, res) {
  if (req.method === "GET") {
    await isAuthenticated(req, res, async () => {
      const { startDate, endDate, timezone } = req.query;

      // Validate query parameters
      if (!startDate || !endDate) {
        return res
          .status(400)
          .json({ message: "Both startDate and endDate are required." });
      }

      // Validate timezone using moment.tz.names()
      if (!timezone || !moment.tz.names().includes(timezone)) {
        return res.status(400).json({ message: "Valid timezone is required." });
      }

      try {
        // Parse and validate the dates
        const parsedStartDate = moment.tz(startDate, timezone);
        const parsedEndDate = moment.tz(endDate, timezone);

        // Check if the dates are valid and ensure startDate is before endDate
        if (!parsedStartDate.isValid() || !parsedEndDate.isValid()) {
          return res
            .status(400)
            .json({ message: "Invalid startDate or endDate format." });
        }

        if (parsedStartDate.isAfter(parsedEndDate)) {
          return res
            .status(400)
            .json({ message: "startDate must be before endDate." });
        }

        const contacts = await prisma.contact.findMany({
          where: {
            userId: req.user.id,
            created_at: {
              gte: parsedStartDate.utc().toDate(), // Convert to UTC for the database query
              lte: parsedEndDate.utc().toDate(), // Convert to UTC for the database query
            },
          },
        });

        // Convert UTC to the user's specified timezone
        const contactsWithConvertedTimestamps = contacts.map((contact) => ({
          id: contact.id, // Include only necessary fields
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          address: contact.address,
          timezone: contact.timezone,
          created_at: moment.utc(contact.created_at).tz(timezone).format(),
          updated_at: moment.utc(contact.updated_at).tz(timezone).format(),
        }));

        return res.status(200).json({ data: contactsWithConvertedTimestamps });
      } catch (error) {
        console.error("Error retrieving contacts:", error); // Log error for monitoring
        return res
          .status(500)
          .json({ message: `Error retrieving contacts: ${error.message}` });
      }
    });
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
