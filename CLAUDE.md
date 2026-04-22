# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Resume Analyzer + Job Match Platform** — An AI-powered web application that analyzes resumes using Claude API, calculates ATS scores, identifies skill gaps, and recommends matching jobs.

**Portfolio Value:** Demonstrates full-stack development (React + Node.js), NLP with Claude API, real-world hiring domain knowledge, and production-quality code.

---

## Tech Stack

- **Frontend:** React (Vite) + React Router + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB (Atlas for production, local for development)
- **AI:** Claude API (skill extraction, ATS scoring, recommendations)
- **PDF Processing:** pdf-parse (upload), pdfkit (report generation)
- **Authentication:** JWT tokens
- **Deployment:** Vercel (frontend), Render/Railway (backend)

---

## Project Structure

```
resume-analyzer/
├── backend/
│   ├── server.js                 # Express app entry point
│   ├── package.json
│   ├── .env.example
│   ├── config/
│   │   └── database.js           # MongoDB connection
│   ├── models/
│   │   ├── User.js
│   │   ├── Resume.js
│   │   ├── AnalysisResult.js
│   │   └── Job.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── resumes.js            # Upload, analyze endpoints
│   │   └── jobs.js               # Job matching endpoints
│   ├── services/
│   │   ├── claude-service.js     # All Claude API calls (CRITICAL)
│   │   ├── job-matcher.js        # Matching algorithm
│   │   └── report-generator.js   # PDF generation
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   └── errorHandler.js
│   ├── data/
│   │   └── sample-jobs.json      # Mock job database
│   └── utils/
│       └── validators.js
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Landing page
│   │   │   ├── Upload.jsx        # Resume upload & preview
│   │   │   ├── Results.jsx       # Analysis results display
│   │   │   ├── JobMatches.jsx    # Job recommendations
│   │   │   └── Dashboard.jsx     # User history
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── SkillCard.jsx     # Skill display component
│   │   │   ├── JobCard.jsx       # Job match display
│   │   │   ├── ATSScore.jsx      # ATS visualization
│   │   │   └── LoadingState.jsx
│   │   ├── utils/
│   │   │   ├── api.js            # Axios/fetch wrapper for backend calls
│   │   │   └── formatters.js
│   │   └── styles/
│   │       └── globals.css
│   ├── package.json
│   ├── .env.example
│   └── vite.config.js
│
└── README.md                     # Portfolio documentation
```

---

## Development Commands

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env              # Configure: MONGODB_URI, CLAUDE_API_KEY
npm run dev                       # Start dev server (port 5000)
npm test                          # Run tests
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env              # Configure: VITE_API_URL=http://localhost:5000
npm run dev                       # Start dev server (port 5173)
npm run build                     # Production build
```

### Full Stack Development
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Visit http://localhost:5173
```

### Database Setup
```bash
# Local MongoDB (if using)
mongod

# Or use MongoDB Atlas connection string in .env
```

---

## Core Architecture

### Key Data Flow
```
User uploads PDF
    ↓
backend/POST /api/resumes/upload
    ↓
pdf-parse extracts text
    ↓
Store Resume document in MongoDB
    ↓
backend/POST /api/resumes/:id/analyze
    ↓
Claude Service makes 3 parallel API calls:
    • Skill extraction
    • ATS score calculation
    • Missing skills identification
    ↓
Store AnalysisResult in MongoDB
    ↓
backend/GET /api/resumes/:id/matches
    ↓
Job Matcher algorithm ranks jobs
    ↓
Frontend displays all results
    ↓
User downloads PDF report
```

### Critical Files (Most Important)

**`backend/services/claude-service.js`** — Heart of the AI analysis
- Implements 4 Claude API prompts:
  1. Skill extraction (returns JSON with skill categories)
  2. ATS score (0-100 with actionable feedback)
  3. Missing skills (context-aware gaps for role progression)
  4. Job ranking (explains why jobs match extracted skills)
- All prompts should return structured JSON for consistency
- Use prompt caching to reduce costs on repeated analyses

**`backend/services/job-matcher.js`** — Matching algorithm
- Calculates: (skills ∩ required) / required = match %
- Filters jobs >60% match
- Integrates with Claude for intelligent ranking
- Returns top 10 matches sorted by score

**`backend/models/Resume.js`** — Resume schema
- Fields: userId, fileName, uploadedAt, extractedText, fileUrl
- Relations: hasOne AnalysisResult, hasMany matches

**`backend/models/AnalysisResult.js`** — Analysis schema
- Stores: skills[], atsScore, missingSkills[], jobMatches[]
- Links to Resume via resumeId
- Used for both display and report generation

**`frontend/pages/Results.jsx`** — Main analysis display
- Shows: extracted skills (by category), ATS score with feedback, missing skills
- Triggers job matching on mount
- Links to download report

---

## Important Implementation Notes

### Claude API Integration
- **Prompt Format:** Always structure prompts to return JSON when querying for structured data
- **Caching:** Use prompt caching (available in claude-3.5 and above) to reduce costs when analyzing similar resumes
- **Error Handling:** Gracefully handle API errors, show user-friendly messages
- **Rate Limiting:** Implement to avoid hitting rate limits (especially important for portfolio at higher traffic)

### PDF Handling
- **Upload:** Use multer middleware with file size limits (5MB max)
- **Parsing:** pdf-parse handles most PDFs, but test with various formats
- **Report Generation:** Use pdfkit or html-to-pdf for clean formatting with styling

### Job Database
- **Mock Data:** Seed 20-30 sample jobs in `/backend/data/sample-jobs.json`
- **Job Schema:** Must include requiredSkills array for matching algorithm
- **Update Path:** When ready for real data, replace sample-jobs.json with API integration

### UI/UX Priorities
- **Loading States:** Show during PDF upload, analysis, and report generation
- **Error Boundaries:** Catch and display errors gracefully on frontend
- **Mobile Responsive:** Ensure works on mobile (important for portfolio demo)
- **Color Coding:** Green (>80% match), Yellow (50-80%), Red (<50%)

---

## Development Sequence (What to Build First)

**Phase 1 (Days 1-2):** Infrastructure
1. Backend: Express server + MongoDB connection
2. Frontend: React app with basic routing
3. Claude service with prompt templates

**Phase 2 (Days 3-4):** Resume Processing
1. PDF upload endpoint + middleware
2. Text extraction with pdf-parse
3. Frontend upload component

**Phase 3 (Days 5-6):** Analysis
1. Implement all 4 Claude prompts
2. Analysis endpoint
3. Results display page

**Phase 4 (Days 7-8):** Job Matching
1. Mock jobs in MongoDB
2. Matching algorithm
3. Job display UI

**Phase 5 (Days 9-10):** Report & Polish
1. PDF report generation
2. UI refinement
3. Error handling

**Phase 6 (Days 11-14):** Deploy
1. Environment setup
2. Deploy to Vercel + Render/Railway
3. Documentation + demo script

---

## API Endpoints

### Resume Management
```
POST   /api/auth/register          # User signup
POST   /api/auth/login             # User login
POST   /api/resumes/upload         # Upload & extract PDF
POST   /api/resumes/:id/analyze    # Trigger analysis (calls Claude)
GET    /api/resumes/:id            # Get resume details
GET    /api/resumes                # List user's resumes
```

### Analysis & Matching
```
GET    /api/resumes/:id/analysis   # Get analysis results
GET    /api/resumes/:id/matches    # Get job matches
GET    /api/resumes/:id/report     # Download PDF report
```

### Job Management (Optional Admin)
```
GET    /api/jobs                   # List all jobs (for matching)
POST   /api/jobs                   # Add job (admin only)
```

---

## Testing & QA

### Manual Testing Checklist
- [ ] Register user → stored in DB with hashed password
- [ ] Upload resume PDF → text extracted correctly
- [ ] Analyze resume → skills, ATS, missing skills returned
- [ ] View results → all data displayed correctly
- [ ] Match jobs → jobs ranked >60% match
- [ ] Download report → PDF generated with all data
- [ ] Try invalid PDF → graceful error message
- [ ] Test on mobile → responsive design works

### Sample Test Resumes
- Create 2-3 sample resumes in `/backend/data/sample-resumes/` for testing
- Include: Software Engineer, Data Scientist, Product Manager versions

---

## Common Tasks

### Add a New Claude Prompt
1. Edit `backend/services/claude-service.js`
2. Add new function: `async analyzeX(resumeText) { ... }`
3. Return structured JSON
4. Add to Analysis endpoint in `backend/routes/resumes.js`
5. Update frontend Results page to display new data

### Change Job Matching Logic
1. Edit `backend/services/job-matcher.js`
2. Test with sample resumes
3. Adjust threshold (currently >60%) if needed
4. Update job card display if showing new fields

### Deploy to Production
1. Set environment variables in Vercel (frontend) and Render (backend)
2. Use MongoDB Atlas connection string
3. Test full flow after deployment
4. Update README with live demo link

---

## Portfolio Demo Script

1. **Show Home Page** — Explain: resume analysis + job matching
2. **Upload Sample Resume** — Show extraction working (emphasize Claude)
3. **View Results** — Walk through:
   - Extracted skills (organized by category)
   - ATS score with specific improvements needed
   - Missing skills with learning path
4. **Job Matches** — Show:
   - Ranked list with match %
   - Why each job is recommended
   - Skill gaps for each role
5. **Download Report** — Generate and show PDF
6. **Tech Deep Dive:**
   - Claude prompts enable intelligent analysis (not just regex)
   - Job matching considers skill transferability
   - Full stack with real database
7. **Ask:** "How would you improve this?" (shows growth mindset)

---

## Performance Considerations

- **Resume Parsing:** pdf-parse is fast but test with large PDFs (10+ pages)
- **Claude API:** 3 parallel calls per resume (~15 seconds total)
- **Job Matching:** Linear algorithm, fine for <1000 jobs
- **Database:** Index resumeId, userId for fast queries
- **Caching:** Consider caching job matches (valid for 24h)

---

## Security Checklist

- [ ] JWT tokens have expiration (15m access, 7d refresh)
- [ ] Password hashing with bcrypt (rounds: 10+)
- [ ] Rate limiting on upload endpoint (prevent abuse)
- [ ] Input validation on all endpoints
- [ ] PDF size limit enforced (5MB max)
- [ ] Never log API keys or tokens
- [ ] CORS properly configured
- [ ] Use HTTPS in production

---

## Known Limitations & Future Improvements

**Current (MVP):**
- ✅ Mock job data (fixed 20-30 jobs)
- ✅ Email authentication (no social login)
- ✅ Single resume per analysis

**Future Enhancements:**
- Real job API integration (LinkedIn, Indeed, Upwork)
- User profile optimization over time
- Skill learning recommendations with resources
- Resume version comparison
- Team/admin dashboard
- Webhook notifications for job matches
- Advanced filters (location, salary, remote)

---

## Resources

- **Claude API Docs:** https://anthropic.com/docs
- **pdf-parse:** https://www.npmjs.com/package/pdf-parse
- **pdfkit:** http://pdfkit.org/
- **MongoDB Docs:** https://docs.mongodb.com/
- **React Router:** https://reactrouter.com/
- **Express Guide:** https://expressjs.com/

---

## Questions to Ask Yourself During Development

1. **Claude Prompts:** Do my prompts return consistent, parseable JSON?
2. **Skill Extraction:** Does it catch all skills (technical, soft, certifications)?
3. **ATS Score:** Are the improvement suggestions actionable?
4. **Job Matching:** Does the algorithm consider transferable skills?
5. **UI/UX:** Would a recruiter find this useful in a real scenario?
6. **Error Handling:** What happens if Claude API is down or returns unexpected data?

Good luck building! This is a strong portfolio project. 🚀
