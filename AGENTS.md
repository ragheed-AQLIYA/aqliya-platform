<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AQLIYA Agent Context v1.1

You are working on the **AQLIYA** repository.

## Critical Identity (LOAD FIRST)

AQLIYA is a **Private Governed Institutional Intelligence Platform**.

- AQLIYA is NOT AuditOS only.
- AQLIYA is NOT SaaS only.
- AQLIYA is NOT an AI chatbot.
- AuditOS is the first proof product under AQLIYA.
- LocalContentOS is the second strategic product.
- AQLIYA Intelligence Core is the shared platform layer.
- AQLIYA Studio is the custom systems layer.
- Cloud + Private is the dual deployment strategy.

**Trust principle:** AI assists. Humans decide. Evidence governs.

## v1.1 Official Docs (highest authority)

Before making any code change, read in this order:
1. `docs/official/aqliya-vision-v1.1.md` — Platform identity
2. `docs/official/aqliya-implementation-rules-v1.1.md` — Mandatory rules
3. `docs/official/aqliya-product-taxonomy-v1.1.md` — Product boundaries
4. `docs/official/aqliya-core-architecture-v1.1.md` — Architecture
5. `docs/official/aqliya-skill-context-v1.1.md` — Development skills
6. `docs/official/aqliya-glossary-v1.1.md` — Terminology
7. `docs/official/aqliya-roadmap-v1.1.md` — Execution phases
8. `docs/official/aqliya-agent-context-v1.1.md` — Full agent brief

## v1.0 Source of Truth (supporting)

- `docs/source-of-truth/AQLIYA_ARCHITECTURE.md` — Route model
- `docs/source-of-truth/AQLIYA_SYSTEM_TAXONOMY.md` — System classification
- `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` — Implementation status
- `docs/source-of-truth/ROUTE_STRATEGY.md` — Route rules

## Project Stack

- Next.js 16 (App Router, RTL, Arabic-first)
- TypeScript 5 (strict)
- PostgreSQL + Prisma 7
- NextAuth v5
- Tailwind CSS 4 + shadcn/ui
- Jest

## Mandatory Validation After Any Change

```bash
npx tsc --noEmit    # Must pass
npm run lint        # Must pass (pre-existing ESLint warnings/errors in DecisionOS/shared code documented; any new errors introduced must be fixed)
npm run build       # Must pass (includes prisma generate)
```

## Pre-existing Known Issues
- Pre-existing ESLint warnings/errors in DecisionOS/shared library code (count varies by lint run; documented in `PRODUCT_STATUS_MATRIX.md`)
- Jest integration tests require PostgreSQL Docker setup
- Backup not automated (manual only)
