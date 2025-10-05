# 🏗️ Resume Builder Backend

Production-ready Node.js + Express + TypeScript backend for Resume Builder Chrome Extension.

## ✨ Features

- ✅ **Authentication** - JWT-based auth with bcrypt password hashing
- ✅ **AI Proxy** - Secure server-side API calls to OpenAI, Claude, Gemini
- ✅ **Multi-user Support** - PostgreSQL database with Prisma ORM
- ✅ **Rate Limiting** - Built-in rate limiting
- ✅ **Security** - Helmet.js, CORS, input validation
- ✅ **API Usage Tracking** - Track costs and token usage per user

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or Supabase account)
- npm or yarn

### Installation

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Setup environment variables
cp .env.example .env
# Edit .env and add your configuration

# 3. Setup database
npx prisma generate
npx prisma migrate dev

# 4. Start development server
npm run dev
```

Server will start on `http://localhost:3000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── routes/           # API routes
│   │   ├── auth.routes.ts      # Authentication (register, login)
│   │   ├── user.routes.ts      # User management
│   │   ├── resume.routes.ts    # Resume CRUD
│   │   ├── job.routes.ts       # Job tracking
│   │   └── ai.routes.ts        # AI proxy (secure!)
│   ├── middleware/       # Express middleware
│   │   └── auth.middleware.ts  # JWT verification
│   ├── utils/            # Helper functions
│   │   └── jwt.ts              # JWT utilities
│   └── index.ts          # Entry point
├── prisma/
│   └── schema.prisma     # Database schema
├── .env.example          # Environment variables template
├── package.json
└── tsconfig.json
```

## 🔐 Environment Variables

Create a `.env` file:

```bash
# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=chrome-extension://your-extension-id

# Database (choose one)
# Option 1: Local PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/resume_app"

# Option 2: Supabase (recommended)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# JWT
JWT_SECRET="your-super-secret-key-change-this"
JWT_EXPIRES_IN="7d"

# AI APIs (server-side only!)
OPENAI_API_KEY="sk-your-key"
ANTHROPIC_API_KEY="sk-ant-your-key"
GOOGLE_API_KEY="AIza-your-key"
```

## 📡 API Endpoints

### Authentication

```
POST   /api/auth/register  - Register new user
POST   /api/auth/login     - Login user
GET    /api/auth/me        - Get current user (protected)
```

### Users

```
GET    /api/users/profile  - Get user profile (protected)
PUT    /api/users/profile  - Update profile (protected)
GET    /api/users/usage    - Get API usage stats (protected)
```

### Resumes

```
GET    /api/resumes        - List all resumes (protected)
GET    /api/resumes/:id    - Get single resume (protected)
POST   /api/resumes        - Create resume (protected)
PUT    /api/resumes/:id    - Update resume (protected)
DELETE /api/resumes/:id    - Delete resume (protected)
```

### Jobs

```
GET    /api/jobs           - List all jobs (protected)
POST   /api/jobs           - Create job (protected)
```

### AI Proxy

```
POST   /api/ai/generate    - Generate AI response (protected)
```

**Request body:**
```json
{
  "prompt": "Write a professional summary...",
  "provider": "openai",
  "model": "gpt-3.5-turbo",
  "systemPrompt": "You are a resume writer",
  "temperature": 0.7
}
```

**Response:**
```json
{
  "content": "Generated text...",
  "provider": "openai",
  "model": "gpt-3.5-turbo",
  "usage": {
    "inputTokens": 100,
    "outputTokens": 200,
    "totalCost": 0.00045
  },
  "latency": 1234
}
```

## 🧪 Testing

### Using curl

```bash
# Register
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
# Save the token from response

# Get profile
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# AI Generate
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "prompt": "Write a professional summary for a software engineer",
    "provider": "openai",
    "model": "gpt-3.5-turbo"
  }'
```

## 🔌 Chrome Extension Integration

Update your extension to use the backend:

```typescript
// extension/src/lib/api.ts
const API_URL = 'http://localhost:3000';

async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  // Store token
  await chrome.storage.local.set({ auth_token: data.token });
  
  return data;
}

async function generateAI(prompt: string) {
  const { auth_token } = await chrome.storage.local.get('auth_token');
  
  const response = await fetch(`${API_URL}/api/ai/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth_token}`
    },
    body: JSON.stringify({ prompt })
  });
  
  return response.json();
}
```

## 🗄️ Database

### Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name init

# Open Prisma Studio (GUI)
npx prisma studio

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

### Database Schema

- **User** - User accounts
- **Resume** - Resume documents
- **Job** - Job postings
- **Application** - Job applications
- **ApiUsage** - AI API usage tracking

## 🚀 Deployment

### Option 1: Heroku

```bash
# Install Heroku CLI
heroku login
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET="your-secret"
heroku config:set OPENAI_API_KEY="your-key"

# Deploy
git push heroku main

# Run migrations
heroku run npx prisma migrate deploy
```

### Option 2: Railway

1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Add PostgreSQL database
4. Set environment variables
5. Deploy!

### Option 3: AWS / VPS

```bash
# Build
npm run build

# Start production server
NODE_ENV=production npm start
```

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "healthy",
  "uptime": 12345,
  "timestamp": "2025-10-05T...",
  "environment": "development"
}
```

## 🔒 Security

- ✅ API keys stored server-side only
- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Rate limiting (100 req/15min per IP)
- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ Input validation

## 📝 Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio GUI
```

## 🐛 Troubleshooting

### "Cannot find module 'express'"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Prisma Client not generated"
```bash
npx prisma generate
```

### "Database connection failed"
```bash
# Check DATABASE_URL in .env
# Ensure PostgreSQL is running
```

### CORS errors
```bash
# Update FRONTEND_URL in .env to match your extension ID
FRONTEND_URL=chrome-extension://your-actual-extension-id
```

## 📚 Next Steps

1. ✅ Set up database (Supabase recommended)
2. ✅ Configure environment variables
3. ✅ Test all endpoints with curl
4. ✅ Integrate with Chrome Extension
5. ⏳ Deploy to production
6. ⏳ Add more features (Phase 2)

## 📖 Documentation

- **BACKEND_ROADMAP.md** - Full 6-week roadmap
- **BACKEND_QUICKSTART.md** - 30-minute quick start
- **BACKEND_SUMMARY.md** - Overview and checklist

## 🤝 Contributing

This is Phase 1 of the backend. See **BACKEND_ROADMAP.md** for Phase 2-4 features:
- Analytics dashboard
- Background jobs
- WebSocket support
- Search & filtering
- And more!

## 📄 License

ISC

---

**Status**: ✅ Phase 1 Complete - Ready for development!

**Version**: 1.0.0
**Date**: 2025-10-05
