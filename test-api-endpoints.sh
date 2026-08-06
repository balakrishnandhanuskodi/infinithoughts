#!/bin/bash

# Test script for infinithoughts API endpoints
# Tests both local and production endpoints

set -e

echo "🧪 Testing infinithoughts API endpoints..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Local endpoints
LOCAL_BASE="http://localhost:3000"
PROD_BASE="https://infinithoughts-prod.up.railway.app"

# Function to test endpoint
test_endpoint() {
  local url=$1
  local name=$2

  echo -n "Testing $name... "

  response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null || echo "Connection failed\n000")
  body=$(echo "$response" | head -n -1)
  status=$(echo "$response" | tail -n 1)

  if [ "$status" = "200" ]; then
    echo -e "${GREEN}✅ 200 OK${NC}"
    echo "  Response: $(echo "$body" | head -c 100)..."
    return 0
  elif [ "$status" = "404" ]; then
    echo -e "${RED}❌ 404 Not Found${NC}"
    return 1
  elif [ "$status" = "000" ]; then
    echo -e "${RED}❌ Connection failed${NC}"
    return 1
  else
    echo -e "${YELLOW}⚠️  Status $status${NC}"
    return 1
  fi
}

# Check if local backend is running
echo "📍 Testing Local Endpoints (localhost:3000)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "$LOCAL_BASE/health" "Health check" || LOCAL_OK=false
test_endpoint "$LOCAL_BASE/status" "Status endpoint" || LOCAL_OK=false
test_endpoint "$LOCAL_BASE/api/articles" "Articles list" || LOCAL_OK=false
echo ""

# Check production endpoints
echo "📍 Testing Production Endpoints (Railway)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "$PROD_BASE/health" "Health check" || PROD_OK=false
test_endpoint "$PROD_BASE/status" "Status endpoint" || PROD_OK=false
test_endpoint "$PROD_BASE/api/articles" "Articles list" || PROD_OK=false
echo ""

# Summary
echo "📊 Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$LOCAL_OK" != "false" ]; then
  echo -e "${GREEN}✅ Local backend is working${NC}"
else
  echo -e "${YELLOW}⚠️  Local backend is not running or not responding${NC}"
  echo "   Run: npm run dev --workspace=@infinithoughts/backend"
fi

if [ "$PROD_OK" != "false" ]; then
  echo -e "${GREEN}✅ Production backend is working${NC}"
else
  echo -e "${RED}❌ Production backend is not responding${NC}"
  echo "   Check Railway deployment: https://railway.app"
fi
echo ""

echo "For more details on endpoint responses, run:"
echo "  curl -v http://localhost:3000/health"
echo "  curl -v https://infinithoughts-prod.up.railway.app/health"
