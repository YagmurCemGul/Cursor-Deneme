# 🚀 Backend Quickstart Guide

## ⚡ 30 Dakikada Backend Başlat!

Bu guide, backend'i en hızlı şekilde başlatmak için step-by-step talimatlar içerir.

---

## 📋 Ön Gereksinimler

```bash
# 1. Node.js (v18+)
node --version  # v18.0.0+

# 2. npm veya yarn
npm --version   # 9.0.0+

# 3. PostgreSQL (opsiyonel - Supabase kullanabilirsin)
psql --version  # 14.0+

# 4. Redis (opsiyonel - başta gerekmiyor)
redis-cli --version
```

---

## 🏗️ Adım 1: Proje Oluştur (5 dakika)

```bash
# 1. Backend klasörü oluştur
mkdir backend
cd backend

# 2. Package.json oluştur
npm init -y

# 3. Dependencies install
npm install express cors dotenv helmet express-rate-limit
npm install @prisma/client bcryptjs jsonwebtoken
npm install zod express-validator

# 4. Dev dependencies
npm install -D typescript @types/node @types/express
npm install -D @types/cors @types/bcryptjs @types/jsonwebtoken
npm install -D nodemon ts-node prisma

# 5. TypeScript config
npx tsc --init
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  }
}
```

---

## 📁 Adım 2: Folder Structure (2 dakika)

```bash
mkdir -p src/{routes,controllers,services,models,middleware,utils,config}
touch src/index.ts
touch .env .env.example .gitignore
```

### Folder Structure
```
backend/
├── src/
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── resume.routes.ts
│   │   └── ai.routes.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── resume.controller.ts
│   │   └── ai.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── resume.service.ts
│   │   └── ai.service.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── jwt.ts
│   │   └── helpers.ts
│   ├── config/
│   │   ├── database.ts
│   │   └── env.ts
│   └── index.ts
├── prisma/
│   └── schema.prisma
├── .env
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## 🗄️ Adım 3: Database Setup (5 dakika)

### Option A: Local PostgreSQL

```bash
# 1. PostgreSQL install (Mac)
brew install postgresql
brew services start postgresql

# 2. Database oluştur
createdb resume_app

# 3. .env dosyası
DATABASE_URL="postgresql://username:password@localhost:5432/resume_app"
```

### Option B: Supabase (Önerilen - Ücretsiz!)

```bash
# 1. Supabase'e git: https://supabase.com
# 2. New project oluştur
# 3. Database URL'i kopyala
# 4. .env'e ekle

DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"
```

### Prisma Setup

```bash
# 1. Prisma initialize
npx prisma init

# 2. Schema define et (prisma/schema.prisma)
```

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  resumes   Resume[]
  jobs      Job[]
}

model Resume {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  title     String
  content   Json
  atsScore  Int?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Job {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  title       String
  company     String
  description String
  status      String   @default("applied")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

```bash
# 3. Generate Prisma Client
npx prisma generate

# 4. Create migration
npx prisma migrate dev --name init

# 5. (Opsiyonel) Prisma Studio aç
npx prisma studio
```

---

## 🔐 Adım 4: Basic Server (5 dakika)

### src/index.ts

```typescript
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'chrome-extension://*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Basic routes
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Resume Builder API',
    version: '1.0.0',
    status: 'running'
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 Health check: http://localhost:${PORT}/health`);
});
```

### .env

```bash
# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=chrome-extension://your-extension-id

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/resume_app"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="7d"

# AI APIs (backend'de tutulacak)
OPENAI_API_KEY="sk-your-openai-key"
ANTHROPIC_API_KEY="sk-ant-your-claude-key"
GOOGLE_API_KEY="AIza-your-gemini-key"
```

### .gitignore

```
node_modules/
dist/
.env
.DS_Store
*.log
```

---

## 🔑 Adım 5: Authentication (5 dakika)

### src/utils/jwt.ts

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}
```

### src/middleware/auth.middleware.ts

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Verify token
    const payload = verifyToken(token);

    // Attach user info to request
    req.userId = payload.userId;
    req.userEmail = payload.email;

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    });
  }
}
```

### src/routes/auth.routes.ts

```typescript
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../utils/jwt';

const router = Router();
const prisma = new PrismaClient();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email, password, and name are required'
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User Exists',
        message: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      error: 'Internal Server Error'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid Credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid Credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal Server Error'
    });
  }
});

export default router;
```

### Update src/index.ts

```typescript
// ... previous imports
import authRoutes from './routes/auth.routes';

// ... middleware

// Routes
app.use('/api/auth', authRoutes);

// ... rest of code
```

---

## 🤖 Adım 6: AI Proxy (5 dakika)

### src/routes/ai.routes.ts

```typescript
import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Protect all AI routes
router.use(authMiddleware);

// AI Generate
router.post('/generate', async (req: AuthRequest, res) => {
  try {
    const { prompt, model = 'gpt-3.5-turbo' } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Prompt is required'
      });
    }

    // Call OpenAI (API key is server-side!)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    // Track usage (TODO: implement)
    // await trackUsage(req.userId, model, data.usage);

    res.json({
      content,
      model,
      usage: data.usage
    });
  } catch (error: any) {
    console.error('AI generate error:', error);
    res.status(500).json({
      error: 'AI Generation Failed',
      message: error.message
    });
  }
});

export default router;
```

### Update src/index.ts

```typescript
import aiRoutes from './routes/ai.routes';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
```

---

## ✅ Adım 7: Test (3 dakika)

### Start Server

```bash
npm run dev
```

### Test with curl

```bash
# 1. Health check
curl http://localhost:3000/health

# 2. Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# 3. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# 4. AI Generate (use token from login)
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "prompt": "Write a professional summary for a software engineer"
  }'
```

---

## 🔗 Chrome Extension Integration

### Extension'da Backend'e Bağlan

```typescript
// extension/src/lib/api.ts
const API_URL = process.env.API_URL || 'http://localhost:3000';

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const data = await response.json();
  
  // Store token
  await chrome.storage.local.set({ 
    auth_token: data.token,
    user: data.user
  });

  return data;
}

export async function generateAI(prompt: string) {
  // Get token from storage
  const { auth_token } = await chrome.storage.local.get('auth_token');

  if (!auth_token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/api/ai/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth_token}`
    },
    body: JSON.stringify({ prompt })
  });

  if (!response.ok) {
    throw new Error('AI generation failed');
  }

  return response.json();
}
```

---

## 🚀 Next Steps

### Hemen Yapılabilir (Bu Hafta)
1. ✅ User profile endpoints
2. ✅ Resume CRUD endpoints
3. ✅ Job tracking endpoints
4. ✅ File upload (S3)

### Sonraki Adımlar (Gelecek Hafta)
1. ✅ Analytics endpoints
2. ✅ Background jobs
3. ✅ WebSocket support
4. ✅ Search functionality

### Production (2-3 Hafta Sonra)
1. ✅ Deploy to cloud
2. ✅ Setup CI/CD
3. ✅ Monitoring & logging
4. ✅ Load testing

---

## 📚 Kaynaklar

### Tutorials
- **Node.js + Express**: https://expressjs.com/en/starter/installing.html
- **Prisma**: https://www.prisma.io/docs/getting-started
- **JWT Authentication**: https://jwt.io/introduction

### Tools
- **Postman**: API testing
- **Prisma Studio**: Database GUI
- **Thunder Client**: VS Code extension for API testing

---

## 🐛 Troubleshooting

### "Cannot find module 'express'"
```bash
npm install express
```

### "Prisma Client is not generated"
```bash
npx prisma generate
```

### "Database connection failed"
```bash
# Check DATABASE_URL in .env
# Check PostgreSQL is running
brew services list
```

### "CORS error in extension"
```bash
# Update CORS config in src/index.ts
app.use(cors({
  origin: '*', // Temporary for development
  credentials: true
}));
```

---

## ✅ Checklist

- [ ] Node.js installed
- [ ] Dependencies installed
- [ ] Database setup complete
- [ ] Prisma migrations run
- [ ] Server starts successfully
- [ ] Health check returns 200
- [ ] Register endpoint works
- [ ] Login endpoint works
- [ ] AI proxy works
- [ ] Extension can connect to backend

---

**Tebrikler!** 🎉

Backend'in hazır! Şimdi Chrome Extension'ı backend'e bağlayabilirsin.

**Sonraki adım**: `BACKEND_ROADMAP.md`'deki Phase 2'ye geç.
