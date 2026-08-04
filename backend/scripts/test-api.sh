#!/bin/bash

# infinithoughts API Test Script
# This script demonstrates all available API endpoints

API_BASE="http://localhost:3001/api"
TIMESTAMP=$(date +%s%N | cut -b1-13)

echo "=========================================="
echo "infinithoughts API Test Suite"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Health check
echo -e "${BLUE}1. Health Check${NC}"
curl -s http://localhost:3001/health | jq .
echo ""

# List articles (empty initially)
echo -e "${BLUE}2. List Articles (GET /api/articles)${NC}"
curl -s "${API_BASE}/articles" | jq .
echo ""

# Get dashboard stats
echo -e "${BLUE}3. Dashboard Stats (GET /api/admin/dashboard)${NC}"
curl -s "${API_BASE}/admin/dashboard" | jq .
echo ""

# After importing sample articles, try these endpoints:

echo -e "${YELLOW}--- After running: npm run import-samples ---${NC}"
echo ""

# List articles with pagination
echo -e "${BLUE}4. List Articles with Pagination${NC}"
echo "GET ${API_BASE}/articles?limit=2&offset=0"
curl -s "${API_BASE}/articles?limit=2&offset=0" | jq .
echo ""

# Get articles by status
echo -e "${BLUE}5. Get Articles by Status (PUBLISHED)${NC}"
echo "GET ${API_BASE}/articles/by-status/PUBLISHED"
curl -s "${API_BASE}/articles/by-status/PUBLISHED" | jq .
echo ""

# Get single article (requires a valid article ID from above)
echo -e "${BLUE}6. Get Single Article${NC}"
echo "GET ${API_BASE}/articles/{id}"
echo "Replace {id} with an actual article ID from the list above"
echo ""

# Search articles by theme
echo -e "${BLUE}7. List Articles Filtered by Theme${NC}"
echo "GET ${API_BASE}/articles?theme=destiny"
curl -s "${API_BASE}/articles?theme=destiny" | jq .
echo ""

# Create a new article
echo -e "${BLUE}8. Create New Article (POST /api/articles)${NC}"
NEW_ARTICLE=$(cat <<EOF
{
  "title": "Test Article: The Journey Begins",
  "slug": "test-article-journey-${TIMESTAMP}",
  "excerpt": "A test article to verify API functionality",
  "author_id": null,
  "issue_id": null,
  "content_html": "<h1>Test Article</h1><p>This is a test article created via API.</p>",
  "content_json": {
    "heading": [
      { "level": 1, "_": "Test Article" }
    ],
    "paragraph": [
      "This is a test article created via API."
    ]
  },
  "theme": "destiny",
  "publication_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
)
echo "Request body:"
echo "$NEW_ARTICLE" | jq .
curl -s -X POST "${API_BASE}/articles" \
  -H "Content-Type: application/json" \
  -d "$NEW_ARTICLE" | jq .
echo ""

# Update article status
echo -e "${BLUE}9. Update Article Status (PATCH /api/articles/{id}/status)${NC}"
echo "Example (requires valid article ID):"
cat <<EOF
curl -X PATCH "${API_BASE}/articles/{article_id}/status" \\
  -H "Content-Type: application/json" \\
  -d '{
    "status": "IN_MODERATION",
    "userId": "user-id",
    "reason": "Submitted for review"
  }'
EOF
echo ""

# Get import logs
echo -e "${BLUE}10. Get Import Logs (GET /api/admin/import-logs)${NC}"
curl -s "${API_BASE}/admin/import-logs" | jq .
echo ""

echo -e "${GREEN}=========================================="
echo "API Tests Complete"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Start the backend: npm run dev (from /backend directory)"
echo "2. Ensure PostgreSQL is running: docker-compose up -d postgres"
echo "3. Run sample data import: npm run import-samples"
echo "4. Execute this test script to verify endpoints"
echo ""
echo "API Documentation:"
echo "  Articles: GET ${API_BASE}/articles"
echo "  Create: POST ${API_BASE}/articles"
echo "  Single: GET ${API_BASE}/articles/{id}"
echo "  Update: PUT ${API_BASE}/articles/{id}"
echo "  Status: PATCH ${API_BASE}/articles/{id}/status"
echo "  Publish: POST ${API_BASE}/articles/{id}/publish"
echo "  Related: GET ${API_BASE}/articles/{id}/related"
echo "  Dashboard: GET ${API_BASE}/admin/dashboard"
