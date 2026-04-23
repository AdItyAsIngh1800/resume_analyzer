# Manual QA Checklist — Phase 4a

Run through each scenario end-to-end with backend + frontend + Ollama running.
Mark `[x]` when verified. Record notes for anything flaky or broken.

**Setup:**
```bash
docker compose up -d
brew services start ollama
cd backend && npm run dev          # :8080
cd frontend && npm run dev          # :3000
cd backend && node scripts/seed-jobs.js
```

---

## #40 — Authentication Flow

### Register
- [ ] Register form accepts valid name + email + 8-char password → redirects to dashboard
- [ ] Form shows inline error for empty required fields
- [ ] Form shows inline error for invalid email (`foo`, `foo@`, `foo@bar`)
- [ ] Form shows inline error for password < 8 chars
- [ ] Registering with existing email returns 409 and surfaces a readable error
- [ ] Token is stored (Zustand) and persists across page reloads
- [ ] Password field is type=password (not visible)

### Login
- [ ] Valid credentials → redirect to dashboard
- [ ] Wrong password → 401 error shown in UI, no token set
- [ ] Unknown email → 401 error shown (no user enumeration leak)
- [ ] Malformed email blocked client-side before submit
- [ ] `Enter` key submits the form

### Protected routes
- [ ] Visiting `/dashboard`, `/upload`, `/resumes/:id` without a token redirects to `/login`
- [ ] After login, user is returned to the page they tried to visit (if implemented)
- [ ] `GET /api/auth/me` returns current user for valid token
- [ ] Manually tampering the JWT in localStorage → next API call → 401 → logout

### Token expiration
- [ ] Set `JWT_EXPIRES_IN=10s` in `.env`, restart backend, log in, wait 15s → next API call → 401 → redirected to login
- [ ] Reset `JWT_EXPIRES_IN=15m` after test

### Logout
- [ ] Logout button clears token from store + storage
- [ ] After logout, `/dashboard` redirects to `/login`

---

## #41 — Resume Upload & Parsing

### Happy path
- [ ] Drag-and-drop of a valid PDF shows filename + size before upload
- [ ] Clicking "Upload" uploads and shows success state with character count
- [ ] Newly uploaded resume appears in dashboard list
- [ ] `GET /api/resumes/:id` returns the extracted text matching the PDF content

### Edge cases
- [ ] Non-PDF file (e.g., `.txt`, `.docx`) → client-side reject OR 400 with clear error
- [ ] PDF > 5 MB → 413 "File exceeds 5 MB limit"
- [ ] Empty/corrupted PDF → 422 "Could not parse PDF"
- [ ] Scanned image-only PDF → 422 "No readable text found"
- [ ] Zero-byte upload → 400
- [ ] No file selected but submit pressed → 400 "No file uploaded"

### File handling
- [ ] Uploading same PDF twice creates two Resume docs (expected) — each shows own ID
- [ ] Filenames with spaces / unicode / `..` segments stored safely (no path traversal)
- [ ] File buffer is not persisted to disk (memory storage only — verify no temp files left behind)

### Concurrency
- [ ] Rapid double-click of Upload button doesn't create duplicate records (debounce/disable during request)

---

## #43 — Job Matching

### Happy path
- [ ] After analysis, clicking "See matches" loads the matches page
- [ ] Top 10 jobs shown, sorted by match percentage descending
- [ ] Each card shows: title, company, location, match %, matched skills, missing skills
- [ ] Matched + missing skill counts add up to `requiredSkills.length + niceToHaveSkills.length`

### Ranking logic
- [ ] Job where ALL required + nice-to-have skills are matched → 100%
- [ ] Job where NO skills are matched → 0%
- [ ] Required-only match ranks higher than nice-to-have-only match with same count (weighting)
- [ ] Case-insensitive match works (resume has "react", job requires "React")

### Empty / degraded states
- [ ] Resume with 0 extracted skills → `{ matches: [] }` and UI shows empty state
- [ ] Un-analyzed resume → 400 with "Resume has not been analyzed yet"
- [ ] Empty jobs collection → `{ matches: [] }` (seed script not run)
- [ ] Another user's resume ID → 404

### UI
- [ ] Match percentage visual (progress bar / ring) is readable at a glance
- [ ] Long job titles / company names don't overflow cards
- [ ] Missing-skills list truncates or scrolls gracefully for jobs with many requirements
- [ ] "View job" link (if present) opens `job.url` in a new tab

---

## #44 — Mobile Responsiveness

Test at 375px (iPhone SE), 390px (iPhone 12), 768px (iPad), 1024px+ (desktop).
Use Chrome DevTools device toolbar + a real device.

### Layout — all pages
- [ ] No horizontal scroll at 375px on `/`, `/login`, `/register`, `/upload`, `/dashboard`, `/resumes/[id]`, `/resumes/[id]/matches`
- [ ] Header collapses to hamburger / stacked nav at ≤640px
- [ ] Primary CTAs are tappable (≥44px hit target)
- [ ] Text remains legible (≥14px body) — no zoom-required content
- [ ] Tailwind breakpoints `sm:`, `md:`, `lg:` trigger at expected widths

### Page-specific
- [ ] **Landing:** hero stacks vertically on mobile, no cropped images
- [ ] **Auth forms:** inputs full-width, labels above, submit button spans container
- [ ] **Upload:** drag-and-drop zone large enough to tap, file picker fallback works
- [ ] **Dashboard:** resume list stacks as cards, not a scrolling table
- [ ] **Results page:** ATS ring scales without overflow; skill chips wrap; improvement cards stack
- [ ] **Matches page:** job cards stack vertically, all info visible without horizontal scroll

### Interaction
- [ ] Buttons have visible `:active` / `:focus` states for keyboard + touch
- [ ] Loading states visible (no blank screens during API calls)
- [ ] Error toasts readable on mobile (not cut off by viewport edges)
- [ ] Modal / overlay (if any) closable via tap outside or close button

### Performance
- [ ] First paint < 2s on throttled 3G (Chrome DevTools Network tab)
- [ ] No console errors in mobile Safari / Chrome
- [ ] Tailwind doesn't ship unused utility classes in prod build

---

## Sign-off

- [ ] #40 Auth flow complete — tested by: _____ on: _____
- [ ] #41 Upload complete — tested by: _____ on: _____
- [ ] #43 Job matching complete — tested by: _____ on: _____
- [ ] #44 Mobile complete — tested by: _____ on: _____
