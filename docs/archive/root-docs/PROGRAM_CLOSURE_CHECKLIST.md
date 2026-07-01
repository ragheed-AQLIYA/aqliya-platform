# AQLIYA Program Closure Checklist

> **Status:** Active — Mandatory for all AQLIYA programs  
> **Version:** 1.0  
> **File location:** `docs/PROGRAM_CLOSURE_CHECKLIST.md`  
> **Effective date:** 2026-06-26  
> **Owner:** Governance Team  

**Established following:** Documentation Remediation (Waves 1–7) closure audit (2026-06-26)  
**Lesson learned:** The original closure was signed on local machine observations without verifying `git ls-files` or running from a fresh clone. This checklist prevents recurrence.

---

## 1. Purpose

Every AQLIYA program **must** complete this checklist before closure sign-off.

This checklist is the single mandatory closure gate for all AQLIYA programs, regardless of scale. It ensures:

- The program's deliverables are complete and verified
- CI enforcement works from a fresh clone (not just local machine)
- Documentation accurately reflects the final state
- Governance, audit trail, and evidence requirements are satisfied
- Lessons learned are captured and transferred

---

## 2. Before You Begin

### Prerequisites

- [ ] Program scope is documented and accepted
- [ ] Acceptance criteria are defined and measurable
- [ ] A closure document template is prepared (see §9 — Closure Document Format)

### Required Roles

| Role | Responsibility |
|------|----------------|
| **Program Owner** | Accountable for closure completion and sign-off |
| **Independent Reviewer** | Performs the fresh-clone verification (must not be the implementer) |
| **Governance Team** | Validates governance, audit trail, and evidence requirements |
| **Documentation Team** | Validates documentation accuracy and hierarchy compliance |

---

## 3. Deliverable Verification

### 3.1 Scope Completion

- [ ] All deliverables listed in the program scope are implemented
- [ ] Each deliverable has evidence (code, schema, config, docs, tests)
- [ ] Out-of-scope items are acknowledged in backlog, not claimed as done
- [ ] Partial or dropped deliverables are documented with rationale

### 3.2 Quality

- [ ] Deliverables meet the target completion level (L4 minimum for active products; see PRODUCT_STATUS_MATRIX.md)
- [ ] Error states exist for all new user-facing features
- [ ] Loading states exist for all async operations
- [ ] Empty states exist for all list/dashboard views
- [ ] Bilingual (Arabic/English) or RTL support is implemented where relevant

### 3.3 Tests

- [ ] New code has corresponding tests
- [ ] Tests are real Jest unit/integration tests (not shell scripts or manual checklists claiming to be tests)
- [ ] Test suite passes: `npm test`
- [ ] Test coverage for new code is at minimum consistent with surrounding codebase

---

## 4. CI & Build Verification

### 4.1 Fresh-Clone Gate ⚠️ **(MANDATORY)**

This is the single most critical step. It catches the failure mode that caused the Documentation Remediation closure incident.

- [ ] **`git ls-files` includes all files the pipeline depends on** — Run `git ls-files` and verify every script, config, and data file referenced by CI workflows is tracked. Untracked files cannot be accessed by CI.
- [ ] **Fresh clone passes all CI checks** — Clone the repository to a temporary directory with `git clone --depth 1 <repo-url>` and run the full validation suite. Do NOT use the local working tree.
- [ ] **No pre-existing files in the temp directory** — Verify the temp directory is empty before cloning (no cached node_modules, no lingering config files).
- [ ] **Pipeline documentation reflects actual pipeline behavior** — Read the CI workflow file (`.github/workflows/ci.yml`) and compare against any pipeline documentation. Fix discrepancies.

### 4.2 Build

- [ ] `npx tsc --noEmit` passes (pre-existing errors documented and not worsened)
- [ ] `npm run build` succeeds
- [ ] New build warnings are documented and justified

### 4.3 Lint

- [ ] `npm run lint` passes with zero errors
- [ ] Pre-existing warnings are documented and not worsened
- [ ] New lint warnings are fixed (not deferred)

---

## 5. Governance & Security Verification

### 5.1 Access Control

- [ ] New routes have appropriate auth coverage
- [ ] New API endpoints have server-side permission checks
- [ ] Tenant isolation is preserved (organizationId scoping)
- [ ] RBAC is enforced server-side (not only in UI)
- [ ] Sensitive routes are protected against direct URL access

### 5.2 Audit Trail

- [ ] Every state mutation is logged via AuditEvent or equivalent
- [ ] Audit log includes: actor ID, action type, timestamp, target resource, organization context
- [ ] Audit events are queryable and filterable

### 5.3 Evidence & Files

- [ ] Evidence-backed outputs reference their source inputs
- [ ] File uploads have permission checks, ownership tracking, and metadata storage
- [ ] File downloads have permission checks and audit logging
- [ ] File deletion/archival is logged

### 5.4 Review & Approval

- [ ] Outputs that affect decisions, reports, or external communication have review gates
- [ ] Review/approval actions are logged with identity and timestamp
- [ ] AI-generated outputs are clearly labeled as suggestions/drafts, not final decisions

### 5.5 AI Governance (if applicable)

- [ ] AI features include source input references, action type, model/provider, confidence notes
- [ ] AI does not make autonomous final decisions
- [ ] AI output is framed as suggestion/draft/analysis, not final/certified
- [ ] Sensitive data is not routed to external providers without clear routing rules

---

## 6. Data & Schema Verification

- [ ] Schema changes are tied to the active program scope
- [ ] Migration impact is understood and documented
- [ ] Seed data is updated to reflect schema changes
- [ ] Seed data includes representative bilingual records
- [ ] `npx prisma generate` succeeds
- [ ] No speculative schema changes for future/hypothetical features

---

## 7. Documentation Verification

### 7.1 Documentation Accuracy

- [ ] All new/changed features are documented in the relevant docs
- [ ] Product status is updated in `PRODUCT_STATUS_MATRIX.md`
- [ ] Routes are updated in `ROUTE_STRATEGY.md`
- [ ] Architecture is updated in `AQLIYA_ARCHITECTURE.md` (if changed)
- [ ] Commercial claims are verified against implemented reality

### 7.2 Documentation Hierarchy Compliance

- [ ] Docs are placed at the correct level per `DOCUMENTATION_AUTHORITY.md`
- [ ] No duplicate or conflicting documents
- [ ] Closed programs have a closure document in `docs/releases/`
- [ ] Closure document lists all backlog items carried forward

### 7.3 Knowledge Map

- [ ] `knowledge-map.json` is regenerated (if documentation files changed)
- [ ] `knowledge-map.json` is committed to git (mandatory — must be tracked)
- [ ] All 7 documentation validators pass: see §4.1 for fresh-clone verification

---

## 8. Sign-Off

### 8.1 Gate Review

| Gate | Approver | Signature | Date |
|------|----------|-----------|------|
| Deliverable completeness | Program Owner | | |
| CI / fresh-clone verification | Independent Reviewer | | |
| Governance & security | Governance Team | | |
| Documentation accuracy | Documentation Team | | |

### 8.2 Final Decision

- [ ] No P0/P1 blockers remain
- [ ] All P2+ items are documented in backlog with owner
- [ ] Closure document is written and committed
- [ ] Program is officially CLOSED or CLOSED WITH BACKLOG

---

## 9. Closure Document Format

Every closed program **must** produce a closure document following this format:

```markdown
---
title: "<Program Name> — Program Closure"
status: closed
program: "<Program Name>"
date: <YYYY-MM-DD>
author: <Owner>
classification: program-closure
---

# <Program Name> — Program Closure

**Program:** <Program Name>
**Status:** CLOSED WITH BACKLOG
**Closure date:** <YYYY-MM-DD>

---

## 1. Objective

> Original program objective.

---

## 2. Deliverables

| Deliverable | Status | Evidence |
|-------------|--------|----------|
| <item> | ✅ / ⚠️ / ❌ | <link to code, doc, or test> |

---

## 3. Acceptance Criteria

| Criterion | Result | Evidence |
|-----------|--------|----------|
| <criterion> | PASSED / FAILED | <evidence> |

---

## 4. Validation Results

| Check | Result | Notes |
|-------|--------|-------|
| `npx tsc --noEmit` | ✅ / ⚠️ / ❌ | |
| `npm run build` | ✅ / ⚠️ / ❌ | |
| `npm test` | ✅ / ⚠️ / ❌ | |
| `npm run lint` | ✅ / ⚠️ / ❌ | |
| Fresh-clone verification | ✅ / ⚠️ / ❌ | |
| <program-specific checks> | ✅ / ⚠️ / ❌ | |

---

## 5. Governance Check

- RBAC: <status>
- Tenant isolation: <status>
- Audit trail: <status>
- Evidence/files: <status>
- Review/approval gates: <status>
- Export controls: <status>
- AI governance: <status>

---

## 6. Blocking Issues

None / <list with owner and ETA>

---

## 7. Backlog (Transferred Items)

| Item | Priority | Owner | Notes |
|------|----------|-------|-------|
| <item> | P<0-4> | <owner> | <notes> |

---

## 8. Lessons Learned

- <lesson>
- <lesson>

---

## 9. Commemoration

This is the <ordinal> officially closed program under AQLIYA's formal program closure policy.

---

**Signed:** <Role>
**Date:** <YYYY-MM-DD>
```

---

## 10. Quick-Reference Summary

### Before closure, answer these questions:

1. Did you run `git ls-files` and verify all pipeline dependencies are tracked?
2. Did you test from a **fresh clone** (`git clone --depth 1`), not your local working tree?
3. Do all CI checks pass on the fresh clone?
4. Does the closure document match what the code actually does?
5. Are audit trails, permissions, and evidence requirements satisfied?
6. Is the backlog honest about what is NOT done?

### If the answer to any of (1)–(3) is NO: **do not close**. Fix the gap first.

### If the answer to any of (4)–(6) is NO: **do not close**. Correct the inaccuracy first.

---

## 11. Amendment

This document may only be amended by:

1. Documented decision with rationale
2. Updated version with changelog entry
3. Preservation of the mandatory fresh-clone verification gate

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2026-06-26 | 1.0 | Initial creation following Documentation Remediation closure audit | OpenCode |
