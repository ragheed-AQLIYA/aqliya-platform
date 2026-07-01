# Vercel Infrastructure Audit

**Generated:** 2026-06-22  
**Method:** `vercel.json`, `/api/health` live probe, response headers. **Vercel CLI not installed** on investigation host — dashboard settings not directly queried.

---

## Repository Configuration (`vercel.json`)

```json
{
  "framework": "nextjs",
  "installCommand": "npm install --ignore-scripts",
  "buildCommand": "npx prisma generate && npm run build",
  "outputDirectory": ".next"
}
```

| Setting | Repo value |
|---------|------------|
| Framework | nextjs |
| Install | `npm install --ignore-scripts` (skips postinstall validate-env) |
| Build | `prisma generate` + `npm run build` |
| Output | `.next` (standard Next.js; app also supports `standalone` in Dockerfile) |

---

## Live Production Probe — `https://aqliya.com`

**Executed:** 2026-06-22

| Check | Result |
|-------|--------|
| HTTP status | `200` |
| `server` header | `Vercel` |
| `x-vercel-id` | present (e.g. `bom1::iad1::...`) |
| Health body | `status: ok`, `environment: production` |
| `build.commit` | `6f607840ac032e13c07564c7bbc873772ca076fa` |
| Local `git rev-parse HEAD` | `6f607840ac032e13c07564c7bbc873772ca076fa` (**match**) |
| DB check | `checks.database.ok: true`, latency ~814ms |

**Source:** `src/app/api/health/route.ts` reads `process.env.VERCEL_GIT_COMMIT_SHA` for commit field.

---

## Answers (evidence-based)

| # | Question | Answer |
|---|----------|--------|
| 1 | Actual production project? | Vercel-hosted Next.js app serving `aqliya.com` (header + health commit sync prove Git-linked deploy) |
| 2 | Actual production domain? | **`aqliya.com`** resolves → `216.198.79.1`; health OK |
| 3 | Staging Vercel project? | **Not verifiable** without Vercel API/dashboard; no DNS for staging hostnames |
| 4 | Staging domain configured? | **No public DNS** for `staging.aqliya.com` or `staging.aqliya.ai` |
| 5 | DNS missing? | **Yes** for all staging/dev subdomains probed |
| 6 | Staging project exists at all? | **Unknown** — no DNS, no reachable URL; cannot confirm Vercel project without credentials |

---

## GitHub vs Vercel

| Mechanism | Role |
|-----------|------|
| Vercel Git Integration | **Production deploy path** (commit on live site = `main` HEAD) |
| `.github/workflows/preview.yml` | Optional PR previews via `VERCEL_TOKEN` secrets |
| `.github/workflows/deploy.yml` | Separate AWS ECS path — **failing**, not serving `aqliya.com` probe |

---

## Environment Variables

Not readable from repo (secrets in Vercel dashboard). **Inferred from live health only:**

- `DATABASE_URL` — configured (production DB check passes)
- `AUTH_SECRET` — configured (`checks.auth_secret.ok: true`)
- `VERCEL_GIT_COMMIT_SHA` — set by Vercel build

---

## Gaps / Limits

- Vercel project name, preview branch rules, Node version override, env var list — **require Vercel dashboard or CLI login** (not available in this run).
- `installCommand: --ignore-scripts` bypasses `validate-env.mjs` on Vercel builds (by design in `vercel.json`).
