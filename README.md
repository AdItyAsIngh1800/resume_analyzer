# Resume Analyzer

An AI-powered SaaS platform that helps job seekers optimize their resumes for ATS (Applicant Tracking Systems) and discover job matches.

## 📁 Project Structure

```
Resume Analyzer/
├── frontend/              # Next.js React application
│   ├── public/           # Static files
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Next.js pages
│   │   ├── styles/       # CSS modules
│   │   └── utils/        # Utility functions
│   └── package.json
│
├── backend/               # Node.js Express API
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── models/       # MongoDB schemas
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/   # Express middleware
│   │   ├── utils/        # Helper functions
│   │   └── index.js      # Server entry point
│   ├── config/           # Configuration files
│   └── package.json
│
├── python-service/        # Python FastAPI service
│   ├── src/              # Service code
│   ├── models/           # ML/analysis models
│   ├── tests/            # Tests
│   └── requirements.txt   # Dependencies
│
├── docs/                 # Documentation
├── scripts/              # Utility scripts
└── .github/workflows/    # CI/CD workflows
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Python 3.9+
- Anthropic API key

### Setup

1. **Clone and install:**
```bash
npm install  # install backend
cd frontend && npm install
cd ../python-service && pip install -r requirements.txt
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. **Start development servers:**
```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Python service
cd python-service && uvicorn src.main:app --reload
```

## 🏗️ Architecture

- **Frontend:** Next.js 14 + React 18 + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + MongoDB + JWT Auth
- **AI:** Claude API for resume analysis
- **Payments:** Stripe for subscriptions
- **Deployment:** Vercel (frontend) + Render (backend)

## 📚 Documentation

- [CLAUDE.md](./CLAUDE.md) - Development guide
- [PRD.md](./PRD.md) - Product requirements
- [DESIGN.md](./DESIGN.md) - Design system
- [TECH_STACK.md](./TECH_STACK.md) - Technology decisions
- [ROADMAP.md](./ROADMAP.md) - 16-week implementation plan

## 🔑 Key Features (MVP)

- 📄 Resume upload and parsing
- 🤖 AI-powered ATS analysis
- 💡 Skill extraction and recommendations
- 🎯 Job matching with LinkedIn
- 📊 Results dashboard
- 📥 PDF report download

## 📊 Project Status

- Planning: ✅ 100% Complete
- Development: 🟡 In Progress (Week 1)
- Launch: ❌ Not started

## 📝 License

MIT

---

**Start Date:** April 23, 2026  
**Target Launch:** July 2026 (16 weeks)
