# infinithoughts API Reference

Complete API documentation for Phase 1 REST endpoints.

## Base URL

```
http://localhost:3001/api
```

## Authentication

Current phase (Phase 1) does not require authentication. Phase 2 will implement JWT-based auth.

## Articles Endpoints

### List Articles
```
GET /articles
```

**Query Parameters:**
- `limit` (number, default: 10) - Items per page
- `offset` (number, default: 0) - Pagination offset
- `status` (string) - Filter by status (DRAFT, PUBLISHED, IN_MODERATION, etc.)
- `theme` (string) - Filter by theme (destiny, psychology, spirituality)
- `issue_id` (string) - Filter by issue
- `source` (string) - Filter by source (xml, cms)

**Response:**
```json
{
  "articles": [
    {
      "id": "uuid",
      "title": "Article Title",
      "slug": "article-slug",
      "excerpt": "Brief description",
      "status": "PUBLISHED",
      "theme": "destiny",
      "reading_time_minutes": 8,
      "word_count": 1650,
      "publication_date": "2023-11-15T08:00:00Z",
      "author_id": null,
      "featured_image_url": null
    }
  ],
  "total": 5,
  "limit": 10,
  "offset": 0
}
```

**Examples:**
```bash
# Get all articles
curl http://localhost:3001/api/articles

# Get published articles about destiny
curl "http://localhost:3001/api/articles?status=PUBLISHED&theme=destiny"

# Get with pagination
curl "http://localhost:3001/api/articles?limit=5&offset=10"
```

---

### Get Single Article
```
GET /articles/{id}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Article Title",
  "slug": "article-slug",
  "excerpt": "Brief description",
  "content_html": "<h1>Article Title</h1><p>Content...</p>",
  "content_json": {
    "heading": [{"level": 1, "_": "Article Title"}],
    "paragraph": ["Content..."]
  },
  "status": "PUBLISHED",
  "theme": "destiny",
  "reading_time_minutes": 8,
  "word_count": 1650,
  "publication_date": "2023-11-15T08:00:00Z",
  "author_id": null,
  "featured_image_url": null,
  "created_at": "2023-11-01T10:30:00Z",
  "updated_at": "2023-11-15T08:00:00Z"
}
```

**Example:**
```bash
curl http://localhost:3001/api/articles/550e8400-e29b-41d4-a716-446655440000
```

---

### Create Article
```
POST /articles
```

**Request Body:**
```json
{
  "title": "Article Title",
  "slug": "article-slug",
  "excerpt": "Brief description",
  "author_id": "user-id or null",
  "issue_id": "issue-id or null",
  "content_html": "<h1>Title</h1><p>Content...</p>",
  "content_json": {
    "heading": [{"level": 1, "_": "Title"}],
    "paragraph": ["Content..."]
  },
  "theme": "destiny",
  "page_number": null,
  "publication_date": "2023-11-15T08:00:00Z"
}
```

**Response:** (201 Created)
Returns the created article object with generated ID.

**Example:**
```bash
curl -X POST http://localhost:3001/api/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Article",
    "slug": "my-article",
    "excerpt": "Description",
    "content_html": "<h1>My Article</h1>",
    "content_json": {"heading": [{"level": 1, "_": "My Article"}]},
    "theme": "destiny",
    "publication_date": "2023-11-15T08:00:00Z"
  }'
```

---

### Update Article
```
PUT /articles/{id}
```

**Request Body:** (All fields optional)
```json
{
  "title": "Updated Title",
  "slug": "updated-slug",
  "excerpt": "Updated excerpt",
  "content_html": "<h1>Updated</h1>",
  "content_json": {"heading": [{"level": 1, "_": "Updated"}]},
  "theme": "psychology",
  "publication_date": "2023-11-20T09:00:00Z"
}
```

**Response:** (200 OK)
Returns updated article object.

**Example:**
```bash
curl -X PUT http://localhost:3001/api/articles/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}'
```

---

### Update Article Status
```
PATCH /articles/{id}/status
```

**Request Body:**
```json
{
  "status": "IN_MODERATION",
  "userId": "user-id",
  "reason": "Optional reason for status change"
}
```

**Valid Status Values:**
- `DRAFT` - Initial status
- `IN_MODERATION` - Under review
- `READY_FOR_PROOF` - Approved for proofreading
- `IN_PROOF` - Being proofread
- `PROOFED` - Proof complete
- `IN_APPROVAL` - Awaiting final approval
- `PUBLISHED` - Published and live
- `REJECTED` - Rejected at any stage

**Response:** (200 OK)
```json
{
  "id": "uuid",
  "status": "IN_MODERATION",
  "updated_at": "2023-11-15T08:30:00Z"
}
```

**Example:**
```bash
curl -X PATCH http://localhost:3001/api/articles/550e8400-e29b-41d4-a716-446655440000/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_MODERATION",
    "userId": "admin-user-1",
    "reason": "Submitted for review"
  }'
```

---

### Publish Article
```
POST /articles/{id}/publish
```

**Request Body:**
```json
{
  "userId": "approver-user-id"
}
```

**Response:** (200 OK)
Returns article with status = PUBLISHED and published_at timestamp set.

**Example:**
```bash
curl -X POST http://localhost:3001/api/articles/550e8400-e29b-41d4-a716-446655440000/publish \
  -H "Content-Type: application/json" \
  -d '{"userId": "approver-123"}'
```

---

### Get Related Articles
```
GET /articles/{id}/related
```

**Query Parameters:**
- `limit` (number, default: 5) - Number of related articles to return

**Response:**
```json
{
  "articles": [
    {
      "id": "uuid",
      "title": "Related Article",
      "slug": "related-article",
      "theme": "destiny",
      "excerpt": "..."
    }
  ],
  "count": 3
}
```

**Logic:** Returns published articles with matching tags/themes, excluding the source article.

**Example:**
```bash
curl "http://localhost:3001/api/articles/550e8400-e29b-41d4-a716-446655440000/related?limit=5"
```

---

### Get Articles by Status
```
GET /articles/by-status/{status}
```

**Response:**
```json
{
  "status": "PUBLISHED",
  "articles": [
    {
      "id": "uuid",
      "title": "Article Title",
      "slug": "article-slug",
      ...
    }
  ],
  "count": 5
}
```

**Example:**
```bash
# Get all published articles
curl http://localhost:3001/api/articles/by-status/PUBLISHED

# Get all drafts
curl http://localhost:3001/api/articles/by-status/DRAFT

# Get all in moderation
curl http://localhost:3001/api/articles/by-status/IN_MODERATION
```

---

## Admin Endpoints

### Import XML Articles
```
POST /admin/import-xml
```

**Request Body:**
```json
{
  "xml_files": [
    "/path/to/article-001.xml",
    "/path/to/article-002.xml"
  ]
}
```

**Response:** (200 OK)
```json
{
  "batch_id": "batch-uuid",
  "imported": 2,
  "failed": 0,
  "errors": []
}
```

**Example:**
```bash
curl -X POST http://localhost:3001/api/admin/import-xml \
  -H "Content-Type: application/json" \
  -d '{
    "xml_files": [
      "/home/user/infinithoughts/backend/sample-articles/001-destiny-and-choice.xml",
      "/home/user/infinithoughts/backend/sample-articles/002-psychology-of-meaning.xml"
    ]
  }'
```

---

### Get Import Logs
```
GET /admin/import-logs
```

**Query Parameters:**
- `limit` (number, default: 10)
- `offset` (number, default: 0)

**Response:**
```json
{
  "logs": [
    {
      "batch_id": "uuid",
      "total_files": 5,
      "successful": 5,
      "failed": 0,
      "completed_at": "2023-11-15T10:00:00Z"
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

**Example:**
```bash
curl http://localhost:3001/api/admin/import-logs
```

---

### Get Import Batch Details
```
GET /admin/import-logs/{batch_id}
```

**Response:**
```json
{
  "batch_id": "uuid",
  "total_files": 5,
  "successful": 5,
  "failed": 0,
  "errors": [],
  "imported_articles": [
    {
      "id": "uuid",
      "title": "Article Title",
      "slug": "article-slug"
    }
  ],
  "completed_at": "2023-11-15T10:00:00Z"
}
```

---

### Get Dashboard Statistics
```
GET /admin/dashboard
```

**Response:**
```json
{
  "total_articles": 5,
  "draft": 1,
  "published": 3,
  "in_moderation": 1,
  "ready_for_proof": 0,
  "in_proof": 0,
  "proofed": 0,
  "in_approval": 0,
  "rejected": 0
}
```

**Example:**
```bash
curl http://localhost:3001/api/admin/dashboard
```

---

### Get Article Source Information (Admin)
```
GET /admin/articles/{id}/source
```

**Response:** (for XML-sourced articles)
```json
{
  "source": "xml",
  "xml_file_path": "/path/to/article.xml",
  "xml_content": "<?xml version=\"1.0\"...>",
  "parsed_json": {
    "metadata": {...},
    "content": [...]
  }
}
```

**Example:**
```bash
curl http://localhost:3001/api/admin/articles/550e8400-e29b-41d4-a716-446655440000/source
```

---

## Health & Status Endpoints

### Health Check
```
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2023-11-15T08:00:00.000Z"
}
```

**Example:**
```bash
curl http://localhost:3001/health
```

---

### API Info
```
GET /api
```

**Response:**
```json
{
  "message": "infinithoughts API v1",
  "endpoints": {
    "articles": "/api/articles",
    "admin": "/api/admin"
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Description of error",
  "details": "Additional context if available"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

---

## Common Use Cases

### Workflow: Create → Review → Publish

```bash
# 1. Create article
ARTICLE_ID=$(curl -X POST http://localhost:3001/api/articles \
  -H "Content-Type: application/json" \
  -d '{...}' | jq -r '.id')

# 2. Submit for moderation
curl -X PATCH http://localhost:3001/api/articles/$ARTICLE_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status": "IN_MODERATION", "userId": "editor-1"}'

# 3. Mark ready for proof
curl -X PATCH http://localhost:3001/api/articles/$ARTICLE_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status": "READY_FOR_PROOF", "userId": "moderator-1"}'

# 4. Mark as proofed
curl -X PATCH http://localhost:3001/api/articles/$ARTICLE_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status": "PROOFED", "userId": "proofer-1"}'

# 5. Publish
curl -X POST http://localhost:3001/api/articles/$ARTICLE_ID/publish \
  -H "Content-Type: application/json" \
  -d '{"userId": "approver-1"}'
```

---

## Rate Limiting

Not yet implemented. Phase 2 will add rate limiting based on user roles.

## Caching

Phase 2 will implement Redis-based caching for:
- Frequently accessed articles
- Related articles
- Dashboard statistics

## Webhooks (Planned)

Phase 2 will trigger webhooks on:
- Article published (for Elasticsearch indexing)
- Status changes (for notifications)
- Import completed (for sync with Git/S3)
