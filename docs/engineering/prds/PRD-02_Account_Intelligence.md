# PRD-02: Account Intelligence

> **Status:** Draft v0.1 | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** Product Requirements Document — Cycle 2, Reference PRD Template reuse.
> **Epic:** EPIC-02 (Account Intelligence)
> **Parent:** `CAPABILITY_BACKLOG.md` → `SALESOS_V2_BLUEPRINT.md` v1.0 (FROZEN)
> **Template:** Reuses PRD-01 structure. Content only replaces Deal domain with Account domain.
> **Template reuse target:** ≥95%. Deviations document if and when they occur.

---

## 1. Purpose

Account Intelligence enables relationship managers to build 360° profiles of commercial accounts — scoring their ICP fit, tracking their engagement signals, mapping stakeholder relationships, monitoring health trends, and generating AI-assisted briefing documents.

It provides the **foundational context layer** that Opportunity Management, Pipeline Management, and Revenue Intelligence all depend on.

---

## 2. Scope

### In Scope for PRD-02 v1.0

| Area | Description |
|---|---|
| Account Profile | Create, enrich, and maintain commercial account profiles |
| ICP Scoring | Compute and track Ideal Customer Profile fit scores |
| Relationship Timeline | Chronological view of all interactions and touchpoints |
| Contact Mapping | Link stakeholders to accounts with sensitivity levels |
| Health Score | Composite health metric from engagement, recency, signals |
| AI Account Brief | Governed AI-generated account summary with human review |
| Signal Tracking | Aggregate cross-product signals per account |
| Evidence Links | Compliance and profile-linked evidence |
| Audit Trail | All profile modifications audited |

### Out of Scope for v1.0

| Area | Reason | Planned |
|---|---|---|
| Full CRM sync (HubSpot/Salesforce) | Product boundary | v2.1 |
| Predictive ICP from ML | Requires training data | v2.2 |
| Org chart visualization | UX enhancement | v2.1 |

---

## 3. Business Outcomes

| Outcome | Target |
|---|---|
| Profile completeness | ≥90% of active accounts have industry, ICP score, and at least 1 contact |
| ICP score coverage | ≥80% of accounts scored |
| Brief generation success | ≥95% successful AI generation |
| Health score recency | ≥90% scored within last 30 days |
| Full audit traceability | 100% of profile mutations audited |

---

## 4. Product Capability Definition

| Field | Value |
|---|---|
| **Product Capability** | Account Intelligence |
| **Epic** | EPIC-02 |
| **Blueprint Section** | §5 (Product Capabilities), §7.2 (Account Domain), §7.4 (Account State Machine) |
| **ADR** | ADR-001, ADR-015 |
| **Constitution Principles** | 1, 2, 5, 12 |
| **KPIs (from Blueprint §13.6)** | ICP score coverage ≥80%, Account-memory linkage ≥90% |

---

## 5. Actors

| Actor | Role | Permissions Required |
|---|---|---|
| **Account Manager** | Creates and manages accounts. Requests AI briefs. Links evidence. | `salesos:account.create`, `salesos:account.update` |
| **Relationship Manager** | Views accounts, adds contacts, logs interactions. | `salesos:account.view` |
| **Sales Admin** | Configures ICP criteria, manages sensitivity levels, deletes accounts. | `salesos:account.admin` |

---

## 6. Functional Requirements

### FR-01: Create Account

| Field | Required | Type |
|---|---|---|
| `name` | ✅ | string |
| `nameAr` | ❌ | string |
| `industry` | ❌ | string |
| `ownerId` | ✅ | string |

### FR-02: Update Account

- Enrich profile fields (industry, size, region, description)
- Update ICP score trigger
- System sets `updatedById` and `updatedAt`

### FR-03: Score ICP Fit

- Compute ICP score from weighted dimensions (industry, company size, region, engagement level)
- Store score, dimensions, and compute timestamp
- Triggered on account update or manual request

### FR-04: Link Contact

- Associate stakeholder contact with account
- Set sensitivity level (standard, restricted, confidential)
- Contact is owned by ContactOS (future) — Account Intelligence links it

### FR-05: Generate AI Brief

- AI generates account summary from profile, interactions, signals
- Governance metadata on every output (confidence, model, reviewStatus)
- Human review required before export

### FR-06: List Accounts

- Filterable by industry, ICP score range, status, owner
- Paginated with default 20, max 100

### FR-07: Get Account Detail

- Full profile with contacts, signals, health score, ICP, interaction timeline, briefs, audit

---

## 7. Domain Rules

| Rule ID | Rule |
|---|---|
| DR-01 | Account must belong to exactly one Organization |
| DR-02 | Account name is required |
| DR-03 | ICP score must be between 0 and 100 |
| DR-04 | Sensitivity levels on contacts apply server-side |
| DR-05 | Archived accounts are immutable |
| DR-06 | All profile mutations are audited |
| DR-07 | Tenant isolation enforced server-side |

---

## 7.1 Domain Invariants

| ID | Invariant |
|---|---|
| DI-01 | Account name is non-empty |
| DI-02 | ICP score is 0-100 if present |
| DI-03 | Account belongs to exactly one Organization |
| DI-04 | Archived accounts are immutable |
| DI-05 | Health score is 0-100 if present |

## 7.2 Aggregate Root + Ownership Boundary

Account is the Aggregate Root. It directly owns profile, scores, and status. All other entities are referenced — the Account aggregate does not own them.

| Owned by Account Aggregate | Referenced (linked, externally owned) |
|---|---|
| Profile (name, nameAr, industry, size, region) | Contacts (owned by ContactOS / relationship manager) |
| ICP Score (value, dimensions, computedAt) | Interactions (owned by Commercial Memory) |
| Health Score (value, factors, computedAt) | AI Briefs (generated artifacts, independently versioned) |
| Status (Prospect/Active/Dormant/Archived) | Evidence Links (owned by Platform Evidence Network) |
| Metadata (tags, custom fields) | Deals (owned by Opportunity Management) |
| | Knowledge Graph (owned by Platform) |

**Rule:** Any entity outside the "Owned" column must be modified through its owning service or aggregate. The Account aggregate stores only references and summary metrics.

## 7.3 Value Object Distinctions

ICP Score and Health Score are independent Value Objects with different lifecycles:

| Value Object | Nature | Update Trigger | Computation |
|---|---|---|---|
| **ICP Score** | Semi-static | Manual request or account profile change | Weighted dimensions: industry fit, size match, region alignment |
| **Health Score** | Dynamic | Periodic (daily/weekly) or on signal | Composite of engagement recency, signal frequency, interaction depth |

**Future separation:** In v2.1+, Health Score may be computed by a dedicated Health Calculator service and published as a domain event — consumed by the Account aggregate. The aggregate stores the score but does not own the computation.

---

## 8. Workflow (Account Lifecycle)

| Stage | Description |
|---|---|
| Prospect | Newly identified, not yet qualified |
| Active | Qualified, actively managed |
| Dormant | Low engagement, auto-detected or manual |
| Archived | Soft-deleted, immutable |

**Transitions:**
- Prospect → Active (qualify)
- Active → Dormant (auto: 90 days no activity, or manual)
- Dormant → Active (re-activate)
- Any → Archived (admin only)

---

## 9. Evidence Requirements

| Evidence Type | Description |
|---|---|
| `qualification_note` | Notes on why account qualifies |
| `compliance_doc` | Regulatory or compliance document |
| `relationship_summary` | Summary of relationship history |

---

## 10. AI Touchpoints

| Feature | In PRD-02 v1.0 | Governance |
|---|---|---|
| AI Account Brief | ✅ Yes | confidence, modelUsed, reviewStatus, disclaimer AR+EN |
| ICP Score Suggestion | ❌ No (rule-based in v1.0) | ML model in v2.2 |
| Relationship Insights | ❌ No | v2.1 |

### Evolution Notes

| Capability | v1.0 | v2.1 | v2.2 |
|---|---|---|---|
| ICP Scoring | Rule-based (weighted dimensions) | Enhanced rules with industry patterns | ML-assisted from win/loss data |
| Health Score | Composite (engagement + signals) | Predictive (trend analysis) | Adaptive (segment-aware thresholds) |
| AI Brief | AI summary from profile + signals | Context-aware (RAG from Knowledge Graph) | Multi-agent synthesis |
| Relationship Graph | Links only (account ↔ contact) | Network visualization | Predictive stakeholder mapping |

---

## 11. Platform Dependencies

| Capability | Contract |
|---|---|
| `platform.auth` | AuthGuard |
| `platform.evidence` | Evidence linking |
| `platform.ai` | Governed AI generation |
| `platform.event-bus` | Account lifecycle events |
| `platform.features` | Feature flags |
| `platform.knowledge` | Relationship graph (optional, Wave 3) |

### Published Events + Ownership

| Event | Source | Consumer |
|---|---|---|
| `salesos.account.created` | Account Aggregate | Event Bus, Audit, Platform |
| `salesos.account.qualified` | Account Aggregate | Pipeline Management |
| `salesos.account.scored` | ICP Service (rule engine) | Revenue Intelligence, Commercial Memory |
| `salesos.account.dormant` | Health Calculator | Account Manager notification |
| `salesos.account.brief_generated` | AI Capability | Knowledge, Export pipeline |

---

## 12. Source of Truth per Field

| Field | Source of Truth |
|---|---|
| Account Name | Account Aggregate |
| Account Industry / Size / Region | Account Aggregate |
| ICP Score (value) | Rule Engine (consumed by Account Aggregate) |
| ICP Dimensions | Rule Engine |
| Health Score (value) | Health Calculator (consumed by Account Aggregate) |
| Health Factors | Health Calculator |
| AI Brief | AI Capability (referenced, not owned) |
| Relationship Timeline | Timeline Service (aggregates interactions + signals) |
| Evidence Links | Platform Evidence Network |

**Rule:** For any field whose Source of Truth is outside the Account Aggregate, the aggregate stores a snapshot. Updates to the source trigger domain events consumed by the aggregate — never direct cross-aggregate writes.

---

## 13. APIs
|---|---|
| `createAccountAction` | `salesos:account.create` |
| `updateAccountAction` | `salesos:account.update` |
| `scoreAccountAction` | `salesos:account.update` |
| `linkContactAction` | `salesos:account.update` |
| `requestBriefAction` | `salesos:account.view` |
| `listAccountsAction` | `salesos:account.view` |
| `getAccountAction` | `salesos:account.view` |
| `archiveAccountAction` | `salesos:account.admin` |

Error codes: same `ActionResult<T>` with FORBIDDEN, NOT_FOUND, VALIDATION_ERROR, BUSINESS_RULE_FAILED, CONFLICT.

---

## 14. Acceptance Criteria

| AC ID | Criterion |
|---|---|
| AC-01 | Account Manager creates account with required fields |
| AC-02 | Account transitions through lifecycle stages |
| AC-03 | ICP score computed and stored on request |
| AC-04 | AI brief generated with governance metadata and human review |
| AC-05 | Contact linked with sensitivity level |
| AC-06 | Profile mutations create audit events |
| AC-07 | Tenant isolation: Org A cannot see Org B accounts |
| AC-08 | Archived accounts are immutable |

---

## 15. Test Scenarios

1. **Happy Path:** Create account → Qualify → Score ICP → Link contact → Generate brief → Review → Approve → Export
2. **Lifecycle:** Active → 90 days no activity → Auto-dormant → Re-activate
3. **Governance:** AI brief flagged for review, cannot export until approved
4. **Tenant Isolation:** Cross-org access denied
5. **Audit Trail:** All mutations visible in account detail

---

## 16. Traceability

| PRD Element | Blueprint Reference | ADR | Constitution |
|---|---|---|---|
| Account lifecycle | §7.4 (State Machines) | ADR-001, ADR-015 | 1, 2 |
| Domain Events | §7.3 | ADR-001 | 2 |
| Platform Dependencies | §1 (Product Profile) | ADR-001 | 1, 5 |
| KPIs | §13.6 | ADR-015 | 12 |
| AI Governance | §8 | ADR-001 | — |

---

## Document Metadata

- **Author:** OpenCode
- **Type:** Product Requirements Document — Cycle 2
- **Date:** 2026-06-28
- **Version:** 0.2 (Draft)
- **Changes from v0.1:** Added explicit Aggregate ownership boundary table (§7.2), ICP vs Health as independent Value Objects (§7.3), Event ownership classification with source→consumer (§11), Source of Truth per field (§12), Evolution Notes per capability (§10). Section renumbering (APIs→§13, AC→§14, Tests→§15, Traceability→§16).
- **Template reuse:** PRD-01 structure. Section count: 16. Domain content: Account. Reuse rate: ~95%.
- **Status:** Draft v0.2 — ready for review. Next: freeze v1.0 → SPEC-02a.
