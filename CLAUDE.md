# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Resume Analyzer + Job Match Platform** — An AI-powered web application that analyzes resumes using the Google Gemini API, calculates ATS scores, identifies skill gaps, recommends matching jobs, and generates downloadable PDF reports.

**Portfolio Value:** Demonstrates full-stack development (React + Node.js), AI integration with structured outputs, real-world hiring domain knowledge, and production-quality code.

---

## Current Status — 22/51 Tasks Complete

| Phase | Status |
|-------|--------|
| Phase 1 — Infrastructure | ✅ 5/5 |
| Phase 2a — Resume Processing | ✅ 4/4 |
| Phase 2b — Gemini API Integration | ✅ 6/6 |
| Phase 2c — Job Matching | ✅ 5/5 |
| Phase 2d — Reports | ✅ 2/2 |
| Phase 2e — Backend Polish | ⬜ 0/2 |
| Phase 3 — Frontend | ⬜ 0/13 |
| Phase 4 — QA & Launch | ⬜ 0/14 |

---

## Tech Stack

- **Backend:** Node.js + Express (ES Modules)
- **Database:** MongoDB via Mongoose (local Docker or Atlas)
- **AI:** Google Gemini API (`@google/genai` SDK, `gemini-2.5-flash` model)
- **PDF Parsing:** `pdf-parse` (upload processing)
- **PDF Generation:** `pdfkit` (report downloads)
- **Authentication:** JWT tokens (access: 15m, refresh: 7d)
- **Frontend:** React (Vite) — _not yet built_
- **Deployment:** Vercel (frontend), Render/Railway (backend) — _not yet deployed_

---

## Project Structure (Actual)

```
resume-analyzer/
├── backend/
│   ├── src/
│   │   ├── index.js                    # Express entry point (port 8080)
│   │   ├── middleware/
│   │   │   └── auth.js                 # JWT verification (requireAuth)
│   │   ├── models/
│   │   │   ├── User.js                 # User schema (name, email, password, plan, analysisCount)
│   │   │   ├── Resume.js               # Resume schema (userId, fileName, extractedText, status)
│   │   │   ├── AnalysisResult.js       # AI analysis results (skills, atsScore, improvements, etc.)
│   │   │   └── Job.js                  # Job listings (title, requiredSkills, niceToHaveSkills, etc.)
│   │   ├── routes/
│   │   │   ├── auth.js                 # POST /register, /login, GET /me
│   │   │   └── resumes.js              # Upload, analyze, matches, report endpoints
│   │   ├── services/
│   │   │   ├── gemini.js               # Gemini API — skill extraction, ATS scoring, missing skills
│   │   │   ├── jobMatcher.js           # Weighted skill-matching algorithm
│   │   │   └── reportGenerator.js      # pdfkit-based PDF report generation
│   │   ├── controllers/                # (empty — logic is in route handlers)
│   │   └── utils/                      # (placeholder for validators)
│   ├── config/
│   │   └── database.js                 # MongoDB connection helper
│   ├── scripts/
│   │   └── seed-jobs.js                # Seeds 20 sample jobs into MongoDB
│   ├── data/
│   │   └── sample-resumes/             # Test PDF files
│   ├── tests/
│   │   ├── test-auth.js                # Auth endpoint tests
│   │   ├── test-upload.js              # PDF upload tests
│   │   ├── test-analysis.js            # Gemini analysis E2E tests (42 assertions)
│   │   └── test-jobs.js                # Job matching E2E tests (13 assertions)
│   ├── package.json
│   └── .env                            # Environment variables
│
├── frontend/                           # Not yet built
├── CLAUDE.md                           # This file
├── PRD.md                              # Product requirements
├── DESIGN.md                           # UI design system + wireframes
├── TODO.md                             # Task tracker (22/51)
├── docker-compose.yml                  # MongoDB container
└── README.md
```

---

## Development Commands

### Prerequisites
```bash
docker compose up -d                   # Start MongoDB on port 27017
```

### Backend
```bash
cd backend
npm install
cp .env.example .env                   # Configure: MONGODB_URI, GEMINI_API_KEY
npm run dev                            # Start dev server (port 8080, via nodemon)
npm run start                          # Production start
```

### Seed Jobs
```bash
cd backend
node scripts/seed-jobs.js              # Populates 20 sample tech jobs
```

### Run Tests
```bash
cd backend
node tests/test-auth.js                # Auth tests (no external API needed)
node tests/test-upload.js              # Upload tests (needs sample PDF)
node tests/test-analysis.js            # Gemini tests (needs real GEMINI_API_KEY)
node tests/test-jobs.js                # Job matching tests (needs seeded jobs)
```

### Environment Variables
```
PORT=8080
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/resume-analyzer
JWT_SECRET=dev_jwt_secret_change_in_production_min_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key_here
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
Gemini Service makes 3 parallel API calls:
    • extractSkills()   → categorized skills with proficiency
    • scoreATS()        → 0-100 score + feedback + improvements
    • analyzeMissing()  → 8-12 missing skills with rationale
    ↓
Store AnalysisResult in MongoDB
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
POST   /api/resumes/:id/analyze    # Trigger Gemini analysis (enforces free-tier limit: 3)
GET    /api/resumes/:id/analysis   # Get stored analysis results

# Job Matching
GET    /api/resumes/:id/matches    # Get top 10 matching jobs

# Reports
GET    /api/resumes/:id/report     # Download PDF analysis report
```

---

## Critical Files

### `backend/src/services/gemini.js` — AI Engine
- Uses `@google/genai` SDK with `responseJsonSchema` for guaranteed structured JSON output
- Three functions: `extractSkills()`, `scoreATS()`, `analyzeMissingSkills()`
- `analyzeResume()` runs all three in parallel via `Promise.all`
- Model: `gemini-2.5-flash`

### `backend/src/services/jobMatcher.js` — Matching Algorithm
- Normalizes skills to lowercase for case-insensitive matching
- Scoring: required skill match = +2 points, nice-to-have = +1 point
- Returns normalized percentage (0-100%) sorted descending
- Returns matched skills and missing skills per job

### `backend/src/services/reportGenerator.js` — PDF Reports
- Uses `pdfkit` to generate multi-page A4 documents
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
- Handles Gemini API errors gracefully (502 + resume status set to "error")

---

## Git History

| Commit | Description |
|--------|-------------|
| `2e6c9cd` | Initial project scaffold — folder structure, configs |
| `46e59fc` | Planning docs, dependency fixes, .gitignore hardening |
| `52c86e1` | Phase 1 — Infrastructure, User model, JWT auth |
| `9fc86dd` | Phase 2a — Resume upload, pdf-parse, tested |
| `b0cc3a7` | Phase 2b/2c/2d — Gemini AI, Job Matching, PDF Reports |

---

## What Has Been Built

### Phase 1 — Infrastructure ✅
- Express server with CORS, rate limiting, JSON body parsing
- MongoDB connection via Mongoose with Docker Compose
- User model with bcrypt password hashing
- JWT authentication (register, login, `requireAuth` middleware)
- Full auth test suite

### Phase 2a — Resume Processing ✅
- PDF upload via multer (5MB limit, PDF-only filter)
- Text extraction using pdf-parse
- Resume model with status tracking (`uploaded` → `analyzed` / `error`)
- Upload + list + get-by-id endpoints
- Upload test suite

### Phase 2b — Gemini API Integration ✅
- Replaced original Claude API plan with Google Gemini (`@google/genai`)
- AnalysisResult model with rich embedded schemas
- Three AI analysis functions with enforced JSON output schemas
- `POST /api/resumes/:id/analyze` with free-tier enforcement
- `GET /api/resumes/:id/analysis` to retrieve results
- 42-assertion E2E test suite

### Phase 2c — Job Matching ✅
- Job model with required/nice-to-have skills, salary, location, work model
- Seed script with 20 diverse tech jobs
- Weighted matching algorithm (required = 2×, nice-to-have = 1×)
- `GET /api/resumes/:id/matches` returning top 10 matches
- 13-assertion E2E test suite

### Phase 2d — Reports ✅
- pdfkit-based PDF report with dynamic formatting
- Color-coded impact/importance tags
- Skills grouped by category
- `GET /api/resumes/:id/report` streams PDF download

---

## What's Next

### Phase 2e — Backend Polish (2 tasks)
- Error handling middleware (centralized)
- Input validation on all endpoints

### Phase 3 — Frontend (13 tasks)
- React app with Vite
- Pages: Home, Auth, Upload, Results, Job Matches, Dashboard
- Components: Header, SkillCard, JobCard, ATS visualization
- State management, API utilities, loading states, error boundaries

### Phase 4 — QA & Launch (14 tasks)
- Unit + integration tests
- Manual QA across all flows
- CI/CD, deployment, monitoring

---

## Important Implementation Notes

### Gemini API Integration
- **SDK:** `@google/genai` with `Type` enum for schema definitions
- **Structured Output:** Use `responseMimeType: 'application/json'` + `responseJsonSchema`
- **Error Handling:** Gemini failures return 502, resume status set to `error` for retry
- **Free Tier:** Generous (15 req/min), but set `GEMINI_API_KEY` in `.env`
- **Parallel Calls:** All 3 analyses run via `Promise.all` (~5-15s total)

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
- [ ] Input validation on all endpoints (Phase 2e)
- [ ] Centralized error handling middleware (Phase 2e)
- [ ] Never log API keys or tokens
- [ ] Use HTTPS in production

---

## Common Tasks

### Add a New Gemini Prompt
1. Edit `backend/src/services/gemini.js`
2. Define a new JSON schema using `Type.*` constants
3. Add a new function: `export async function analyzeX(resumeText) { ... }`
4. Add to `analyzeResume()` parallel calls if needed
5. Update the route in `backend/src/routes/resumes.js`
6. Add fields to `AnalysisResult.js` schema if storing new data

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
4. Set a real `GEMINI_API_KEY`
5. Update `FRONTEND_URL` to production domain

---

## Performance Considerations

- **Gemini API:** 3 parallel calls per resume (~5-15 seconds total)
- **Job Matching:** O(n) linear scan — fine for <1000 jobs
- **PDF Generation:** Streamed directly to response, no temp files
- **Database Indexes:** `userId`, `resumeId`, compound indexes for fast queries
- **Caching:** Consider caching job matches (valid for 24h)

---

## Resources

- **Google GenAI SDK:** https://www.npmjs.com/package/@google/genai
- **Gemini API Docs:** https://ai.google.dev/docs
- **pdf-parse:** https://www.npmjs.com/package/pdf-parse
- **pdfkit:** http://pdfkit.org/
- **MongoDB Docs:** https://docs.mongodb.com/
- **Express Guide:** https://expressjs.com/

---

Good luck building! This is a strong portfolio project. 🚀
