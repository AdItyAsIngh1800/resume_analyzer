<div align="center">

# Resume Analyzer

**AI-powered resume optimization and job matching platform**

[![CI](https://github.com/AdItyAsIngh1800/resume_analyzer/actions/workflows/ci.yml/badge.svg)](https://github.com/AdItyAsIngh1800/resume_analyzer/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Features](#-features) · [Demo](#-demo) · [Quick Start](#-quick-start) · [Architecture](#-architecture) · [API Reference](#-api-reference) · [Contributing](#-contributing)

</div>

---

## Overview

Resume Analyzer is a full-stack web application that helps job seekers land more interviews. Upload a PDF resume and get back an ATS compatibility score, extracted skill map, personalized improvement suggestions, and a ranked list of matching jobs — all powered by a local or cloud AI model. Download a polished PDF report to share with mentors or career coaches.

Built as a portfolio project demonstrating production-quality full-stack engineering: Next.js frontend, Node.js/Express API, MongoDB, JWT auth, dual AI backend (Ollama locally / Gemini in production), and a real-time job feed via [GraphQL Jobs](https://graphql.jobs).

---

## Features

| Feature | Details |
|---|---|
| **ATS Scoring** | 0–100 score with weighted breakdown (formatting, keywords, achievements, education, presentation) |
| **Skill Extraction** | Categorized skill map (languages, frameworks, databases, cloud, DevOps, soft skills) with inferred proficiency |
| **Gap Analysis** | 8–12 missing skills ranked by market importance with reasoning |
| **Job Matching** | Weighted algorithm against 20 seeded jobs + live feed from GraphQL Jobs API |
| **PDF Reports** | Downloadable A4 report with color-coded scores, skill table, and improvement checklist |
| **Auth** | JWT access tokens (15 min) + refresh tokens (7 days), bcrypt password hashing |
| **Free Tier** | 3 analyses per user; plan-based limit enforced server-side |

---

## Demo

> Deployment in progress (#49). To try it locally, follow the Quick Start below.

**Screens:** Landing → Register → Upload PDF → ATS Results → Job Matches → Download Report

---

## Quick Start

### Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Backend + frontend |
| Docker | any | MongoDB container |
| Ollama | latest | Local AI model (dev) |

### 1 — Clone and install

```bash
git clone https://github.com/AdItyAsIngh1800/resume_analyzer.git
cd resume_analyzer
```

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2 — Configure environment

```bash
cp backend/.env.example backend/.env
# Open backend/.env and fill in the required values (see below)
```

**Minimum required vars for local dev:**

```env
PORT=8080
MONGODB_URI=mongodb://localhost:27017/resume-analyzer
JWT_SECRET=<any-random-32-char-string>
```

> Leave `GEMINI_API_KEY` blank to use local Ollama. Set it to use Google Gemini instead (required for production/cloud deployment).

### 3 — Start services

```bash
# MongoDB
docker compose up -d

# Ollama (local AI)
brew services start ollama
ollama pull llama3.1:8b          # ~4.9 GB, one-time download
```

```bash
# Backend (port 8080)
cd backend && npm run dev

# Frontend (port 3000)
cd frontend && npm run dev
```

### 4 — Seed sample jobs

```bash
cd backend && node scripts/seed-jobs.js
```

Open [http://localhost:3000](http://localhost:3000), register an account, and upload a PDF resume.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│              Next.js 14  ·  TypeScript  ·  Tailwind         │
│                        Zustand state                        │
└───────────────────────────┬─────────────────────────────────┘
                            │  REST (Axios)
┌───────────────────────────▼─────────────────────────────────┐
│                   Express API  (port 8080)                   │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐  ┌──────────┐  │
│  │  /auth   │  │ /resumes │  │  /matches  │  │ /report  │  │
│  └──────────┘  └────┬─────┘  └─────┬──────┘  └────┬─────┘  │
│                     │              │               │        │
│            ┌────────▼──────┐  ┌───▼───────┐  ┌───▼──────┐  │
│            │  AI Service   │  │  Job      │  │  Report  │  │
│            │  (Gemini /    │  │  Matcher  │  │  Gen     │  │
│            │   Ollama)     │  │           │  │  pdfkit  │  │
│            └───────────────┘  └─────┬─────┘  └──────────┘  │
│                                     │                       │
│                              ┌──────▼──────┐                │
│                              │ GraphQL Jobs│                 │
│                              │ API (live)  │                 │
│                              └─────────────┘                │
└──────────────────────────┬──────────────────────────────────┘
                           │  Mongoose
                    ┌──────▼──────┐
                    │   MongoDB   │
                    │  (Docker /  │
                    │   Atlas)    │
                    └─────────────┘
```

### Data Flow

```
Upload PDF
  → pdf-parse extracts text
  → POST /analyze → AI service (single prompt, JSON mode)
  → validateAndNormalize()
  → AnalysisResult saved to MongoDB
  → GET /matches → jobMatcher scores DB jobs + live API jobs
  → GET /report  → pdfkit streams PDF to response
```

### AI Backend Selection

The service auto-selects its AI backend at startup:

```
GEMINI_API_KEY set?  ──yes──▶  Google Gemini (cloud, gemini-1.5-flash)
                     ──no───▶  Ollama local  (llama3.1:8b or OLLAMA_MODEL)
```

No code changes needed between environments — just set the env var.

---

## Project Structure

```
resume_analyzer/
├── backend/
│   ├── src/
│   │   ├── index.js                  # Entry point (port 8080)
│   │   ├── app.js                    # Express app factory
│   │   ├── middleware/               # auth, errorHandler, validate
│   │   ├── models/                   # User, Resume, AnalysisResult, Job
│   │   ├── routes/                   # auth.js, resumes.js
│   │   └── services/
│   │       ├── ai.js                 # Dual AI backend (Gemini / Ollama)
│   │       ├── jobMatcher.js         # Weighted skill-match algorithm
│   │       ├── graphqlJobsFetcher.js # Live job feed (1h cache)
│   │       └── reportGenerator.js   # pdfkit PDF reports
│   ├── config/database.js
│   ├── scripts/seed-jobs.js
│   ├── tests/
│   │   ├── unit/                     # 4 suites, ~48 assertions
│   │   └── integration/              # 2 suites, ~23 assertions
│   └── .env.example
│
├── frontend/
│   └── src/
│       ├── pages/                    # /, /login, /register, /upload,
│       │                             # /dashboard, /resumes/[id],
│       │                             # /resumes/[id]/matches
│       ├── components/               # ATSScore, JobCard, SkillCard,
│       │                             # Header, Layout, UI primitives
│       ├── store/auth.ts             # Zustand auth store
│       ├── utils/api.ts              # Axios client
│       └── types/index.ts
│
├── render.yaml                       # Render Web Service config
├── docker-compose.yml                # MongoDB container
└── .github/workflows/ci.yml         # Lint · Unit · Integration · Build · Deploy
```

---

## API Reference

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register → returns JWT pair |
| `POST` | `/api/auth/login` | Login → returns JWT pair |
| `GET` | `/api/auth/me` | Current user profile |

### Resumes

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/resumes/upload` | Upload PDF (max 5 MB) |
| `GET` | `/api/resumes` | List user's resumes |
| `GET` | `/api/resumes/:id` | Single resume |
| `POST` | `/api/resumes/:id/analyze` | Run AI analysis |
| `GET` | `/api/resumes/:id/analysis` | Fetch analysis results |
| `GET` | `/api/resumes/:id/matches` | Top 20 job matches |
| `GET` | `/api/resumes/:id/report` | Download PDF report |

### Health

```bash
GET /health
# → { status, ai: { ok, backend, model }, db: { ok } }
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, TypeScript 5, Tailwind CSS, Zustand |
| Backend | Node.js 18+, Express 4, ES Modules |
| Database | MongoDB 8 via Mongoose |
| AI (local) | Ollama — `llama3.1:8b` (configurable) |
| AI (cloud) | Google Gemini 1.5 Flash |
| PDF | pdf-parse (input), pdfkit (output) |
| Auth | JWT (jsonwebtoken), bcrypt |
| Job Data | Static seed + GraphQL Jobs live API |
| CI/CD | GitHub Actions → Render deploy hook |
| Deployment | Render (backend), Vercel (frontend) |

---

## Running Tests

```bash
cd backend

npm run test:unit          # unit tests (no DB required)
npm run test:integration   # integration tests (requires MongoDB)
npm test                   # both suites
```

Tests use Node's built-in test runner (`node:test`). Integration tests spin up against a real MongoDB instance — no mocking.

---

## Deployment

### Backend → Render

1. Create a new **Web Service** on [Render](https://render.com), connect this repo
2. Render auto-detects `render.yaml` — build and start commands are pre-configured
3. Set these secrets in the Render dashboard (marked `sync: false` in `render.yaml`):
   - `JWT_SECRET` — generate with `openssl rand -hex 32`
   - `MONGODB_URI` — MongoDB Atlas connection string
   - `GEMINI_API_KEY` — from [Google AI Studio](https://aistudio.google.com/app/apikey) (free)
   - `FRONTEND_URL` — your Vercel deployment URL
4. Add a **Deploy Hook** URL, then paste it into GitHub → Settings → Secrets as `RENDER_DEPLOY_HOOK_URL`

CI automatically triggers a deploy on every push to `main` after all tests pass.

### Frontend → Vercel

```bash
npm i -g vercel
cd frontend && vercel --prod
# Set NEXT_PUBLIC_API_URL to your Render service URL when prompted
```

---

## Environment Variables

See [`backend/.env.example`](backend/.env.example) for the full annotated reference.

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Min 32 chars, strong random string |
| `GEMINI_API_KEY` | Cloud only | Enables Gemini AI backend |
| `OLLAMA_BASE_URL` | Local only | Default: `http://localhost:11434` |
| `OLLAMA_MODEL` | Local only | Default: `llama3.1:8b` |
| `FRONTEND_URL` | ✅ | CORS origin (e.g. `https://your-app.vercel.app`) |

---

## Contributing

1. Fork the repo and create a feature branch: `git checkout -b feat/your-feature`
2. Make your changes and add tests where relevant
3. Run `npm test` and `npm run lint` — both must pass
4. Open a pull request against `main`

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with Node.js · Next.js · MongoDB · Ollama · Google Gemini

</div>
