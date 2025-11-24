import dotenv from 'dotenv';
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from '../db/schema.js';
import { Pool } from "pg";
import { sql } from 'drizzle-orm';

// Load .env.test before anything else
dotenv.config({ path: '.env.test' });

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error('TEST_DATABASE_URL not found in .env.test');
}

const client = new Pool({
  connectionString,
});

export const testDb = drizzle(client, { schema });

export async function cleanDatabase() {
  await testDb.execute(sql`TRUNCATE TABLE entries CASCADE`);
  await testDb.execute(sql`TRUNCATE TABLE articles CASCADE`);
}

export async function closeDatabase() {
  await client.end();
}