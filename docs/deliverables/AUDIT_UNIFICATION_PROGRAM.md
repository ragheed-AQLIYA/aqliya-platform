# Phase 4 — Audit Event Unification Program

**Date:** 2026-06-20  
**Scope:** Complete audit-event architecture review — models, services, event types, loggers  
**Data Sources:** Prisma schema, `src/lib/platform/audit*`, all product audit files, `src/core/audit/`

---

## Executive Summary

AQLIYA has **11 separate Prisma models** for audit/event tracking, **5 product-specific audit write services**, **3 platform-level write paths**, and **zero product adoptions** of the platform audit abstraction. The resulting fragmentation prevents cross-product forensic queries, bypasses hash-chain tamper protection for most product data, and forces each product team to reimplement audit logging.

This is the single highest-leverage architectural improvement available: unifying audit events would enable cross-product forensics, tamper-evident protection for all data, AI governance traceability, and operational observability.

**Audit Architecture Score: 3.5/10** — fragmented, incompletely adopted, high consolidation value

---

## 1. All Audit Models — Complete Inventory

### 1.1 Prisma Models (11)

| # | Model | Lines | Table | Key Fields | Product |
|---|-------|-------|-------|------------|---------|
| 1 | `PlatformAuditLog` | 249-291 | `platform_audit_logs` | productKey, action, actorId, actorType, actorEmail, targetType, targetId, severity, status, aiModelUsed, aiConfidence, evidenceRefs, sourceSystem, requestId, sessionId, metadata, organizationId, workspaceId, projectId | Platform Core |
| 2 | `HashChainEntry` | 3340 | `hash_chain_entries` | auditLogId (FK→PlatformAuditLog), previousHash, chainHash, nonce | Platform Core |
| 3 | `AuditEvent` | 1433 | `audit_events` | engagementId, eventType, actorId, actorName, actorRole, targetType, targetId, previousState, newState, description, aiRelated | AuditOS |
| 4 | `LocalContentAuditEvent` | 1984 | `local_content_audit_events` | projectId, actorId, action, entityType, entityId, before, after, metadata | LocalContentOS |
| 5 | `LcAiAuditEvent` | 4918 | `lc_ai_audit_events` | organizationId, projectId, workbookId, action, providerId, modelVersion, promptVersion, confidence, status, inputSummary, outputSummary, warningCount, durationMs | LocalContentOS AI |
| 6 | `SunbulAuditEvent` | 1737 | `sunbul_audit_events` | clientId, recordId, actorId, action (SunbulAuditAction enum), entityType, entityId, metadata | WorkflowOS/Sunbul |
| 7 | `SalesAuditEvent` | 2417 | `sales_audit_events` | organizationId, actorId, action, targetType, targetId, metadata | SalesOS |
| 8 | `WorkflowAuditEvent` | 2628 | `workflow_audit_events` | recordId, action, actorId, timestamp, details | WorkflowOS |
| 9 | `InstitutionalMemoryEvent` | 2767 | `institutional_memory_events` | sourceType, sourceId, eventType, metadata, organizationId, actorId | Institutional Memory |
| 10 | `ScimProvisioningEvent` | 2984 | `scim_provisioning_events` | principalType, principalId, action, status, details, requestedBy | SCIM |
| 11 | `DecisionGovEvent` | 3570 | `decision_gov_events` | decisionId, eventType, actorId, details, timestamp | DecisionOS |

### 1.2 Additional Models (Audit-Adjacent)

| Model | Purpose | Relation |
|-------|---------|----------|
| `AuditLog` | DecisionOS audit trail | DecisionOS-specific (line 817) |
| `AuditAiOutput` | AuditOS AI output tracking | Links to AuditOS AI actions |
| `AuditEvidenceVersion` | Evidence version history | Evidence versioning |

### 1.3 Audit Write Services (6)

| # | Service | File | Model | Used By |
|---|---------|------|-------|---------|
| 1 | `writePlatformAuditLog()` | `platform/audit-log.ts` | PlatformAuditLog | Middleware, platform core |
| 2 | `auditLogger()` factory | `platform/audit-logger.ts` | PlatformAuditLog | Convenience layer |
| 3 | `writeAuditEvent()` / `dualWrite()` | `platform/audit-event-service.ts` | PlatformAuditLog | Legacy |
| 4 | `createLocalContentAuditEvent()` | `local-content/audit-events.ts` | LocalContentAuditEvent | LocalContentOS |
| 5 | `createWorkflowAuditEvent()` | `workflowos/audit.ts` | SunbulAuditEvent | WorkflowOS/Sunbul |
| 6 | `recordSalesAuditEvent()` | `sales/audit-events.ts` | SalesAuditEvent | SalesOS |

### 1.4 Hash Chain Protection

| Table | Hash Chain Protected? | How |
|-------|----------------------|-----|
| PlatformAuditLog | **YES** | HashChainEntry (1:1), SHA-256 + PoW nonce |
| AuditEvent | NO | — |
| LocalContentAuditEvent | NO | — |
| LcAiAuditEvent | NO | — |
| SunbulAuditEvent | NO | — |
| SalesAuditEvent | NO | — |
| WorkflowAuditEvent | NO | — |
| InstitutionalMemoryEvent | NO | — |
| ScimProvisioningEvent | NO | — |
| DecisionGovEvent | NO | — |

---

## 2. Current State Architecture

```
                    ┌─────────────────────────┐
                    │   Middleware / Platform  │
                    │      Core Actions        │
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │   PlatformAuditLog      │
                    │   + HashChainEntry      │
                    │   (hash chain protected)│
                    └─────────────────────────┘
                                ▲
                    NO PRODUCTS USE THIS PATH

┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ AuditOS  │  │   LC     │  │  Sales   │  │Workflow  │  │Decision  │
│AuditEvent│  │LCAuditEv │  │SalesAudi │  │WorkflowAE│  │GovEvent  │
│          │  │LcAiAudit │  │   tEvent │  │SunbulAE  │  │AuditLog  │
└──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
  (no chain)    (no chain)   (no chain)    (no chain)    (no chain)
```

**Key problem:** The platform invested heavily in a production-grade audit infrastructure (PlatformAuditLog + hash chain) that no product uses. Each product built its own audit model from scratch.

---

## 3. Target State Architecture

### 3.1 Unified PlatformAuditEvent Design

```typescript
// Proposed unified model

enum AuditEventCategory {
  // Workflow
  WORKFLOW_TRANSITION,
  TASK_COMPLETED,
  REVIEW_SUBMITTED,
  APPROVAL_GRANTED,
  APPROVAL_REJECTED,
  APPROVAL_REVOKED,
  
  // Data
  RESOURCE_CREATED,
  RESOURCE_UPDATED,
  RESOURCE_DELETED,
  RESOURCE_ARCHIVED,
  RESOURCE_RESTORED,
  
  // AI
  AI_EXECUTION,
  AI_OUTPUT_GENERATED,
  AI_OUTPUT_REVIEWED,
  AI_OUTPUT_ACCEPTED,
  AI_OUTPUT_REJECTED,
  
  // Governance
  GOVERNANCE_EVENT,
  EVIDENCE_ATTACHED,
  EVIDENCE_VERIFIED,
  EVIDENCE_REJECTED,
  COMPLIANCE_CHECK,
  
  // Security
  AUTHENTICATION,
  AUTHORIZATION_DENIED,
  EXPORT_PERFORMED,
  DOWNLOAD_PERFORMED,
  
  // Integration
  INTEGRATION_SYNC,
  INTEGRATION_ERROR,
  WEBHOOK_DELIVERED
}

interface PlatformAuditEvent {
  id: string;
  organizationId: string;
  workspaceId?: string;
  projectId?: string;
  
  // Actor
  actorId: string;
  actorType: 'user' | 'system' | 'ai_agent' | 'integration';
  actorEmail?: string;
  actorName?: string;
  
  // Action
  category: AuditEventCategory;
  action: string;  // Free-text action within category
  severity: 'info' | 'warning' | 'error' | 'critical';
  
  // Resource
  resourceType: string;  // Product-specific: "audit_engagement", "sales_deal", etc.
  resourceId: string;
  resourceLabel?: string;
  
  // State changes
  previousState?: string;
  newState?: string;
  
  // AI provenance
  aiProviderId?: string;
  aiModelVersion?: string;
  aiConfidence?: number;
  aiPromptVersion?: string;
  aiInputSummary?: string;
  aiOutputSummary?: string;
  aiDurationMs?: number;
  
  // Evidence
  evidenceRefs?: string[];  // IDs of AuditEvidence or similar
  
  // Technical
  sourceSystem: string;
  requestId?: string;
  sessionId?: string;
  correlationId?: string;  // Links events across products
  ipAddress?: string;
  userAgent?: string;
  
  // Metadata (flexible)
  metadata: Record<string, unknown>;
  
  // Timestamps
  timestamp: Date;
  createdAt: Date;
}
```

### 3.2 Dual-Write Pattern

Every product should dual-write audit events:

```
Product Action
    │
    ├──→ Product-specific audit table (existing)
    │     Store: minimal local context for product queries
    │     e.g., SalesAuditEvent with sales-specific fields
    │
    └──→ PlatformAuditEvent
          Store: unified cross-product format
          Protected by HashChain
          Searchable across all products
```

**Why dual-write instead of replace?**
- Product-specific tables have optimized schemas for product queries
- Migration from 11 tables to 1 would be months of work
- Dual-write can be added incrementally, product by product
- Eventual goal: replace product tables with views/queries on PlatformAuditEvent

### 3.3 Hash Chain Protection for All Products

Extend the hash chain to protect product-specific audit tables:

```typescript
// Each product table gets a hash chain entry referencing its own record
// HashChainEntry becomes polymorphic:
model HashChainEntry {
  id           String   @id @default(cuid())
  
  // Polymorphic reference (was: auditLogId only)
  sourceTable  String   // "platform_audit_log" | "audit_events" | "sales_audit_events" | etc.
  sourceRowId  String   // The ID in the source table
  
  previousHash String
  chainHash    String
  nonce        Int
  
  @@unique([sourceTable, sourceRowId])
  @@index([sourceTable])
}
```

This creates separate hash chains per product (or one unified chain with source discrimination), enabling tamper detection for ALL audit data.

---

## 4. Migration Plan

### Phase 1 — Foundation (Week 1-2)

| Step | Action | Effort | Risk |
|------|--------|--------|------|
| 1.1 | Define shared `PlatformAuditEvent` Prisma model | 1 day | Low |
| 1.2 | Add `correlationId` to all existing audit models via migration | 0.5 days | Low |
| 1.3 | Create unified audit client library | 2 days | Medium |
| 1.4 | Extend HashChainEntry to support polymorphic references | 1 day | Medium |
| 1.5 | Write dual-write integration tests | 2 days | Low |

### Phase 2 — Product Adoption (Week 3-6, 1 product per week)

| Step | Product | Effort | Impact |
|------|---------|--------|--------|
| 2.1 | **SalesOS** — already has adapter pattern in `products/sales/core-adapters/audit-adapter.ts` | 2 days | Low — easiest target |
| 2.2 | **LocalContentOS** — explicit comment says "dual-write can be added later" | 2 days | Low |
| 2.3 | **WorkflowOS** — `createWorkflowAuditEvent()` needs wrapping | 3 days | Medium |
| 2.4 | **AuditOS** — largest table, needs most care | 5 days | High |
| 2.5 | **DecisionOS** — no audit writer exists, needs creation | 3 days | Medium |
| 2.6 | **InstitutionalMemory** — already uses PlatformAuditLog, review for compliance | 1 day | Low |
| 2.7 | **SCIM** — already has its own table, needs dual-write | 1 day | Low |

### Phase 3 — Cross-Product Forensics (Week 7-8)

| Step | Action | Effort | Risk |
|------|--------|--------|------|
| 3.1 | Build cross-product audit query API | 3 days | Medium |
| 3.2 | Build operator dashboard audit view | 2 days | Medium |
| 3.3 | Build cross-product forensics UI | 3 days | Medium |
| 3.4 | Add unified audit export (JSON/CSV/PDF) | 2 days | Low |

### Phase 4 — Product Table Deprecation (Week 9-12, optional)

| Step | Action | Effort | Risk |
|------|--------|--------|------|
| 4.1 | Replace product-specific audit queries with PlatformAuditEvent views | 5 days per product | High |
| 4.2 | Deprecate product audit tables | 1 day per product | Low |
| 4.3 | Archive old product audit data | 1 day | Low |

**Total Estimated Effort:** **8-12 weeks** (core = 8 weeks, full deprecation = 12 weeks)

---

## 5. Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Product teams resist dual-write overhead | Non-adoption | Medium | Make async (fire-and-forget), show value of cross-product forensics |
| Hash chain performance with 11x volume | Write latency | Low | SHA-256 + nonce is fast; can batch nonce computation |
| correlationId migration on existing data | Incomplete history | Medium | Backfill is optional; new data gets correlation IDs |
| Dual-write inconsistency | Platform vs product drift | Medium | Write integration tests, add periodic consistency checks |
| AuditEvent migration (AuditOS) is largest | Destabilization risk | Medium | Keep old model during migration, deprecate over months |

---

## 6. Effort Estimate

| Phase | Duration | Team | Cost (engineering-days) |
|-------|----------|------|-------------------------|
| P1: Foundation | 2 weeks | 1 engineer | 10 days |
| P2: Product Adoption | 4 weeks | 1-2 engineers | 17 days |
| P3: Cross-Product Forensics | 2 weeks | 1 engineer | 10 days |
| P4: Deprecation (optional) | 4 weeks | 1 engineer (per product) | 25 days |
| **Total** | **8-12 weeks** | **1-2 engineers** | **62 days** |

---

## 7. Quick Wins (Can be done this week)

| # | Action | Effort | Value |
|---|--------|--------|-------|
| QW-1 | Add `auditLogger()` call to SalesOS core adapter (already has the infrastructure) | 2 hours | First product adoption of platform audit |
| QW-2 | Add `auditLogger()` call to local-content audit-events.ts | 2 hours | Second product adoption |
| QW-3 | Add `PlatformAuditEvent` model to Prisma | 1 hour | Foundation model exists |
| QW-4 | Extend HashChainEntry to allow product-specific references | 2 hours | Hash chain for all products |
| QW-5 | Create unified audit types package | 4 hours | Shared types for all products |

## 8. Scoring

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Audit model count | 11 | 2 (PlatformAuditEvent + product-specific lightweight views) | 9 |
| Hash chain coverage | 1/11 tables | 11/11 tables | 10 |
| Cross-product queryable | No | Yes | 1 |
| Product adoption of platform audit | 0/6 products | 6/6 products | 6 |
| Write path consistency | 6 different paths | 1 shared client + 6 product adapters | 5 |
| AI provenance tracking | Partial (LC only) | Universal | 3 |
| **Composite** | **3.5/10** | **9.5/10** | **6.0** |
