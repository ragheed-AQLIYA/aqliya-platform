---
title: AuditOS MVP Product Requirements Document
document_id: PRD.001
status: Draft
owner: Founding Team
version: 0.1
last_updated: 2026-05-08
---

# AuditOS MVP Product Requirements Document

## 1. Purpose

This document defines the minimum viable product for AuditOS, an official AQLIYA product line focused on financial intelligence and governed audit workflows. It translates the Approved Core Doctrine v1.0 and the Doctrine-to-Execution Map into a concrete, actionable product specification for engineering implementation.

This PRD is the bridge between doctrine and code. Every requirement in this document traces to a specific doctrine principle. If a requirement contradicts doctrine, doctrine prevails.

**Golden rule:** AI assists. Humans decide. Evidence governs.

---

## 2. Product Positioning

| Position | Statement |
|----------|-----------|
| **Category** | AuditOS / Financial Intelligence product line |
| **Identity** | Governed workflow and evidence infrastructure for audit firms |
| **Powered by** | Financial Intelligence — financial data ingestion, normalization, validation, and signal extraction |
| **Is NOT** | Audit checklist software, AI chatbot, dashboard product, autonomous audit tool, CRM, generic SaaS, AI wrapper, prompt layer |
| **Architecture** | Evidence-centric workflow platform with structural governance, human-in-the-loop AI assistance, and full traceability |
| **Is NOT** | A replacement for the auditor's professional judgment. AuditOS structures the process; the auditor makes the decisions. |

---

## 3. MVP Objective

**Single outcome:** Enable an audit firm to ingest client financial data, validate it, transform it into structured evidence, create evidence-backed findings, route findings through governed reviewer workflows, publish recommendations with full traceability, and produce a defensible audit trail.

The MVP validates that:
- Financial data can be ingested and normalized into structured evidence
- AI can assist reviewers without replacing professional judgment
- Governance is structurally enforced by the workflow engine
- Every output is traceable to source data through evidence
- The audit firm's review process is faster, more consistent, and more defensible

---

## 4. Target Users

### Audit Partner

| Aspect | Detail |
|--------|--------|
| **Goals** | Firm scalability, quality control, risk reduction, regulatory confidence |
| **Pains** | Review bottlenecks, inconsistent reviewer quality, untraceable decisions, liability exposure |
| **Required workflows** | Engagement overview, firm-wide quality metrics, exception escalation, report approval |
| **Permissions** | Full access across engagements, governance configuration, partner-level approval authority |

### Audit Manager

| Aspect | Detail |
|--------|--------|
| **Goals** | Engagement throughput, staff productivity, evidence completeness, review quality |
| **Pains** | Chasing evidence, manual review assignments, inconsistent finding quality, status reporting |
| **Required workflows** | Engagement setup, staff assignment, review queue management, evidence completeness review, finding approval |
| **Permissions** | Engagement-level configuration, review assignments, manager-level approval authority |

### Reviewer / Senior Auditor

| Aspect | Detail |
|--------|--------|
| **Goals** | Efficient evidence review, clear findings, defensible recommendations, minimal administrative overhead |
| **Pains** | Switching between systems for evidence, findings, and review; untraceable review comments; repetitive manual assessment |
| **Required workflows** | Evidence review, signal assessment, finding creation, recommendation review, approval/rejection |
| **Permissions** | Engagement-level review access, evidence verification, finding creation, recommendation modification |

### Operator / Preparer

| Aspect | Detail |
|--------|--------|
| **Goals** | Data preparation, evidence collection, initial finding drafting |
| **Pains** | Manual data extraction, evidence formatting, finding format inconsistency |
| **Required workflows** | Trial balance upload, evidence upload, evidence linking, initial finding drafting |
| **Permissions** | Engagement-level data entry, evidence upload, no approval authority |

### Client-Side Finance Contact

| Aspect | Detail |
|--------|--------|
| **Goals** | Provide financial data, receive findings, understand adjustments |
| **Pains** | Unknown evidence requirements, status uncertainty, delayed feedback |
| **Required workflows** | Data submission, evidence upload, published recommendation review |
| **Permissions** | Limited engagement view, data upload only, published output view only |

### Admin

| Aspect | Detail |
|--------|--------|
| **Goals** | Tenant setup, user management, system configuration |
| **Pains** | Manual user provisioning, inconsistent permission setup |
| **Required workflows** | Organization setup, user creation, role assignment, deployment configuration |
| **Permissions** | System-level configuration, user management, no engagement-level review authority |

---

## 5. MVP Scope

### In Scope

| Capability | Priority | Description |
|------------|----------|-------------|
| Organization/client scoping | P0 | Multi-tenant organization and client entity management |
| Engagement setup | P0 | Engagement lifecycle with configurable workflow template |
| User roles / RBAC | P0 | Role-based access control enforced at data layer |
| Trial balance upload/import | P0 | CSV/XLSX trial balance ingestion with validation |
| Ledger/journal import | P1 | General ledger and journal entry import where client provides |
| Chart of accounts mapping | P0 | Account categorization and mapping to canonical financial model |
| Data validation | P0 | Trial balance completeness, structural validity, trust assessment |
| Evidence upload and linking | P0 | Document upload linked to accounts, findings, and workflow steps |
| Evidence review states | P0 | Candidate → Verified → Accepted lifecycle |
| Findings lifecycle | P0 | Draft → Review → Approval → Escalation → Published |
| Recommendations | P0 | AI-assisted drafting with human approval |
| Reviewer approval | P0 | Accept/modify/reject with attributable rationale |
| Published recommendation/report view | P1 | Client-facing view of approved recommendations |
| Audit logging | P0 | Immutable event log capturing every state transition |
| AI-assisted recommendation drafting | P0 | AI suggests findings with evidence traces; human approves |
| Traceability | P0 | From source data through evidence to finding to recommendation to approval |

### Out of Scope (MVP)

| Feature | Reason |
|---------|--------|
| Autonomous audit opinion generation | AI may not issue audit conclusions (doctrine) |
| Full statutory financial statement generator | Requires management information, supporting schedules beyond trial balance |
| Tax filing or compliance filing | Different domain; not part of AuditOS wedge |
| ERP replacement | AQLIYA is decision infrastructure, not transaction processing |
| CRM | AQLIYA is not a relationship management system |
| Generic chatbot or conversational UI | Chat is structurally incompatible with governed workflows |
| Dashboard-first analytics | Dashboards are secondary views; workflow is primary |
| Black-box anomaly scoring | All AI must be explainable and evidence-backed |
| Automatic evidence acceptance | Evidence requires human verification |
| Cross-engagement learning / pattern detection | Post-MVP organizational memory feature |
| Self-hosted deployment | Post-MVP deployment flexibility |

### Later (Post-MVP)

| Feature | Rationale |
|---------|-----------|
| Cross-engagement learning | Requires data from multiple engagements |
| Financial intelligence expansion | After AuditOS wedge is proven |
| Self-hosted / air-gapped deployment | Deployment flexibility requirement |
| Advanced analytics dashboards | Secondary views; build after workflow is solid |
| Mobile review surfaces | Reviewer productivity extension |
| Integration APIs | External system connectivity |

---

## 6. Core Workflows

### 6.1 Organization / Client Setup

| Aspect | Detail |
|--------|--------|
| **Trigger** | Admin creates a new organization (audit firm) |
| **Actors** | Admin, Partner |
| **Steps** | 1. Admin creates organization record with name, jurisdiction, regulatory framework<br>2. Admin configures default governance rules for the organization<br>3. Partner adds client entities: name, industry, fiscal period, reporting framework (IFRS/GAAP)<br>4. System creates empty engagement template for each client |
| **Data objects** | Organization, Client, Governance Rule |
| **System rules** | Each organization is a tenant with data-layer isolation. Governance rules are inheritable from organization to engagement. |
| **Outputs** | Tenant created, client records created, engagement templates initialized |
| **Acceptance criteria** | Admin can create org. Partner can add client. Client record persists. |

### 6.2 Engagement Setup

| Aspect | Detail |
|--------|--------|
| **Trigger** | Partner or Manager creates a new audit engagement for a client |
| **Actors** | Partner, Manager |
| **Steps** | 1. Select client and fiscal period<br>2. Select engagement type (full audit, review, agreed-upon procedures)<br>3. Assign engagement team: Manager, Reviewer(s), Operator(s)<br>4. Configure engagement-specific governance rules (approval thresholds, evidence requirements)<br>5. System initializes workflow template with standard phases: intake, evidence, review, findings, approval, publication |
| **Data objects** | Engagement, Engagement Team, Workflow Template |
| **System rules** | Engagement inherits org-level governance rules but may tighten them. Cannot loosen below org minimum. |
| **Outputs** | Engagement created with initialized phases and assigned team |
| **Acceptance criteria** | Engagement visible to assigned team. Workflow phases initialized. |

### 6.3 Trial Balance Intake

| Aspect | Detail |
|--------|--------|
| **Trigger** | Operator uploads trial balance file (CSV/XLSX) |
| **Actors** | Operator, System |
| **Steps** | 1. Operator selects engagement and uploads trial balance file<br>2. System parses file: extracts account codes, names, debit/credit balances, period, entity identifier<br>3. System validates file structure: required columns present, balance types recognizable<br>4. System assesses data trust: completeness, format consistency, reasonable ranges<br>5. System presents parsed data for operator review<br>6. Operator confirms or corrects parsing |
| **Data objects** | Trial Balance, Account, Trust Assessment |
| **System rules** | Trial balance must balance (total debits = total credits) before proceeding to mapping. Trust assessment produces trust state: trusted, conditionally trusted, blocked. |
| **Outputs** | Parsed trial balance with accounts, validated structure, trust state assigned |
| **Acceptance criteria** | User uploads CSV. System parses accounts. System validates structure. Trust state displayed. |

### 6.4 Chart of Accounts Mapping

| Aspect | Detail |
|--------|--------|
| **Trigger** | Trial balance intake completes successfully |
| **Actors** | Operator, System (AI assisted) |
| **Steps** | 1. System suggests account mappings based on account name, code pattern, historical mappings, and canonical financial model<br>2. Operator reviews each suggested mapping<br>3. Operator accepts, corrects, or manually maps each account<br>4. System validates mapping completeness (all accounts mapped)<br>5. System flags unmapped or ambiguous accounts for mandatory resolution |
| **Data objects** | Account Mapping, Canonical Account |
| **System rules** | All accounts must be mapped before evidence workflows proceed. AI suggestions are candidates — operator must confirm. Unmapped accounts block advancement. |
| **Outputs** | Complete account mapping from client COA to canonical financial model |
| **Acceptance criteria** | All accounts mapped. Unmapped accounts block. Mapping persists. |

### 6.5 Financial Data Validation

| Aspect | Detail |
|--------|--------|
| **Trigger** | Account mapping completes |
| **Actors** | System, Operator |
| **Steps** | 1. System validates trial balance structure: accounts balance, period consistency, classification reasonableness<br>2. System validates account relationships: assets = liabilities + equity (for mapped accounts)<br>3. System flags anomalies: unusual balances, period-over-period changes, classification mismatches<br>4. Operator reviews flags and marks as accepted, investigated, or dismissed with rationale |
| **Data objects** | Validation Result, Anomaly Flag |
| **System rules** | Validation is automated but anomaly disposition requires human action. No flag can be silently dismissed. |
| **Outputs** | Validated trial balance with resolved or documented anomaly flags |
| **Acceptance criteria** | System validates. Flags generated. Operator reviews flags. |

### 6.6 Evidence Upload

| Aspect | Detail |
|--------|--------|
| **Trigger** | Operator uploads supporting documents for an engagement |
| **Actors** | Operator, Reviewer |
| **Steps** | 1. User selects engagement and account context for the evidence<br>2. User uploads document (PDF, XLSX, image)<br>3. System records evidence with: source filename, upload timestamp, uploader identity, file hash, file type<br>4. System assigns evidence state: candidate<br>5. User links evidence to specific accounts, assertions, or findings<br>6. System records linkage with context and relationship type |
| **Data objects** | Evidence, Evidence Link |
| **System rules** | Uploaded evidence starts as candidate — not yet trusted. Evidence requires verification before it can support findings. Evidence links are typed: supports, contradicts, context. |
| **Outputs** | Candidate evidence recorded with provenance metadata and links |
| **Acceptance criteria** | User uploads file. System records with hash and provenance. Evidence linked to account. |

### 6.7 Evidence Review

| Aspect | Detail |
|--------|--------|
| **Trigger** | Reviewer begins evidence review |
| **Actors** | Reviewer, System |
| **Steps** | 1. Reviewer sees evidence queue: all candidate evidence for the engagement<br>2. Reviewer opens evidence item: views document, provenance metadata, and linked accounts<br>3. Reviewer assesses sufficiency: does this evidence support the assertion?<br>4. Reviewer marks evidence as: verified (trusted), insufficient (requires more), or rejected (not relevant)<br>5. System transitions evidence state accordingly<br>6. System records reviewer identity, verdict, rationale, and timestamp |
| **Data objects** | Evidence (state transition), Evidence Review Record |
| **System rules** | Only verified evidence may support findings. Evidence review is an attributable governance event. Rejected evidence is not deleted — it remains in the record with its rejection rationale. |
| **Outputs** | Evidence in verified, insufficient, or rejected state with attributable review record |
| **Acceptance criteria** | Reviewer can review evidence. Evidence state transitions recorded. Review attributable. |

### 6.8 Signal / Issue Detection

| Aspect | Detail |
|--------|--------|
| **Trigger** | Trial balance validated and evidence available |
| **Actors** | System (AI), Reviewer |
| **Steps** | 1. AI analyzes trial balance: identifies unusual account balances, period-over-period changes, ratio anomalies, classification issues<br>2. AI cross-references evidence: identifies accounts with insufficient or missing evidence<br>3. AI produces signals: each signal includes account context, anomaly description, supporting data, confidence level, and evidence links<br>4. Signals appear in reviewer's queue as candidates for finding creation |
| **Data objects** | Signal |
| **System rules** | Signals are AI-generated candidates — not findings. Every signal must include evidence trace or explain why evidence is absent. Signals without evidence trace are not surfaced. |
| **Outputs** | List of signals with evidence traces for reviewer triage |
| **Acceptance criteria** | AI generates signals. Each signal has evidence trace. Reviewer sees signals in queue. |

### 6.9 Finding Creation

| Aspect | Detail |
|--------|--------|
| **Trigger** | Reviewer acts on a signal (accepts or creates finding) |
| **Actors** | Reviewer, System |
| **Steps** | 1. Reviewer selects signal and creates a finding<br>2. System pre-fills finding draft with signal context, evidence links, and account references<br>3. Reviewer edits finding: refines description, adds professional assessment, adjusts evidence references<br>4. Reviewer assigns finding type: material misstatement, control deficiency, disclosure gap, observation<br>5. Reviewer sets materiality level and risk rating<br>6. System transitions finding to: draft (if AI-generated) or review-ready (if reviewer-created)<br>7. System records finding with attributable author |
| **Data objects** | Finding |
| **System rules** | AI-generated findings start as draft — must be reviewed and approved. AI cannot finalize findings. Every finding must reference at least one verified evidence item. |
| **Outputs** | Finding in draft or review-ready state with evidence references |
| **Acceptance criteria** | Reviewer creates finding from signal. Finding has evidence references. Finding state set. |

### 6.10 Recommendation Drafting

| Aspect | Detail |
|--------|--------|
| **Trigger** | Finding is in review-ready state |
| **Actors** | Reviewer, System (AI assisted) |
| **Steps** | 1. Reviewer selects a finding for recommendation drafting<br>2. AI suggests recommendation language based on finding type, evidence, and account context<br>3. Reviewer edits or replaces AI suggestion<br>4. Reviewer specifies: recommended action, impact assessment, deadline, responsible party<br>5. System transitions recommendation to: pending approval<br>6. System records recommendation with attributable author and AI contribution metadata |
| **Data objects** | Recommendation |
| **System rules** | AI-suggested recommendations are marked as AI-drafted. AI may not finalize recommendations. Every recommendation links to its source finding and evidence chain. |
| **Outputs** | Recommendation in pending approval state with linked finding and evidence |
| **Acceptance criteria** | AI suggests recommendation. Reviewer edits. Recommendation in pending approval. AI contribution tracked. |

### 6.11 Human Review and Approval

| Aspect | Detail |
|--------|--------|
| **Trigger** | Recommendation enters pending approval state |
| **Actors** | Manager, Partner |
| **Steps** | 1. Approver sees review queue: recommendations pending their approval level<br>2. Approver opens recommendation: views finding, evidence chain, and AI contribution metadata<br>3. Approver either: accepts (approves as-is), modifies (edits and approves), or rejects (with rationale)<br>4. If rejected: recommendation returns to drafting with rejection rationale<br>5. If accepted: system transitions to approved state<br>6. System records approver identity, action, rationale, and timestamp |
| **Data objects** | Approval Record |
| **System rules** | Approval is an attributable governance event. Approver must have authority level matching the recommendation's risk tier. Rejection rationale is mandatory. Approval bypass is structurally impossible — no auto-approve feature. |
| **Outputs** | Approved or rejected recommendation with attributable record |
| **Acceptance criteria** | Approver sees queue. Approver accepts/modifies/rejects. Record created. State transitions. |

### 6.12 Publication / Client View

| Aspect | Detail |
|--------|--------|
| **Trigger** | Recommendation is approved |
| **Actors** | System, Client-Side Contact |
| **Steps** | 1. System generates published recommendation record with complete evidence trace<br>2. Published recommendation becomes visible to authorized client contacts<br>3. Client contact views recommendation, supporting evidence, and finding context<br>4. Client contact may add comments or requests for clarification<br>5. Responses from client are recorded as evidence or engagement correspondence |
| **Data objects** | Published Recommendation, Client Response |
| **System rules** | Publication is irreversible — approved recommendations are immutable in their published state. Client responses are engagement correspondence, not evidence, unless verified. |
| **Outputs** | Published recommendation link shared with client |
| **Acceptance criteria** | Approved recommendation published. Client contact can view. Response mechanism works. |

### 6.13 Audit Trail and Traceability

| Aspect | Detail |
|--------|--------|
| **Trigger** | Continuous — every state transition |
| **Actors** | System |
| **Steps** | 1. Every action in every workflow generates an event<br>2. Event includes: actor identity, action type, timestamp, object ID, previous state, new state, evidence references, and context<br>3. Events are written to append-only event store<br>4. Traceability graph is updated: source data → evidence → signal → finding → recommendation → approval → publication |
| **Data objects** | Audit Event, Traceability Graph |
| **System rules** | Events are immutable. Event store is append-only. Traceability graph must support bidirectional traversal (source to output and output to source). |
| **Outputs** | Complete, immutable audit trail for every engagement |
| **Acceptance criteria** | Every action generates event. Event is immutable. Bidirectional traceability works. |

---

## 7. Data Objects

### Organization

| Aspect | Detail |
|--------|--------|
| **Purpose** | Tenant entity representing an audit firm |
| **Key fields** | id, name, jurisdiction, regulatory_framework, governance_rules, created_at, status |
| **Relationships** | Has many Users, Clients, Engagements |
| **Governance notes** | Data-layer tenant isolation. Cross-tenant access prohibited. |

### User

| Aspect | Detail |
|--------|--------|
| **Purpose** | Individual system user |
| **Key fields** | id, organization_id, name, email, role, permissions, status |
| **Relationships** | Belongs to Organization, has Role, assigned to Engagements |
| **Governance notes** | Every action attributable to a user. No anonymous actions. |

### Role

| Aspect | Detail |
|--------|--------|
| **Purpose** | Defines permission set for a user type |
| **Key fields** | id, name (ADMIN, OPERATOR, REVIEWER, MANAGER, PARTNER, VIEWER), permissions |
| **Relationships** | Assigned to Users |
| **Governance notes** | Roles determine workflow authority. A reviewer cannot approve beyond their role's authority tier. |

### Engagement

| Aspect | Detail |
|--------|--------|
| **Purpose** | Represents a single audit engagement for a client |
| **Key fields** | id, organization_id, client_id, fiscal_period, engagement_type, status, team, governance_rules, workflow_state |
| **Relationships** | Belongs to Organization and Client. Has TrialBalances, Evidences, Findings, Recommendations, AuditEvents. |
| **Governance notes** | Engagement inherits org governance but may tighten. Workflow state determines available actions. |

### Client

| Aspect | Detail |
|--------|--------|
| **Purpose** | Client entity being audited |
| **Key fields** | id, organization_id, name, industry, reporting_framework, fiscal_period_end |
| **Relationships** | Belongs to Organization. Has many Engagements. |
| **Governance notes** | Client record persists across engagements for historical continuity. |

### Trial Balance

| Aspect | Detail |
|--------|--------|
| **Purpose** | Imported trial balance for an engagement |
| **Key fields** | id, engagement_id, import_timestamp, source_file, file_hash, trust_state, parsed_data |
| **Relationships** | Belongs to Engagement. Has many Accounts. |
| **Governance notes** | Trust state (trusted, conditionally trusted, blocked) governs downstream use. Blocked trial balance prevents evidence workflows. |

### Ledger Entry

| Aspect | Detail |
|--------|--------|
| **Purpose** | General ledger entries where available |
| **Key fields** | id, engagement_id, account_id, entry_date, description, debit_amount, credit_amount, reference |
| **Relationships** | Belongs to Engagement and Account |
| **Governance notes** | P1 capability. Provides additional evidence granularity. |

### Journal Entry

| Aspect | Detail |
|--------|--------|
| **Purpose** | Individual journal entries where available |
| **Key fields** | id, engagement_id, account_id, entry_date, description, amount, journal_type, reference |
| **Relationships** | Belongs to Engagement and Account |
| **Governance notes** | P1 capability. Journal entries enable deeper anomaly detection. |

### Account

| Aspect | Detail |
|--------|--------|
| **Purpose** | Individual account in the trial balance |
| **Key fields** | id, trial_balance_id, code, name, debit_balance, credit_balance, account_type, currency |
| **Relationships** | Belongs to TrialBalance. Has AccountMapping. Has many Evidences. |
| **Governance notes** | Account is the primary unit of analysis for evidence linking and findings. |

### Account Mapping

| Aspect | Detail |
|--------|--------|
| **Purpose** | Maps client account to canonical financial model account |
| **Key fields** | id, account_id, canonical_account_id, mapping_type, mapped_by, mapped_at, ai_suggested |
| **Relationships** | Belongs to Account and CanonicalAccount |
| **Governance notes** | Mapping affects all downstream financial analysis. AI suggested mappings must be human-confirmed. |

### Evidence

| Aspect | Detail |
|--------|--------|
| **Purpose** | Supporting document or data for an account, assertion, or finding |
| **Key fields** | id, engagement_id, filename, file_hash, file_type, upload_timestamp, uploader_id, evidence_state, verified_by, verified_at |
| **Relationships** | Belongs to Engagement. Has many EvidenceLinks to Accounts and Findings. |
| **Governance notes** | Evidence state lifecycle: candidate → verified → accepted. Only verified evidence supports findings. State transitions are attributable governance events. |

### Evidence Link

| Aspect | Detail |
|--------|--------|
| **Purpose** | Connection between evidence and an account, assertion, or finding |
| **Key fields** | id, evidence_id, target_type (account, finding), target_id, link_type (supports, contradicts, context), created_by, created_at |
| **Relationships** | Joins Evidence to Accounts and Findings |
| **Governance notes** | Link type affects traceability and weight. Contradicts links are not suppressed — they are part of the complete record. |

### Signal

| Aspect | Detail |
|--------|--------|
| **Purpose** | AI-generated anomaly or issue candidate for reviewer triage |
| **Key fields** | id, engagement_id, account_id, signal_type, description, confidence, evidence_references, ai_model_version, status |
| **Relationships** | Belongs to Engagement and Account. May become Finding. |
| **Governance notes** | Signals are AI-generated — not findings. Every signal requires evidence trace or explanation. Signals without trace are not surfaced. Status: open, triaged, converted. |

### Finding

| Aspect | Detail |
|--------|--------|
| **Purpose** | A professional observation or issue identified during the audit |
| **Key fields** | id, engagement_id, finding_type, description, materiality_level, risk_rating, evidence_references, state (draft, review_ready, approved, escalated), created_by, created_at |
| **Relationships** | Belongs to Engagement. Has many EvidenceLinks. May originate from Signal. Becomes Recommendation. |
| **Governance notes** | Findings require verified evidence references. AI cannot create findings without reviewer confirmation. State transitions are governed. |

### Recommendation

| Aspect | Detail |
|--------|--------|
| **Purpose** | Recommended action based on a finding |
| **Key fields** | id, finding_id, description, recommended_action, impact_assessment, deadline, responsible_party, ai_contributed, state (draft, pending_approval, approved, rejected), created_by |
| **Relationships** | Belongs to Finding. Reviewed by Reviewer/Manager/Partner. Becomes PublishedRecommendation when approved. |
| **Governance notes** | AI-suggested content is marked with ai_contributed flag. Approval is attributable. Rejection requires rationale. |

### Review

| Aspect | Detail |
|--------|--------|
| **Purpose** | Record of a reviewer's assessment of evidence, finding, or recommendation |
| **Key fields** | id, target_type, target_id, reviewer_id, verdict (accept, modify, reject), rationale, timestamp |
| **Relationships** | Polymorphic — reviews evidence, findings, or recommendations |
| **Governance notes** | Every review is attributable. Verdict is required. Rationale required for rejections. |

### Approval

| Aspect | Detail |
|--------|--------|
| **Purpose** | Record of an approval action on a recommendation |
| **Key fields** | id, recommendation_id, approver_id, action (approved, modified, rejected), rationale, timestamp |
| **Relationships** | Belongs to Recommendation |
| **Governance notes** | Approval authority is role-gated. Rejection rationale is mandatory. Approval bypass is structurally impossible. |

### Published Recommendation

| Aspect | Detail |
|--------|--------|
| **Purpose** | Immutable, client-facing published recommendation |
| **Key fields** | id, recommendation_id, published_at, published_by, access_url, status |
| **Relationships** | Maps to Recommendation. Links to Finding and Evidence chain. |
| **Governance notes** | Published recommendations are immutable. Status governs client visibility. |

### Audit Log

| Aspect | Detail |
|--------|--------|
| **Purpose** | Immutable record of every state transition and user action |
| **Key fields** | id, event_type, actor_id, target_type, target_id, previous_state, new_state, evidence_references, timestamp, context |
| **Relationships** | Standalone — references all other object types |
| **Governance notes** | Append-only. Immutable. Bidirectional traceability enabled through event references. |

### AI Suggestion

| Aspect | Detail |
|--------|--------|
| **Purpose** | Record of an AI-generated suggestion for mapping, signal, finding, or recommendation |
| **Key fields** | id, suggestion_type, target_type, target_id, content, model_version, input_hash, confidence, accepted_by, accepted_at |
| **Relationships** | Polymorphic — associated with AccountMappings, Signals, Findings, Recommendations |
| **Governance notes** | Every AI suggestion is logged. Human acceptance or rejection is recorded. AI contribution is visible in the audit trail. |

### Decision Object

| Aspect | Detail |
|--------|--------|
| **Purpose** | The canonical decision record that connects evidence → finding → recommendation → approval → outcome |
| **Key fields** | id, engagement_id, decision_type, context, evidence_references, finding_reference, recommendation_reference, approval_reference, outcome, learning |
| **Relationships** | Central object linking all workflow stages |
| **Governance notes** | The decision object is the architectural center. Every feature exists to serve its lifecycle. |

---

## 8. Roles and Permissions

| Permission | ADMIN | PARTNER | MANAGER | REVIEWER | OPERATOR | VIEWER |
|---|---|---|---|---|---|---|
| Create organization | ✅ | — | — | — | — | — |
| Configure governance | ✅ | ✅ | — | — | — | — |
| Create client | ✅ | ✅ | ✅ | — | — | — |
| Create engagement | ✅ | ✅ | ✅ | — | — | — |
| Assign team | ✅ | ✅ | ✅ | — | — | — |
| Upload trial balance | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Upload evidence | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Review evidence | ✅ | ✅ | ✅ | ✅ | — | — |
| Verify evidence | ✅ | ✅ | ✅ | ✅ | — | — |
| Create finding | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Draft recommendation | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Approve recommendation | — | ✅ | ✅ | — | — | — |
| Approve report publication | — | ✅ | ✅ | — | — | — |
| View published output | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View audit log | ✅ | ✅ | ✅ | ✅ | — | — |
| Configure system | ✅ | — | — | — | — | — |
| Manage users | ✅ | ✅ | ✅ | — | — | — |

---

## 9. Workflow States

### Engagement States

```txt
Initialized → DataIntake → EvidenceCollection → Review → FindingsDrafting → 
Approval → Publication → Completed → Archived
```

| State | Description |
|-------|-------------|
| Initialized | Engagement created, team assigned |
| DataIntake | Trial balance uploaded, accounts mapped, data validated |
| EvidenceCollection | Evidence uploaded and being verified |
| Review | Evidence reviewed, signals generated |
| FindingsDrafting | Findings created and drafted |
| Approval | Approvals in progress |
| Publication | Recommendations published to client |
| Completed | Engagement closed for current period |
| Archived | Engagement data retained for reference |

### Evidence States

```txt
Candidate → Verified → Accepted → Referenced
```

| State | Description |
|-------|-------------|
| Candidate | Uploaded but not yet reviewed |
| Verified | Reviewer confirmed sufficiency and provenance |
| Accepted | Evidence supports a specific finding |
| Referenced | Cited in a published recommendation |

### Finding States

```txt
Draft → ReviewReady → InReview → Approved → Published → Escalated → Withdrawn
```

| State | Description |
|-------|-------------|
| Draft | Created by reviewer or AI-assisted |
| ReviewReady | Complete and submitted for review |
| InReview | Under active review by Manager/Partner |
| Approved | Review passed, ready for recommendation |
| Published | Incorporated into published output |
| Escalated | Sent to higher authority |
| Withdrawn | Retracted by author or reviewer |

### Recommendation States

```txt
Draft → PendingApproval → Approved → Rejected → Published
```

| State | Description |
|-------|-------------|
| Draft | Created by reviewer (AI-assisted or manual) |
| PendingApproval | Submitted for approver action |
| Approved | Approver accepted (as-is or modified) |
| Rejected | Approver rejected with rationale |
| Published | Made visible to client |

### Review States

```txt
Pending → InProgress → Completed
```

### Approval States

```txt
Pending → Accepted → Modified → Rejected
```

### Publication States

```txt
Unpublished → Published → Superseded
```

---

## 10. AI Boundaries

### Allowed

| Operation | Description | Constraint |
|-----------|-------------|------------|
| **Suggest account mappings** | Map client COA to canonical financial model | Must present as candidates for operator confirmation |
| **Detect anomalies** | Flag unusual balances, trends, ratios | Must include evidence trace or data reference |
| **Summarize evidence with provenance** | Generate evidence summaries for reviewer | Every statement links to source document |
| **Draft finding language** | Pre-fill finding description from signal and evidence | Must be marked as AI-drafted, require reviewer edit |
| **Draft recommendation language** | Suggest recommendation text based on finding | Must include evidence trace, require approver review |
| **Rank reviewer queues** | Prioritize items by risk, materiality, deadline | Algorithm disclosed and configurable |
| **Identify missing evidence** | Detect accounts without sufficient verified evidence | Must specify what evidence is missing and why |

### Not Allowed

| Operation | Reason | Doctrine Source |
|-----------|--------|-----------------|
| **Approve evidence** | Evidence verification is a professional judgment | 09.01 §6, 10.01 §2 |
| **Finalize finding** | Findings carry audit conclusions | 05.01 §12, 15.01 §6 |
| **Issue audit conclusion** | Conclusions require professional accountability | 15.01 §6, 05.01 §12 |
| **Bypass reviewer** | Human authority is structurally required | 07.01 §10, 10.01 §11 |
| **Sign off** | Signing carries professional liability | 05.01 §12, 15.01 §5 |
| **Autonomous professional judgment** | Professional judgment is exclusively human | 05.01 §12, 10.01 §2 |
| **Operate without evidence trace** | All governed AI must be explainable | 10.11 §2, 18.01 §5 |
| **Auto-advance workflow state** | Every state transition requires human action at decision joints | 07.01 §13, 13.01 §9 |
| **Accept evidence autonomously** | Evidence requires human verification | 04.01 §12, 09.01 §10 |

---

## 11. Governance Requirements

| # | Requirement | Enforced By | Doctrine Source |
|---|-------------|-------------|-----------------|
| G1 | No anonymous actions | Workflow engine requires authenticated actor for every state transition | 08.01 §11 |
| G2 | Every material action logged | Event sourcing captures every state transition | 02.02 §10 |
| G3 | Every recommendation linked to evidence | Recommendation references evidence objects by ID with provenance | 05.01 §11, 09.01 §5 |
| G4 | Every approval attributable | Approval record includes approver identity, action, rationale, timestamp | 08.01 §11 |
| G5 | Every AI suggestion distinguishable from human decision | AI-suggested content marked with ai_contributed flag, model version, confidence | 10.01 §10 |
| G6 | Every report-impacting finding traceable | Traceability graph links publication back through approval, recommendation, finding, evidence, to source data | 05.01 §11 |
| G7 | Every override logged with rationale | Override triggers governance event with actor, rationale, evidence references | 09.01 §11 |
| G8 | Governance changes are logged | Governance rule updates are versioned and recorded as decision events | 08.01 §11 |
| G9 | Evidence state transitions are attributable | Evidence state changes recorded with reviewer identity and timestamp | 09.01 §10 |

---

## 12. Architecture Requirements

| Component | Purpose | Doctrine Source |
|-----------|---------|-----------------|
| **Decision/Workflow Engine** | State machine with evidence gates, governance evaluators, human decision joints | 02.02 §10, 07.01 §10 |
| **Evidence Store** | Dedicated persistence for evidence objects with provenance, integrity, access control | 02.02 §10, 01.01 §10 |
| **Financial Data Ingestion** | Parse and normalize trial balance, ledger, journal data | 04.01 §5, 09.01 §9 |
| **Canonical Financial Model** | Standard chart of accounts and financial structure for mapping | 04.01 §5, 04.03 (doctrine) |
| **Account Mapping Service** | Map client COA to canonical model (AI-assisted) | 04.01 §5 |
| **Validation Engine** | Validate trial balance structure, completeness, data trust | 09.01 §10 |
| **Findings Service** | Findings lifecycle management with state transitions | 05.01 §6, 07.01 §5 |
| **Recommendation Service** | Recommendation lifecycle with AI-assistance integration | 05.01 §11, 10.01 §9 |
| **Publication Service** | Generate immutable published output from approved recommendations | 05.01 §11 |
| **Audit Log / Event Store** | Append-only, immutable event log for all state transitions | 02.02 §10, 08.01 §10 |
| **RBAC / Identity** | Role-based access control enforced at data layer | 08.01 §10, 05.01 §10 |
| **AI Assistance Layer** | AI model integration for signal detection, suggestion drafting, queue ranking | 10.01 §10, 18.01 §10 |
| **Traceability Graph** | Bidirectional linkage from source data through evidence to published output | 02.02 §10, 05.01 §11 |

---

## 13. UX Requirements

| # | Requirement | Description | Doctrine Source |
|---|-------------|-------------|-----------------|
| UX1 | Workflow-first | The primary interface is the workflow inbox — not a dashboard. User sees pending tasks, current position, and next action. | 13.04 §2 |
| UX2 | Evidence inline | Evidence is displayed within the workflow context. Reviewer never navigates to a separate repository to find supporting data. | 13.01 §13 |
| UX3 | Reviewer queue | Reviewers see prioritized review items. Queues sorted by risk, deadline, and materiality. | 05.01 §9 |
| UX4 | AI vs human distinction | AI-suggested content is visually distinct from human-confirmed content at every interaction point. | 10.01 §13 |
| UX5 | Clear governance status | Approval status, evidence completeness, governance checkpoints are visible at all times. | 08.01 §13 |
| UX6 | Approval blockers visible | When a workflow step cannot advance, the reason is displayed (missing evidence, pending approval, governance rule). | 05.01 §9, 07.01 §13 |
| UX7 | Dashboard secondary | Dashboard exists for managers/partners but is a computed view from workflow state. Not the primary interface. | 13.04 §9 |
| UX8 | High-throughput review patterns | Keyboard shortcuts, batch operations, quick-review mode for senior reviewers reviewing many items. | 13.01 §13 |
| UX9 | Override friction equal to acceptance | Accept, modify, and reject are equally accessible. No default path encourages passive acceptance. | 10.01 §13 |

---

## 14. Reporting / Output Requirements

| Requirement | Description | Priority |
|-------------|-------------|----------|
| Published recommendation page | Client-facing view of approved recommendations with full evidence trace | P1 |
| Findings summary | Engagement-level view of all findings with status, risk rating, materiality | P0 |
| Evidence trace | Navigable chain from published recommendation back to source evidence | P0 |
| Review status | Current state of every finding and recommendation in the workflow | P0 |
| Approval history | Complete record of approval actions with rationale | P1 |
| Export-ready audit package | Structured data export containing all engagement records | P2 |
| Draft financial statement support | See §15 | P2 |

---

## 15. Financial Statement Drafting Capability

This is an MVP-adjacent capability. The primary focus is evidence-backed findings and recommendations, not financial statement preparation. However, the canonical financial model and account mapping naturally enable draft statement generation.

### In Scope (P2 — Draft Generation)

| Capability | Description |
|------------|-------------|
| Draft statement of financial position | Accounts mapped to canonical model → classified into assets, liabilities, equity |
| Draft statement of profit or loss | Revenue and expense accounts classified |
| Draft notes checklist | Identify required disclosures based on account types and balances |
| Account-to-statement-line mapping | Detailed mapping showing which accounts support each statement line |
| Missing information checklist | Identify disclosures that cannot be drafted from trial balance alone |

### Constraints

| Constraint | Rationale |
|------------|-----------|
| Outputs are draft only | Financial statements require management review, supporting schedules, and professional judgment |
| Human accountant/reviewer required | Draft outputs must be reviewed and approved by a qualified professional |
| Not final signed financial statements | AuditOS does not replace the auditor's or preparer's responsibility |
| Notes require supporting schedules | Trial balance alone is insufficient for note disclosures — entity-specific information required |
| Draft status is clearly marked | Every draft statement includes: "DRAFT — NOT FINAL — Requires Professional Review" |

### Post-MVP Consideration

Full financial statement preparation with management information integration is outside the AuditOS wedge scope. It belongs to a future Financial Intelligence product expansion.

---

## 16. Acceptance Criteria

| # | Criterion | Verification Method | Priority |
|---|-----------|---------------------|----------|
| AC1 | User can create client and engagement | UI test: create client → create engagement → engagement visible | P0 |
| AC2 | User can upload/import trial balance | Upload CSV → system parses accounts → validates structure | P0 |
| AC3 | System can map accounts | Suggest mappings → operator confirms → all accounts mapped | P0 |
| AC4 | System can validate basic financial structure | Trial balance balances → accounts balance → anomalies flagged | P0 |
| AC5 | User can upload and link evidence | Upload file → link to account → evidence state = candidate | P0 |
| AC6 | Reviewer can verify evidence | Reviewer verifies → state transitions to verified | P0 |
| AC7 | AI generates signals from trial balance | Signals produced with evidence trace → visible in reviewer queue | P0 |
| AC8 | User can create finding from signal | Signal converted → finding with evidence references | P0 |
| AC9 | User can draft recommendation | Finding selected → AI suggests → reviewer edits → pending approval | P0 |
| AC10 | Reviewer can approve/reject/modify recommendation | Approver sees queue → accepts/modifies/rejects → state transitions | P0 |
| AC11 | Publication link works | Approved recommendation published → client contact can view | P1 |
| AC12 | Audit log captures actions | Every state transition generates immutable event | P0 |
| AC13 | Every output has traceability | Published recommendation traceable to evidence to source data | P0 |
| AC14 | Roles restrict actions | OPERATOR cannot approve. REVIEWER cannot publish. | P0 |
| AC15 | AI outputs are marked | AI-suggested content has visible AI indicator and model metadata | P0 |

---

## 17. Pilot Success Metrics

| Metric | Definition | Target (Pilot) |
|--------|------------|----------------|
| Review time reduction | Time from evidence collection to recommendation approval vs. manual baseline | 20% reduction |
| Evidence gap detection | Number of accounts with previously unidentified evidence gaps | >5 per engagement |
| Mapping accuracy | Percentage of account mappings accepted without correction | >85% |
| Finding trace completeness | Percentage of findings with complete evidence trace | 100% |
| Recommendation approval cycle time | Time from submission to approval | <48 hours |
| Reviewer trust score | Survey: reviewer confidence in AI suggestions (1-5) | >3.5 |
| Governance confidence | All governed transitions properly recorded and attributable | 100% |
| Reduction in manual reconstruction | Time spent reconstructing audit trail post-engagement vs. automatic | >50% reduction |

---

## 18. Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|------------|--------|------------|
| R1 | Account mapping errors lead to incorrect financial analysis | Medium | High | AI suggestions are candidates — operator must confirm. Mapping review required. |
| R2 | Weak evidence linkage reduces traceability | Medium | High | Evidence links are typed and mandatory for findings. Validation blocks incomplete links. |
| R3 | Overclaiming AI capability creates false expectations | Low | High | AI boundaries are documented, enforced, and communicated. AI outputs are clearly marked. |
| R4 | User treats draft output as final | Medium | Medium | Draft outputs clearly marked. Publication requires approval. |
| R5 | Poor trial balance quality blocks workflows | High | Medium | Trust assessment gates. User guidance for data preparation. |
| R6 | Scope creep into full audit management | Medium | Medium | MVP scope is enforced. Out-of-scope features captured for later. |
| R7 | Dashboard drift — building dashboard before workflow | Low | High | UX requirements enforce workflow-first. Dashboard is secondary. |
| R8 | Chatbot drift — adding conversational interface | Low | High | Forbidden per doctrine. Blocked at architecture level. |
| R9 | Autonomous audit risk — AI making decisions | Low | Critical | AI boundaries enforced at architecture level. Governance evaluator blocks autonomous transitions. |
| R10 | Pilot firm expects full audit management suite | Medium | Medium | Clear MVP scope communication. Pilot agreement documents scope. |

---

## 19. Open Questions

| # | Question | Decision Needed By | Owner |
|---|----------|-------------------|-------|
| 1 | What is the exact schema for the canonical financial model? | Architecture design phase | Engineering |
| 2 | Which audit standards (ISA, GAAS) are encoded in initial workflow templates? | MVP scoping | Product |
| 3 | What is the minimum governance rule set for MVP vs. production? | Implementation phase | Product + Engineering |
| 4 | How does evidence trust calibration work per engagement type? | Implementation phase | Engineering |
| 5 | What is the trial balance file size and format limit for MVP? | Engineering planning | Engineering |
| 6 | How are AI model updates handled without disrupting in-progress engagements? | Architecture design | Engineering |
| 7 | What is the pricing model for the pilot? Per-engagement, per-tenant? | Commercial planning | Product |
| 8 | What defines "pilot success" for the first 3 firms? | GTM planning | Product |
| 9 | How is client-side data submitted? Portal, SFTP, API? | MVP scoping | Product + Engineering |
| 10 | What happens when trial balance does not balance? Error or conditional acceptance? | Product decision | Product |

---

## 20. Next Documents

| Priority | Document | Purpose |
|----------|----------|---------|
| 1 | **AuditOS MVP Architecture Specification** | Detailed system architecture, component interactions, data flow, deployment model |
| 2 | **Data Model Specification** | Complete schemas, relationships, constraints for all data objects |
| 3 | **Workflow State Machine Specification** | Formal state machine definitions for all workflow states and transitions |
| 4 | **Evidence Model Specification** | Evidence schema, lifecycle, trust assessment, storage architecture |
| 5 | **AI Boundary Specification** | AI service API contracts, model metadata schema, allowed/not-allowed enforcement |
| 6 | **Pilot Implementation Plan** | Phase plan, firm selection criteria, timeline, success metrics |
| 7 | **Financial Statement Drafting Addendum** | Detailed requirements for draft statement generation capability |

---

## Summary

### MVP Scope

AuditOS MVP enables an audit firm to ingest client financial data, transform it into structured evidence, create evidence-backed findings, route them through governed reviewer workflows, publish recommendations with full traceability, and maintain a defensible audit trail.

### Key Workflows

13 core workflows from organization setup through audit trail logging, centered on the findings lifecycle (draft → review → approval → publication).

### Data Objects

18 primary data objects with complete field definitions, relationships, and governance notes, anchored by the Decision Object as the architectural center.

### Main Engineering Components

13 system components: workflow/decision engine, evidence store, financial data ingestion, canonical financial model, account mapping service, validation engine, findings service, recommendation service, publication service, audit log/event store, RBAC/identity, AI assistance layer, traceability graph.

### Recommended Next Document

**AuditOS MVP Architecture Specification** — Detailed system architecture, component interactions, data flow, and deployment model for engineering implementation.
