# Technology Stack Recommendation

## AI Resume Analyzer + Job Match Platform

**Document Version:** 1.0  
**Last Updated:** April 23, 2026  
**Architect:** Senior Tech Lead  
**Status:** Ready for Engineering Review  

---

## 1. Project Understanding

### Type of Project
**Category:** Full-stack SaaS web application (B2C)

**Primary Use Case:**
Users upload resume PDFs → system extracts text → AI analyzes resume → calculates ATS score → suggests missing skills → matches with job descriptions → downloads report

**Core Problem Solved:**
Job seekers need to understand why resumes are rejected by ATS and what to improve. Current solutions are expensive (recruiters) or generic (resume templates). We solve this with AI-powered analysis + job matching.

### Expected Scale & Users

| Metric | Value | Notes |
|--------|-------|-------|
| **Month 6 Target** | 10K registered users | 500 WAU, 100 DAU |
| **Month 12 Target** | 100K registered users | 5K WAU, 1K DAU |
| **Year 3 Target** | 1M+ registered users | 50K WAU, 10K DAU |
| **Concurrent Users (Peak)** | 1K at Month 6, 10K at Year 3 | Black Friday job fair scenarios |
| **Geographic Distribution** | Global (English-speaking initially) | Start US, expand EU, APAC |
| **Real-Time Requirements** | No (async analysis acceptable) | 15–30 second latency OK |
| **Data Growth** | ~100K resumes by Month 12 | Each resume ~50KB average |

### Core Features (MVP)

**Critical for MVP:**
1. PDF resume upload + text extraction
2. AI skill extraction (via Claude API)
3. ATS score calculation
4. Job description matching
5. PDF report download

**Performance-Sensitive:**
- Resume text extraction (must handle 100+ page PDFs)
- Claude API calls (batching, caching opportunities)
- PDF report generation (background job)

**Not Critical for MVP:**
- Job recommendation API integration
- Recruiter marketplace
- Mobile app

---

## 2. Requirements Definition

### Performance Needs

**API Latency Budget:**

| Endpoint | p50 Target | p99 Target | Notes |
|----------|-----------|-----------|-------|
| POST /upload | 2s | 5s | File upload + initial parse |
| POST /analyze | 15s | 30s | Claude API calls (slowest part) |
| GET /results | 200ms | 500ms | Database query + formatting |
| GET /matches | 500ms | 1.5s | Job matching algorithm |
| GET /report/download | 2s | 5s | PDF generation on-demand |

**Throughput:**
- Launch (Month 1): 10 requests/sec
- Month 6: 100 requests/sec
- Year 1: 500 requests/sec
- Year 3: 2K requests/sec

**Data Processing:**
- Batch: No (analysis is on-demand, real-time expectation)
- Background jobs: Yes (PDF report generation, email notifications)

### Scalability Requirements

**Horizontal vs. Vertical:**
- **Month 1–6:** Vertical scaling acceptable (single server with multiple processes)
- **Month 6+:** Need horizontal scaling (load balancer + multiple backends)
- **Year 3:** Microservices or serverless strongly recommended

**Traffic Spikes:**
- Moderate spikes expected (Monday mornings, job fair events)
- 3–5x normal traffic during peak hours acceptable (queue jobs)
- Need auto-scaling or queue system for cost efficiency

**Data Growth:**
- Month 6: ~100K resumes (5GB storage)
- Year 1: ~500K resumes (25GB storage)
- Year 3: ~5M resumes (250GB storage)
- Solution: MongoDB Atlas auto-scaling or PostgreSQL with WAL archival

**Managed vs. DIY:**
- **Preference:** Managed services (Vercel, MongoDB Atlas, Render) to minimize ops burden
- **Budget:** Willing to pay ~$500–$2K/month for managed platforms
- **Ops headcount:** 0 for MVP (automated deployments + monitoring)

### Development Speed

**Time to Market:** 16 weeks to MVP (4-week infrastructure, 8-week features, 4-week QA + launch)

**Team Composition:**
- 1 full-stack engineer (you)
- Potential future: +1 frontend, +1 backend (if growth requires)
- Experience: Comfort with JavaScript, Python, or Go; new to others is OK

**Development Velocity:**
- Need rapid iteration (week-by-week pushes)
- Framework choice critical (avoid framework churn)
- Want ecosystem with tons of examples and tutorials

### Cost Considerations

**Total Budget (Year 1):**
- Development: $0 (founder-led)
- Hosting/Infrastructure: ~$6K–$12K
- Domain + misc: $500
- **Total:** ~$7K–$13K

**Cost Breakdown:**
- Frontend hosting (Vercel): $20/month (free tier scaling to Pro)
- Backend hosting (Render): $150–$300/month (grows with users)
- Database (MongoDB Atlas): $100–$500/month (grows with data)
- Claude API: $500–$2K/month (depends on usage)
- Monitoring + misc: $100/month
- **Year 1 monthly:** $1–3K (scaling to breakeven at 5K paid users)

**Optimization Opportunities:**
- Claude API caching (reduce costs by 20–30%)
- Database indexing + query optimization
- CDN for resume PDFs (CloudFront, Bunny)
- Serverless for report generation (AWS Lambda)

---

## 3. Proposed Tech Stack Options

---

### **Option 1: The Modern JavaScript Stack (Recommended for MVP)**

**Stack Name:** "JavaScript Everywhere — Build Fast, Optimize Later"

#### Full Stack Breakdown

| Layer | Technology | Version | Why Selected |
|-------|-----------|---------|--------------|
| **Frontend** | React + TypeScript | 18+ | Fast iteration, large ecosystem, great DX with TS |
| **Frontend Framework** | Next.js | 14+ | SSR, API routes, excellent for SaaS, deployed on Vercel |
| **Frontend Styling** | Tailwind CSS | 3.4+ | Rapid UI development, responsive by default |
| **Frontend State** | TanStack Query (React Query) | 5+ | Data fetching, caching, synchronization |
| **Backend** | Node.js + Express | 18+ LTS | JavaScript on backend, fast development |
| **Backend Framework** | Express with TypeScript | 4.18+ | Lightweight, flexible, mature |
| **Database** | MongoDB Atlas | Cloud | Document model suits resume data, auto-scaling |
| **Cache Layer** | Redis (Upstash) | 7+ | Session caching, Claude API response caching |
| **File Storage** | AWS S3 | Latest | Store resume PDFs, CloudFront for CDN |
| **PDF Generation** | PDFKit (Node.js) | Latest | Generate reports server-side |
| **AI Integration** | Claude API (Anthropic SDK) | Latest | Wrapper calls in Express backend |
| **Background Jobs** | Bull Queue (Redis-backed) | 4.x | Async report generation, emails |
| **Deployment (Frontend)** | Vercel | Latest | Optimized for Next.js, excellent DX |
| **Deployment (Backend)** | Render | Latest | Easy Node.js deployment, good free tier |
| **Database Hosting** | MongoDB Atlas | Cloud | Managed, auto-scaling, free tier available |
| **CI/CD** | GitHub Actions | Latest | Free, integrated, no additional setup |
| **Monitoring** | Sentry + LogRocket | Latest | Error tracking, performance monitoring |
| **Testing** | Vitest + React Testing Library | Latest | Fast, modern, great for React |

#### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│ Frontend (Next.js + React + Tailwind)                   │
│ Deployed on Vercel (Auto-scaling, CDN)                  │
│ Uses: /api/* routes for API calls                       │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTPS
                   ▼
┌─────────────────────────────────────────────────────────┐
│ Backend API (Node.js + Express + TypeScript)            │
│ Deployed on Render                                      │
│                                                          │
│ Routes:                                                  │
│   POST /api/auth/login                                  │
│   POST /api/resumes/upload → PDF parsing               │
│   POST /api/resumes/:id/analyze → Claude API           │
│   GET /api/resumes/:id/results → MongoDB query         │
│   POST /api/resumes/:id/matches → Job matching         │
│   GET /api/resumes/:id/report → PDFKit generation      │
│                                                          │
│ Background Jobs (Bull Queue + Redis):                   │
│   - Report PDF generation (off queue)                   │
│   - Email notifications                                 │
└──────────┬──────────────────────┬───────────────────────┘
           │                      │
           ▼                      ▼
    ┌─────────────────┐    ┌──────────────────┐
    │ MongoDB Atlas   │    │ Redis (Upstash)  │
    │ (Documents)     │    │ (Cache + Queues) │
    └─────────────────┘    └──────────────────┘
           │
           ▼
    ┌─────────────────┐
    │ AWS S3 + CDN    │
    │ (PDF Storage)   │
    └─────────────────┘

External Services:
├── Claude API (Anthropic) → AI analysis
├── Sentry → Error tracking
└── GitHub Actions → CI/CD
```

#### Why This Stack is Ideal for Your Project

**Best For:** Rapid MVP development, small team, quick iteration, cost-effective at small scale

**Strengths:**
1. **Single Language (JavaScript)** — No context switching; full-stack dev is natural
2. **Exceptional DX (Developer Experience):**
   - Hot module reload (HMR) in development
   - TypeScript for type safety without heavyweight
   - Huge ecosystem (npm: 2M+ packages)
   - Excellent tooling (VS Code, debugging, etc.)
3. **Fast Time-to-Market:**
   - Next.js eliminates boilerplate (routing, API routes, SSR)
   - Express is lightweight and flexible
   - Rich UI library ecosystem (Shadcn, Radix, Headless UI)
4. **Excellent Deployment:**
   - Vercel (built for Next.js): 1-click deployments, auto-scaling, free tier
   - Render (Node.js): Free tier covers MVP, scales affordably
5. **Cost-Effective:**
   - Free/cheap tiers for all services
   - Low operational overhead
   - No expensive infrastructure needed
6. **Large Community:**
   - Tons of tutorials and examples
   - Easy to hire JavaScript developers
   - Strong support ecosystem (Discord, forums)
7. **AI-Friendly:**
   - Anthropic SDK has excellent Node.js support
   - Easy to integrate Claude API
   - Good caching libraries

**Trade-offs:**
- **Concurrency Model:** Node.js event loop has limits (~1K concurrent connections per process); solved with horizontal scaling
- **Memory Overhead:** Node.js uses more memory than Go; acceptable for MVP
- **Not Ideal for CPU-Intensive:** PDF parsing could be bottleneck; mitigated with background jobs + Redis queue
- **Performance:** Good (100ms p50 easily achievable), not best-in-class

#### Costs (Monthly)

| Service | MVP (Month 1) | Month 6 | Year 1 Peak |
|---------|---------------|---------|-------------|
| Vercel Frontend | $0 | $20 | $20–50 |
| Render Backend | $7 | $25 | $75–150 |
| MongoDB Atlas | $0 | $50 | $200–500 |
| Upstash Redis | $10 | $20 | $30–50 |
| AWS S3 + CDN | $5 | $20 | $50–100 |
| Claude API | $100 | $500 | $1K–2K |
| Monitoring | $0 | $20 | $50 |
| **Total** | **$122** | **$655** | **$1,425–2,870** |

#### Real-World Examples
- Vercel itself (Next.js)
- Linear (YC company, high-growth)
- Supabase (PostgreSQL + real-time)
- Cal.com (scheduling app, Node.js backend)
- Shadcn/ui (component library)

#### Deployment Workflow

```
Local Development:
  npm run dev (Next.js frontend + Express backend)
  
Git Push to main:
  ↓
GitHub Actions CI:
  - Run tests
  - Linting (ESLint)
  - Type check (TypeScript)
  ↓
Auto Deploy:
  - Vercel redeploys frontend
  - Render redeploys backend
  - Database migrations (if any)
  ↓
Monitoring:
  - Sentry tracks errors
  - LogRocket captures user sessions (optional)
  ↓
Live! (takes ~2 minutes end-to-end)
```

---

### **Option 2: The Python + FastAPI Stack (Better for Data-Heavy, Long-Term)**

**Stack Name:** "Python for Power — Choose This if Building AI/ML-Heavy Product"

#### Full Stack Breakdown

| Layer | Technology | Version | Why |
|-------|-----------|---------|-----|
| **Frontend** | Next.js + React | 14+ | Same as Option 1 (frontend is framework-agnostic) |
| **Backend** | Python + FastAPI | 3.10+, 0.100+ | Modern async, fast, great for data/AI |
| **Backend Framework** | FastAPI with Pydantic | Latest | Type hints, auto OpenAPI docs, validation |
| **Database** | PostgreSQL (Supabase or RDS) | 15+ | Relational model better for complex queries, JSONB for resume data |
| **Cache Layer** | Redis (Upstash) | 7+ | Same as Option 1 |
| **File Storage** | AWS S3 | Latest | Same |
| **PDF Generation** | ReportLab or WeasyPrint | Latest | More powerful than Node.js options |
| **Background Jobs** | Celery + Redis | 5.x | Robust job queuing, distributed task processing |
| **Async Task Runner** | APScheduler or Celery Beat | Latest | Scheduled jobs, cron-like behavior |
| **Deployment (Frontend)** | Vercel | Latest | Same as Option 1 |
| **Deployment (Backend)** | Render or Railway | Latest | Docker container deployment |
| **CI/CD** | GitHub Actions | Latest | Same as Option 1 |
| **Testing** | pytest + pytest-asyncio | Latest | Industry standard for Python |
| **Monitoring** | Sentry + DataDog | Latest | Better Python support in DataDog |

#### Architecture Differences from Option 1

```
Frontend (Next.js) → Backend API (FastAPI, Python) → PostgreSQL + Redis
                          ↓
                    Celery Queue (Redis-backed)
                    Background Workers (Python)
                          ↓
                    PDF Generation, Emails, etc.
```

**Key Difference:** Celery provides enterprise-grade distributed task processing (Option 1's Bull Queue is simpler, less powerful).

#### Why Choose This Stack

**Best For:** Mature startups, medium teams, data-heavy applications, long-term scalability

**Strengths:**
1. **Python Ecosystem for AI/Data:**
   - NumPy, Pandas, Scikit-learn integration (future: add ML model)
   - Claude API has excellent Python support
   - Future: easy to add NLP models, embeddings
2. **FastAPI Performance:**
   - Comparable speed to Node.js (100–200 ms latency typical)
   - Modern async/await syntax (like JavaScript)
   - Auto-generates OpenAPI docs (Swagger UI for free)
3. **PostgreSQL Power:**
   - More flexible than MongoDB for complex queries
   - JSONB column type handles nested resume data
   - Excellent indexing and query optimization
4. **Celery for Scalability:**
   - Distributed task processing (can run workers on separate machines)
   - Better for long-running jobs (report generation, ML inference)
   - Retry logic, dead-letter queues, task monitoring
5. **Better for Long-Term:**
   - If you add ML models later (keyword extraction, skill embeddings), Python is natural
   - Larger dataset processing possible
   - More type safety with Pydantic

**Trade-offs:**
- More operational complexity (need to run Celery workers)
- Python async has learning curve (for some developers)
- PostgreSQL requires more schema planning upfront
- Slightly slower development iteration than Node.js

#### Costs (Monthly)

| Service | MVP | Month 6 | Year 1 Peak |
|---------|-----|---------|-------------|
| Vercel Frontend | $0 | $20 | $20–50 |
| Render Backend | $12 | $50 | $150–300 |
| PostgreSQL (Supabase) | $25 | $100 | $200–500 |
| Redis + Celery | $15 | $30 | $50–100 |
| AWS S3 | $5 | $20 | $50–100 |
| Claude API | $100 | $500 | $1K–2K |
| Monitoring | $0 | $20 | $50 |
| **Total** | **$157** | **$740** | **$1,520–3,100** |

#### Real-World Examples
- Instagram (Django/Python backend, though recently modernizing)
- Spotify (Python microservices for data)
- Dropbox (Python backend for sync)
- Stripe (Python in backend services)
- Netflix (Python for ML/data)

---

### **Option 3: The Go + Next.js Stack (Maximum Performance, Higher Complexity)**

**Stack Name:** "Go for Scale — Only Choose If You Know You'll Hit Traffic Limits"

#### Full Stack Breakdown

| Layer | Technology | Version | Why |
|-------|-----------|---------|-----|
| **Frontend** | Next.js + React | 14+ | Same as all options |
| **Backend** | Go + Gin Web Framework | 1.21+, 1.7+ | Ultra-fast, compiled, great concurrency |
| **Database** | PostgreSQL | 15+ | Relational + JSONB, same as Option 2 |
| **Cache Layer** | Redis | 7+ | Same |
| **File Storage** | AWS S3 | Latest | Same |
| **PDF Generation** | go-pdf or native libs | Latest | Fast PDF rendering |
| **Task Queue** | go-task or Bull (Node.js adapter) | Latest | Simple queue or integrate Node.js Bull |
| **Deployment** | Docker + Render/Railway | Latest | Go compiles to single binary; very portable |
| **CI/CD** | GitHub Actions | Latest | Same |
| **Testing** | testing (Go stdlib) + Testify | Latest | Go's standard testing library |

#### Why This Stack

**Best For:** High-performance systems, teams with Go experience, capacity constraints at scale

**Strengths:**
1. **Extreme Performance:**
   - Single binary deployment (no runtime needed)
   - Minimal memory overhead (~10MB per instance)
   - Handles 10K+ concurrent connections easily
   - 10–50x faster than Node.js for CPU-intensive tasks
2. **Concurrency Model:**
   - Goroutines are lightweight; can spawn millions
   - Channels for communication (elegant, safe)
   - Built-in parallelism (standard library)
3. **Deployment Simplicity:**
   - Compiled binary = no runtime dependencies
   - Single file deployment
   - Easy container/Docker usage
4. **Cost-Efficient at Scale:**
   - Much smaller infrastructure footprint
   - Vertical scaling works longer
   - Lower hosting bills at high traffic

**Trade-offs:**
- **Development Speed:** Slower than JavaScript/Python (type system is stricter)
- **Learning Curve:** Go syntax and concurrency model take time
- **Ecosystem:** Smaller than JavaScript/Python (but growing)
- **Hiring:** Harder to find Go developers
- **AI Integration:** Claude API support is good but ecosystem is smaller

#### Costs (Monthly)

| Service | MVP | Month 6 | Year 1 Peak |
|---------|-----|---------|-------------|
| Vercel Frontend | $0 | $20 | $20–50 |
| Render Backend | $7 | $20 | $30–50 |
| PostgreSQL | $25 | $100 | $200–500 |
| Redis | $10 | $20 | $30–50 |
| AWS S3 | $5 | $20 | $50–100 |
| Claude API | $100 | $500 | $1K–2K |
| Monitoring | $0 | $20 | $50 |
| **Total** | **$147** | **$700** | **$1,380–2,800** |

**Advantage:** Cheaper hosting due to lower resource consumption.

#### Real-World Examples
- Uber (Go for backend services)
- Docker (obviously)
- Kubernetes (written in Go)
- Twitch (Go in backend)
- CloudFlare (Go for edge computing)

---

## 4. Detailed Comparison

| Criteria | Option 1: Node.js/React | Option 2: Python/FastAPI | Option 3: Go/Next.js |
|----------|-------------------------|-------------------------|----------------------|
| **Development Speed** | ★★★★★ Fastest | ★★★★ Fast | ★★★ Slower |
| **Time to MVP** | 16 weeks | 18 weeks | 20 weeks |
| **Performance (p50 latency)** | ~100ms | ~80ms | ~20ms |
| **Scalability** | ★★★★ Good | ★★★★★ Excellent | ★★★★★ Excellent |
| **Max Concurrent Users (1 machine)** | 1K | 2K | 5K+ |
| **Memory/Instance** | ~200MB | ~150MB | ~30MB |
| **Learning Curve** | ★★★ Moderate | ★★★ Moderate | ★★★★ Steep |
| **Ecosystem Size** | ★★★★★ Massive | ★★★★ Large | ★★★ Focused |
| **Hiring Difficulty** | ★★ Easy | ★★★ Moderate | ★★★★ Hard |
| **Operational Overhead** | ★★ Low | ★★★ Moderate | ★★★ Moderate |
| **AI/ML Friendly** | ★★★ Okay | ★★★★★ Excellent | ★★ Limited |
| **Data Processing** | ★★★ Okay | ★★★★★ Excellent | ★★★★ Very Good |
| **Cost (Year 1)** | $7K–13K | $8K–14K | $7K–13K |
| **Cost (Year 3, 10K DAU)** | $30K–50K | $25K–40K | $15K–25K |
| **Best For** | **Startups, Rapid MVP** | **Data-Heavy, Long-term** | **High-Performance, Scale-First** |
| **Gotchas** | Memory usage, event loop limits | Async complexity, ops | Learning curve, small ecosystem |

---

## 5. Final Architecture Recommendation

### **RECOMMENDED: Option 1 — JavaScript Stack (Node.js + React + Next.js)**

**Why This is the Right Choice for Your Project:**

#### 1. **Time to Market is Critical**
- You have 16 weeks to MVP
- JavaScript stack has 2–3 week advantage over alternatives
- Vercel + Render deployments are 1-click (not 10-step DevOps)

#### 2. **Solo Developer (You) Needs Maximum Productivity**
- JavaScript everywhere = no context switching
- Massive ecosystem = answers to every problem already exist
- Community is huge = tutorials, templates, examples everywhere
- DX is unbeatable = HMR, type safety, debugging tools

#### 3. **Cost is Tight**
- Free/cheap tiers on Vercel, Render, MongoDB Atlas
- Can launch entire product for <$150/month
- Scales affordably up to 100K users
- No expensive infrastructure needed

#### 4. **Deployment Simplicity**
- Vercel handles frontend (git push = deployed)
- Render handles backend (simple Docker)
- CI/CD is automatic via GitHub Actions
- 0 DevOps required for MVP

#### 5. **Claude API Integration**
- Anthropic SDK has excellent Node.js support
- Easy to call and cache responses
- Monitoring and error handling are straightforward

#### 6. **Future-Proof**
- JavaScript ecosystem keeps evolving
- If you add features later (job API, mobile app), ecosystem supports it
- Easy to hire additional developers

#### 7. **Risk Mitigation**
- If requirements change, pivoting is fast
- Can always migrate to Python/Go later if needed
- Learn-as-you-go is acceptable

### **Backup Choice: Option 2 (Python) — Only If**
- You plan to add ML models (embeddings, NLP)
- Data processing becomes bottleneck
- Need to handle 1M+ resumes with complex queries
- Are comfortable with Celery + async workers ops

### **Not Recommended for MVP: Option 3 (Go)**
- Go has steeper learning curve (unless you already know it)
- Added complexity not justified at small scale
- Benefits only appear at 10K+ concurrent users
- Hire Go developers later if Go benefits materialize

---

## 6. Detailed Setup Plan (Option 1)

### Project Structure

```
resume-analyzer/
├── frontend/                    # Next.js app
│   ├── app/                    # App router (Next.js 13+)
│   │   ├── page.jsx            # Home page
│   │   ├── upload/             # Upload page
│   │   ├── results/            # Results page
│   │   ├── matches/            # Job matches
│   │   ├── dashboard/          # User dashboard
│   │   └── api/                # Route handlers
│   ├── components/             # React components
│   ├── lib/                    # Utilities
│   ├── styles/                 # Tailwind CSS
│   ├── package.json
│   └── next.config.js
│
├── backend/                     # Node.js + Express
│   ├── src/
│   │   ├── server.js           # Express entry point
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── resumes.js
│   │   │   └── jobs.js
│   │   ├── controllers/
│   │   ├── services/
│   │   │   ├── claude-service.js
│   │   │   ├── pdf-parser.js
│   │   │   └── job-matcher.js
│   │   ├── models/             # MongoDB schemas
│   │   ├── middleware/
│   │   ├── queues/             # Bull job definitions
│   │   ├── config/
│   │   └── utils/
│   ├── package.json
│   └── Dockerfile
│
├── .github/workflows/          # CI/CD
│   └── deploy.yml
│
└── README.md
```

### Dependencies (Option 1)

**Frontend (Next.js):**
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "typescript": "^5.2.0",
    "tailwindcss": "^3.4.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.6.0",
    "react-hot-toast": "^2.4.0"
  }
}
```

**Backend (Node.js):**
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "typescript": "^5.2.0",
    "dotenv": "^16.3.0",
    "mongoose": "^7.5.0",
    "axios": "^1.6.0",
    "@anthropic-ai/sdk": "^0.11.0",
    "multer": "^1.4.5-lts.1",
    "pdf-parse": "^1.1.1",
    "pdfkit": "^0.13.0",
    "bull": "^4.11.0",
    "redis": "^4.6.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.1.0"
  }
}
```

### Database Schema (MongoDB)

```javascript
// User
{
  _id: ObjectId,
  email: string,
  password: string (hashed),
  createdAt: Date,
  updatedAt: Date,
  subscription: 'free' | 'pro'
}

// Resume
{
  _id: ObjectId,
  userId: ObjectId,
  fileName: string,
  uploadedAt: Date,
  extractedText: string,
  skills: [],
  atsScore: number,
  analysisId: ObjectId
}

// AnalysisResult
{
  _id: ObjectId,
  resumeId: ObjectId,
  userId: ObjectId,
  skills: {
    programming: [],
    frameworks: [],
    databases: [],
    soft: []
  },
  atsScore: number,
  atsBreakdown: {},
  missingSkills: [],
  recommendations: [],
  createdAt: Date
}

// Job
{
  _id: ObjectId,
  title: string,
  description: string,
  requiredSkills: [],
  niceToHaveSkills: [],
  industry: string,
  level: string
}
```

---

## 7. Implementation Roadmap (Option 1)

### Phase 1: Infrastructure & Setup (Weeks 1-2)
- [ ] Create Next.js project
- [ ] Set up Express backend
- [ ] MongoDB Atlas connection
- [ ] Redis (Upstash) setup
- [ ] Environment variables (.env)
- [ ] GitHub Actions CI/CD pipeline
- [ ] Deploy skeleton to Vercel + Render

### Phase 2: Core Features (Weeks 3-6)
- [ ] User authentication (JWT)
- [ ] Resume upload endpoint + pdf-parse
- [ ] Claude API integration (skill extraction + ATS scoring)
- [ ] MongoDB storage
- [ ] Results page (display analysis)
- [ ] Job matching logic

### Phase 3: Frontend (Weeks 7-10)
- [ ] Landing page (design from DESIGN.md)
- [ ] Upload page (drag-drop, preview)
- [ ] Results dashboard
- [ ] Job matches view
- [ ] User account/dashboard

### Phase 4: Polish & Reports (Weeks 11-14)
- [ ] PDF report generation (PDFKit)
- [ ] Background jobs (Bull queue)
- [ ] Error handling + validation
- [ ] UI/UX polish (Tailwind refinements)
- [ ] Testing (unit + integration)

### Phase 5: Launch Prep (Weeks 15-16)
- [ ] Final QA
- [ ] Performance testing
- [ ] Security review
- [ ] Documentation
- [ ] Public launch

---

## 8. Deployment & DevOps (Option 1)

### Frontend Deployment (Vercel)

```bash
# 1. Push to GitHub
git push origin main

# 2. Vercel auto-deploys via GitHub Actions
# Automatic steps:
#   - npm run build
#   - Deploy to Vercel CDN
#   - Preview URL + production domain
```

### Backend Deployment (Render)

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY src ./src
EXPOSE 5000
CMD ["npm", "run", "start"]
```

```bash
# Deploy:
# 1. Push to GitHub
# 2. Render auto-detects Dockerfile
# 3. Builds and deploys image
# 4. Auto-scales based on CPU/memory
```

### Environment Variables

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

**Backend (.env):**
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
REDIS_URL=redis://...
CLAUDE_API_KEY=sk-ant-...
JWT_SECRET=your-secret-key
S3_BUCKET=your-bucket
AWS_REGION=us-east-1
```

---

## 9. Monitoring & Observability (Option 1)

### Error Tracking (Sentry)

```javascript
// Backend
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Logging (Console + Papertrail optional)

```javascript
// Simple logging
const logger = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${msg}`)
};
```

### Performance (Lighthouse CI)

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: treosh/lighthouse-ci-action@v9
```

---

## 10. Security Best Practices (Option 1)

- [ ] Use HTTPS everywhere (automatic on Vercel/Render)
- [ ] Validate all inputs (Express middleware)
- [ ] Hash passwords with bcryptjs (cost: 10+)
- [ ] Use JWT with expiration (15m access, 7d refresh)
- [ ] Rate limit API endpoints (express-rate-limit)
- [ ] CORS properly configured
- [ ] SQL injection N/A (using MongoDB, but still validate)
- [ ] CSRF tokens for forms (if needed)
- [ ] Keep dependencies updated (dependabot)
- [ ] Don't commit .env files (use .env.example)

---

## 11. Key Decision Points

**Q1: Should I use MongoDB or PostgreSQL?**
- **MongoDB (Option 1):** Better for resume document data, more flexible schema
- **PostgreSQL (Option 2):** Better if you need complex queries later, more type-safe

**Recommendation:** Start with MongoDB (Option 1) for flexibility. Can migrate to PostgreSQL later if needed.

---

**Q2: Node.js or Python for backend?**
- **Node.js:** Faster development, easier deployment, better for small teams
- **Python:** Better if adding ML/NLP later, better data processing

**Recommendation:** Node.js for MVP. Migrate to Python if data becomes bottleneck or you add ML.

---

**Q3: Should I use TypeScript?**
- **Yes.** It takes 5% more dev time but saves 50% of debugging time.
- Catches errors at compile time, not production.
- Essential for solo developer (you have to be your own QA).

**Recommendation:** Use TypeScript from day 1.

---

**Q4: Serverless (AWS Lambda) vs. Traditional Servers?**
- **Lambda:** More cost-effective at very small scale, but colder starts (bad for 15-second analyses)
- **Traditional (Render):** Cheaper for your use case, simpler ops

**Recommendation:** Render (traditional servers) for MVP. Consider Lambda later for report generation jobs.

---

## 12. Final Checklist Before Starting

- [ ] Accounts created: GitHub, Vercel, Render, MongoDB Atlas, Redis (Upstash), AWS (S3)
- [ ] Environment variables documented (.env.example)
- [ ] Project scaffolding: `npx create-next-app@latest` + `npm init` for backend
- [ ] TypeScript configured
- [ ] Tailwind CSS installed and configured
- [ ] `.gitignore` includes node_modules, .env
- [ ] GitHub repo created and cloned locally
- [ ] First commit: "Initial project setup"
- [ ] GitHub Actions CI/CD pipeline created
- [ ] Vercel + Render connected to GitHub

---

## Summary

### **Recommendation: Option 1 (JavaScript Stack) ✅**

**Why:**
- Fastest time to MVP (16 weeks)
- Lowest cost ($7K–13K Year 1)
- Best for solo developer
- Easiest deployment + monitoring
- Largest community for help

**Alternative:** Option 2 (Python) if you plan to add ML features later.

**Not Recommended:** Option 3 (Go) for MVP.

---

**Ready to proceed?** Let me know if you want me to:
1. Walk through initial setup steps
2. Provide detailed API specification
3. Create database schema SQL/MongoDB design
4. Set up GitHub Actions CI/CD pipeline
5. Create a sample "Hello World" backend + frontend

---

**Tech Stack Sign-Off:**

| Role | Approval | Date |
|------|----------|------|
| Architect | ✅ Recommend Option 1 | April 23, 2026 |
| Product Manager | ⏳ Pending | TBD |
| Lead Engineer | ⏳ Pending | TBD |
