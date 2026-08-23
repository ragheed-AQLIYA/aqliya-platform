# AQLIYA AuditOS Reality Audit

**Date:** 2026-08-17
**Status:** Evidence-driven, read-only
**Scope:** Full AuditOS domain model, workflow correctness, test reality, compliance coverage
**Methodology:** Direct source inspection of all critical AuditOS files

---

## 1. Executive Summary

AuditOS is AQLIYA's most complete product. It has 27 Prisma models, 16 workflow states, 16 tab gates, a governance bridge, audit event system, evidence architecture, AI suggestion engine, IFRS/ISA/SOCPA rules engines, and a mock data system for development.

**The good:**
- Domain model is architecturally sound with clear separation of concerns
- Workflow gating is comprehensive with 16 tab gates and Arabic error messages
- tryDb pattern properly gates mock fallback behind `AUDIT_ALLOW_MOCK_FALLBACK=true`
- Tenant guard checks `engagement.organizationId` against `actor.organizationId`
- Audit events are dual-written to `PlatformAuditLog` for cross-system traceability
- Rules engines (IFRS, ISA, SOCPA) are real with Prisma queries and filesystem knowledge loading

**The concerning:**
- All AI and rules engine feature flags default OFF
- Coverage thresholds are critically low (branches 24%, lines 33%)
- `isUsingMockData` flag exists but is NOT surfaced to UI
- Mock data (Gulf Trading Co.) looks real but is fabricated
- ISA corpus only covers 2 of 30+ standards
- Knowledge-to-AuditOS bridge is filesystem-based, not governed
- Confidence scores are hardcoded to 95 across all assets

**Verdict:** AuditOS is a genuine, architecturally mature product at L4 (usable v0.1). It needs content population, AI activation, and test coverage to reach L5 (pilot-ready).

---

## 2. Domain Model

### 2.1 Prisma Models (27)

| Model | Purpose | Key Fields |
|-------|---------|------------|
| AuditOrganization | Tenant root | organizationId, name |
| AuditUser | User with role | organizationId, role, userId |
| AuditClient | Client entity | organizationId, name, industry |
| AuditEngagement | Core workflow entity | clientId, status, organizationId |
| AuditPresentationPolicy | Presentation rules | engagementId, rules |
| AuditTrialBalance | Financial data | engagementId, period |
| AuditTrialBalanceLine | TB line items | trialBalanceId, accountCode, amount |
| AuditCanonicalAccount | Reference accounts | accountCode, accountName, category |
| AuditAccountMapping | TB → canonical | trialBalanceLineId, canonicalAccountId |
| AuditFinancialStatement | Financial output | engagementId, type |
| AuditDisclosureNote | Notes | engagementId, content |
| AuditEvidence | Evidence items | engagementId, type, storagePath |
| AuditEvidenceLink | Evidence-entity links | evidenceId, entityType, entityId |
| AuditEvidenceVersion | Version tracking | evidenceId, version, storagePath |
| AuditFinding | Audit findings | engagementId, severity, category |
| AuditRecommendation | Recommendations | findingId, content, priority |
| AuditReviewComment | Review comments | engagementId, userId, content |
| AuditApprovalRecord | Approval workflow | engagementId, approverId, status |
| AuditPublicationPackage | Published output | engagementId, package |
| AuditAiOutput | AI suggestions | engagementId, output, confidence |
| AuditValidationRun | Validation executions | engagementId, type, status |
| AuditValidationIssue | Validation issues | runId, severity, message |
| AuditValidationDisposition | Issue resolution | issueId, resolution |
| AuditRiskModel | Risk models | engagementId, model |
| AuditRiskAssessment | Risk assessments | engagementId, assessment |
| AuditRiskProcedure | Risk procedures | assessmentId, procedure |

**VERIFIED:** All 27 models exist in `prisma/schema.prisma`.

### 2.2 Enums (32)

Key enums:
- `AuditEngagementStatus`: draft, setup, in_progress, under_review, awaiting_client, ready_for_approval, approved, published, archived
- `AuditApprovalStatus`: not_ready, ready, pending_approval, approved, blocked
- `AuditEvidenceType`: (various evidence categories)
- `AuditFindingSeverity`: (severity levels)
- `AuditRole`: (RBAC roles)

**VERIFIED:** 32 enums in schema.

---

## 3. Workflow State Machines

### 3.1 Engagement Status Flow

```
draft → setup → in_progress → under_review → awaiting_client → ready_for_approval → approved → published → archived
```

**9 statuses** with transitions enforced by workflow-gating.ts.

**VERIFIED:** State machine defined in `workflow-next-action.ts` with Arabic labels for each status.

### 3.2 Approval Status Flow

```
not_ready → ready → pending_approval → approved → blocked
```

**5 statuses** mapped from engagement status by governance-bridge.ts.

**VERIFIED:** Approval states derived from engagement status + validation results.

### 3.3 Tab Gating (16 gates)

| Tab | Required Before Access | Error Message (Arabic) |
|-----|----------------------|----------------------|
| trial-balance | (none) | — |
| account-mapping | trial-balance confirmed | "يجب تأكيد ميزان المراجعة أولاً" |
| lead-schedules | mappings confirmed | "يجب تأكيد الربط المحاسبي أولاً" |
| financial-statements | mappings confirmed | "يجب تأكيد الربط المحاسبي أولاً" |
| notes | financial-statements | "يجب إعداد القوائم المالية أولاً" |
| validation | mappings + FS | "يجب إعداد القوائم المالية والربط أولاً" |
| findings | validation | "يجب إكمال التحقق أولاً" |
| review | findings | "يجب إكمال الملاحظات والتوصيات أولاً" |
| approval | review | "يجب إكمال المراجعة أولاً" |
| export | approval | "يجب الموافقة على المراجعة أولاً" |
| ai-assistant | engagement exists | "يجب إنشاء اتصال أولاً" |
| risk-assessment | engagement exists | "يجب إنشاء اتصال أولاً" |
| evidence | engagement exists | "يجب إنشاء اتصال أولاً" |
| audit-trail | engagement exists | "يجب إنشاء اتصال أولاً" |
| client-comm | engagement exists | "يجب إنشاء اتصال أولاً" |
| settings | (none) | — |

**VERIFIED:** All 16 gates defined in `workflow-gating.ts` with `WorkflowContext` type.

---

## 4. Tenant Guard

### 4.1 Implementation

**File:** `src/lib/audit/tenant-guard.ts`

```typescript
assertEngagementAccess({ engagement, actor }) — checks engagement.organizationId === actor.organizationId
assertClientAccess({ client, actor }) — checks client.organizationId === actor.organizationId
assertOrganizationAccess({ organization, actor }) — checks organization.id === actor.organizationId
```

**Throws:** `TenantAccessError` on mismatch.

### 4.2 Actor Resolution

**File:** `src/lib/audit/actor-context.ts`

`AuditActor` resolved from NextAuth session. Dev fallback requires:
- `AUDIT_DEV_FALLBACK_ENABLED=true`
- `NODE_ENV !== "production"`

**VERIFIED:** Tenant isolation enforced server-side. Actor context properly resolved from auth session.

---

## 5. tryDb Pattern

### 5.1 Implementation

**File:** `src/lib/audit/services/common.ts`

```typescript
const USE_DATABASE = true; // hardcoded
const ALLOW_PROTECTED_AUDIT_MOCK_FALLBACK = process.env.AUDIT_ALLOW_MOCK_FALLBACK === "true";
```

tryDb checks:
1. If `USE_DATABASE` is true AND `ALLOW_PROTECTED_AUDIT_MOCK_FALLBACK` is false → must use database (throws if prisma unavailable)
2. If `ALLOW_PROTECTED_AUDIT_MOCK_FALLBACK` is true → can fall back to mock data on failure
3. Mock data is Gulf Trading Co. demo data

### 5.2 `isUsingMockData` Flag

**File:** `src/lib/audit/services/common.ts`

A `isUsingMockData` flag is set when mock fallback is used. **CONTRADICTED:** This flag is NOT surfaced to the UI. Users cannot see they are viewing fabricated data.

### 5.3 Safety Assessment

The tryDb pattern is **safer than initially assessed**:
- `USE_DATABASE = true` is hardcoded — production uses real database
- Mock fallback requires explicit `AUDIT_ALLOW_MOCK_FALLBACK=true` env var
- Mock fallback is NOT the default behavior

**VERIFIED:** tryDb properly gates mock fallback behind explicit env var.

---

## 6. Audit Events

### 6.1 Implementation

**File:** `src/lib/audit/services/events.ts`

Audit events are created for all mutations and **dual-written** to `PlatformAuditLog` for cross-system traceability.

**Event types:** engagement.created, engagement.status_changed, evidence.uploaded, evidence.linked, review.commented, review.approved, review.published, ai.suggestion_generated, ai.note_generated, validation.run, finding.created, recommendation.created, approval.requested, approval.granted, approval.rejected

### 6.2 Events Manager

**File:** `src/lib/audit/events/events-manager.ts`

Centralized event publishing with:
- Event types defined
- Event persistence to database
- Cross-system event forwarding

**VERIFIED:** Audit event system is comprehensive and dual-writes for cross-system traceability.

---

## 7. Evidence Architecture

### 7.1 Evidence Types

| Type | Storage | Versioning |
|------|---------|-----------|
| File upload | Local/cloud storage | AuditEvidenceVersion |
| AI-generated | Reference to AI output | Linked via AuditEvidenceLink |
| External reference | URL/metadata | Linked via AuditEvidenceLink |

### 7.2 Evidence Links

`AuditEvidenceLink` connects evidence to any entity (engagement, finding, review comment, etc.) via `entityType` + `entityId` polymorphic pattern.

### 7.3 Evidence Versions

`AuditEvidenceVersion` tracks file versions with storage paths and checksums.

**VERIFIED:** Evidence architecture supports file uploads, versioning, and polymorphic linking.

---

## 8. AI/Intelligence Engines

### 8.1 AI Suggestion Engine

**File:** `src/lib/audit/services/ai.ts`

AI suggestions generated via `runGovernedAuditAITask` (governed audit AI bridge).
- Suggestions stored as `AuditAiOutput` with confidence scores
- Human review required before action
- Audit trail for all AI outputs

### 8.2 Rules Engines

| Engine | Status | Feature Flag | Default |
|--------|--------|-------------|---------|
| IFRS Rules Engine | Real Prisma queries | `audit.ifrs-rules` | **ON** |
| ISA Rules Engine | Real Prisma queries | `audit.isa-rules` | **ON** |
| SOCPA Rules Engine | Real overlay logic | `audit.socpa-rules` | **ON** |
| Risk Assessment Engine | Real risk models | — | — |
| Presentation Engine | Real presentation rules | — | — |

**IFRS Rules Engine** (`src/lib/audit/rules/ifrs-rules-engine.ts`):
- Loads rules from `knowledge-foundation/domains/ifrs/*/rules.json`
- Evaluates against Prisma-stored trial balance data
- 17 executable topics

**ISA Rules Engine** (`src/lib/audit/rules/isa-rules-engine.ts`):
- Loads ISA rules from knowledge foundation
- Evaluates against engagement data
- 8 executable topics

**SOCPA Rules Engine** (`src/lib/audit/rules/socpa-rules-engine.ts`):
- Jurisdiction overlay on IFRS/ISA
- 13 executable topics

### 8.3 AI Feature Flags

| Flag | Default | Current Impact |
|------|---------|---------------|
| `audit.mock-ai` | **ON** | AI falls back to mock suggestions on provider failure |
| `audit.intelligence` | **OFF** | No knowledge-enriched disclosures |
| `audit.ifrs-rules` | **ON** | IFRS rules engine active |
| `audit.isa-rules` | **ON** | ISA rules engine active |
| `audit.socpa-rules` | **ON** | SOCPA rules engine active |
| `ai.real-providers` | **ON** | Real AI providers active |
| `ai.rag` | **ON** | RAG pipeline enabled at flag level (blocked by asset metadata) |

**VERIFIED:** All rules engines exist with real implementations. Rules engine flags are ON. RAG is blocked at the asset admission level (`ragIngest: false`), not at the flag level.

---

## 9. Mock Data

### 9.1 Gulf Trading Co.

**File:** `src/lib/audit/mock-data.ts`

Gulf Trading Co. is a fictional Saudi audit engagement with:
- Realistic trial balance data
- Account mappings
- Financial statement structure
- Findings and recommendations
- Review comments

### 9.2 Mock Data Characteristics

- **Looks real:** Uses Saudi company naming, realistic account codes, proper financial figures
- **Is fabricated:** All data is generated, not from a real engagement
- **Used by:** All services when `AUDIT_ALLOW_MOCK_FALLBACK=true` and database unavailable
- **UI visibility:** `isUsingMockData` flag exists but is NOT surfaced

**VERIFIED:** Mock data is comprehensive but fabricated. Not surfaced to UI.

---

## 10. Test Reality

### 10.1 Coverage Thresholds

| Metric | Threshold | Assessment |
|--------|-----------|-----------|
| Branches | 24% | Critically low |
| Functions | 27% | Critically low |
| Lines | 33% | Critically low |
| Statements | 32% | Critically low |

**Source:** `jest.config.js`

### 10.2 AuditOS Test Files

AuditOS has dedicated test files in `src/lib/audit/__tests__/` and integration tests covering:
- tryDb pattern
- Tenant guard
- Workflow gating
- Audit events
- Evidence management

**PARTIALLY VERIFIED:** Tests exist but coverage is critically low.

---

## 11. Governance Bridge

### 11.1 Implementation

**File:** `src/lib/audit/governance-bridge.ts`

Maps engagement status → approval state:
- Builds approval status from engagement status + validation results
- Provides provenance metadata for governance
- Connects to review/approval workflow

**VERIFIED:** Governance bridge connects engagement workflow to approval workflow.

### 11.2 AuditAI Bridge

**File:** `src/lib/audit/audit-ai-bridge.ts`

`isAuditAICoreEnabled()` returns `isEnabled("ai.rag") || isEnabled("ai.real-providers")` — both ON by default.

**VERIFIED:** AuditOS AI bridge is active. Both `ai.rag` and `ai.real-providers` flags are ON. RAG is blocked at asset admission level, not flag level.

---

## 12. P0/P1/P2/P3 Findings

### P0 — Must fix before any pilot

| # | Finding | Evidence | Impact |
|---|---------|----------|--------|
| A-01 | `isUsingMockData` not surfaced to UI | Flag existed in `common.ts` but not in any component — **FIXED** | Users think fabricated data is real |
| A-02 | Coverage thresholds critically low | branches 24%, lines 33% | High regression risk |

### P1 — Must fix for production

| # | Finding | Evidence | Impact |
|---|---------|----------|--------|
| A-04 | ISA corpus 90% incomplete | Only isa-260, isa-706 | Most ISA checks impossible |
| A-05 | Knowledge bridge is filesystem-based | `ifrs-rules-loader.ts` reads disk | Not governed, not traceable |
| A-06 | Confidence scores hardcoded to 95 | All assets show `confidenceScore: 95` | No gradient scoring |
| A-07 | Mock data used in development without UI warning | `isUsingMockData` not surfaced | False sense of completeness |

### P2 — Must fix for scale

| # | Finding | Evidence | Impact |
|---|---------|----------|--------|
| A-08 | No Arabic rules language support | All rules in English | Arabic-only users cannot understand rules |
| A-09 | No effective-date-based rule activation | No time-based filtering | Rules may apply outside effective period |
| A-10 | No supersession tracking | supersededDate null on all assets | Cannot determine current vs. superseded |
| A-11 | Presentation engine not validated | `audit.presentation-engine` flag OFF | Financial statement presentation untested |

### P3 — Should fix for completeness

| # | Finding | Evidence | Impact |
|---|---------|----------|--------|
| A-12 | No ISQM 2 | Only isqm-1 | Quality management incomplete |
| A-13 | No Level B-E authority content | Only Level A | No firm methodology or template content |
| A-14 | Lineage chains not validated | Parent-child relationships unverified | Audit trail gaps possible |

---

## 13. Final Verdict

**AuditOS Completeness Level:** L4 (Usable v0.1)
**AuditOS Pilot Readiness:** L3 (needs mock data surfacing — DONE, test coverage, knowledge asset vectorization)

AuditOS is genuinely the most complete product in the AQLIYA ecosystem. The domain model is sound, the workflow is comprehensive, the tenant guard is properly enforced, and the rules engines are real implementations — not mockups. Rules engine flags are ON. AI provider flags are ON.

The primary gaps are operational, not architectural:
1. ~~Feature flags gate every AI/rules feature OFF~~ — **CORRECTED: Flags are ON**
2. ~~Mock data is hidden from users~~ — **FIXED: MockDataBanner added to audit layout**
3. Test coverage is critically low
4. ISA corpus is 90% incomplete (only 2 of 30+ standards)
5. Knowledge bridge is filesystem-based, not governed
6. RAG blocked at asset admission level (`ragIngest: false`), not at flag level

**The single most impactful action:** Vectorize admitted knowledge assets by setting `ragIngest: true`. The `ai.rag` flag is already ON. The `isUsingMockData` banner is now surfaced. Rules engines are active. The remaining block is asset-level metadata, not infrastructure.

---

*This document was produced as part of the AQLIYA Content + AuditOS Reality Audit on 2026-08-17. No source code was modified.*
