# AuditOS — Next Build Plan

## Build Sequence

The following build sequence takes AuditOS from current state to pilot-ready demo.

Execute in order. Do not skip steps. Do not parallelize across build items.

---

## 1. Demo Dataset

**Priority:** High
**Status:** Foundation

**Objective:** Build a comprehensive demo dataset that showcases the full AuditOS workflow.

**Tasks:**
- [ ] Create realistic trial balance for sample company (Gulf Trading Co. FY2025)
- [ ] Pre-populate account mappings for all major categories
- [ ] Generate sample financial statements (all 4 statements)
- [ ] Generate sample disclosure notes
- [ ] Generate sample evidence requirements
- [ ] Generate sample findings and observations
- [ ] Set up demo engagement with all workflow stages visible

**Validation:**
- [ ] Demo engagement loads at `/audit`
- [ ] All workflow pages render with data
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build -- --webpack` passes

**Dependencies:** None

---

## 2. Trial Balance Import Hardening

**Priority:** High
**Status:** Quality

**Objective:** Harden the trial balance import process with comprehensive QA checks.

**Tasks:**
- [ ] Validate file format (CSV/XLSX)
- [ ] Check required columns (Account Code, Account Name, Debit, Credit)
- [ ] Detect duplicate account codes
- [ ] Validate debit/credit balance
- [ ] Provide clear error messages with line numbers
- [ ] Support Arabic and English account names

**Validation:**
- [ ] Invalid files rejected with clear errors
- [ ] Valid files import successfully
- [ ] Balance check enforced
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build -- --webpack` passes

**Dependencies:** Demo Dataset (for testing)

---

## 3. Notes Engine v1

**Priority:** High
**Status:** Feature

**Objective:** Implement Notes Engine that generates disclosure notes from mapped accounts.

**Tasks:**
- [ ] Read mapped accounts and generate corresponding notes
- [ ] Support Arabic and English note output
- [ ] Link notes to financial statement line items
- [ ] Display notes on `/audit/engagements/[engagementId]/notes`
- [ ] Mark all generated notes as Draft

**Validation:**
- [ ] Notes page renders with generated notes
- [ ] Each note links back to source accounts
- [ ] Notes are Draft status by default
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build -- --webpack` passes

**Dependencies:** Demo Dataset, Trial Balance Import

---

## 4. Evidence Requirements Engine

**Priority:** High
**Status:** Feature

**Objective:** Implement Evidence Requirements Engine that generates evidence lists.

**Tasks:**
- [ ] Analyze mapped accounts and identify required evidence
- [ ] Generate evidence requirements by account area
- [ ] Display evidence requirements on `/audit/engagements/[engagementId]/evidence`
- [ ] Support evidence status tracking (Pending, Provided, Reviewed)
- [ ] Link evidence requirements to findings

**Validation:**
- [ ] Evidence page renders with requirements
- [ ] Each requirement links to relevant accounts/findings
- [ ] Status tracking works
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build -- --webpack` passes

**Dependencies:** Notes Engine v1

---

## 5. Reviewer Workflow

**Priority:** High
**Status:** Feature

**Objective:** Implement reviewer approval workflow for draft → reviewed → approved transitions.

**Tasks:**
- [ ] Define approval states: Draft → Reviewed → Approved
- [ ] Implement approval actions on statements, notes, and evidence
- [ ] Display approval status across all relevant pages
- [ ] Record approver identity and timestamp
- [ ] Log all approval events in audit trail

**Validation:**
- [ ] Approval workflow functions end-to-end
- [ ] Status indicators update correctly
- [ ] Audit trail records all approval events
- [ ] Only authenticated reviewers can approve
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build -- --webpack` passes

**Dependencies:** Evidence Requirements Engine

---

## 6. Pilot-Ready Demo Flow

**Priority:** Critical
**Status:** Integration

**Objective:** Assemble all components into a cohesive pilot-ready demo flow.

**Tasks:**
- [ ] End-to-end demo: Upload TB → Map → Statements → Notes → Evidence → Review → Approve
- [ ] Verify all workflow stages connect smoothly
- [ ] Polish UI for demo presentation
- [ ] Test bilingual display (Arabic/English)
- [ ] Verify all state indicators are visible and accurate
- [ ] Create demo script for pilot presentations

**Validation:**
- [ ] Full demo flow completes without errors
- [ ] All pages render correctly in sequence
- [ ] State transitions are clear and logged
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build -- --webpack` passes

**Dependencies:** Reviewer Workflow

---

## 7. Website / Demo Request Flow

**Priority:** Medium
**Status:** External

**Objective:** Set up website presence and demo request flow for inbound leads.

**Tasks:**
- [ ] Create landing page for AuditOS
- [ ] Add demo request form
- [ ] Connect demo requests to CRM/pipeline
- [ ] Set up automated acknowledgment
- [ ] Link to existing outbound kit materials

**Validation:**
- [ ] Landing page loads correctly
- [ ] Demo request form submits successfully
- [ ] Requests are logged and trackable
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build -- --webpack` passes

**Dependencies:** Pilot-Ready Demo Flow

---

## Build Status Legend

| Status | Meaning |
|--------|---------|
| Foundation | Core data and setup |
| Quality | Hardening existing functionality |
| Feature | New feature implementation |
| Integration | Assembling components into cohesive flow |
| External | Customer-facing work |

## Progress Tracking

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Demo Dataset | Pending | |
| 2 | Trial Balance Import Hardening | Pending | |
| 3 | Notes Engine v1 | Pending | |
| 4 | Evidence Requirements Engine | Pending | |
| 5 | Reviewer Workflow | Pending | |
| 6 | Pilot-Ready Demo Flow | Pending | |
| 7 | Website / Demo Request Flow | Pending | |
