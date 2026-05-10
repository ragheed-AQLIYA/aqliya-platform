# AQLIYA / AuditOS Architecture Boundaries

## Purpose

This document defines the boundary between **AQLIYA Decision OS tender workflows** and **AQLIYA AuditOS** inside the broader AQLIYA company platform. It prevents naming collisions, import confusion, and accidental crossover during development.

## Product Separation

| Product | Route Prefix | Description |
|---------|-------------|-------------|
| **AQLIYA Decision OS** | `/` → `/decisions`, `/organizations`, etc. | Decision workflows including tender decision use cases. Arabic (RTL). |
| **AQLIYA AuditOS** | `/audit` → `/audit/engagements/...` | Governed financial assurance workflow. English (LTR). |

Both products share:
- `src/components/ui/` (shadcn component library)
- `src/lib/prisma.ts` (Prisma client)
- `src/lib/auth.ts` / `src/lib/auth-next.ts` (authentication)
- `src/lib/utils.ts` (utility functions)

## File Boundary Map

```
src/
  lib/
    platform-audit.ts          ← AQLIYA DECISION OS (decision workflow audit logging)
    audit/                     ← AUDITOS ONLY (all contents)
      services.ts
      mock-data.ts
      ai-service.ts
      audit-events.ts
      db/index.ts
  app/
    audit/                     ← AUDITOS ONLY (all routes)
    (dashboard)/               ← AQLIYA DECISION OS ONLY (decision routes)
  components/
    audit/                     ← AUDITOS ONLY (all components)
    decisions/                 ← AQLIYA DECISION OS ONLY
    layout/                    ← AQLIYA DECISION OS (sidebar, header)
    organizations/             ← AQLIYA DECISION OS ONLY
    tenders/                   ← AQLIYA DECISION OS ONLY
    ui/                        ← SHARED
  types/
    audit/                     ← AUDITOS ONLY
```

## `src/lib/platform-audit.ts` — Do Not Confuse

**This file belongs to AQLIYA Decision OS tender workflows.**

- Exports: `logAudit()`, `toAuditJson()`, `AuditAction` type
- Tracks Decision OS workflow events: `DECISION_CREATED`, `DECISION_UPDATED`, `RECOMMENDATION_UPDATED`, etc.
- Writes to the `AuditLog` Prisma model (Decision OS workflow layer)
- **Has nothing to do with AuditOS audit events**

Originally named `src/lib/audit.ts`. Renamed to `platform-audit.ts` to eliminate naming collision with AuditOS.

**Do not add AuditOS audit logic to this file.** AuditOS has its own audit service at `src/lib/audit/audit-events.ts` using the `AuditEvent` Prisma model.

## `src/lib/audit/` — AuditOS Services

**This directory belongs entirely to AQLIYA AuditOS.**

| File | Purpose |
|------|---------|
| `services.ts` | Public API — hybrid mock/DB service layer |
| `mock-data.ts` | Pre-seeded Gulf Trading Co. FY2025 demo dataset |
| `ai-service.ts` | Mock AI assistance with governance wrapper |
| `audit-events.ts` | In-memory append-only audit event store |
| `db/index.ts` | Prisma-backed service layer (31 functions) |

**Do not confuse with `src/lib/platform-audit.ts`** (Decision OS workflow audit logging).

## `src/app/audit/` — AuditOS Routes

All routes under `/audit` are AuditOS-specific:

| Route | Screen |
|-------|--------|
| `/audit` | Dashboard |
| `/audit/engagements/[engagementId]` | Engagement workspace |
| `/audit/engagements/[engagementId]/trial-balance` | Trial Balance |
| `/audit/engagements/[engagementId]/mapping` | Account Mapping |
| `/audit/engagements/[engagementId]/validation` | Validation |
| `/audit/engagements/[engagementId]/statements` | Financial Statements |
| `/audit/engagements/[engagementId]/notes` | Disclosure Notes |
| `/audit/engagements/[engagementId]/evidence` | Evidence |
| `/audit/engagements/[engagementId]/findings` | Findings |
| `/audit/engagements/[engagementId]/recommendations` | Recommendations |
| `/audit/engagements/[engagementId]/review` | Review Queue |
| `/audit/engagements/[engagementId]/approval` | Approval |
| `/audit/engagements/[engagementId]/publication` | Publication |
| `/audit/engagements/[engagementId]/audit-trail` | Audit Trail |

**Note:** `/audit` may later be renamed to `/auditos` for clarity, but this will not happen during demo stabilization.

## Prisma Model Separation

| Prefix | Product | Examples |
|--------|---------|---------|
| (no prefix) | AQLIYA Decision OS shared workflow models | `Organization`, `User`, `Decision`, `Recommendation`, `Approval`, `AuditLog` |
| `Audit` | AQLIYA AuditOS | `AuditOrganization`, `AuditUser`, `AuditEngagement`, `AuditFinding`, `AuditEvent` |

While some model names overlap semantically (e.g. `Recommendation` vs `AuditRecommendation`, `Approval` vs `AuditApprovalRecord`, `AuditLog` vs `AuditEvent`), they are distinct Prisma models with different schemas and are never confused at the type level.

## Do Not Confuse

| This | With This | Because |
|------|-----------|---------|
| `src/lib/platform-audit.ts` | `src/lib/audit/` | platform-audit = Decision OS audit log; audit/ = AuditOS services |
| `@prisma/client.AuditLog` | `@prisma/client.AuditEvent` | AuditLog = Decision OS events; AuditEvent = AuditOS events |
| `PrismaModel.Recommendation` | `PrismaModel.AuditRecommendation` | Recommendation = Decision OS; AuditRecommendation = AuditOS |
| `/published/recommendation/[decisionId]` | `/audit/.../publication` | published/ = Decision OS view; audit/ = AuditOS workflow |
| `components/layout/header.tsx` | AuditOS should have own header | Current AuditOS layout imports platform header (legacy) |

## Safe Future Refactor Sequence

When ready, perform these steps in order to fully resolve remaining boundary issues:

### Phase A: Rename `audit` → `auditos` (separate sprint, not during demo)

1. Rename `src/app/audit/` → `src/app/auditos/`
2. Rename `src/components/audit/` → `src/components/auditos/`
3. Rename `src/lib/audit/` → `src/lib/auditos/`
4. Rename `src/types/audit/` → `src/types/auditos/`
5. Update all ~35 imports across source files
6. Add a redirect at `/audit` → `/auditos` for backward compatibility
7. Run `npx tsc --noEmit` — 0 errors
8. Run `npm run lint` — 0 new errors

### Phase B: Create AuditOS-specific header (medium effort)

1. Create `src/components/auditos/layout/auditos-header.tsx`
2. Update `src/app/auditos/layout.tsx` to use it
3. Remove platform header dependency from AuditOS layout

### Phase C: Add AuditOS entry point (low effort)

1. Add an `/auditos` link to `src/app/page.tsx` alongside the existing `/decisions` link

### Phase D: Route namespace for published output (future)

1. Rename `/published/recommendation/[decisionId]` → `/published/tender/[decisionId]`
2. Reserve `/published/auditos/` for AuditOS future use

### Do Not Touch During Demo Stabilization

- `src/app/audit/` — route prefix
- `src/components/audit/` — component tree
- `src/lib/audit/` — service directory
- `src/types/audit/` — type definitions
- `prisma/schema.prisma` — model definitions
- Any file that renders UI visible in the demo flow
