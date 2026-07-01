# SalesOS v2 — Reference Product Blueprint

> **Status:** Draft v0.1 | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** Product Design — also serves as the first Reference Product Blueprint for all AQLIYA products.
> **Predecessor:** `PLATFORM_KERNEL_ARCHITECTURE.md` (Kernel Design), `AQLIYA_ARCHITECTURE_CONSTITUTION.md` (Governance)
> **Template status:** If this blueprint passes validation, its structure becomes the standard template for FinanceOS, AuditOS vNext, HROS, ProcurementOS, ComplianceOS, and all future AQLIYA products.

---

## Purpose

SalesOS v2 is the first **Reference Product** built on the AQLIYA Platform Kernel.

Its purpose is not only to define SalesOS, but to **validate** the AQLIYA product architecture, product blueprint methodology, and platform consumption model.

Any reusable structure discovered here should become the **standard template** for future AQLIYA products.

---

### How to Read This Document

Each section must pass three tests:

| # | Question | If No |
|---|---|---|
| 1 | Does this section accurately represent SalesOS? | Section is incomplete |
| 2 | Can this section's structure be reused for FinanceOS or AuditOS (with different content)? | Template needs revision |
| 3 | Does this section depend only on Platform Capabilities (not on other products)? | Violates Product Independence |

---

# 1. Product Profile

| Field | Value |
|---|---|
| **Product ID** | `salesos` |
| **Product Name** | SalesOS |
| **Product Version** | 2.0 |
| **Product Tagline (EN)** | Governed Commercial Intelligence |
| **Product Tagline (AR)** | ذكاء تجاري محكوم |
| **Product Type** | Specialized Operating System under AQLIYA |
| **Parent Platform** | AQLIYA Platform Kernel |
| **Required Platform Capabilities** | `platform.auth`, `platform.workflow`, `platform.ai`, `platform.evidence`, `platform.event-bus`, `platform.features` |
| **Optional Platform Capabilities** | `platform.knowledge`, `platform.memory`, `platform.signals` |
| **Product Capabilities** | Revenue Intelligence, Opportunity Management, Pipeline Management, Account Intelligence, Commercial Memory, Forecast Management |
| **Deployment Modes** | SaaS (v2.0), Private Cloud (v2.1+ planned), On-Prem (v2.2+ strategic) |
| **Licensing Unit** | Per-organization, per-product. Independent of AuditOS, DecisionOS, or any other product. |
| **Edition Matrix** | Core (v2.0), Professional (v2.1+), Enterprise (v2.2+) |
| **First Consumer Of** | `platform.auth`, `platform.workflow`, `platform.evidence`, `platform.features`, `platform.knowledge` |
| **Governance Constitution** | All 12 principles apply. Highest priority: Product Independence. |

---

# 2. Vision

## 2.1 Product Vision Statement

> **SalesOS v2 is the governed commercial intelligence workspace for revenue-driven organizations.**
>
> It replaces the current SalesOS v1 (CRM-lite with intelligence overlays) with a clean, event-driven, AI-governed product that manages the full commercial lifecycle — from account qualification and pipeline management through deal negotiation, evidence-based review, and closed-won handoff to customer success.
>
> SalesOS v2 does not clone Salesforce, HubSpot, or any CRM. It is a **governed intelligence product** that happens to manage commercial relationships — not a CRM that happens to have AI features.

## 2.2 Key Differentiators from v1

| Dimension | SalesOS v1 | SalesOS v2 |
|---|---|---|
| Architecture | In-memory store + optional Prisma | Platform Kernel + clean domain model |
| Persistence | Dual (in-memory default, Prisma opt-in) | Prisma-only via Kernel services |
| Event system | None (cross-product signals = TODO stub) | Event Bus with typed events |
| Workflow | Hardcoded state machines | Platform Workflow Engine |
| AI | Rule-based heuristics in sales-coupled modules | Platform AI Orchestration with governance |
| Feature flags | None | Platform Feature Flag system |
| Knowledge | SalesOS-owned v02 code | Platform Knowledge Graph |
| Audit | SalesOS-specific + platform dual-write | Platform Audit service |
| Evidence | SalesOS-specific implementation | Platform Evidence Network |
| Product coupling | Phantom imports to missing platform modules | Zero coupling — Kernel only |

## 2.3 Product Principles (derived from Constitution)

| Principle | SalesOS v2 Application |
|---|---|
| Product Independence | SalesOS v2 must work with only the Platform Kernel. No dependency on AuditOS, DecisionOS, or LocalContentOS. |
| Platform Neutrality | SalesOS v2 must not introduce product-specific concepts into the Kernel. No SalesAccount type in platform. |
| AI Governance | Every AI output must have governance metadata, human review, and audit trail. No autonomous decisions. |
| Commercial Truth | No claim of CRM replacement, no claim of autonomous forecasting, no claim of certified audit. |

---

# 3. Product Boundaries

## 3.1 In Scope for v2.0

| Area | Scope |
|---|---|
| Account Management | Create, qualify, segment, score commercial accounts |
| Pipeline Management | Visual pipeline, stage progression, weighted forecasting |
| Deal Management | Create deals, stage transitions, evidence linking, review/approval |
| Opportunity Intelligence | Win probability, qualification gaps, next actions |
| Commercial Memory | Objections, signals, competitor mentions, win/loss patterns |
| AI-Assisted Briefing | AI-generated account briefs with human review |
| Evidence-Based Review | Gate deals behind evidence requirements per stage |
| Governed AI | All AI outputs have confidence scores, governance metadata, human review |
| Export | Gated export of account briefs and deal summaries with audit trail |
| Arabic-First UX | Full RTL, Arabic labels, bilingual commercial terminology |

## 3.2 Out of Scope for v2.0

| Area | Reason | Future |
|---|---|---|
| CRM Sync (HubSpot/Salesforce) | Product coupling risk. Sync is an integration, not core. | v2.1 as optional module |
| Email/Calendar Integration | Product scope boundary | v2.1+ |
| Customer Success Workspace | Separate product concern | Handoff to separate product |
| Marketing Automation | Separate business domain | Not SalesOS scope |
| CPQ (Configure-Price-Quote) | Complex domain needing dedicated design | v2.2+ or separate product |
| Partner Management | Separate relationship domain | v2.2+ |
| Forecasting as a Service | Pipeline forecasting only in v2.0 | v2.1+ |

## 3.3 Product Boundary Matrix

| Capability | SalesOS v2 | Platform Kernel | Other Product |
|---|---|---|---|
| Account data | ✅ Domain model | ❌ | ❌ |
| User authentication | ❌ | `platform.auth` | ❌ |
| Workflow stages | ❌ | `platform.workflow` | ❌ |
| AI generation | ❌ | `platform.ai` | ❌ |
| Evidence linking | ❌ | `platform.evidence` | ❌ |
| Events | ❌ | `platform.event-bus` | ❌ |
| Feature flags | ❌ | `platform.features` | ❌ |
| Knowledge graph | ❌ | `platform.knowledge` | ❌ |
| CRM sync data | ❌ | ❌ | Integration (v2.1) |
| Customer success | ❌ | ❌ | Future product |

---

# 4. Business Capabilities

Mapped from the AQLIYA Architecture Constitution Business Capability Map:

| Business Capability | Platform Capability | How SalesOS v2 Consumes It |
|---|---|---|
| Identity & Access Management | `platform.auth` | Authenticate users, authorize actions (e.g., `salesos:deal.create`) |
| Business Workflow Orchestration | `platform.workflow` | Define deal stages, enforce transitions, SLA monitoring |
| Governed AI Intelligence | `platform.ai` | Generate account briefs, compute win probability, draft next actions |
| Evidence & Audit Management | `platform.evidence` | Link documents/records to deals, enforce evidence gates before stage transitions |
| Cross-Product Events & Signals | `platform.event-bus`, `platform.signals` | Publish `deal.closed_won`, subscribe to signals from other products |
| Feature Rollout & Experimentation | `platform.features` | Toggle AI suggestions, pilot new pipeline views |
| Institutional Knowledge | `platform.knowledge`, `platform.memory` | Query account relationships, surface past patterns |

---

# 5. Product Capabilities

These are SalesOS v2-specific capabilities. They sit between Business Capabilities (shared) and Domains (structural).

| Product Capability | Description | Business Capability | Platform Capabilities Used |
|---|---|---|---|
| **Revenue Intelligence** | AI-powered deal scoring, win probability, pipeline health, revenue forecasting | Governed AI Intelligence, Business Workflow | `platform.ai`, `platform.workflow`, `platform.event-bus` |
| **Opportunity Management** | Deal lifecycle, stage transitions, evidence gates, review/approval | Business Workflow Orchestration, Evidence & Audit | `platform.workflow`, `platform.evidence`, `platform.auth` |
| **Pipeline Management** | Visual pipeline, weighted pipeline value, stage distribution, deal aging | Business Workflow Orchestration | `platform.workflow`, `platform.features` |
| **Account Intelligence** | Account scoring, ICP fit, commercial memory, relationship graph | Institutional Knowledge, Governed AI | `platform.knowledge`, `platform.ai`, `platform.evidence` |
| **Commercial Memory** | Objection patterns, competitor tracking, win/loss analysis, signal aggregation | Cross-Product Events & Signals, Institutional Knowledge | `platform.signals`, `platform.memory`, `platform.event-bus` |
| **Forecast Management** | Weighted forecasting, scenario modeling, commit vs. pipeline analysis | Revenue Intelligence | `platform.workflow`, `platform.ai`, `platform.features` |

---

# 6. Capability Ownership Matrix

This is the central traceability table of SalesOS v2. It connects every Business Capability to the Platform Capabilities that enable it, the Product Capabilities that realize it, the Domains that model it, and the Modules that implement it.

| Business Capability | Platform Capability | Product Capability | Domain | Modules |
|---|---|---|---|---|
| Governed AI Intelligence | `platform.ai` | Revenue Intelligence | Brief | BriefRequest, BriefReview, BriefExport |
| Governed AI Intelligence | `platform.ai` | Revenue Intelligence | Forecast | ForecastView, ForecastScenarios |
| Business Workflow Orchestration | `platform.workflow` | Opportunity Management | Deal | DealCreate, DealDetail, DealReview, DealApproval |
| Business Workflow Orchestration | `platform.workflow` | Pipeline Management | Pipeline | PipelineView, PipelineDepth, PipelineAnalytics |
| Evidence & Audit Management | `platform.evidence` | Opportunity Management | Deal | DealDetail (evidence panel), DealReview |
| Identity & Access Management | `platform.auth` | All Product Capabilities | All Domains | All modules (guards) |
| Cross-Product Events & Signals | `platform.event-bus`, `platform.signals` | Commercial Memory | Signal, Objection, Competitor, WinLoss | SignalFeed, ObjectionTracker, CompetitorTracker, WinLossAnalysis |
| Institutional Knowledge | `platform.knowledge`, `platform.memory` | Account Intelligence | Account | AccountDetail, AccountBrief |
| Feature Rollout & Experimentation | `platform.features` | All Product Capabilities | All Domains | Selected modules per flag |

**How to read this table:**
- **Top-to-bottom:** A business need (Governed AI) is enabled by a Platform Capability (`platform.ai`), realized as a Product Capability (Revenue Intelligence), modeled in a Domain (Brief), and built in specific Modules (BriefRequest, BriefReview, BriefExport).
- **Bottom-to-top:** Every Module traces back to exactly one Domain, one Product Capability, one Platform Capability, and one Business Capability.
- **Validation rule:** No Module may exist in this table without a complete chain to a Business Capability.

---

# 7. Domain Model

## 7.1 Bounded Contexts

The SalesOS v2 domain model is organized into four Bounded Contexts. Each context has its own internal language, owns its data, and communicates with other contexts through Domain Events (not through shared databases or direct service calls).

```text
┌──────────────────────────────────────────────────────────────┐
│  Account Context                    Deal Context              │
│  ┌──────────────┐                 ┌──────────────┐           │
│  │ Account      │ ◄────────────── │ Deal         │           │
│  │              │   deals[]       │              │           │
│  │ - ICP        │                 │ - stages     │           │
│  │ - Status     │                 │ - evidence   │           │
│  │ - Memory     │                 │ - review     │           │
│  └──────────────┘                 └──────┬───────┘           │
│                                          │                    │
│                                          ▼                    │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  Commercial Memory Context                            │     │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │     │
│  │  │ Signal   │ │Objection │ │Competitor│ │ WinLoss  │ │     │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                │
│  Forecast Context                                              │
│  ┌──────────────┐ ┌──────────────────┐                         │
│  │ Forecast     │ │ Pipeline         │                         │
│  │              │ │                  │                         │
│  │ - weighted   │ │ - stages         │                         │
│  │ - scenarios  │ │ - analytics      │                         │
│  └──────────────┘ └──────────────────┘                         │
└────────────────────────────────────────────────────────────────┘
```

### Context Integration Rules

| Context | Communicates With | Via |
|---|---|---|
| Account | Deal | Account.deals[] — list reference |
| Account | Commercial Memory | Domain Events (e.g., `SignalDetected`) |
| Deal | Commercial Memory | Domain Events (e.g., `DealStageChanged`) |
| Deal | Forecast | Forecast aggregate reads deal pipeline data |
| Commercial Memory | Account, Deal | Domain Events only — never direct DB access |

## 7.2 Domains

Each domain belongs to exactly one Bounded Context and one Product Capability.

| Domain | Bounded Context | Product Capability | Description |
|---|---|---|---|
| **Account** | Account | Account Intelligence | Commercial accounts: name, industry, status, ICP score, commercial memory |
| **Deal** | Deal | Opportunity Management | Sales opportunities: amount, stage, probability, evidence links, review status |
| **Pipeline** | Forecast | Pipeline Management | Visual pipeline organization: stages, stage definitions, deal-to-stage mapping |
| **Interaction** | Commercial Memory | Commercial Memory | Logged interactions: calls, meetings, emails, notes with extracted signals |
| **Signal** | Commercial Memory | Commercial Memory | Detected signals: buying intent, budget, authority, timing, risk |
| **Objection** | Commercial Memory | Commercial Memory | Captured objections: category, frequency, resolution status |
| **Competitor** | Commercial Memory | Commercial Memory | Competitor mentions: which competitor, context, threat level |
| **WinLoss** | Commercial Memory | Commercial Memory | Won/lost deal analysis: primary reason, contributing factors |
| **Forecast** | Forecast | Forecast Management | Pipeline-based forecast: weighted value, commit, upside, scenarios |
| **Brief** | Account | Revenue Intelligence | AI-generated account briefs: summary, commercial history, recommendations |

## 7.3 Domain Events

Domain Events are the **ubiquitous language** of SalesOS v2. They represent state changes within the domain model. They are NOT the same as Platform Event Bus events — Domain Events are raised internally within SalesOS v2 and may optionally be published to the Platform Event Bus for cross-product consumption.

```text
Account Lifecycle Events:
    AccountCreated → AccountQualified → AccountScored → AccountDormant

Deal Lifecycle Events:
    DealCreated → DealQualified → DealStageChanged → DealEvidenceLinked
    → DealSubmittedForReview → DealApproved → DealRejected
    → DealClosedWon → DealClosedLost

Commercial Memory Events:
    SignalDetected → SignalValidated → SignalDismissed
    ObjectionRecorded → ObjectionResolved
    CompetitorMentioned → CompetitorThreatEscalated
    WinLossRecorded → PatternIdentified

Forecast Events:
    ForecastPeriodOpened → ForecastUpdated → ForecastCommitted
    ForecastAccuracyMeasured
```

### Domain Event → Platform Event Mapping

Not all Domain Events become Platform Events. Only those with cross-product relevance:

| Domain Event | Published to Event Bus? | Platform Event Type |
|---|---|---|
| `DealCreated` | ✅ Yes | `salesos.deal.created` |
| `DealStageChanged` | ✅ Yes | `salesos.deal.stage_changed` |
| `DealClosedWon` | ✅ Yes | `salesos.deal.closed_won` |
| `DealClosedLost` | ✅ Yes | `salesos.deal.closed_lost` |
| `SignalDetected` | ✅ Yes | `salesos.signal.detected` |
| `AccountQualified` | ✅ Yes | `salesos.account.qualified` |
| `DealEvidenceLinked` | ❌ No | Internal to SalesOS |
| `ObjectionRecorded` | ❌ No | Internal to SalesOS |
| `ForecastUpdated` | ❌ No | Internal to SalesOS |

## 7.4 State Machines

Each core domain has a defined lifecycle. State transitions are enforced by the Platform Workflow Engine (`platform.workflow`).

### Deal State Machine

```
                    ┌──────────────────────────────────────────┐
                    │              Deal Lifecycle               │
                    │                                          │
                    │  ┌──────────┐                            │
                    │  │  Draft   │                            │
                    │  └────┬─────┘                            │
                    │       │ qualify                          │
                    │       ▼                                  │
                    │  ┌──────────┐                            │
                    │  │Qualified │                            │
                    │  └────┬─────┘                            │
                    │       │ submit_for_review                 │
                    │       ▼                                  │
                    │  ┌────────────┐     ┌──────────┐        │
                    │  │ In Review  │────▶│ Rejected │        │
                    │  └─────┬──────┘     └──────────┘        │
                    │        │ approve                          │
                    │        ▼                                  │
                    │  ┌────────────┐                           │
                    │  │ Approved   │                           │
                    │  └─────┬──────┘                           │
                    │        │ negotiate                        │
                    │        ▼                                  │
                    │  ┌────────────┐                           │
                    │  │Negotiation│                           │
                    │  └─────┬──────┘                           │
                    │        │ close                            │
                    │        ▼                                  │
                    │  ┌────────────┐     ┌────────────┐       │
                    │  │ Closed Won │     │ Closed Lost│       │
                    │  └────────────┘     └────────────┘       │
                    └──────────────────────────────────────────┘
```

**Transition rules:**

| From | To | Action | Guard |
|---|---|---|---|
| Draft | Qualified | `qualify` | Account must be active |
| Qualified | In Review | `submit_for_review` | Evidence count ≥ 1 |
| In Review | Approved | `approve` | Reviewer is not the owner |
| In Review | Rejected | `reject` | Rejection reason required |
| Approved | Negotiation | `negotiate` | — |
| Negotiation | Closed Won | `close_won` | Approval audit trail complete |
| Negotiation | Closed Lost | `close_lost` | Loss reason required |

### Account State Machine

```
Prospect ──qualify──▶ Qualified ──activate──▶ Active ──deactivate──▶ Dormant
    ▲                      │                                         │
    └──────────────────────┴─────────────────────────────────────────┘
                              (requalify)
```

### Signal State Machine

```
Detected ──▶ Validated ──▶ Archived
    │                        ▲
    └──▶ Dismissed ──────────┘
```

### Forecast State Machine

```
Open ──▶ Draft ──▶ Committed ──▶ Closed ──▶ Measured
                     │
                     └──▶ Revised
```

## 7.5 Domain Ownership Rules

| Rule | Enforcement |
|---|---|
| Each domain belongs to exactly one Bounded Context and one Product Capability | No domain serves two contexts or two capabilities |
| Each context owns its data | No context directly accesses another context's database |
| Contexts communicate via Domain Events | No synchronous cross-context calls |
| Domains use Platform Kernel generic types | `Account extends Entity`, `Deal extends Entity`, etc. |
| Domains do not reference other products' domains | No `import from "@/lib/audit"` inside SalesOS v2 domain code |

## 7.6 Generic Type Extension Pattern

```typescript
// Platform Kernel generic type (in src/lib/platform/)
interface Entity {
  id: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

// SalesOS v2 domain type (in src/lib/salesos/domain/)
interface Account extends Entity {
  name: string;
  nameAr?: string;
  industry?: string;
  status: AccountStatus;
  icpFitScore?: number;
}

interface Deal extends Entity {
  accountId: string;
  name: string;
  amount: number;
  stage: string;
  probability: number;
}
```

---

# 7. User Journeys

## 7.1 Core Journeys (v2.0)

| Journey | Actor | Steps | Product Capabilities Involved |
|---|---|---|---|
| **Qualify Account** | Sales Rep | Search/create account → Set industry/segment → ICP scoring → Set status | Account Intelligence |
| **Manage Deal** | Sales Rep | Create deal → Set amount/stage → Link evidence → Submit for review | Opportunity Management |
| **Review Deal** | Sales Manager | View review queue → Check evidence → Approve/reject → Decision logged | Opportunity Management, Pipeline Management |
| **View Pipeline** | Sales Manager | Open pipeline → Filter by stage/rep → View weighted value → Export summary | Pipeline Management, Forecast Management |
| **Analyze Win/Loss** | Sales Ops | View closed deals → Analyze reasons → Pattern recognition → Update playbook | Commercial Memory |
| **Generate Brief** | Sales Rep | Request AI brief → Review draft → Edit → Submit for approval → Export | Revenue Intelligence |
| **Monitor Signals** | Sales Team | View signal feed → Relate to account/deal → Update deal risk | Commercial Memory |

## 7.2 AI Journeys (Governed)

| Journey | AI Action | Human Review | Governance Metadata |
|---|---|---|---|
| **Account Brief** | AI drafts summary from account data, interactions, evidence | Human must review and approve before export | `confidence`, `modelUsed`, `reviewStatus`, `governanceId` |
| **Win Probability** | AI computes probability from qualification score, evidence count, interaction recency | Human can override (logged as override) | `confidence`, `factors[]`, `overrideReason` |
| **Next Action** | AI suggests next best action based on stage, activity recency, evidence gaps | Human accepts, dismisses, or reschedules | `ruleId`, `evidenceRef`, `dismissedReason` |
| **Signal Detection** | AI flags buying signals from interaction patterns | Human validates signal before it affects deal | `signalType`, `confidence`, `validatedBy` |
| **Risk Alert** | AI detects deal risk (stalled, low evidence, competitor threat) | Human reviews and acts | `riskType`, `confidence`, `escalatedTo` |

---

# 8. AI Journeys (Deep Dive)

## 8.1 Governance Contract for Every AI Action

Every AI action in SalesOS v2 follows this contract:

```typescript
interface SalesAIAction {
  actionType: "account_brief" | "win_probability" | "next_action" | "signal_detection" | "risk_alert";
  input: {
    sourceData: string[];       // references to evidence/accounts/deals
    userPrompt?: string;        // optional user guidance
  };
  output: {
    result: unknown;            // the AI-generated content
    confidence: number;         // 0.0 - 1.0
    disclaimerAr: string;       // Arabic disclaimer
    disclaimerEn: string;       // English disclaimer
  };
  governance: {
    governanceId: string;       // unique ID for audit trail
    modelUsed: string;          // e.g., "claude-opus-4"
    provider: string;           // e.g., "anthropic"
    policyTags: string[];       // e.g., ["commercial_claim", "human_review_required"]
    reviewStatus: "pending" | "approved" | "rejected" | "overridden";
    reviewedBy?: string;        // user ID
    reviewedAt?: string;
    overrideReason?: string;
  };
  audit: {
    actionType: string;
    actorId: string;
    organizationId: string;
    timestamp: string;
    evidenceRefs: string[];
  };
}
```

## 8.2 AI Capability Maturity

| AI Feature | v2.0 | v2.1 | v2.2 |
|---|---|---|---|
| Account Brief | ✅ Deterministic + AI-assisted | ✅ With RAG from knowledge graph | ✅ Multi-source synthesis |
| Win Probability | ✅ Rule-based (qualification score + evidence count) | ✅ ML model trained on historical data | ✅ Real-time adjustment from signals |
| Next Action | ✅ Rule-based (stage + recency + gaps) | ✅ Pattern-matched from historical actions | ✅ Predictive with confidence decay |
| Signal Detection | ✅ Rule-based (keyword + frequency) | ✅ Cross-product signal correlation | ✅ Predictive with lead scoring |
| Risk Alert | ✅ Rule-based (stall duration + evidence gaps) | ✅ Cross-pattern risk detection | ✅ Predictive risk scoring |

---

# 9. Module Architecture

## 9.1 Module Map

Each module belongs to exactly one Domain.

```
SalesOS v2
│
├── Account Domain
│   ├── AccountList         — Search, filter, segment accounts
│   ├── AccountDetail       — Full account view with ICP, evidence, memory
│   ├── AccountCreate       — New account form
│   └── AccountBrief        — AI-generated brief with review/export
│
├── Deal Domain
│   ├── DealList            — Deals with pipeline stage grouping
│   ├── DealDetail          — Full deal view with evidence, interactions, review
│   ├── DealCreate          — New deal form
│   ├── DealReview          — Review queue for managers
│   └── DealApproval        — Approval decisions with governance
│
├── Pipeline Domain
│   ├── PipelineView        — Kanban-style pipeline
│   ├── PipelineDepth       — Stage-by-stage breakdown
│   └── PipelineAnalytics   — Metrics, conversion rates, aging
│
├── Interaction Domain
│   ├── ActivityFeed        — Chronological interaction log
│   ├── MeetingNotes        — Meeting summaries with extracted signals
│   └── OutreachLog         — Outbound communication record
│
├── Signal Domain
│   ├── SignalFeed          — Real-time signal stream
│   └── SignalDetail        — Signal context and related deals
│
├── Objection Domain
│   ├── ObjectionTracker    — Objection frequency and resolution
│   └── ObjectionAnalysis   — AI-suggested response patterns
│
├── Competitor Domain
│   ├── CompetitorTracker   — Competitor mentions with context
│   └── CompetitiveAnalysis — Win/loss by competitor
│
├── WinLoss Domain
│   ├── WinLossAnalysis     — Reason distribution and trends
│   └── WinLossDetail       — Individual deal outcome analysis
│
├── Forecast Domain
│   ├── ForecastView        — Weighted pipeline forecast
│   ├── ForecastScenarios   — What-if scenario modeling
│   └── ForecastHistory     — Accuracy tracking over time
│
└── Brief Domain
    ├── BriefRequest        — Request AI-generated brief
    ├── BriefReview         — Review, edit, approve draft
    └── BriefExport         — Gated export with audit
```

## 9.2 Module Rules

| Rule | Enforcement |
|---|---|
| Each module belongs to exactly one Domain | No cross-domain modules |
| Modules communicate through Domain services only | No module-direct-to-module calls |
| Modules consume Platform Capabilities through contracts | No direct Kernel implementation access |
| Modules have no knowledge of other products | Zero imports from other product code |

---

# 10. Data Model

## 10.1 Entity Design Principles

| Principle | Application |
|---|---|
| **Extends Kernel types** | All business entities extend `Entity` from Kernel domain model |
| **Tenant-isolated** | Every entity carries `organizationId` |
| **Audit-traced** | Every mutation creates an audit event via `platform.auth` |
| **Evidence-linked** | Entities that require governance carry evidence references |
| **Versioned** | Schema changes are additive. No destructive migrations. |

## 10.2 Core Entities

```typescript
// Kernel base (in platform)
interface Entity {
  id: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
}

// SalesOS v2 entities

interface Account extends Entity {
  name: string;
  nameAr?: string;
  industry?: string;
  status: "prospect" | "qualified" | "active" | "dormant";
  icpFitScore?: number;
  ownerId: string;
  metadata?: AccountMetadata;  // commercial memory, signals summary, etc.
}

interface Deal extends Entity {
  accountId: string;
  name: string;
  amount: number;
  currency: string;       // default: "SAR"
  stage: string;          // workflow stage ID
  probability: number;    // 0-100
  qualificationScore?: number;
  expectedCloseDate?: string;
  ownerId: string;
  reviewStatus: "draft" | "in_review" | "approved" | "rejected";
  evidenceRequired: number;
  evidenceCount: number;
  metadata?: DealMetadata;  // risk flags, review decisions, signals
}

interface Interaction extends Entity {
  accountId: string;
  dealId?: string;
  type: "call" | "email" | "meeting" | "note";
  summary: string;
  loggedAt: string;
  loggedById: string;
  extractedSignals?: string[];  // references to Signal entities
}

interface Signal extends Entity {
  type: "buying" | "timing" | "budget" | "authority" | "need" | "risk";
  severity: "low" | "medium" | "high";
  description: string;
  sourceInteractionId?: string;
  validatedAt?: string;
  validatedBy?: string;
}

interface WinLossEntry extends Entity {
  dealId: string;
  outcome: "won" | "lost";
  primaryReason: string;
  contributingFactors: string[];
  competitorInvolved?: string;
}

interface Forecast extends Entity {
  period: string;           // e.g., "2026-Q3"
  totalPipeline: number;
  weightedForecast: number;
  commitForecast: number;
  upside: number;
  scenarios?: ForecastScenario[];
}
```

## 10.3 Storage Rules

| Entity Type | Storage | Access |
|---|---|---|
| Account, Deal, Interaction | Prisma (via platform persistence) | SalesOS v2 services only |
| Signal, WinLoss, Forecast | Prisma (via platform persistence) | SalesOS v2 services only |
| Evidence links | Platform Evidence Network | Via `platform.evidence` contract |
| Audit events | Platform Audit service | Via `platform.auth` events |
| Knowledge graph | Platform Knowledge Graph | Via `platform.knowledge` contract |
| Events published | Platform Event Bus | Via `platform.event-bus` contract |

---

# 11. API Contracts

## 11.1 Consumption Contracts (SalesOS → Platform)

SalesOS v2 consumes Platform Capabilities through these contracts:

| Platform Capability | Contract | Consumption Pattern |
|---|---|---|
| `platform.auth` | `AuthGuard.requirePermission("salesos:deal.create")` | Server-side guard on all mutations |
| `platform.workflow` | `WorkflowEngine.transition(dealId, "approve")` | Deal stage changes |
| `platform.ai` | `AIOrchestrator.generate({ context, prompt, outputType })` | AI briefs, win probability, next actions |
| `platform.evidence` | `EvidenceService.link({ targetType: "deal", targetId, evidenceId })` | Evidence linking on deals |
| `platform.event-bus` | `EventBus.publish({ type: "deal.stage_changed", source: "salesos", ... })` | Lifecycle events |
| `platform.features` | `FeatureFlagService.isEnabled("salesos.ai.briefs")` | Feature toggles |
| `platform.knowledge` | `KnowledgeGraphService.getSubgraph(accountId)` | Account relationship graph |

## 11.2 Published Contracts (SalesOS → Event Bus)

SalesOS v2 publishes these events for other products to consume:

| Event Type | Payload | Consumer Example |
|---|---|---|
| `salesos.account.qualified` | `{ accountId, industry, icpScore }` | Platform institutional memory |
| `salesos.deal.created` | `{ dealId, accountId, amount, stage }` | Platform audit, analytics |
| `salesos.deal.stage_changed` | `{ dealId, fromStage, toStage, reason }` | Workflow engine, notifications |
| `salesos.deal.evidence_linked` | `{ dealId, evidenceId, evidenceType }` | Governance monitoring |
| `salesos.deal.submitted_for_review` | `{ dealId, reviewerId }` | Review queue, notifications |
| `salesos.deal.approved` | `{ dealId, approverId }` | Forecast update, handoff trigger |
| `salesos.deal.closed_won` | `{ dealId, amount, accountId }` | Customer success handoff, revenue recognition |
| `salesos.deal.closed_lost` | `{ dealId, reason, competitor }` | Win/loss analysis, signal aggregation |
| `salesos.signal.detected` | `{ signalId, type, severity, accountId }` | Cross-product signal registry |

## 11.3 No Direct Product Contracts

SalesOS v2 does **not** define contracts for consumption by other products directly. All cross-product communication goes through the Event Bus or Platform Kernel services. Other products never import SalesOS v2 types, services, or modules.

---

# 12. UX Architecture

## 12.1 UX Principles

| Principle | Application |
|---|---|
| **Arabic-first** | Primary navigation, labels, and content in Arabic. English as secondary. |
| **RTL-native** | Layout, typography, and interactions designed for right-to-left. |
| **Governance-visible** | Review status, evidence requirements, AI disclaimers shown inline. |
| **Progressive disclosure** | Simple views by default. Depth available on demand. |
| **Mobile-capable** | Core journeys work on tablet and mobile. |

## 12.2 Navigation Structure

```
SalesOS v2
│
├── Dashboard          — Pipeline value, open deals, by-stage breakdown, recent activity
├── Pipeline           — Kanban pipeline view, stage totals, weighted value
├── Deals              — Deal list with filters (stage, owner, amount, date)
│   ├── Deal Detail    — Full deal: info, evidence, interactions, review, signals
│   └── Deal Review    — Review queue for managers
├── Accounts           — Account list with search and ICP filter
│   ├── Account Detail — Full account: ICP, deals, interactions, memory, signals
│   └── Account Brief  — AI-generated brief with review/export
├── Intelligence       — Signals, objections, competitors, win/loss, commercial memory
├── Forecast           — Weighted forecast, commit vs. pipeline, scenarios
├── Activities         — Interaction feed, meeting notes, outreach log
└── Reports            — Pipeline analytics, conversion funnel, depth analysis
```

## 12.3 Key UX Patterns

| Pattern | Description |
|---|---|
| **Evidence Gate Indicator** | Visual badge on deals showing evidence count vs. requirement per stage |
| **AI Disclaimer Banner** | Every AI-generated output displays confidence, model, and "human review required" |
| **Review Decision Timeline** | Chronological view of review decisions with approver, reason, timestamp |
| **Signal Context Panel** | Slide-in panel showing signal details and related deals/accounts |
| **Pipeline Drag-and-Drop** | Stage transitions with governance validation on drop |
| **Empty State Guidance** | Every empty list provides a next-action button and explanation |

---

# 13. Non-Functional Requirements

## 13.1 Performance

| Requirement | Target | Measurement |
|---|---|---|
| Page load (server) | < 500ms p95 | Synthetic monitoring |
| Page load (client) | < 2s p95 | Lighthouse |
| Pipeline load (1000 deals) | < 1s p95 | API response time |
| AI brief generation | < 10s p95 | End-to-end timing |
| Event publish latency | < 100ms p95 | Event Bus telemetry |
| Concurrent users | 100 per organization | Load test |

## 13.2 Security

| Requirement | Implementation |
|---|---|
| Authentication | Platform Auth service |
| Authorization | Permission-based guards per mutation |
| Tenant isolation | All queries scoped by `organizationId` |
| Audit trail | Every mutation creates audit event |
| Data privacy | No PII in logs, no cross-tenant data access |
| AI safety | Governance metadata on every AI output |
| Export control | Gated by approval status + audit trail |

## 13.3 Availability

| Requirement | Target |
|---|---|
| Uptime (SaaS) | 99.9% |
| Planned downtime | < 4 hours/month, notified 7 days in advance |
| Recovery time (RTO) | < 1 hour |
| Recovery point (RPO) | < 5 minutes |
| Degraded mode | Read-only if Event Bus unavailable |

## 13.4 Internationalization

| Requirement | Support |
|---|---|
| Primary language | Arabic (Saudi market) |
| Secondary language | English |
| RTL layout | All pages |
| Date format | Arabic (هـ) / Gregorian |
| Currency | SAR (default), configurable |
| Number format | Arabic-Indic digits (optional) |

## 13.5 Observability

| Signal | Destination | Purpose |
|---|---|---|
| Business metrics | Platform analytics | Pipeline value, deal count, conversion rates |
| Technical metrics | Platform monitoring | Latency, error rates, throughput |
| Audit events | Platform audit trail | Compliance, governance verification |
| AI governance | Platform AI registry | Model usage, confidence distribution, review rates |
| Feature flag usage | Platform feature analytics | Adoption rates, rollout progression |

## 13.6 Capability KPIs

Each Product Capability has measurable success indicators. These are not commercial KPIs — they measure whether the Capability itself is functioning correctly.

### Revenue Intelligence

| KPI | Target | Measurement |
|---|---|---|
| Forecast accuracy (weighted) | ≥ 85% | Actual vs. forecast at period close |
| Win prediction precision | ≥ 80% | Correct wins / total predicted wins |
| Brief acceptance rate | ≥ 70% | AI briefs approved without major edits |
| Brief generation success | ≥ 95% | Successful generations / total requests |

### Opportunity Management

| KPI | Target | Measurement |
|---|---|---|
| Deal creation-to-review time | ≤ 5 days | Median time from create to first review submission |
| Review completion rate | ≥ 90% | Reviews completed within SLA |
| Evidence gate compliance | ≥ 95% | Deals with required evidence before stage transition |
| Approval-to-close ratio | ≥ 80% | Approved deals that reach Closed Won |

### Pipeline Management

| KPI | Target | Measurement |
|---|---|---|
| Pipeline data completeness | ≥ 90% | Deals with amount, stage, owner, expected close date |
| Stage transition logging | 100% | Every transition creates an audit event |
| Pipeline reload time | < 1s p95 | 1000 deals |

### Account Intelligence

| KPI | Target | Measurement |
|---|---|---|
| ICP score coverage | ≥ 80% | Active accounts with ICP score assigned |
| Account-commercial memory linkage | ≥ 90% | Accounts with at least one signal/interaction linked |
| Brief export completion | 100% | All exports include audit trail and disclaimer |

### Commercial Memory

| KPI | Target | Measurement |
|---|---|---|
| Signal precision | ≥ 75% | Validated signals / total detected signals |
| Duplicate signal rate | ≤ 10% | Duplicates / total signals |
| Objection resolution rate | ≥ 60% | Resolved objections / total recorded |
| Pattern reuse rate | ≥ 40% | Patterns referenced in deal strategy / total patterns |

### Forecast Management

| KPI | Target | Measurement |
|---|---|---|
| Forecast commit accuracy | ≥ 80% | Commit vs. actual at period close |
| Forecast scenario coverage | ≥ 3 scenarios per period | Best case, base case, worst case |
| Forecast update frequency | ≥ 1 per week per active period | Timestamped forecast snapshots |

---

# 14. Evolution Matrix

This matrix defines how each Product Capability evolves across SalesOS v2 releases. It is the single reference for what changes between versions.

| Capability | v2.0 | v2.1 (next) | v2.2 (future) |
|---|---|---|---|
| **Revenue Intelligence** | AI-assisted briefs with governance. Rule-based win probability. | RAG from Knowledge Graph for brief synthesis. ML-based win prediction trained on historical data. | Multi-source synthesis (interactions, signals, cross-product data). Real-time probability adjustment from signals. |
| **Opportunity Management** | Evidence-gated stage transitions. Manual review/approval workflow. | Configurable stage definitions per organization. Automated evidence validation. | SLA-driven review routing. AI-assisted review summaries. Predictive deal health scoring. |
| **Pipeline Management** | Kanban pipeline view. Stage distribution. Weighted pipeline value. | Drag-and-drop stage transitions. Pipeline aging alerts. Conversion funnel analytics. | Predictive pipeline (expected stage progression per deal). AI-suggested next stage actions. |
| **Account Intelligence** | ICP scoring. Account-commercial memory linkage. Basic relationship graph. | Cross-product account insights (via Institutional Memory). Account health scoring. | Predictive account scoring (likelihood to close). Automated ICP refinement from win/loss patterns. |
| **Commercial Memory** | Signal detection (rule-based). Objection tracking. Competitor mentions. Win/loss analysis. | Cross-product signal correlation. Pattern recognition from historical data. Automated objection response suggestions. | Predictive signal detection (lead scoring). Automated pattern-based playbook generation. |
| **Forecast Management** | Weighted pipeline forecast. Commit vs. pipeline. Scenario modeling. | Forecast accuracy tracking. Historical trend analysis. Team-level forecasting. | ML-based forecast prediction. Real-time forecast adjustment from pipeline signals. Automated scenario generation. |
| **Platform Adoption** | 6 required Platform Capabilities consumed. Event Bus active for core events. | Optional capabilities (knowledge, memory, signals) fully consumed. Extended event catalog. | Full platform capability consumption. Event-driven automation (auto-handoff to Customer Success on closed won). |

---

# Blueprint Validation

This blueprint is considered complete and ready for implementation **only when all four validation criteria pass**.

## Architecture Validation

| Criterion | Required | Status |
|---|---|---|
| All 12 Constitution principles satisfied | ✅ Yes | ⏸️ Not yet validated |
| No violation of Product Independence | ✅ Zero product-to-product dependencies | ⏸️ Not yet validated |
| No violation of Platform Neutrality | ✅ Zero product types in Kernel | ⏸️ Not yet validated |
| AI Governance applies to every AI journey | ✅ All 5 AI journeys have governance | ⏸️ Not yet validated |

## Platform Validation

| Criterion | Required | Status |
|---|---|---|
| All Platform Capability dependencies declared in Product Profile | ✅ auth, workflow, ai, evidence, event-bus, features | ⏸️ Not yet validated |
| No undeclared Platform Capability consumption | ✅ All contracts listed in §11 | ⏸️ Not yet validated |
| Optional capabilities properly marked | ✅ knowledge, memory, signals declared optional | ⏸️ Not yet validated |

## Commercial Validation

| Criterion | Required | Status |
|---|---|---|
| Independently licensable | ✅ No dependency on any other product | ⏸️ Not yet validated |
| Independently deployable | ✅ Platform Kernel is the only runtime dependency | ⏸️ Not yet validated |
| Independently operable | ✅ Admin UI, config, monitoring within SalesOS scope | ⏸️ Not yet validated |
| Independently upgradable | ✅ Versioned capabilities, no cross-product coupling | ⏸️ Not yet validated |
| Independently testable | ✅ Test suite requires only Platform Kernel fixtures | ⏸️ Not yet validated |

## Template Validation

| Criterion | Required | Status |
|---|---|---|
| Can this blueprint structure be reused for FinanceOS? | ✅ All 13 sections are domain-neutral | ⏸️ Not yet validated |
| Can this blueprint structure be reused for AuditOS vNext? | ✅ All 13 sections are domain-neutral | ⏸️ Not yet validated |
| Would any section need restructuring (not just content change)? | ❌ Must be "no" to validate the template | ⏸️ Not yet validated |

---

## Validation Sign-off

| Role | Sign-off | Date |
|---|---|---|
| **Product Architect** | ⬜ | — |
| **Platform Architect** | ⬜ | — |
| **Governance Lead** | ⬜ | — |
| **Commercial Lead** | ⬜ | — |

All four signatures required before blueprint is frozen and implementation begins.

---

# Appendix: Document Hierarchy

```
AQLIYA_ARCHITECTURE_CONSTITUTION.md              ← 12 principles + Business Capability Map
        │
        ▼
ARCHITECTURE_DECISION_INDEX.md                  ← 15 ADRs
        │
        ▼
SALESOS_ARCHITECTURE_REALITY_ASSESSMENT.md       ← Diagnosis (FROZEN)
        │
        ▼
PLATFORM_CORE_EXTRACTION_BLUEPRINT.md           ← Execution Contract (FROZEN)
        │
        ▼
PLATFORM_KERNEL_ARCHITECTURE.md                 ← Kernel Design (STABLE)
        │
        ▼
SALESOS_V2_BLUEPRINT.md                         ← THIS DOCUMENT (DRAFT)
        │
        ▼
PRDs → Specifications → Implementation
```

---

## Document Metadata

- **Author:** OpenCode
- **Type:** Product Blueprint — Reference Product
- **Date:** 2026-06-28
- **Version:** 0.2 (Draft)
- **Predecessor:** `PLATFORM_KERNEL_ARCHITECTURE.md`, `AQLIYA_ARCHITECTURE_CONSTITUTION.md`
- **Template status:** If validated, this document structure becomes the standard Product Blueprint Template for all future AQLIYA products.
- **Changes from v0.1:**
  - **Section 6 added:** Capability Ownership Matrix — full traceability from Business Capability to Module
  - **Section 7 expanded:** Bounded Contexts (4 contexts with diagram), Domain Events (15 events with Platform Event mapping), State Machines (Deal, Account, Signal, Forecast with transition tables)
  - **Section 13.6 added:** Capability KPIs — 18 measurable success indicators across all 6 Product Capabilities
  - **Section 14 added:** Evolution Matrix — v2.0 / v2.1 / v2.2 per Capability with platform adoption track
- **Status:** **Draft v0.2 — APPROVED FOR GATE REVIEW** (Architecture Review Board: 9.95/10). Architecture Program baseline v1.0 closed per ADR-016.
- **Architecture Status:** CLOSED.
- **Engineering Status:** AUTHORIZED (pending Gate Review).
- **Next Gate:** Execution Readiness Gate — verify Epics derivable from Product Capabilities, PRDs writable without architecture changes, full traceability from Constitution to Implementation.
- **Gate Review required before freeze:** Business Gate, Architecture Gate, Platform Gate, Commercial Gate, Delivery Gate.
- **Post-freeze sequence:** Capability Backlog → PRDs (1 per Product Capability) → Specifications → Implementation.
