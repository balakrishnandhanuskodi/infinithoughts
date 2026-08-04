import fs from 'fs';
import path from 'path';
import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';
const SAMPLE_ARTICLES_DIR = path.join(__dirname, '../sample-articles');

async function importSampleArticles() {
  try {
    console.log('🔍 Scanning sample articles directory...');
    const files = fs.readdirSync(SAMPLE_ARTICLES_DIR).filter(f => f.endsWith('.xml'));

    if (files.length === 0) {
      console.log('❌ No XML files found in sample-articles directory');
      process.exit(1);
    }

    console.log(`✅ Found ${files.length} sample articles to import`);

    const xmlPaths = files.map(f => path.join(SAMPLE_ARTICLES_DIR, f));

    console.log(`📤 Importing articles from ${API_BASE_URL}/admin/import-xml`);

    const response = await axios.post(`${API_BASE_URL}/admin/import-xml`, {
      xml_files: xmlPaths,
    });

    const { batch_id, imported, failed, errors } = response.data;

    console.log(`\n✅ Import completed!`);
    console.log(`   Batch ID: ${batch_id}`);
    console.log(`   Imported: ${imported}/${files.length}`);

    if (failed > 0) {
      console.log(`   Failed: ${failed}`);
      console.log(`   Errors:`, errors);
    }

    console.log('\n📚 Sample articles imported successfully!');
    console.log(`   Access them at: ${API_BASE_URL}/articles`);

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Import failed:', error.response?.data || error.message);
    } else {
      console.error('❌ Import failed:', error);
    }
    process.exit(1);
  }
}

importSampleArticles();
