import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load environment variables
const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://localhost/infinithoughts';

console.log('📍 Connecting to:', DATABASE_URL.replace(/:[^@]*@/, ':***@'));

const pool = new Pool({
  connectionString: DATABASE_URL,
});

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');

    const migrationsDir = path.dirname(__filename);
    const sqlFiles = fs
      .readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    if (sqlFiles.length === 0) {
      console.log('⚠️  No SQL migration files found');
      process.exit(0);
    }

    for (const file of sqlFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      console.log(`📝 Running migration: ${file}`);

      try {
        await pool.query(sql);
        console.log(`✅ Completed: ${file}`);
      } catch (error: any) {
        // Ignore "already exists" errors (idempotent migrations)
        if (error.message?.includes('already exists') || error.code === '42P07') {
          console.log(`⏭️  Skipped (already applied): ${file}`);
        } else {
          throw error;
        }
      }
    }

    console.log('✅ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
