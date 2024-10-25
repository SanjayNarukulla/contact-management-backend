# Contact Management System

This Contact Management System is built with **Next.js** and uses **Prisma** as an ORM for database management. It supports user authentication, contact management, and secure RESTful API operations, making use of **JWT** for authentication.

## Features
- **User Authentication:** Registration, login, OTP verification, password reset, and user deletion.
- **Contact Management:** Add, update, delete, and batch operations for managing contacts.
- **API-Driven Backend:** Modular API routes for user and contact management.
- **Prisma ORM:** Integrated ORM for seamless database handling.

## Tech Stack
- **Next.js:** For frontend and backend API routes.
- **Prisma:** ORM for seamless database interaction.
- **JWT Authentication:** For secure user sessions and protected routes.

## Project Structure
pages/ ├── api/ │ ├── auth/ # Contains API routes for user authentication │ └── contacts/ # Contains API routes for contact management lib/ └── # Houses utility functions for database configuration and authentication


## API Endpoints

### Authentication Routes
- `POST /api/auth/register`: Registers a new user.
- `POST /api/auth/login`: Authenticates a user and issues a JWT.
- `POST /api/auth/verifyOtp`: Verifies OTP sent to the user.
- `POST /api/auth/verify`: Verifies the user's account (e.g., email verification).
- `POST /api/auth/resetPassword`: Initiates password reset.
- `POST /api/auth/confirmReset`: Confirms password reset with token.
- `DELETE /api/auth/deleteUser`: Deletes the authenticated user.
- `GET /api/auth/users`: Retrieves a list of all users (for admin access).

### Contact Management Routes
- `POST /api/contacts/add`: Adds a new contact for the authenticated user.
- `POST /api/contacts/batch`: Adds multiple contacts at once.
- `DELETE /api/contacts/batchDelete`: Deletes multiple contacts in a batch.
- `GET /api/contacts/date`: Retrieves contacts added on a specific date.
- `DELETE /api/contacts/delete`: Deletes a single contact by ID.
- `GET /api/contacts/get`: Fetches a contact by ID.
- `PUT /api/contacts/update`: Updates an existing contact by ID.

Examples of all API endpoints are provided in the `app.http` file.

## Getting Started

### Prerequisites
- Ensure you have **Node.js** installed.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SanjayNarukulla/contact-management-backend.git
   cd contact-management-backend

-**Install dependencies**:

```bash
npm install


Set up environment variables:

Create a .env file in the project root.
Add necessary environment variables:
plaintext

```bash
DATABASE_URL="your_database_url"
JWT_SECRET="your_jwt_secret"
Replace "your_database_url" and "your_jwt_secret" with actual values.
Run Prisma migrations:

```bash
npx prisma migrate dev
Run the development server:

```bash

npm run dev

Open http://localhost:3000 in your browser to view the application.
Prisma Setup
Any schema changes in schema.prisma require a migration:

```bash

npx prisma migrate dev

### Learn More
For more information, visit:

Next.js Documentation
Prisma Documentation
JSON Web Token (JWT)


### Deployment
To deploy, consider using Vercel, which provides seamless integration for Next.js apps.

For deployment steps, see the Next.js deployment documentation.