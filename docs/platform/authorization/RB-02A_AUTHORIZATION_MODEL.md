---
title: "RB-02A — Authorization Model for AQLIYA Platform"
status: draft
program: "Platform Authorization"
phase: "1 — Normative Specification (Adopted)"
version: "1.0"
date: 2026-06-28
author: OpenCode
classification: normative-specification
supersedes: "RB-02A v0.5 (2026-06-28)"
adr: "ADR-RB02-001 through ADR-RB02-028 — see Appendix C"
---

# RB-02A — Authorization Model

> **Status:** ✅ **v1.0 Normative Specification** — Adopted 2026-06-28. Architecture Freeze active. This document is the canonical reference for authorization in all AQLIYA products (AuditOS, DecisionOS, SalesOS, WorkflowOS). For implementation, see RB-02B Execution Contract (§12) and RB-02B Implementation Plan (`RB-02B_IMPLEMENTATION_PLAN.md`).  
> **Purpose:** Define the complete authorization architecture for LocalContentOS as a reusable pattern for all AQLIYA products.  
> **Relationship with RB-02B:** This document is the **design contract**. RB-02B implements what this document specifies — nothing more, nothing less.  
> **Reusability:** This model is designed as the AQLIYA-wide authorization standard. AuditOS, DecisionOS, WorkflowOS, and SalesOS will extend or specialize this model without redesigning it.

---

## Table of Contents

1. [Purpose & Scope](#chapter-1--purpose--scope)
2. [Authorization Architecture](#chapter-2--authorization-architecture)
3. [Resource Catalog](#chapter-3--resource-catalog)
4. [Action Catalog](#chapter-4--action-catalog)
5. [Permission Catalog](#chapter-5--permission-catalog)
6. [Role Catalog](#chapter-6--role-catalog)
7. [Role × Permission Matrix](#chapter-7--role--permission-matrix)
8. [Authorization Policies](#chapter-8--authorization-policies)
9. [Separation of Duties](#chapter-9--separation-of-duties)
10. [Approval Boundaries](#chapter-10--approval-boundaries)
11. [Audit Requirements](#chapter-11--audit-requirements)
12. [RB-02B Execution Contract](#chapter-12--rb-02b-execution-contract)

---

# Chapter 1 — Purpose & Scope

## 1.1 Why Authorization for LocalContentOS?

LocalContentOS manages sensitive institutional data: supplier spend, local content scores, compliance evidence, and review decisions. Without systematic authorization:

- Any user with access to the platform can perform sensitive actions
- The guard layer (built in RB-01) verifies **tenant identity** but not **role appropriateness**
- There is no distinction between who can create a workbook vs. who can approve a finding
- External auditors, integration accounts, and read-only analysts share the same permission surface as administrators

Authorization is the second layer of the security stack — it sits on top of tenant isolation (RB-01) and answers the question: **given that this user belongs to this organization, what are they allowed to do?**

## 1.2 What This Model Covers

This model defines:

- **Resources** — what data objects are protected
- **Actions** — what operations can be performed on resources
- **Permissions** — logical groupings of actions
- **Roles** — named sets of permissions assigned to users
- **Policies** — rules that go beyond simple role-permission mapping
- **Separation of Duties** — conflict prevention between roles
- **Approval Boundaries** — when an action requires a second party
- **Audit Requirements** — what must be logged for each decision

## 1.3 What This Model Does NOT Cover

- **Authentication** — handled by NextAuth v5 (`src/lib/auth/`)
- **Tenant Isolation** — handled by RB-01 (guards verify `organizationId` match)
- **Input Validation** — handled by Zod schemas (P0-A1 / SC-01)
- **Business Logic** — handled by domain services
- **User Management** — user lifecycle (creation, profile, deactivation) is handled by the platform and is outside RB-02
- **Session Management** — handled by NextAuth v5

> **Important distinction:** The *user* (as a platform identity) is outside RB-02. The *organization membership* (which user belongs to which organization, with what role) IS inside RB-02. This means:
> - `invite`, `activate`, `deactivate` — these are membership operations managed by RB-02
> - `assignRole`, `revokeRole` — these are authorization operations managed by RB-02
> - Creating a user account — handled by the platform, outside RB-02
>
> See Resource R19 in Chapter 3 for the precise definition of Organization Membership.

## 1.4 Relationship with RB-01 (Tenant Isolation)

RB-01 and RB-02 are complementary, not overlapping:

| Layer | Question Answered | Enforcement |
|-------|------------------|-------------|
| **RB-01** | "Does this user belong to the organization that owns this resource?" | Guard → 404 on mismatch |
| **RB-02** | "Is this user's role permitted to perform this action on this resource?" | Guard → 403 on denied |

The dependency is strict: **RB-02 assumes RB-01 is in place.** Every authorization check must occur *after* tenant isolation verification. If a user does not belong to the organization, the role check is irrelevant.

## 1.5 Applicability Across Products

This model is designed for AQLIYA-wide reuse.

### Architecture: Shared Engine, Product-Specific Catalogs

```
┌─────────────────────────────────────────────────┐
│              SHARED AUTHORIZATION ENGINE          │
│  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │ Policies  │  │   SoD    │  │ Audit System   │  │
│  │ (Chapter 8)│  │ (Chapter 9)│  │ (Chapter 11)   │  │
│  └──────────┘  └──────────┘  └────────────────┘  │
│  ┌────────────────────────────────────────────┐   │
│  │        Policy Engine (fail-closed)         │   │
│  └────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
           ▲                    ▲
           │                    │
┌──────────┴──────────┐ ┌──────┴──────────────┐
│  Product Catalog A  │ │  Product Catalog B  │
│  (LocalContentOS)   │ │  (AuditOS, etc.)    │
│  Resources          │ │  Resources          │
│  Actions            │ │  Actions            │
│  Permissions        │ │  Permissions        │
│  Roles              │ │  Roles              │
│  Approval Gates     │ │  Approval Gates     │
└─────────────────────┘ └─────────────────────┘
```

Each product defines **only**:
- **Resources** — what data objects are unique to the product
- **Actions** — what operations are relevant
- **Permissions** — logical groupings of product actions
- **Roles** — role definitions for the product's workflow
- **Policies** — product-specific authorization rules

The **engine** (policy evaluation, SoD enforcement, audit logging, fail-closed behavior) is shared across all products.

### Product Adoption Plan

1. **LocalContentOS** (first implementation) — full adoption as defined in this document
2. **AuditOS** — inherit the same engine; define AuditOS-specific Resource/Action/Permission/Role catalogs
3. **DecisionOS** — inherit the same engine; add decision-specific approval rules
4. **WorkflowOS** — inherit the same engine; add template-level permissions
5. **SalesOS** — inherit the same engine; add account/opportunity permissions

---

# Chapter 2 — Authorization Architecture

## 2.1 The Complete Security Stack

```
                         ┌─────────────────────┐
                         │   Authentication     │
                         │  (NextAuth v5)       │
                         └─────────┬───────────┘
                                   │ session validated
                                   ▼
                         ┌─────────────────────┐
                         │   Tenant Isolation   │
                         │  (RB-01 — Guards)    │
                         │  assertProjectAccess │
                         │  requireOrganization │
                         └─────────┬───────────┘
                                   │ org match confirmed
                                   ▼
                         ┌─────────────────────┐
                         │   Authorization      │◄── RB-02A defines
                         │  (RB-02 — Role Check)│    RB-02B implements
                         └─────────┬───────────┘
                                   │ ─► AuthorizationEvaluated (AuditEvent)
                                   │ role permitted
                                   ▼
                         ┌─────────────────────┐
                         │   Input Validation   │
                         │  (Zod Schemas)       │
                         └─────────┬───────────┘
                                   │ input valid
                                   ▼
                         ┌─────────────────────┐
                         │   Business Logic     │
                         │  (Domain Services)   │
                         └─────────┬───────────┘
                                   │
                                   ├─► OperationCompleted (AuditEvent)
                                   │    if success
                                   │
                                   └─► OperationFailed (AuditEvent)
                                        if failure
```

## 2.2 Authorization Flow (per Request)

```
Client Request
    │
    ▼
[1] Middleware ──► Session Check
    │
    ▼
[2] Server Action ──► requireSession()
    │
    ▼
[3] Guard Layer ──► assertProjectAccess()  (RB-01)
    │                 requireOrganizationAccess()
    │
    ▼
[4] Authorization ─► requirePermission('project.create')  (RB-02)
    │                 │
    │                 └─► AuthorizationEvaluated (AuditEvent)
    │                      { userId, orgId, action, resource, decision, reason, timestamp }
    │
    ▼  (if ALLOW, continue; if DENY, return 403)
[5] Validation ───► parseOrError(ZodSchema, input)  (P0-A1)
    │
    ▼  (if valid, continue; if invalid, return 400)
[6] Service Layer ─► Domain Logic
    │                 │
    │                 ├─► OperationCompleted (AuditEvent)
    │                 │    { userId, orgId, action, resource, result, timestamp }
    │                 │
    │                 └─► OperationFailed (AuditEvent)
    │                      { userId, orgId, action, resource, error, timestamp }
    │
    ▼
[7] Prisma ───────► Scoped Query (orgId filter)  (RB-01)
    │
    ▼
[8] Response ─────► Return result or error to client
```

### Dual Audit Events

| Event | When | Contains | Mandatory? |
|-------|------|----------|------------|
| **AuthorizationEvaluated** | Immediately after authorization check (step 4) | userId, orgId, action, resource, decision (ALLOW/DENY), reason, timestamp | ✅ Always |
| **OperationCompleted** | After successful business logic execution (step 6) | userId, orgId, action, resource, result, timestamp | ✅ On success |
| **OperationFailed** | After failed business logic execution (step 6) | userId, orgId, action, resource, error, timestamp | ✅ On failure |

This ensures full traceability: if authorization passed but the operation failed, both events exist. If authorization was denied, only `AuthorizationEvaluated` exists. No action is ever unlogged.

## 2.3 Decision Points

Every authorization check produces:

| Field | Source | Example |
|-------|--------|---------|
| **User** | Session | `user.id = "usr_abc123"` |
| **Organization** | Session | `user.organizationId = "org_xyz789"` |
| **Role** | User → Role mapping | `user.role = "local_content_manager"` |
| **Resource** | Request parameter | `resource = "project:proj_456"` |
| **Resource Org** | Data lookup | `project.organizationId = "org_xyz789"` |
| **Action** | Function call | `action = "project.create"` |
| **Permission** | Role × Permission Matrix | `local_content_manager → project.*` |
| **Decision** | ALLOW / DENY | ✅ ALLOW |
| **Reason** | Policy rule | `Role "local_content_manager" has permission "Project Management"` |
| **Timestamp** | Server clock | `2026-06-28T12:00:00Z` |

## 2.4 Architectural Principles

| # | Principle | Rationale |
|---|-----------|-----------|
| 1 | **Server-side only** | Authorization decisions must never happen on the client. No role check in UI is treated as authoritative. |
| 2 | **Fail closed** | If any component in the chain is unavailable (database, session service, policy engine), default to DENY. |
| 3 | **Explicit, not implicit** | Every action must have at least one explicit permission. There is **no admin bypass** — no `if admin return true` shortcut. Platform Admin passes through the same Policy Engine with the same Role→Permission→Policy chain. |
| 4 | **Audit-first** | Every ALLOW and DENY decision produces an `AuthorizationEvaluated` audit event. On success, `OperationCompleted` is also logged. On failure, `OperationFailed` is logged. No silent authorization. |
| 5 | **Least privilege** | Roles start with zero permissions. Role templates provide sensible defaults per role type, but are copied (not inherited) at creation time. Permissions are added explicitly. |
| 6 | **Defense in depth** | Authorization is not the only gate. Tenant isolation (RB-01) and validation (P0-A1) provide independent protection. |
| 7 | **Platform-scoped** | All authorization decisions are relative to the user's organization. There is no cross-tenant role. Platform-wide operations (infrastructure, support) use a distinct **Platform Scope** with its own Policy set, not a cross-tenant role. Platform Scope policies are evaluated by the same engine. |
| 8 | **Emergency Read-Only Mode** | If the policy store is unavailable and the system cannot evaluate authorization, it may enter Emergency Read-Only Mode. This mode permits only safe read operations and requires an explicit Feature Flag. No mutations are allowed in this mode. |

### Principle Details

#### No Admin Bypass (Principle 3)

This is a critical architectural decision. Platform Administrator does NOT bypass the authorization engine:

```
IN CORRECT:
  PlatformAdmin ──► Guard ──► if (role === 'admin') return ALLOW

CORRECT:
  PlatformAdmin ──► Guard ──► Role ──► Permissions ──► Policies ──► Decision
```

Platform Admin has a **role** with **permissions** just like any other user. The role may have broad permissions, but every action is still evaluated, logged, and auditable. This preserves:
- **Audit** — every action is logged with the admin's identity and the decision reason
- **Separation of Duties** — admin cannot override SoD rules
- **Least Privilege** — admin permissions are explicit, not implicit
- **Forensic traceability** — any action can be traced to a specific decision point

#### Emergency Read-Only Mode (Principle 8)

| Condition | Behavior |
|-----------|----------|
| Policy store available | Normal operation — all authorization checks pass through Policy Engine |
| Policy store unavailable, Feature Flag OFF | Fail-closed — all actions return DENY (safe default) |
| Policy store unavailable, Feature Flag ON | Emergency Read-Only Mode — read operations permitted, all mutations denied |

This mode requires:
1. An explicit Feature Flag (`EMERGENCY_READ_ONLY_MODE`)
2. A read-only path that bypasses the Policy Engine for safe operations only
3. All Emergency Mode accesses logged at WARN level
4. Automatic reversion to normal mode when policy store recovers

## 2.5 Authorization Decision Model

Every authorization check produces one of four possible decisions. This model replaces a simple ALLOW/DENY binary with a richer set of outcomes that maps to real business workflows.

### 2.5.1 The Four Outcomes

| Outcome | Meaning | HTTP Status | Example |
|---------|---------|-------------|---------|
| **ALLOW** | The action is permitted. The request proceeds to validation and business logic. | 200 | Analyst reads a workbook they have permission to access. |
| **DENY** | The action is forbidden. The request is rejected with no further processing. | 403 | Read Only attempts to delete a project. |
| **REQUIRE_APPROVAL** | The action is not directly permitted, but may proceed if a second authorized user approves it. The approval workflow is triggered automatically. | 202 (Accepted) | Analyst attempts to close a finding — the system creates an approval request instead of denying or allowing. |
| **READ_ONLY** | The user may view the resource but cannot perform any mutation on it. This is a special case of ALLOW that restricts the scope of permitted operations. | 200 (read-only) | External Auditor can view all data but mutations return DENY. |

### 2.5.2 Decision Flow

```
Authorization Check
        │
        ├── ALLOW ──────────► Proceed to Validation → Service → OperationCompleted
        │
        ├── DENY ───────────► Return 403 → AuthorizationEvaluated (DENY)
        │
        ├── REQUIRE_APPROVAL ► Create ApprovalRequest → Notify Approver → 
        │                       ├── Approved → Proceed as ALLOW
        │                       └── Rejected → OperationFailed
        │
        └── READ_ONLY ──────► Proceed with read-only scope → 
                              Block mutations at Service Layer
```

### 2.5.3 Impact on the Role × Permission Matrix

The Matrix (Chapter 7) currently uses:

| Symbol | Maps To |
|--------|---------|
| ✅ | ALLOW |
| — | DENY |
| ⚠️ | Conditional ALLOW (resolved by Policies in Chapter 8) |

During RB-02B implementation, the matrix will be refined to support REQUIRE_APPROVAL as an explicit cell value where business rules dictate (e.g., Analyst closing a finding → REQUIRE_APPROVAL, not DENY).

### 2.5.4 Decision Precedence

When multiple policies produce different decisions, the **Decision Precedence** model determines the final outcome. Each decision has a rank — higher rank overrides lower rank.

| Rank | Decision | Meaning |
|:----:|----------|---------|
| 1 | **DENY** | Highest precedence. A single DENY overrides all other decisions. |
| 2 | **REQUIRE_APPROVAL** | Second highest. Overrides READ_ONLY and ALLOW. |
| 3 | **READ_ONLY** | Third. Overrides ALLOW. |
| 4 | **ALLOW** | Lowest precedence. Only takes effect if no higher-precedence decision exists. |

**Rule:** *The highest-precedence decision produced by the evaluation pipeline becomes the final authorization decision.*

**Why this model?** It is extensible — if future products need new outcomes (e.g., `LIMITED_WRITE`, `QUARANTINE`, `ELEVATED_APPROVAL`), they are slotted into the rank table without changing the composition logic.

### 2.5.5 Decision → Action Mapping

Every decision tells the engine not just **what** to decide, but **what to do next**:

| Decision | Engine Action | HTTP Status | Audit Event | Next Pipeline Step |
|----------|--------------|:-----------:|-------------|-------------------|
| **ALLOW** | Execute the action immediately. Proceed to Service Layer. | 200 | `AuthorizationEvaluated` (ALLOW) → `OperationCompleted` | Execute Service |
| **DENY** | Stop execution. Return error to caller. | 403 | `AuthorizationEvaluated` (DENY) | Return Error |
| **REQUIRE_APPROVAL** | Create `ApprovalRequest` in pending state. Notify approvers. Do NOT execute action yet. | 202 | `AuthorizationEvaluated` (REQUIRE_APPROVAL) → `ApprovalRequest.created` | Approval Engine |
| **READ_ONLY** | Execute the action but strip all write operations at the Guard/Service boundary. | 200 | `AuthorizationEvaluated` (READ_ONLY) | Read-only Execution |

### 2.5.6 Decision Trace

Every decision must be traceable. The trace includes:

```
Decision Trace
├── Evaluation Order          # Which stages ran, in what sequence
├── Policy Results            # Each policy evaluated → PASS / FAIL / REQUIRE_APPROVAL
├── Winning Decision          # Final outcome after Decision Precedence
├── Winning Policy            # The policy/rule that produced the winning decision
├── Reason                    # Human-readable explanation
├── Execution Path            # Which layers contributed (Identity → AuthZ → Policy → Workflow)
└── Audit Event IDs           # References to AuthorizationEvaluated + OperationCompleted/Failed
```

---

# Chapter 3 — Resource Catalog

## 3.1 Resource Classification

Resources are classified into two types:

| Type | Description | Examples | Lifecycle |
|------|-------------|----------|-----------|
| **Primary Resource** | Core business objects with full CRUD lifecycle. Owned by a user role. | Project, Workbook, Finding, Evidence | create, read, update, delete, archive, export |
| **Derived Resource** | Results generated by the system (AI, analytics) or derived from primary resources. Limited lifecycle — created by process, not by user action. | Pattern Suggestion, Recommendation | read, accept, reject, archive — NO `update` or `create` by user |

**Why this distinction matters:**
- Permissions for Derived Resources are narrower — users cannot modify AI-generated outputs, only accept or reject them
- The action catalog is simpler — Derived Resources skip `update` and `create` operations
- This pattern extends naturally to AuditOS (AI review suggestions) and SalesOS (scoring outputs)

## 3.2 Resource Definition

A Resource is any data object that requires protection. Each resource has:

| Field | Description |
|-------|-------------|
| **Name** | Unique identifier for the resource type |
| **Type** | Primary or Derived (see §3.1) |
| **Scope** | The organizational boundary (Organization, Project, Global, Platform) |
| **Owner** | The role/entity that typically owns this resource |
| **Sensitive Fields** | Fields that require special permission to read/write |
| **Supported Operations** | CRUD + domain-specific operations |

## 3.3 LocalContentOS Resource Catalog

### Primary Resources

| # | Resource | Type | Scope | Owner | Sensitive Fields | Supported Ops |
|---|----------|------|-------|-------|------------------|---------------|
| R01 | **Organization** | Primary | Global | Platform Admin | name, contact, fiscalId | read, update |
| R02 | **Project** | Primary | Organization | Org Admin | budget, classificationThreshold | create, read, update, archive, delete |
| R03 | **Workbook** | Primary | Project | LC Manager | — | create, read, update, delete, export, calibrate, editStructure, editContent, approve |
| R04 | **Supplier / Vendor** | Primary | Organization | LC Manager | name, crNumber, contactInfo | create, read, update, delete |
| R05 | **Spend Record** | Primary | Organization | Analyst | amount, category, supplierId | create, read, update, delete |
| R06 | **Evidence** | Primary | Project | Analyst | fileUrl, fileHash, content | upload, read, download, delete |
| R07 | **Finding** | Primary | Project | Reviewer | description, severity, status | create, read, update, close |
| R08 | **Review** | Primary | Project | Reviewer | decision, notes, score | create, read, approve, reject, override |
| R09 | **Match Review** | Primary | Organization | Reviewer | matchScore, explanation, fpStatus | read, update, flag |
| R10 | **Classification Rule** | Primary | Organization | LC Manager | category, thresholds, weight | create, read, update, delete |
| R11 | **Import Batch** | Primary | Organization | Analyst | sourceFile, status, rowCount | create, read |
| R12 | **Export** | Primary | Organization | Analyst | format, scope, status | create, read, download |
| R13 | **Report** | Primary | Organization | LC Manager | template, data, period | create, read, export, delete |
| R14 | **Audit Log** | Primary | Organization | System | actor, action, resource | read, export |
| R15 | **Settings** | Primary | Organization | Org Admin | all config values | read, update |
| R16 | **Organization Membership** | Primary | Organization | Org Admin | role, status | read, invite, activate, deactivate, assignRole, revokeRole |

### Derived Resources

| # | Resource | Type | Scope | Owner | Sensitive Fields | Supported Ops |
|---|----------|------|-------|-------|------------------|---------------|
| R17 | **Pattern Suggestion** | Derived | Organization | AI System | score, rationale, category | read, accept, reject, archive |
| R18 | **Recommendation** | Derived | Organization | AI System | priority, action, impact | read, accept, dismiss, archive |

### Scope Notes

| Scope | Meaning |
|-------|---------|
| **Global** | Single instance across all organizations. Only Platform Admin scope. |
| **Platform** | Platform-wide operations (infrastructure, support). Not a cross-tenant role — distinct Policy set evaluated by the same engine. |
| **Organization** | Scoped to a single organization. All authorization decisions are relative to the user's organization. |
| **Project** | Scoped to a project within an organization. Access requires both organization membership AND project-level role. |

### Summary: Changes from v0.1

| Change | Rationale |
|--------|-----------|
| **Workbook Line removed** | Not an independent resource. Workbook content management uses `editContent`, `editStructure`, `approve` operations directly on Workbook. |
| **Pattern Suggestion → Derived Resource** | Generated by AI. Lifecycle: read, accept, reject, archive. No `update` or `create` by user. |
| **Recommendation → Derived Resource** | Generated by AI. Lifecycle: read, accept, dismiss, archive. No `update` or `create` by user. |
| **User → Organization Membership** | RB-02 manages membership (which user belongs to which org, with what role), not the user identity. User lifecycle remains outside RB-02. |
| **Platform Scope added** | Distinguishes platform-wide operations from cross-tenant roles (which do not exist). |

---

# Chapter 4 — Action Catalog

## 4.1 Action Naming Convention

All actions follow the format:

```
<resource>.<operation>
```

Where `<resource>` matches a resource name from Chapter 3, and `<operation>` is one of:

| Operation | Meaning |
|-----------|---------|
| `create` | Create a new resource instance |
| `read` | View resource details |
| `update` | Modify existing resource |
| `delete` | Remove resource permanently |
| `archive` | Soft-delete / deactivate |
| `export` | Generate an export or download |
| `upload` | Upload a file or attachment |
| `download` | Download a stored file |
| `approve` | Approve a pending review/decision |
| `reject` | Reject a pending review/decision |
| `override` | Override a system or human decision |
| `calibrate` | Run AI calibration on a resource |
| `close` | Close a finding or case |
| `invite` | Invite a user into the organization (creates membership) |
| `activate` | Activate an existing organization membership |
| `deactivate` | Deactivate an existing organization membership |
| `assignRole` | Assign a role to a membership |
| `revokeRole` | Revoke a role from a membership |
| `editContent` | Edit the content/data within a resource |
| `editStructure` | Edit the structure/schema of a resource |

## 4.2 LocalContentOS Action Catalog

```
┌────────────────────────────────────────────────────────────────┐
│                      ACTION CATALOG                           │
├────────────────────────────────────────────────────────────────┤
│ ORGANIZATION                                                    │
│   organization.read                                            │
│   organization.update                                          │
├────────────────────────────────────────────────────────────────┤
│ PROJECT                                                         │
│   project.create                                               │
│   project.read                                                 │
│   project.update                                               │
│   project.archive                                              │
│   project.delete                                               │
├────────────────────────────────────────────────────────────────┤
│ WORKBOOK                                                       │
│   workbook.create                                              │
│   workbook.read                                                │
│   workbook.update                                              │
│   workbook.delete                                              │
│   workbook.export                                              │
│   workbook.calibrate                                           │
│   workbook.editContent                                         │
│   workbook.editStructure                                       │
│   workbook.approve                                             │
├────────────────────────────────────────────────────────────────┤
│ SUPPLIER                                                       │
│   supplier.create                                              │
│   supplier.read                                                │
│   supplier.update                                              │
│   supplier.delete                                              │
├────────────────────────────────────────────────────────────────┤
│ SPEND RECORD                                                   │
│   spend-record.create                                          │
│   spend-record.read                                            │
│   spend-record.update                                          │
│   spend-record.delete                                          │
├────────────────────────────────────────────────────────────────┤
│ EVIDENCE                                                       │
│   evidence.upload                                              │
│   evidence.read                                                │
│   evidence.download                                            │
│   evidence.delete                                              │
├────────────────────────────────────────────────────────────────┤
│ FINDING                                                        │
│   finding.create                                               │
│   finding.read                                                 │
│   finding.update                                               │
│   finding.close                                                │
├────────────────────────────────────────────────────────────────┤
│ REVIEW                                                         │
│   review.create                                                │
│   review.read                                                  │
│   review.approve                                               │
│   review.reject                                                │
│   review.override                                              │
├────────────────────────────────────────────────────────────────┤
│ PATTERN SUGGESTION (Derived)                                   │
│   pattern-suggestion.read                                      │
│   pattern-suggestion.accept                                    │
│   pattern-suggestion.reject                                    │
│   pattern-suggestion.archive                                   │
├────────────────────────────────────────────────────────────────┤
│ MATCH REVIEW                                                   │
│   match-review.read                                            │
│   match-review.update                                          │
│   match-review.flag                                            │
├────────────────────────────────────────────────────────────────┤
│ RECOMMENDATION (Derived)                                       │
│   recommendation.read                                          │
│   recommendation.accept                                        │
│   recommendation.dismiss                                       │
│   recommendation.archive                                       │
├────────────────────────────────────────────────────────────────┤
│ CLASSIFICATION RULE                                            │
│   classification-rule.create                                   │
│   classification-rule.read                                     │
│   classification-rule.update                                   │
│   classification-rule.delete                                   │
├────────────────────────────────────────────────────────────────┤
│ IMPORT                                                         │
│   import.create                                                │
│   import.read                                                  │
├────────────────────────────────────────────────────────────────┤
│ EXPORT                                                         │
│   export.create                                                │
│   export.read                                                  │
│   export.download                                              │
├────────────────────────────────────────────────────────────────┤
│ REPORT                                                         │
│   report.create                                                │
│   report.read                                                  │
│   report.export                                                │
│   report.delete                                                │
├────────────────────────────────────────────────────────────────┤
│ AUDIT LOG                                                      │
│   audit-log.read                                               │
│   audit-log.export                                             │
├────────────────────────────────────────────────────────────────┤
│ SETTINGS                                                       │
│   settings.read                                                │
│   settings.update                                              │
├────────────────────────────────────────────────────────────────┤
│ ORGANIZATION MEMBERSHIP                                        │
│   membership.read                                              │
│   membership.invite                                            │
│   membership.activate                                          │
│   membership.deactivate                                        │
│   membership.assignRole                                        │
│   membership.revokeRole                                        │
└────────────────────────────────────────────────────────────────┘
```

**Total: 69 actions** across 18 resource types.

---

# Chapter 5 — Permission Catalog

## 5.1 Permission Definition

A Permission is a named group of one or more actions. Permissions are the unit of assignment to roles. They provide semantic meaning beyond raw actions.

## 5.2 LocalContentOS Permission Catalog

| # | Permission | Actions Included | Rationale |
|---|------------|------------------|-----------|
| P01 | **Project Management** | `project.create`, `project.read`, `project.update`, `project.archive` | Full lifecycle of projects |
| P02 | **Project Deletion** | `project.delete` | Separated from management — high risk |
| P03 | **Workbook Management** | `workbook.create`, `workbook.read`, `workbook.update`, `workbook.delete`, `workbook.calibrate`, `workbook.editContent`, `workbook.editStructure`, `workbook.approve` | Full workbook lifecycle including content editing and approval |
| P04 | **Workbook Export** | `workbook.export` | Separated — data exfiltration risk |
| P05 | **Supplier Management** | `supplier.create`, `supplier.read`, `supplier.update`, `supplier.delete` | Vendor master data |
| P06 | **Spend Data Entry** | `spend-record.create`, `spend-record.read`, `spend-record.update`, `spend-record.delete` | Financial transaction data |
| P07 | **Evidence Upload** | `evidence.upload` | Separated from read — higher risk |
| P08 | **Evidence Read** | `evidence.read`, `evidence.download` | Viewing/downloading evidence |
| P09 | **Evidence Deletion** | `evidence.delete` | High risk — potential data loss |
| P10 | **Finding Management** | `finding.create`, `finding.read`, `finding.update` | Full finding lifecycle except close |
| P11 | **Finding Close** | `finding.close` | Separated — finality of closure |
| P12 | **Review Management** | `review.create`, `review.read` | Initiating and viewing reviews |
| P13 | **Review Approval** | `review.approve`, `review.reject` | Approving/rejecting — core governance |
| P14 | **Review Override** | `review.override` | Override decisions — highest review privilege |
| P15 | **AI Review** | `pattern-suggestion.read`, `pattern-suggestion.accept`, `pattern-suggestion.reject`, `pattern-suggestion.archive`, `match-review.read`, `match-review.update`, `match-review.flag`, `recommendation.read`, `recommendation.accept`, `recommendation.dismiss`, `recommendation.archive` | AI governance — reviewing and managing all AI outputs (Derived Resources) |
| P16 | **Classification Management** | `classification-rule.create`, `classification-rule.read`, `classification-rule.update`, `classification-rule.delete` | Classification rules configuration |
| P17 | **Import** | `import.create`, `import.read` | Data import operations |
| P18 | **Export Management** | `export.create`, `export.read`, `export.download` | Export operations (sensitive — data leaving platform) |
| P19 | **Report Management** | `report.create`, `report.read`, `report.export`, `report.delete` | Report lifecycle |
| P20 | **Audit Log Access** | `audit-log.read`, `audit-log.export` | Viewing/exporting audit trails (scoped by organization or project) |
| P21 | **Settings Management** | `settings.read`, `settings.update` | System configuration |
| P22 | **Organization Membership** | `membership.read`, `membership.invite`, `membership.activate`, `membership.deactivate`, `membership.assignRole`, `membership.revokeRole` | Membership lifecycle (high privilege) |
| P23 | **AI Configuration** | `settings.read`, `settings.update` (AI-scoped) | AI system configuration — prompts, thresholds, routing, providers, evaluation. Does NOT grant access to view AI outputs (see P15). |

---

# Chapter 6 — Role Catalog

## 6.1 Role Definition

A Role is a named set of permissions assigned to a user within an organization. A user has exactly one role per organization (roles are not cumulative).

## 6.2 Platform Role vs Product Label

Roles have two layers:

| Layer | Purpose | Example | Who Defines It |
|-------|---------|---------|----------------|
| **Platform Role** | The canonical role identifier used by the Authorization Engine. Enables reuse across products. | `BUSINESS_MANAGER` | RB-02A (this document) |
| **Product Label** | The human-readable name displayed in the UI for a specific product. | "Local Content Manager", "Engagement Manager" | Each product's catalog |

**Rules:**
1. The Authorization Engine evaluates permissions against the **Platform Role**, not the Product Label
2. Product Labels are mappings only — they do not create new roles
3. A Platform Role has the same permission set regardless of which product displays it
4. If a product needs genuinely different permissions, it requires a new Platform Role, not a new label

**Example — same Platform Role across products:**

```
Platform Role:  BUSINESS_MANAGER
                │
                ├── LocalContentOS:  "Local Content Manager"
                ├── AuditOS:        "Engagement Manager"
                ├── SalesOS:        "Sales Manager"
                └── WorkflowOS:     "Workflow Manager"
```

All four product labels map to `BUSINESS_MANAGER` with the same base permissions. Product-specific extensions (if needed) are handled via **Policies** (Chapter 8), not by creating new roles.

### Platform Role to Product Label Mapping

| Platform Role | LocalContentOS | AuditOS | SalesOS |
|---------------|----------------|---------|---------|
| `ORG_ADMIN` | Organization Administrator | Firm Administrator | Account Executive |
| `BUSINESS_MANAGER` | Local Content Manager | Engagement Manager | Sales Manager |
| `REVIEWER` | Reviewer | Senior Auditor | Deal Reviewer |
| `ANALYST` | Analyst | Junior Auditor | Sales Analyst |
| `READ_ONLY` | Read Only | Read Only | Read Only |
| `EXTERNAL_AUDITOR` | External Auditor | External Auditor | N/A |
| `INTEGRATION_ACCOUNT` | Integration Account | Integration Account | Integration Account |

## 6.3 LocalContentOS Role Definitions

| # | Platform Role | Product Label | Description | Level |
|---|--------------|---------------|-------------|-------|
| R01 | `ORG_ADMIN` | **Organization Administrator** | Full access to all resources and operations within the organization. Can manage memberships, settings, and override any decision. | Enterprise |
| R02 | `BUSINESS_MANAGER` | **Local Content Manager** | Manages projects, workbooks, suppliers, classification rules, and reports. Can approve reviews but cannot override decisions. | Operational |
| R03 | `REVIEWER` | **Reviewer** | Reviews findings, evidence, and AI suggestions. Can approve or reject reviews. Cannot create projects or workbooks. | Operational |
| R04 | `ANALYST` | **Analyst** | Enters data (suppliers, spend records), uploads evidence, creates reports. Cannot approve reviews or manage settings. | Operational |
| R05 | `READ_ONLY` | **Read Only** | View-only access to all resources. Cannot create, update, or delete any data. Can view reports if explicitly permitted. | Information |
| R06 | `EXTERNAL_AUDITOR` | **External Auditor** | Read-only access with explicit audit trail. Cannot export data. All read actions logged with extra detail. | Information |
| R07 | `INTEGRATION_ACCOUNT` | **Integration Account** | API-only access. Limited to specific permissions based on integration scope. Cannot access UI. | System |

## 6.4 Role Hierarchy (Informational)

The following hierarchy shows the relative privilege level. It is **not an inheritance model** — each role has explicitly assigned permissions.

```
ORG_ADMIN  (highest privilege)
    │
    ├── BUSINESS_MANAGER
    │       │
    │       ├── REVIEWER
    │       │
    │       └── ANALYST
    │
    ├── READ_ONLY
    │
    ├── EXTERNAL_AUDITOR
    │
    └── INTEGRATION_ACCOUNT   (narrowest scope)
```

**Key rule:** Higher privilege does NOT imply inheritance. Each role's permissions are independently defined and must be explicitly granted.

---

# Chapter 7 — Role × Permission Matrix

## 7.1 The Matrix

This is the canonical reference for what each role can do. The matrix uses Platform Role identifiers. Product Labels are shown in parentheses for reference. Every implementation decision in RB-02B must trace back to this matrix.

| Permission | Admin (ORG_ADMIN) | Business Mgr (BUSINESS_MGR) | Reviewer (REVIEWER) | Analyst (ANALYST) | Read Only (READ_ONLY) | Ext. Auditor (EXT_AUDITOR) | Integration (INT_ACCT) |
|------------|:-----------------:|:---------------------------:|:-------------------:|:-----------------:|:--------------------:|:--------------------------:|:---------------------:|
| **P01** Project Management | ✅ | ✅ | — | — | — | — | — |
| **P02** Project Deletion | ✅ | — | — | — | — | — | — |
| **P03** Workbook Management | ✅ | ✅ | — | — | — | — | — |
| **P04** Workbook Export | ✅ | ✅ | — | — | — | — | — |
| **P05** Supplier Management | ✅ | ✅ | — | ✅ | — | — | ⚠️ |
| **P06** Spend Data Entry | ✅ | ✅ | — | ✅ | — | — | ⚠️ |
| **P07** Evidence Upload | ✅ | ✅ | ✅ | ✅ | — | — | ⚠️ |
| **P08** Evidence Read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| **P09** Evidence Deletion | ✅ | ✅ | ✅ | — | — | — | — |
| **P10** Finding Management | ✅ | ✅ | ✅ | — | — | — | — |
| **P11** Finding Close | ✅ | ✅ | ✅ | — | — | — | — |
| **P12** Review Management | ✅ | ✅ | ✅ | — | — | — | — |
| **P13** Review Approval | ✅ | ✅ | ✅ | — | — | — | — |
| **P14** Review Override | ✅ | — | — | — | — | — | — |
| **P15** AI Review | ✅ | ✅ | ✅ | — | ✅ | ✅ | — |
| **P16** Classification Mgmt | ✅ | ✅ | — | — | — | — | — |
| **P17** Import | ✅ | ✅ | — | ✅ | — | — | ⚠️ |
| **P18** Export Management | ✅ | ✅ | — | ✅ | — | — | ⚠️ |
| **P19** Report Management | ✅ | ✅ | — | ✅ | ✅ | ✅ | — |
| **P20** Audit Log Access | ✅ | ✅ 🔷 | — | — | — | ✅ | — |
| **P21** Settings Management | ✅ | — | — | — | — | — | — |
| **P22** Organization Membership | ✅ | — | — | — | — | — | — |
| **P23** AI Configuration | ✅ | — | — | — | — | — | — |

**Key:**
- ✅ = Permission granted (maps to ALLOW)
- — = Permission denied (maps to DENY)
- ⚠️ = Permission granted with restrictions (defined in Chapter 8 Policies)
- 🔷 = Permission granted with scope constraint — see rule §7.2.6

## 7.2 Matrix Rules

1. **No role inherits from another** — every cell is explicit
2. **Admin has all permissions** — but must still pass RB-01 tenant isolation + Policy Engine (no bypass, per ADR-RB02-003)
3. **Read Only has view access** — no create/update/delete mutations; can view reports
4. **External Auditor has no export permission** — data cannot leave the platform
5. **Integration Account permissions are scoped per integration** — the ⚠️ entries are granted only when explicitly configured
6. **Audit Log Access is project-scoped for Business Manager** — `BUSINESS_MANAGER` may read audit logs for projects they manage, not for the entire organization. Organization-wide audit logs remain Admin-only.

## 7.3 Permission Count per Role

| Role | Platform Role | Permissions Granted | % of Total |
|------|--------------|:------------------:|:----------:|
| Organization Administrator | `ORG_ADMIN` | 23 | 100% |
| Business Manager | `BUSINESS_MANAGER` | 16 | 70% |
| Reviewer | `REVIEWER` | 10 | 43% |
| Analyst | `ANALYST` | 7 | 30% |
| Read Only | `READ_ONLY` | 4 | 17% |
| External Auditor | `EXT_AUDITOR` | 3 | 13% |
| Integration Account | `INTEGRATION_ACCOUNT` | 0 + ⚠️ | Configurable |

## 7.4 Authorization Invariants

These are rules that must remain true for the lifetime of the authorization system. They are **not implementation guidelines** — they are contract guarantees that every part of the system must preserve.

| # | Invariant | Why It Matters |
|---|-----------|----------------|
| 1 | **Every Action maps to exactly one Permission.** | Prevents ambiguity. An action cannot belong to zero permissions (unreachable) or multiple permissions (conflicting authorization). |
| 2 | **Every Permission belongs to exactly one Capability.** | Capabilities keep permissions organized by domain. No orphan permissions. |
| 3 | **Every Permission is granted by at least one Role.** | If a permission exists but no role grants it, it is dead configuration. |
| 4 | **Every Role grants at least one Permission.** | A role with zero permissions is unused. If unused, remove it. |
| 5 | **No Action bypasses the Policy Engine.** | Every action, regardless of role, must pass through the authorization engine. No shortcuts, no `if admin return true`. |
| 6 | **No Role bypasses Tenant Isolation.** | Even Platform Admin must pass RB-01 tenant isolation before RB-02 authorization. |
| 7 | **Every Authorization Decision emits an `AuthorizationEvaluated` event.** | No silent authorization. Every ALLOW, DENY, REQUIRE_APPROVAL, or READ_ONLY decision is recorded. |
| 8 | **Every Permission belongs to one Resource.** | A permission scopes actions on a specific resource type. Cross-resource permissions indicate poor decomposition. |
| 9 | **Every Resource owns at least one Action.** | A resource with no actions is dead. If a resource exists in the catalog, it must have at least one protectable operation. |
| 10 | **No Derived Resource can exist without its Primary Resource.** | A Derived Resource (AI output, score, recommendation) cannot be accessed or managed independently of its source Primary Resource. Deleting the Primary Resource must cascade to its Derived Resources. |

---

# Chapter 8 — Authorization Policies

## 8.1 Policy Engine Architecture

Policies are rules that cannot be expressed by the Role × Permission Matrix alone. They add contextual constraints — who, when, under what conditions. Policies are evaluated by a **Policy Engine** that follows a strict pipeline.

### 8.1.1 Policy Evaluation Pipeline

The Policy Engine evaluates every request through six sequential stages. If any stage produces a controlling decision (DENY or REQUIRE_APPROVAL at rank 1–2), later stages may be skipped.

```
[1] Identity Resolution
    │   Who is the user? What organization? What role?
    │   Inputs: Session, Membership
    │   Output: Actor Identity + Role
    ▼
[2] Authorization Resolution
    │   Does the role grant the required permission?
    │   Inputs: Actor Role, Action, Permission Matrix (Ch 7)
    │   Output: Permission ✅/❌
    ▼
[3] Policy Evaluation
    │   Apply active policies (POL-01 through POL-09)
    │   Inputs: Actor, Resource, Action, Organization, WorkflowState
    │   Output: Per-policy decisions (ALLOW / DENY / REQUIRE_APPROVAL / READ_ONLY)
    ▼
[4] Workflow Constraints
    │   SoD check (Chapter 9) + Approval check (Chapter 10)
    │   Output: REQUIRE_APPROVAL or ALLOW
    ▼
[5] Decision Composition
    │   Apply Decision Precedence (§2.5.4) to all stage outputs
    │   Highest rank wins: DENY > REQUIRE_APPROVAL > READ_ONLY > ALLOW
    │   Output: Final Decision
    ▼
[6] Decision Trace
    │   Emit AuthorizationEvaluated + build Decision Trace
    │   Output: Trace object + Audit Event
```

**Rule:** If any stage produces DENY, the pipeline short-circuits. No further stages execute. The DENY is logged immediately.

### 8.1.2 Decision Precedence (from §2.5.4)

| Rank | Decision | Evaluation Behavior |
|:----:|----------|---------------------|
| 1 | **DENY** | Short-circuit — return immediately |
| 2 | **REQUIRE_APPROVAL** | Continue pipeline but override lower ranks |
| 3 | **READ_ONLY** | Continue pipeline but restrict mutations |
| 4 | **ALLOW** | Lowest — default when no policy restricts |

The engine composes decisions by taking the **highest rank** produced by any stage. See §2.5.4 for the complete definition.

## 8.2 Policy Metadata Standard

Every policy must declare unified metadata. This ensures the engine knows **where** to evaluate each policy and **what inputs** it needs.

| Field | Description | Example |
|-------|-------------|---------|
| **ID** | Unique policy identifier | `POL-02` |
| **Name** | Human-readable name | `Creator Privilege` |
| **Evaluation Stage** | Which pipeline stage evaluates this policy | `Identity`, `Policy`, `Workflow` |
| **Priority** | Evaluation order within stage (1 = first) | `5` |
| **Inputs** | What data the policy requires | `Actor`, `Resource`, `Membership` |
| **Decision Type** | What kind of decision this policy produces | `ELEVATE` (upgrades permission), `RESTRICT` (downgrades) |
| **Owner** | Governance team responsible | `Platform Governance` |
| **Conflicts With** | Policies that may produce contradictory results | `POL-04`, `POL-05` |
| **Status** | active / future / deprecated | `active` |

### Policy Inputs

Each policy declares its required **Inputs** explicitly:

| Input | Description | Source | Example |
|-------|-------------|--------|---------|
| `Actor` | The user identity and role | Session + Membership | `ANALYST` role |
| `Membership` | The user's organization membership | Membership catalog | `org_xyz789` |
| `Resource` | The resource being acted upon | Request parameter | `Project A` |
| `Organization` | The organization that owns the resource | RB-01 guard result | `org_xyz789` |
| `Action` | The specific action being performed | Function call | `finding.close` |
| `WorkflowState` | The current state of the resource | Domain service | `in_review` |

## 8.3 Policy Catalog

All policies below follow the unified metadata standard.

### POL-01: Ownership Rule (Default)

```yaml
ID: POL-01
Name: Ownership Rule
Evaluation Stage: Identity
Priority: 1
Inputs: Actor, Organization, Resource
Decision Type: RESTRICT
Owner: Platform Governance
Conflicts With: POL-02
Status: active
```

> A user may only perform actions on resources that belong to their organization.

**Implementation:** RB-01 tenant isolation guards (`assertProjectAccess`, `requireOrganizationAccess`) enforce this before RB-02 authorization is checked.

### POL-02: Creator Privilege

```yaml
ID: POL-02
Name: Creator Privilege
Evaluation Stage: Policy
Priority: 5
Inputs: Actor, Resource
Decision Type: ELEVATE
Owner: Platform Governance
Conflicts With: POL-01 (resolved by evaluation order)
Status: active
```

> A user who creates a resource has implicit update and delete permission on that specific resource, regardless of role.

**Scope:** `workbook`, `evidence`, `finding`, `supplier`, `spend-record`  
**Limitation:** Creator privilege does NOT grant approval permission (see SoD Chapter 9).

### POL-03: Project Scope Constraint

```yaml
ID: POL-03
Name: Project Scope Constraint
Evaluation Stage: Identity
Priority: 2
Inputs: Actor, Resource, Organization
Decision Type: RESTRICT
Owner: Platform Governance
Conflicts With: —
Status: active
```

> Workbook and evidence permissions are scoped to the project level. A user with workbook management access to Project A cannot access Project B's workbooks.

**Implementation:** RB-01 guards (`assertProjectAccess`) enforce project-level tenant isolation.

### POL-04: Integration Account Restriction

```yaml
ID: POL-04
Name: Integration Account Restriction
Evaluation Stage: Policy
Priority: 3
Inputs: Actor (Role = INTEGRATION_ACCOUNT)
Decision Type: RESTRICT
Owner: Platform Governance
Conflicts With: POL-05 (mutually exclusive roles)
Status: active
```

> Integration accounts are limited to API access only. They cannot:
> - Access the UI
> - Create or modify memberships
> - Override any decision
> - Export data beyond their configured scope

### POL-05: External Auditor Restriction

```yaml
ID: POL-05
Name: External Auditor Restriction
Evaluation Stage: Policy
Priority: 4
Inputs: Actor (Role = EXTERNAL_AUDITOR)
Decision Type: RESTRICT
Owner: Platform Governance
Conflicts With: POL-04 (mutually exclusive roles)
Status: active
```

> External auditors have READ_ONLY access with enhanced audit logging. They cannot:
> - Create, update, or delete any resource
> - Export data from the platform
> - View other users' roles or permissions
> - Access settings

### POL-06: Time-Based Access (Future)

```yaml
ID: POL-06
Name: Time-Based Access
Evaluation Stage: Policy
Priority: 10
Inputs: Actor, Resource, Action, System.Time
Decision Type: RESTRICT
Owner: Platform Governance
Conflicts With: —
Status: future
```

> Future: Authorization decisions may include time-based constraints (e.g., "read-only on weekends," "approval required outside business hours").

### POL-07: Approval Gate

```yaml
ID: POL-07
Name: Approval Gate
Evaluation Stage: Workflow
Priority: 1
Inputs: Actor, Action, Resource, WorkflowState
Decision Type: REQUIRE_THEN_ALLOW
Owner: Platform Governance
Conflicts With: —
Status: active
```

> Certain actions require explicit approval from a second user with the appropriate role before taking effect (see Chapter 10).

**Dependency:** This policy produces REQUIRE_APPROVAL, which triggers the Approval Engine (Chapter 10).

### POL-08: Resource Sensitivity Classification

```yaml
ID: POL-08
Name: Resource Sensitivity Classification
Evaluation Stage: Policy
Priority: 8
Inputs: Resource (field-level), Actor
Decision Type: RESTRICT
Owner: Platform Governance
Conflicts With: —
Status: future
```

> Resources with sensitive fields require explicit permission to read those fields, even within the same role.

**Example:** `Supplier.crNumber` (commercial registration) requires `supplier.read` + explicit sensitive-data flag.

### POL-09: Bulk Operation Limit

```yaml
ID: POL-09
Name: Bulk Operation Limit
Evaluation Stage: Policy
Priority: 7
Inputs: Action, Actor
Decision Type: RESTRICT
Owner: Platform Governance
Conflicts With: —
Status: active
```

> Bulk operations (import, export, batch update) require the same permission as the individual operation PLUS a dedicated bulk-operation permission.

**Scope:** `import.create`, `export.create`, batch review operations.

---

# Chapter 9 — Separation of Duties

## 9.1 Principle

Separation of Duties (SoD) ensures that no single user has the ability to perform two conflicting actions that could enable fraud, error, or abuse.

In governance products like LocalContentOS, SoD is a **core design requirement**, not a nice-to-have.

## 9.2 Capability-Based SoD

SoD rules are defined against **Capabilities**, not Role names. This is because roles may change across products, but the underlying capabilities remain the same.

**Rule:** *A user who performs an action requiring Capability A cannot perform a conflicting action requiring Capability B on the same resource, regardless of their role.*

| Capability | Description | Associated Permissions |
|------------|-------------|----------------------|
| `CAP_CREATE` | Creating resources | Project Management, Workbook Management, Evidence Upload |
| `CAP_REVIEW` | Reviewing and approving | Review Management, Review Approval |
| `CAP_CLOSE` | Closing or finalizing | Finding Close, Review Override |
| `CAP_EXPORT` | Exporting data | Workbook Export, Export Management |
| `CAP_CONFIGURE` | Configuring rules | Classification Management, Settings Management |
| `CAP_ADMIN` | Managing membership | Organization Membership |
| `CAP_IMPORT` | Importing data | Import |

This model is **product-independent**. In AuditOS, the same capability pairs apply:
- `CAP_CREATE` (create engagement) ≠ `CAP_REVIEW` (review engagement)
- `CAP_CREATE` (upload TB) ≠ `CAP_CLOSE` (finalize audit opinion)

## 9.3 LocalContentOS SoD Rules

Rules use both Platform Role names and Capability identifiers:

| # | Rule | Creator/Actor | Approver Capability | Approver Role | Rationale |
|---|------|---------------|--------------------|---------------|-----------|
| S01 | **Workbook creator ≠ Workbook approver** | `CAP_CREATE` → creates workbook | `CAP_REVIEW` | `REVIEWER` | Prevents manipulation of local content scores |
| S02 | **Evidence uploader ≠ Evidence reviewer** | `CAP_CREATE` → uploads evidence | `CAP_REVIEW` | `REVIEWER` | Prevents fraudulent evidence acceptance |
| S03 | **Finding author ≠ Finding closer** | `CAP_CREATE` → creates finding | `CAP_CLOSE` | `BUSINESS_MANAGER` | Ensures independent verification of issue resolution |
| S04 | **Report creator ≠ Report approver** | `CAP_CREATE` → generates report | `CAP_EXPORT` | `BUSINESS_MANAGER` | Prevents unauthorized data exfiltration |
| S05 | **Classification rule author ≠ Activator** | `CAP_CONFIGURE` → modifies rule | `CAP_ADMIN` | `ORG_ADMIN` | Prevents manipulation of scoring thresholds |
| S06 | **Membership inviter ≠ Role assigner** | `CAP_ADMIN` → invites member | `CAP_ADMIN` | Different `ORG_ADMIN` | Prevents privilege escalation |
| S07 | **Import operator ≠ Import validator** | `CAP_IMPORT` → runs import | `CAP_IMPORT` | Different `ANALYST` | Prevents data corruption from unchecked imports |

**Changes from v0.3:** All roles updated to Platform Role names. S06 changed from "user inviter" to "membership inviter" to match ADR-RB02-001.

## 9.4 SoD Exception Process

When SoD cannot be satisfied (e.g., a 2-person organization):

1. The system logs the exception with reason
2. An `AuthorizationEvaluated` event is created noting the SoD bypass
3. The organization ORG_ADMIN must acknowledge the exception
4. Exception is reviewed during audit

## 9.5 SoD Enforcement Level

| Level | Behavior | Used For |
|-------|----------|----------|
| **Hard** | Blocked at the Policy Engine level. Returns DENY. | S01, S04, S06 |
| **Soft** | Warning logged. Allowed if explicitly acknowledged. | S02, S03, S05, S07 |

---

# Chapter 10 — Approval Boundaries

## 10.1 Relationship with Authorization Decision Model

Approval is triggered by the **REQUIRE_APPROVAL** decision from the Policy Engine (see §2.5). When the engine produces REQUIRE_APPROVAL, it:
1. Does NOT execute the action
2. Creates an `ApprovalRequest` in `pending` state
3. Notifies the designated approver(s)
4. Waits for resolution (approve / reject / expire)

Authorization asks "can this user perform this action?" Approval asks "has a second qualified user confirmed this action should take effect?"

## 10.2 Approval Authority Model

Every approval gate has a structured **Approval Authority** that determines who can approve, and how many approvals are needed:

```
Approval Authority
├── Threshold          # What action or condition triggers approval
├── Required Capability # What capability the approver must have
├── Approver Role       # What Platform Role the approver needs
├── Approval Type       # single / dual / parallel / sequential
└── Approval Count      # How many approvals needed (default: 1)
```

### Approval Types

| Type | Behavior | Use Case |
|------|----------|----------|
| **Single** | One designated approver can approve | Standard case |
| **Dual** | Two different approvers must both approve | High-risk (e.g., project deletion) |
| **Parallel** | Multiple approvers notified; any one can approve | Time-sensitive |
| **Sequential** | Approver A must approve before Approver B | Hierarchical governance (e.g., Manager → Director) |

## 10.3 Approval Gates

| # | Action | Threshold | Required Capability | Approver Role | Approval Type | Approval Count |
|---|--------|-----------|--------------------|---------------|:-------------:|:--------------:|
| A01 | `project.delete` | Always | `CAP_ADMIN` | `ORG_ADMIN` | Dual | 2 |
| A02 | `workbook.export` | Always | `CAP_REVIEW` | `BUSINESS_MANAGER` | Single | 1 |
| A03 | `report.export` | Always | `CAP_EXPORT` | `BUSINESS_MANAGER` | Single | 1 |
| A04 | `evidence.delete` | Always | `CAP_REVIEW` | `BUSINESS_MANAGER` | Single | 1 |
| A05 | `review.override` | Always | `CAP_ADMIN` | `ORG_ADMIN` | Single | 1 |
| A06 | `classification-rule.delete` | Always | `CAP_ADMIN` | `ORG_ADMIN` | Single | 1 |
| A07 | `settings.update` | Threshold values | `CAP_ADMIN` | `ORG_ADMIN` (second) | Single | 1 |
| A08 | `membership.assignRole` | Target = `ORG_ADMIN` | `CAP_ADMIN` | Different `ORG_ADMIN` | Single | 1 |
| A09 | `import.create` | Untrusted source | `CAP_IMPORT` | `BUSINESS_MANAGER` | Single | 1 |

**Note:** Role names use Platform Role identifiers. Product labels are resolved by the UI. For example, `BUSINESS_MANAGER` displays as "Local Content Manager" in LocalContentOS and "Engagement Manager" in AuditOS.

## 10.4 Approval Flow

```
1. User A performs action → Policy Engine returns REQUIRE_APPROVAL
        │
        ▼
2. System creates ApprovalRequest (state: pending)
   └── Resource is NOT modified yet
   └── AuthorizationEvaluated(REQUIRE_APPROVAL) logged
        │
        ▼
3. Notification sent to approver(s) based on Approval Authority
        │
        ▼
4. Approver(s) review
   ├── Approved → Resource is modified → OperationCompleted logged
   └── Rejected → Resource unchanged → OperationFailed logged
        │
        ▼
5. Audit event recorded
   ├── Who requested (Actor)
   ├── Who approved/rejected
   ├── Decision
   ├── Reason
   └── AuthorizationEvaluated → ApprovalRequest → OperationCompleted/Failed
```

## 10.5 Approval Expiry

| Time Window | Default | Configurable? |
|-------------|---------|:-------------:|
| Pending approval timeout | 72 hours | Yes (per organization) |
| Approved action validity | 24 hours | Yes (per action type) |

After expiry:
- Pending → automatically rejected (with `OperationFailed` audit event)
- Approved → requires re-approval

---

# Chapter 11 — Authorization Observability

Observability covers three layers: what was decided, why it was decided, and what happened as a result. This replaces a simple audit log with a full Decision Trace system.

## 11.1 Event Types

The system produces three types of observability events, per ADR-RB02-002 (Dual Audit Events):

| Event Type | When | Mandatory |
|------------|------|:---------:|
| **AuthorizationEvaluated** | Immediately after the Policy Engine produces a decision (Stage 6 of the pipeline) | ✅ Always |
| **OperationCompleted** | After business logic executes successfully | ✅ On success |
| **OperationFailed** | After business logic fails | ✅ On failure |

### Event Flow

```
AuthorizationEvaluated
    │
    ├── [if decision = ALLOW] → Execute Service → OperationCompleted / OperationFailed
    │
    ├── [if decision = DENY]  → Return 403 → No further events
    │
    ├── [if decision = REQUIRE_APPROVAL] → ApprovalEngine →
    │       ├── Approved → Execute Service → OperationCompleted
    │       └── Rejected → OperationFailed
    │
    └── [if decision = READ_ONLY] → Execute read-only → OperationCompleted
```

## 11.2 Decision Trace Structure

Every authorization decision produces a **Decision Trace** object. This is the complete record of how the decision was reached.

```yaml
DecisionTrace:
  evaluationOrder:
    - Identity Resolution
    - Authorization Resolution
    - Policy Evaluation
    - Workflow Constraints
    - Decision Composition
    - Decision Trace
  
  policyResults:
    - POL-01: PASS
    - POL-03: PASS
    - POL-07: REQUIRE_APPROVAL
  
  winningDecision: REQUIRE_APPROVAL
  winningPolicy: POL-07 (Approval Gate)
  
  reason: >
    Analyst (ANALYST) attempted workbook.export on Project A.
    Permission check: PASS (P04 Workbook Export).
    Policy POL-07: workbook.export requires approval from BUSINESS_MANAGER.
    Decision Precedence: REQUIRE_APPROVAL (rank 2) > ALLOW (rank 4).
    Final decision: REQUIRE_APPROVAL.
  
  executionPath:
    - Identity: PASS (user authenticated as ANALYST)
    - Authorization: PASS (P04 granted to ANALYST)
    - Policy: REQUIRE_APPROVAL (POL-07)
    - Workflow: NOT_EVALUATED (short-circuited by REQUIRE_APPROVAL)
  
  auditEventIds:
    authorizationEvaluated: "aev_abc123"
    operationCompleted: null
    operationFailed: null
    approvalRequest: "apr_xyz789"
```

## 11.3 AuthorizationEvaluated Event Fields

| Field | Type | Example |
|-------|------|---------|
| `eventType` | Enum | `authorization.evaluated` |
| `timestamp` | DateTime | `2026-06-28T12:00:00Z` |
| `actorId` | String | `usr_abc123` |
| `actorRole` | String | `ANALYST` |
| `organizationId` | String | `org_xyz789` |
| `resourceType` | String | `workbook` |
| `resourceId` | String | `wbk_456` |
| `action` | String | `workbook.export` |
| `permission` | String | `Workbook Export (P04)` |
| `decision` | Enum | `ALLOW` / `DENY` / `REQUIRE_APPROVAL` / `READ_ONLY` |
| `reason` | String | `Policy POL-07: workbook.export requires approval` |
| `sodOverride` | Boolean | `false` |
| `approvalRequired` | Boolean | `true` |
| `approvalStatus` | Enum | `not_required` / `pending` / `approved` / `rejected` |
| `decisionTraceRef` | String | `dt_xyz789` |

**Key change from v0.3:** `decision` field now supports all 4 outcomes (was ALLOW/DENY only). Added `decisionTraceRef` to link to the full Decision Trace.

## 11.4 Log Retention Levels

| Level | Events Included | Retention | Trigger |
|-------|----------------|:---------:|---------|
| **Standard** | All `AuthorizationEvaluated` events | 1 year | Default for all decisions |
| **Enhanced** | All events + full Decision Trace | 3 years | Sensitive resource access, SoD overrides, DENY decisions |
| **External Auditor** | All events by `EXTERNAL_AUDITOR` role | 5 years | Regulatory compliance |

## 11.5 Observability Query Capabilities

The system must support:

- Filter by actor, resource, action, decision, time range, policy
- Export audit trail (requires P20 — Audit Log Access permission)
- View SoD violations grouped by user
- View approval completion rates and times
- Trace a single request through the full evaluation pipeline
- Group by `decisionTraceRef` to see the complete lifecycle of a request

## 11.6 Non-Repudiation

- All events are append-only (no updates, no deletes)
- Timestamps are server-side (not client-provided)
- Actor identity comes from session (not client-provided)
- Decision reason includes the specific policy/rule that produced the decision
- Decision Trace is immutable once emitted
- Event IDs are globally unique and ordered

---

# Chapter 12 — RB-02B Execution Contract

## 12.1 Purpose

This chapter defines the binding contract between RB-02A (Design) and RB-02B (Implementation). These are not recommendations — they are architectural constraints derived from the design in Chapters 1–11.

**Status:** This is the **Go/No-Go decision point**. RB-02B may not begin until the conditions in this chapter are met.

## 12.2 Binding Rules

### Rule 1: Permission-First Development

> No guard shall be written before its corresponding permission exists in the codebase.

**Rationale:** Guards that check permissions that don't exist are untestable and unverifiable.  
**Enforcement:** RB-02B must start by creating the Permission Catalog as code constants/enums. Then implement guards.

### Rule 2: Permission Existence Requires Resource Existence

> No permission shall be created before its corresponding resource is defined.

**Rationale:** A permission without a resource is an orphan. Every `project.create` implies `Resource: Project`.  
**Enforcement:** RB-02B must define resources (as types or enums) before permissions.

### Rule 3: Action-to-Permission Traceability

> Every action in a server action file must be traceable to at least one permission in the Permission Catalog.

**Rationale:** Prevents actions from executing without authorization coverage.  
**Enforcement:** RB-02B must produce an Action→Permission mapping document before implementation.

### Rule 4: Permission-to-Matrix Traceability

> Every permission in the codebase must appear in the Role × Permission Matrix (Chapter 7).

**Rationale:** Prevents undocumented permissions that bypass the design process.  
**Enforcement:** Any permission in code without a matrix entry fails the RB-02B Gate.

### Rule 5: Guard Requires Test

> Every authorization guard must have at least one unit test per decision outcome: ALLOW, DENY (wrong-role), DENY (wrong-org), REQUIRE_APPROVAL, and READ_ONLY.

**Rationale:** Authorization logic is too sensitive to trust without test coverage. The four-outcome model (§2.5) requires testing each decision path.  
**Enforcement:** RB-02B must produce tests alongside guards. Minimum: 5 tests per guard (one per decision outcome).

### Rule 6: Authorization Generates Observability

> Every authorization decision (ALLOW, DENY, REQUIRE_APPROVAL, or READ_ONLY) must produce an `AuthorizationEvaluated` event with a full Decision Trace (Chapter 11).

**Rationale:** Silent authorization is invisible governance. Every outcome matters equally for observability.  
**Enforcement:** The guard framework must emit the Decision Trace and event before returning the result.

### Rule 7: Fail Closed

> If the authorization system cannot determine a decision (database error, missing role, missing permission), it MUST return DENY.

**Rationale:** Fail-open authorization is a security vulnerability.  
**Enforcement:** Default case is always DENY. No "allow by default" logic.

### Rule 8: Server-Side Only

> Authorization decisions must never be made on the client. UI may use role information for UX purposes (hiding buttons), but the server must independently verify every action.

**Rationale:** Client-side authorization is not authorization — it's cosmetic filtering.  
**Enforcement:** No `role` or `permission` check in client components is treated as authoritative.

### Rule 9: Atomic Permission Checks

> Each action checks exactly one permission. No compound checks where one action requires multiple permissions.

**Rationale:** Compound checks create untestable decision trees and confuse audit logs.  
**Exception:** Bulk operations may check both individual AND bulk permissions.

### Rule 10: Role Immutability at Runtime

> A user's role cannot change during an active session. Role changes require re-authentication.

**Rationale:** Prevents TOCTOU (time-of-check-time-of-use) attacks where a user escalates privileges during an active session.  
**Enforcement:** Role is cached in session JWT. Role change invalidates session.

## 12.3 Implementation Prohibitions

These are explicit prohibitions — things that RB-02B must NOT do:

| # | Prohibition | Risk If Violated |
|---|-------------|------------------|
| 1 | ❌ **No inline authorization logic** — All authorization must go through the Policy Engine. Guards may not implement custom role-checking logic. | Bypasses Decision Trace, audit, and composition |
| 2 | ❌ **No role name comparisons** — `if (role === 'admin')` is forbidden. All decisions go through the Role → Permission → Policy chain. | Breaks SoD and bypasses ADR-RB02-003 (No Admin Bypass) |
| 3 | ❌ **No direct permission strings** — Permission names must be type-safe constants/enums, not raw strings. | Typing errors produce silent DENY or unexpected ALLOW |
| 4 | ❌ **No authorization outside Policy Engine** — Every authz decision must pass through the engine. No separate authz paths. | Untraceable decisions, audit gaps |
| 5 | ❌ **No service-layer permission decisions** — Authorization is resolved in the Guard layer, not deep in service logic. | Scattered logic makes testing impossible |
| 6 | ❌ **No bypass for Platform Admin** — Platform Admin passes through the same Policy Engine (per ADR-RB02-003) | Broke audit, SoD, and least privilege |
| 7 | ❌ **No product-specific authorization engine** — All products use the shared engine. Product-specific catalogs are data, not code. | Duplication and divergence across products |
| 8 | ❌ **No silent fallback to ALLOW** — If any check fails (exception, timeout, missing data), the result must be DENY. | Fail-open vulnerability |

## 12.4 Implementation Invariants

These are runtime rules that must hold true during and after RB-02B implementation:

| # | Invariant | Verification Method |
|---|-----------|-------------------|
| I01 | **Every action MUST call the Authorization Engine** | Static analysis of all action files |
| I02 | **Every authorization decision MUST produce a Decision Trace** | Log inspection |
| I03 | **Every decision MUST emit `AuthorizationEvaluated`** | Log inspection |
| I04 | **Every protected resource MUST have a Resource ID** | Schema validation |
| I05 | **Every Permission MUST belong to exactly one Capability** | Registry validation |
| I06 | **Every Capability MUST belong to exactly one Product Catalog** | Registry validation |
| I07 | **The Policy Engine MUST produce exactly one of 4 outcomes** | TypeScript enum enforcement |
| I08 | **No guard may reference a role by name** | Code review / static analysis |
| I09 | **The Decision Precedence table MUST be enforced** | Integration test (all combinations) |
| I10 | **Session role changes MUST invalidate active sessions** | Security test |

## 12.5 RB-02B Deliverables

RB-02B must produce the following deliverables. Each is required for Gate passage:

| # | Deliverable | Description | Required |
|---|-------------|-------------|:--------:|
| D01 | **Authorization Engine** | Core engine implementing the 6-stage pipeline (§8.1.1) | ✅ |
| D02 | **Policy Engine** | Evaluates policies from the Policy Registry with Decision Precedence composition | ✅ |
| D03 | **Policy Registry** | Register of all active policies with unified metadata (Chapter 8) | ✅ |
| D04 | **Permission Registry** | Map of all permissions with their actions and capability associations | ✅ |
| D05 | **Capability Registry** | Catalog of all capabilities (CAP_CREATE, CAP_REVIEW, etc.) | ✅ |
| D06 | **Guard Middleware** | Guard layer that intercepts actions before service logic | ✅ |
| D07 | **Decision Trace** | Full trace production per Chapter 11 specification | ✅ |
| D08 | **Approval Dispatcher** | Integration with approval workflow (Chapter 10) | ✅ |
| D09 | **Audit Integration** | AuthorizationEvaluated + OperationCompleted/Failed emission | ✅ |
| D10 | **Test Suite** | Tests for every guard (min 5 per guard, all 4 outcomes) | ✅ |
| D11 | **Regression Guards** | Automated guards for RB-02 (guard.mjs) | ✅ |
| D12 | **Documentation** | Implementation guide, operator runbook, RB-02B completion report | ✅ |

## 12.6 RB-02B Implementation Sequence

The implementation must follow this order:

```
Step 1: Define Resource Types (as TypeScript enums/types)
    │
    ▼
Step 2: Define Action Types (as TypeScript enums)
    │
    ▼
Step 3: Define Permission Types (as TypeScript enums)
    │
    ▼
Step 4: Define Role Types (as TypeScript enums)
    │
    ▼
Step 5: Implement Permission-to-Action mapping
    │
    ▼
Step 6: Implement Role-to-Permission mapping (the Matrix)
    │
    ▼
Step 7: Implement Authorization Guard function
    │
    ▼
Step 8: Add AuthorizationEvaluated + Decision Trace to Guard
    │
    ▼
Step 9: Write Tests for every Guard (min 5 per guard)
    │
    ▼
Step 10: Apply Guards to all 69 actions in the Action Catalog
    │
    ▼
Step 11: SoD enforcement (Chapter 9)
    │
    ▼
Step 12: Approval gate integration (Chapter 10)
    │
    ▼
Step 13: Regression Guard for RB-02
```

## 12.7 RB-02B Gate Criteria

RB-02B shall be considered complete only when all gates pass with evidence:

| # | Criterion | Evidence Required | Method |
|---|-----------|-------------------|--------|
| G1 | All 69 actions have authorization guards | Static analysis report | Static analysis of all action files |
| G2 | All 23 permissions have corresponding matrix entries | Registry diff against Chapter 7 | Comparison against Role×Permission Matrix |
| G3 | All guards have min 5 tests each (ALLOW, DENY-wrong-role, DENY-wrong-org, REQUIRE_APPROVAL, READ_ONLY) | Test coverage report | `npm test` with coverage |
| G4 | Every authorization decision produces Decision Trace + AuthorizationEvaluated | Log query for 100 recent decisions | Audit log inspection |
| G5 | `npx tsc --noEmit` passes | Build log | Zero TS errors |
| G6 | `npm run build` passes | Build log | Clean build |
| G7 | RB-02 Regression Guard exits 0 | Guard output | Dedicated `guard.mjs` for RB-02 |
| G8 | SoD rules functional (S01–S07, Chapter 9) | Integration test results | Integration tests per rule |
| G9 | Approval gates functional (A01–A09, Chapter 10) | Integration test results | Integration tests per gate |
| G10 | Role changing invalidates session | Security test results | Security test |

## 12.8 RB-02B Handoff Package

Before RB-02B begins, the following package must be prepared. This ensures RB-02B starts with complete context, without needing to read the full project history.

| Item | Source | Format |
|------|--------|--------|
| **RB-02A v0.5 (this document)** | Complete specification | Markdown |
| **All 20 ADRs (Appendix C)** | Architectural decisions | Markdown table |
| **Resource Catalog (Chapter 3)** | 16 Primary + 2 Derived Resources | TypeScript enum spec |
| **Action Catalog (Chapter 4)** | 69 actions across 18 resource types | TypeScript enum spec |
| **Permission Catalog (Chapter 5)** | 23 permissions with action mappings | TypeScript enum spec |
| **Capability Catalog (Chapter 9)** | 7 capabilities (CAP_CREATE through CAP_IMPORT) | TypeScript enum spec |
| **Role Catalog (Chapter 6)** | 7 Platform Roles with Product Labels | TypeScript enum spec |
| **Role×Permission Matrix (Chapter 7)** | Complete cell-by-cell mapping | Matrix (code or config) |
| **Policy Catalog (Chapter 8)** | 9 policies with unified metadata | Policy Registry spec |
| **Decision Model (§2.5)** | 4 outcomes + Decision Precedence | TypeScript union type |
| **Approval Authority (§10.2)** | 9 approval gates with full authority model | Config spec |
| **Authorization Invariants (§7.4)** | 10 architectural invariants | Test spec |
| **Implementation Invariants (§12.4)** | 10 runtime invariants | Test spec |
| **Test Strategy** | 5 tests per guard, all 4 outcomes | Test plan |
| **Regression Guard Spec** | Static analysis + integration tests | Guard spec |
| **Acceptance Criteria** | 10 gates (G1–G10) with evidence requirements | Gate checklist |

## 12.9 Architecture Freeze

Upon acceptance of RB-02A:

```
RB-02A becomes the normative specification for authorization in AQLIYA.

RB-02B may NOT modify the architecture defined in Chapters 1–11.

RB-02B implements the architecture as specified — nothing more, nothing less.

Architectural changes (any change to Resources, Actions, Permissions, Roles,
Matrix, Policies, SoD, Approval, or Observability model) require:

    1. A new ADR approved by Architecture Review
    2. An RB-02A revision (v2.x or higher)
    3. A new handoff package

No architectural decisions may be made during RB-02B implementation
without explicit RB-02A revision.
```

## 12.10 Versioning Policy

| Version | Meaning | ADR Required? | Migration Required? |
|---------|---------|:-------------:|:-------------------:|
| **v1.x** | Compatible implementation changes. Bug fixes, performance, test additions. No change to the authorization model. | No | No |
| **v2.x** | Breaking changes to the authorization model. New outcomes, new policies, new decision precedences. | ✅ Yes (at minimum one ADR) | ✅ Yes |
| **v3.x** | Fundamental architecture change. New authorization paradigm, new engine. | ✅ Yes (multiple ADRs + architecture review) | ✅ Yes (full migration plan) |

**RB-02A itself follows this policy.** v0.1–v0.5 are draft iterations. The first accepted version is v1.0.

## 12.11 Definition of Done — RB-02B

RB-02B is complete only when ALL of the following are true:

| # | Item | Verification |
|---|------|-------------|
| 1 | Runtime Engine implemented (6-stage pipeline) | Integration test |
| 2 | All 9 policies registered in Policy Registry | Registry query |
| 3 | Guards applied to all 69 actions | Static analysis (G1) |
| 4 | Decision Trace produced for every decision | Log query (G4) |
| 5 | AuthorizationEvaluated emitted for every decision | Log query (G4) |
| 6 | All guards have 5+ tests (ALL 4 outcomes) | Test report (G3) |
| 7 | All 10 gate criteria pass WITH evidence | Gate checklist (G1–G10) |
| 8 | Regression Guard exits 0 | Guard output (G7) |
| 9 | ADR Compliance — every ADR in Appendix C addressed | ADR trace matrix |
| 10 | Documentation written (implementation guide + runbook) | Document review |
| 11 | `npx tsc --noEmit` passes | Build log (G5) |
| 12 | `npm run build` passes | Build log (G6) |
| 13 | No inline authorization, no role name comparisons, no bypass (Prohibitions §12.3) | Code review |
| 14 | Implementation Invariants (I01–I10) verified | Test suite |

---

# Appendix A: Relationship with Other Programs

| Program | Relationship with RB-02 |
|---------|------------------------|
| **RB-01 (Tenant Isolation)** | Prerequisite. RB-02 guards are called AFTER RB-01 guards. RB-01 ensures the user belongs to the organization; RB-02 ensures the user's role permits the action. |
| **P0-A1 / SC-01 (Validation)** | Parallel concern. Validation runs AFTER authorization. Authorization answers "can they do this?"; validation answers "is the input correct?" |
| **SC-01B (Workbook Validation)** | Blocked by RB-02. Workbook actions (`createWorkbookAction`, `populateWorkbookAction`) cannot be validated without knowing which role is performing them (and thus what constraints apply). Unblocked after RB-02B. |
| **SC-02 (Upload Security)** | Downstream. Upload security must consider authorization context (who is uploading, to which project, with what evidence type). |
| **Security Architecture Review** | After RB-02B. A one-day review ensuring all security layers (Auth, TI, RBAC, Approval, Audit, Evidence, Export) work as one integrated system. |

# Appendix B: Glossary

| Term | Definition |
|------|------------|
| **Action** | A specific operation on a resource (e.g., `project.create`). |
| **Permission** | A named group of actions (e.g., `Project Management`). |
| **Capability** | A stable, product-independent functional area used for SoD rules (e.g., `CAP_CREATE`, `CAP_REVIEW`). |
| **Role** | A named set of permissions assigned to a user within an organization. Has two layers: Platform Role (engine) and Product Label (UI). |
| **Platform Role** | The canonical role identifier used by the Authorization Engine (e.g., `BUSINESS_MANAGER`). |
| **Product Label** | The human-readable role name displayed in a specific product's UI (e.g., "Local Content Manager"). |
| **Resource** | A protected data object (e.g., `Project`, `Workbook`). Two types: Primary and Derived. |
| **Derived Resource** | A resource generated by AI/system processes with limited lifecycle (read, accept, reject, archive — no update). |
| **Guard** | A function that intercepts an action and calls the Authorization Engine. Returns one of four outcomes: ALLOW, DENY, REQUIRE_APPROVAL, READ_ONLY. |
| **Policy Engine** | The component that evaluates policies against the 6-stage pipeline and applies Decision Precedence. |
| **Decision Precedence** | The rank-based composition model: DENY (1) > REQUIRE_APPROVAL (2) > READ_ONLY (3) > ALLOW (4). |
| **Decision Trace** | The complete record of how a decision was reached: evaluation order, policy results, winning decision, reason, audit event IDs. |
| **AuthorizationEvaluated** | The audit event emitted immediately after every authorization decision (ALLOW, DENY, REQUIRE_APPROVAL, READ_ONLY). |
| **SoD** | Separation of Duties — preventing a single user from performing conflicting actions, defined against Capabilities. |
| **Approval Gate** | A workflow step requiring a second qualified user to confirm before an action takes effect. Defined by Approval Authority model. |
| **Approval Authority** | Structured model: Threshold → Required Capability → Approver Role → Approval Type → Approval Count. |
| **Fail Closed** | Defaulting to DENY when the authorization system cannot make a decision. |
| **Architecture Freeze** | The state after RB-02A acceptance where architectural changes require ADR + revision. |
| **Handoff Package** | The complete set of documents and specifications that RB-02B receives before starting implementation. |

# Appendix C: Architecture Decision Record (ADR)

This appendix records the architectural decisions made during RB-02A review. Each decision has a rationale that future implementors and reviewers can reference.

| ADR | Title | Decision | Date |
|-----|-------|----------|------|
| ADR-RB02-001 | **Membership replaces User** | R19 changed from `User` to `Organization Membership`. RB-02 manages membership (which user belongs to which org, with what role). User identity lifecycle remains outside RB-02. | 2026-06-28 |
| ADR-RB02-002 | **Dual Audit Events** | Two audit event types: `AuthorizationEvaluated` (after authz check) and `OperationCompleted`/`OperationFailed` (after business logic). Ensures full traceability — no silent authorization, no unlogged failures. | 2026-06-28 |
| ADR-RB02-003 | **No Admin Bypass** | Platform Admin does NOT bypass the authorization engine. Admin has a role with permissions and passes through the same Policy Engine. Preserves audit, SoD, least privilege, and forensic traceability. | 2026-06-28 |
| ADR-RB02-004 | **Derived Resources** | Resources generated by AI (Pattern Suggestion, Recommendation) classified as **Derived Resources**. Limited lifecycle: read, accept, reject, archive. No `update` or user-initiated `create`. Extends naturally to AuditOS and SalesOS. | 2026-06-28 |
| ADR-RB02-005 | **Workbook Line merged into Workbook** | Workbook Line removed as an independent resource. Workbook content management uses `editContent`, `editStructure`, `approve` operations directly on Workbook. Reversible if per-line lifecycle (comments, approvals, ownership) is proven necessary. | 2026-06-28 |
| ADR-RB02-006 | **Platform Scope replaces Cross-Tenant Roles** | Cross-tenant roles do not exist. Platform-wide operations use a distinct **Platform Scope** with its own Policy set. Evaluated by the same engine. | 2026-06-28 |
| ADR-RB02-007 | **Shared Engine, Product Catalogs** | Authorization engine (policies, SoD, audit, fail-closed) is shared across all AQLIYA products. Each product defines only its Resource/Action/Permission/Role catalogs. | 2026-06-28 |
| ADR-RB02-008 | **Emergency Read-Only Mode** | When policy store is unavailable and Feature Flag is ON, system enters read-only mode. No mutations. All accesses logged at WARN level. Reverts automatically when policy store recovers. | 2026-06-28 |
| ADR-RB02-009 | **Role Templates (not inheritance)** | Roles start with zero permissions. Role templates provide sensible defaults but are **copied** (not inherited) at creation time. Prevents permission creep from template changes. | 2026-06-28 |
| ADR-RB02-010 | **Recommendation.dismiss kept** | `recommendation.dismiss` is NOT renamed to `reject`. Distinction: Pattern Suggestions are proposals (accept/reject), Recommendations are advice (accept/dismiss/archive). | 2026-06-28 |
| ADR-RB02-011 | **AI Review vs AI Configuration** | P16 renamed to "AI Review" (accept/reject/dismiss AI outputs — reviewer permission). P24 renamed to "AI Configuration" (manage prompts, thresholds, routing, providers, evaluation — admin-only permission). Clear separation of concerns. | 2026-06-28 |
| ADR-RB02-012 | **Two-Layer Role System** | Roles have two layers: Platform Role (used by Authorization Engine, e.g., `BUSINESS_MANAGER`) and Product Label (displayed in UI, e.g., "Local Content Manager"/"Engagement Manager"/"Sales Manager"). Permissions are assigned to Platform Roles, not labels. | 2026-06-28 |
| ADR-RB02-013 | **Authorization Decision Model** | Four outcomes instead of ALLOW/DENY binary: ALLOW, DENY, REQUIRE_APPROVAL, READ_ONLY. Enables workflow integration (e.g., Analyst closing a finding → REQUIRE_APPROVAL, not DENY). | 2026-06-28 |
| ADR-RB02-014 | **Authorization Invariants** | 10 invariant rules that must remain true for the system lifetime. Including: every action maps to exactly one permission, no derived resource exists without its primary resource, every decision emits AuthorizationEvaluated. | 2026-06-28 |
| ADR-RB02-015 | **Policy Evaluation Pipeline** | 6-stage pipeline: Identity Resolution → Authorization Resolution → Policy Evaluation → Workflow Constraints → Decision Composition → Decision Trace. Short-circuits on DENY. | 2026-06-28 |
| ADR-RB02-016 | **Decision Precedence** | Formal rank-based composition: DENY (1) > REQUIRE_APPROVAL (2) > READ_ONLY (3) > ALLOW (4). Extensible — new outcomes slot into the rank table without changing logic. | 2026-06-28 |
| ADR-RB02-017 | **Policy Metadata Standard** | Every policy declares: ID, Name, Evaluation Stage, Priority, Inputs, Decision Type, Owner, Conflicts With, Status. Policies declare required Inputs (Actor, Membership, Resource, Organization, Action, WorkflowState). | 2026-06-28 |
| ADR-RB02-018 | **Capability-Based SoD** | SoD rules defined against Capabilities (CAP_CREATE, CAP_REVIEW, CAP_CLOSE, etc.) instead of Role names. Roles may change across products; capabilities remain stable. | 2026-06-28 |
| ADR-RB02-019 | **Approval Authority Model** | Every approval gate has: Threshold, Required Capability, Approver Role, Approval Type (single/dual/parallel/sequential), Approval Count. | 2026-06-28 |
| ADR-RB02-020 | **Authorization Observability** | Chapter 11 renamed from "Audit Requirements" to "Authorization Observability". Covers: AuthorizationEvaluated, Decision Trace, Policy Evaluation, Approval Created, Operation Completed, Operation Failed. Full Decision Trace structure with winning decision, policy results, evaluation order. | 2026-06-28 |
| ADR-RB02-021 | **Implementation Prohibitions** | 8 explicit prohibitions for RB-02B: no inline authz, no role name comparisons, no permission strings, no authz outside engine, no service-layer decisions, no admin bypass, no product-specific engine, no silent ALLOW. | 2026-06-28 |
| ADR-RB02-022 | **Implementation Invariants** | 10 runtime invariants (I01–I10) that must hold during and after RB-02B: every action calls engine, every decision produces trace, every decision emits event, no role name in guards, etc. | 2026-06-28 |
| ADR-RB02-023 | **RB-02B Deliverables** | 12 mandatory deliverables: Authorization Engine, Policy Engine, Policy Registry, Permission Registry, Capability Registry, Guard Middleware, Decision Trace, Approval Dispatcher, Audit Integration, Test Suite, Regression Guards, Documentation. | 2026-06-28 |
| ADR-RB02-024 | **Evidence-Linked Gate Criteria** | All 10 gates (G1–G10) require explicit evidence (test report, log query, static analysis, build log) not just PASS/FAIL. | 2026-06-28 |
| ADR-RB02-025 | **RB-02B Handoff Package** | 15-item handoff package that RB-02B receives before starting: all catalogs, ADRs, policies, decision model, test strategy, acceptance criteria. RB-02B starts without needing project history. | 2026-06-28 |
| ADR-RB02-026 | **Architecture Freeze** | RB-02A becomes normative specification. RB-02B may not modify architecture. Architectural changes require ADR + RB-02A revision. | 2026-06-28 |
| ADR-RB02-027 | **Versioning Policy** | v1.x = compatible changes, v2.x = breaking model changes (ADR required), v3.x = fundamental architecture change (multiple ADRs + migration plan). RB-02A itself follows this policy. | 2026-06-28 |
| ADR-RB02-028 | **Definition of Done** | 14-item checklist for RB-02B completion: engine, policies, guards, trace, events, tests, gates, regression, ADR compliance, docs, build, prohibitions, invariants. | 2026-06-28 |

# Appendix D: Document Status & Next Steps

| Item | Status |
|------|:------:|
| RB-02A Design Document | ✅ **v0.5 Final** — All 12 chapters + 4 appendices complete. 28 ADR decisions. Architecture freeze ready. |
| Review 1 (Chapters 1–3) | ✅ **Accepted** — Applied in v0.2. |
| Review 2 (Chapters 4–7) | ✅ **Accepted** — Applied in v0.3. |
| Review 3 (Chapters 8–11) | ✅ **Accepted** — Applied in v0.4. |
| Review 4 (Chapter 12) | ✅ **Accepted** — Applied in v0.5. |
| Architecture Freeze | ⬜ **Pending** — Requires explicit Go/No-Go sign-off |
| RB-02B Implementation | 🔒 **Locked** — Cannot start until Go/No-Go is accepted |
| RB-02B Handoff Package | ✅ **Ready** — 15-item handoff package (§12.8) prepared |

---

> **End of RB-02A Authorization Model v0.5 (Final Draft)**
>
> *Next step: Go/No-Go Decision — Accept RB-02A as the normative specification for authorization in AQLIYA. Freeze architecture. Begin RB-02B implementation following §12.8 Handoff Package and §12 Execution Contract.*
