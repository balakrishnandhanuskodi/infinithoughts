import { v4 as uuidv4 } from 'uuid';
import pool from '../db/client';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const sampleArticles = [
  {
    title: 'The Future of Digital Activism',
    slug: 'future-of-digital-activism',
    excerpt:
      'Exploring how social movements are leveraging technology to drive real-world change.',
    content_html: `
      <h2>The Rise of Digital Activism</h2>
      <p>Digital activism has transformed how movements organize and communicate. From hashtag campaigns to coordinated online fundraising, technology enables activists to reach global audiences instantly.</p>
      <h3>Key Trends</h3>
      <ul>
        <li>Decentralized organization through social platforms</li>
        <li>Real-time coordination and rapid response</li>
        <li>Global solidarity across borders</li>
        <li>Integration of offline and online strategies</li>
      </ul>
      <p>As we move forward, the intersection of digital tools and grassroots movements will continue to shape how we think about social change.</p>
    `,
    theme: 'activism',
    featured_image_url:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
    word_count: 1500,
    reading_time_minutes: 5,
  },
  {
    title: 'Reimagining Public Space',
    slug: 'reimagining-public-space',
    excerpt:
      'How communities are reclaiming and redesigning urban spaces for collective good.',
    content_html: `
      <h2>Public Space as Political Action</h2>
      <p>Public spaces are not neutral—they reflect power structures and community values. Communities worldwide are reimagining these spaces to foster connection and equity.</p>
      <h3>Successful Models</h3>
      <ul>
        <li>Participatory budgeting for community-led development</li>
        <li>Temporary installations that test permanent changes</li>
        <li>Indigenous-led place-making initiatives</li>
        <li>Accessible design prioritizing marginalized communities</li>
      </ul>
      <p>These efforts demonstrate that public space design is fundamentally about who has power and who belongs.</p>
    `,
    theme: 'urban',
    featured_image_url:
      'https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=800',
    word_count: 1800,
    reading_time_minutes: 6,
  },
  {
    title: 'Building Bridges Across Difference',
    slug: 'building-bridges-across-difference',
    excerpt:
      'Strategies for creating genuine dialogue in polarized times.',
    content_html: `
      <h2>The Challenge of Polarization</h2>
      <p>In an era of increasing polarization, the work of building genuine understanding across differences has become more critical than ever.</p>
      <h3>Proven Approaches</h3>
      <ul>
        <li>Deep listening practices and circles</li>
        <li>Storytelling and personal narratives</li>
        <li>Finding common ground through shared values</li>
        <li>Structured dialogue facilitation</li>
      </ul>
      <p>Bridge-building is not about compromise—it's about understanding and creating space for multiple truths to coexist.</p>
    `,
    theme: 'community',
    featured_image_url:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
    word_count: 1200,
    reading_time_minutes: 4,
  },
  {
    title: 'The Economics of Care',
    slug: 'economics-of-care',
    excerpt:
      'Rethinking economic systems to value care work and community wellbeing.',
    content_html: `
      <h2>Beyond Profit Maximization</h2>
      <p>Traditional economics has long undervalued care work—childcare, elder care, emotional labor. A care economy approach puts human wellbeing at the center.</p>
      <h3>Core Principles</h3>
      <ul>
        <li>Valuing interdependence over independence</li>
        <li>Recognizing care as essential work</li>
        <li>Distributing care responsibilities equitably</li>
        <li>Supporting care workers adequately</li>
      </ul>
      <p>The economics of care offers a framework for building more humane systems of value and exchange.</p>
    `,
    theme: 'economics',
    featured_image_url:
      'https://images.unsplash.com/photo-1516321318423-f06f70504646?w=800',
    word_count: 1600,
    reading_time_minutes: 5,
  },
];

async function seedArticles() {
  console.log('🌱 Starting article seeding...');

  try {
    // Create a sample issue first
    const issueId = uuidv4();
    const issueQuery = `
      INSERT INTO issues (id, issue_number, month, year, published)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT DO NOTHING
      RETURNING id
    `;

    const now = new Date();
    const issueResult = await pool.query(issueQuery, [
      issueId,
      1,
      'August',
      2024,
      true,
    ]);

    const createdIssueId = issueResult.rows[0]?.id || issueId;
    console.log(`✅ Created/verified issue: ${createdIssueId}`);

    // Insert sample articles
    for (const article of sampleArticles) {
      const articleId = uuidv4();
      const userId = uuidv4(); // Dummy user ID

      const query = `
        INSERT INTO articles (
          id, title, slug, excerpt, content_html, issue_id,
          reading_time_minutes, word_count, theme, featured_image_url,
          source, status, publication_date, author_id, created_at, updated_at, published_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (slug) DO NOTHING
        RETURNING id, title
      `;

      const values = [
        articleId,
        article.title,
        article.slug,
        article.excerpt,
        article.content_html,
        createdIssueId,
        article.reading_time_minutes,
        article.word_count,
        article.theme,
        article.featured_image_url,
        'cms',
        'PUBLISHED',
        now,
        userId,
        now,
        now,
        now,
      ];

      const result = await pool.query(query, values);

      if (result.rows.length > 0) {
        console.log(
          `✅ Created article: ${result.rows[0].title} (${result.rows[0].id})`
        );
      } else {
        console.log(`ℹ️  Article already exists: ${article.slug}`);
      }
    }

    console.log('🎉 Article seeding complete!');
    console.log(
      '📍 Visit: https://infinithoughts.netlify.app/articles to see the articles'
    );
  } catch (error) {
    console.error('❌ Error seeding articles:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedArticles();
