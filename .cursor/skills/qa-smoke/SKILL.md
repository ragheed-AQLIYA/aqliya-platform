---
name: qa-smoke
description: Use for browser smoke tests, route verification, seeded data checks, SSR/client mismatch, and manual QA scripts.
---

# QA Smoke Skill

## Smoke Report Format

For each route:
- URL
- expected content
- actual content
- status
- visible seeded data
- console/network issues if available
- pass/fail

## AQLIYA Special Checks

- homepage Arabic platform branding (`/`)
- login flow (`/login`) — seed: `admin@aqliya.com` / `admin123` from `prisma/seed.ts`
- `/decisions` seeded tender data
- AuditOS workflow pages under `/audit`
- evidence/findings/review/audit-trail hydration

## Health API

- `GET /api/health` — database check should be `ok` when Postgres is running

## Rules

- Never claim production-ready from smoke alone
- Distinguish marketing-only routes from workspace routes
- Report SSR/hydration mismatches explicitly
