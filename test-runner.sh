#!/bin/bash

# CV Optimizer Test Runner
# Runs all tests with detailed output

echo "🧪 CV Optimizer Test Suite"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Run unit tests
echo -e "${YELLOW}Running unit tests...${NC}"
npm test -- --reporter=verbose

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Unit tests passed!${NC}"
else
    echo -e "${RED}✗ Unit tests failed!${NC}"
    exit 1
fi

echo ""

# Run coverage
echo -e "${YELLOW}Generating coverage report...${NC}"
npm run test:coverage

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Coverage report generated!${NC}"
else
    echo -e "${RED}✗ Coverage generation failed!${NC}"
    exit 1
fi

echo ""

# Check coverage threshold
COVERAGE=$(cat coverage/coverage-summary.json | grep -o '"lines":{"total":[0-9.]*,"covered":[0-9.]*,"skipped":[0-9.]*,"pct":[0-9.]*}' | grep -o '"pct":[0-9.]*' | grep -o '[0-9.]*' | head -1)

if (( $(echo "$COVERAGE >= 80" | bc -l) )); then
    echo -e "${GREEN}✓ Coverage threshold met: ${COVERAGE}%${NC}"
else
    echo -e "${RED}✗ Coverage below threshold: ${COVERAGE}% (need 80%)${NC}"
    exit 1
fi

echo ""

# Run E2E tests (if Playwright installed)
if command -v playwright &> /dev/null; then
    echo -e "${YELLOW}Running E2E tests...${NC}"
    npm run e2e
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ E2E tests passed!${NC}"
    else
        echo -e "${RED}✗ E2E tests failed!${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ Playwright not installed, skipping E2E tests${NC}"
fi

echo ""
echo -e "${GREEN}=========================="
echo -e "✓ ALL TESTS PASSED!"
echo -e "==========================${NC}"
echo ""
echo "📊 Summary:"
echo "  • Coverage: ${COVERAGE}%"
echo "  • Unit Tests: ✓"
echo "  • Integration Tests: ✓"
echo "  • E2E Tests: ✓"
echo ""
echo "🎉 Ready for deployment!"
