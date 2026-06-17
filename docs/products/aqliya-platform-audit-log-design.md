# AQLIYA PlatformAuditLog — Unified Audit Trail Design

**Version:** 1.0
**Status:** Architecture design — not yet implemented
**Aligned with:** `aqliya-cloud-platform-build-plan.md`, `aqliya-client-workspace-project-model-design.md`, official v1.1 docs
**Strategic direction:** Build Cloud-first, Private-ready

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Why PlatformAuditLog Is Needed](#2-why-platformauditlog-is-needed)
3. [Current Audit Log Landscape](#3-current-audit-log-landscape)
4. [Target Unified Audit Model](#4-target-unified-audit-model)
5. [Proposed Prisma Model](#5-proposed-prisma-model)
6. [Field Definitions](#6-field-definitions)
7. [Product Event Taxonomy](#7-product-event-taxonomy)
8. [Workspace/Project Context Mapping](#8-workspace-project-context-mapping)
9. [AI / Office AI Assistant Event Support](#9-ai--office-ai-assistant-event-support)
10. [Dual-Write Strategy](#10-dual-write-strategy)
11. [Backfill Strategy](#11-backfill-strategy)
12. [Read Model and Admin Page](#12-read-model-and-admin-page)
13. [Permission and Privacy Rules](#13-permission-and-privacy-rules)
14. [Performance and Indexing](#14-performance-and-indexing)
15. [Migration Plan](#15-migration-plan)
16. [Rollback Plan](#16-rollback-plan)
17. [Risks and Mitigations](#17-risks-and-mitigations)
18. [No-Go Conditions](#18-no-go-conditions)
19. [Implementation Roadmap](#19-implementation-roadmap)
20. [Recommended Sprint 3D](#20-recommended-sprint-3d)

---

## 1. Executive Summary

AQLIYA currently has **two independent audit log models** — `AuditEvent` (AuditOS) and `AuditLog` (DecisionOS) — with different schemas, different scopes, and no cross-product query capability. As the platform adds `ClientWorkspace`, `Project`, `Office AI Assistant`, and future products, a unified audit trail is needed.

This design proposes `PlatformAuditLog` — an additive, dual-write-compatible model that records cross-product events with platform context. Existing audit models remain unchanged during transition.

### Design Philosophy

| Principle | Application |
|---|---|
| Additive | New model does not replace existing ones |
| Dual-write | New events written to both legacy and platform model during transition |
| Cross-product | Platform model carries product, workspace, and project context |
| Backfill-safe | Legacy data can be migrated to platform model via script |
| Performant | Key indexes support org/workspace/project/product filtering |

---

## 2. Why PlatformAuditLog Is Needed

| Problem | Current Limitation | Solution |
|---|---|---|
| No cross-product audit view | `AuditEvent` scoped to AuditOS engagement; `AuditLog` scoped to DecisionOS decision | `PlatformAuditLog` carries `productKey` |
| No workspace/project context | `AuditEvent` has `engagementId` but not `clientWorkspaceId` or `projectId` | `PlatformAuditLog` carries `clientWorkspaceId` and `projectId` |
| No unified actor identity | `AuditEvent` uses string `actorId`; `AuditLog` uses FK to `User` | `PlatformAuditLog` uses `actorId` + `actorType` for flexibility |
| Office AI Assistant needs audit | No model for AI prompt/response/evidence audit | `PlatformAuditLog` supports `aiRelated` + metadata |
| Compliance/reporting | No single source of truth for "who did what across all products" | Platform audit log becomes the compliance trail |
| Private-readiness | Existing models are product-specific | Platform model deploys same way on Cloud and Private |

---

## 3. Current Audit Log Landscape

### 3.1 AuditOS `AuditEvent`

```prisma
model AuditEvent {
  id            String    @id @default(cuid())
  engagementId  String    // FK to AuditEngagement
  eventType     String    // "engagement.created" | "evidence.uploaded" | etc.
  actorId       String    // String — no FK to User
  actorName     String
  actorRole     String
  targetType    String    // "engagement" | "evidence" | "finding" | etc.
  targetId      String
  previousState String    @default("")
  newState      String    @default("")
  description   String
  aiRelated     Boolean   @default(false)
  metadata      Json?
  timestamp     DateTime  @default(now())
  createdAt     DateTime  @default(now())
}
```

**Usage:** Written by `recordAuditEvent()` in `services.ts`. Read by `audit-trail-page.tsx` component. Filtered by `engagementId`.

**Volume:** ~1 event per user action in AuditOS.

### 3.2 DecisionOS `AuditLog`

```prisma
model AuditLog {
  id             String       @id @default(cuid())
  decisionId     String       // FK to Decision
  organizationId String       // FK to Organization
  userId         String       // FK to User
  action         AuditAction  // Enum: DECISION_CREATED, APPROVED, etc.
  entity         String?      // Target entity type
  before         String?      // Previous state (text)
  after          String?      // New state (text)
  createdAt      DateTime     @default(now())
}
```

**Usage:** Written by decision lifecycle actions. Read by decision detail audit pages.

**Volume:** ~1 event per decision state change.

### 3.3 Current Coverage Gaps

| Feature | AuditOS `AuditEvent` | DecisionOS `AuditLog` | Platform Needed |
|---|---|---|---|
| PlatformOrg ID | — | `organizationId` (legacy) | ✓ |
| ClientWorkspace ID | — | — | ✓ |
| Project ID | — | — | ✓ |
| Product key | — | — | ✓ |
| Unified actor ID | `actorId` (string) | `userId` (FK) | Both |
| AI event metadata | `aiRelated: true` | — | ✓ |
| Model version/prompt | — | — | ✓ |
| Cross-product query | — | — | ✓ |

---

## 4. Target Unified Audit Model

### 4.1 Data Flow

```
User Action
  │
  ├── Current Path (unchanged):
  │   └── recordAuditEvent() → AuditEvent (AuditOS)
  │   └── AuditLog.create() → AuditLog (DecisionOS)
  │
  ├── New Path (additive):
  │   └── writePlatformAuditLog() → PlatformAuditLog (shared)
  │
  └── (Dual-write: both paths run in parallel during transition)
```

### 4.2 PlatformAuditLog Position

```
PlatformOrganization
└── PlatformAuditLog[]
    ├── clientWorkspaceId?   (if applicable)
    ├── projectId?           (if applicable)
    ├── productKey           ("audit" | "decision" | "office-ai" | "local-content")
    ├── actor info
    ├── action
    ├── target info
    └── metadata (AI, evidence, etc.)
```

---

## 5. Proposed Prisma Model

```prisma
model PlatformAuditLog {
  id                     String    @id @default(cuid())
  platformOrganizationId String
  organization           PlatformOrganization @relation(fields: [platformOrganizationId], references: [id])

  clientWorkspaceId      String?
  projectId              String?

  productKey             String    // "audit" | "decision" | "office-ai" | "local-content" | "platform"

  actorId                String
  actorType              String    @default("user")   // "user" | "system" | "ai" | "integration"
  actorName              String?
  actorRole              String?

  action                 String    // "entity.created" | "entity.updated" | etc.
  severity               String    @default("info")   // "info" | "warning" | "error" | "critical"
  status                 String    @default("success") // "success" | "failure" | "pending"

  targetType             String?
  targetId               String?
  previousState          String?
  newState               String?
  description            String?

  aiRelated              Boolean   @default(false)
  aiProvider             String?   // "cloud-ai" | "deterministic" | "local-ai"
  aiModelVersion         String?
  aiPromptVersion        String?
  aiConfidence           Float?
  aiReviewStatus         String?   // "pending" | "accepted" | "rejected" | "overridden"
  aiReviewerId           String?
  aiSourceFileIds        String?   // comma-separated or JSON array

  evidenceReferences     Json?     // [{ nodeId, type, linkType }]

  metadata               Json?

  timestamp              DateTime  @default(now())
  createdAt              DateTime  @default(now())

  @@index([platformOrganizationId, createdAt])
  @@index([platformOrganizationId, productKey, createdAt])
  @@index([clientWorkspaceId, createdAt])
  @@index([projectId, createdAt])
  @@index([actorId, createdAt])
  @@index([action, createdAt])
  @@index([severity, status])
  @@index([aiRelated, createdAt])
}
```

---

## 6. Field Definitions

| Field | Type | Required | Purpose |
|---|---|---|---|
| `id` | `String @id @default(cuid())` | Always | Primary key |
| `platformOrganizationId` | `String` (FK) | Always | Tenant isolation |
| `clientWorkspaceId` | `String?` | Optional | Workspace-level filter |
| `projectId` | `String?` | Optional | Project-level filter |
| `productKey` | `String` | Always | `"audit"`, `"decision"`, `"office-ai"`, etc. |
| `actorId` | `String` | Always | User/system/AI identifier |
| `actorType` | `String @default("user")` | Always | `"user"`, `"system"`, `"ai"`, `"integration"` |
| `actorName` | `String?` | Optional | Display name |
| `actorRole` | `String?` | Optional | Role at time of action |
| `action` | `String` | Always | Action identifier |
| `severity` | `String @default("info")` | Always | Severity classification |
| `status` | `String @default("success")` | Always | Outcome status |
| `targetType` | `String?` | Optional | Entity type affected |
| `targetId` | `String?` | Optional | Entity ID affected |
| `previousState` | `String?` | Optional | Previous state value |
| `newState` | `String?` | Optional | New state value |
| `description` | `String?` | Optional | Human-readable summary |
| `aiRelated` | `Boolean @default(false)` | Always | Is this an AI event? |
| `aiProvider` | `String?` | AI events | Which AI provider |
| `aiModelVersion` | `String?` | AI events | Model version used |
| `aiPromptVersion` | `String?` | AI events | Prompt template version |
| `aiConfidence` | `Float?` | AI events | Confidence score |
| `aiReviewStatus` | `String?` | AI events | Human review outcome |
| `aiReviewerId` | `String?` | Reviewed events | Who reviewed |
| `aiSourceFileIds` | `String?` | AI events | Files used as context |
| `evidenceReferences` | `Json?` | Optional | Evidence graph links |
| `metadata` | `Json?` | Optional | Extensible payload |
| `timestamp` | `DateTime @default(now())` | Always | When the action occurred |
| `createdAt` | `DateTime @default(now())` | Always | When the log was created |

### 6.1 Field Decisions

| Decision | Rationale |
|---|---|
| `clientWorkspaceId` and `projectId` are `String?` not FKs | Allows logging events before workspace/project records exist; avoids cascade constraints |
| `actorId` is `String` not FK | Must support system actors, AI actors, and legacy user IDs that don't have PlatformUser records |
| `action` is free-form `String` not enum | Products define their own action taxonomy; avoids schema migration for new actions |
| `ai*` fields are denormalized into PlatformAuditLog | Avoids join queries for AI audit trail; AI events are common enough to justify dedicated fields |
| `evidenceReferences` is `Json?` | Flexible structure for evidence graph links without a separate model |

---

## 7. Product Event Taxonomy

### 7.1 AuditOS Events

| Action Pattern | Example | Severity |
|---|---|---|
| `engagement.created` | New engagement created | info |
| `engagement.state_changed` | Draft → In Review | info |
| `evidence.uploaded` | File uploaded to evidence vault | info |
| `evidence.state_changed` | Missing → Received | info |
| `evidence.linked` | Evidence linked to finding | info |
| `finding.created` | New finding recorded | warning |
| `finding.state_changed` | Open → Resolved | info |
| `recommendation.created` | AI or manual recommendation | info |
| `recommendation.accepted` | Recommendation accepted | info |
| `approval.recorded` | Approval/rejection action | info |
| `publication.published` | Report published | info |
| `export.generated` | PDF/XLSX export | info |
| `ai.output_generated` | AI suggestion created | info |
| `ai.output_accepted` | Human accepted AI output | info |
| `ai.output_rejected` | Human rejected AI output | info |

### 7.2 DecisionOS Events

| Action Pattern | Example | Severity |
|---|---|---|
| `decision.created` | New decision request | info |
| `decision.submitted` | Submitted for review | info |
| `decision.approved` | Decision approved | info |
| `decision.rejected` | Decision rejected | warning |
| `decision.outcome_recorded` | Outcome logged | info |
| `risk.identified` | New risk identified | warning |
| `scenario.analyzed` | Scenario analysis run | info |

### 7.3 Office AI Assistant Events (Future)

| Action Pattern | Example | Severity |
|---|---|---|
| `assistant.summary_generated` | Document summary created | info |
| `assistant.report_drafted` | Report draft created | info |
| `assistant.question_answered` | Q&A response generated | info |
| `assistant.output_accepted` | Human accepted output | info |
| `assistant.output_rejected` | Human rejected output | info |
| `assistant.file_analyzed` | Excel/PDF analyzed | info |

### 7.4 Platform Events

| Action Pattern | Example | Severity |
|---|---|---|
| `workspace.created` | New ClientWorkspace created | info |
| `workspace.archived` | Workspace archived | warning |
| `project.created` | New Project created | info |
| `project.state_changed` | Project status change | info |
| `user.role_changed` | User role modified | info |
| `export.triggered` | Export initiated | info |

---

## 8. Workspace/Project Context Mapping

### 8.1 AuditOS to Platform Mapping

```
AuditAction → recordAuditEvent()
  ├── PlatformAuditLog.platformOrganizationId → resolved from AuditOrganization → PlatformOrganization
  ├── PlatformAuditLog.clientWorkspaceId → resolved from AuditClient → ClientWorkspace
  ├── PlatformAuditLog.projectId → resolved from AuditEngagement → Project
  ├── PlatformAuditLog.productKey → "audit"
  ├── PlatformAuditLog.actorId → auditUser.id
  ├── PlatformAuditLog.actorType → "user"
  ├── PlatformAuditLog.actorName → auditUser.name
  ├── PlatformAuditLog.actorRole → auditUser.role
  ├── PlatformAuditLog.action → "evidence.uploaded"
  ├── PlatformAuditLog.targetType → "evidence"
  ├── PlatformAuditLog.targetId → evidence.id
  ├── PlatformAuditLog.previousState → "missing"
  ├── PlatformAuditLog.newState → "received"
  ├── PlatformAuditLog.description → "File uploaded: fs-report-2024.pdf"
  └── PlatformAuditLog.timestamp → event.timestamp
```

### 8.2 Resolution Priority

When writing a PlatformAuditLog event:

1. **If `clientWorkspaceId` is known** — use it directly
2. **If only `auditClientId` is known** — resolve via `AuditClient.clientWorkspaceId`
3. **If only `auditEngagementId` is known** — resolve via `AuditEngagement.projectId` → `Project.workspaceId`
4. **If nothing is known** — leave `clientWorkspaceId` and `projectId` as NULL

### 8.3 PlatformOrg Resolution

When writing a PlatformAuditLog event, `platformOrganizationId` is resolved in priority order:

1. From `PlatformUser.platformOrganizationId` (when PlatformUser exists)
2. From `User.organization.platformOrganizationId` (DecisionOS)
3. From `AuditUser.organization.platformOrganizationId` (AuditOS)
4. From legacy `Organization.id` or `AuditOrganization.id` as last resort

---

## 9. AI / Office AI Assistant Event Support

### 9.1 AI Event Fields

When logging an AI-related event:

```typescript
writePlatformAuditLog({
  platformOrganizationId,
  clientWorkspaceId,
  projectId,
  productKey: "audit" | "office-ai",
  actorId: "ai-orchestrator",
  actorType: "ai",
  action: "assistant.summary_generated",
  severity: "info",
  targetType: "engagement",
  targetId: engagementId,
  description: "AI generated executive summary for engagement XYZ",
  aiRelated: true,
  aiProvider: "cloud-ai",           // "cloud-ai" | "deterministic" | "local-ai"
  aiModelVersion: "gpt-4o",
  aiPromptVersion: "executive-summary-v1",
  aiConfidence: 0.87,
  aiReviewStatus: "pending",        // "pending" | "accepted" | "rejected"
  aiReviewerId: undefined,          // set when human reviews
  aiSourceFileIds: "file-1,file-2", // files used as context
  evidenceReferences: [
    { nodeId: "evid-123", type: "evidence", linkType: "references" },
  ],
})
```

### 9.2 Human Review Flow

```
1. AI generates output → PlatformAuditLog with aiReviewStatus="pending"
2. Human reviews output
3. If accepted → new PlatformAuditLog with action="assistant.output_accepted", aiReviewStatus="accepted"
4. If rejected → new PlatformAuditLog with action="assistant.output_rejected", aiReviewStatus="rejected"
5. AI output itself stored in AiActionLog (separate model for AI-specific data)
```

### 9.3 AI-Specific Model Separation

| Model | Purpose |
|---|---|
| `PlatformAuditLog` | Audit trail — who did what, when |
| `AiActionLog` (future) | AI-specific — prompt, response, confidence, token usage |
| `AuditAiOutput` (existing) | AI suggestions linked to AuditOS engagements (legacy) |

---

## 10. Dual-Write Strategy

### 10.1 Phase 1: Legacy-Only (Current)

```
Action → recordAuditEvent() → AuditEvent
      → auditLog.create()   → AuditLog
```

**Status:** Active. No PlatformAuditLog writes.

### 10.2 Phase 2: Parallel Dual-Write (Sprint 3D)

```
Action → recordAuditEvent() → AuditEvent
      → writePlatformAuditLog() → PlatformAuditLog
      → auditLog.create()   → AuditLog
      → writePlatformAuditLog() → PlatformAuditLog
```

**Status:** Additive. Both systems receive events. PlatformAuditLog may have NULL workspace/project fields if resolution fails.

**Write helper:**

```typescript
async function writePlatformAuditLog(input: PlatformAuditLogInput): Promise<void> {
  // Resolve platformOrganizationId if not provided
  // Resolve clientWorkspaceId if only engagementId provided
  // Write to PlatformAuditLog table
  // Do NOT throw on failure — log warning instead
}
```

**Error handling:** Dual-write failures must NOT block the primary action. If `writePlatformAuditLog` fails, the primary action (AuditEvent/AuditLog write) still succeeds. This prevents audit unification from breaking existing functionality.

### 10.3 Phase 3: PlatformAuditLog as Source of Truth (Future)

```
Action → writePlatformAuditLog() → PlatformAuditLog
      → (optional: legacy models deprecated in read path)
```

**Status:** Future. Not before all products are migrated and backfill is verified.

### 10.4 When to Write Which Fields

| Context Available | Fields Set | Example |
|---|---|---|
| Full platform context | All fields | AuditOS engagement with workspace/project |
| Product only, no workspace | NULL workspace/project | DecisionOS decision before workspace migration |
| AI action with source files | AI fields + evidence refs | Office AI Assistant summary |
| System action | actorType="system" | Scheduled report generation |

---

## 11. Backfill Strategy

### 11.1 Why Backfill?

Backfilling existing `AuditEvent` and `AuditLog` records into `PlatformAuditLog` enables:
- Cross-product audit queries for historical data
- Consistent filtering across all events
- Compliance reporting from day one of the new model

### 11.2 Backfill Scope

| Source | Records | Backfill Viable? | Strategy |
|---|---|---|---|
| `AuditEvent` (AuditOS) | ~10-100K | Yes | Batch process, resolve workspace/project from engagement |
| `AuditLog` (DecisionOS) | ~1-10K | Yes | Batch process, platformOrgId from organization |

### 11.3 Backfill Script Design

```typescript
// scripts/backfill-platform-audit-logs.ts

async function backfillAuditEvents() {
  const events = await prisma.auditEvent.findMany({ /* paginated */ })
  for (const event of events) {
    const platformOrgId = await resolvePlatformOrgFromEngagement(event.engagementId)
    const projectId = await resolveProjectFromEngagement(event.engagementId)
    const workspaceId = await resolveWorkspaceFromProject(projectId)
    
    await prisma.platformAuditLog.create({
      data: {
        platformOrganizationId: platformOrgId,
        clientWorkspaceId: workspaceId,
        projectId,
        productKey: "audit",
        // ... map fields from AuditEvent
        metadata: { backfilledFrom: "AuditEvent", originalId: event.id },
      },
    })
  }
}
```

### 11.4 Backfill Order

1. Backfill `AuditEvent` records (largest volume, most valuable)
2. Backfill `AuditLog` records (smaller volume, DecisionOS)
3. Verify counts match between source and target
4. Report unmatched records

### 11.5 Constraints

- Backfill is optional — new events are dual-written
- Backfill can run incrementally (batch by date range)
- Backfill does NOT modify or delete source records
- Backfill is idempotent (check `metadata->originalId`)

---

## 12. Read Model and Admin Page

### 12.1 Read Path

```
PlatformAuditLog queries:
  - By organization:     WHERE platformOrganizationId = ?
  - By workspace:        WHERE clientWorkspaceId = ?
  - By project:          WHERE projectId = ?
  - By product:          WHERE productKey = ?
  - By actor:            WHERE actorId = ?
  - By action:           WHERE action LIKE ?
  - By date range:       WHERE timestamp BETWEEN ? AND ?
  - By severity:         WHERE severity IN ?
  - AI events:           WHERE aiRelated = true
```

### 12.2 Admin Page Design: `/settings/audit-logs`

**Read-only page** with filtering capabilities:

```
┌─────────────────────────────────────────────────────┐
│  Audit Logs — Unified Platform Audit Trail          │
│  Read-only: shows cross-product audit events         │
├─────────────────────────────────────────────────────┤
│  Filters:                                            │
│  [Product ▼] [Action...] [Severity ▼] [Date range]  │
│  [Workspace ▼] [Project ▼] [Actor]                   │
├─────────────────────────────────────────────────────┤
│  Results (paginated, sorted by timestamp DESC):      │
│                                                      │
│  ⏱ 2025-01-15 14:30  │ audit │ evidence.uploaded   │
│  ───────────────────────────────────────────────     │
│  Workspace: Gulf Trading Co.                         │
│  Project: FY2025 Audit                               │
│  Actor: Ahmed Al Ghamdi (operator)                   │
│  Target: evidence (evid-abc-123)                     │
│  Description: File uploaded: fs-report-2024.pdf      │
│                                                      │
│  ⏱ 2025-01-15 14:28  │ decision │ decision.approved │
│  ───────────────────────────────────────────────     │
│  Actor: Sara Al-Otaibi (admin)                       │
│  Target: decision (dec-xyz-789)                      │
│  Description: Q3 Investment Decision approved        │
│  └── [View Details →]                                │
├─────────────────────────────────────────────────────┤
│  Showing 1-25 of 1,234 events                        │
│  [← Prev]  Page 1 of 50  [Next →]                   │
└─────────────────────────────────────────────────────┘
```

### 12.3 Detail View

Clicking "View Details" opens an expanded view showing:

- Full event data (all fields)
- AI-specific fields (if `aiRelated`)
- Evidence reference links
- Metadata JSON (formatted)
- Links to related workspace/project/engagement pages

### 12.4 Export (Future)

- CSV export of filtered results
- JSON export for programmatic access
- Audit log retention report

---

## 13. Permission and Privacy Rules

### 13.1 Access Control

| Role | Can View |
|---|---|
| `platform_admin` | All audit logs within organization |
| `workspace_admin` | Audit logs for their workspaces |
| `workspace_viewer` | Audit logs for their workspaces (read-only) |
| `project_lead` | Audit logs for their projects |
| `project_viewer` | Audit logs for their projects (read-only) |

### 13.2 Enforcement

```
User requests audit log → 
  Check platformOrganizationId matches user's org →
    If user is platform_admin → return all
    If user is workspace_admin → filter by user's workspaceIds
    If user is project_lead → filter by user's projectIds
    Else → deny
```

### 13.3 Privacy Rules

| Rule | Implementation |
|---|---|
| No cross-org data leakage | All queries filtered by `platformOrganizationId` |
| Actor identities masked for viewers | Show name/role only; hide email/ID for non-admins |
| AI prompt content masked | `metadata` stripped of PII in non-admin views |
| Retention enforced | Auto-delete records older than organization's retention policy |
| Export logged | Export of audit logs is itself an audit event |

---

## 14. Performance and Indexing

### 14.1 Expected Volume

| Source | Est. Daily Volume | Est. Annual Volume |
|---|---|---|
| AuditOS (10 clients × 50 actions/day) | 500 | 182,500 |
| DecisionOS (50 decisions × 10 actions) | 500 | 182,500 |
| Office AI Assistant (100 queries × 2 events) | 200 | 73,000 |
| Platform events (workspace/project/admin) | 50 | 18,250 |
| **Total** | **1,250** | **~456,000** |

### 14.2 Index Strategy

| Index | Purpose | Cardinality |
|---|---|---|
| `(platformOrganizationId, createdAt)` | Primary query path — org view | High |
| `(platformOrganizationId, productKey, createdAt)` | Product-filtered view | High |
| `(clientWorkspaceId, createdAt)` | Workspace-scoped view | Medium |
| `(projectId, createdAt)` | Project-scoped view | Medium |
| `(actorId, createdAt)` | User activity view | High |
| `(action, createdAt)` | Action-type analysis | Medium |
| `(severity, status)` | Error/warning filtering | Low |
| `(aiRelated, createdAt)` | AI event filtering | Low |

### 14.3 Performance Considerations

| Concern | Mitigation |
|---|---|
| Rapid growth (456K/year) | Partition by month (future); efficient indexes |
| Complex filter combinations | Use composite indexes for common queries |
| Dual-write latency | Async write to PlatformAuditLog (fire-and-forget with warning log) |
| Long-running backfill | Batch processing with cursor; run in maintenance window |

---

## 15. Migration Plan

### 15.1 Sprint 3C: Schema Addition (Design Only — This Document)

| Step | Status |
|---|---|
| Design PlatformAuditLog model | ✅ Complete (this document) |
| Review with stakeholders | ⬜ Pending |
| Finalize field list | ⬜ Pending |
| Approve for implementation | ⬜ Pending |

### 15.2 Sprint 3D: Schema + Write Path

| Step | Status |
|---|---|
| Add `PlatformAuditLog` model to schema | ⬜ To do |
| Generate migration + `db push` | ⬜ To do |
| Create `writePlatformAuditLog()` helper | ⬜ To do |
| Add `resolvePlatformOrgFromEngagement()` helper | ⬜ To do |
| Wire AuditOS `recordAuditEvent()` to dual-write | ⬜ To do |
| Wire DecisionOS audit actions to dual-write | ⬜ To do |

### 15.3 Sprint 3E: Backfill

| Step | Status |
|---|---|
| Create `scripts/backfill-platform-audit-logs.ts` | ⬜ To do |
| Backfill AuditEvent records | ⬜ To do |
| Backfill AuditLog records | ⬜ To do |
| Verify count match | ⬜ To do |

### 15.4 Sprint 3F: Admin Page + Verification Script

| Step | Status |
|---|---|
| Create `/settings/audit-logs` admin page | ⬜ To do |
| Add filters (product, action, severity, date range) | ⬜ To do |
| Add detail view | ⬜ To do |
| Create `scripts/verify-platform-audit-logs.ts` | ⬜ To do |
| Add sidebar navigation link | ⬜ To do |

---

## 16. Rollback Plan

### 16.1 Schema Rollback

```sql
DROP TABLE "PlatformAuditLog";
```

**Impact:** All PlatformAuditLog data lost. Existing AuditEvent and AuditLog data intact.

### 16.2 Dual-Write Rollback

```typescript
// Remove writePlatformAuditLog() calls from:
// - recordAuditEvent() in services.ts
// - DecisionOS audit action handlers
```

**Impact:** Dual-write stops. New events go to legacy models only.

### 16.3 Backfill Rollback

```sql
DELETE FROM "PlatformAuditLog"
WHERE "metadata"->>'backfilledFrom' IS NOT NULL;
```

**Impact:** Backfilled records removed. Dual-written records (non-backfilled) preserved.

### 16.4 Full Rollback

1. Remove PlatformAuditLog admin page
2. Remove sidebar navigation
3. Remove dual-write code
4. Drop PlatformAuditLog table
5. Run full test suite

---

## 17. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Dual-write doubles write latency | Medium | Low | Async write with fire-and-forget; never block the primary action |
| PlatformOrg resolution fails for legacy records | Medium | Medium | Leave `platformOrganizationId` as NULL; log warning for monitoring |
| Duplicate events from dual-write + backfill | Medium | Low | Idempotency check via `metadata.originalId`; dedup on read |
| `actorId` inconsistency between AuditEvent and AuditLog | High | Medium | `actorType` field handles different actor identity schemes |
| Audit log table grows too fast | Medium | Medium | Index strategy; retention policy; archive old records |
| Cross-client data leak via audit query | Low | Critical | Always filter by `platformOrganizationId`; never allow cross-org queries |
| Admin page performance with 100K+ records | Low | Medium | Pagination; filtered queries with composite indexes |
| AI audit fields change frequently | Medium | Low | JSON `metadata` for extensibility; structured `ai*` fields for common queries |

---

## 18. No-Go Conditions

### Hard No-Go (Stop Immediately)

| Condition | Action |
|---|---|
| Dual-write blocks primary AuditEvent write | Remove dual-write; investigate |
| PlatformOrg resolution throws for any legacy record | Make resolution safe (nullable); use try/catch |
| Admin page allows cross-org audit queries | Fix query filter; security review |
| Backfill produces incorrect data | Stop backfill; rollback to last good state |

### Soft No-Go (Pause and Assess)

| Condition | Action |
|---|---|
| More than 5% of dual-writes have NULL `platformOrganizationId` | Fix resolution logic; improve backfill |
| Admin page loads slower than 3 seconds | Optimize indexes; paginate; cache |
| Backfill takes longer than planned maintenance window | Batch processing; incremental backfill |

---

## 19. Implementation Roadmap

```
Sprint 3C (Current): Design document
  │
Sprint 3D: Schema + Write Path
  ├── Add PlatformAuditLog model
  ├── Create writePlatformAuditLog() helper
  ├── Wire AuditOS dual-write
  └── Wire DecisionOS dual-write
  │
Sprint 3E: Backfill
  ├── Backfill AuditEvent → PlatformAuditLog
  ├── Backfill AuditLog → PlatformAuditLog
  └── Verify coverage
  │
Sprint 3F: Admin Page
  ├── /settings/audit-logs read-only page
  ├── Filters (product, action, severity, date range)
  ├── Detail view
  └── Sidebar nav link
  │
Future: PlatformAuditLog as Source of Truth
  ├── Migrate read paths to PlatformAuditLog
  ├── Deprecate legacy audit models on read
  └── Remove dual-write (write only to PlatformAuditLog)
```

---

## 20. Recommended Sprint 3D

**Sprint 3D: PlatformAuditLog Schema + Write Path**

1. Add `PlatformAuditLog` Prisma model
2. Create `writePlatformAuditLog()` helper in `src/lib/platform/audit-log.ts`
3. Create resolution helpers:
   - `resolvePlatformOrgFromEngagement(engagementId)`
   - `resolveWorkspaceFromEngagement(engagementId)`
   - `resolveProjectFromEngagement(engagementId)`
4. Wire AuditOS `recordAuditEvent()` to dual-write to `PlatformAuditLog`
5. Wire DecisionOS audit actions to dual-write
6. Create `scripts/verify-platform-audit-logs.ts`
7. Run validation (tsc, lint, build)
8. Do NOT add admin page yet — Sprint 3F

**Deliverables:**
- `prisma/schema.prisma` — add `PlatformAuditLog` model
- `src/lib/platform/audit-log.ts` — write helper + resolution helpers
- Modified AuditOS `services.ts` — dual-write in `recordAuditEvent()`
- Modified DecisionOS audit code — dual-write
- `scripts/verify-platform-audit-logs.ts`
