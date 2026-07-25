# Dependency Audit Report

**Date:** 2026-07-25
**Auditor:** OpenCode Agent
**Scope:** Full dependency tree (1,682 packages: 500 prod, 1,068 dev, 191 optional)

---

## Executive Summary

`npm audit fix --legacy-peer-deps` resolved **18 of 32 vulnerabilities** (including both criticals). **14 vulnerabilities remain**, primarily transitive dependencies pinned by `next` and `prisma`, plus one unfixable package (`xlsx`).

| Metric | Before Fix | After Fix |
|--------|-----------|-----------|
| Critical | 2 | 0 |
| High | 13 | 7 |
| Moderate | 14 | 6 |
| Low | 3 | 1 |
| **Total** | **32** | **14** |

---

## Fixes Applied

### Critical vulnerabilities — RESOLVED

| Package | From | To | Advisory |
|---------|------|----|----------|
| `@auth/core` (via `next-auth`) | 0.41.2 | 0.41.3 | GHSA-xmf8-cvqr-rfgj, GHSA-7rqj-j65f-68wh, GHSA-x445-f3h2-j279 |
| `next-auth` | 5.0.0-beta.31 | 5.0.0-beta.32 | Peer conflict with `nodemailer@9` (resolved with `--legacy-peer-deps`) |

### High vulnerabilities — RESOLVED (6)

| Package | From | To | Advisory |
|---------|------|----|----------|
| `@babel/core` | 7.29.0 | 7.29.7 | GHSA-4x5r-pxfx-6jf8 (Arbitrary File Read) |
| `brace-expansion` | ≤1.1.15 | 1.1.16 | GHSA-jxxr-4gwj-5jf2, GHSA-3jxr-9vmj-r5cp (DoS) |
| `fast-uri` | ≤3.1.3 | 3.1.4 | GHSA-q3j6-qgpj-74h6, GHSA-v39h-62p7-jpjc, GHSA-v2hh-gcrm-f6hx, GHSA-4c8g-83qw-93j6 (Path Traversal) |
| `form-data` | 4.0.5 | 4.0.6 | GHSA-hmw2-7cc7-3qxx (CRLF Injection) |
| `hono` (transitive) | 4.12.26 | 4.12.32 | 15 advisories (XSS, JWT, Cache, CORS, Path Traversal) |
| `js-yaml` | ≤4.2.0 | 4.3.0 | GHSA-h67p-54hq-rp68, GHSA-52cp-r559-cp3m (DoS) |

### Moderate vulnerabilities — RESOLVED (6)

| Package | From | To | Advisory |
|---------|------|----|----------|
| `body-parser` | 2.2.2 | 2.3.0 | GHSA-v422-hmwv-36x6 (DoS) |
| `ip-address` | ≤10.1.0 | 10.2.0 | GHSA-v2v4-37r5-5v8g (XSS) |
| `systeminformation` | ≤5.31.6 | 5.33.1 | GHSA-5xpp-75jx-m839 (Command Injection) |
| `tmp` | <0.2.6 | 0.2.7 | GHSA-ph9p-34f9-6g65 (Path Traversal) |
| `ws` | 7.5.10 | 7.5.13 | GHSA-96hv-2xvq-fx4p (Memory Exhaustion) |
| `qs` | ≤6.15.1 | 6.15.3 | GHSA-q8mj-m7cp-5q26 (DoS) |

### Major version bumps (within semver range)

| Package | From | To |
|---------|------|----|
| `next` | 16.2.4 | 16.2.11 |
| `@sentry/nextjs` | 10.53.1 | 10.68.0 |
| `prisma` (CLI) | 7.8.0 | 7.9.0 |

---

## Remaining Vulnerabilities (14)

### 1. `xlsx` — HIGH (x2) — UNFIXABLE

| Advisory | Severity | CVSS | Description |
|----------|----------|------|-------------|
| GHSA-4r6h-8v6p-xvw6 | HIGH | 7.8 | Prototype Pollution in sheetJS |
| GHSA-5pgg-2g8v-p4x9 | HIGH | 7.5 | Regular Expression Denial of Service (ReDoS) |

- **Current version:** 0.18.5
- **Fix version:** Not available (package is unmaintained at this version level)
- **Recommendation:** Replace `xlsx` with an actively maintained alternative (e.g., `exceljs` for write, or use server-side CSV parsing only). This is the highest-risk dependency.

### 2. `postcss` — HIGH (x3) — Blocked by `next`

| Advisory | Severity | CVSS |
|----------|----------|------|
| GHSA-qx2v-qp2m-jg93 | MODERATE | 6.1 (XSS) |
| GHSA-6g55-p6wh-862q | HIGH | 7.5 (Arbitrary File Read) |
| GHSA-r28c-9q8g-f849 | HIGH | 7.5 (Path Traversal) |

- **Current:** ≤8.5.17 (bundled inside `next`)
- **Fix:** Requires `next` to ship postcss ≥8.5.18
- **Status:** Await upstream Next.js release

### 3. `sharp` — HIGH (x1) — Blocked by `next`

| Advisory | Severity | Description |
|----------|----------|-------------|
| GHSA-f88m-g3jw-g9cj | HIGH | CVE-2026-33327, CVE-2026-33328, CVE-2026-35590, CVE-2026-35591 (libvips) |

- **Current:** 0.34.5
- **Fix:** sharp ≥0.35.0
- **Status:** Await upstream Next.js to update sharp

### 4. `next` — Affected by postcss + sharp (see above)

### 5. `prisma` — HIGH (via `@prisma/dev`) — transitive only

| Transitive | Advisory | Severity |
|------------|----------|----------|
| `find-my-way` | GHSA-c96f-x56v-gq3h (DDoS via HTTP2) | HIGH (7.5) |
| `valibot` | GHSA-5qjj-4xww-7phc | MODERATE |

- **Current prisma:** 7.9.0 (latest stable)
- **Note:** `@prisma/dev` is a dev-time dependency of the Prisma CLI only. No runtime exposure.
- **Fix:** Requires Prisma upstream to update dev dependencies.

### 6. `esbuild` — LOW — Fix available

| Advisory | Severity | CVSS | Description |
|----------|----------|------|-------------|
| GHSA-g7r4-m6w7-qqqr | LOW | 2.5 | Arbitrary file read in dev server on Windows |

- **Current:** 0.27.7
- **Fix:** ≥0.28.1
- **Note:** Only affects dev mode on Windows. Low priority.

### 7. `bull` — MODERATE — Blocked (breaking)

| Advisory | Severity | CVSS |
|----------|----------|------|
| GHSA-w5hq-g745-h8pq (via `uuid`) | MODERATE | 7.5 |

- **Fix:** Requires `bull@1.1.3` (breaking change from current 4.16.5)
- **Recommendation:** Evaluate migration to BullMQ or another job queue. Bull v4 uses an old `uuid` version.

### 8. `shadcn` — MODERATE — transitive MCP dev dependency

| Transitive | Advisory |
|------------|----------|
| `@hono/node-server` (via `@modelcontextprotocol/sdk`) | GHSA-frvp-7c67-39w9 (Windows Path Traversal) |

- **Current shadcn:** 4.14.1
- **Fix:** Requires shadcn downgrade to 3.8.3 (not recommended)
- **Note:** Only affects CLI dev tooling, not runtime.

---

## Overall Severity Breakdown

| Remaining | Count | Actionable |
|-----------|-------|------------|
| Unfixable (xlsx) | 1 | Replace package |
| Awaiting upstream (next/postcss/sharp) | 3 | Monitor Next.js releases |
| Dev-only transitive (prisma/esbuild/shadcn) | 2 | Low priority |
| Breaking fix required (bull) | 1 | Plan migration |

---

## Package Version Health (`npm outdated`)

### Need immediate attention

| Package | Current | Latest | Gap | Note |
|---------|---------|--------|-----|------|
| `@prisma/client` | 7.8.0 | 7.9.0 | 1 minor | CLI updated to 7.9.0 but client still at 7.8.0 — run `npm install @prisma/client@7.9.0` |
| `react` / `react-dom` | 19.2.4 | 19.2.8 | 4 patch | Security + bug fixes |
| `next-auth` | 5.0.0-beta.32 | 4.24.15 (stable) | Pre-release vs stable | Stable is v4; v5 still beta. Peer conflict with `nodemailer@9` noted. |

### Within minor range (safe to update)

| Package | Current | Latest |
|---------|---------|--------|
| `@types/react` / `@types/react-dom` | 19.2.14 | 19.2.17 |
| `@aws-sdk/client-s3` | 3.1064.0 | 3.1095.0 |
| `@base-ui/react` | 1.4.1 | 1.6.0 |
| `@radix-ui/*` (10 packages) | 1.x-2.x | Various |
| `cypress` | 15.15.0 | 15.19.0 |
| `date-fns` | 4.1.0 | 4.4.0 |
| `eslint-config-next` | 16.2.4 | 16.2.11 |
| `jest` | 30.3.0 | 30.4.2 |
| `lint-staged` | 17.0.4 | 17.2.0 |
| `lucide-react` | 1.14.0 | 1.26.0 |
| `next-intl` | 4.12.0 | 4.13.4 |
| `pg` | 8.20.0 | 8.22.0 |
| `playwright` | 1.61.0 | 1.62.0 |
| `prettier` | 3.8.3 | 3.9.6 |
| `shadcn` | 4.6.0 | 4.14.1 |
| `tailwind-merge` | 3.5.0 | 3.6.0 |
| `tailwindcss` / `@tailwindcss/postcss` | 4.2.4 | 4.3.3 |
| `ts-jest` | 29.4.9 | 29.4.12 |
| `tsx` | 4.21.0 | 4.23.1 |

### Major version gap (requires evaluation)

| Package | Current | Latest | Note |
|---------|---------|--------|------|
| `csv-parse` | 6.2.1 | 7.0.1 | Major — evaluate API changes |
| `eslint` | 9.39.4 | 10.8.0 | Major — flat config migration |
| `pdfkit` | 0.18.0 | 0.19.1 | Minor but check API |
| `typescript` | 5.9.3 | 7.0.2 | Major — breaking changes expected |
| `@types/node` | 20.19.39 | 26.1.1 | Major — aligns with Node version policy |

---

## Recommendations

### High Priority (this sprint)

1. **Replace `xlsx`** — 2 unfixable HIGH vulns (Prototype Pollution + ReDoS). Evaluate `exceljs` or `@nicolo-ribaudo/chokidar-2` alternatives.
2. **Align `@prisma/client`** — Run `npm install @prisma/client@7.9.0` to match CLI version.
3. **Update `react` / `react-dom`** — 19.2.4 → 19.2.8 includes security fixes.
4. **Update `nodemailer`** — Consider downgrading to 8.x (peer dep for `next-auth`) or wait for `next-auth` to support nodemailer 9.

### Medium Priority (next sprint)

5. **Monitor `next` releases** — postcss + sharp vulns fixed by Next.js upstream.
6. **Plan `bull` → BullMQ migration** — Bull v4 has a blocked vulnerability. BullMQ is the maintained successor.
7. **Bump all patch/minor outdated** packages listed above.

### Low Priority

8. **Evaluate TypeScript 7** — Major version jump, plan migration timeline.
9. **Evaluate ESLint 10** — Requires flat config migration effort.
10. **Monitor `prisma` CLI dev dependency chain** — No runtime exposure.

### Security Note on `next-auth` + `nodemailer`

The `next-auth@5.0.0-beta.32` peer dependency only accepts `nodemailer@^7.0.7 || ^8.0.5`. The project currently uses `nodemailer@9.0.3`. This was resolved with `--legacy-peer-deps` during `npm audit fix`. Monitor `next-auth` releases for nodemailer 9 support. If email functionality is critical, consider downgrading nodemailer to 8.x or evaluating the email adapter in production.

---

*Report auto-generated. Next audit recommended: **2026-08-25** or after major dependency bumps.*
