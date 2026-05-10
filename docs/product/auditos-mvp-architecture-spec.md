---
title: AuditOS MVP Architecture Specification
document_id: ARCH.001
status: Draft
owner: Engineering
version: 0.1
last_updated: 2026-05-08
supersedes: PRD.001 (as source of truth for engineering decisions)
---

# AuditOS MVP Architecture Specification

## 1. Architecture Purpose

This document defines the architecture for the AuditOS MVP. It translates the PRD (PRD.001) into engineering decisions, system boundaries, data flows, component responsibilities, and implementation sequence. It is the engineering handoff document for the MVP build phase.

**Relationship to doctrine:** Every architectural decision traces to at least one doctrine principle. Doctrine prevails if a requirement contradicts architecture.

**Golden rule encoded:** AI assists. Humans decide. Evidence governs.

---

## 2. Product Context

AuditOS is an official AQLIYA product line focused on financial intelligence and governed audit workflows. The MVP enables audit firms to:

1. Ingest client financial data and normalize it into structured evidence
2. Validate data quality and assess trust
3. Map client accounts to a canonical financial model
4. Upload and link evidence to accounts and findings
5. Review and verify evidence through governed state transitions
6. Detect signals (anomalies, evidence gaps) via AI assistance
7. Create findings with full evidence traces
8. Draft recommendations with AI assistance and human finalization
9. Route recommendations through governed review and approval workflows
10. Publish approved recommendations with immutable audit trails
11. Maintain bidirectional traceability from source data to published output

The MVP is NOT:
- An autonomous audit tool
- A generic BPM engine
- A dashboard-first product
- A chatbot or conversational interface
- An ERP replacement

---

## 3. Architecture Principles

| # | Principle | Source | Engineering Implication |
|---|-----------|--------|------------------------|
| P1 | Workflows are governed decision paths, not automation sequences | 16.04 §2 | Workflow engine is an evidence-aware state machine, not a DAG executor |
| P2 | Governance is structural, not procedural | 16.06 §2 | Rules are data objects evaluated synchronously at transition time; no post-hoc compliance |
| P3 | No anonymous actions | 08.01 §11 | Every state transition requires authenticated actor; system user is not a valid actor for governance steps |
| P4 | AI occupies recommendation nodes, never decision nodes | 16.07 §6.1 | AI suggestion is a distinct data type; human action is required to transition state |
| P5 | Evidence governs | 05.01 §11 | No finding without verified evidence; no recommendation without evidence chain |
| P6 | Every state transition is an immutable event | 02.02 §10 | Append-only event store; all transitions recorded with actor, timestamp, evidence references |
| P7 | Tenants are isolated at the data layer | 01.01 §10 | Every query scoped by tenant_id; cross-tenant access is structurally prevented |
| P8 | Domain boundaries are drawn around decision authority | 16.03 §2 | Bounded contexts own their data and governance rules; cross-domain interaction via events/queries |
| P9 | Override paths are equally accessible to accept paths | 10.02 §6.5 | UX must not optimize for passive acceptance; override friction equals acceptance friction |
| P10 | AI must not act autonomously on governed data | 16.07 §6.4 | AI has no write access to workflow state; AI output flows through human confirmation gates |

---

## 4. System Overview

### 4.1 Architecture Style

**Modular monolith with event-driven domain boundaries.** All components deploy as a single unit for MVP. Domain boundaries are enforced at the code level (package/module boundaries) and data level (schema ownership). Each domain exposes its capabilities through declared interfaces; cross-domain communication uses an in-process event bus.

**Rationale:**
- MVP team size is small (2-4 engineers); microservices introduce coordination overhead without benefit
- Modular monolith preserves future extraction to microservices when scale demands it
- Domain boundaries prevent the monolith from becoming a "big ball of mud"
- Event-driven within the monolith prevents tight coupling between domains

### 4.2 Deployment Model (MVP)

```
┌─────────────────────────────────────────────────────┐
│                   Web Browser                        │
└─────────────────────┬───────────────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────────────┐
│                Reverse Proxy / TLS                    │
│                   (nginx / Caddy)                     │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│              Next.js Application Server              │
│  ┌─────────────────────────────────────────────────┐ │
│  │              API Routes (Backend)                │ │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │ │
│  │  │ IAM  │ │ Eng  │ │ Fin  │ │ Evid │ │ AI   │  │ │
│  │  │ B.C. │ │ B.C. │ │ B.C. │ │ B.C. │ │ B.C. │  │ │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘  │ │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────────┐   │ │
│  │  │ Val  │ │ Find │ │ Rec  │ │ Pub / Audit  │   │ │
│  │  │ B.C. │ │ B.C. │ │ B.C. │ │ B.C.         │   │ │
│  │  └──────┘ └──────┘ └──────┘ └──────────────┘   │ │
│  └─────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────┐ │
│  │         In-Process Event Bus (EventEmitter)      │ │
│  └─────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────┐ │
│  │              Frontend (React/Next.js)            │ │
│  └─────────────────────────────────────────────────┘ │
└───────────┬──────────────────────────────────┬───────┘
            │                                  │
            ▼                                  ▼
    ┌──────────────┐                  ┌──────────────┐
    │  PostgreSQL  │                  │  S3-compat   │
    │  (primary)   │                  │  Object      │
    │              │                  │  Store       │
    │ - App data   │                  │  (evidence   │
    │ - Event      │                  │   files)     │
    │   store      │                  │              │
    └──────────────┘                  └──────────────┘
```

### 4.3 Technology Stack (MVP)

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | Next.js (Full-stack) | Unified API + frontend; rapid development |
| Language | TypeScript | Type safety, domain modeling |
| Database | PostgreSQL 16 | Relational core, JSONB for flexible schemas, event store via append-only tables |
| Object storage | S3-compatible (MinIO dev, AWS S3 prod) | Evidence file storage with content addressing |
| ORM | Drizzle or Prisma | Type-safe database access |
| Event bus | In-process (EventEmitter pattern) | Decoupled domains without infrastructure overhead |
| AI integration | OpenAI-compatible API / local LLM | Pluggable AI backend; no vendor lock-in |
| File parsing | CSV/XLSX parsers (papaparse, xlsx) | Trial balance and evidence ingestion |
| Auth | NextAuth.js / Custom JWT | Session management with RBAC |
| Deployment | Docker + single VM (MVP) | Simple ops; scale later |

---

## 5. Core Architecture Components

### 5.1 Component Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AUDITOS MVP                                  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                     Infrastructure Layer                         │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │ │
│  │  │ RBAC &   │  │ Audit    │  │ Event    │  │ Tenant       │   │ │
│  │  │ Identity │  │ Log /    │  │ Bus      │  │ Isolation    │   │ │
│  │  │ Service  │  │ Event    │  │ (in-proc)│  │ (data layer) │   │ │
│  │  └──────────┘  │ Store    │  └──────────┘  └──────────────┘   │ │
│  │                └──────────┘                                    │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                        Domain Layer                              │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │ │
│  │  │ Engagement   │  │ Financial    │  │ Evidence Store       │  │ │
│  │  │ Management   │  │ Data         │  │ (content-addressed,  │  │ │
│  │  │ (clients,    │  │ Ingestion    │  │ lifecycle-managed)   │  │ │
│  │  │ engagements) │  │ (TB, ledger) │  └──────────────────────┘  │ │
│  │  └──────────────┘  └──────────────┘                            │ │
│  │  ┌────────────────┐ ┌──────────┐ ┌────────────────────────┐   │ │
│  │  │ Canonical      │ │ Account  │ │ Validation Engine      │   │ │
│  │  │ Financial      │ │ Mapping  │ │ (structural, trust,    │   │ │
│  │  │ Model          │ │ Service  │ │ anomaly)               │   │ │
│  │  └────────────────┘ └──────────┘ └────────────────────────┘   │ │
│  │  ┌────────────────┐ ┌────────────────┐ ┌──────────────┐      │ │
│  │  │ Findings       │ │ Recommendation │ │ Review &     │      │ │
│  │  │ Service        │ │ Service        │ │ Approval     │      │ │
│  │  └────────────────┘ └────────────────┘ │ Engine       │      │ │
│  │  ┌────────────────┐ ┌──────────────┐   └──────────────┘      │ │
│  │  │ Publication    │ │ Traceability │                         │ │
│  │  │ Service        │ │ Graph        │                         │ │
│  │  └────────────────┘ └──────────────┘                         │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                      AI Assistance Layer                         │ │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │ │
│  │  │ AI Suggestion  │  │ Evidence       │  │ Queue          │    │ │
│  │  │ Service        │  │ Summarization  │  │ Ranking        │    │ │
│  │  │ (mapping,      │  │ Service        │  │ Service        │    │ │
│  │  │ signals,       │  │                │  │ (risk/material │    │ │
│  │  │ drafting)      │  │                │  │  based sort)   │    │ │
│  │  └────────────────┘  └────────────────┘  └────────────────┘    │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 Bounded Context Summary

| # | Bounded Context | Primary Responsibility | PRD Mapping |
|---|----------------|------------------------|-------------|
| BC1 | Identity & Access | Users, roles, permissions, authentication, tenant management | §7 Organization, User, Role; §8 Permissions |
| BC2 | Engagement Management | Clients, engagements, workflow templates, team assignment | §6.1, §6.2 |
| BC3 | Financial Data Ingestion | Trial balance, ledger, journal import and parsing | §6.3 |
| BC4 | Canonical Financial Model | Standard chart of accounts, financial structure definitions | §7 CanonicalAccount |
| BC5 | Account Mapping | Map client COA to canonical model | §6.4 |
| BC6 | Validation Engine | Structural validation, trust assessment, anomaly detection | §6.5 |
| BC7 | Evidence Management | Evidence upload, storage, linking, lifecycle | §6.6, §6.7 |
| BC8 | Findings | Signal detection, finding lifecycle | §6.8, §6.9 |
| BC9 | Recommendations | Recommendation drafting, AI integration | §6.10 |
| BC10 | Review & Approval | Review queues, approval governance, state transitions | §6.11 |
| BC11 | Publication | Immutable publishing, client view | §6.12 |
| BC12 | Audit & Traceability | Event store, traceability graph, audit trail | §6.13 |
| BC13 | AI Assistance | Model integration, suggestion generation, governance wrapper | §10 |

---

## 6. Component Responsibilities

### 6.1 Engagement Management
**Owner:** BC2
**Dependencies:** BC1 (Identity & Access)

- Create and configure organizations (tenants)
- Manage client records with industry, reporting framework, fiscal period
- Create audit engagements with type selection (full audit, review, agreed-upon procedures)
- Assign team members to engagements with role scoping
- Initialize workflow templates with standard phases
- Inherit and tighten governance rules from org to engagement
- Track engagement-level state machine (§9)

### 6.2 Financial Data Ingestion
**Owner:** BC3
**Dependencies:** BC2 (Engagement)

- Parse CSV/XLSX trial balance files
- Extract accounts, balances, periods, entity identifiers
- Validate file structure (required columns, recognizable formats)
- Normalize data into internal Account representation
- Store parsed trial balance with trust state
- P1: Parse general ledger and journal entries

### 6.3 Canonical Financial Model
**Owner:** BC4
**Dependencies:** None (foundational reference data)

- Define standard chart of accounts structure
- Provide account categories (assets, liabilities, equity, revenue, expense)
- Define financial statement line items with classification rules
- Support multiple reporting frameworks (IFRS, GAAP) via versioned model definitions
- Expose query interface for mapping service

### 6.4 Account Mapping Service
**Owner:** BC5
**Dependencies:** BC3 (Trial Balance), BC4 (Canonical Model), BC13 (AI Assistance)

- Suggest account mappings using AI (text similarity, code pattern matching, historical mappings)
- Present mapping candidates for operator confirmation
- Accept/correct/manual mapping by operator
- Validate mapping completeness (all accounts mapped)
- Flag unmapped/ambiguous accounts as blocking
- Record AI suggestion metadata for governance

### 6.5 Validation Engine
**Owner:** BC6
**Dependencies:** BC3 (Trial Balance), BC5 (Account Mapping)

- Validate trial balance equality (total debits = total credits)
- Validate account relationships (A = L + E for mapped accounts)
- Validate period consistency across accounts
- Classify account types and flag classification mismatches
- Assess data trust: trusted, conditionally trusted, blocked
- Generate anomaly flags for reviewer disposition

### 6.6 Evidence Management
**Owner:** BC7
**Dependencies:** BC2 (Engagement), BC6 (Validation)

- Upload files to S3-compatible storage
- Compute and record file hash (SHA-256) for integrity verification
- Record provenance metadata: filename, upload timestamp, uploader identity, file type
- Manage evidence state lifecycle: candidate → verified → accepted → referenced
- Create typed evidence links to accounts and findings (supports, contradicts, context)
- Expose evidence retrieval with access control

### 6.7 Findings Service
**Owner:** BC8
**Dependencies:** BC5 (Account Mapping), BC6 (Validation), BC7 (Evidence), BC13 (AI Assistance)

- Manage finding lifecycle: draft → review_ready → in_review → approved → published → escalated → withdrawn
- Create findings from AI-generated signals
- Pre-fill finding drafts from signal context, evidence links, account references
- Assign finding type: material_misstatement, control_deficiency, disclosure_gap, observation
- Set materiality level and risk rating
- Enforce evidence requirement: every finding requires ≥1 verified evidence reference

### 6.8 Recommendation Service
**Owner:** BC9
**Dependencies:** BC8 (Findings), BC7 (Evidence), BC13 (AI Assistance)

- Manage recommendation lifecycle: draft → pending_approval → approved → rejected → published
- AI-suggested recommendation language with evidence trace
- Record AI contribution metadata (ai_contributed flag, model version, confidence)
- Link recommendations to source findings and evidence chain
- Track recommended action, impact assessment, deadline, responsible party

### 6.9 Review & Approval Engine
**Owner:** BC10
**Dependencies:** BC8 (Findings), BC9 (Recommendations), BC1 (Identity & Access)

- Present review queues sorted by risk, materiality, deadline
- Support evidence review with inline document viewing
- Record review verdicts: accept, modify, reject (with rationale)
- Enforce approval authority tier matching recommendation risk rating
- Log all approval actions with approver identity, action, rationale, timestamp
- Prevent approval bypass structurally (no auto-approve, no silent acceptance)

### 6.10 Publication Service
**Owner:** BC11
**Dependencies:** BC9 (Recommendations), BC10 (Review & Approval), BC7 (Evidence)

- Generate immutable published recommendation record from approved recommendation
- Materialize full evidence trace alongside published output
- Generate client-facing view with access control
- Record client responses as engagement correspondence
- Enforce publication irreversibility (published state is immutable)

### 6.11 Audit Log / Event Store
**Owner:** BC12
**Dependencies:** All domains (event consumers are all domains)

- Capture every state transition as an append-only event
- Event schema: event_type, actor_id, target_type, target_id, previous_state, new_state, evidence_references, timestamp, context metadata
- Store events in append-only table structure
- Expose event query interface for audit trail reconstruction
- Support time-based event replay

### 6.12 Traceability Graph
**Owner:** BC12
**Dependencies:** BC12 (Event Store), all domains

- Maintain bidirectional links between: source data → account → evidence → signal → finding → recommendation → approval → publication
- Support forward traversal (source to output) and backward traversal (output to source)
- Expose query interface for traceability visualization
- Rebuild from event store if graph becomes inconsistent

### 6.13 RBAC / Identity Service
**Owner:** BC1
**Dependencies:** None

- User authentication (email/password, SSO-ready)
- Session management with JWT
- Role definitions with permission sets
- Authorization middleware for every API route
- Tenant scoping for all queries
- User management (CRUD, role assignment)

### 6.14 AI Assistance Layer
**Owner:** BC13
**Dependencies:** All domains (provides suggestions to BC5, BC8, BC9, etc.)

- Abstract AI model integration behind a service interface
- Generate account mapping suggestions
- Detect anomalies and produce signals with evidence traces
- Draft finding language from signal context
- Draft recommendation language from findings and evidence
- Summarize evidence with provenance citations
- Rank reviewer queues by risk/materiality
- Record every AI suggestion with: content, model_version, input_hash, confidence, acceptance_status
- Present inline evidence citations with every suggestion

---

## 7. Domain Model

### 7.1 Entity Relationship (Core Objects)

```
Organization 1─N Client 1─N Engagement
Engagement 1─N TrialBalance
Engagement 1─N Evidence
Engagement 1─N Finding
Engagement 1─N AuditEvent
Engagement 1─1 WorkflowState

TrialBalance 1─N Account
Account 1─1 AccountMapping
Account N─M Evidence (via EvidenceLink)
Account 1─N Signal
Account 1─N ValidationResult

Evidence N─M Finding (via EvidenceLink)
Finding 1─N Recommendation
Recommendation 1─N Approval
Recommendation 1─1 PublishedRecommendation

Signal N─1 Finding (optional)
Evidence N─1 ReviewRecord (polymorphic)
Finding N─1 ReviewRecord (polymorphic)
Recommendation N─1 ReviewRecord (polymorphic)

Signal 1─1 AiSuggestion (polymorphic)
AccountMapping 1─1 AiSuggestion (polymorphic)
Finding 1─1 AiSuggestion (polymorphic)
Recommendation 1─1 AiSuggestion (polymorphic)
```

### 7.2 Schema Design Principles

| Principle | Applied As |
|-----------|------------|
| Tenant isolation | `organization_id` on every tenant-scoped table; queries always filtered by this column |
| Immutable events | Event store tables are INSERT-only; no UPDATE or DELETE |
| Object versioning | Key objects (Evidence, Finding, Recommendation) use version numbers for concurrency |
| Soft delete | No physical delete on governed objects; `status=deleted` with timestamp and actor |
| JSONB for flexibility | AI suggestion payloads, validation results, governance rules use JSONB |
| UUID primary keys | All primary keys are UUIDv4; no auto-increment IDs exposed externally |
| Audit timestamps | `created_at`, `updated_at` on every mutable table; `deleted_at` for soft-delete |

### 7.3 Core Table Definitions (MVP)

See the **AuditOS Data Model Specification** for complete schemas. The following are the essential tables defined here for architecture context:

| Table | Domain | Key Columns | Notes |
|-------|--------|-------------|-------|
| `organizations` | BC2 | id, name, jurisdiction, regulatory_framework, governance_rules (JSONB), status | Tenant root |
| `users` | BC1 | id, organization_id, email, name, role, permissions (JSONB), status | Authenticated actor |
| `clients` | BC2 | id, organization_id, name, industry, reporting_framework, fiscal_period_end | Tenant-scoped |
| `engagements` | BC2 | id, organization_id, client_id, fiscal_period, engagement_type, status, workflow_state, team (JSONB), governance_rules (JSONB) | Core workflow unit |
| `trial_balances` | BC3 | id, engagement_id, import_timestamp, source_file, file_hash, trust_state, parsed_data (JSONB) | Single import record |
| `accounts` | BC3 | id, trial_balance_id, code, name, debit_balance, credit_balance, account_type, currency | Individual account |
| `canonical_accounts` | BC4 | id, code, name, category, statement_type, reporting_framework, version | Reference data |
| `account_mappings` | BC5 | id, account_id, canonical_account_id, mapping_type, mapped_by, mapped_at, ai_suggested (JSONB) | Junction + metadata |
| `validation_results` | BC6 | id, engagement_id, validation_type, status, results (JSONB), validated_by, validated_at | Per-run result |
| `anomaly_flags` | BC6 | id, engagement_id, account_id, flag_type, description, severity, disposition, disposed_by, disposed_at | Reviewer actions |
| `evidence` | BC7 | id, engagement_id, filename, file_hash, file_type, storage_key, filesize, upload_timestamp, uploader_id, evidence_state, verified_by, verified_at, version | Content-addressed |
| `evidence_links` | BC7 | id, evidence_id, target_type, target_id, link_type, context, created_by, created_at | Polymorphic link |
| `signals` | BC8 | id, engagement_id, account_id, signal_type, description, confidence, ai_suggestion_id, status | AI-generated candidate |
| `findings` | BC8 | id, engagement_id, finding_type, description, materiality_level, risk_rating, state, evidence_refs (UUID[]), signal_id, created_by, created_at, version | Core deliverable |
| `recommendations` | BC9 | id, finding_id, description, recommended_action, impact_assessment, deadline, responsible_party, ai_contributed, state, created_by, created_at, version | Output unit |
| `approvals` | BC10 | id, recommendation_id, approver_id, action, rationale, timestamp, evidence_refs (UUID[]) | Governance event |
| `review_records` | BC10 | id, target_type, target_id, reviewer_id, verdict, rationale, timestamp, evidence_refs (UUID[]) | Polymorphic review |
| `published_recommendations` | BC11 | id, recommendation_id, published_at, published_by, access_url, client_visible, status | Immutable output |
| `audit_events` | BC12 | id, event_type, actor_id, tenant_id, target_type, target_id, previous_state, new_state, evidence_refs (UUID[]), metadata (JSONB), timestamp, sequence | Append-only |
| `ai_suggestions` | BC13 | id, suggestion_type, target_type, target_id, content (JSONB), model_version, input_hash, confidence, accepted_by, accepted_at, rejected_by, rejected_at | All AI outputs |

---

## 8. Workflow Engine Architecture

### 8.1 Design Philosophy

The workflow engine is NOT a generic BPM engine (Camunda, Temporal, etc.). It is a **purpose-built, evidence-aware state machine** with:

- **Evidence gates**: Workflow steps blocked until evidence conditions are met
- **Governance evaluators**: Rules evaluated synchronously at transition time
- **Human decision joints**: States that cannot auto-transition; require human action
- **State snapshots**: Full context preserved at each transition (not just current state)
- **Append-only history**: Every transition creates an immutable event

### 8.2 State Machine Model

Each domain entity with a lifecycle (Engagement, Evidence, Finding, Recommendation, Approval, Publication) has its own state machine definition. The engine composes these into engagement-level workflow orchestration.

**State machine definition structure:**
```typescript
interface StateMachineDefinition {
  entityType: string;
  states: State[];
  transitions: Transition[];
  guards: GuardClause[];
  hooks: TransitionHook[];
}

interface State {
  name: string;
  type: 'initial' | 'intermediate' | 'terminal' | 'error';
  allowedActors: string[]; // role names
  requiredEvidenceState: string | null;
  governanceRules: GovernanceRule[];
}

interface Transition {
  from: string;
  to: string;
  trigger: TriggerType; // 'human_action' | 'system_event' | 'ai_suggestion'
  condition: GuardCondition;
}

interface GuardCondition {
  type: 'role_check' | 'evidence_check' | 'governance_eval' | 'composite';
  params: Record<string, unknown>;
}
```

### 8.3 Engagement-Level Workflow

```
Engagement State Machine:
    ┌──────────────┐
    │  Initialized │
    └──────┬───────┘
           │ Team assigned, governance configured
           ▼
    ┌──────────────┐
    │  DataIntake  │ ← TB validation gates: balanced, complete, trust assessed
    └──────┬───────┘
           │ All accounts mapped, basic validation passed
           ▼
    ┌────────────────────┐
    │ EvidenceCollection  │ ← Evidence upload, verification, linking
    └──────┬─────────────┘
           │ Evidence verified for material accounts
           ▼
    ┌──────────────┐
    │    Review     │ ← Signal generation, signal triage
    └──────┬───────┘
           │ Findings created, evidence cited
           ▼
    ┌──────────────────┐
    │ FindingsDrafting  │ ← Finding state: draft → review_ready
    └──────┬───────────┘
           │ Review-ready findings exist
           ▼
    ┌──────────────┐
    │   Approval    │ ← Approve recommendations → accept/modify/reject
    └──────┬───────┘
           │ Recommendation approved
           ▼
    ┌──────────────┐
    │ Publication   │ ← Immutable output generated, client access granted
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │  Completed    │ ← Engagement closed
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │   Archived    │ ← Data retained, read-only
    └──────────────┘
```

### 8.4 Transition Rules

| Transition | Trigger | Guard Conditions | AI Role |
|------------|---------|-----------------|---------|
| Initialized → DataIntake | Human (Operator uploads TB) | Team assigned, governance configured | None |
| DataIntake → EvidenceCollection | System (all accounts mapped) | TB balanced, all accounts mapped, trust_state != blocked | None (operator confirmed mapping) |
| EvidenceCollection → Review | Human (Reviewer completes evidence review) | All material accounts have verified evidence | Signal generation (assist) |
| Review → FindingsDrafting | Human (Reviewer creates finding) | ≥1 review-ready finding exists | Finding language draft (assist) |
| FindingsDrafting → Approval | Human (Reviewer submits for approval) | Findings review_ready, recommendations pending_approval | Recommendation draft (assist) |
| Approval → Publication | Human (Approver approves) | Recommendation approved, all approvals collected | None |
| Publication → Completed | System | Publication confirmed | None |
| Any → Escalated | Human (override) | Authorization check, rationale captured | None |

### 8.5 Guard Evaluation Order

For every requested state transition, guards are evaluated sequentially:

1. **Actor authorization**: Does the requesting user have role permission for this action?
2. **Tenant scope**: Does the user belong to the same organization as the target entity?
3. **Evidence check**: Does the current entity satisfy evidence requirements for the target state?
4. **Governance rules**: Do engagement/organization governance rules permit this transition?
5. **Dependency check**: Are all prerequisite entities in the required state?
6. **AI check**: If AI action triggered transition, is it in a permitted zone? (Block if prohibited)

If ANY guard fails, the transition is rejected with a structured error indicating which guard failed and why.

---

## 9. Evidence Store Architecture

### 9.1 Storage Model

| Aspect | Decision |
|--------|----------|
| File storage | S3-compatible object store (MinIO for dev, AWS S3 for prod) |
| Storage key pattern | `{organization_id}/{engagement_id}/{uuid}` |
| File addressing | Content-addressable via SHA-256 hash; duplicate detection by hash |
| File metadata | Stored in PostgreSQL `evidence` table |
| Access control | Presigned URLs with expiry for direct S3 access; API-mediated for governed access |
| Encryption | Server-side encryption at rest; TLS in transit |

### 9.2 Evidence State Machine

```
    ┌───────────┐
    │ Candidate │  ← Uploaded, not yet reviewed
    └─────┬─────┘
          │ Reviewer assesses sufficiency
     ┌────┴────┐
     ▼         ▼
 ┌────────┐ ┌──────────┐
 │Verified│ │Insufficient│ ← Reviewer verdict: more evidence needed
 └───┬────┘ └──────────┘
     │ Evidence selected      ┌──────────┐
     ▼ for finding      ──▶ │ Insufficient │ → re-upload triggers new candidate
 ┌──────────┐                └──────────┘
 │ Accepted │  ← Referenced in a finding
 └────┬─────┘
      │ Cited in published
      ▼
 ┌───────────┐
 │ Referenced│  ← Immutable
 └───────────┘
```

Rejected evidence follows a separate path:
```
Candidate → Rejected  (with rationale, remains in record)
```

### 9.3 Evidence Integrity

- Every upload produces a SHA-256 hash verified server-side
- File integrity can be verified on retrieval (hash comparison)
- Evidence metadata is immutable after `verified` state (file_hash, filename, uploader never change)
- Deletion is soft-delete only; evidence objects persist in `deleted` state

---

## 10. Financial Data Ingestion Architecture

### 10.1 Processing Pipeline

```
Upload (CSV/XLSX)
    │
    ▼
┌────────────────┐
│ Format Parsing  │  ← papaparse (CSV), xlsx (Excel)
│ (header detect, │
│ column mapping) │
└───────┬────────┘
        │ Parse success?
   ┌────┴────┐
   ▼         ▼
 Valid    Parse Error
    │       (rejected)
    ▼
┌────────────────┐
│ Account         │  ← Extract accounts, normalize codes
│ Extraction      │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ Balance         │  ← Sum debits vs credits; must balance
│ Validation      │
└───────┬────────┘
        │ Balanced?
   ┌────┴────┐
   ▼         ▼
 Valid   Unbalanced
    │    (conditional
    │     acceptance?
    ▼     per config)
┌────────────────┐
│ Trust           │  ← Completeness, format consistency, range checks
│ Assessment      │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ Parsed TB       │  ← Stored: trust_state = trusted | conditional | blocked
│ Record Created  │
└────────────────┘
```

### 10.2 Trust Assessment Rules

| Factor | Check | Weight | Blocking? |
|--------|-------|--------|-----------|
| Structure completeness | Required columns present | Critical | Yes |
| Balance equality | Total debits = total credits | Critical | Configurable |
| Account type identification | DB/CR classification recognizable | High | Yes |
| Range reasonableness | Balances within expected ranges | Medium | No |
| Format consistency | Date formats, decimal separators consistent | Medium | No |
| Duplicate detection | Duplicate account codes detected | High | Yes (flag) |

### 10.3 Supported Formats (MVP)

| Format | Capability | Priority |
|--------|-----------|----------|
| CSV | Full import with column mapping UI | P0 |
| XLSX | Full import with sheet selection, column mapping | P0 |
| XLS | Read-only import (basic structure) | P1 |
| PDF (structured) | Extract tables if tabular | P2 |

---

## 11. Canonical Financial Model

### 11.1 Structure

The canonical financial model is a **versioned reference data set** defining:
- Standard chart of accounts (hierarchical)
- Financial statement line items
- Classification rules for mapping

### 11.2 Account Hierarchy (MVP)

```
Level 1 (Statement)   Level 2 (Category)       Level 3 (Account Class)
─────────────────────────────────────────────────────────────────────
Assets                 Current Assets           Cash & Cash Equivalents
                                               Trade Receivables
                                               Inventories
                                               Prepaid Expenses
                       Non-Current Assets      Property, Plant & Equipment
                                               Intangible Assets
                                               Investments
                                               Deferred Tax Assets

Liabilities            Current Liabilities     Trade Payables
                                               Accrued Expenses
                                               Short-term Borrowings
                                               Current Tax Payable
                       Non-Current Liabilities Long-term Borrowings
                                               Deferred Tax Liabilities
                                               Provisions

Equity                 Equity                  Share Capital
                                               Retained Earnings
                                               Reserves

Revenue                Revenue                 Sales Revenue
                                               Other Income

Expenses               Operating Expenses      Cost of Sales
                                               Administrative Expenses
                                               Selling & Distribution
                                               Depreciation & Amortization
                       Finance Costs           Interest Expense
                       Tax                     Income Tax Expense
```

### 11.3 Versioning

| Aspect | Decision |
|--------|----------|
| Model versions | Semantic versioning (1.0.0, 2.0.0) |
| Framework variants | IFRS, US-GAAP, UK-GAAP, local GAAP |
| Framework version | e.g., IFRS 2024, IFRS 2025 |
| Organization assignment | Org selects default framework + version |
| Engagement override | Engagement may specify different framework |

---

## 12. Account Mapping Service

### 12.1 Mapping Flow

```
Client Account Code: "1200-AR"
Client Account Name: "Accounts Receivable - Trade"
    │
    ▼
┌────────────────────────┐
│ AI Mapping Suggestions │  ← Similarity against canonical model
│ (top 3-5 candidates)    │    + historical mappings + name matching
└───────┬────────────────┘    + code pattern matching
        │
        ▼
┌────────────────────────┐
│ Operator Review         │
│ ┌────────────────────┐ │
│ │ Accept suggestion   │ │
│ │ Manual override     │ │
│ │ Skip (resolve later)│ │ ← Blocking: must be resolved
│ └────────────────────┘ │
└───────┬────────────────┘
        │
        ▼
┌────────────────────────┐
│ Mapping Record Created  │
│ AccountMapping {        │
│   account_id,           │
│   canonical_account_id, │
│   mapping_type:         │
│     ai_suggested |      │
│     human_mapped,       │
│   ai_suggestion_id      │
│ }                       │
└────────────────────────┘
```

### 12.2 Matching Algorithm (MVP)

| Strategy | Input | Output |
|----------|-------|--------|
| Exact name match | Account name → canonical account name | Direct mapping if exact |
| Substring/contains | Account name substring → canonical names | Ranked candidates |
| Code pattern match | Account code prefix → canonical category | e.g., 1xxx → Assets |
| Historical mapping | Account name/code → prior engagements | Confidence-weighted |
| AI similarity | Account name + code + context → semantic match | Embedding-based ranking |

### 12.3 Completeness Enforcement

- Engagement advances to EvidenceCollection only when `unmapped_accounts_count = 0`
- Partial mapping is stored but blocks workflow progression
- Ambiguous mappings (one-to-many suggestions) require operator resolution
- Mapping changes after progression require governance override (logged)

---

## 13. Validation Engine

### 13.1 Validation Types

| Validation | Scope | When | Blocking? |
|------------|-------|------|-----------|
| Structural validity | Trial balance | On import | Yes |
| Balance equality | Trial balance | On import | Configurable |
| Account type classification | Mapped accounts | On mapping complete | Yes |
| Period consistency | All accounts | On mapping complete | Yes |
| A = L + E relationship | Mapped accounts | On mapping complete | No (flag) |
| Period-over-period change | Current vs previous | On mapping complete | No (signal) |
| Ratio analysis | Key financial ratios | On mapping complete | No (signal) |
| Evidence sufficiency | Accounts vs evidence | During review | Yes (for material accounts) |

### 13.2 Validation Result Model

```typescript
interface ValidationResult {
  id: UUID;
  engagement_id: UUID;
  validation_type: string;
  status: 'passed' | 'failed' | 'warning';
  summary: string;
  details: ValidationDetail[];
  validated_at: timestamp;
  validated_by: UUID; // system user for automated, human for manual
}

interface ValidationDetail {
  account_id?: UUID;
  check: string;       // e.g., "balance_equality", "classification"
  status: 'pass' | 'fail' | 'warning';
  expected: unknown;
  actual: unknown;
  severity: 'info' | 'warning' | 'error';
  message: string;
}
```

### 13.3 Trust State Computation

```typescript
type TrustState = 'trusted' | 'conditionally_trusted' | 'blocked';

// TrustState = f(trial balance structural checks, mapping completeness, historical pattern)
// 'trusted': All critical checks pass, no unresolved warnings
// 'conditionally_trusted': Non-critical warnings exist, accepted by operator
// 'blocked': Critical check fails (unbalanced, unmapped critical accounts)
```

---

## 14. Findings Service

### 14.1 Finding State Machine

```
                    ┌───────────┐
                    │   Draft   │ ← Created by reviewer or AI-assisted
                    └─────┬─────┘
                          │ Reviewer completes and submits
                          ▼
                    ┌──────────────┐
               ┌───▶│ ReviewReady  │ ← Entered into approval queue
               │    └──────┬───────┘
               │           │
               │      ┌────┴────┐
               │      ▼         ▼
               │ ┌────────┐ ┌──────────┐
               │ │InReview│ │Escalated │ ← Sent to higher authority
               │ └───┬────┘ └──────────┘
               │     │                  │
               │     ▼                  ▼
               │ ┌──────────┐  ┌──────────┐
               │ │ Approved │  │Escalated │ ← if escalation fails resolution
               │ └────┬─────┘  └──────────┘
               │      │
               │      ▼
               │ ┌───────────┐
               │ │ Published │ ← Incorporated into published output
               │ └───────────┘
               │
               │ ┌────────────┐
               └─│ Withdrawn  │ ← Author or reviewer retracts
                 └────────────┘
```

### 14.2 Finding Creation Rules

| Rule | Enforcement |
|------|------------|
| Every finding requires ≥1 verified evidence link | Guard on `Draft → ReviewReady` transition |
| AI-generated findings start as Draft | AI cannot bypass Draft state |
| Findings may originate from signals | Signal → Finding preserves trace link |
| Findings may be created directly | Without signal, manual creation allowed |
| Finding type required | material_misstatement, control_deficiency, disclosure_gap, observation |
| Risk rating required | Scale: low, medium, high, critical |
| Materiality level required | Scale: immaterial, material, pervasive |

---

## 15. Recommendation Service

### 15.1 Recommendation State Machine

```
    ┌──────────┐
    │   Draft   │ ← Created (AI-assisted or manual)
    └─────┬────┘
          │ Submitted for approval
          ▼
    ┌──────────────────┐
    │ PendingApproval   │ ← Waiting for approver action
    └────────┬─────────┘
             │
        ┌────┴────┐
        ▼         ▼
   ┌────────┐ ┌──────────┐
   │Approved│ │ Rejected │ ← With rationale
   └───┬────┘ └──────────┘
       │                  ↑
       │                  │ (can re-draft and re-submit)
       ▼                  │
   ┌───────────┐          │
   │ Published │          │
   └───────────┘          │
                          │
   ┌──────────┐           │
   │ Rejected │ ──────────┘
   └──────────┘
```

### 15.2 AI Assistance Contract

```typescript
interface AiRecommendationSuggestion {
  recommendation: {
    description: string;           // AI-drafted text
    recommended_action: string;    // AI-suggested action
    impact_assessment: string;     // AI-generated impact analysis
    deadline_proposal?: string;    // Suggested deadline
    responsible_party?: string;    // Suggested responsible entity
  };
  evidence_trace: {
    evidence_id: UUID;
    citation: string;              // Specific quote/summary from evidence
    account_ref: string;           // Account code for context
  }[];
  metadata: {
    model_version: string;
    confidence: number;            // 0.0 - 1.0
    input_hash: string;            // Hash of input context
    methodology: string;           // Brief description of how suggestion was generated
    limitations: string[];         // Known limitations of this suggestion
  };
}
```

### 15.3 Governance Recording

Every recommendation records:
- `ai_contributed`: boolean — was AI involved in drafting?
- `ai_suggestion_id`: UUID — link to the AI suggestion record (if applicable)
- `model_version`: string — which model version contributed (if AI-assisted)
- `human_edited`: boolean — did the reviewer modify the AI suggestion?
- `human_finalized`: boolean — was the final content authored entirely by human?

---

## 16. Review and Approval Engine

### 16.1 Review Queue Architecture

```
┌─────────────────────────────────────────┐
│          Review Queue Service            │
│                                         │
│  Input: All reviewable items for an      │
│  engagement that are in the reviewer's   │
│  authority scope                         │
│                                         │
│  Sort by (configurable priority):        │
│    1. Risk rating (critical first)       │
│    2. Materiality (pervasive first)      │
│    3. Deadline (soonest first)           │
│    4. Age in queue (oldest first)        │
│                                         │
│  Filter by:                              │
│    - Item type (evidence, finding, rec)  │
│    - Status                              │
│    - Account                             │
│    - Creator                             │
│                                         │
└─────────────────────────────────────────┘
```

### 16.2 Approval Authority Model

| Risk Tier | Required Approver |
|-----------|-------------------|
| Low | Manager or Partner |
| Medium | Manager or Partner |
| High | Partner |
| Critical | Partner (mandatory, no delegation) |

### 16.3 Approval Action Types

| Action | Description | State Transition |
|--------|-------------|------------------|
| Accept | Approve as-is without changes | PendingApproval → Approved |
| Modify | Edit recommendation content then approve | PendingApproval → Approved (with modification record) |
| Reject | Reject with mandatory rationale | PendingApproval → Rejected |

### 16.4 Governance Guarantees

| Guarantee | Implementation |
|-----------|---------------|
| No auto-approve | No scheduled or condition-based approval mechanism exists |
| No silent bypass | Every pending item requires explicit human action |
| Rejection requires rationale | Guard clause on Reject: rationale.length > 20 chars |
| Authority verification | Guard checks approver role against engagement governance rules |
| Approval is attributable | Approval record captures approver_id, action, timestamp, commit hash of approved content version |
| Override is not suppression | Override path (modify/reject) is equally prominent in UX to accept path |

---

## 17. Publication Service

### 17.1 Publication Flow

```
Approved Recommendation
    │
    ▼
┌────────────────────────┐
│ 1. Freeze version       │  ← Snapshot the recommendation, finding, evidence chain
└─────────┬──────────────┘
          │
          ▼
┌────────────────────────┐
│ 2. Generate immutable   │  ← PublishedRecommendation record
│    published object     │
└─────────┬──────────────┘
          │
          ▼
┌────────────────────────┐
│ 3. Materialize evidence │  ← Compile evidence trace for client view
│    trace for client     │
└─────────┬──────────────┘
          │
          ▼
┌────────────────────────┐
│ 4. Generate client-     │  ← Access-controlled URL
│    facing view          │
└─────────┬──────────────┘
          │
          ▼
┌────────────────────────┐
│ 5. Send notification    │  ← Email/webhook to client contact
│    to client contact    │
└────────────────────────┘
```

### 17.2 Immutability Contract

| Aspect | Rule |
|--------|------|
| Content | Published recommendations are immutable text+evidence snapshots |
| Status | Status may transition (Published → Superseded) but content is never edited |
| Supersession | New recommendation creates a superseding published record with a link to the previous |
| Deletion | Published recommendations are never deleted; only status-hidden |
| Evidence references | Evidence references at publish time are frozen — subsequent evidence changes do not retroactively update published output |

---

## 18. Traceability Graph

### 18.1 Graph Structure

```typescript
interface TraceabilityNode {
  id: UUID;
  node_type: 'source_data' | 'account' | 'evidence' | 'signal'
              | 'finding' | 'recommendation' | 'approval' | 'publication';
  entity_id: UUID;
  entity_type: string;       // e.g., 'trial_balance', 'evidence', 'finding'
  metadata: Record<string, unknown>;
  created_at: timestamp;
}

interface TraceabilityEdge {
  id: UUID;
  source_node_id: UUID;
  target_node_id: UUID;
  relationship_type: 'maps_to' | 'supports' | 'contradicts' | 'context'
                     | 'originates_from' | 'produces' | 'approves'
                     | 'publishes' | 'references';
  metadata: Record<string, unknown>;
  created_at: timestamp;
}
```

### 18.2 Traversal Operations

| Operation | Direction | Example Use |
|-----------|-----------|-------------|
| Forward trace | Source → Output | "Show me how account X led to published recommendation Y" |
| Backward trace | Output → Source | "Show me all evidence behind published recommendation Z" |
| Impact analysis | Input → All outputs | "Which recommendations would be affected if evidence E is invalidated?" |
| Gap analysis | Account → Evidence | "Which accounts lack sufficient verified evidence?" |

### 18.3 MVP Implementation

For MVP, the traceability graph is **materialized as database relations and join queries** (not a graph database). The graph is computed from:
- Foreign key relationships between domain tables
- The `evidence_links` table (typed, bidirectional)
- The `audit_events` table (ordered state transitions)

A graph database (Neo4j, Dgraph) is post-MVP if query performance degrades.

---

## 19. AI Assistance Layer

### 19.1 Architecture

```
┌────────────────────────────────────┐
│        AI Assistance Layer          │
│                                    │
│  ┌──────────────────────────────┐  │
│  │   AI Service Interface       │  │
│  │                              │  │
│  │   - suggestMappings()        │  │
│  │   - generateSignals()        │  │
│  │   - draftFindingLanguage()   │  │
│  │   - draftRecommendation()    │  │
│  │   - summarizeEvidence()      │  │
│  │   - rankReviewQueue()        │  │
│  └──────────┬───────────────────┘  │
│             │                       │
│  ┌──────────▼───────────────────┐  │
│  │   AI Model Provider Abstraction│ │
│  │                              │  │
│  │   - OpenAI-compatible API    │  │
│  │   - Local LLM (Ollama)       │  │
│  │   - Pluggable adapter        │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │   Governance Wrapper          │  │
│  │                              │  │
│  │   - Log every suggestion     │  │
│  │   - Strip prohibited outputs │  │
│  │   - Attach evidence trace    │  │
│  │   - Record model version     │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │   ai_suggestions Table       │  │
│  │   (all AI outputs recorded)  │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

### 19.2 Governance Wrapper Rules

Every AI suggestion passes through the governance wrapper which enforces:

| Rule | Enforcement | Violation Action |
|------|------------|------------------|
| No decision content | Regex/LLM guardrail strip approval language | Reject suggestion, log violation, surface error |
| Evidence trace required | Validate evidence_refs non-empty for signal/draft suggestions | Reject suggestion, request evidence |
| Model version recorded | Attach model_version from environment/config | Hard requirement — reject if missing |
| Confidence threshold | Minimum confidence for surfacing configurable per operation | Filter out low-confidence suggestions |
| Input context captured | Hash of input data stored for reproducibility | Required field |
| Human in the loop | Suggestion is never auto-applied; always presented as candidate | Structural — AI has no write access to workflow state |

### 19.3 AI Zone Enforcement

The three-zone model is enforced at the architecture level:

| Zone | AI Actions | Human Actions | Engine Enforcement |
|------|-----------|---------------|-------------------|
| **Governed Automation** | Data normalization, format standardization, deduplication | Configure parameters, review exceptions | AI may auto-apply within bounded rules; exceptions routed to human |
| **Assisted Decision** | Suggest mappings, signals, findings, recommendations | Accept/modify/reject every suggestion | AI output is a suggestion record; state transition requires human action |
| **Human Authority** | None (blocked structurally) | Approve, reject, sign, conclude | AI write access to workflow state is structurally impossible; engine blocks AI-initiated transitions |

---

## 20. RBAC and Identity

### 20.1 Authentication

| Aspect | Decision |
|--------|----------|
| Protocol | JWT-based session tokens |
| Token contents | user_id, organization_id, role, permissions, exp |
| Token expiry | 24 hours (configurable) |
| Refresh | Refresh token with 7-day rotation |
| MFA | Post-MVP |
| SSO/SAML | Post-MVP |

### 20.2 Authorization Model

```typescript
interface Permission {
  action: string;           // e.g., 'evidence:verify', 'findings:create', 'approval:approve'
  scope: 'system' | 'organization' | 'engagement';
  constraint?: {           // Optional additional constraints
    risk_tier?: string[];  // e.g., only low/medium risk
    engagement_type?: string[];
  };
}

// Roles map to permission sets:
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN:     [/* all system permissions */],
  PARTNER:   [/* org + engagement permissions except system config */],
  MANAGER:   [/* engagement permissions + approve low/medium */],
  REVIEWER:  [/* evidence review, finding create, rec draft, NO approval */],
  OPERATOR:  [/* TB upload, evidence upload, mapping confirm, NO review, NO approval */],
  VIEWER:    [/* read-only engagement view */],
};
```

### 20.3 Permission Enforcement Points

| Layer | Enforcement |
|-------|------------|
| API route | Middleware checks JWT + role permission before route handler |
| Service layer | Domain service checks authorization for state transitions |
| Data layer | Query filters always include `organization_id` from authenticated user |
| UI | Route guards and component-level permission checks |

### 20.4 Tenant Isolation

- `organization_id` is the partition key for all tenant-scoped tables
- Every API request includes organization context (from JWT)
- Every database query includes `WHERE organization_id = :current`
- Cross-tenant data access is structurally prevented — there is no "super admin" bypass at the data layer

---

## 21. Audit Log and Event Store

### 21.1 Event Schema

```typescript
interface AuditEvent {
  id: UUID;
  event_type: string;           // e.g., 'finding.state_transition', 'evidence.uploaded'
  actor_id: UUID;               // User ID who performed the action
  actor_type: 'human' | 'system' | 'ai';
  tenant_id: UUID;              // organization_id for scoping
  target_type: string;          // e.g., 'evidence', 'finding', 'recommendation'
  target_id: UUID;
  previous_state?: string;      // null for creation events
  new_state: string;
  evidence_refs: UUID[];        // Evidence IDs referenced in the action
  metadata: Record<string, unknown>;  // Contextual data (freeform)
  timestamp: string;            // ISO 8601
  sequence: number;             // Monotonically increasing per-tenant sequence
  event_hash: string;           // Hash of all above fields for integrity chain
  previous_event_hash?: string; // Link to previous event (blockchain-style chain)
}
```

### 21.2 Storage Implementation (MVP)

| Aspect | Decision |
|--------|----------|
| Storage | PostgreSQL `audit_events` table (append-only) |
| Insert model | INSERT-only; no UPDATE or DELETE permissions on this table |
| Indexing | (tenant_id, event_type, timestamp), (target_type, target_id), (actor_id) |
| Partitioning | By month (range partition on timestamp) |
| Retention | Retained indefinitely for MVP |
| Integrity chain | Event hash = SHA256(all fields + previous_event_hash) |
| Rebuildable | Traceability graph can be rebuilt from event store |

### 21.3 Events Captured (MVP)

| Event Type | Trigger | Captured Data |
|------------|---------|---------------|
| `engagement.*` | All engagement state transitions | previous_state, new_state, governance_rules_snapshot |
| `evidence.*` | Upload, verify, accept, reject, reference | evidence_state transition, reviewer_id, rationale |
| `finding.*` | Create, update_state, modify_content | finding_state transition, author, evidence_refs |
| `recommendation.*` | Create, update, submit, approve, reject | recommendation_state, ai_contributed, approver, rationale |
| `mapping.*` | Account mapping create, update | mapping_type (ai/human), canonical_account |
| `validation.*` | Validation run, anomaly disposition | validation_type, results_summary |
| `user.*` | User login, role assignment, permission change | new_role, changed_by |
| `governance.*` | Governance rule create, update, override | rule_snapshot, override_rationale |
| `publication.*` | Publish, supersede | published_recommendation_id, access_url |

---

## 22. Data Flow Diagrams

### 22.1 End-to-End Engagement Flow

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Admin/   │  │ Operator │  │ System   │  │ Reviewer │
│ Partner  │  │          │  │ (Engine) │  │          │
└────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
     │              │              │              │
     │ 1. Create    │              │              │
     │    org       │              │              │
     │──────────────│──────────────│──────────────│
     │              │              │              │
     │ 2. Add       │              │              │
     │    client    │              │              │
     │──────────────│──────────────│──────────────│
     │              │              │              │
     │ 3. Create    │              │              │
     │    engagement│              │              │
     │──────────────│──────────────│──────────────│
     │              │ 4. Upload TB │              │
     │              │─────────────▶│ 5. Parse &   │
     │              │              │    validate  │
     │              │              │──┐           │
     │              │              │  │ trust     │
     │              │              │◄─┘ assess   │
     │              │ 6. Confirm   │              │
     │              │    mapping   │              │
     │              │◀────────────▶│ 7. Suggest   │
     │              │              │    mappings  │
     │              │              │              │
     │              │ 8. Upload    │              │
     │              │    evidence  │              │
     │              │─────────────▶│              │
     │              │              │ 9. Store +   │
     │              │              │    hash      │
     │              │              │              │ 10. Review
     │              │              │              │     evidence
     │              │              │ 11. Generate │◀──────────
     │              │              │     signals  │
     │              │              │─────────────▶│
     │              │              │              │ 12. Create
     │              │              │              │     finding
     │              │              │              │──┐
     │              │              │              │  │ AI
     │              │              │              │◄─┘ draft
     │              │              │              │ 13. Draft
     │              │              │              │     rec
     │              │              │              │──┐
     │              │              │              │  │ AI
     │              │              │              │◄─┘ draft
     │              │              │              │
     │              │              │              │ 14. Submit
     │              │              │              │     for
     │              │              │              │     approval
     │              │              │              │
┌────┴─────┐       │              │              │
│ Manager/ │       │              │              │
│ Partner  │       │              │              │
└────┬─────┘       │              │              │
     │ 15. Approve │              │              │
     │◀────────────────────────────│──────────────│
     │    /reject  │              │              │
     │─────────────│──────────────│──────────────│
     │              │              │ 16. Publish  │
     │              │              │──┐           │
     │              │              │  │ immutable │
     │              │              │◄─┘ output    │
```

### 22.2 Data Flow: Account Mapping

```
TB File ──▶ Parse ──▶ Account Extracts ──▶ AI Suggests Mappings
                                                │
                                           ┌─────┴──────┐
                                           │ Governance  │
                                           │ Wrapper:    │
                                           │ - log      │
                                           │ - validate │
                                           └─────┬──────┘
                                                 │
                                            ┌────▼────┐
                                            │ Operator │
                                            │ Reviews  │
                                            │ ──────── │
                                            │ Accept / │
                                            │ Modify / │
                                            │ Manual   │
                                            └────┬────┘
                                                 │
                                            ┌────▼────┐
                                            │ Persist  │
                                            │ Account  │
                                            │ Mapping  │
                                            └─────────┘
                                                 │
                                            ┌────▼────┐
                                            │ Emit     │
                                            │ Event:   │
                                            │ account  │
                                            │ .mapped  │
                                            └─────────┘
```

### 22.3 Data Flow: Review and Approval

```
Finding (ReviewReady)
    │
    ▼
Recommendation Draft
    │ Reviewer drafts (AI-assisted optional)
    ▼
Recommendation (PendingApproval)
    │
    ▼
Enter Approval Queue
    │
    ├──▶ Approver Action?
    │
    ├── Accept  ──▶ Recommendation (Approved) ──▶ Publication
    │
    ├── Modify  ──▶ Recommendation (Approved, modified) ──▶ Publication
    │                (modification recorded with approver identity)
    │
    └── Reject  ──▶ Recommendation (Rejected)
                     (rationale required, returns to drafting)
```

---

## 23. State Management

### 23.1 Frontend State

| State Layer | Mechanism | Scope |
|-------------|-----------|-------|
| Server data | React Query (TanStack Query) | Cached API responses with stale-while-revalidate |
| URL state | Next.js search params | Engagement ID, tab, filter params |
| UI state | React useState / useReducer | Modals, forms, local toggles |
| Auth state | JWT in cookies + React context | User identity, role, permissions |

### 23.2 Backend State

| State Type | Storage | Notes |
|------------|---------|-------|
| Workflow state | PostgreSQL (engagements.workflow_state) | Single source of truth |
| Entity state | PostgreSQL (entity.status, entity.state) | Each entity tracks its own state |
| Session state | JWT (stateless) | No server-side session store for MVP |
| Cache | In-memory (optional, for read-heavy queries) | Post-MVP; not required for MVP scale |

### 23.3 State Consistency

| Guarantee | Implementation |
|-----------|---------------|
| Eventual consistency within monolith | Not needed — all state is in same database with ACID transactions |
| Causal consistency | Event store provides ordering via sequence numbers |
| No stale reads after write | Read-after-write within same API request uses fresh query |
| Optimistic concurrency | Version number on mutable entities; CAS pattern for updates |

---

## 24. API Boundaries

### 24.1 API Design Principles

- RESTful resource-oriented API
- All routes prefixed with `/api/v1`
- All routes require `Authorization: Bearer <token>`
- Tenant scoping via JWT (no `organization_id` in URL path)
- Request/response validation with Zod schemas
- Pagination for list endpoints (cursor-based)
- Consistent error response format

### 24.2 API Route Structure (MVP)

```
# Identity & Access
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
POST   /api/v1/auth/refresh
GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/:id
PATCH  /api/v1/users/:id

# Organization
GET    /api/v1/organization
PATCH  /api/v1/organization
GET    /api/v1/organization/governance-rules
PATCH  /api/v1/organization/governance-rules

# Clients
GET    /api/v1/clients
POST   /api/v1/clients
GET    /api/v1/clients/:id
PATCH  /api/v1/clients/:id

# Engagements
GET    /api/v1/engagements
POST   /api/v1/engagements
GET    /api/v1/engagements/:id
PATCH  /api/v1/engagements/:id
GET    /api/v1/engagements/:id/team
PATCH  /api/v1/engagements/:id/team
GET    /api/v1/engagements/:id/workflow-state
GET    /api/v1/engagements/:id/traceability

# Trial Balance
POST   /api/v1/engagements/:id/trial-balance/upload
GET    /api/v1/engagements/:id/trial-balance
GET    /api/v1/engagements/:id/accounts
GET    /api/v1/engagements/:id/accounts/:accountId

# Account Mapping
GET    /api/v1/engagements/:id/mappings
GET    /api/v1/engagements/:id/mappings/suggestions
POST   /api/v1/engagements/:id/mappings
PATCH  /api/v1/engagements/:id/mappings/:mappingId
POST   /api/v1/engagements/:id/mappings/confirm-all

# Validation
GET    /api/v1/engagements/:id/validations
POST   /api/v1/engagements/:id/validations/run
GET    /api/v1/engagements/:id/anomalies
PATCH  /api/v1/engagements/:id/anomalies/:flagId

# Evidence
POST   /api/v1/engagements/:id/evidence/upload
GET    /api/v1/engagements/:id/evidence
GET    /api/v1/engagements/:id/evidence/:evidenceId
PATCH  /api/v1/engagements/:id/evidence/:evidenceId/state
POST   /api/v1/engagements/:id/evidence/:evidenceId/links
DELETE /api/v1/engagements/:id/evidence/:evidenceId/links/:linkId

# Signals
GET    /api/v1/engagements/:id/signals
PATCH  /api/v1/engagements/:id/signals/:signalId/status

# Findings
GET    /api/v1/engagements/:id/findings
POST   /api/v1/engagements/:id/findings
GET    /api/v1/engagements/:id/findings/:findingId
PATCH  /api/v1/engagements/:id/findings/:findingId
POST   /api/v1/engagements/:id/findings/:findingId/submit
POST   /api/v1/engagements/:id/findings/:findingId/withdraw

# Recommendations
GET    /api/v1/engagements/:id/recommendations
POST   /api/v1/engagements/:id/recommendations
GET    /api/v1/engagements/:id/recommendations/:recId
PATCH  /api/v1/engagements/:id/recommendations/:recId
POST   /api/v1/engagements/:id/recommendations/:recId/submit
POST   /api/v1/engagements/:id/recommendations/:recId/approve
POST   /api/v1/engagements/:id/recommendations/:recId/reject

# Review Queue
GET    /api/v1/review-queue                    # Current user's queue
GET    /api/v1/engagements/:id/review-queue    # Engagement-specific queue

# AI Assistance
POST   /api/v1/ai/draft-finding
POST   /api/v1/ai/draft-recommendation
POST   /api/v1/ai/summarize-evidence
POST   /api/v1/ai/suggest-mappings
POST   /api/v1/ai/generate-signals
POST   /api/v1/ai/rank-queue

# Publication
POST   /api/v1/engagements/:id/publish/:recId
GET    /api/v1/published/:publicationId        # Client-facing (no auth required)
GET    /api/v1/engagements/:id/publications

# Audit / Events
GET    /api/v1/engagements/:id/events
GET    /api/v1/engagements/:id/trace
```

### 24.3 Error Response Format

```typescript
interface ApiError {
  error: {
    code: string;           // Machine-readable: 'GUARD_FAILED', 'NOT_FOUND', 'VALIDATION_ERROR'
    message: string;        // Human-readable summary
    details?: unknown;      // Structured error details
    guard_failures?: {      // Only for GUARD_FAILED errors
      guard: string;
      reason: string;
    }[];
    request_id: string;     // Correlation ID for debugging
  };
}
```

---

## 25. Storage Design

### 25.1 PostgreSQL Schema Organization

| Schema | Purpose | Tables |
|--------|---------|--------|
| `public` | Reference data, shared types | Enums, canonical model reference data |
| `identity` | Users, roles, authentication | users, sessions, roles, permissions |
| `engagement` | Engagement management | organizations, clients, engagements, engagement_team |
| `financial` | Financial data | trial_balances, accounts, ledgers, journals |
| `mapping` | Account mapping | canonical_accounts, account_mappings, mapping_suggestions |
| `validation` | Validation results | validation_results, anomaly_flags |
| `evidence` | Evidence management | evidence, evidence_links, evidence_reviews |
| `findings` | Findings and recommendations | signals, findings, recommendations |
| `approval` | Review and approval | review_records, approvals |
| `publication` | Publication | published_recommendations, client_responses |
| `events` | Audit logging | audit_events |
| `ai` | AI suggestion tracking | ai_suggestions |

### 25.2 Indexing Strategy

| Table | Indexes | Rationale |
|-------|---------|-----------|
| engagements | (organization_id, status), (client_id) | Tenant-scoped list queries |
| accounts | (trial_balance_id), (engagement_id, account_type) | Evidence linking and analysis |
| evidence | (engagement_id, evidence_state), (file_hash) | Queue queries, dedup |
| evidence_links | (evidence_id), (target_type, target_id) | Polymorphic lookups |
| findings | (engagement_id, state), (finding_type, risk_rating) | Queue sorting, filters |
| recommendations | (engagement_id, state), (finding_id) | Workflow integration |
| audit_events | (tenant_id, event_type, ts), (target_type, target_id) | Audit trail queries |

### 25.3 File Storage Strategy (Evidence)

| Aspect | Decision |
|--------|----------|
| Storage backend | S3-compatible (MinIO for dev/test, AWS S3 for prod) |
| Key prefix | `{tenant_id}/{engagement_id}/{evidence_id}_{original_filename}` |
| Metadata | Stored in PostgreSQL `evidence` table (not S3 metadata) |
| Integrity | SHA-256 hash stored in PostgreSQL, verified on retrieval |
| Access | API-mediated for governed access; presigned URLs for direct download |
| Preview | PDF thumbnail generation; image preview for supported types |
| Size limit (MVP) | 50MB per file; 500MB total per engagement |

### 25.4 Retention Policy (MVP)

| Data Type | Retention | Notes |
|-----------|-----------|-------|
| Engagement data | Indefinite | No deletion during MVP |
| Evidence files | Indefinite | Referenced by immutable publications |
| Audit events | Indefinite | Append-only, never deleted |
| AI suggestions | Indefinite | Governance requirement |
| User sessions | 7 days | Refresh rotation |
| Temp uploads | 24 hours | Unprocessed uploads cleaned up by scheduled job |

---

## 26. Security and Governance

### 26.1 Security Controls

| Control | Implementation |
|---------|---------------|
| Authentication | JWT with 24h expiry; refresh token rotation |
| Authorization | Role-based access control at every API endpoint |
| Tenant isolation | `organization_id` filter on every query; no cross-tenant access |
| Input validation | Zod schemas on every API route; SQL injection prevention via parametrized queries |
| File upload validation | File type whitelist (PDF, XLSX, CSV, PNG, JPG); size limit; virus scanning (post-MVP) |
| File storage | Server-side encryption at rest; presigned URL expiry (15 min) |
| Audit trail | Append-only event store; all actions attributable |
| Secrets management | Environment variables for MVP; vault integration post-MVP |
| HTTPS enforcement | TLS termination at reverse proxy |
| Rate limiting | Per-tenant rate limits on API routes (100 req/min default) |

### 26.2 Governance Controls

| Control | Implementation | Doctrine Source |
|---------|---------------|-----------------|
| Governance rule versioning | governance_rules stored as JSONB with version number | 08.01 §11 |
| Governance rule inheritance | Org rules inherited by engagement; engagement may tighten but not loosen | 16.06 §6.2 |
| No governance bypass | Engine evaluates guards synchronously; no admin bypass endpoint | 16.06 §6.3 |
| Evidence-state gating | Workflow transitions check evidence state requirements | 04.01 §12 |
| AI suggestion logging | Every AI suggestion persisted with full metadata | 10.01 §10 |
| Human decision required | AI has no write access to workflow state objects | 10.02 §6.1 |
| Override transparency | Override events logged with same fidelity as standard events | 16.06 §6.5 |

---

## 27. MVP Deployment Model

### 27.1 Infrastructure

| Component | MVP Deployment | Scale Target |
|-----------|---------------|--------------|
| Application | Single VM (4 CPU, 16GB RAM) + Docker | <50 concurrent users |
| Database | PostgreSQL 16 on same VM or managed (RDS) | <10 concurrent connections |
| File storage | Local filesystem mapped to S3 adapter | <1000 files |
| AI model | API-based (OpenAI / Anthropic / local Ollama) | <100 AI calls/day |
| Reverse proxy | nginx or Caddy (TLS, rate limiting) | Single instance |
| Monitoring | Basic logging + uptime monitoring | Manual review |

### 27.2 Pipeline

```
Git Push ──▶ GitHub Actions ──▶ Build (npm run build) ──▶ Docker Image
                │                                              │
                ▼                                              ▼
            Lint + Type Check                            Push to Registry
                │                                              │
                ▼                                              ▼
            Test Suite                                   Deploy to VM
                │                                          (docker pull
                ▼                                           + restart)
            (All pass)
```

### 27.3 Environments

| Environment | Purpose | Data |
|-------------|---------|------|
| `development` | Local dev | Synthetic data, seeded test data |
| `staging` | Integration testing | Anonymized test data |
| `production` | Pilot firms | Real client data (isolated per tenant) |

---

## 28. Non-Functional Requirements

### 28.1 Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| Page load (workflow views) | <2s first paint, <500ms subsequent | Lighthouse, RUM |
| API response (read) | <200ms p95 | APM instrumentation |
| API response (write) | <500ms p95 | APM instrumentation |
| TB import + parse | <30s for 1000-account trial balance | Timed benchmark |
| AI suggestion generation | <5s per suggestion (async) | Timed with UX loading state |
| Evidence upload (10MB) | <5s end-to-end | Timed benchmark |
| Event store write | <100ms p95 | APM instrumentation |
| Concurrent users | 10 per engagement, 50 total | Load test |
| Data import (bulk) | 1000 accounts < 10s | Timed benchmark |

### 28.2 Reliability

| Metric | Target |
|--------|--------|
| Uptime (pilot) | 99.5% (excluding planned maintenance) |
| Data durability | 99.9999999% (S3 standard) |
| RPO | 5 minutes (database backup interval) |
| RTO | 2 hours (pilot) |
| Backup | Daily automated PostgreSQL dump; evidence stored durably in S3 |

### 28.3 Scalability (MVP Ceiling)

| Dimension | Ceiling |
|-----------|---------|
| Organizations | 10 |
| Engagements per org | 50 |
| Accounts per engagement | 5000 |
| Evidence per engagement | 500 files |
| Users per org | 50 |
| AI calls per day | 500 |
| Storage per engagement | 5GB |

### 28.4 Security & Compliance

| Requirement | Implementation |
|-------------|---------------|
| Data encryption at rest | S3 SSE-S3 or SSE-KMS; PostgreSQL TDE or filesystem encryption |
| Data encryption in transit | TLS 1.2+ for all HTTP and database connections |
| Audit trail | Immutable event store covering all governed actions |
| Data isolation | Tenant-level data isolation at query layer |
| Access control | RBAC enforced at API, service, and data layers |
| Logging | All access logged; sensitive data redacted from logs |

---

## 29. Engineering Risks

| # | Risk | Likelihood | Impact | Mitigation | Trigger |
|---|------|------------|--------|------------|---------|
| ER1 | Workflow engine becomes over-engineered generic BPM | Medium | High | Keep state machine definitions as simple data objects; resist adding generic workflow features not required by PRD scope | When engine requires Turing-complete expression language |
| ER2 | AI suggestion latency degrades UX | Medium | Medium | Async AI generation with loading states; cache common suggestions; set SLO of 5s with timeout | AI call consistently >5s |
| ER3 | Evidence file storage grows faster than expected | Medium | Medium | Set per-engagement storage limits; compress files on upload; archive old engagements to cold storage | Storage >80% of allocated |
| ER4 | Complex approval chains create UX friction | Low | Medium | MVP approval chain is single-level (one approver per item); multi-level chains are post-MVP | Pilot feedback |
| ER5 | Trial balance parsing fails on real-world files | High | High | Build robust CSV/XLSX parser with column mapping UI; test against real audit firm files early | Parser error rate >10% in pilot |
| ER6 | Database migrations become bottleneck | Medium | Low | Use schema-per-domain pattern; independent migration files per schema | More than 2 domains needing coordinated schema changes |
| ER7 | Modular monolith becomes tightly coupled over time | Medium | Medium | Enforce domain boundaries via TypeScript module boundaries (barrel exports); event bus for cross-domain communication; code review gate | Domain A imports a repository class from Domain B |
| ER8 | AI model changes produce inconsistent outputs | Low | Medium | Pin model versions per suggestion type; record model_version in ai_suggestions; run regression test suite before model updates | Model version change |
| ER9 | RBAC becomes too rigid for pilot firms' needs | Medium | Low | Design role-permission model as data-driven (permissions stored in DB, not code); custom role creation is post-MVP | Pilot firm requests non-standard permission combination |

---

## 30. Implementation Phases

### Phase 1: Foundation (Weeks 1-3)

**Goal:** Project scaffold, data model, auth, tenant isolation, foundational APIs.

| Task | Output | Dependencies |
|------|--------|--------------|
| Next.js project scaffold with TypeScript | Running dev server with API routes | None |
| PostgreSQL schema design and migrations | All core tables created | None |
| RBAC and JWT auth middleware | Login, logout, session, permission enforcer | Schema |
| Organization and client CRUD | Org and client API + UI | Auth |
| Engagement CRUD with team assignment | Engagement API + UI | Org, Client |
| Tenant isolation middleware | All queries scoped to organization_id | Auth |
| In-process event bus setup | Event definitions for all domains | None |

### Phase 2: Financial Data Processing (Weeks 4-6)

**Goal:** Trial balance import, account mapping, validation.

| Task | Output | Dependencies |
|------|--------|--------------|
| CSV/XLSX parser for trial balance | TB upload API with parsing | Engagement (Phase 1) |
| Account extraction and normalization | Account records created from parsed TB | TB parser |
| Canonical financial model seed data | Canonical account reference table | Schema (Phase 1) |
| AI-assisted account mapping service | Mapping suggestions, confirmation flow | CFM, TB parser |
| Validation engine (balance, structure, trust) | Validation API, trust state assignment | Account, Mapping |
| Anomaly detection (basic rules) | Anomaly flags generated | Validation |

### Phase 3: Evidence and Findings (Weeks 7-9)

**Goal:** Evidence upload, verification, signal generation, finding lifecycle.

| Task | Output | Dependencies |
|------|--------|--------------|
| S3-compatible file storage integration | Evidence upload/download API | Schema (Phase 1) |
| Evidence state machine | Candidate → Verified → Accepted lifecycle | File storage |
| Evidence linking to accounts | EvidenceLink CRUD | Evidence, Account |
| Evidence review UI | Inline document view, verdict controls | Evidence |
| AI signal generation | Anomaly/evidence-gap signal production | Validation (Phase 2), Evidence |
| Signal triage UI | Reviewer queue for signals | Signal service |
| Finding CRUD with state machine | Finding lifecycle (Draft → ReviewReady → ...) | Signal, Evidence |
| Finding type, risk, materiality model | Finding enrichment | Finding CRUD |

### Phase 4: Recommendations and Approval (Weeks 10-12)

**Goal:** Recommendation drafting, AI assistance, review queues, approval workflow.

| Task | Output | Dependencies |
|------|--------|--------------|
| Recommendation CRUD with state machine | Recommendation lifecycle | Finding (Phase 3) |
| AI-assisted recommendation drafting | AI → suggestion → human edit → submit | Recommendation, Evidence |
| Review queue service | Prioritized, filterable queue for each user | Finding, Recommendation |
| Approval engine | Accept/Modify/Reject with governance | Recommendation |
| Review UI (inline evidence, AI distinction) | Unified review interface | Review queue |
| Governance rule evaluation at transition | Guard clauses enforce authority, evidence | Approval engine |

### Phase 5: Publication and Audit (Weeks 13-14)

**Goal:** Immutable publication, client view, audit trail, traceability.

| Task | Output | Dependencies |
|------|--------|--------------|
| Publication service | Immutable published record generation | Approval (Phase 4) |
| Client-facing published view | Access-controlled publication page | Publication |
| Client response mechanism | Comment/query on published recommendations | Publication |
| Append-only event store | All state transitions captured as events | All domains |
| Traceability graph queries | Forward/backward trace endpoints | Event store, all data |
| Audit trail UI | User-visible event history per engagement | Event store |
| Governance reporting | Export-ready event log | Event store |

### Phase 6: Integration and Polish (Weeks 15-16)

**Goal:** UX polish, error handling, performance, pilot readiness.

| Task | Output | Dependencies |
|------|--------|--------------|
| Error boundary implementation | Consistent error states across UI | All phases |
| Loading states and optimistic updates | Smooth UX during async operations | All phases |
| Keyboard shortcuts for reviewers | High-throughput review patterns | Review UI (Phase 4) |
| Responsive design pass | Tablet/mobile support for field use | All UI |
| Performance optimization | Index tuning, query optimization, caching | All phases |
| AI governance audit pass | Verify all AI outputs logged and distinguishable | AI (Phase 3, 4) |
| Tenant isolation audit | Verify no cross-tenant data leaks | All phases |
| Pilot deployment scripts | Docker compose, env config, seed data | All phases |
| Documentation | Setup guide, user manual, API reference | All phases |

---

## Appendix A: PRD Requirement Traceability

| PRD Requirement | Architecture Component | Domain Entity | Workflow |
|----------------|----------------------|---------------|----------|
| Organization/client scoping | Engagement Management (BC2) | Organization, Client | §6.1 |
| Engagement setup | Engagement Management (BC2) | Engagement, WorkflowTemplate | §6.2 |
| User roles / RBAC | Identity & Access (BC1) | User, Role, Permission | All |
| Trial balance upload/import | Financial Data Ingestion (BC3) | TrialBalance, Account | §6.3 |
| Chart of accounts mapping | Account Mapping (BC5), Canonical Model (BC4) | AccountMapping, CanonicalAccount | §6.4 |
| Data validation | Validation Engine (BC6) | ValidationResult, AnomalyFlag | §6.5 |
| Evidence upload and linking | Evidence Management (BC7) | Evidence, EvidenceLink | §6.6 |
| Evidence review states | Evidence Management (BC7) | Evidence (state machine) | §6.7 |
| Signal / Issue detection | AI Assistance (BC13), Findings (BC8) | Signal | §6.8 |
| Findings lifecycle | Findings Service (BC8) | Finding (state machine) | §6.9 |
| Recommendations | Recommendation Service (BC9) | Recommendation | §6.10 |
| Reviewer approval | Review & Approval (BC10) | Approval, ReviewRecord | §6.11 |
| Publication | Publication Service (BC11) | PublishedRecommendation | §6.12 |
| Audit logging | Audit & Traceability (BC12) | AuditEvent | §6.13 |
| AI-assisted drafting | AI Assistance (BC13) | AiSuggestion | §6.8, §6.9, §6.10 |
| Traceability | Audit & Traceability (BC12) | TraceabilityGraph | §6.13 |

## Appendix B: Architecture Decision Records

### ADR-001: Modular Monolith over Microservices

**Context:** MVP team is small (2-4 engineers). Microservices introduce coordination overhead, deployment complexity, and debugging difficulty.

**Decision:** Build as a modular monolith with strict domain boundaries enforced at the code and schema level. Extract to microservices only when scaling demands it.

**Consequence:** Team must enforce domain boundaries via discipline and tooling (TypeScript module boundaries, schema-per-domain in PostgreSQL). Risk of tight coupling if boundaries are not maintained.

### ADR-002: Purpose-Built Workflow Engine over Generic BPM

**Context:** Generic BPM engines (Camunda, Temporal) are powerful but require significant adaptation to enforce evidence-aware governance. They also introduce infrastructure complexity.

**Decision:** Build a purpose-built, evidence-aware state machine as a library within the monolith. State machine definitions are data (not code). Guards evaluate synchronously at transition time.

**Consequence:** More upfront engineering but better alignment with doctrine. The engine is lightweight (~1000 lines), well-understood, and auditable.

### ADR-003: Append-Only Event Store in PostgreSQL over Dedicated Event Store

**Context:** Dedicated event stores (EventStoreDB, Kafka) add operational complexity. For MVP scale, PostgreSQL append-only tables suffice.

**Decision:** Store audit events in PostgreSQL append-only tables with hash chain integrity. Extract to dedicated event store when throughput exceeds PostgreSQL capability (>1000 events/second).

**Consequence:** Simpler ops, single database for MVP. May need migration path if event volume grows beyond PostgreSQL capacity.

### ADR-004: API-Mediated AI over Direct Model Access

**Context:** AI models accessed directly from domain code would embed model-specific logic and versioning concerns throughout the codebase.

**Decision:** AI model access is mediated through an AI Assistance Layer with a defined service interface. Domain code does not call AI models directly. The governance wrapper enforces AI boundary rules centrally.

**Consequence:** Clean separation of concerns. Single point for AI governance enforcement. Slight latency overhead from the abstraction layer.

### ADR-005: Schema-Per-Domain over Single Schema

**Context:** All tables in a single PostgreSQL schema would create implicit coupling and make future extraction to microservices harder.

**Decision:** Each bounded context owns its own PostgreSQL schema. Cross-schema references use qualified names and are reviewed for coupling.

**Consequence:** More schema management overhead but better encapsulation. Future extraction to microservices is feasible without data migration.

---

*End of AuditOS MVP Architecture Specification*
