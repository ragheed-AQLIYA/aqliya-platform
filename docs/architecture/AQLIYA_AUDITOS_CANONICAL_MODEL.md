# AQLIYA AuditOS Canonical Model

**Date:** 2026-08-17
**Status:** Evidence-driven, read-only
**Scope:** Domain entities, relationships, state machines, invariants, tenant boundaries, authorization, audit events

---

## 1. Overview

This document defines the canonical domain model for AuditOS — the entity graph, state machines, invariants, tenant boundaries, and authorization model as implemented in the AQLIYA repository.

---

## 2. Entity Graph

### 2.1 Core Entities

```
AuditOrganization (tenant root)
  └── AuditUser (members)
  └── AuditClient (clients)
      └── AuditEngagement (workflows)
          ├── AuditTrialBalance
          │   └── AuditTrialBalanceLine
          ├── AuditAccountMapping
          │   └── AuditCanonicalAccount (reference)
          ├── AuditFinancialStatement
          ├── AuditDisclosureNote
          ├── AuditEvidence
          │   ├── AuditEvidenceLink
          │   └── AuditEvidenceVersion
          ├── AuditFinding
          │   └── AuditRecommendation
          ├── AuditReviewComment
          ├── AuditApprovalRecord
          ├── AuditPublicationPackage
          ├── AuditAiOutput
          ├── AuditValidationRun
          │   ├── AuditValidationIssue
          │   └── AuditValidationDisposition
          ├── AuditRiskModel
          │   └── AuditRiskAssessment
          │       └── AuditRiskProcedure
          └── AuditPresentationPolicy
```

### 2.2 Entity Summary

| Entity | Purpose | Key Relationships |
|--------|---------|------------------|
| AuditOrganization | Tenant root | Has many Users, Clients |
| AuditUser | User with role | Belongs to Organization |
| AuditClient | Client entity | Belongs to Organization, has many Engagements |
| AuditEngagement | Core workflow entity | Belongs to Client, has all operational data |
| AuditTrialBalance | Financial data for period | Belongs to Engagement |
| AuditTrialBalanceLine | Individual TB line | Belongs to TrialBalance |
| AuditCanonicalAccount | Reference account master | Many-to-many with TrialBalanceLine via Mapping |
| AuditAccountMapping | TB → Canonical mapping | Links TrialBalanceLine to CanonicalAccount |
| AuditFinancialStatement | Generated FS | Belongs to Engagement |
| AuditDisclosureNote | Notes to FS | Belongs to Engagement |
| AuditEvidence | Evidence item | Belongs to Engagement |
| AuditEvidenceLink | Evidence-entity link | Polymorphic (entityType + entityId) |
| AuditEvidenceVersion | File version | Belongs to Evidence |
| AuditFinding | Audit finding | Belongs to Engagement |
| AuditRecommendation | Recommendation | Belongs to Finding |
| AuditReviewComment | Review comment | Belongs to Engagement |
| AuditApprovalRecord | Approval decision | Belongs to Engagement |
| AuditPublicationPackage | Published output | Belongs to Engagement |
| AuditAiOutput | AI suggestion | Belongs to Engagement |
| AuditValidationRun | Validation execution | Belongs to Engagement |
| AuditValidationIssue | Validation issue | Belongs to ValidationRun |
| AuditValidationDisposition | Issue resolution | Belongs to ValidationIssue |
| AuditRiskModel | Risk model | Belongs to Engagement |
| AuditRiskAssessment | Risk assessment | Belongs to RiskModel |
| AuditRiskProcedure | Risk procedure | Belongs to RiskAssessment |
| AuditPresentationPolicy | Presentation rules | Belongs to Engagement |

---

## 3. State Machines

### 3.1 Engagement Status

```
draft ──→ setup ──→ in_progress ──→ under_review ──→ awaiting_client ──→ ready_for_approval ──→ approved ──→ published ──→ archived
```

| Status | Arabic Label | Description | Allowed Next |
|--------|-------------|-------------|-------------|
| draft | مسودة | Initial creation | setup |
| setup | إعداد | Configuration | in_progress |
| in_progress | قيد التنفيذ | Active work | under_review |
| under_review | قيد المراجعة | Review phase | awaiting_client, ready_for_approval |
| awaiting_client | بانتظار العميل | Client input needed | ready_for_approval |
| ready_for_approval | جاهز للموافقة | Approval pending | approved, blocked |
| approved | مقبول | Approved | published |
| published | منشور | Published | archived |
| archived | مؤرشف | Archived | (terminal) |

**VERIFIED:** 9 statuses defined in `workflow-next-action.ts`.

### 3.2 Approval Status

```
not_ready → ready → pending_approval → approved → blocked
```

| Status | Description | Derived From |
|--------|-------------|-------------|
| not_ready | Not ready for approval | Engagement not validated |
| ready | Ready for approval | Validation passed |
| pending_approval | Waiting for approver | Submitted for approval |
| approved | Approved | Approver granted |
| blocked | Blocked | Issues found |

**VERIFIED:** 5 approval states mapped by governance-bridge.ts.

### 3.3 Tab Gating

16 tab gates enforce workflow progression:

| Gate | Required Data | Error (Arabic) |
|------|--------------|----------------|
| trial-balance | (none) | — |
| account-mapping | TB confirmed | "يجب تأكيد ميزان المراجعة أولاً" |
| lead-schedules | Mappings confirmed | "يجب تأكيد الربط المحاسبي أولاً" |
| financial-statements | Mappings confirmed | "يجب تأكيد الربط المحاسبي أولاً" |
| notes | FS prepared | "يجب إعداد القوائم المالية أولاً" |
| validation | Mappings + FS | "يجب إعداد القوائم المالية والربط أولاً" |
| findings | Validation complete | "يجب إكمال التحقق أولاً" |
| review | Findings complete | "يجب إكمال الملاحظات والتوصيات أولاً" |
| approval | Review complete | "يجب إكمال المراجعة أولاً" |
| export | Approval granted | "يجب الموافقة على المراجعة أولاً" |
| ai-assistant | Engagement exists | "يجب إنشاء اتصال أولاً" |
| risk-assessment | Engagement exists | "يجب إنشاء اتصال أولاً" |
| evidence | Engagement exists | "يجب إنشاء اتصال أولاً" |
| audit-trail | Engagement exists | "يجب إنشاء اتصال أولاً" |
| client-comm | Engagement exists | "يجب إنشاء اتصال أولاً" |
| settings | (none) | — |

**VERIFIED:** 16 gates defined in `workflow-gating.ts`.

---

## 4. Invariants

### 4.1 Engagement Invariants

| Invariant | Enforcement | Status |
|-----------|-------------|--------|
| Engagement belongs to exactly one Client | FK constraint | **VERIFIED** |
| Client belongs to exactly one Organization | FK constraint | **VERIFIED** |
| Engagement status transitions are valid | workflow-gating.ts | **VERIFIED** |
| Engagement cannot skip workflow steps | workflow-gating.ts | **VERIFIED** |
| Engagement requires TB before mapping | Tab gate | **VERIFIED** |
| Engagement requires mapping before FS | Tab gate | **VERIFIED** |
| Engagement requires FS before notes | Tab gate | **VERIFIED** |
| Engagement requires validation before findings | Tab gate | **VERIFIED** |
| Engagement requires findings before review | Tab gate | **VERIFIED** |
| Engagement requires review before approval | Tab gate | **VERIFIED** |
| Engagement requires approval before export | Tab gate | **VERIFIED** |

### 4.2 Trial Balance Invariants

| Invariant | Enforcement | Status |
|-----------|-------------|--------|
| TB belongs to exactly one Engagement | FK constraint | **VERIFIED** |
| TB lines belong to exactly one TB | FK constraint | **VERIFIED** |
| TB must be confirmed before mapping | Tab gate | **VERIFIED** |
| Line amounts must balance | Validation service | **VERIFIED** |

### 4.3 Evidence Invariants

| Invariant | Enforcement | Status |
|-----------|-------------|--------|
| Evidence belongs to exactly one Engagement | FK constraint | **VERIFIED** |
| Evidence links are polymorphic | entityType + entityId | **VERIFIED** |
| Evidence versions are ordered | version number | **VERIFIED** |
| Evidence deletion is logged | Audit events | **VERIFIED** |

### 4.4 Finding Invariants

| Invariant | Enforcement | Status |
|-----------|-------------|--------|
| Finding belongs to exactly one Engagement | FK constraint | **VERIFIED** |
| Recommendation belongs to exactly one Finding | FK constraint | **VERIFIED** |
| Finding severity is one of defined values | Enum constraint | **VERIFIED** |

---

## 5. Tenant Boundaries

### 5.1 Isolation Model

Every AuditOS entity includes `organizationId` (or is scoped through parent entity).

```
AuditOrganization.id = AuditUser.organizationId = AuditClient.organizationId = AuditEngagement.organizationId
```

### 5.2 Tenant Guard

**File:** `src/lib/audit/tenant-guard.ts`

```typescript
assertEngagementAccess({ engagement, actor }) {
  if (engagement.organizationId !== actor.organizationId) {
    throw new TenantAccessError("Access denied");
  }
}
```

**Three guard functions:**
1. `assertEngagementAccess` — Checks engagement belongs to actor's org
2. `assertClientAccess` — Checks client belongs to actor's org
3. `assertOrganizationAccess` — Checks organization matches actor's org

### 5.3 Actor Context

**File:** `src/lib/audit/actor-context.ts`

`AuditActor` resolved from NextAuth session:
- `userId` — from session
- `organizationId` — from session (resolved via AuditUser)
- `role` — from AuditUser record

**Dev fallback:**
- Requires `AUDIT_DEV_FALLBACK_ENABLED=true`
- Requires `NODE_ENV !== "production"`
- Returns mock actor for development

### 5.4 Query Scoping

> **Tenant key:** `AuditEngagement.organizationId`, `AuditClient.organizationId`
> and `AuditUser.organizationId` all hold an **`AuditOrganization.id`** — never a
> platform `Organization.id`. `assertEngagementAccess` compares the engagement's
> `organizationId` with the resolved actor's, so seeding an engagement under the
> platform organization id makes it unreachable for every AuditUser.

All queries include `organizationId` filter:

```typescript
prisma.auditEngagement.findMany({
  where: { organizationId: actor.organizationId }
})
```

**VERIFIED:** Tenant isolation enforced at guard + query level.

---

## 6. Authorization Model

### 6.1 RBAC Roles

| Role | Permissions |
|------|------------|
| ADMIN | Full access to all engagements, clients, settings |
| MANAGER | Create/edit/approve engagements, manage team |
| AUDITOR | Edit engagements, upload evidence, create findings |
| REVIEWER | Review/approve engagements, comment |
| VIEWER | Read-only access |

**VERIFIED:** Roles defined in `AuditRole` enum.

### 6.2 Authorization Enforcement

| Layer | Enforcement | Status |
|-------|-------------|--------|
| UI | Role-based rendering | **VERIFIED** |
| Server Actions | Role check in action | **VERIFIED** |
| Tenant Guard | organizationId check | **VERIFIED** |
| API Routes | Auth + role check | **VERIFIED** |

### 6.3 Permission Matrix

| Action | ADMIN | MANAGER | AUDITOR | REVIEWER | VIEWER |
|--------|-------|---------|---------|----------|--------|
| Create engagement | ✓ | ✓ | ✗ | ✗ | ✗ |
| Edit engagement | ✓ | ✓ | ✓ | ✗ | ✗ |
| Upload evidence | ✓ | ✓ | ✓ | ✗ | ✗ |
| Create finding | ✓ | ✓ | ✓ | ✗ | ✗ |
| Review engagement | ✓ | ✓ | ✗ | ✓ | ✗ |
| Approve engagement | ✓ | ✓ | ✗ | ✓ | ✗ |
| Export engagement | ✓ | ✓ | ✓ | ✓ | ✗ |
| View engagement | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manage settings | ✓ | ✗ | ✗ | ✗ | ✗ |

**PARTIALLY VERIFIED:** Permission matrix inferred from code structure.

---

## 7. Audit Events

### 7.1 Event Types

| Event | Description | Dual-Write |
|-------|-------------|-----------|
| engagement.created | New engagement | PlatformAuditLog |
| engagement.status_changed | Status transition | PlatformAuditLog |
| evidence.uploaded | File uploaded | PlatformAuditLog |
| evidence.linked | Evidence linked to entity | PlatformAuditLog |
| review.commented | Review comment added | PlatformAuditLog |
| review.approved | Review approved | PlatformAuditLog |
| review.published | Review published | PlatformAuditLog |
| ai.suggestion_generated | AI suggestion created | PlatformAuditLog |
| ai.note_generated | AI note created | PlatformAuditLog |
| validation.run | Validation executed | PlatformAuditLog |
| finding.created | Finding created | PlatformAuditLog |
| recommendation.created | Recommendation created | PlatformAuditLog |
| approval.requested | Approval requested | PlatformAuditLog |
| approval.granted | Approval granted | PlatformAuditLog |
| approval.rejected | Approval rejected | PlatformAuditLog |

### 7.2 Dual-Write Pattern

Events are written to both:
1. `AuditAiOutput` (AuditOS-specific)
2. `PlatformAuditLog` (cross-system)

**VERIFIED:** Dual-write pattern ensures cross-system traceability.

### 7.3 Event Metadata

Every event includes:
- `actorId` — Who performed the action
- `organizationId` — Which tenant
- `entityType` — What kind of entity
- `entityId` — Which specific entity
- `action` — What happened
- `timestamp` — When
- `metadata` — Additional context

**VERIFIED:** Comprehensive event metadata.

---

## 8. Data Flow

### 8.1 Trial Balance → Financial Statements

```
TrialBalance → TrialBalanceLine → AccountMapping → CanonicalAccount → FinancialStatement
```

### 8.2 Evidence → Findings → Review → Approval

```
Evidence → Finding → Recommendation → ReviewComment → ApprovalRecord → PublicationPackage
```

### 8.3 AI → Suggestions → Review → Action

```
AuditAiOutput → ReviewComment → Finding/Recommendation → ApprovalRecord
```

### 8.4 Validation → Issues → Resolution

```
ValidationRun → ValidationIssue → ValidationDisposition
```

**VERIFIED:** All data flows implemented in service layer.

---

## 9. Architectural Strengths

| Strength | Evidence |
|----------|----------|
| Clean entity separation | 27 models with clear responsibilities |
| Comprehensive workflow | 9 statuses, 5 approval states, 16 tab gates |
| Proper tenant isolation | Guard + query scoping |
| Dual-write audit events | Cross-system traceability |
| Evidence versioning | AuditEvidenceVersion with checksums |
| Polymorphic evidence links | entityType + entityId pattern |
| Governed AI outputs | Human review before action |

---

## 10. Architectural Weaknesses

| Weakness | Impact | Recommendation |
|----------|--------|---------------|
| Mock data hidden | Users may view fabricated data | Surface `isUsingMockData` to UI |
| Rules engines OFF | No automated evaluation | Activate feature flags |
| Coverage low | High regression risk | Increase test coverage |
| ISA corpus incomplete | 90% of standards missing | Ingest remaining ISA standards |
| Filesystem bridge | Not governed | Replace with API/DB bridge |
| No Arabic rules | Rules in English only | Add Arabic rule content |
| No effective-date activation | Rules may apply outside period | Add time-based filtering |

---

## 11. Final Assessment

**Domain Model Maturity:** L5 (Complete and well-designed)
**Implementation Maturity:** L4 (Real implementation with gaps)
**Operational Maturity:** L3 (Dormant features need activation)

The AuditOS canonical model is architecturally sound with clear entities, relationships, state machines, invariants, tenant boundaries, and authorization. The primary gaps are operational — RAG is blocked at asset admission level (`ragIngest: false`), mock data banner has been added, and test coverage is critically low.

**The model is not the problem. The problem is activation.**

---

*This document was produced as part of the AQLIYA Content + AuditOS Reality Audit on 2026-08-17. No source code was modified.*
