#!/bin/bash

# Production build validation script

set -e

echo "🚀 YouTube Integration Production Validation"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓${NC} Node.js $NODE_VERSION"
echo ""

# Clean build artifacts
echo "🧹 Cleaning previous builds..."
rm -rf dist node_modules/.vite
echo -e "${GREEN}✓${NC} Build cache cleaned"
echo ""

# Install dependencies
echo "📥 Installing dependencies..."
npm ci --prefer-offline 2>&1 | tail -3
echo -e "${GREEN}✓${NC} Dependencies installed"
echo ""

# Run production build
echo "🔨 Building production bundle..."
npm run build
echo ""

# Check build output
echo "📊 Analyzing build output..."
DIST_SIZE=$(du -sh dist | cut -f1)
JS_SIZE=$(find dist -name "*.js" -exec du -ch {} + 2>/dev/null | tail -1 | cut -f1)
CSS_SIZE=$(find dist -name "*.css" -exec du -ch {} + 2>/dev/null | tail -1 | cut -f1)

echo "Build sizes:"
echo "  Total: ${DIST_SIZE}"
echo "  JavaScript: ${JS_SIZE}"
echo "  CSS: ${CSS_SIZE}"

# Check for common issues
echo ""
echo "🔍 Checking for common issues..."

# Check for TODO comments
TODOS=$(grep -r "TODO\|FIXME\|HACK" src --include="*.jsx" --include="*.js" 2>/dev/null | wc -l)
if [ "$TODOS" -gt 0 ]; then
  echo -e "${YELLOW}⚠${NC} Found $TODOS TODO/FIXME comments"
else
  echo -e "${GREEN}✓${NC} No TODO/FIXME comments"
fi

# Check for console logs (excluding debug utils)
CONSOLE_LOGS=$(grep -r "console\." src --include="*.jsx" --include="*.js" 2>/dev/null | grep -v "console.error" | grep -v "// console" | wc -l)
if [ "$CONSOLE_LOGS" -gt 3 ]; then
  echo -e "${YELLOW}⚠${NC} Found $CONSOLE_LOGS console.log statements (should clean up for prod)"
else
  echo -e "${GREEN}✓${NC} Minimal console usage"
fi

# Check for debugger statements
DEBUGGERS=$(grep -r "debugger" src --include="*.jsx" --include="*.js" 2>/dev/null | wc -l)
if [ "$DEBUGGERS" -gt 0 ]; then
  echo -e "${RED}✗${NC} Found $DEBUGGERS debugger statements - remove before deploy!"
  exit 1
else
  echo -e "${GREEN}✓${NC} No debugger statements"
fi

echo ""

# Verify critical files exist
echo "✅ Verifying critical files..."
CRITICAL_FILES=(
  "dist/index.html"
  "dist/assets/index-*.js"
  "dist/assets/index-*.css"
)

for pattern in "${CRITICAL_FILES[@]}"; do
  if ls $pattern 1>/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} $(basename $pattern) exists"
  else
    echo -e "${RED}✗${NC} $(basename $pattern) missing!"
    exit 1
  fi
done

echo ""
echo "🎯 Checking API compatibility..."

# Check if server is running
if curl -s http://localhost:5173 > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Server is running"
  
  # Check API endpoints
  for endpoint in "script" "optimize-seo" "moderate-comments"; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:5173/api/youtube/$endpoint \
      -H "Content-Type: application/json" \
      -d '{}' 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "200" ]; then
      echo -e "${GREEN}✓${NC} API endpoint /$endpoint responds ($HTTP_CODE)"
    else
      echo -e "${YELLOW}⚠${NC} API endpoint /$endpoint returned $HTTP_CODE"
    fi
  done
else
  echo -e "${YELLOW}⚠${NC} Server not running - skipping API checks"
  echo "   Start with: npm run dev"
fi

echo ""
echo "📝 Checking for sensitive data..."

# Check for API keys in code
API_KEYS=$(grep -r "api_key\|apiKey\|secret\|password" src --include="*.jsx" --include="*.js" | grep -v "// " | wc -l)
if [ "$API_KEYS" -gt 2 ]; then
  echo -e "${YELLOW}⚠${NC} Potential API keys/secrets in code"
else
  echo -e "${GREEN}✓${NC} No obvious secrets exposed"
fi

echo ""
echo "=============================================="
echo -e "${GREEN}✅ Production validation complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Review the build output above"
echo "2. Test the application: npm run dev"
echo "3. Run E2E tests: npm run test:e2e (if available)"
echo "4. Deploy: npm run build && ./deploy.sh"
echo ""
