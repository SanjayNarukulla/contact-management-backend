import prisma from "../../../lib/db";
import { isAuthenticated } from "../../../lib/auth";
import { validateContact } from "../../../utils/validation";
import moment from "moment-timezone";

const validTimezones = moment.tz.names();

const isValidTimezone = (timezone) => {
  return validTimezones.includes(timezone);
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    await isAuthenticated(req, res, async () => {
      const { name, email, phone, address, timezone } = req.body;

      const errors = validateContact({
        name,
        email,
        phone,
        address,
        timezone,
      });

      if (errors) {
        return res.status(400).json({ message: errors.join(", ") });
      }

      if (
        !timezone ||
        typeof timezone !== "string" ||
        !isValidTimezone(timezone)
      ) {
        return res.status(400).json({ message: "Invalid timezone." });
      }

      try {
        const currentTime = moment.tz(timezone);
        const createdAtUTC = currentTime.clone().utc().toISOString();
        const updatedAtUTC = createdAtUTC;

        const newContact = await prisma.contact.create({
          data: {
            name,
            email,
            phone,
            address,
            timezone,
            userId: req.user.id,
            created_at: createdAtUTC,
            updated_at: updatedAtUTC,
          },
        });

        // Optionally convert createdAtUTC back to local time
        const createdLocalTime = currentTime.format("YYYY-MM-DD HH:mm:ss");

        return res.status(201).json({
          message: "Contact created successfully!",
          contact: { ...newContact, createdLocalTime },
        });
      } catch (error) {
        console.error(`Error adding contact for user ${req.user.id}:`, error);
        return res.status(500).json({
          message:
            process.env.NODE_ENV === "development"
              ? error.message
              : "Internal Server Error",
        });
      }
    });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
