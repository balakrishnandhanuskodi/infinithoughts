import fs from 'fs';
import path from 'path';
import pool from './client';

export async function runMigrations() {
  try {
    console.log('🔄 [migrations] Checking for pending migrations...');

    const migrationsDir = path.join(__dirname, 'migrations');
    const sqlFiles = fs
      .readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    if (sqlFiles.length === 0) {
      console.log('ℹ️  [migrations] No SQL migration files found');
      return;
    }

    for (const file of sqlFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      try {
        console.log(`📝 [migrations] Running: ${file}`);
        await pool.query(sql);
        console.log(`✅ [migrations] Completed: ${file}`);
      } catch (error: any) {
        if (error.message?.includes('already exists') || error.code === '42P07') {
          console.log(`⏭️  [migrations] Skipped (already applied): ${file}`);
        } else {
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
