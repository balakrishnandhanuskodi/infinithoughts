import dotenv from 'dotenv';
import path from 'path';
import { Pool } from 'pg';

// Load env
const envPath = path.resolve(__dirname, '../.env');
console.log('🔍 Loading .env from:', envPath);
dotenv.config({ path: envPath });

const DATABASE_URL = process.env.DATABASE_URL;
console.log('📍 DATABASE_URL:', DATABASE_URL ? 'EXISTS' : 'MISSING');

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment');
  process.exit(1);
}

console.log('🌐 Connection string (partial):', DATABASE_URL.substring(0, 40) + '...');

const pool = new Pool({
  connectionString: DATABASE_URL,
});

async function testConnection() {
  try {
    console.log('⏳ Testing database connection...');

    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!');
    console.log('⏰ Server time:', result.rows[0].now);

    // Count articles
    const articlesResult = await pool.query('SELECT COUNT(*) FROM articles');
    console.log('📚 Articles in database:', articlesResult.rows[0].count);

    // List articles
    const listResult = await pool.query(
      'SELECT id, title, slug, status FROM articles ORDER BY created_at DESC LIMIT 5'
    );
    console.log('\n📖 Latest articles:');
    listResult.rows.forEach((row, i) => {
      console.log(`  ${i + 1}. ${row.title} (${row.status})`);
    });

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Connection failed:', error.message);
    console.error('💡 Possible causes:');
    console.error('  - Network connectivity issues');
    console.error('  - Firewall/VPN blocking Supabase');
    console.error('  - Invalid DATABASE_URL');
    console.error('  - Database server is down');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();
