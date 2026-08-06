# Seeding Sample Articles

This guide explains how to add sample articles to your database for testing.

## Option 1: Using Supabase SQL Editor (Recommended for Production)

1. **Log in to Supabase**
   - Go to https://app.supabase.com
   - Select your project (infinithoughts)

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Run the Seed Script**
   - Copy the entire contents of `backend/src/db/seed-articles.sql`
   - Paste it into the SQL Editor
   - Click "Run" button

4. **Verify Success**
   - You should see output showing:
     ```
     total_articles | published_articles
     4              | 4
     ```
   - This confirms 4 sample articles have been created and published

## Option 2: Using Node.js Script (For Local Development)

**Prerequisites:**
- Backend dependencies installed: `npm install`
- Backend built: `npm run build --workspace=@infinithoughts/backend`
- DATABASE_URL environment variable set

**Steps:**

1. **Set the DATABASE_URL (if running locally)**
   ```bash
   # Create a .env file in the backend directory with:
   DATABASE_URL=your_supabase_connection_string
   ```

2. **Run the seeding script**
   ```bash
   npm run seed --workspace=@infinithoughts/backend
   ```

   Or manually:
   ```bash
   node backend/dist/scripts/seed-articles.js
   ```

3. **Verify Success**
   - You should see output like:
     ```
     🌱 Starting article seeding...
     ✅ Created/verified issue: [issue-id]
     ✅ Created article: The Future of Digital Activism ([id])
     ✅ Created article: Reimagining Public Space ([id])
     ✅ Created article: Building Bridges Across Difference ([id])
     ✅ Created article: The Economics of Care ([id])
     🎉 Article seeding complete!
     ```

## Verifying Articles in the Frontend

After seeding:

1. **If using Netlify (Production)**
   - Wait 5-10 minutes for Netlify to redeploy
   - Visit https://infinithoughts.netlify.app/articles
   - You should see the 4 sample articles displayed

2. **If using local frontend**
   - Start the frontend: `npm run dev --workspace=@infinithoughts/admin-dashboard`
   - Visit http://localhost:5173/articles
   - You should see the 4 sample articles displayed

3. **If using the API directly**
   - For production: `curl https://infinithoughtsbackend-production.up.railway.app/api/articles`
   - For local: `curl http://localhost:3000/api/articles`
   - You should see a JSON response with the articles

## Sample Articles Included

1. **The Future of Digital Activism**
   - Theme: activism
   - Word count: 1500 words (~5 min read)
   - Covers digital organizing and social movements

2. **Reimagining Public Space**
   - Theme: urban
   - Word count: 1800 words (~6 min read)
   - Discusses community-led urban design

3. **Building Bridges Across Difference**
   - Theme: community
   - Word count: 1200 words (~4 min read)
   - Explores dialogue in polarized times

4. **The Economics of Care**
   - Theme: economics
   - Word count: 1600 words (~5 min read)
   - Rethinks economic systems around care work

All articles are:
- Status: PUBLISHED (visible in public view)
- Source: cms (content management system)
- Include featured images from Unsplash
- Include reading time estimates

## Troubleshooting

### Articles not showing in frontend
- Ensure Netlify has redeployed (check recent deployments in Netlify dashboard)
- Check browser console for errors
- Verify the backend API URL is correct in `netlify.toml`

### SQL error when running script
- Ensure the `articles` table exists (should be created by migrations)
- Check that your Supabase database is properly configured
- Verify all required columns exist

### Node script fails to run
- Ensure backend is built: `npm run build --workspace=@infinithoughts/backend`
- Verify DATABASE_URL is set and valid
- Check that the database is accessible from your environment

## Deleting Articles

If you need to start fresh:

```sql
-- Delete all articles (from Supabase SQL Editor)
DELETE FROM articles WHERE source = 'cms';

-- Verify
SELECT COUNT(*) as article_count FROM articles;
```

## Next Steps

After verifying articles load:
1. Test the full end-to-end flow (articles display, can click on them)
2. Begin Phase 2 implementation (Article Editor, XML support, etc.)
3. Add your own articles through the admin dashboard (Phase 2)
