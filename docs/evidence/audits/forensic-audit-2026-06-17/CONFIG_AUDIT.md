# CONFIG AUDIT — AQLIYA Forensic Audit

**Generated:** 2026-06-17  
**Method:** Opened config files listed below; full lint run referenced from `build-audit.md`

---

## Config Inventory

| File | Opened | Role |
|------|--------|------|
| `package.json` | Partial (L1–40, scripts) | Dependencies, scripts |
| `tsconfig.json` | Partial (L1–30) | TypeScript strict, paths |
| `eslint.config.mjs` | Partial (L1–73) | ESLint flat config |
| `jest.config.js` | Full | Test runner |
| `next.config.mjs` | Partial via subagent | Next.js + security headers |
| `.github/workflows/deploy.yml` | Partial (L1–50) | CI/CD |
| `docker-compose.yml` | NOT VERIFIED | Local DB |
| `vercel.json` | NOT VERIFIED | Vercel deploy |
| `cypress.config.*` | NOT VERIFIED | E2E |
| `playwright.config.*` | NOT VERIFIED | Not found in glob |
| `.prettierrc*` | NOT VERIFIED | Formatting |

---

## package.json

### Scripts (verified sample)

| Category | Count | Notes |
|----------|------:|-------|
| Core dev/build/test | 6+ | `build`, `test`, `lint`, `dev` |
| Domain scripts | 50+ | TB, local-content, pilot, smoke |
| Integration setup | `test:integration:setup` | Docker test DB 5433 |

### Key dependencies (verified)

- next 16.2.4, react 19.2.4, prisma 7.8.0, next-auth beta.31
- bull, ioredis, @aws-sdk/client-s3, @sentry/nextjs, zod 4.4

### Issues

| Issue | Evidence |
|-------|----------|
| postinstall requires env | `validate-env.mjs` — fails without .env on fresh clone |
| Heavy script surface | 50+ scripts — maintenance burden |

---

## tsconfig.json

| Setting | Value | Assessment |
|---------|-------|--------------|
| strict | true | Good |
| include | `.next/types/**/*.ts` | Causes stale type errors when pages removed (build-audit) |
| paths | `@/*` → `./src/*` | Standard |

---

## eslint.config.mjs

### Issues (VERIFIED — opened)

| Issue | Evidence |
|-------|----------|
| **Massive lint scope failure** | build-audit: 33,662 problems |
| Ignores large `src/` areas | L24–70: decision, platform, dashboard ignored |
| Duplicate ignore entries | L48–68 repeats decision/simulation paths |
| Does NOT ignore `docs/archive/code/` | Causes non-src noise |
| Does NOT ignore `knowledge-foundation/` | Lint scans reference TS |

**Recommendation:** Add `docs/**`, `knowledge-foundation/**` to globalIgnores; dedupe ignore list; scope production lint to active `src/` only.

---

## jest.config.js (VERIFIED — full read)

| Setting | Value | Assessment |
|---------|-------|------------|
| roots | `src/` only | Good — excludes docs |
| testMatch | `**/__tests__/**/*.test.ts(x)` | Standard |
| maxWorkers | 1 | Serial — slow CI |
| Mocks | Extensive next-auth, prisma mocks | Appropriate for unit |
| ignore | `.claude/`, `docs/` | Good |

**No vitest config found** — Jest only.

---

## next.config.mjs (partial)

| Setting | Verified |
|---------|----------|
| output standalone | Yes |
| Security headers CSP/X-Frame/nosniff | Yes |
| Redirects sunbul/simulation/solutions | Yes |
| serverExternalPackages | prisma, pg, pdf libs |

---

## GitHub Actions (5 workflows)

| File | Opened | Purpose |
|------|--------|---------|
| `ci.yml` | NOT VERIFIED | CI |
| `deploy.yml` | Partial | AWS deploy pipeline |
| `backup.yml` | NOT VERIFIED | Backup |
| `preview.yml` | NOT VERIFIED | Preview |
| `promote.yml` | NOT VERIFIED | Promotion |

**deploy.yml evidence:** Node 22, `tsc --noEmit`, terraform, paths-ignore docs.

---

## Docker / Vercel — NOT VERIFIED

- `Dockerfile` multi-stage — referenced in CLAUDE.md, not opened
- `vercel.json` standalone — not opened

---

## Obsolete / Duplicate Config Signals

| Signal | Evidence |
|--------|----------|
| Duplicate ESLint ignores | eslint.config.mjs L48–68 |
| `.bak` pages in app tree | Not config but pollutes build context |
| `jest.config.js` vs no vitest | Single test runner — OK |
| Multiple backup runbooks | docs + runbooks/ — content overlap NOT VERIFIED |

---

## Conflicting Config Claims

| Claim | Config reality |
|-------|----------------|
| "0 lint warnings" (matrix Phase 7) | 33,662 eslint problems full repo |
| "Build passes" | `npm run build` FAIL (build-audit) |
| CI blocks bad TS | deploy.yml runs tsc — would fail today |

---

## Recommendations

1. Fix TS errors → unblock `tsc` and CI
2. Scope ESLint to `src/` + add doc/knowledge ignores
3. Dedupe eslint.config.mjs ignore block
4. Clean `.next` after removing stale routes
5. Document which scripts are operational vs experimental

---

## NOT VERIFIED

- Full `ci.yml` job matrix
- Cypress config contents
- Prettier / Husky hook behavior
- Terraform backend config
