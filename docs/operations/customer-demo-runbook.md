# Customer Demo Runbook (45 minutes)

**Gate:** Demo Ready (with governance) — parallel remediation 2026-06-02  
**Do not include:** `/organizations` (mock), `/settings` shell as product, SalesOS as L5 until B2 complete.

## Prerequisites

- `npx prisma db seed` (includes audit + local-content + sales via `prisma/seed-sales.ts`)
- Login: `admin@aqliya.com` / `admin123` (see `prisma/seed.ts`)
- Optional: `npm run seed:audit`
- CI/static gate: `npm run demo:smoke` and `npm run audit:action-guards`

## Script

| Min | Route | Message |
| --- | ----- | ------- |
| 0–5 | `/` → `/products/audit` | Platform positioning — governed intelligence, not chatbot |
| 5–20 | `/audit` → engagement → trial balance → evidence → review | AuditOS L5 pilot path; emphasize human review |
| 20–35 | `/local-content` → project → suppliers → finding → export | LocalContentOS L5 with conditions; mention Content Studio at `/local-content/campaigns` as L3 subsystem |
| 35–40 | `/auditos` | **Guided demo only** — mock data, no real customer data |
| 40–45 | `/decisions` → decision report export | DecisionOS L4 adjunct — bilingual report, audit on export |

## SalesOS (internal / optional — not in 45-min customer script)

- `/sales` — disclose **L4 with conditions**; Prisma-backed accounts/deals/governance; intelligence tabs may use derived snapshots
- Do not promise CRM replacement, autonomous AI approval, or L5 pilot-readiness
- Verify banner does not claim in-memory persistence

## Explicitly not demonstrated

- On-Prem / Air-Gapped packages
- Enterprise SAML/LDAP SSO
- SimulationOS as standalone product
- Institutional Memory / RAG
