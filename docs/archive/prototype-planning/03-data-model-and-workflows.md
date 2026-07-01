---
title: AuditOS MVP — Data Model & Workflow Specification
document_id: DMWS.001
status: Draft
owner: Engineering
version: 0.1
last_updated: 2026-05-08
supersedes: ARCH.001 (§7, §8, §9, §23)
---

# AuditOS MVP — Data Model & Workflow Specification

## Table of Contents

1. [Part 1: Data Model](#part-1-data-model)
   - [1.1 Schema-per-Domain Map](#11-schema-per-domain-map)
   - [1.2 Entity Definitions (1–28)](#12-entity-definitions-128)
   - [1.3 Entity-Relationship Summary](#13-entity-relationship-summary)
   - [1.4 Common Patterns](#14-common-patterns)
2. [Part 2: Workflow Specification](#part-2-workflow-specification)
   - [2.1 Engagement States](#21-engagement-states)
   - [2.2 Evidence States](#22-evidence-states)
   - [2.3 Finding States](#23-finding-states)
   - [2.4 Recommendation States](#24-recommendation-states)
   - [2.5 Review States](#25-review-states)
   - [2.6 Approval States](#26-approval-states)
   - [2.7 Publication States](#27-publication-states)
   - [2.8 AI Output States](#28-ai-output-states)
3. [Part 3: Seed Data — Gulf Trading Co. FY2025](#part-3-seed-data--gulf-trading-co-fy2025)
   - [3.1 Organization & Client](#31-organization--client)
   - [3.2 Users & Roles](#32-users--roles)
   - [3.3 Engagement](#33-engagement)
   - [3.4 Canonical Accounts (IFRS for SMEs)](#34-canonical-accounts-ifrs-for-smes)
   - [3.5 Trial Balance](#35-trial-balance)
   - [3.6 Account Mappings](#36-account-mappings)
   - [3.7 Intentional Issues](#37-intentional-issues)
   - [3.8 Seed Evidence Objects](#38-seed-evidence-objects)
   - [3.9 Seed Findings & Recommendations](#39-seed-findings--recommendations)
   - [3.10 Seed Approval & Publication](#310-seed-approval--publication)

---

## Part 1: Data Model

### 1.1 Schema-per-Domain Map

| Schema | Purpose | Entities |
|--------|---------|----------|
| `identity` | Users, roles, authentication | User, Role, Permission |
| `engagement` | Engagement management | Organization, Client, Engagement, EngagementTeam, WorkflowState |
| `financial` | Financial data | TrialBalance, TrialBalanceLine, Account, FinancialPeriod |
| `canonical` | Canonical financial model | CanonicalAccount, AccountMapping |
| `validation` | Validation results | ValidationRun, ValidationIssue |
| `financial_statement` | Financial statements | FinancialStatement, FinancialStatementLine, DisclosureNote |
| `evidence` | Evidence management | EvidenceObject, EvidenceLink |
| `findings` | Findings and recommendations | Finding, Recommendation |
| `review` | Review and approval | ReviewComment, ApprovalRecord |
| `publication` | Publication | PublicationPackage |
| `events` | Audit logging | AuditEvent |
| `ai` | AI assistance | AIAssistanceRequest, AIAssistanceOutput |

### 1.2 Entity Definitions (1–28)

---

#### 1. Organization

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | PK | Primary key |
| `name` | VARCHAR(255) | Yes | Legal firm name |
| `slug` | VARCHAR(100) | Yes | URL-friendly identifier, unique |
| `jurisdiction` | VARCHAR(100) | Yes | Country of registration (e.g., "Saudi Arabia") |
| `regulatory_framework` | VARCHAR(100) | Yes | Default framework (e.g., "IFRS for SMEs") |
| `governance_rules` | JSONB | No | Org-level governance rule overrides |
| `status` | VARCHAR(50) | Yes | `active` \| `suspended` \| `inactive` |
| `created_at` | TIMESTAMPTZ | Yes | Audit field |
| `updated_at` | TIMESTAMPTZ | Yes | Audit field |
| `deleted_at` | TIMESTAMPTZ | No | Soft-delete timestamp |

**Relationships:**
- Has many `Client` (1:N)
- Has many `User` (1:N)
- Has many `Engagement` via Client (1:N)

**Constraints & Indexes:**
- PK: `id`
- Unique: `slug`
- Index: `(status)`

---

#### 2. User

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | PK | Primary key |
| `organization_id` | UUID | Yes | FK to Organization |
| `email` | VARCHAR(255) | Yes | Login email, unique within org |
| `password_hash` | VARCHAR(255) | Yes | bcrypt hash |
| `name` | VARCHAR(255) | Yes | Full name |
| `role_id` | UUID | Yes | FK to Role |
| `permissions_overrides` | JSONB | No | Individual permission grants/denials |
| `status` | VARCHAR(50) | Yes | `active` \| `invited` \| `disabled` |
| `last_login_at` | TIMESTAMPTZ | No | Last successful authentication |
| `created_at` | TIMESTAMPTZ | Yes | Audit field |
| `updated_at` | TIMESTAMPTZ | Yes | Audit field |
| `deleted_at` | TIMESTAMPTZ | No | Soft-delete timestamp |

**Relationships:**
- Belongs to `Organization` (N:1)
- Has one `Role` (N:1)
- Has many `ReviewComment` (1:N)
- Has many `ApprovalRecord` (1:N)
- Has many `EvidenceObject` as uploader (1:N)
- Has many `AuditEvent` as actor (1:N)

**Constraints & Indexes:**
- PK: `id`
- Unique: `(organization_id, email)`
- Index: `(organization_id, status)`, `(role_id)`

---

#### 3. Role / Permission

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | PK | Primary key |
| `organization_id` | UUID | Yes | FK to Organization (null for system roles) |
| `name` | VARCHAR(100) | Yes | Role name: `admin` \| `partner` \| `manager` \| `reviewer` \| `operator` \| `viewer` |
| `permissions` | JSONB | Yes | Array of permission objects |
| `is_system_role` | BOOLEAN | Yes | `true` for built-in roles, `false` for custom |
| `created_at` | TIMESTAMPTZ | Yes | Audit field |
| `updated_at` | TIMESTAMPTZ | Yes | Audit field |

**Permission object structure:**
```json
{
  "action": "evidence:verify",
  "scope": "organization",
  "constraints": {
    "risk_tier": ["low", "medium", "high"],
    "engagement_type": ["full_audit", "review"]
  }
}
```

**Predefined roles and permissions:**

| Role | Scope | Key Permissions |
|------|-------|-----------------|
| `admin` | System | All actions, system configuration |
| `partner` | Organization | All org actions, approve high/critical risk |
| `manager` | Engagement | Manage engagement, approve low/medium, review |
| `reviewer` | Engagement | Review evidence, create findings, draft recs |
| `operator` | Engagement | Upload TB, upload evidence, confirm mappings |
| `viewer` | Engagement | Read-only access |

**Relationships:**
- Belongs to `Organization` (N:1, nullable)
- Has many `User` (1:N)

**Constraints & Indexes:**
- PK: `id`
- Unique: `(organization_id, name)`

---

#### 4. Client

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | PK | Primary key |
| `organization_id` | UUID | Yes | FK to Organization |
| `name` | VARCHAR(255) | Yes | Legal entity name |
| `registration_number` | VARCHAR(100) | No | Commercial registration / CR number |
| `industry` | VARCHAR(100) | Yes | Industry sector |
| `reporting_framework` | VARCHAR(50) | Yes | `ifrs` \| `ifrs_for_smes` \| `gaap` \| `local` |
| `fiscal_period_end` | VARCHAR(5) | Yes | e.g., `12-31` (MM-DD) |
| `currency_code` | VARCHAR(3) | Yes | ISO 4217 (e.g., `SAR`, `AED`) |
| `status` | VARCHAR(50) | Yes | `active` \| `inactive` |
| `contact_email` | VARCHAR(255) | No | Client contact email |
| `contact_phone` | VARCHAR(50) | No | Client contact phone |
| `address` | TEXT | No | Registered address |
| `created_at` | TIMESTAMPTZ | Yes | Audit field |
| `updated_at` | TIMESTAMPTZ | Yes | Audit field |
| `deleted_at` | TIMESTAMPTZ | No | Soft-delete timestamp |

**Relationships:**
- Belongs to `Organization` (N:1)
- Has many `Engagement` (1:N)

**Constraints & Indexes:**
- PK: `id`
- Unique: `(organization_id, registration_number)` where registration_number not null
- Index: `(organization_id, status)`

---

#### 5. Engagement

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | PK | Primary key |
| `organization_id` | UUID | Yes | FK to Organization |
| `client_id` | UUID | Yes | FK to Client |
| `name` | VARCHAR(255) | Yes | Engagement reference name |
| `engagement_type` | VARCHAR(50) | Yes | `full_audit` \| `review` \| `agreed_upon_procedures` |
| `fiscal_period_start` | DATE | Yes | Start of financial period |
| `fiscal_period_end` | DATE | Yes | End of financial period |
| `currency_code` | VARCHAR(3) | Yes | ISO 4217 |
| `reporting_framework` | VARCHAR(50) | Yes | Override of client default |
| `status` | VARCHAR(50) | Yes | See workflow state machine |
| `workflow_state` | VARCHAR(50) | Yes | Current state in engagement SM |
| `governance_rules` | JSONB | No | Engagement-level governance overrides |
| `materiality_threshold` | DECIMAL(18,2) | No | Overall materiality in currency |
| `team_lead_id` | UUID | No | FK to User (engagement partner/manager) |
| `created_by` | UUID | Yes | FK to User |
| `version` | INTEGER | Yes | Optimistic concurrency version |
| `created_at` | TIMESTAMPTZ | Yes | Audit field |
| `updated_at` | TIMESTAMPTZ | Yes | Audit field |
| `deleted_at` | TIMESTAMPTZ | No | Soft-delete timestamp |

**Workflow states:** `draft` → `setup` → `in_progress` → `under_review` → `awaiting_client` → `ready_for_approval` → `approved` → `published` → `archived`

**Relationships:**
- Belongs to `Organization` (N:1)
- Belongs to `Client` (N:1)
- Has many `EngagementTeam` members (1:N)
- Has one `WorkflowState` (1:1)
- Has many `TrialBalance` (1:N)
- Has many `EvidenceObject` (1:N)
- Has many `Finding` (1:N)
- Has many `AuditEvent` (1:N)

**Constraints & Indexes:**
- PK: `id`
- Index: `(organization_id, status)`, `(client_id)`, `(workflow_state)`

---

#### 6. EngagementTeam

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | PK | Primary key |
| `engagement_id` | UUID | Yes | FK to Engagement |
| `user_id` | UUID | Yes | FK to User |
| `role_on_engagement` | VARCHAR(50) | Yes | `partner` \| `manager` \| `reviewer` \| `operator` \| `viewer` |
| `assigned_at` | TIMESTAMPTZ | Yes | When user was added to engagement |
| `assigned_by` | UUID | Yes | FK to User who assigned |
| `is_active` | BOOLEAN | Yes | Whether currently assigned |

**Relationships:**
- Belongs to `Engagement` (N:1)
- Belongs to `User` (N:1)

**Constraints & Indexes:**
- PK: `id`
- Unique: `(engagement_id, user_id)`
- Index: `(engagement_id, role_on_engagement)`

---

#### 7. FinancialPeriod

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | PK | Primary key |
| `engagement_id` | UUID | Yes | FK to Engagement |
| `label` | VARCHAR(100) | Yes | e.g., "FY2025", "Q1 2025" |
| `start_date` | DATE | Yes | Period start |
| `end_date` | DATE | Yes | Period end |
| `is_comparative` | BOOLEAN | No | Whether this is a prior period for comparison |
| `created_at` | TIMESTAMPTZ | Yes | Audit field |

**Relationships:**
- Belongs to `Engagement` (N:1)
- Has many `TrialBalance` (1:N)

**Constraints & Indexes:**
- PK: `id`
- Index: `(engagement_id)`

---

#### 8. TrialBalance

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | PK | Primary key |
| `engagement_id` | UUID | Yes | FK to Engagement |
| `financial_period_id` | UUID | Yes | FK to FinancialPeriod |
| `source_filename` | VARCHAR(255) | Yes | Original uploaded filename |
| `source_file_hash` | VARCHAR(64) | Yes | SHA-256 of uploaded file |
| `storage_key` | VARCHAR(500) | No | S3 object key for raw file |
| `import_timestamp` | TIMESTAMPTZ | Yes | When import completed |
| `imported_by` | UUID | Yes | FK to User |
| `trust_state` | VARCHAR(50) | Yes | `trusted` \| `conditionally_trusted` \| `blocked` |
| `total_debits` | DECIMAL(18,2) | Yes | Sum of all debit balances |
| `total_credits` | DECIMAL(18,2) | Yes | Sum of all credit balances |
| `line_count` | INTEGER | Yes | Number of account lines |
| `parsing_errors` | JSONB | No | Array of errors encountered during parse |
| `status` | VARCHAR(50) | Yes | `pending` \| `processing` \| `parsed` \| `error` |
| `created_at` | TIMESTAMPTZ | Yes | Audit field |
| `updated_at` | TIMESTAMPTZ | Yes | Audit field |

**Relationships:**
- Belongs to `Engagement` (N:1)
- Belongs to `FinancialPeriod` (N:1)
- Has many `TrialBalanceLine` (1:N)

**Constraints & Indexes:**
- PK: `id`
- Index: `(engagement_id, trust_state)`, `(source_file_hash)`

---

#### 9. TrialBalanceLine

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | PK | Primary key |
| `trial_balance_id` | UUID | Yes | FK to TrialBalance |
| `account_code` | VARCHAR(50) | Yes | Client's account code |
| `account_name` | VARCHAR(255) | Yes | Client's account name |
| `debit_amount` | DECIMAL(18,2) | No | Debit balance (null if credit) |
| `credit_amount` | DECIMAL(18,2) | No | Credit balance (null if debit) |
| `account_type` | VARCHAR(50) | No | Client's account type classification |
| `line_number` | INTEGER | Yes | Original line order |
| `created_at` | TIMESTAMPTZ | Yes | Audit field |

**Relationships:**
- Belongs to `TrialBalance` (N:1)
- Has one `Account` (1:1) — created from this line

**Constraints & Indexes:**
- PK: `id`
- Index: `(trial_balance_id)`, `(account_code)`

---

#### 10. Account

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | PK | Primary key |
| `engagement_id` | UUID | Yes | FK to Engagement |
| `trial_balance_line_id` | UUID | Yes | FK to TrialBalanceLine |
| `code` | VARCHAR(50) | Yes | Client account code |
| `name` | VARCHAR(255) | Yes | Client account name |
| `normal_balance` | VARCHAR(5) | Yes | `DR` or `CR` |
| `balance` | DECIMAL(18,2) | Yes | Signed balance (positive = DR, negative = CR) |
| `currency_code` | VARCHAR(3) | Yes | ISO 4217 |
| `account_type` | VARCHAR(50) | No | Classified type after mapping |
| `is_material` | BOOLEAN | No | Flagged during materiality assessment |
| `created_at` | TIMESTAMPTZ | Yes | Audit field |
| `updated_at` | TIMESTAMPTZ | Yes | Audit field |

**Relationships:**
- Belongs to `Engagement` (N:1)
- Belongs to `TrialBalanceLine` (1:1)
- Has one `AccountMapping` (1:1)
- Has many `EvidenceLink` (1:N)
- Has many `ValidationIssue` (1:N)

**Constraints & Indexes:**
- PK: `id`
- Unique: `(engagement_id, code)`
- Index: `(engagement_id, account_type)`, `(engagement_id, is_material)`

---

#### 11. CanonicalAccount

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | PK | Primary key |
| `code` | VARCHAR(50) | Yes | Canonical account code |
| `name` | VARCHAR(255) | Yes | Standard account name |
| `category` | VARCHAR(50) | Yes | `asset` \| `liability` \| `equity` \| `revenue` \| `expense` |
| `statement_type` | VARCHAR(50) | Yes | `sfp` (SFP) \| `pl` (P&L) \| `soce` (SOCE) \| `cf` (Cash Flow) |
| `normal_balance` | VARCHAR(5) | Yes | `DR` or `CR` |
| `level` | INTEGER | Yes | Hierarchy level (1=statement, 2=category, 3=account class) |
| `parent_code` | VARCHAR(50) | No | Parent canonical code for hierarchy |
| `reporting_framework` | VARCHAR(50) | Yes | `ifrs` \| `ifrs_for_smes` \| `gaap` |
| `framework_version` | VARCHAR(20) | Yes | e.g., `2024`, `2025` |
| `is_active` | BOOLEAN | Yes | Whether this account is in current use |
| `created_at` | TIMESTAMPTZ | Yes | Audit field |
| `updated_at` | TIMESTAMPTZ | Yes | Audit field |

**Relationships:**
- Has many `AccountMapping` (1:N)

**Constraints & Indexes:**
- PK: `id`
- Unique: `(code, reporting_framework, framework_version)`
- Index: `(category)`, `(statement_type)`

---

#### 12. AccountMapping

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | PK | Primary key |
| `account_id` | UUID | Yes | FK to Account |
| `canonical_account_id` | UUID | Yes | FK to CanonicalAccount |
| `mapping_type` | VARCHAR(50) | Yes | `ai_suggested` \| `human_mapped` \| `confirmed` |
| `ai_suggestion_id` | UUID | No | FK to AIAssistanceOutput |
| `mapped_by` | UUID | Yes | FK to User |
| `mapped_at` | TIMESTAMPTZ | Yes | When mapping was applied |
| `confidence` | DECIMAL(5,4) | No | AI confidence score (0.0000–1.0000) |
| `notes` | TEXT | No | Operator notes on mapping rationale |
| `created_at` | TIMESTAMPTZ | Yes | Audit field |
| `updated_at` | TIMESTAMPTZ | Yes | Audit field |

**Relationships:**
- Belongs to `Account` (1:1)
- Belongs to `CanonicalAccount` (N:1)
- Belongs to `AIAssistanceOutput` (N:1, optional)

**Constraints & Indexes:**
- PK: `id`
- Unique: `account_id`
- Index: `(canonical_account_id)`, `(mapping_type)`

---

#### 13. ValidationRun

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | PK | Primary key |
| `engagement_id` | UUID | Yes | FK to Engagement |
| `validation_type` | VARCHAR(50) | Yes | `structural` \| `balance_equality` \| `classification` \| `period_consistency` \| `accounting_equation` \| `ratio_analysis` \| `evidence_sufficiency` |
| `triggered_by` | UUID | Yes | FK to User (or null for system-triggered) |
| `trigger_type` | VARCHAR(50) | Yes | `manual` \| `automatic` |
| `status` | VARCHAR(50) | Yes | `running` \| `completed` \| `failed` |
| `summary` | TEXT | No | Human-readable summary |
| `results` | JSONB | Yes | Full validation result payload |
| `completed_at` | TIMESTAMPTZ | No | When validation finished |
| `created_at` | TIMESTAMPTZ | Yes | Audit field |

**Relationships:**
- Belongs to `Engagement` (N:1)
- Has many `ValidationIssue` (1:N)

**Constraints & Indexes:**
- PK: `id`
- Index: `(engagement_id, validation_type)`, `(engagement_id, status)`

---

#### 14. ValidationIssue

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | PK | Primary key |
| `validation_run_id` | UUID | Yes | FK to ValidationRun |
| `account_id` | UUID | No | FK to Account (if account-specific) |
| `check` | VARCHAR(100) | Yes | Specific check name (e.g., `balance_equality`, `classification`) |
| `status` | VARCHAR(20) | Yes | `pass` \| `fail` \| `warning` |
| `severity` | VARCHAR(20) | Yes | `info` \| `warning` \| `error` |
| `expected` | TEXT | No | Expected value |
| `actual` | TEXT | No | Actual value found |
| `message` | TEXT | Yes | Human-readable description |
| `disposition` | VARCHAR(50) | No | `open` \| `accepted` \| `waived` \| `resolved` |
| `disposed_by` | UUID | No | FK to User |
| `disposed_at` | TIMESTAMPTZ | No | When disposition was made |
| `created_at` | TIMESTAMPTZ | Yes | Audit field |

**Relationships:**
- Belongs to `ValidationRun` (N:1)
- Belongs to `Account` (N:1, optional)

**Constraints & Indexes:**
- PK: `id`
- Index: `(validation_run_id)`, `(account_id)`, `(severity)`

---

#### 15. FinancialStatement

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | PK | Primary key |
| `engagement_id` | UUID | Yes | FK to Engagement |
| `statement_type` | VARCHAR(10) | Yes | `sfp` \| `pl` \| `soce` \| `cf` |
| `label` | VARCHAR(255) | Yes | e.g., "Statement of Financial Position" |
| `as_of_date` | DATE | Yes | Date of statement |
| `currency_code` | VARCHAR(3) | Yes | ISO 4217 |
| `status` | VARCHAR(50) | Yes | `draft` \| `reviewed` \| `final` |
| `created_at` | TIMESTAMPTZ | Yes | Audit field |
| `updated_at` | TIMESTAMPTZ | Yes | Audit field |

**Relationships:**
- Belongs to `Engagement` (N:1)
- Has many `FinancialStatementLine` (1:N)

**Constraints & Indexes:**
- PK: `id`
- Index: `(engagement_id, statement_type)`

---

#### 16. FinancialStatementLine

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | PK | Primary key |
| `financial_statement_id` | UUID | Yes | FK to FinancialStatement |
| `canonical_account_id` | UUID | Yes | FK to CanonicalAccount |
| `label` | VARCHAR(255) | Yes | Display label |
| `amount` | DECIMAL(18,2) | Yes | Computed amount |
| `is_subtotal` | BOOLEAN | Yes | Whether this is a subtotal/section header |
| `sort_order` | INTEGER | Yes | Display order |
| `created_at` | TIMESTAMPTZ | Yes | Audit field |
| `updated_at` | TIMESTAMPTZ | Yes | Audit field |

**Relationships:**
- Belongs to `FinancialStatement` (N:1)
- Belongs to `CanonicalAccount` (N:1)

**Constraints & Indexes:**
- PK: `id`
- Index: `(financial_statement_id, sort_order)`

---

#### 17. DisclosureNote

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | PK | Primary key |
| `engagement_id` | UUID | Yes | FK to Engagement |
| `financial_statement_id` | UUID | No | FK to FinancialStatement (if statement-specific) |
| `canonical_account_id` | UUID | No | FK to CanonicalAccount (if account-specific) |
| `title` | VARCHAR(255) | Yes | Note title |
| `content` | TEXT | No | Note content (null until drafted) |
| `status` | VARCHAR(50) | Yes | `pending` \| `draft` \| `reviewed` \| `final` |
| `ai_draft` | TEXT | No | AI-suggested draft content |
| `drafted_by` | UUID | No | FK to User who drafted |
| `reviewed_by` | UUID | No | FK to User who reviewed |
| `created_at` | TIMESTAMPTZ | Yes | Audit field |
| `updated_at` | TIMESTAMPTZ | Yes | Audit field |

**Relationships:**
- Belongs to `Engagement` (N:1)
- Belongs to `FinancialStatement` (N:1, optional)
- Belongs to `CanonicalAccount` (N:1, optional)

**Constraints & Indexes:**
- PK: `id`
- Index: `(engagement_id, status)`

---

#### 18. EvidenceObject

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | PK | Primary key |
| `engagement_id` | UUID | Yes | FK to Engagement |
| `filename` | VARCHAR(255) | Yes | Original filename |
| `file_hash` | VARCHAR(64) | Yes | SHA-256 of file content |
| `file_type` | VARCHAR(50) | Yes | MIME type or extension |
| `storage_key` | VARCHAR(500) | Yes | S3 object key |
| `filesize_bytes` | BIGINT | Yes | File size in bytes |
| `upload_timestamp` | TIMESTAMPTZ | Yes | When upload completed |
| `uploaded_by` | UUID | Yes | FK to User |
| `evidence_type` | VARCHAR(50) | No | `supporting` \| `contradicting` \| `context` |
| `evidence_state` | VARCHAR(50) | Yes | See evidence state machine |
| `verified_by` | UUID | No | FK to User who verified |
| `verified_at` | TIMESTAMPTZ | No | When verification occurred |
| `description` | TEXT | No | Human description of evidence |
| `version` | INTEGER | Yes | Optimistic concurrency |
| `created_at` | TIMESTAMPTZ | Yes | Audit field |
| `updated_at` | TIMESTAMPTZ | Yes | Audit field |
| `deleted_at` | TIMESTAMPTZ | No | Soft-delete (evidence never physically deleted) |

**Evidence states:** `missing` → `requested` → `uploaded` → `linked` → `reviewed` → `accepted` → `rejected`

**Relationships:**
- Belongs to `Engagement` (N:1)
- Has many `EvidenceLink` (1:N)

**Constraints & Indexes:**
- PK: `id`
- Index: `(engagement_id, evidence_state)`, `(file_hash)` (for dedup)

---

#### 19. EvidenceLink

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | PK | Primary key |
| `evidence_id` | UUID | Yes | FK to EvidenceObject |
| `target_type` | VARCHAR(50) | Yes | `account` \| `finding` \| `recommendation` \| `approval` |
| `target_id` | UUID | Yes | FK to the target entity |
| `link_type` | VARCHAR(20) | Yes | `supports` \| `contradicts` \| `context` |
| `context` | TEXT | No | Optional context for the link |
| `created_by` | UUID | Yes | FK to User |
| `created_at` | TIMESTAMPTZ | Yes | Audit field |
| `deleted_at` | TIMESTAMPTZ | No | Soft-delete |

**Relationships:**
- Belongs to `EvidenceObject` (N:1)
- Polymorphic: targets `Account`, `Finding`, `Recommendation`, or `ApprovalRecord`

**Constraints & Indexes:**
- PK: `id`
- Index: `(evidence_id)`, `(target_type, target_id)`, `(link_type)`
- Unique: `(evidence_id, target_type, target_id, link_type)` for non-deleted

---

#### 20. Finding

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | PK | Primary key |
| `engagement_id` | UUID | Yes | FK to Engagement |
| `finding_type` | VARCHAR(50) | Yes | `material_misstatement` \| `control_deficiency` \| `disclosure_gap` \| `observation` |
| `title` | VARCHAR(255) | Yes | Short title |
| `description` | TEXT | Yes | Detailed description |
| `materiality_level` | VARCHAR(20) | Yes | `immaterial` \| `material` \| `pervasive` |
| `risk_rating` | VARCHAR(20) | Yes | `low` \| `medium` \| `high` \| `critical` |
| `state` | VARCHAR(50) | Yes | See finding state machine |
| `signal_id` | UUID | No | FK to AIAssistanceOutput if originated from signal |
| `created_by` | UUID | Yes | FK to User |
| `assigned_to` | UUID | No | FK to User (current owner) |
| `evidence_required` | BOOLEAN | Yes | Whether evidence is mandatory before review |
| `version` | INTEGER | Yes | Optimistic concurrency |
| `created_at` | TIMESTAMPTZ | Yes | Audit field |
| `updated_at` | TIMESTAMPTZ | Yes | Audit field |
| `deleted_at` | TIMESTAMPTZ | No | Soft-delete |

**Finding states:** `draft` → `open` → `in_review` → `accepted` → `resolved` → `dismissed`

**Relationships:**
- Belongs to `Engagement` (N:1)
- Has many `EvidenceLink` (1:N)
- Has many `Recommendation` (1:N)
- Has many `ReviewComment` (1:N)

**Constraints & Indexes:**
- PK: `id`
- Index: `(engagement_id, state)`, `(finding_type, risk_rating)`

---

#### 21. Recommendation

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | PK | Primary key |
| `finding_id` | UUID | Yes | FK to Finding |
| `engagement_id` | UUID | Yes | FK to Engagement (denormalized for query performance) |
| `title` | VARCHAR(255) | Yes | Short title |
| `description` | TEXT | Yes | Detailed description of recommendation |
| `recommended_action` | TEXT | Yes | What action should be taken |
| `impact_assessment` | TEXT | No | Expected impact of implementation |
| `deadline` | DATE | No | Recommended deadline |
| `responsible_party` | VARCHAR(255) | No | Who should implement |
| `state` | VARCHAR(50) | Yes | See recommendation state machine |
| `ai_contributed` | BOOLEAN | Yes | Was AI involved in drafting |
| `ai_suggestion_id` | UUID | No | FK to AIAssistanceOutput |
| `human_edited` | BOOLEAN | No | Was AI suggestion modified by human |
| `human_finalized` | BOOLEAN | No | Was final content authored entirely by human |
| `model_version` | VARCHAR(50) | No | AI model version if AI-contributed |
| `created_by` | UUID | Yes | FK to User |
| `version` | INTEGER | Yes | Optimistic concurrency |
| `created_at` | TIMESTAMPTZ | Yes | Audit field |
| `updated_at` | TIMESTAMPTZ | Yes | Audit field |
| `deleted_at` | TIMESTAMPTZ | No | Soft-delete |

**Recommendation states:** `suggested` → `under_review` → `accepted` → `rejected` → `implemented`

**Relationships:**
- Belongs to `Finding` (N:1)
- Belongs to `Engagement` (N:1)
- Has many `EvidenceLink` (1:N)
- Has many `ApprovalRecord` (1:N)
- Has many `ReviewComment` (1:N)

**Constraints & Indexes:**
- PK: `id`
- Index: `(engagement_id, state)`, `(finding_id)`

---

#### 22. ReviewComment

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | PK | Primary key |
| `engagement_id` | UUID | Yes | FK to Engagement |
| `target_type` | VARCHAR(50) | Yes | `finding` \| `recommendation` \| `evidence` \| `disclosure_note` |
| `target_id` | UUID | Yes | FK to target entity |
| `parent_comment_id` | UUID | No | For threaded replies |
| `author_id` | UUID | Yes | FK to User |
| `body` | TEXT | Yes | Comment text |
| `resolution_status` | VARCHAR(50) | Yes | `open` \| `resolved` \| `acknowledged` |
| `resolved_by` | UUID | No | FK to User who resolved |
| `resolved_at` | TIMESTAMPTZ | No | When resolved |
| `created_at` | TIMESTAMPTZ | Yes | Audit field |
| `updated_at` | TIMESTAMPTZ | Yes | Audit field |
| `deleted_at` | TIMESTAMPTZ | No | Soft-delete |

**Relationships:**
- Belongs to `Engagement` (N:1)
- Polymorphic target
- Has many replies via `parent_comment_id`

**Constraints & Indexes:**
- PK: `id`
- Index: `(target_type, target_id)`, `(engagement_id, resolution_status)`

---

#### 23. ApprovalRecord

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | PK | Primary key |
| `recommendation_id` | UUID | Yes | FK to Recommendation |
| `engagement_id` | UUID | Yes | FK to Engagement (denormalized) |
| `approver_id` | UUID | Yes | FK to User |
| `action` | VARCHAR(20) | Yes | `approve` \| `approve_with_modifications` \| `reject` |
| `rationale` | TEXT | Yes | Approver's rationale (min 20 chars for reject) |
| `modified_content` | JSONB | No | Snapshot of content if modified |
| `evidence_refs` | UUID[] | No | Evidence IDs referenced in approval |
| `risk_tier_at_time` | VARCHAR(20) | Yes | Risk tier of recommendation at approval time |
| `created_at` | TIMESTAMPTZ | Yes | Audit field |

**Relationships:**
- Belongs to `Recommendation` (N:1)
- Belongs to `User` (approver) (N:1)

**Constraints & Indexes:**
- PK: `id`
- Index: `(recommendation_id)`, `(approver_id)`

---

#### 24. PublicationPackage

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | PK | Primary key |
| `engagement_id` | UUID | Yes | FK to Engagement |
| `recommendation_id` | UUID | Yes | FK to Recommendation |
| `status` | VARCHAR(50) | Yes | `draft` \| `ready` \| `published` \| `locked` |
| `published_at` | TIMESTAMPTZ | No | When published |
| `published_by` | UUID | No | FK to User who published |
| `content_snapshot` | JSONB | Yes | Immutable snapshot of recommendation + evidence trace |
| `evidence_trace` | JSONB | Yes | Frozen evidence references at time of publication |
| `client_access_url` | VARCHAR(500) | No | Unique access URL for client |
| `client_visible` | BOOLEAN | Yes | Whether client can view |
| `superseded_by_id` | UUID | No | FK to PublicationPackage that supersedes this |
| `version` | INTEGER | Yes | Optimistic concurrency |
| `created_at` | TIMESTAMPTZ | Yes | Audit field |
| `updated_at` | TIMESTAMPTZ | Yes | Audit field |
| `deleted_at` | TIMESTAMPTZ | No | Soft-delete (never physically deleted) |

**Relationships:**
- Belongs to `Engagement` (N:1)
- Belongs to `Recommendation` (1:1)
- May be superseded by another `PublicationPackage` (1:1)

**Constraints & Indexes:**
- PK: `id`
- Unique: `recommendation_id` (one publication per recommendation)
- Index: `(engagement_id, status)`

---

#### 25. AuditEvent

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | PK | Primary key |
| `event_type` | VARCHAR(100) | Yes | e.g., `finding.state_transition`, `evidence.uploaded` |
| `actor_id` | UUID | Yes | FK to User |
| `actor_type` | VARCHAR(20) | Yes | `human` \| `system` \| `ai` |
| `tenant_id` | UUID | Yes | Organization ID for scoping |
| `target_type` | VARCHAR(50) | Yes | Entity type |
| `target_id` | UUID | Yes | Entity ID |
| `previous_state` | VARCHAR(50) | No | Previous state (null for creation) |
| `new_state` | VARCHAR(50) | Yes | New state after transition |
| `evidence_refs` | UUID[] | No | Evidence UUIDs referenced |
| `metadata` | JSONB | No | Freeform contextual data |
| `timestamp` | TIMESTAMPTZ | Yes | When event occurred |
| `sequence` | BIGINT | Yes | Monotonically increasing per-tenant |
| `event_hash` | VARCHAR(64) | Yes | SHA-256 of all preceding fields |
| `previous_event_hash` | VARCHAR(64) | No | Hash of previous event in chain |

**Relationships:**
- Belongs to `Organization` via `tenant_id` (N:1)
- Belongs to `User` via `actor_id` (N:1)

**Constraints & Indexes:**
- PK: `id`
- Index: `(tenant_id, event_type, timestamp)`, `(target_type, target_id)`, `(actor_id)`
- Unique: `(tenant_id, sequence)` — no gaps, no duplicates
- Constraint: Table is INSERT-only; no UPDATE or DELETE permitted

---

#### 26. AIAssistanceRequest

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | PK | Primary key |
| `engagement_id` | UUID | Yes | FK to Engagement |
| `request_type` | VARCHAR(50) | Yes | `suggest_mappings` \| `generate_signals` \| `draft_finding` \| `draft_recommendation` \| `summarize_evidence` \| `rank_queue` |
| `requested_by` | UUID | Yes | FK to User |
| `input_context` | JSONB | Yes | Input data sent to AI |
| `input_hash` | VARCHAR(64) | Yes | SHA-256 hash of input context |
| `status` | VARCHAR(50) | Yes | `pending` \| `processing` \| `completed` \| `failed` |
| `error_message` | TEXT | No | Error details if failed |
| `created_at` | TIMESTAMPTZ | Yes | Audit field |
| `completed_at` | TIMESTAMPTZ | No | When AI completed processing |

**Relationships:**
- Belongs to `Engagement` (N:1)
- Has many `AIAssistanceOutput` (1:N)

**Constraints & Indexes:**
- PK: `id`
- Index: `(engagement_id, request_type)`, `(status)`

---

#### 27. AIAssistanceOutput

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | PK | Primary key |
| `request_id` | UUID | Yes | FK to AIAssistanceRequest |
| `output_type` | VARCHAR(50) | Yes | Same enum as request_type |
| `content` | JSONB | Yes | AI-generated content |
| `model_version` | VARCHAR(100) | Yes | Model identifier |
| `confidence` | DECIMAL(5,4) | No | Confidence score 0.0000–1.0000 |
| `acceptance_status` | VARCHAR(50) | Yes | `suggested` \| `accepted_by_human` \| `rejected_by_human` \| `superseded` |
| `accepted_by` | UUID | No | FK to User who accepted |
| `accepted_at` | TIMESTAMPTZ | No | When accepted |
| `rejected_by` | UUID | No | FK to User who rejected |
| `rejected_at` | TIMESTAMPTZ | No | When rejected |
| `rejection_reason` | TEXT | No | Why human rejected |
| `superseded_by_id` | UUID | No | FK to AIAssistanceOutput that supersedes |
| `human_modified` | BOOLEAN | No | Whether content was edited by human before use |
| `latency_ms` | INTEGER | No | AI generation time |
| `created_at` | TIMESTAMPTZ | Yes | Audit field |

**Relationships:**
- Belongs to `AIAssistanceRequest` (N:1)
- May be superseded by another `AIAssistanceOutput`

**Constraints & Indexes:**
- PK: `id`
- Index: `(request_id)`, `(acceptance_status)`

---

#### 28. WorkflowState

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | PK | Primary key |
| `engagement_id` | UUID | Yes | FK to Engagement (1:1) |
| `current_state` | VARCHAR(50) | Yes | Current engagement state |
| `previous_state` | VARCHAR(50) | No | Previous engagement state |
| `blocking_conditions` | JSONB | No | Array of blocking conditions with details |
| `governance_rule_snapshot` | JSONB | No | Rules active at this state |
| `context` | JSONB | No | Additional state context data |
| `entered_at` | TIMESTAMPTZ | Yes | When this state was entered |
| `last_transition_at` | TIMESTAMPTZ | No | When last transition occurred |
| `created_at` | TIMESTAMPTZ | Yes | Audit field |
| `updated_at` | TIMESTAMPTZ | Yes | Audit field |

**Relationships:**
- Belongs to `Engagement` (1:1)

**Constraints & Indexes:**
- PK: `id`
- Unique: `engagement_id`

---

### 1.3 Entity-Relationship Summary

```
Organization 1─N Client 1─N Engagement
Engagement 1─N EngagementTeam
Engagement 1─1 WorkflowState
Engagement 1─N FinancialPeriod
Engagement 1─N TrialBalance
Engagement 1─N Account
Engagement 1─N EvidenceObject
Engagement 1─N Finding
Engagement 1─N Recommendation
Engagement 1─N FinancialStatement
Engagement 1─N DisclosureNote
Engagement 1─N ReviewComment
Engagement 1─N AuditEvent
Engagement 1─N AIAssistanceRequest

FinancialPeriod 1─N TrialBalance
TrialBalance 1─N TrialBalanceLine
TrialBalanceLine 1─1 Account

Account 1─1 AccountMapping
Account 1─N EvidenceLink (via target)
Account 1─N ValidationIssue
CanonicalAccount 1─N AccountMapping
CanonicalAccount 1─N FinancialStatementLine

EvidenceObject 1─N EvidenceLink
EvidenceLink N─1 Finding (via target)
EvidenceLink N─1 Recommendation (via target)

Finding 1─N Recommendation
Finding 1─N ReviewComment (via target)
Recommendation 1─N ApprovalRecord
Recommendation 1─N ReviewComment (via target)
Recommendation 1─1 PublicationPackage

User 1─N EvidenceObject (as uploader)
User 1─N ApprovalRecord (as approver)
User 1─N ReviewComment (as author)
User 1─N AuditEvent (as actor)

AIAssistanceRequest 1─N AIAssistanceOutput
Organization 1─N User
Role 1─N User
```

### 1.4 Common Patterns

| Pattern | Implementation |
|---------|---------------|
| Tenant isolation | Every tenant-scoped table has `organization_id` or reaches it via `engagement_id → client_id → organization_id` |
| Soft delete | `deleted_at TIMESTAMPTZ` on governed entities; no physical DELETE |
| Optimistic concurrency | `version INTEGER` on mutable entities; CAS pattern: `UPDATE ... WHERE id = ? AND version = ?` |
| UUID PKs | All primary keys are `UUID`; no auto-increment exposed externally |
| Audit timestamps | `created_at`, `updated_at` on every mutable table |
| JSONB for flexibility | AI payloads, validation results, governance rules use `JSONB` |
| Polymorphic links | `EvidenceLink` and `ReviewComment` use `(target_type, target_id)` pattern |

---

## Part 2: Workflow Specification

### 2.1 Engagement States

```
┌──────────┐
│  Draft   │  ← Engagement created, team not yet assigned
└────┬─────┘
     │ Team assigned, governance configured
     ▼
┌──────────┐
│  Setup   │  ← TB upload, mapping, validation in progress
└────┬─────┘
     │ All accounts mapped, validation passed, trust_state != blocked
     ▼
┌──────────────┐
│ In Progress  │  ← Evidence upload, linking, signal generation
└──────┬───────┘
       │ Evidence collected for material accounts
       ▼
┌──────────────┐
│ Under Review │  ← Findings created, recommendations drafted, review active
└──────┬───────┘
       │ Client input needed
       ├─────────────────────────────┐
       ▼                             ▼
┌──────────────────┐        ┌──────────────────┐
│ Awaiting Client  │ ────── │ Under Review     │  ← Client responds, returns to review
└──────┬───────────┘        └──────────────────┘
       │ Review complete, all findings resolved
       ▼
┌────────────────────┐
│ Ready for Approval │  ← Recommendations ready, approval queue populated
└──────┬─────────────┘
       │ All recommendations approved
       ▼
┌──────────┐
│ Approved │  ← All approvals collected
└────┬─────┘
     │ Published output generated
     ▼
┌───────────┐
│ Published │  ← Immutable, client accessible
└─────┬─────┘
      │ Engagement closed
      ▼
┌──────────┐
│ Archived  │  ← Read-only, data retained
└──────────┘
```

#### Valid Transitions

| From | To | Trigger | Guard Conditions | Blocking Conditions | Required Audit Event |
|------|----|---------|------------------|---------------------|---------------------|
| Draft | Setup | Human action | Team assigned (≥1 member), governance rules configured | Missing team members, missing governance rules | `engagement.transition.setup` |
| Setup | In Progress | System (automated gate) | All accounts mapped, TB balanced, trust_state != `blocked`, all critical validations passed | Unmapped accounts, unbalanced TB, blocked trust state | `engagement.transition.in_progress` |
| In Progress | Under Review | Human action | All material accounts have verified evidence, evidence uploaded for required accounts | Missing evidence for material accounts | `engagement.transition.under_review` |
| Under Review | Awaiting Client | Human action | Client input needed flag set, specific query documented | No unresolved review comments on blocking items | `engagement.transition.awaiting_client` |
| Awaiting Client | Under Review | Human action | Client response received | None | `engagement.transition.under_review` |
| Under Review | Ready for Approval | Human action | All findings in `accepted` or `resolved` state, ≥1 recommendation in `accepted` state, no open blocking review comments | Open critical findings, unaddressed review comments | `engagement.transition.ready_for_approval` |
| Ready for Approval | Approved | Human action | All recommendations approved, approval authority tiers satisfied | Unapproved recommendations, insufficient approval authority | `engagement.transition.approved` |
| Approved | Published | System | Publication package generated, client access configured | Publication generation failure | `engagement.transition.published` |
| Published | Archived | Human action | No pending client actions | None | `engagement.transition.archived` |
| Any | Draft | Human action | Authorization check (partner/admin), rationale captured | None | `engagement.transition.returned_to_draft` |

---

### 2.2 Evidence States

```
┌──────────┐
│ Missing  │  ← Evidence gap identified, not yet requested
└────┬─────┘
     │ Evidence requested from client/team
     ▼
┌───────────┐
│ Requested │  ← Awaiting upload
└────┬──────┘
     │ File uploaded
     ▼
┌──────────┐
│ Uploaded │  ← File received, hashed, stored; not yet linked
└────┬─────┘
     │ Linked to an account, finding, or recommendation
     ▼
┌──────────┐
│  Linked  │  ← Associated with at least one entity via EvidenceLink
└────┬─────┘
     │ Reviewer assesses sufficiency
     ▼
┌──────────┐
│ Reviewed │  ← Reviewer has examined and documented assessment
└────┬─────┘
     │
 ┌───┴────┐
 │        │
▼         ▼
┌────────┐ ┌──────────┐
│Accepted│ │ Rejected │  ← Rejected with rationale
└───┬────┘ └──────────┘
    │ Evidence cited in published output
    ▼
┌───────────┐
│ Referenced│  ← Immutable terminal state
└───────────┘
```

#### Valid Transitions

| From | To | Trigger | Guard Conditions | Blocking Conditions | Required Audit Event |
|------|----|---------|------------------|---------------------|---------------------|
| Missing | Requested | Human action | Evidence gap documented, request sent to client/team | None | `evidence.state_transition.requested` |
| Requested | Uploaded | Human action | File uploaded successfully, SHA-256 hash computed, file type whitelisted, size < 50MB | File type rejection, hash mismatch | `evidence.state_transition.uploaded` |
| Uploaded | Linked | System/Human | ≥1 EvidenceLink created to account/finding/rec | No links created | `evidence.state_transition.linked` |
| Linked | Reviewed | Human action | Reviewer has examined evidence, notes recorded | None | `evidence.state_transition.reviewed` |
| Reviewed | Accepted | Human action | Reviewer verdict: sufficient | Missing reviewer rationale | `evidence.state_transition.accepted` |
| Reviewed | Rejected | Human action | Reviewer verdict: insufficient, rationale required (min 20 chars) | Rationale too short | `evidence.state_transition.rejected` |
| Accepted | Referenced | System | Evidence referenced in a published recommendation | Not published yet | `evidence.state_transition.referenced` |
| Rejected | Requested | Human action | New evidence file uploaded (replaces rejected) | None | `evidence.state_transition.requested` |

---

### 2.3 Finding States

```
┌──────────┐
│  Draft   │  ← Created by reviewer or AI-assisted
└────┬─────┘
     │ Opened for work
     ▼
┌──────────┐
│   Open   │  ← Assigned to owner, evidence being collected
└────┬─────┘
     │ Submitted for review
     ▼
┌───────────┐
│ In Review │  ← Under reviewer assessment
└────┬─────┘
     │
 ┌───┴────┐
 │        │
▼         ▼
┌────────┐ ┌───────────┐
│Accepted│ │ Dismissed │  ← Dismissed with rationale (false positive, not applicable)
└───┬────┘ └───────────┘
    │ Corrective action completed
    ▼
┌──────────┐
│ Resolved │  ← Terminal: action taken
└──────────┘
```

#### Valid Transitions

| From | To | Trigger | Guard Conditions | Blocking Conditions | Required Audit Event |
|------|----|---------|------------------|---------------------|---------------------|
| Draft | Open | Human action | Finding has title, description, finding_type, risk_rating | Missing required fields | `finding.state_transition.open` |
| Open | In Review | Human action | ≥1 evidence link exists (if evidence_required=true), finding is complete | Missing evidence (if required) | `finding.state_transition.in_review` |
| In Review | Accepted | Human action | Reviewer verdict: accepted, rationale provided | None | `finding.state_transition.accepted` |
| In Review | Dismissed | Human action | Reviewer verdict: dismissed, rationale required (min 20 chars) | Rationale too short | `finding.state_transition.dismissed` |
| Accepted | Resolved | Human action | Remediation action documented, responsible party assigned | No action plan documented | `finding.state_transition.resolved` |
| Open | Draft | Human action | Author returns to draft for revision | None | `finding.state_transition.draft` |
| In Review | Open | Human action | Reviewer returns for more evidence/work | None | `finding.state_transition.open` |
| Dismissed | Open | Human action | New evidence warrants reopening | None | `finding.state_transition.open` |

**Guard: Evidence requirement**
- Transition `Open → In Review` checks: if `finding.evidence_required = true`, then `COUNT(evidence_links WHERE target_id = finding.id) >= 1 AND at least one linked evidence.state IN ('accepted', 'reviewed')`.

---

### 2.4 Recommendation States

```
┌───────────┐
│ Suggested │  ← Created (AI-assisted or manual), not yet formally submitted
└─────┬─────┘
      │ Submitted for review
      ▼
┌────────────┐
│ Under Review │  ← Being assessed by reviewer
└─────┬──────┘
      │
  ┌───┴────┐
  │        │
  ▼        ▼
┌────────┐ ┌──────────┐
│Accepted│ │ Rejected │  ← Rejected with rationale
└───┬────┘ └──────────┘
    │ Implementation confirmed
    ▼
┌────────────┐
│ Implemented │  ← Terminal: action completed
└────────────┘
```

#### Valid Transitions

| From | To | Trigger | Guard Conditions | Blocking Conditions | Required Audit Event |
|------|----|---------|------------------|---------------------|---------------------|
| Suggested | Under Review | Human action | Recommendation has title, description, recommended_action | Missing required fields | `recommendation.state_transition.under_review` |
| Under Review | Accepted | Human action | Reviewer verdict: accepted, evidence trace present | No evidence links | `recommendation.state_transition.accepted` |
| Under Review | Rejected | Human action | Rationale required (min 20 chars) | Rationale too short | `recommendation.state_transition.rejected` |
| Accepted | Implemented | Human action | Implementation evidence uploaded, confirmation by responsible party | No implementation evidence | `recommendation.state_transition.implemented` |
| Under Review | Suggested | Human action | Returned for revision | None | `recommendation.state_transition.suggested` |
| Rejected | Suggested | Human action | New evidence or revised approach warrants re-draft | None | `recommendation.state_transition.suggested` |

---

### 2.5 Review States

Applied polymorphically to Evidence, Findings, and Recommendations via `ReviewComment`.

```
┌─────────────┐
│ Not Started │  ← Item exists, no review activity
└──────┬──────┘
       │ Reviewer begins assessment
       ▼
┌──────────────┐
│  In Review   │  ← Reviewer actively examining
└──────┬───────┘
       │
   ┌───┴────┐
   │        │
   ▼        ▼
┌──────────┐ ┌──────────────────┐
│ Approved │ │ Changes Requested │  ← Comments requiring action
└──────────┘ └────────┬─────────┘
                      │ Changes made, resubmitted
                      ▼
                  ┌──────────────┐
                  │  In Review   │  ← Re-enters review
                  └──────────────┘
```

#### Valid Transitions

| From | To | Trigger | Guard Conditions | Blocking Conditions | Required Audit Event |
|------|----|---------|------------------|---------------------|---------------------|
| Not Started | In Review | Human action | Reviewer assigned, item is in reviewable state | Item not in correct workflow state | `review.started` |
| In Review | Approved | Human action | All reviewer criteria satisfied, review notes documented | Open blocking comments | `review.approved` |
| In Review | Changes Requested | Human action | Specific changes documented in review comments | No comments provided | `review.changes_requested` |
| Changes Requested | In Review | Human action | Changes addressed, item resubmitted | Unresolved comments | `review.reopened` |

---

### 2.6 Approval States

```
┌──────────────┐
│  Not Ready   │  ← Recommendation exists but not ready for approval
└──────┬───────┘
       │ All preconditions met
       ▼
┌───────────┐
│   Ready   │  ← Recommendation complete, in approval queue
└─────┬─────┘
      │ Approval authority assigned, action taken
      ▼
┌──────────────────┐
│ Pending Approval │  ← Awaiting approver action
└────────┬─────────┘
         │
     ┌───┴────┐
     │        │
     ▼        ▼
┌──────────┐ ┌──────────┐
│ Approved │ │ Blocked  │  ← Approver identified blocking issue
└──────────┘ └──────────┘
```

#### Valid Transitions

| From | To | Trigger | Guard Conditions | Blocking Conditions | Required Audit Event |
|------|----|---------|------------------|---------------------|---------------------|
| Not Ready | Ready | System | Recommendation is in `accepted` state, all evidence linked | Missing evidence links | `approval.ready` |
| Ready | Pending Approval | Human action | Approver assigned, matches required authority tier for risk rating | Insufficient authority tier | `approval.pending` |
| Pending Approval | Approved | Human action | Approver action: approve or approve_with_modifications | Authority check fails, recommendation not in approvable state | `approval.approved` |
| Pending Approval | Blocked | Human action | Approver identifies blocking issue, documented in rationale | None | `approval.blocked` |
| Blocked | Ready | Human action | Blocking issue resolved, recommendation updated | Issue not resolved | `approval.ready` |

**Authority tier guard:**

| Risk Rating | Minimum Approver Role |
|-------------|----------------------|
| Low | Manager |
| Medium | Manager |
| High | Partner |
| Critical | Partner (no delegation) |

---

### 2.7 Publication States

```
┌──────────┐
│  Draft   │  ← Package being prepared
└────┬─────┘
     │ Content frozen, ready for publication
     ▼
┌──────────┐
│  Ready   │  ← Awaiting publication action
└────┬─────┘
     │ Published
     ▼
┌───────────┐
│ Published │  ← Immutable, client accessible
└─────┬─────┘
      │ Engagement completed
      ▼
┌──────────┐
│  Locked  │  ← Read-only, immutable terminal state
└──────────┘
```

#### Valid Transitions

| From | To | Trigger | Guard Conditions | Blocking Conditions | Required Audit Event |
|------|----|---------|------------------|---------------------|---------------------|
| Draft | Ready | Human action | Content snapshot compiled, evidence trace frozen | Missing content | `publication.ready` |
| Ready | Published | Human action | Approver confirms publication, client access configured | Engagement not in `approved` state | `publication.published` |
| Published | Locked | System | Engagement transitions to `archived` | Engagement not archived | `publication.locked` |
| Published | Published | Human action | Supersession: new recommendation published, previous marked superseded | None | `publication.superseded` |

**Immutability contract:**
- Once `Published`, the `content_snapshot` and `evidence_trace` fields are structurally frozen — no UPDATEs permitted.
- A new `PublicationPackage` with `superseded_by_id` can replace a published recommendation.
- Deletion is never permitted; `status` may hide from client view.

---

### 2.8 AI Output States

```
┌───────────┐
│ Suggested │  ← AI generated, presented to human
└─────┬─────┘
      │ Human reviews
      │
  ┌───┴────┐
  │        │
  ▼        ▼
┌────────────────┐ ┌──────────────────┐
│Accepted by Human│ │Rejected by Human │
└───────┬────────┘ └──────────────────┘
        │ A newer AI suggestion supersedes
        ▼
┌────────────┐
│ Superseded │  ← Newer suggestion replaces this one
└────────────┘
```

#### Valid Transitions

| From | To | Trigger | Guard Conditions | Blocking Conditions | Required Audit Event |
|------|----|---------|------------------|---------------------|---------------------|
| Suggested | Accepted by Human | Human action | Human confirmed acceptance, optionally modified content | None | `ai_output.accepted` |
| Suggested | Rejected by Human | Human action | Rejection reason recorded | None | `ai_output.rejected` |
| Accepted by Human | Superseded | System | Newer AIAssistanceOutput created for same context with `superseded_by_id` | None | `ai_output.superseded` |
| Rejected by Human | Superseded | System | New request generates replacement suggestion | None | `ai_output.superseded` |
| Suggested | Superseded | System | Newer suggestion generated before human reviewed | None | `ai_output.superseded` |

**Governance rules:**
- AI can never move an output to any state that implies human acceptance — only a human actor can set `accepted_by_human`.
- `model_version` must be recorded before any state transition out of `suggested`.
- Supersession preserves the full history — no records are ever deleted.

---

## Part 3: Seed Data — Gulf Trading Co. FY2025

### 3.1 Organization & Client

**Organization:**
| Field | Value |
|-------|-------|
| Name | Aqliya Audit Firm |
| Slug | aqliya-audit |
| Jurisdiction | Saudi Arabia |
| Regulatory Framework | IFRS for SMEs |
| Status | active |

**Client:**
| Field | Value |
|-------|-------|
| Name | Gulf Trading Co. |
| Registration Number | CR-2020-88421 |
| Industry | Trading & Distribution |
| Reporting Framework | IFRS for SMEs |
| Fiscal Period End | 12-31 |
| Currency | SAR |
| Status | active |

### 3.2 Users & Roles

| Name | Email | Role |
|------|-------|------|
| Abdulaziz Al-Otaibi | a.alotaibi@aqliya.ai | partner |
| Sara Al-Ghamdi | s.alghamdi@aqliya.ai | manager |
| Faisal Al-Harbi | f.alharbi@aqliya.ai | reviewer |
| Noura Al-Saud | n.alsaud@aqliya.ai | operator |
| Ahmed Al-Qahtani | a.alqahtani@aqliya.ai | viewer (client liaison) |

**Engagement team assignments:**
| User | Role on Engagement |
|------|-------------------|
| Abdulaziz Al-Otaibi | partner |
| Sara Al-Ghamdi | manager |
| Faisal Al-Harbi | reviewer |
| Noura Al-Saud | operator |

### 3.3 Engagement

| Field | Value |
|-------|-------|
| Name | Gulf Trading Co. — FY2025 Audit |
| Engagement Type | full_audit |
| Fiscal Period Start | 2025-01-01 |
| Fiscal Period End | 2025-12-31 |
| Currency | SAR |
| Reporting Framework | IFRS for SMEs |
| Materiality Threshold | 150,000.00 |
| Initial Workflow State | setup |

### 3.4 Canonical Accounts (IFRS for SMEs)

| Code | Name | Category | Statement | Normal Balance |
|------|------|----------|-----------|----------------|
| CA-1000 | Cash & Cash Equivalents | asset | sfp | DR |
| CA-1100 | Trade Receivables | asset | sfp | DR |
| CA-1200 | Inventories | asset | sfp | DR |
| CA-1300 | Prepaid Expenses | asset | sfp | DR |
| CA-1400 | Property, Plant & Equipment | asset | sfp | DR |
| CA-1500 | Accumulated Depreciation | asset | sfp | CR |
| CA-2000 | Trade Payables | liability | sfp | CR |
| CA-2100 | Accrued Expenses | liability | sfp | CR |
| CA-2200 | Current Tax Payable | liability | sfp | CR |
| CA-2300 | Short-term Borrowings | liability | sfp | CR |
| CA-2400 | Long-term Borrowings | liability | sfp | CR |
| CA-3000 | Share Capital | equity | sfp | CR |
| CA-3100 | Retained Earnings | equity | sfp | CR |
| CA-4000 | Sales Revenue | revenue | pl | CR |
| CA-4100 | Service Revenue | revenue | pl | CR |
| CA-5000 | Cost of Sales | expense | pl | DR |
| CA-5100 | Salaries & Wages | expense | pl | DR |
| CA-5200 | Rent Expense | expense | pl | DR |
| CA-5300 | Utilities Expense | expense | pl | DR |
| CA-5400 | Depreciation Expense | expense | pl | DR |
| CA-5500 | Professional Fees | expense | pl | DR |
| CA-5600 | General & Administrative | expense | pl | DR |
| CA-6000 | Other Income | revenue | pl | CR |

### 3.5 Trial Balance

| Code | Account Name | Debit (SAR) | Credit (SAR) | Normal Balance |
|------|-------------|-------------|--------------|----------------|
| 1001 | Cash & Bank | 500,000 | — | DR |
| 1100 | Accounts Receivable — Trade | 1,200,000 | — | DR |
| 1200 | Inventory — Trading Goods | 800,000 | — | DR |
| 1300 | Prepayments — Insurance & Rent | 75,000 | — | DR |
| 1400 | Property & Equipment — Net | 3,500,000 | — | DR |
| 1405 | Accumulated Depreciation | — | 875,000 | CR |
| 2000 | Accounts Payable — Trade | — | 950,000 | CR |
| 2100 | Accrued Expenses | — | 120,000 | CR |
| 2105 | Accrued Expenses — Unusual | 15,000 | — | DR |
| 2200 | Zakat & Tax Payable | — | 85,000 | CR |
| 2300 | Short-term Loan — Current | — | 500,000 | CR |
| 3000 | Share Capital | — | 2,000,000 | CR |
| 3100 | Retained Earnings | — | 1,200,000 | CR |
| 4000 | Sales Revenue — Trading | — | 4,500,000 | CR |
| 4100 | Service Revenue — Consulting | — | 750,000 | CR |
| 5000 | Cost of Sales — Trading | 2,800,000 | — | DR |
| 5100 | Salaries & Employee Costs | 900,000 | — | DR |
| 5200 | Rent — Office & Warehouse | 240,000 | — | DR |
| 5300 | Utilities | 95,000 | — | DR |
| 5400 | Depreciation Expense | 175,000 | — | DR |
| 5500 | Professional Fees — Audit & Legal | 120,000 | — | DR |
| 5600 | General & Administrative | 65,000 | — | DR |
| 6000 | Sundry Income | 0 | 0 | — |
| | **Totals** | **10,485,000** | **10,485,000** | |

**Balance check:** Total debits = 10,485,000 SAR, Total credits = 10,485,000 SAR ✓

### 3.6 Account Mappings

| Client Account | Canonical Account | Mapping Type |
|---------------|-------------------|--------------|
| 1001 — Cash & Bank | CA-1000 — Cash & Cash Equivalents | human_mapped |
| 1100 — Accounts Receivable — Trade | CA-1100 — Trade Receivables | ai_suggested |
| 1200 — Inventory — Trading Goods | CA-1200 — Inventories | ai_suggested |
| 1300 — Prepayments — Insurance & Rent | CA-1300 — Prepaid Expenses | ai_suggested |
| 1400 — Property & Equipment — Net | CA-1400 — Property, Plant & Equipment | human_mapped |
| 1405 — Accumulated Depreciation | CA-1500 — Accumulated Depreciation | ai_suggested |
| 2000 — Accounts Payable — Trade | CA-2000 — Trade Payables | ai_suggested |
| 2100 — Accrued Expenses | CA-2100 — Accrued Expenses | ai_suggested |
| 2105 — Accrued Expenses — Unusual | CA-2100 — Accrued Expenses | human_mapped |
| 2200 — Zakat & Tax Payable | CA-2200 — Current Tax Payable | ai_suggested |
| 2300 — Short-term Loan — Current | CA-2300 — Short-term Borrowings | ai_suggested |
| 3000 — Share Capital | CA-3000 — Share Capital | human_mapped |
| 3100 — Retained Earnings | CA-3100 — Retained Earnings | human_mapped |
| 4000 — Sales Revenue — Trading | CA-4000 — Sales Revenue | ai_suggested |
| 4100 — Service Revenue — Consulting | CA-4100 — Service Revenue | ai_suggested |
| 5000 — Cost of Sales — Trading | CA-5000 — Cost of Sales | ai_suggested |
| 5100 — Salaries & Employee Costs | CA-5100 — Salaries & Wages | ai_suggested |
| 5200 — Rent — Office & Warehouse | CA-5200 — Rent Expense | ai_suggested |
| 5300 — Utilities | CA-5300 — Utilities Expense | ai_suggested |
| 5400 — Depreciation Expense | CA-5400 — Depreciation Expense | ai_suggested |
| 5500 — Professional Fees — Audit & Legal | CA-5500 — Professional Fees | ai_suggested |
| 5600 — General & Administrative | CA-5600 — General & Administrative | ai_suggested |
| 6000 — Sundry Income | *(unmapped)* | — |

### 3.7 Intentional Issues

The seed data includes the following intentional issues for demo purposes:

#### Issue 1: Unmapped Account

| Field | Value |
|-------|-------|
| Account | 6000 — Sundry Income |
| Balance | 0 SAR (inactive/no transactions) |
| Issue | No canonical mapping exists. The operator must decide: map to `CA-6000 — Other Income` or investigate further. |
| Demo action | Flag as unmapped during mapping review. AI suggests `CA-6000 — Other Income` with medium confidence. |

#### Issue 2: Missing Evidence

| Field | Value |
|-------|-------|
| Account | 1200 — Inventory — Trading Goods |
| Balance | 800,000 SAR (material) |
| Required Evidence | Inventory count sheet / stock take report for year-end |
| Evidence State | `missing` |
| Issue | No inventory count sheet has been uploaded despite being a material balance. The reviewer cannot progress the engagement until this is resolved. |
| Demo action | Show evidence gap in review queue. Request evidence from client. Operator uploads after request. |

#### Issue 3: Unusual Balance (Negative Accrued Expenses)

| Field | Value |
|-------|-------|
| Account | 2105 — Accrued Expenses — Unusual |
| Balance | 15,000 SAR debit (negative liability) |
| Issue | Accrued expenses normally carry a credit balance. A debit balance of 15,000 SAR suggests either a prepayment was misclassified or an entry was reversed incorrectly. This triggers a classification warning in validation. |
| Demo action | ValidationRun detects: account `2105` is mapped to `CA-2100 — Accrued Expenses` but has a debit balance while the canonical account expects a credit balance. Creates a ValidationIssue with severity `warning`. |

#### Issue 4: Classification Warning (Loan Term Mismatch)

| Field | Value |
|-------|-------|
| Account | 2300 — Short-term Loan — Current |
| Balance | 500,000 SAR credit |
| Issue | Loan is classified as "Short-term" and "Current", but the loan agreement shows a repayment period of 18 months (>12 months). This means it should be classified as non-current/long-term borrowing under IFRS for SMEs Section 11. |
| Demo action | ValidationRun flags classification discrepancy. Reviewer creates a finding: `classification — material_misstatement`. |

#### Issue 5: Disclosure Note Requiring More Information

| Field | Value |
|-------|-------|
| Note | Property, Plant & Equipment (Note 4) |
| Content | (empty/pending) |
| Associated Account | 1400 — Property & Equipment — Net (3,500,000 SAR) |
| Issue | The PPE note requires: cost, accumulated depreciation, additions, disposals, depreciation method, useful lives. None of this has been drafted. The disclosure note is in `pending` state. |
| Demo action | AI drafts the note based on available data. Reviewer reviews and accepts/modifies. |

#### Issue 6: Finding Requiring Recommendation

| Field | Value |
|-------|-------|
| Finding | Loan misclassification (from Issue 4) |
| State | `accepted` |
| Issue | The finding has been accepted but no recommendation has been drafted yet. The reviewer needs to create a recommendation for the client to reclassify the loan. |
| Demo action | AI drafts recommendation: "Reclassify 500,000 SAR short-term loan to non-current liabilities. Amend financial statement presentation and disclose the correction in accordance with IFRS for SMEs Section 10." |

#### Issue 7: Review Comment Requiring Resolution

| Field | Value |
|-------|-------|
| Target | Recommendation for Inventory evidence gap |
| Author | Sara Al-Ghamdi (manager) |
| Comment | "The inventory count sheet shows a discrepancy of 12,500 SAR between physical count and book value. We need a provision for inventory obsolescence. Please investigate and document the rationale if no adjustment is needed." |
| Resolution Status | `open` |
| Issue | The reviewer has not responded to this comment, blocking the recommendation from advancing. |
| Demo action | Reviewer responds to comment, resolves it, or escalates. |

### 3.8 Seed Evidence Objects

| Filename | Type | State | Linked To |
|----------|------|-------|-----------|
| `gulf-trading-co-cash-confirmation-bank.pdf` | Bank confirmation | `accepted` | Account 1001 — Cash & Bank |
| `ar-aging-report-fy2025.xlsx` | AR aging report | `accepted` | Account 1100 — Accounts Receivable |
| `inventory-count-sheet-fy2025.pdf` | Inventory count sheet | `missing` | Account 1200 — Inventory |
| `prepaid-insurance-schedule.xlsx` | Prepayment schedule | `reviewed` | Account 1300 — Prepayments |
| `ppe-register-fy2025.xlsx` | Fixed asset register | `accepted` | Account 1400 — Property & Equipment |
| `depreciation-calculation.xlsx` | Depreciation working | `accepted` | Accounts 1400, 1405, 5400 |
| `ap-confirmation-letters.pdf` | AP confirmations | `accepted` | Account 2000 — Accounts Payable |
| `loan-agreement-sab-2024.pdf` | Loan agreement | `accepted` | Account 2300 — Short-term Loan |
| `zakat-calculation-2025.xlsx` | Zakat working paper | `reviewed` | Account 2200 — Zakat Payable |
| `sales-invoice-sample-10.pdf` | Sales invoice sample | `accepted` | Account 4000 — Sales Revenue |

### 3.9 Seed Findings & Recommendations

#### Finding 1: Loan Misclassification

| Field | Value |
|-------|-------|
| Title | Short-term loan should be classified as non-current |
| Type | material_misstatement |
| Description | Account 2300 (Short-term Loan — Current) of 500,000 SAR is classified as a current liability. However, the loan agreement shows a repayment term of 18 months from the balance sheet date, which exceeds 12 months. Under IFRS for SMEs Section 11, this should be classified as a non-current liability. |
| Materiality | material |
| Risk Rating | high |
| State | accepted |
| Evidence | `loan-agreement-sab-2024.pdf` |
| Recommendation | *(not yet drafted — see Issue 6)* |

#### Finding 2: Inventory Evidence Gap

| Field | Value |
|-------|-------|
| Title | Inventory count sheet not provided |
| Type | control_deficiency |
| Description | Inventory of 800,000 SAR (material balance) has no supporting stock take report. The year-end inventory count sheet has not been provided, preventing verification of existence and completeness. |
| Materiality | material |
| Risk Rating | medium |
| State | open |
| Evidence | None (missing — see Issue 2) |

#### Finding 3: Accrued Expenses Anomaly

| Field | Value |
|-------|-------|
| Title | Unusual debit balance in accrued expenses |
| Type | observation |
| Description | Account 2105 (Accrued Expenses — Unusual) carries a 15,000 SAR debit balance. Accrued expenses should normally be credit balances. This may indicate a prepayment misclassification, a reversal error, or an unadjusted entry. |
| Materiality | immaterial |
| Risk Rating | low |
| State | open |
| Evidence | `ar-aging-report-fy2025.xlsx` (for context) |

### 3.10 Seed Approval & Publication

| Step | State | Details |
|------|-------|---------|
| Approval Record 1 | *(pending, awaiting recommendation)* | Once recommendation for Finding 1 is drafted and accepted, Sara Al-Ghamdi (manager) approves. |
| Approval Record 2 | *(pending, awaiting partner)* | Abdulaziz Al-Otaibi (partner) approves high-risk recommendation. |
| Publication | *(pending)* | After approvals, PublicationPackage is generated with frozen evidence trace. |
| Status | Published | Client access URL generated. |

---

*End of AuditOS MVP — Data Model & Workflow Specification*
