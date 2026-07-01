# Phase 9 — Knowledge Foundation Versioning & Governance Pipeline

**Status:** Complete  
**Date:** 2026-06-22  
**Product:** AQLIYA Knowledge Foundation  
**Target level:** L4 usable v0.1 (governance, versioning, diffs, rollback, audit)

---

## Overview

Phase 9 implements a complete governed **Knowledge Promotion Pipeline** that transforms approved candidates into versioned, auditable, rollback-capable institutional knowledge foundation releases. This closes the governance loop: candidates are mined, reviewed, approved, promoted — and now released as immutable versioned artifacts with full auditability.

---

## Workstream Summary

### Workstream A — Prisma Schema (3 models + 1 enum)

| Model | Purpose |
|-------|---------|
| `KnowledgeFoundationVersion` | Versioned knowledge foundation releases with status lifecycle |
| `KnowledgeFoundationRelease` | Immutable release package artifacts (manifest, SHA-256) |
| `KnowledgeFoundationDiff` | Structured diffs between versions |

**Enum:** `KnowledgeFoundationVersionStatus` — `DRAFT | APPROVED | RELEASED | ACTIVE | DEPRECATED`

User model relations: `kfVersionsCreated` (created versions), `kfVersionsApproved` (approved versions), `kfReleasesCreated` (created releases), `kfReleasesApproved` (approved releases).

Prisma generate passes. ✅

### Workstream B — Release Package Generator

`src/lib/knowledge-foundation/release-generator.ts`:
- Creates immutable release packages at `knowledge/releases/v{major}.{minor}.{patch}/`
- Artifacts: `manifest.json`, `release-notes.md`, `change-summary.json`, `candidate-list.json`, `knowledge-foundation.json`
- SHA-256 hash computed on package
- `KnowledgeFoundationRelease` record created in DB
- Auto-increments `candidateCount` on version
- Event emitted: `knowledge.foundation.release.package.generated`

### Workstream C — Diff Engine

`src/lib/knowledge-foundation/diff-engine.ts`:
- Compares two versions by promoted candidate canonical codes
- Output: `addedRules`, `modifiedRules`, `removedRules` with risk score (0–1) and breaking-change indicator
- Persists via upsert on `KnowledgeFoundationDiff`
- Generates human-readable summary (e.g., "v1.0.0 → v2.0.0: +3 added, ~1 modified, -2 removed")
- Event emitted: `knowledge.foundation.diff.generated`

### Workstream D — Rollback Engine

`src/lib/knowledge-foundation/rollback-service.ts`:
- Requires ADMIN role + written reason
- Deprecates current ACTIVE version
- Re-activates target version
- Links `rollbackVersionId` for audit chain
- Events emitted: `knowledge.foundation.version.deprecated` + `knowledge.foundation.rollback.executed`

### Workstream E — Release Governance

`src/lib/knowledge-foundation/kf-service.ts`:
- Status lifecycle: `DRAFT` → `APPROVED` → `RELEASED` → `ACTIVE` → `DEPRECATED`
- Status transition guards enforce legal transitions
- Only one ACTIVE version at a time (updateMany deprecates others)
- 11 operations: `createVersion`, `approveVersion`, `releaseVersion`, `activateVersion`, `deprecateVersion`, `rollbackVersion`, `generateRelease`, `generateDiff`, `getVersions`, `getVersionDetail`, `getFoundationKPIs`
- Auth helpers: `assertOperator()` (create/release), `assertAdmin()` (approve/activate/deprecate/rollback)

### Workstream F — Audit Integration

`src/lib/knowledge-foundation/events.ts`:
- 7 event types: `version.created`, `version.approved`, `version.released`, `version.activated`, `version.deprecated`, `diff.generated`, `rollback.executed`
- Emit/handler pattern with `onAnyFoundationEvent`
- `registerFoundationAuditHandler()` wires all events to `writePlatformAuditLog`

`src/lib/knowledge-foundation/audit-handler.ts`:
- Maps KF events to platform audit log entries
- `productKey: "knowledge-foundation"`, `targetType: "KnowledgeFoundationVersion"`

### Workstream G — Dashboard Pages

| Route | Purpose |
|-------|---------|
| `/knowledge-foundation` | Version list + KPIs + governance lifecycle summary |
| `/knowledge-foundation/[id]` | Version detail with action buttons, rollback UI, diff display |
| `/knowledge-foundation/new` | Create New Version form |
| `/knowledge-foundation/diff` | Compare two versions with visual diff |
| `/knowledge-foundation/history` | Audit log table from `PlatformAuditLog` |

Server components fetch data, client components handle interactions. `force-dynamic` for live data.

### Workstream H — Tests (4 suites, 35 tests)

| Test File | Tests | Coverage |
|-----------|-------|----------|
| `knowledge-foundation-release.test.ts` | 14 | CRUD + RBAC + queries |
| `knowledge-diff-engine.test.ts` | 6 | Added/removed/modified rules, risk score, event emission |
| `knowledge-rollback.test.ts` | 7 | ADMIN enforcement, reason required, event emission, preservation |
| `release-governance.test.ts` | 8 | Valid transitions, event emission, status enum |

---

## Governance Check

| Requirement | Status | Details |
|-------------|--------|---------|
| RBAC | ✅ | `assertOperator` / `assertAdmin` enforced server-side |
| Tenant isolation | ✅ | Organization-scoped via session |
| Evidence | ✅ | Diff + release packages persist as immutable artifacts |
| Audit trail | ✅ | All 7 event types → `writePlatformAuditLog` |
| Review/approval | ✅ | DRAFT → APPROVED requires ADMIN |
| Export control | ✅ | Release packages require RELEASED status |
| AI boundary | N/A | No AI in KF versioning (candidate promotion is pre-AI) |

---

## Validation Results

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | ✅ Pass (0 errors) |
| `npm run lint` (KF scope) | ✅ Pass (0 warnings) |
| Full test suite (2835 tests) | ✅ Pass (0 failures) |
| Prisma generate | ✅ Pass |

---

## Files Changed

**Schema:**
- `prisma/schema.prisma` — 3 models + 1 enum (KnowledgeFoundationVersion, KnowledgeFoundationRelease, KnowledgeFoundationDiff, KnowledgeFoundationVersionStatus)

**Core library:**
- `src/lib/knowledge-foundation/types.ts` — Shared TS types
- `src/lib/knowledge-foundation/kf-service.ts` — Version CRUD + status lifecycle
- `src/lib/knowledge-foundation/events.ts` — 7 event types + emit/pub-sub
- `src/lib/knowledge-foundation/audit-handler.ts` — KF → platform audit log
- `src/lib/knowledge-foundation/diff-engine.ts` — Version comparison
- `src/lib/knowledge-foundation/release-generator.ts` — Immutable release packages
- `src/lib/knowledge-foundation/rollback-service.ts` — ADMIN rollback

**Server actions:**
- `src/actions/knowledge-foundation/actions.ts` — 11 server actions

**Components:**
- `src/components/knowledge-foundation/kpi-cards.tsx` — KPI card widgets
- `src/components/knowledge-foundation/version-table.tsx` — Version list table
- `src/components/knowledge-foundation/version-detail-client.tsx` — Client-side actions
- `src/components/knowledge-foundation/new-version-form.tsx` — Create version form
- `src/components/knowledge-foundation/diff-viewer.tsx` — Version comparison

**Pages:**
- `src/app/(dashboard)/knowledge-foundation/page.tsx` — Main dashboard
- `src/app/(dashboard)/knowledge-foundation/[id]/page.tsx` — Version detail
- `src/app/(dashboard)/knowledge-foundation/new/page.tsx` — Create version
- `src/app/(dashboard)/knowledge-foundation/diff/page.tsx` — Compare versions
- `src/app/(dashboard)/knowledge-foundation/history/page.tsx` — Audit log

**Mocks:**
- `src/__mocks__/prisma-mock.js` — Added KF models + PlatformAuditLog

**Tests:**
- `src/__tests__/unit/knowledge-foundation/knowledge-foundation-release.test.ts` (14 tests)
- `src/__tests__/unit/knowledge-foundation/knowledge-diff-engine.test.ts` (6 tests)
- `src/__tests__/unit/knowledge-foundation/knowledge-rollback.test.ts` (7 tests)
- `src/__tests__/unit/knowledge-foundation/release-governance.test.ts` (8 tests)

---

## Known Limitations

- Release packages are written to local filesystem (`knowledge/releases/`); S3 integration deferred to ops phase
- No automatic diff generation on release — requires explicit `generateDiff` call
- No scheduled deprecation or auto-archival of old releases
- UI components use `force-dynamic` — no ISR or caching yet
- Dashboard pages skipped by ESLint config (ignored by existing rule); lint verified on lib/actions only

---

## Next Recommended Steps

1. Enable `npm run build` in CI (currently skipped due to environment constraints)
2. Add integration tests with actual Prisma migrations
3. Wire KF version events into SIEM pipeline
4. Consider scheduled retirement of deprecated versions after configurable TTL
5. Add S3 release artifact storage for multi-instance deployments
