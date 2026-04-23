# Security Posture — Resume Analyzer

Audit completed as part of Phase 4b. Summary of defenses in place and known residual risks.

---

## Defenses in place

### Authentication
- Passwords hashed with bcrypt (rounds = 12).
- `passwordHash` marked `select: false` — never returned from Mongo unless explicitly requested.
- `toSafeObject()` used on every auth response; no raw user docs leak.
- JWT signed with `JWT_SECRET`, 15-minute expiry, verified on every protected route.
- Startup check (`src/index.js`) aborts if `JWT_SECRET` is missing, shorter than 32 chars, or looks like the dev placeholder in production.
- Same 401 "Invalid email or password" for wrong email and wrong password — no user enumeration.

### Input handling
- All auth + resume body inputs pass through `validateBody` / `validateObjectId`.
- Email rule rejects non-strings, so NoSQL operator injection (e.g. `{ "$gt": "" }`) is blocked at the middleware boundary.
- `express.json({ limit: '1mb' })` caps JSON payloads.
- Multer memory storage, 5 MB limit, MIME-type filter for PDF upload.
- Filename sanitized before Content-Disposition to prevent header injection.

### Transport / HTTP
- `helmet()` middleware — HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, etc.
- CORS locked to `FRONTEND_URL`; `credentials: true` means origin must be exact.
- Rate limiting: 100 req / 15 min per IP globally, 20 req / 15 min on `/api/auth/*`.

### Error handling
- Centralized error handler (`errorHandler.js`) maps Mongoose/JWT/multer errors to safe status codes.
- Stack traces hidden outside `NODE_ENV=development` and only logged server-side.
- `console.error` only fires for 5xx errors, not client errors — log volume stays low.

### Data isolation
- Every resume-scoped query includes `{ userId: req.user._id }` as a filter. Cross-user access returns 404, covered by integration tests.

---

## Residual risks / follow-ups

1. **No refresh token rotation** — access tokens expire in 15 minutes, but there is no separate refresh endpoint; users must re-login. Acceptable for the current scope; add a `/refresh` route + HttpOnly cookie if the UX becomes painful.
2. **`/health` is unauthenticated** — exposes Ollama reachability and the configured model name. Low-sensitivity info for a local tool; lock it down behind auth if deploying publicly.
3. **No audit log** — we don't persist a record of logins or analysis runs. Not needed for a portfolio project; add if this goes multi-tenant.
4. **No CSP header** — helmet's default CSP is conservative for APIs but a static frontend served elsewhere would benefit from a tuned policy.
5. **`pdf-parse` vulnerabilities** — the library is old and has known CVEs around malformed PDFs. The parser runs with a 5 MB input cap and any failure is caught + returned as 422. Consider migrating to `pdfjs-dist` if this moves to production.
6. **HTTPS** — not enforced in app code. Must be terminated at the hosting layer (Render/Vercel/Cloudflare).
7. **Secret rotation** — `.env` is gitignored, but there is no process for rotating `JWT_SECRET` or `MONGODB_URI`. Invalidates all tokens on rotation, which is acceptable.

---

## What the tests cover

- Integration tests exercise the auth flow end-to-end, including 401s for invalid/missing tokens.
- Unit tests verify `validateBody` rejects NoSQL-style payloads (string-only type check).
- Integration tests confirm cross-user access returns 404, not 403 with data leak.
- Integration tests verify `passwordHash` is absent from register/login responses.
