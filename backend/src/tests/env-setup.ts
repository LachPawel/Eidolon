import dotenv from "dotenv";

// Load .env.test before anything else
dotenv.config({ path: ".env.test", override: true });

// Ensure the application uses the test database
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}
