# Engineering Memory — ADR Registry

**Status:** Active — Append-only  
**Owner:** Layer 11 (Engineering Memory)  
**Format:** Architecture Decision Records following Michael Nygard's ADR template

---

## Recorded Decisions

### ADR-001: Platform Intelligence Core as Shared Kernel
- **Date:** 2026-05-28
- **Status:** Accepted
- **Context:** Need shared governance, RBAC, audit trail across all products
- **Decision:** Build `src/lib/core/` as shared kernel with governance engines
- **Consequences:** All products inherit Core automatically. Products must not duplicate Core engines.
- **Files:** `src/lib/core/ai/orchestrator.ts`, `src/lib/platform/`

### ADR-002: Prisma as Sole Database Access Layer
- **Date:** 2026-05-28
- **Status:** Accepted
- **Context:** Need type-safe, migration-safe database access
- **Decision:** Prisma 7 as sole ORM. No raw SQL in application code. Client never imports Prisma.
- **Consequences:** Server Actions are the only boundary for DB access. Migration discipline enforced.
- **Files:** `prisma/schema.prisma`, `src/lib/prisma.ts`

### ADR-003: God Object Split Strategy
- **Date:** 2026-07-13
- **Status:** Accepted (implemented)
- **Context:** `audit-actions.ts` (3,657 lines) and `localcontent-actions.ts` (1,471 lines) were monolithic
- **Decision:** Split by domain concern into focused modules (max 800 lines). Audit → 12 modules in `src/lib/audit/db/`. LocalContent → 8 modules in `src/lib/local-content/`.
- **Consequences:** Better testability, clearer ownership, easier parallel development
- **Files:** `src/lib/audit/db/*`, `src/lib/local-content/*`

### ADR-004: Dashboard Cache Strategy
- **Date:** 2026-07-13
- **Status:** Accepted (implemented)
- **Context:** Dashboard server actions were uncached, hitting DB on every render
- **Decision:** `getCachedOrFetch` with 5-min TTL, per-org scoped keys. Mutations call `invalidateDashboardCaches()`.
- **Consequences:** Improved dashboard performance. Cache invalidation discipline required.
- **Files:** `src/lib/platform/cache-strategy.ts`

### ADR-005: Pagination Standard
- **Date:** 2026-07-13
- **Status:** Accepted (implemented)
- **Context:** Server actions returned unbounded arrays, risking memory issues
- **Decision:** All server actions return `{ items, totalCount, hasMore }` format
- **Consequences:** Client-side pagination is mandatory. No more "get all" queries.
- **Files:** All server actions in `src/actions/`

### ADR-006: Structured Logging over console.*
- **Date:** 2026-07-13
- **Status:** Accepted (in progress)
- **Context:** 208 `console.log/warn/error` calls in production code — unparseable in log aggregators
- **Decision:** Replace console.* with structured JSON logger (`src/lib/observability/logger.ts`). 34 remaining.
- **Consequences:** All new code uses structured logger. Gradual migration of existing calls.
- **Files:** `src/lib/observability/logger.ts`

### ADR-007: Zero `as any` Policy
- **Date:** 2026-07-13
- **Status:** Accepted (enforced)
- **Context:** 50 `as any` casts in production code — type safety bypassed
- **Decision:** Zero tolerance. All casts replaced with proper type narrowing or documented exceptions.
- **Consequences:** Pre-commit check enforces this. New `as any` = build failure.
- **Files:** `jest.config.js` (threshold), governance check

### ADR-008: Agent Freeze — No New Engineering Agents
- **Date:** 2026-07-11
- **Status:** Accepted (active)
- **Context:** Engineering tooling reached company-grade shape. Adding more agents = diminishing returns.
- **Decision:** No new `.mjs` agents. Focus on product completion (Program B). Use Skills instead (`.skills/aqliya/eng-*.md`).
- **Consequences:** New capabilities added as Skills, not agents. Exception requires explicit ADR.
- **Files:** `engineering/programs/AGENT_FREEZE.md`

### ADR-009: Engineering OS Foundation
- **Date:** 2026-07-13
- **Status:** Accepted (active)
- **Context:** Engineering platform was script-based audit. Needed self-improving operating system.
- **Decision:** 12-layer Engineering OS architecture with Skills Factory, Engineering Memory, Active Governance.
- **Consequences:** Every cycle produces reusable Skills. Memory is append-only. Governance prevents violations pre-execution.
- **Files:** `engineering/os/ENGINEERING_OS_ARCHITECTURE.md`, `.skills/aqliya/eng-*.md`

---

## Pending ADRs (proposed, not yet decided)

| ID | Title | Context | Proposed By |
|----|-------|---------|-------------|
| ADR-010 | Unify 4 audit log models | AuditLog, AuditEvent, PlatformAuditLog, SunbulAuditEvent remain unmerged | Security Agent |
| ADR-011 | Sales lib consolidation | 276 + 36 files across sales/salesos need merging | Code Quality Agent |
| ADR-012 | Prisma schema split | 5,121 lines in single file — can use `prismaSchemaFolder` | Database Agent |
| ADR-013 | Route boundary coverage standard | Only 50-60% of pages have error/loading/not-found | Testing Agent |

---

## Template

```md
### ADR-NNN: Title
- **Date:** YYYY-MM-DD
- **Status:** Proposed | Accepted | Deprecated | Superseded
- **Context:** What is the issue?
- **Decision:** What is the decision?
- **Consequences:** What becomes easier/harder?
- **Files:** Affected files
```
