import jwt from "jsonwebtoken";
import prisma from "./db"; // Ensure this is correctly set up

// Function to generate JWT
export const generateToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "15m", // Token expires in 15 minutes
  });
};

// Function to verify JWT
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return { expired: true }; // Return an object indicating token expiration
    }
    return null; // Token is invalid for other reasons
  }
};

// Middleware to check if a user is authenticated
export const isAuthenticated = async (req, res, next) => {
  const authHeader = req.headers["authorization"]; // Use lowercase "authorization"
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  const decoded = verifyToken(token);

  // Handle token expiration
  if (decoded && decoded.expired) {
    return res.status(403).json({ message: "Token expired." });
  }

  // Handle invalid token
  if (!decoded) {
    return res.status(403).json({ message: "Invalid token." });
  }

  try {
    // Fetch user from the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Optional: Check if user is verified before proceeding
    if (!isVerified(user)) {
      return res.status(403).json({ message: "User is not verified." });
    }

    // Attach user to the request object
    req.user = user;

    next(); // Continue to the next middleware or route handler
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Function to check if the user is verified
export const isVerified = (user) => {
  return user.is_verified; // Ensure this property exists in your user model
};
