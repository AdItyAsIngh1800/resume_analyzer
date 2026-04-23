# Resume Analyzer — Project TODO

> Tasks are sequential. Complete each before starting the next. Mark with `[x]` when done.

---

## Phase 1 — Infrastructure (Week 1)

- [x] **#1** Setup `.env` and MongoDB connection
- [x] **#2** Create User model and schema
- [x] **#3** Create auth routes (register & login)
- [x] **#4** Create JWT middleware
- [x] **#5** Test authentication endpoints 

---

## Phase 2a — Resume Processing (Week 2)

- [x] **#6** Create Resume model and schema
- [x] **#7** Create resume upload endpoint with multer
- [x] **#8** Integrate pdf-parse for text extraction
- [x] **#9** Test PDF upload and extraction

---

## Phase 2b — AI Integration (Week 3)

- [x] **#10** Create AnalysisResult model and schema
- [x] **#11** Create AI service — skill extraction
- [x] **#12** Create AI service — ATS scoring
- [x] **#13** Create AI service — missing skills analysis
- [x] **#14** Create analysis endpoint
- [x] **#15** Test AI integration
- [x] **#15b** Switch from Gemini API → Ollama local model (no rate limits)

---

## Phase 2c — Job Matching (Week 4)

- [x] **#16** Create Job model and schema
- [x] **#17** Seed sample jobs (20–30)
- [x] **#18** Create job matching algorithm
- [x] **#19** Create matches endpoint
- [x] **#20** Test job matching

---

## Phase 2d — Reports (Week 4 end)

- [x] **#21** Create PDF report generation service
- [x] **#22** Create report download endpoint

---

## Phase 2e — Backend Polish

- [x] **#23** Create error handling middleware
- [x] **#24** Add input validation to all endpoints

---

## Phase 3 — Frontend (Weeks 5–7)

- [x] **#25** Create Home / Landing page
- [x] **#26** Create Auth pages (register & login forms)
- [x] **#27** Create Upload page with drag-and-drop
- [x] **#28** Create Results page with skill display
- [x] **#29** Create ATS score visualization component
- [x] **#30** Create Job Matches page
- [x] **#31** Create User Dashboard page
- [x] **#32** Create Header / Navigation component
- [x] **#33** Setup Next.js router navigation
- [x] **#34** Setup Zustand state management
- [x] **#35** Create API utility functions
- [x] **#36** Add loading states throughout UI
- [x] **#37** Add error boundaries and error display

---

## Phase 4a — Testing & QA (Week 8)

- [x] **#38** Write backend unit tests (48 tests — `backend/tests/unit/`)
- [x] **#39** Write backend integration tests (23 tests — `backend/tests/integration/`)
- [x] **#40** Manual QA — authentication flow (checklist: `docs/QA-CHECKLIST.md`)
- [x] **#41** Manual QA — resume upload and parsing (checklist)
- [x] **#42** Manual QA — analysis and results display
- [x] **#43** Manual QA — job matching (checklist)
- [x] **#44** Manual QA — mobile responsiveness (checklist)

---

## Phase 4b — Optimization & Security (Week 9)

- [ ] **#45** Performance testing and optimization
- [ ] **#46** Security audit and fixes

---

## Phase 4c — CI/CD & Deployment (Week 9 end)

- [ ] **#47** Setup GitHub Actions CI/CD
- [ ] **#48** Deploy backend to production
- [ ] **#49** Deploy frontend to Vercel

---

## Phase 4d — Monitoring & Documentation (Week 10)

- [ ] **#50** Setup monitoring and logging
- [ ] **#51** Create portfolio demo script

---

## Progress

| Phase | Done | Total |
|-------|------|-------|
| Phase 1 — Infrastructure | 5 | 5 |
| Phase 2a — Resume Processing | 4 | 4 |
| Phase 2b — AI Integration (Ollama) | 7 | 7 |
| Phase 2c — Job Matching | 5 | 5 |
| Phase 2d — Reports | 2 | 2 |
| Phase 2e — Backend Polish | 2 | 2 |
| Phase 3 — Frontend | 13 | 13 |
| Phase 4a — Testing & QA | 7 | 7 |
| Phase 4b — Optimization & Security | 0 | 2 |
| Phase 4c — CI/CD & Deployment | 0 | 3 |
| Phase 4d — Monitoring & Documentation | 0 | 2 |
| **Total** | **45** | **52** |
