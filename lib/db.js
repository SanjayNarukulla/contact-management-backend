import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const connectToDatabase = async () => {
  try {
    await prisma.$connect(); // Connect to the database
    console.log("Connected to the database.");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1); // Exit the process if connection fails
  }
};

// Call the function to connect to the database
connectToDatabase();

// Clean up and disconnect from the database when the application exits
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.log("Disconnected from the database.");
  process.exit(0);
});

export default prisma;
