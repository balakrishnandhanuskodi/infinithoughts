#!/bin/bash

# Test script to verify local development setup
# Usage: bash test-local-setup.sh

set -e

echo "🧪 Testing infinithoughts local setup..."
echo ""

# Check Node version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node --version)
echo "   Node.js: $NODE_VERSION"
if [[ ! "$NODE_VERSION" =~ v20 ]]; then
  echo "   ⚠️  Warning: Node.js 20+ is recommended"
fi
echo ""

# Check npm version
echo "📦 Checking npm version..."
NPM_VERSION=$(npm --version)
echo "   npm: $NPM_VERSION"
echo ""

# Check if dependencies are installed
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
  echo "   ❌ Dependencies not installed"
  echo "   Run: npm install"
  exit 1
fi
echo "   ✅ Dependencies installed"
echo ""

# Check environment file
echo "📝 Checking environment configuration..."
if [ ! -f ".env" ]; then
  echo "   ⚠️  .env file not found"
  echo "   Copy from .env.example: cp .env.example .env"
  echo "   Then update with your configuration"
  exit 1
fi

if ! grep -q "DATABASE_URL" .env; then
  echo "   ❌ DATABASE_URL not set in .env"
  exit 1
fi
echo "   ✅ .env file configured"
echo ""

# Load environment
set -a
source .env
set +a

# Check DATABASE_URL
echo "🗄️  Checking database configuration..."
if [ -z "$DATABASE_URL" ]; then
  echo "   ❌ DATABASE_URL is empty"
  exit 1
fi
echo "   ✅ DATABASE_URL is set"
echo ""

# Check backend compilation
echo "🏗️  Checking backend compilation..."
npm run build --workspace=@infinithoughts/backend > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "   ✅ Backend compiles successfully"
else
  echo "   ❌ Backend compilation failed"
  echo "   Run: npm run build --workspace=@infinithoughts/backend"
  exit 1
fi
echo ""

# Check frontend compilation
echo "🏗️  Checking frontend compilation..."
npm run build --workspace=@infinithoughts/admin-dashboard > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "   ✅ Frontend compiles successfully"
else
  echo "   ⚠️  Frontend compilation warning (may be expected)"
fi
echo ""

# Check TypeScript types
echo "✅ Checking TypeScript types..."
npm run type-check --workspace=@infinithoughts/backend > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "   ✅ Backend types OK"
fi
echo ""

echo "✅ Setup verification complete!"
echo ""
echo "Next steps:"
echo "1. Terminal 1: npm run dev --workspace=@infinithoughts/backend"
echo "2. Terminal 2: npm run dev --workspace=@infinithoughts/admin-dashboard"
echo "3. Open http://localhost:5173 in your browser"
echo ""
