# DecisionOS PlatformAuditLog Integration Plan

**Version:** 1.0
**Status:** Code discovery complete — not yet implemented
**Aligned with:** `aqliya-platform-audit-log-design.md`, current schema and codebase

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current DecisionOS Audit Landscape](#2-current-decisionos-audit-landscape)
3. [Current Audit Models and Functions](#3-current-audit-models-and-functions)
4. [Central Logging Path Assessment](#4-central-logging-path-assessment)
5. [Platform Context Resolution](#5-platform-context-resolution)
6. [Proposed Field Mapping](#6-proposed-field-mapping)
7. [First Dual-Write Target Event](#7-first-dual-write-target-event)
8. [Implementation Plan](#8-implementation-plan)
9. [Verification Plan](#9-verification-plan)
10. [Rollback Plan](#10-rollback-plan)
11. [Risks and Mitigations](#11-risks-and-mitigations)
12. [No-Go Conditions](#12-no-go-conditions)
13. [Recommended Sprint 3K](#13-recommended-sprint-3k)

---

## 1. Executive Summary

DecisionOS has a structured audit logging system centered on the `AuditLog` Prisma model and a central `logAudit()` helper in `src/lib/platform-audit.ts`. However, usage is split: 4 files use the central helper, while 4 other files call `prisma.auditLog.create` directly.

This plan identifies exactly 6 files to modify for dual-write to PlatformAuditLog, plus 1 central helper to enhance. No Prisma schema changes needed — `Organization.platformOrganizationId` already exists and resolves to `PlatformOrganization`.

**Recommended approach:** Enhance the central `logAudit()` function to dual-write, and add dual-write calls to the 4 direct-write locations. Use safe mode — never block the primary action.

---

## 2. Current DecisionOS Audit Landscape

### 2.1 AuditLog Model

```prisma
model AuditLog {
  id             String       @id @default(cuid())
  decisionId     String       // FK to Decision
  organizationId String       // FK to Organization
  userId         String       // FK to User
  action         AuditAction  // Enum
  entity         String?
  before         String?
  after          String?
  createdAt      DateTime     @default(now())
}
```

**Key characteristics:**
- ✅ `organizationId` has FK to `Organization`
- ✅ `Organization` has nullable `platformOrganizationId` (backfilled, 100% coverage)
- ❌ No workspace/project context (DecisionOS doesn't have these concepts yet)
- ❌ No actor type/email/role fields
- ❌ No severity/status fields
- ❌ No metadata JSON field

### 2.2 AuditAction Enum (Prisma)

```prisma
enum AuditAction {
  DECISION_CREATED   DECISION_UPDATED
  RECOMMENDATION_UPDATED  PATTERN_EXTRACTED
  ALERT_RESOLVED     SECTOR_ASSIGNED
  BENCHMARK_CREATED  OUTPUT_PUBLISHED
  OUTPUT_UNPUBLISHED SUBMITTED_FOR_REVIEW
  DECISION_APPROVED  DECISION_APPROVED_WITH_CONDITIONS
  DECISION_REJECTED  REVISION_REQUESTED
  SNAPSHOT_PUBLISHED CURRENT_PUBLISHED_WITHOUT_APPROVAL
  STALE_PUBLISH_BLOCK  STALE_PUBLISH_OVERRIDE
  OUTCOME_CREATED    OUTCOME_UPDATED
  OUTCOME_REVIEWED
}
```

---

## 3. Current Audit Models and Functions

### 3.1 Files With `prisma.auditLog.create` (Direct Writes)

| File | Lines | Events |
|---|---|---|
| `src/actions/decisions.ts` | 135, 633, 659, 683, 709, 735, 768 | Decision create/update/delete |
| `src/actions/approval.ts` | 84, 143, 207, 266, 313, 577 | Submit/approve/reject/publish |
| `src/actions/decision-outcomes.ts` | 95, 136 | Outcome create/update |
| `src/actions/decision-templates.ts` | 122 | Template application |

### 3.2 Files Using `logAudit()` (Central Helper)

| File | Action |
|---|---|
| `src/lib/platform-audit.ts` | Central helper — wraps `prisma.auditLog.create` |
| `src/actions/decision-sector.ts` | Sector assignment |
| `src/actions/decision-signals-alerts.ts` | Signal/alert lifecycle |
| `src/actions/decision-learning.ts` | Pattern extraction |
| `src/actions/tender.ts` | Tender profile |

### 3.3 Available Fields per AuditLog Write

| Field | Source | PlatformAuditLog Mapping |
|---|---|---|
| `userId` | Session/User FK | `actorId` |
| `decisionId` | FK to Decision | `targetId` |
| `organizationId` | FK to Organization | → `PlatformOrganization.id` |
| `action` (enum) | AuditAction | `action` (string) |
| `entity` (string) | "Decision", etc. | `targetType` |
| `before` (JSON string) | State snapshot | `previousState` (in metadata) |
| `after` (JSON string) | State snapshot | `newState` (in metadata) |
| `createdAt` | Auto | `createdAt` |

---

## 4. Central Logging Path Assessment

### 4.1 `logAudit()` — Partial Coverage

The `logAudit()` function at `src/lib/platform-audit.ts:27` is a **central helper** but **not a gateway**:

- 4 files call `logAudit()` (decision-sector, signals-alerts, learning, tender)
- 4 files call `prisma.auditLog.create` directly (decisions, approval, outcomes, templates)

**No single function intercepts all DecisionOS audit writes.**

### 4.2 Recommended Integration Strategy

**Dual-write from the `logAudit()` helper** for files that use it (4 files), AND **dual-write directly** in the 4 files that bypass it.

Alternative (simpler but slightly more refactoring): **Enhance `logAudit()` and refactor the 4 direct-write files** to use it instead. This provides a single dual-write point and reduces direct Prisma calls.

**Recommendation:** Enhance `logAudit()` to dual-write to PlatformAuditLog, AND add inline dual-write calls to the 4 direct-write locations. Do NOT refactor them to use `logAudit()` — that's scope creep per Sprint rules.

### 4.3 Files to Modify (6 total)

| Priority | File | Change |
|---|---|---|
| P0 | `src/lib/platform-audit.ts` | Enhance `logAudit()` to dual-write to PlatformAuditLog |
| P1 | `src/actions/decisions.ts` | Add dual-write after each `prisma.auditLog.create` |
| P1 | `src/actions/approval.ts` | Add dual-write after each `prisma.auditLog.create` |
| P2 | `src/actions/decision-outcomes.ts` | Add dual-write after each `prisma.auditLog.create` |
| P2 | `src/actions/decision-templates.ts` | Add dual-write after each `prisma.auditLog.create` |

---

## 5. Platform Context Resolution

### 5.1 PlatformOrganization Resolution

DecisionOS `organizationId` (from `AuditLog.organizationId`) maps to `Organization.id`.
`Organization.platformOrganizationId` resolves to `PlatformOrganization.id`.

```
auditLog.organizationId → Organization.id → Organization.platformOrganizationId → PlatformOrganization.id
```

**Resolution code:**
```typescript
const platformOrgId = await prisma.organization.findUnique({
  where: { id: auditLog.organizationId },
  select: { platformOrganizationId: true },
}).then((org) => org?.platformOrganizationId ?? null)
```

### 5.2 Workspace/Project Context

DecisionOS does **not** have workspace/project context today. `Decision` has no `clientWorkspaceId` or `projectId` fields.

**Decision:** Leave `clientWorkspaceId` and `projectId` as NULL in PlatformAuditLog entries from DecisionOS. This is correct — DecisionOS decisions are not scoped to a client workspace or project. If DecisionOS later adopts these concepts, existing logs can be backfilled.

### 5.3 Actor Resolution

DecisionOS uses `userId` (FK to `User`). To resolve actor details:

```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { id: true, email: true, name: true, role: true },
})
```

---

## 6. Proposed Field Mapping

### 6.1 AuditLog → PlatformAuditLog

| AuditLog Field | PlatformAuditLog Field | Resolution |
|---|---|---|
| — | `productKey` | `"decision_os"` (static) |
| `action` | `action` | `action.toString()` |
| `organizationId` | `platformOrganizationId` | Resolve via `Organization.platformOrganizationId` |
| — | `clientWorkspaceId` | `null` (no workspace concept in DecisionOS) |
| — | `projectId` | `null` (no project concept in DecisionOS) |
| `userId` | `actorId` | Direct |
| — | `actorType` | `"user"` (static) |
| `User.email` | `actorEmail` | Resolve from User |
| `User.name` | `actorName` | Resolve from User |
| `entity` | `targetType` | Direct |
| `decisionId` | `targetId` | Direct |
| — | `severity` | `"info"` (static) |
| — | `status` | `"recorded"` (static) |
| — | `sourceSystem` | `"decision_os"` (static) |
| — | `sourceModel` | `"AuditLog"` (static) |
| `id` | `sourceId` | Legacy AuditLog.id |
| `before` | `metadata.previousState` | Inline |
| `after` | `metadata.newState` | Inline |
| — | `metadata.dualWrite` | `true` |
| — | `metadata.originalId` | Legacy AuditLog.id |

### 6.2 Enhanced `logAudit()` Example

```typescript
export async function logAudit(
  userId: string, decisionId: string, action: AuditAction,
  entity: string, before?: string, after?: string, organizationId?: string
) {
  // ... existing code to create AuditLog ...

  // Dual-write to PlatformAuditLog (safe mode)
  try {
    const { writePlatformAuditLog } = await import("@/lib/platform/audit-log")
    const platformOrgId = organizationId ?? resolvedOrganizationId
    
    let actorName = userId
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      })
      if (user) actorName = user.name || user.email
    } catch { /* skip */ }

    await writePlatformAuditLog({
      productKey: "decision_os",
      action: action.toString(),
      platformOrganizationId: platformOrgId,
      actorId: userId,
      actorType: "user",
      actorName,
      targetType: entity,
      targetId: decisionId,
      severity: "info",
      status: "recorded",
      sourceSystem: "decision_os",
      sourceModel: "AuditLog",
      sourceId: auditLog.id,
      metadata: {
        originalId: auditLog.id,
        dualWrite: true,
        previousState: before ? before : undefined,
        newState: after ? after : undefined,
        decisionId,
      },
    })
  } catch { /* never block */ }
}
```

---

## 7. First Dual-Write Target Event

### 7.1 Recommended Test Event

**Action:** `DECISION_CREATED`
**File:** `src/actions/decisions.ts:135`
**Rationale:** 
- Simple event — no complex state transitions
- Always has `decisionId` and `organizationId`
- Easy to verify: create a test decision and check PlatformAuditLog

### 7.2 Verification Query

```typescript
const log = await prisma.platformAuditLog.findFirst({
  where: {
    productKey: "decision_os",
    action: "DECISION_CREATED",
    sourceModel: "AuditLog",
  },
})
// Verify: log exists, platformOrganizationId is set, actorId is set
```

---

## 8. Implementation Plan

### 8.1 Sprint 3K: Enhance `logAudit()` + Wire Direct Writes

**Duration:** 1 day
**Files:** `src/lib/platform-audit.ts`

**Step 1:** Enhance `logAudit()` to dual-write to PlatformAuditLog (safe mode).

**Step 2:** Add inline dual-write calls after each direct `prisma.auditLog.create` in:
- `src/actions/decisions.ts` (7 locations)
- `src/actions/approval.ts` (6 locations)
- `src/actions/decision-outcomes.ts` (2 locations)
- `src/actions/decision-templates.ts` (1 location)

**Total:** 1 enhanced helper + 16 direct-write sites

### 8.2 Sprint 3L: Verification Script

**Duration:** 0.5 day
**File:** `scripts/verify-decisionos-dual-write.ts`

**Steps:**
1. Dry-run: find a Decision (or create test decision) and preview what would be written
2. Apply: call `logAudit()` or equivalent with test metadata
3. Verify PlatformAuditLog row created with correct mappings

### 8.3 Sprint 3M: Update Admin Page

**Duration:** 0.5 day
**File:** `scripts/verify-platform-audit-logs.ts`

**Steps:**
1. Add `decision_os` row counts to verification script
2. Add `decision_os` context coverage report
3. Update audit-logs admin page if needed

---

## 9. Verification Plan

### 9.1 Verification Script

**Script:** `scripts/verify-decisionos-dual-write.ts`
**Modes:** dry-run (default), apply (--apply)

**Dry-run:** Reports:
- Count of Decision records
- Count of AuditLog records
- PlatformOrganization resolution for each organization
- Which events would be created

**Apply:**
1. Create a test decision (if safe) or use existing
2. Trigger decision creation → generates legacy AuditLog
3. Verify PlatformAuditLog row exists with:
   - `productKey: "decision_os"`
   - `sourceModel: "AuditLog"`
   - `platformOrganizationId` is set (not null)
   - `actorId` matches user
   - `metadata.dualWrite: true`

### 9.2 Post-Verification Checks

1. `platform:verify-audit-logs` shows `decision_os` rows
2. Audit log admin page shows decision_os entries
3. All legacy AuditLog behavior unchanged
4. All existing tests pass

---

## 10. Rollback Plan

### 10.1 Dual-Write Rollback

1. Remove dual-write code from `logAudit()` (revert to original)
2. Remove inline dual-write calls from direct-write files
3. Restore imports to original state

**Impact:** Zero data loss. Only additive dual-write removed.

### 10.2 Full Rollback

1. Undo all 6 file modifications
2. Delete any test PlatformAuditLog rows with `productKey: "decision_os"`
3. Regenerate Prisma client
4. Run full test suite

---

## 11. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| 16 direct-write sites increase code churn | Medium | Low | Each site is 2-3 lines of identical code; safe-mode never blocks |
| `organizationId` may be undefined for some events | Low | Medium | Use `?? undefined` fallback; leave `platformOrganizationId` NULL |
| `User` lookup for actor details may fail | Low | Low | Fall back to `userId` string as actorName |
| `logAudit()` is imported by test files too | Low | Low | Dual-write imports are dynamic (lazy); no impact on test environment |
| Scope creep — temptation to refactor direct writes | Medium | Low | Explicitly prohibit refactoring; inline dual-write only |

---

## 12. No-Go Conditions

| Condition | Action |
|---|---|
| Any existing DecisionOS test fails after changes | Revert, investigate |
| Dual-write throws and blocks primary action | Revert immediately (violates safe-mode contract) |
| `platformOrganizationId` resolution fails for all events | Pause, fix Organization backfill |
| More than 2 files have merge conflicts or unexpected code | Pause, review each site individually |

---

## 13. Recommended Sprint 3K

**Sprint 3K: DecisionOS PlatformAuditLog Dual-Write**

1. Enhance `logAudit()` in `src/lib/platform-audit.ts` to dual-write to PlatformAuditLog (safe mode)
2. Add inline dual-write calls after each direct `prisma.auditLog.create` in:
   - `src/actions/decisions.ts` (7 sites)
   - `src/actions/approval.ts` (6 sites)
   - `src/actions/decision-outcomes.ts` (2 sites)
   - `src/actions/decision-templates.ts` (1 site)
3. Use safe mode (`writePlatformAuditLog` without strict) — never block
4. Run validation (tsc, lint, build)
5. Create `scripts/verify-decisionos-dual-write.ts` with dry-run/apply modes
6. Update `scripts/verify-platform-audit-logs.ts` to report `decision_os` rows
7. Run all verification scripts

**Do NOT:** refactor direct writes to use `logAudit()`, create admin page changes, change Prisma schema, or modify DecisionOS business logic.
