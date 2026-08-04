# infinithoughts Testing Guide

This guide walks you through testing the Phase 1 implementation with sample data and API verification.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ and npm
- Backend and admin-dashboard dependencies installed

```bash
# Install dependencies
npm install
npm install -w backend
npm install -w admin-dashboard
```

## Step 1: Start the Infrastructure

```bash
# Start Docker containers (PostgreSQL, Redis, etc.)
docker-compose up -d

# Verify containers are running
docker-compose ps
```

Expected output shows `postgres`, `redis`, and other services in "healthy" state.

## Step 2: Initialize the Database

```bash
# Run database migrations
npm run -w backend migrate
```

This creates the database schema including:
- `articles` table
- `users` table
- `article_status_history` table (for approval workflow)
- `tags` and `article_tags` tables
- `xml_import_logs` table

## Step 3: Start the Backend Server

```bash
# From the root directory
npm run -w backend dev
```

Expected output:
```
🚀 Backend running on http://localhost:3001
📚 API docs: http://localhost:3001/api
```

## Step 4: Import Sample Articles

In a new terminal:

```bash
# From the backend directory
npm run import-samples

# Or from root
npm run -w backend import-samples
```

This imports 5 sample XML articles covering:
1. **Destiny and Choice** - Philosophy of free will
2. **Psychology of Meaning** - Purpose and resilience
3. **Spirituality in the Modern World** - Beyond religion
4. **The Nature of Consciousness** - Brain and awareness
5. **Personal Transformation** - Integration and growth

## Step 5: Test the API

### Option A: Using the Test Script

```bash
# Make it executable if needed
chmod +x backend/scripts/test-api.sh

# Run all API tests
npm run -w backend test:api
```

### Option B: Manual curl Commands

#### 1. Health Check
```bash
curl http://localhost:3001/health | jq .
```

#### 2. List All Articles
```bash
curl http://localhost:3001/api/articles | jq .
```

#### 3. Get Dashboard Statistics
```bash
curl http://localhost:3001/api/admin/dashboard | jq .
```

#### 4. Filter Articles by Theme
```bash
# Get articles about destiny
curl "http://localhost:3001/api/articles?theme=destiny" | jq .

# Get articles about psychology
curl "http://localhost:3001/api/articles?theme=psychology" | jq .

# Get articles about spirituality
curl "http://localhost:3001/api/articles?theme=spirituality" | jq .
```

#### 5. Get Articles by Status
```bash
# Get published articles
curl http://localhost:3001/api/articles/by-status/PUBLISHED | jq .

# Get draft articles
curl http://localhost:3001/api/articles/by-status/DRAFT | jq .
```

#### 6. Get Single Article
Replace `{article_id}` with an ID from the list above:
```bash
curl http://localhost:3001/api/articles/{article_id} | jq .
```

#### 7. Create a New Article
```bash
curl -X POST http://localhost:3001/api/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My New Article",
    "slug": "my-new-article",
    "excerpt": "This is a new article",
    "content_html": "<h1>My New Article</h1><p>Content here...</p>",
    "content_json": {"heading": [{"level": 1, "_": "My New Article"}]},
    "theme": "destiny",
    "publication_date": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }' | jq .
```

#### 8. Update Article Status
Replace `{article_id}` with a real ID:
```bash
curl -X PATCH http://localhost:3001/api/articles/{article_id}/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_MODERATION",
    "userId": "admin-user-1",
    "reason": "Ready for review"
  }' | jq .
```

#### 9. Get Related Articles
```bash
# Get articles related to the first article
curl http://localhost:3001/api/articles/{article_id}/related | jq .
```

#### 10. View Import Logs
```bash
curl http://localhost:3001/api/admin/import-logs | jq .
```

## Step 6: Start the Admin Dashboard

In another terminal:

```bash
# From the root directory
npm run -w admin-dashboard dev
```

Access the dashboard at `http://localhost:3000`

### Dashboard Features:
- **Create Article**: /articles/new (uses the WYSIWYG editor)
- **Edit Article**: /articles/{id}
- **Article List**: /articles
- **Dashboard**: / (shows statistics)

## Expected Results

### Sample Articles Details

All 5 sample articles should appear with:
- Proper metadata (title, slug, excerpt, author, issue, dates)
- Full content (headings, paragraphs, pull quotes)
- Theme tags (destiny, psychology, spirituality, consciousness)
- Publication dates in November 2023
- Reading time calculated (7-10 minutes each)

### API Response Examples

**List articles:**
```json
{
  "articles": [
    {
      "id": "uuid",
      "title": "Destiny and Choice: Are We Free?",
      "slug": "destiny-and-choice",
      "status": "PUBLISHED",
      "reading_time_minutes": 8,
      "word_count": 1650,
      "theme": "destiny",
      ...
    }
  ],
  "total": 5,
  "limit": 10,
  "offset": 0
}
```

**Get dashboard stats:**
```json
{
  "total_articles": 5,
  "draft": 0,
  "published": 5,
  "in_moderation": 0,
  "ready_for_proof": 0
}
```

## Troubleshooting

### PostgreSQL Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Ensure PostgreSQL is running
```bash
docker-compose ps postgres
docker-compose up -d postgres
```

### Import Script Fails
**Solution**: Verify backend is running on port 3001
```bash
curl http://localhost:3001/health
```

### "No articles found" after import
**Solution**: Check import logs
```bash
curl http://localhost:3001/api/admin/import-logs | jq .
```

## Next Steps

1. **Wire Frontend API Integration**: Update `ArticleEditor.tsx` to call backend API on save
2. **Build Article Reader**: Create component to display published articles
3. **Implement Elasticsearch**: Add semantic search capability
4. **Set up Approval Workflow**: Test status transitions with multiple users
5. **Add Authentication**: Implement JWT-based user authentication

## Architecture Overview

```
┌─────────────────┐
│   Admin         │
│   Dashboard     │ (React + Tailwind)
│   Port 3000     │
└────────┬────────┘
         │
         │ HTTP/REST
         ▼
┌─────────────────┐
│   Backend API   │
│   Port 3001     │
└────────┬────────┘
         │
    ┌────┴────┬────────┬────────┐
    ▼         ▼        ▼        ▼
┌─────────┐┌────────┐┌──────┐┌──────────┐
│PostgreSQL││ Redis  ││ ES   ││ S3       │
│Articles ││ Cache  ││Search││ Backup   │
└─────────┘└────────┘└──────┘└──────────┘
```

## Sample Article Structure

Each sample article includes:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<article id="article-001" version="1.0" language="en">
  <metadata>
    <title>Article Title</title>
    <slug>article-slug</slug>
    <excerpt>Brief description</excerpt>
    <author anonymous="false">
      <name>Author Name</name>
      <email>author@example.com</email>
    </author>
    <issue>
      <issue_id>issue-202311</issue_id>
      <issue_number>1</issue_number>
      <month>November</month>
      <year>2023</year>
    </issue>
    <publication_date>2023-11-15T08:00:00Z</publication_date>
    <reading_time_minutes>8</reading_time_minutes>
    <word_count>1650</word_count>
    <theme>destiny</theme>
  </metadata>
  <content>
    <heading level="1">Article Title</heading>
    <paragraph>Content...</paragraph>
    <pull_quote>
      <quote>Quote text</quote>
      <attribution>Author</attribution>
    </pull_quote>
  </content>
  <tags>
    <tag>destiny</tag>
    <tag>philosophy</tag>
  </tags>
</article>
```

## Key Features to Verify

✅ XML Serialization - Articles serialize to valid XML
✅ REST API - All CRUD endpoints working
✅ Database - Data persists across server restarts
✅ WYSIWYG Editor - Content editing with live preview
✅ Status Workflow - Articles support multi-stage approval
✅ Audit Trail - Status changes logged with timestamps
✅ Theme Filtering - Articles filterable by theme
✅ Related Articles - Discovery via shared tags

---

**Questions?** Check the main README.md for architecture details or backend/README.md for API documentation.
