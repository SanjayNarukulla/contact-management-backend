// utils/validation.js

export const validateContact = (contact) => {
  const { name, email, phone, address, timezone } = contact;
  const errors = [];

  if (!name || typeof name !== "string" || name.trim() === "") {
    errors.push("Name is required and must be a string.");
  }

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    errors.push("A valid email is required.");
  }

  if (!phone || typeof phone !== "string" || phone.trim() === "") {
    errors.push("Phone number is required and must be a string.");
  }

  if (!address || typeof address !== "string" || address.trim() === "") {
    errors.push("Address is required and must be a string.");
  }

  if (!timezone || typeof timezone !== "string" || timezone.trim() === "") {
    errors.push("Timezone is required and must be a string.");
  }

  return errors.length ? errors : null;
};
