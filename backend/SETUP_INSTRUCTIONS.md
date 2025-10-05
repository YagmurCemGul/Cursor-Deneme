# 🚀 Backend Setup Instructions

## Step-by-Step Guide

### 1. Install Dependencies (2 minutes)

```bash
cd backend
npm install
```

This will install all required packages.

### 2. Setup Database (5 minutes)

#### Option A: Supabase (Recommended - Free!)

1. Go to https://supabase.com
2. Create new project
3. Wait for database to initialize
4. Go to Settings → Database
5. Copy "Connection string" (URI format)
6. Create `.env` file:

```bash
cp .env.example .env
```

7. Edit `.env` and paste your DATABASE_URL:

```
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
```

#### Option B: Local PostgreSQL

```bash
# Install PostgreSQL (Mac)
brew install postgresql
brew services start postgresql

# Create database
createdb resume_app

# Update .env
DATABASE_URL="postgresql://username:password@localhost:5432/resume_app"
```

### 3. Run Database Migrations (1 minute)

```bash
npx prisma generate
npx prisma migrate dev --name init
```

You should see: "Your database is now in sync with your schema."

### 4. Configure API Keys (2 minutes)

Edit `.env` and add your AI API keys:

```bash
# Get keys from:
# OpenAI: https://platform.openai.com/api-keys
# Anthropic: https://console.anthropic.com/
# Google: https://makersuite.google.com/app/apikey

OPENAI_API_KEY="sk-your-key"
ANTHROPIC_API_KEY="sk-ant-your-key"
GOOGLE_API_KEY="AIza-your-key"
```

At minimum, add one API key (Gemini is free!).

### 5. Start Server (10 seconds)

```bash
npm run dev
```

You should see:
```
🚀 ===================================
🚀 Server running on port 3000
🚀 Environment: development
🚀 Health check: http://localhost:3000/health
🚀 ===================================
```

### 6. Test the Backend (2 minutes)

Open a new terminal and run:

```bash
# Test health check
curl http://localhost:3000/health

# Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the token from the login response!

### 7. Test AI Proxy (1 minute)

```bash
# Replace YOUR_TOKEN with the token from step 6
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "prompt": "Write a one-sentence professional summary for a software engineer",
    "provider": "google",
    "model": "gemini-pro"
  }'
```

You should get an AI-generated response!

## ✅ Success!

If all steps work, your backend is ready! 🎉

## Next Steps

1. **Update Chrome Extension** - Connect extension to backend
2. **Deploy** - Deploy to Heroku/Railway/AWS
3. **Phase 2** - Add more features (see BACKEND_ROADMAP.md)

## Troubleshooting

### Server won't start
```bash
# Check if port 3000 is in use
lsof -i :3000
# Kill the process or change PORT in .env
```

### Database errors
```bash
# Regenerate Prisma Client
npx prisma generate

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

### API key errors
```bash
# Check .env file
cat .env | grep API_KEY

# Make sure keys are valid and not expired
```

## Help

If you're stuck, check:
- README.md
- BACKEND_QUICKSTART.md
- BACKEND_ROADMAP.md
