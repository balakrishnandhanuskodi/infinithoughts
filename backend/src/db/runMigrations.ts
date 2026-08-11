import fs from 'fs';
import path from 'path';
import pool from './client';

export async function runMigrations() {
  try {
    console.log('🔄 [migrations] Checking for pending migrations...');

    // Test database connection first
    try {
      const result = await pool.query('SELECT NOW()');
      console.log('✅ [migrations] Database connection verified');
    } catch (connError: any) {
      console.error('❌ [migrations] Database connection failed:', connError.message);
      throw new Error(`Cannot run migrations: database connection failed - ${connError.message}`);
    }

    // Look for migrations in src directory (not compiled dist)
    // __dirname will be dist/db, so we go up to src/db
    const migrationsDir = path.join(__dirname, '..', '..', 'src', 'db', 'migrations');

    // Fallback to dist if src doesn't exist
    const migrationsDirFallback = path.join(__dirname, 'migrations');
    const actualDir = fs.existsSync(migrationsDir) ? migrationsDir : migrationsDirFallback;

    console.log(`📂 [migrations] Looking for migrations in: ${actualDir}`);
    const sqlFiles = fs
      .readdirSync(actualDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    if (sqlFiles.length === 0) {
      console.log('ℹ️  [migrations] No SQL migration files found');
      return;
    }

    console.log(`📝 [migrations] Found ${sqlFiles.length} migration(s) to process`);

    for (const file of sqlFiles) {
      const filePath = path.join(actualDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      try {
        console.log(`📝 [migrations] Running: ${file}`);
        await pool.query(sql);
        console.log(`✅ [migrations] Completed: ${file}`);
      } catch (error: any) {
        const errorCode = error.code;
        const errorMsg = error.message || '';

        // Ignore only "already exists" errors
        if (errorCode === '42P07' || errorMsg.includes('already exists')) {
          console.log(`⏭️  [migrations] Skipped (already exists): ${file}`);
        } else {
          console.error(`❌ [migrations] Error in ${file}:`, error.message);
          console.error('❌ [migrations] Full error:', error);
          throw error;
        }
      }
    }

    console.log('✅ [migrations] All migrations completed successfully');
  } catch (error) {
    console.error('❌ [migrations] Migration failed:', error);
    throw error;
  }
}
