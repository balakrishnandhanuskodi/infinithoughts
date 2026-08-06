-- Seed sample articles for testing
-- Run this directly in Supabase SQL editor or via psql

-- Create a sample issue if it doesn't exist
INSERT INTO issues (issue_number, month, year, published, created_at, updated_at)
VALUES (1, 'August', 2024, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Insert sample articles using $$ syntax to avoid quote escaping issues
INSERT INTO articles (
  title, slug, excerpt, content_html, issue_id,
  reading_time_minutes, word_count, theme, featured_image_url,
  source, status, publication_date, created_at, updated_at, published_at
) VALUES
(
  'The Future of Digital Activism',
  'future-of-digital-activism',
  'Exploring how social movements are leveraging technology to drive real-world change.',
  $$<h2>The Rise of Digital Activism</h2><p>Digital activism has transformed how movements organize and communicate. From hashtag campaigns to coordinated online fundraising, technology enables activists to reach global audiences instantly.</p><h3>Key Trends</h3><ul><li>Decentralized organization through social platforms</li><li>Real-time coordination and rapid response</li><li>Global solidarity across borders</li><li>Integration of offline and online strategies</li></ul><p>As we move forward, the intersection of digital tools and grassroots movements will continue to shape how we think about social change.</p>$$,
  (SELECT id FROM issues WHERE month = 'August' AND year = 2024 LIMIT 1),
  5,
  1500,
  'activism',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
  'cms',
  'PUBLISHED',
  NOW(),
  NOW(),
  NOW(),
  NOW()
),
(
  'Reimagining Public Space',
  'reimagining-public-space',
  'How communities are reclaiming and redesigning urban spaces for collective good.',
  $$<h2>Public Space as Political Action</h2><p>Public spaces are not neutral—they reflect power structures and community values. Communities worldwide are reimagining these spaces to foster connection and equity.</p><h3>Successful Models</h3><ul><li>Participatory budgeting for community-led development</li><li>Temporary installations that test permanent changes</li><li>Indigenous-led place-making initiatives</li><li>Accessible design prioritizing marginalized communities</li></ul><p>These efforts demonstrate that public space design is fundamentally about who has power and who belongs.</p>$$,
  (SELECT id FROM issues WHERE month = 'August' AND year = 2024 LIMIT 1),
  6,
  1800,
  'urban',
  'https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=800',
  'cms',
  'PUBLISHED',
  NOW(),
  NOW(),
  NOW(),
  NOW()
),
(
  'Building Bridges Across Difference',
  'building-bridges-across-difference',
  'Strategies for creating genuine dialogue in polarized times.',
  $$<h2>The Challenge of Polarization</h2><p>In an era of increasing polarization, the work of building genuine understanding across differences has become more critical than ever.</p><h3>Proven Approaches</h3><ul><li>Deep listening practices and circles</li><li>Storytelling and personal narratives</li><li>Finding common ground through shared values</li><li>Structured dialogue facilitation</li></ul><p>Bridge-building is not about compromise—it''s about understanding and creating space for multiple truths to coexist.</p>$$,
  (SELECT id FROM issues WHERE month = 'August' AND year = 2024 LIMIT 1),
  4,
  1200,
  'community',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
  'cms',
  'PUBLISHED',
  NOW(),
  NOW(),
  NOW(),
  NOW()
),
(
  'The Economics of Care',
  'economics-of-care',
  'Rethinking economic systems to value care work and community wellbeing.',
  $$<h2>Beyond Profit Maximization</h2><p>Traditional economics has long undervalued care work—childcare, elder care, emotional labor. A care economy approach puts human wellbeing at the center.</p><h3>Core Principles</h3><ul><li>Valuing interdependence over independence</li><li>Recognizing care as essential work</li><li>Distributing care responsibilities equitably</li><li>Supporting care workers adequately</li></ul><p>The economics of care offers a framework for building more humane systems of value and exchange.</p>$$,
  (SELECT id FROM issues WHERE month = 'August' AND year = 2024 LIMIT 1),
  5,
  1600,
  'economics',
  'https://images.unsplash.com/photo-1516321318423-f06f70504646?w=800',
  'cms',
  'PUBLISHED',
  NOW(),
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Verify articles were inserted
SELECT COUNT(*) as total_articles,
       COUNT(CASE WHEN status = 'PUBLISHED' THEN 1 END) as published_articles
FROM articles;
