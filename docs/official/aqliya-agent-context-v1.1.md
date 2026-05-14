# AQLIYA Agent Context v1.1

**Purpose:** Mandatory context for any coding agent (human or AI) working on the AQLIYA repository.

**Version:** 1.1
**Status:** Official — load before any code change

---

## Before Writing Any Code: Read These

1. **`docs/official/aqliya-vision-v1.1.md`** — What AQLIYA is and is not
2. **`docs/official/aqliya-implementation-rules-v1.1.md`** — Mandatory coding rules
3. **`docs/official/aqliya-product-taxonomy-v1.1.md`** — Product boundaries and status
4. **`docs/official/aqliya-core-architecture-v1.1.md`** — Architecture layers and engine status
5. **`docs/official/aqliya-glossary-v1.1.md`** — Terminology
6. **`docs/source-of-truth/AQLIYA_ARCHITECTURE.md`** — Route model and hierarchy
7. **`docs/source-of-truth/AQLIYA_SYSTEM_TAXONOMY.md`** — System classification rules
8. **`docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`** — Current implementation status
9. **`docs/source-of-truth/ROUTE_STRATEGY.md`** — Route purpose and rules

---

## Critical Identity Rules

These override any assumptions the agent may have:

1. **AQLIYA is a Private Governed Institutional Intelligence Platform** — not an audit system, not a chatbot, not SaaS-only.
2. **AuditOS is the first proof product**, not the whole company.
3. **LocalContentOS is the second strategic product** — currently marketing-only.
4. **Cloud + Private is the dual strategy** — do not assume SaaS-only.
5. **AI assists, humans decide, evidence governs** — every AI feature must include human review, evidence linking, and audit trail.
6. **Do not claim Private/On-Prem/Air-Gapped capabilities as implemented** unless existing code/docs support them.

---

## Project Conventions

| Area | Convention |
|---|---|
| Language | TypeScript 5, strict mode |
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL via Prisma 7 |
| Auth | NextAuth v5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Testing | Jest |
| Package manager | npm |
| Linting | ESLint 9 (flat config) |
| UI direction | RTL (Arabic-first) |
| Font | Noto Sans Arabic |

---

## File Naming and Structure

- `src/app/` — Next.js App Router routes and layouts
- `src/components/` — React components organized by domain
- `src/actions/` — Server Actions (database operations)
- `src/lib/` — Business logic, services, engines
- `src/types/` — TypeScript type definitions
- `prisma/` — Database schema and migrations
- `docs/` — All documentation
- `docs/official/` — v1.1 official references (highest authority)
- `docs/source-of-truth/` — Architecture, taxonomy, route strategy
- `docs/systems/` — Per-system documentation
- `docs/theoretical-reference/` — Full theoretical foundation

---

## Commands

```bash
npm run dev            # Development server
npm run build          # Production build (includes prisma generate)
npm run lint           # ESLint
npx tsc --noEmit       # TypeScript check
npm test               # Jest tests
npm run audit:health   # AuditOS health check
npm run backup:verify  # Data integrity check
```
