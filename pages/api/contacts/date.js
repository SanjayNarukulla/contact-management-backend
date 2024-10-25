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

      if (!timezone || !moment.tz.zone(timezone)) {
        return res.status(400).json({ message: "Valid timezone is required." });
      }

      try {
        // Parse and validate the dates
        const parsedStartDate = moment.tz(startDate, timezone);
        const parsedEndDate = moment.tz(endDate, timezone);

        // Check if the dates are valid
        if (!parsedStartDate.isValid() || !parsedEndDate.isValid()) {
          return res
            .status(400)
            .json({ message: "Invalid startDate or endDate format." });
        }

        const contacts = await prisma.contact.findMany({
          where: {
            userId: req.user.id,
            created_at: {
              // Ensure you are using the correct database field
              gte: parsedStartDate.utc().toDate(), // Convert to UTC for the database query
              lte: parsedEndDate.utc().toDate(), // Convert to UTC for the database query
            },
          },
        });

        // Convert UTC to the user's specified timezone
        const contactsWithConvertedTimestamps = contacts.map((contact) => ({
          ...contact,
          created_at: moment.utc(contact.created_at).tz(timezone).format(), // Use correct key
          updated_at: moment.utc(contact.updated_at).tz(timezone).format(), // Use correct key
        }));

        return res.status(200).json(contactsWithConvertedTimestamps);
      } catch (error) {
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
