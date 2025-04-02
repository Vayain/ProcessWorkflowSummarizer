import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Database connection string from environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable not set');
}

// Create postgres connection
const sql = postgres(connectionString, { max: 10 });

// Create drizzle database instance
export const db = drizzle(sql, { schema });

// Function to run migrations
export async function runMigrations() {
  console.log('Running database migrations...');
  try {
    await migrate(db, { migrationsFolder: './migrations' });
    console.log('Migrations completed successfully');
  } catch (err) {
    // Check if error is because tables already exist
    const error = err as Error;
    if (error.message && error.message.includes('already exists')) {
      console.log('Some tables already exist, continuing...');
    } else {
      console.error('Error running migrations:', error);
      throw error;
    }
  }
}