import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('❌ [db/client.ts] DATABASE_URL environment variable is not set. Please configure it before starting the server.');
}

console.log('🔌 [db/client.ts] Creating pool with DATABASE_URL:', `${process.env.DATABASE_URL.substring(0, 40)}...`);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(1);
});

pool.on('connect', () => {
  console.log('✅ [db/client.ts] Successfully connected to database');
});

export default pool;
