import prisma from "../../../lib/db";
import { isAuthenticated } from "../../../lib/auth";
import { validateContact } from "../../../utils/validation";
import moment from "moment-timezone"; // Importing moment for timezone validation

// Function to validate timezone
const isValidTimezone = (timezone) => {
  return moment.tz.names().includes(timezone);
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    await isAuthenticated(req, res, async () => {
      const { name, email, phone, address, timezone } = req.body;

      // Validate input using the validateContact function
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

      try {
        // Validate the provided timezone
        if (
          !timezone ||
          typeof timezone !== "string" ||
          !isValidTimezone(timezone)
        ) {
          return res.status(400).json({ message: "Invalid timezone." });
        }

        // Get the current date and time in the user's specified timezone
        const currentTime = moment.tz(timezone); // Current time in the specified timezone
        const createdAtUTC = currentTime.clone().utc().toISOString(); // Convert to UTC
        const updatedAtUTC = createdAtUTC; // Set updated time to created time for initial creation

        const newContact = await prisma.contact.create({
          data: {
            name,
            email,
            phone,
            address,
            timezone,
            userId: req.user.id, // Associate contact with the authenticated user
            created_at: createdAtUTC, // Store created_at in UTC format
            updated_at: updatedAtUTC, // Store updated_at in UTC format
          },
        });

        // Send success response with the new contact
        return res.status(201).json({
          message: "Contact created successfully!",
          contact: newContact,
        });
      } catch (error) {
        console.error("Error adding contact:", error);
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
