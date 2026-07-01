# Parallel Execution Cycle — Tier 1 Foundation

**Program:** AQLIYA Parallel Execution Director  
**Cycle ID:** `2026-06-21-tier1-foundation`  
**Branch:** `main` (Director mode — sequential commits per agent)  
**Authority:** `docs/deliverables/EXECUTIVE_RECOMMENDATION_2026.md` (Confirmed Executive Priority Stack)  
**Date:** 2026-06-21  
**Duration:** 30 days  
**Status:** IN_PROGRESS — Slice S1 partially complete (2026-06-21)

### S1 completion log

| Item | Status |
|------|--------|
| `hasPermission()` org scope | ✅ Done |
| `normalizePrincipalRole()` / download gate casing | ✅ Done |
| Denial audit → PlatformAuditLog in gate | ✅ Done |
| `platform-audit.ts` retired → `decision/decision-audit.ts` | ✅ Done (9 call sites migrated, file deleted) |
| WorkflowAuditEvent dual-write gap | ⏳ Pending |
| Role mapping doc | ⏳ Pending |

**Next:** Slice S2 — Core Access Enforcement on download/export/AI routes.

---

## Cycle Objective

Execute **Tier 1 Foundation Layer** without destabilizing L5 pilot-ready products:

1. Unified Authorization Layer  
2. Core Access Enforcement  
3. Evidence Registry  
4. Signal Engine Recovery  
5. Audit Convergence Closure  

**Exit gate:** Tier 1 exit criteria in `EXECUTIVE_RECOMMENDATION_2026.md` § Confirmed Executive Priority Stack.

---

## Pre-flight

| Check | Result |
| ----- | ------ |
| `git status --short` | Run before cycle start |
| `git log --oneline -5` | Run before cycle start |
| Authority docs read | PRODUCT_STATUS_MATRIX → EXECUTIVE_RECOMMENDATION_2026 → ABAC_READINESS → INTELLIGENCE_CORE_EXECUTION_BACKLOG |
| Backlog tasks selected | IC-P0-01, IC-P0-02, IC-P0-03, IC-P0-04 · ABAC Phase 0–1 |
| Frozen surfaces respected | SalesOS, WorkflowOS, Organizations, Office AI expansion — **bugfix-only** |
| Prisma schema | **No changes** in this cycle unless Director assigns dedicated sequential task |

---

## Slice Plan (Sequential on main)

| Slice | Days | Priority | Task IDs | Agent | Blocked by |
| ----- | ---- | -------- | -------- | ----- | ---------- |
| **S1** | 1–10 | #1 + #5 | ABAC Ph 0 · IC-P0-01 | Agent-Platform | — |
| **S2** | 11–18 | #2 | IC-P0-03 | Agent-Platform | S1 (org scope fix) |
| **S3** | 19–24 | #3 | IC-P0-04 | Agent-IC | S2 (gate for download hooks) |
| **S4** | 25–30 | #4 | IC-P0-02 | Agent-IC | S1 (stable audit writes) |
| **S5** | 25–30 | QA | Tier 1 validation | Agent-QA | S2–S4 |

**Parallel reads allowed.** **Writes:** one agent at a time.

---

## Agent Assignments

### Slice S1 — Agent-Platform (Authorization + Audit Closure)

**Tier 1 Priority #1 — Unified Authorization Layer**

- Fix `hasPermission()` `organizationId` filter in `src/lib/platform/access/rbac-service.ts`
- Fix `can()` role casing in `src/lib/platform/access/permissions.ts` (`ADMIN` → `admin`)
- Add denial audit scaffold to `src/core/access/server-action-guard.ts`
- Document canonical role mapping (User / AuditUser / DB Role)

**Tier 1 Priority #5 — Audit Convergence Closure** (parallel within slice)

- Migrate 9 `platform-audit.ts` call sites → `writePlatformAuditLog`
- Files: `src/actions/decisions.ts`, `approval.ts`, `decision-*.ts`, `tender.ts`, integration tests
- Verify/fix WorkflowAuditEvent dual-write gap
- Delete or deprecate `src/lib/platform-audit.ts` when call sites = 0

**Files (ownership — ALLOWED):**

- `src/lib/platform/access/*`
- `src/core/access/*`
- `src/lib/platform-audit.ts`
- `src/actions/decision*.ts`, `approval.ts`, `tender.ts`
- `src/actions/__tests__/decision-actions.test.ts`
- `src/__tests__/integration/critical-paths.test.ts`

**Files (FORBIDDEN):** `prisma/schema.prisma`, `src/lib/sales/*`, `src/lib/workflowos/*`, `src/app/audit/*` (unless bugfix escalated)

**Status:** done — org scope, role normalization, denial audit, platform-audit → decision-audit, WorkflowAuditEvent dual-write via `recordWorkflowAuditEvent`

---

### Slice S2 — Agent-Platform (Core Access Enforcement)

**Tier 1 Priority #2 — Core Access Enforcement**

- Wire `requireServerActionAccess()` on evidence download routes
- Wire gate on export actions: WorkflowOS, DecisionOS, LC, Contacts
- Wire gate on `src/lib/platform/product-ai-bridge.ts` entry
- AuditOS: adapter preserving `AuditUser.role`

**Status:** done — gates wired; `npx tsc --noEmit` pass; targeted tests pass (cross-tenant-isolation, decision-actions)

---

### Slice S3 — Agent-IC (Evidence Registry)

**Tier 1 Priority #3 — Evidence Registry**

- Replace stub in `src/lib/platform/evidence/evidence-service.ts` with facade
- Unified lookup: ownership, sensitivity, productSlug, resource linkage
- Hook download authorization through registry

**Schema:** Facade-only — no new Prisma models unless Director approves

**Status:** done — `lookupEvidence`, `assertEvidenceDownloadAccess`, `registerEvidence` (audit hook); wired on audit/decision/LC download routes

---

### Slice S4 — Agent-IC (Signal Engine Recovery)

**Tier 1 Priority #4 — Signal Engine Recovery**

- Define signal taxonomy
- Recreate `src/lib/platform/signals/`
- Restore unified task/activity runtimes
- Resolve Sales v02 cross-product signal TODOs

**Status:** done — signals restored; `index.ts` delegates to producers; unified runtimes wired

---

### Slice S5 — Agent-QA

- `npx tsc --noEmit` after each merge step
- Targeted tests: cross-tenant-isolation, decision-actions, abac
- Tier 1 exit checklist sign-off

**Status:** partial — tsc + 119 targeted tests pass; full suite not run

---

## Tier 1 Exit Checklist

- [x] Zero imports of `@/lib/platform-audit` in production code
- [x] `hasPermission()` filters by `organizationId`
- [x] All listed download routes use unified gate
- [x] Export actions use unified gate
- [x] `product-ai-bridge` uses unified gate
- [x] Evidence registry returns real metadata (not stub ID)
- [x] `unified-task-runtime` returns non-empty signals for seeded org (via restored producers)
- [x] Authorization denials written to PlatformAuditLog
- [x] `npx tsc --noEmit` pass

**On pass:** Begin Tier 2 — `src/lib/core/` namespace (Day 31).

---

## Cycle Status

**Overall:** DONE_WITH_CONCERNS — S1–S4 code complete; S5 partial (targeted tests only)

**Next action:** Director sign-off on G-T1-EXIT; then Tier 2 namespace extraction (IC-P1-01).
