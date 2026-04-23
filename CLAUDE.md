# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Resume Analyzer + Job Match Platform** — An AI-powered web application that analyzes resumes using a local Ollama model, calculates ATS scores, identifies skill gaps, recommends matching jobs, and generates downloadable PDF reports.

**Portfolio Value:** Demonstrates full-stack development (Next.js + Node.js), local AI integration with structured outputs, real-world hiring domain knowledge, and production-quality code.

---

## Current Status — 39/52 Tasks Complete (75%)

| Phase | Status |
|-------|--------|
| Phase 1 — Infrastructure | ✅ 5/5 |
| Phase 2a — Resume Processing | ✅ 4/4 |
| Phase 2b — AI Integration (Ollama) | ✅ 7/7 |
| Phase 2c — Job Matching | ✅ 5/5 |
| Phase 2d — Reports | ✅ 2/2 |
| Phase 2e — Backend Polish | ✅ 2/2 |
| Phase 3 — Frontend | ✅ 13/13 |
| Phase 4a — Testing & QA | ⏳ 1/7 |
| Phase 4b — Optimization & Security | ⏳ 0/2 |
| Phase 4c — CI/CD & Deployment | ⏳ 0/3 |
| Phase 4d — Monitoring & Documentation | ⏳ 0/2 |

---

## Tech Stack

- **Backend:** Node.js + Express (ES Modules)
- **Database:** MongoDB via Mongoose (local Docker or Atlas)
- **AI:** Ollama local model (`llama3.1:8b` default, configurable via `OLLAMA_MODEL`)
- **PDF Parsing:** `pdf-parse` (upload processing)
- **PDF Generation:** `pdfkit` (report downloads)
- **Authentication:** JWT tokens (access: 15m, refresh: 7d)
- **Frontend:** Next.js 14 (Pages Router) + TypeScript + Tailwind CSS
- **State Management:** Zustand
- **Deployment:** Vercel (frontend), Render/Railway (backend) — _not yet deployed_

---

## Project Structure (Actual)

```
resume-analyzer/
├── backend/
│   ├── src/
│   │   ├── index.js                    # Express entry point (port 8080)
│   │   ├── middleware/
│   │   │   ├── auth.js                 # JWT verification (requireAuth)
│   │   │   ├── errorHandler.js         # ApiError + centralized handler
│   │   │   └── validate.js             # validateBody + validateObjectId
│   │   ├── models/
│   │   │   ├── User.js                 # User schema (name, email, password, plan, analysisCount)
│   │   │   ├── Resume.js               # Resume schema (userId, fileName, extractedText, status)
│   │   │   ├── AnalysisResult.js       # AI analysis results (skills, atsScore, improvements, etc.)
│   │   │   └── Job.js                  # Job listings (title, requiredSkills, niceToHaveSkills, etc.)
│   │   ├── routes/
│   │   │   ├── auth.js                 # POST /register, /login, GET /me
│   │   │   └── resumes.js              # Upload, analyze, matches, report endpoints
│   │   └── services/
│   │       ├── ai.js                   # Ollama local model — combined analysis + retry + mutex
│   │       ├── jobMatcher.js           # Weighted skill-matching algorithm
│   │       └── reportGenerator.js      # pdfkit-based PDF report generation
│   ├── config/
│   │   └── database.js                 # MongoDB connection helper
│   ├── scripts/
│   │   └── seed-jobs.js                # Seeds 20 sample jobs into MongoDB
│   ├── data/
│   │   └── sample-resumes/             # Test PDF files
│   ├── tests/
│   │   ├── test-analysis.js            # Gemini analysis E2E tests (42 assertions) — needs update for Ollama
│   │   └── test-jobs.js                # Job matching E2E tests (13 assertions)
│   ├── package.json
│   └── .env                            # Environment variables
│
├── frontend/                           # Next.js 14 (Pages Router)
│   ├── src/
│   │   ├── pages/                      # /, /login, /register, /upload, /dashboard, /resumes/[id], /resumes/[id]/matches
│   │   ├── components/                 # Header, Layout, ATSScore, SkillsByCategory, JobCard, ProtectedRoute, ErrorBoundary, Loading
│   │   ├── store/auth.ts              # Zustand
│   │   ├── utils/api.ts              # Axios client
│   │   └── types/index.ts
│   ├── next.config.js                  # CommonJS, NEXT_PUBLIC_API_URL
│   └── postcss.config.js
│
├── CLAUDE.md                           # This file
├── PRD.md                              # Product requirements
├── DESIGN.md                           # UI design system + wireframes
├── TODO.md                             # Task tracker (38/52)
├── docker-compose.yml                  # MongoDB container
└── README.md
```

---

## Development Commands

### Prerequisites
```bash
docker compose up -d                   # Start MongoDB on port 27017
brew services start ollama             # Start Ollama AI server
ollama pull llama3.1:8b                # Download the default model (~4.9 GB)
```

### Backend
```bash
cd backend
npm install
cp .env.example .env                   # Configure: MONGODB_URI, OLLAMA_MODEL
npm run dev                            # Start dev server (port 8080, via nodemon)
npm run start                          # Production start
```

### Frontend
```bash
cd frontend
npm install
npm run dev                            # Start Next.js dev server (port 3000)
```

### Seed Jobs
```bash
cd backend
node scripts/seed-jobs.js              # Populates 20 sample tech jobs
```

### Run Tests
```bash
cd backend
node tests/test-analysis.js            # AI analysis tests (needs Ollama running)
node tests/test-jobs.js                # Job matching tests (needs seeded jobs)
```

### Verify Ollama is Working
```bash
curl http://localhost:8080/health       # Returns AI model status
ollama list                             # Show downloaded models
```

### Environment Variables
```
PORT=8080
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/resume-analyzer
JWT_SECRET=dev_jwt_secret_change_in_production_min_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
FRONTEND_URL=http://localhost:3000
```

---

## Core Architecture

### Data Flow
```
User uploads PDF
    ↓
POST /api/resumes/upload
    ↓
pdf-parse extracts text → stored in Resume doc
    ↓
POST /api/resumes/:id/analyze
    ↓
Ollama Service (single combined call):
    • skills extraction → categorized skills with proficiency
    • ATS scoring → 0-100 score + feedback + improvements
    • missing skills → 8-12 missing skills with rationale
    ↓
Validate + normalize response → store AnalysisResult in MongoDB
    ↓
GET /api/resumes/:id/matches
    ↓
jobMatcher ranks jobs by weighted skill overlap
    ↓
GET /api/resumes/:id/report
    ↓
pdfkit generates downloadable PDF
```

### API Endpoints

```
# Auth
POST   /api/auth/register          # User signup → JWT
POST   /api/auth/login             # User login → JWT
GET    /api/auth/me                # Get current user profile

# Resume Management
POST   /api/resumes/upload         # Upload PDF → extract text (multer, 5MB limit)
GET    /api/resumes                # List user's resumes
GET    /api/resumes/:id            # Get single resume

# AI Analysis
POST   /api/resumes/:id/analyze    # Trigger Ollama analysis (enforces free-tier limit: 3)
GET    /api/resumes/:id/analysis   # Get stored analysis results

# Job Matching
GET    /api/resumes/:id/matches    # Get top 10 matching jobs

# Reports
GET    /api/resumes/:id/report     # Download PDF analysis report

# Health
GET    /health                     # Server + Ollama health check
```

---

## Critical Files

### `backend/src/services/ai.js` — AI Engine (Ollama)
- Uses Ollama HTTP API (`/api/chat`) with `format: "json"` for structured output
- Single combined prompt for all 3 analyses (skills, ATS, missing skills)
- Concurrency mutex — only one analysis runs at a time (local models are single-threaded)
- Retry with exponential backoff on transient errors (ECONNREFUSED, etc.)
- `validateAndNormalize()` ensures response conforms to expected schema
- `checkOllamaHealth()` verifies server and model availability
- Model: `llama3.1:8b` (configurable via `OLLAMA_MODEL`)

### `backend/src/services/jobMatcher.js` — Matching Algorithm
- Normalizes skills to lowercase for case-insensitive matching
- Scoring: required skill match = +2 points, nice-to-have = +1 point
- Returns normalized percentage (0-100%) sorted descending
- Returns matched skills and missing skills per job

### `backend/src/services/reportGenerator.js` — PDF Reports
- Uses `pdfkit` to generate multi-page A4 documents
- Configured with `bufferPages: true` for accurate page counting and footer placement
- Uses margin modification (`doc.page.margins.bottom = 0`) during footer drawing to prevent auto-generated blank pages
- Color-coded ATS scores (green ≥80, orange ≥60, red <60)
- Sections: Executive Summary, Strengths, Weaknesses, Improvements, Skills, Missing Skills
- Streams directly to HTTP response (no temp files)

### `backend/src/models/AnalysisResult.js` — Analysis Schema
- Embedded sub-schemas: `skillSchema`, `improvementSchema`, `missingSkillSchema`
- Skills have 9 categories and 4 proficiency levels
- Indexed on `{ userId, createdAt }` and `{ resumeId }` (unique)

### `backend/src/routes/resumes.js` — Main Router
- Handles all resume CRUD, analysis triggering, job matching, and report downloads
- Enforces free-tier analysis limit (3 per user)
- Handles AI errors gracefully (502 + resume status set to "error")

---

## Git History

| Commit | Description |
|--------|-------------|
| `2e6c9cd` | Initial project scaffold — folder structure, configs |
| `46e59fc` | Planning docs, dependency fixes, .gitignore hardening |
| `52c86e1` | Phase 1 — Infrastructure, User model, JWT auth |
| `9fc86dd` | Phase 2a — Resume upload, pdf-parse, tested |
| `b0cc3a7` | Phase 2b/2c/2d — Gemini AI, Job Matching, PDF Reports |
| `bcd32c0` | CLAUDE.md rewrite |
| `8dd546c` | Phase 2e — Error handling + validation |
| `9a527d5` | Phase 3 — Full frontend (Next.js + Tailwind) |
| `3d8772e` | Housekeeping — marked phases complete |
| `a7baf68` | Bug fix — Gemini key at startup |
| (uncommitted) | Switch Gemini → Ollama local model |

---

## What Has Been Built

### Phase 1 — Infrastructure ✅
- Express server with CORS, rate limiting, JSON body parsing
- MongoDB connection via Mongoose with Docker Compose
- User model with bcrypt password hashing
- JWT authentication (register, login, `requireAuth` middleware)

### Phase 2a — Resume Processing ✅
- PDF upload via multer (5MB limit, PDF-only filter)
- Text extraction using pdf-parse
- Resume model with status tracking (`uploaded` → `analyzed` / `error`)

### Phase 2b — AI Integration ✅
- Originally used Google Gemini API; switched to Ollama local model for:
  - Zero rate limits (Gemini free tier: 20 RPD / 5 RPM)
  - No API key required
  - Fully offline-capable
  - Unlimited analyses
- AnalysisResult model with rich embedded schemas
- Single combined AI call with JSON mode
- Response validation and normalization

### Phase 2c — Job Matching ✅
- Job model with required/nice-to-have skills, salary, location, work model
- Seed script with 20 diverse tech jobs
- Weighted matching algorithm (required = 2×, nice-to-have = 1×)

### Phase 2d — Reports ✅
- pdfkit-based PDF report with dynamic formatting
- Color-coded impact/importance tags, skills grouped by category

### Phase 2e — Backend Polish ✅
- Centralized error handling with `ApiError` class
- Input validation middleware (type, required, min/max, email, enum)

### Phase 3 — Frontend ✅
- Next.js 14 with Pages Router, TypeScript, Tailwind CSS
- Auth pages, Upload (drag-and-drop), Dashboard, Results, Job Matches
- Zustand state management, Axios API client
- Animated ATS score ring, skill chips, job match cards
- Protected routes, error boundaries, loading states

---

## What's Next

### Phase 4 — QA & Launch (13 remaining tasks)

#### Phase 4a — Testing & QA (7 tasks)
- **#38–39:** Backend unit + integration tests (Node test runner)
- **#40–44:** Manual QA sweeps:
  - Authentication flow (register, login, token refresh)
  - Resume upload and PDF parsing (edge cases)
  - Analysis results and report generation
  - Job matching algorithm
  - Mobile responsiveness across devices

#### Phase 4b — Optimization & Security (2 tasks)
- **#45:** Performance profiling (Ollama latency, PDF gen, DB queries)
- **#46:** Security audit (JWT, password hashing, CORS, input validation, rate limits)

#### Phase 4c — CI/CD & Deployment (3 tasks)
- **#47:** GitHub Actions workflow (lint, test, build)
- **#48:** Deploy backend to production (Render/Railway + MongoDB Atlas)
- **#49:** Deploy frontend to Vercel (env vars, API URL config)

#### Phase 4d — Monitoring & Documentation (2 tasks)
- **#50:** Setup error logging, request monitoring, Ollama health checks
- **#51:** Create demo script and portfolio showcase doc

---

## Important Implementation Notes

### Ollama AI Integration
- **API:** Ollama HTTP API at `http://localhost:11434/api/chat`
- **JSON Mode:** `format: "json"` in request body
- **Model:** `llama3.1:8b` (~4.9 GB download) — configurable via `OLLAMA_MODEL`
- **Concurrency:** Mutex serializes requests (one at a time)
- **Retry:** 3 attempts with exponential backoff on transient errors
- **Validation:** Response is validated and normalized to match expected schema
- **Health Check:** `GET /health` reports Ollama status and available models

### Authentication
- JWT access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Passwords hashed with bcrypt (10 rounds)
- `requireAuth` middleware decodes token and attaches `req.user`

### Free-Tier Enforcement
- Users on the `free` plan get 3 analyses
- `user.analysisCount` is incremented on each successful analysis
- Exceeding the limit returns 403 with upgrade prompt

### PDF Handling
- **Upload:** multer with memory storage, 5MB limit, PDF MIME-type filter
- **Parsing:** pdf-parse extracts text; scanned/corrupted PDFs return 422
- **Reports:** pdfkit streams directly to response (no disk I/O)

---

## Security Checklist

- [x] JWT tokens have expiration (15m access, 7d refresh)
- [x] Password hashing with bcrypt (rounds: 10)
- [x] Rate limiting on all endpoints
- [x] PDF size limit enforced (5MB max)
- [x] CORS properly configured
- [x] Input validation on all endpoints
- [x] Centralized error handling middleware
- [ ] Never log API keys or tokens
- [ ] Use HTTPS in production

---

## Common Tasks

### Switch AI Model
1. Run `ollama pull <model-name>` (e.g., `ollama pull mistral`, `ollama pull qwen2.5:7b`)
2. Set `OLLAMA_MODEL=<model-name>` in `.env`
3. Restart the backend server
4. Verify via `GET /health`

### Change Job Matching Logic
1. Edit `backend/src/services/jobMatcher.js`
2. Adjust scoring weights (currently: required=2, nice-to-have=1)
3. Run `node tests/test-jobs.js` to verify
4. Consider adding level/location filters

### Add New Sample Jobs
1. Edit `backend/scripts/seed-jobs.js`
2. Add entries to the `sampleJobs` array
3. Run `node scripts/seed-jobs.js` to re-seed

### Deploy to Production
1. Set environment variables in Render (backend) and Vercel (frontend)
2. Use MongoDB Atlas connection string for `MONGODB_URI`
3. Set a strong `JWT_SECRET` (min 32 chars)
4. For production AI: either deploy Ollama on the server or switch back to Gemini API
5. Update `FRONTEND_URL` to production domain

---

## Performance Considerations

- **Ollama AI:** Single combined analysis call (~15-45s depending on model and hardware)
- **Concurrency:** Serialized through mutex — one analysis at a time
- **Job Matching:** O(n) linear scan — fine for <1000 jobs
- **PDF Generation:** Streamed directly to response, no temp files
- **Database Indexes:** `userId`, `resumeId`, compound indexes for fast queries
- **Caching:** Consider caching job matches (valid for 24h)

---

## Resources

- **Ollama:** https://ollama.ai/
- **Ollama API Docs:** https://github.com/ollama/ollama/blob/main/docs/api.md
- **pdf-parse:** https://www.npmjs.com/package/pdf-parse
- **pdfkit:** http://pdfkit.org/
- **MongoDB Docs:** https://docs.mongodb.com/
- **Express Guide:** https://expressjs.com/
- **Next.js Docs:** https://nextjs.org/docs

---

Good luck building! This is a strong portfolio project. 🚀
