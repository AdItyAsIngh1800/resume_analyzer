# Performance Notes — Resume Analyzer

Audit completed as part of Phase 4b. Summary of current characteristics, applied optimizations, and known bottlenecks.

---

## Hot paths

| Endpoint                              | Typical latency | Dominated by |
|---------------------------------------|-----------------|--------------|
| `GET  /health`                        | ~5 ms            | Ollama `/api/tags` round-trip |
| `POST /api/auth/register`             | ~200 ms          | bcrypt hash (12 rounds) |
| `POST /api/auth/login`                | ~200 ms          | bcrypt compare |
| `GET  /api/auth/me`                   | <5 ms            | JWT verify + indexed User lookup |
| `GET  /api/resumes`                   | <10 ms           | Indexed Resume.find, 20-doc limit |
| `GET  /api/resumes/:id`               | <5 ms            | Indexed findOne |
| `GET  /api/resumes/:id/analysis`      | <10 ms           | Unique-indexed findOne |
| `GET  /api/resumes/:id/matches`       | ~30 ms           | `Job.find({})` + in-memory scoring (20 jobs) |
| `GET  /api/resumes/:id/report`        | ~50–150 ms       | pdfkit document generation |
| `POST /api/resumes/upload`            | ~50–300 ms       | pdf-parse text extraction |
| `POST /api/resumes/:id/analyze`       | **15–45 seconds** | Ollama model inference (serialized via mutex) |

Numbers are for a warm process on localhost. Ollama dominates everything else by an order of magnitude.

---

## Indexes in place

- `User.email` — unique, indexed
- `Resume.userId` — indexed; compound `(userId, createdAt desc)` for list queries
- `AnalysisResult.resumeId` — unique index (1:1 with Resume)
- `AnalysisResult.userId` — indexed; compound `(userId, createdAt desc)`
- `Job.requiredSkills` — indexed; text index on title/company/description; level index

Every read query in the hot paths has an index that matches its filter.

---

## Optimizations applied in Phase 4b

1. **`.lean()` on read-only queries** in `/resumes`, `/resumes/:id/analysis`, `/resumes/:id/matches`, and `jobMatcher`. Returns plain JS objects instead of Mongoose Documents — fewer allocations, no hydration overhead, faster JSON serialization.
2. **Compression middleware** — gzips responses > 1 KB. JSON payloads compress well; PDFs already self-compress internally (no double-gzip win there).
3. **Projection narrowing** — `/matches` and `/analysis` only fetch the fields they use (`_id`, `skills`), reducing document transfer size.
4. **Removed per-request AI debug logs** — `console.log` inside the analyze loop was adding latency + log volume. Removed.

---

## Known bottlenecks (not yet addressed)

### Ollama latency (the big one)
- Each `/analyze` call takes 15–45s depending on hardware and model size.
- Serialized by a mutex in `ai.js` — only one analysis runs at a time.
- Options if this becomes a real constraint:
  - Run a smaller model (`llama3.2:3b`, `phi3`) — faster but lower quality.
  - Stream the response to the client so the UI can show partial progress.
  - Move to a hosted model (Gemini / Claude / OpenAI) for production-grade latency (1–5s).
  - Queue analyses in a worker + return `202 Accepted` with polling, instead of blocking the request.

### Job matching
- `Job.find({}).lean()` fetches the whole collection. Fine at 20 jobs; at 10k+ we'd want to pre-filter by `requiredSkills ∈ userSkills` before scoring. That's an O(n) → O(k) win with an existing index on `requiredSkills`.

### Resume listing
- Hard-capped at 20 rows. For heavier users, paginate with `skip + limit` or cursor pagination (`createdAt < X`).

---

## How to run the benchmark

```bash
cd backend
docker compose up -d                  # Mongo running
npm run dev                           # Server on :8080
node scripts/seed-jobs.js             # Seed 20 jobs
node scripts/bench.js                 # 50-iter p50/p95 report
N=200 node scripts/bench.js           # Heavier run
```

The script registers a one-shot user, seeds a resume + analysis, hits each read endpoint N times (with a 3-iter warm-up), then prints p50 / p95 / mean per endpoint and cleans up.
