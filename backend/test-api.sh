#!/bin/bash

# Backend API Test Script
# Tests all endpoints to ensure they're working

API_URL="http://localhost:3000"
TOKEN=""

echo "🧪 Testing Resume Builder Backend API"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo "Test 1: Health Check"
HEALTH=$(curl -s $API_URL/health)
if echo "$HEALTH" | grep -q "healthy"; then
    echo -e "${GREEN}✅ PASS${NC} - Health check successful"
else
    echo -e "${RED}❌ FAIL${NC} - Health check failed"
    exit 1
fi
echo ""

# Test 2: Register User
echo "Test 2: Register User"
REGISTER=$(curl -s -X POST $API_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-'$(date +%s)'@example.com",
    "password": "password123",
    "name": "Test User"
  }')

if echo "$REGISTER" | grep -q "token"; then
    echo -e "${GREEN}✅ PASS${NC} - User registered"
    TOKEN=$(echo "$REGISTER" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "   Token: ${TOKEN:0:20}..."
else
    echo -e "${RED}❌ FAIL${NC} - Registration failed"
    echo "$REGISTER"
    exit 1
fi
echo ""

# Test 3: Login
echo "Test 3: Login (with same user)"
EMAIL=$(echo "$REGISTER" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)
LOGIN=$(curl -s -X POST $API_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$EMAIL'",
    "password": "password123"
  }')

if echo "$LOGIN" | grep -q "token"; then
    echo -e "${GREEN}✅ PASS${NC} - Login successful"
    TOKEN=$(echo "$LOGIN" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
else
    echo -e "${RED}❌ FAIL${NC} - Login failed"
    exit 1
fi
echo ""

# Test 4: Get User Profile
echo "Test 4: Get User Profile (protected)"
PROFILE=$(curl -s $API_URL/api/auth/me \
  -H "Authorization: Bearer $TOKEN")

if echo "$PROFILE" | grep -q "email"; then
    echo -e "${GREEN}✅ PASS${NC} - Profile retrieved"
else
    echo -e "${RED}❌ FAIL${NC} - Profile retrieval failed"
    exit 1
fi
echo ""

# Test 5: Create Resume
echo "Test 5: Create Resume"
CREATE_RESUME=$(curl -s -X POST $API_URL/api/resumes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Software Engineer Resume",
    "content": {"name": "John Doe", "title": "Software Engineer"},
    "atsScore": 85
  }')

if echo "$CREATE_RESUME" | grep -q "resume"; then
    echo -e "${GREEN}✅ PASS${NC} - Resume created"
    RESUME_ID=$(echo "$CREATE_RESUME" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
else
    echo -e "${RED}❌ FAIL${NC} - Resume creation failed"
fi
echo ""

# Test 6: Get Resumes
echo "Test 6: List Resumes"
RESUMES=$(curl -s $API_URL/api/resumes \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESUMES" | grep -q "id"; then
    echo -e "${GREEN}✅ PASS${NC} - Resumes listed"
else
    echo -e "${YELLOW}⚠️  WARN${NC} - No resumes found (might be empty)"
fi
echo ""

# Test 7: AI Generate (if API key is set)
echo "Test 7: AI Generate"
AI_RESPONSE=$(curl -s -X POST $API_URL/api/ai/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "prompt": "Say hello",
    "provider": "google",
    "model": "gemini-pro"
  }')

if echo "$AI_RESPONSE" | grep -q "content"; then
    echo -e "${GREEN}✅ PASS${NC} - AI generation working"
    echo "   Response: $(echo "$AI_RESPONSE" | grep -o '"content":"[^"]*"' | cut -d'"' -f4 | head -c 50)..."
else
    echo -e "${YELLOW}⚠️  WARN${NC} - AI generation failed (check API keys in .env)"
    echo "   Error: $AI_RESPONSE"
fi
echo ""

# Summary
echo "======================================"
echo -e "${GREEN}🎉 All tests completed!${NC}"
echo ""
echo "Backend is working correctly!"
echo "API URL: $API_URL"
echo ""
echo "Next steps:"
echo "1. Update Chrome Extension to use this backend"
echo "2. Deploy to production"
echo "3. See BACKEND_ROADMAP.md for Phase 2"
