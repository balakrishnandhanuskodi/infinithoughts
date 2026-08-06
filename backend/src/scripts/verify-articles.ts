import pool from '../db/client';
import path from 'path';
import dotenv from 'dotenv';

const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

async function verifyArticles() {
  console.log('🔍 Checking articles in database...');

  try {
    const query = `
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'PUBLISHED' THEN 1 END) as published,
        COUNT(CASE WHEN status = 'DRAFT' THEN 1 END) as draft
      FROM articles
    `;

    const result = await pool.query(query);
    const stats = result.rows[0];

    console.log('\n📊 Article Statistics:');
    console.log(`   Total articles: ${stats.total}`);
    console.log(`   Published: ${stats.published}`);
    console.log(`   Draft: ${stats.draft}`);

    if (stats.total === 0) {
      console.log('\n⚠️  No articles found. Run the seeding script first:');
      console.log('   npm run seed --workspace=@infinithoughts/backend');
      console.log(
        '\n📖 Or follow instructions in SEEDING_ARTICLES.md'
      );
    } else {
      console.log('\n✅ Articles found! Fetching details...');

      const articlesQuery = `
        SELECT id, title, slug, status, created_at FROM articles
        ORDER BY created_at DESC
        LIMIT 10
      `;

      const articlesResult = await pool.query(articlesQuery);
      console.log('\n📄 Recent Articles:');
      articlesResult.rows.forEach((article, index) => {
        console.log(`\n   ${index + 1}. ${article.title}`);
        console.log(`      Slug: ${article.slug}`);
        console.log(`      Status: ${article.status}`);
        console.log(`      ID: ${article.id}`);
      });

      console.log(
        '\n✅ Articles are ready! Visit https://infinithoughts.netlify.app/articles'
      );
    }
  } catch (error) {
    console.error('❌ Error verifying articles:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

verifyArticles();
