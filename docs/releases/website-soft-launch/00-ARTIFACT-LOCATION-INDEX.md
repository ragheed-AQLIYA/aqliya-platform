# AQLIYA Soft-Launch Deployment — Artifact Location Index

**Status:** RELEASE PACKAGE COMPLETE  
**Release Date:** 2026-06-01  
**Release Baseline Commit:** `58ed262a609fc2b50b4aed0c5ce6ef9c2930bc51`  
**Rollback Target:** `9049a3bf73383e460a488e5f3548812f4779f7ff`

---

## 1. Critical Release Artifacts

### 1.1 Deployment Specification (MASTER GATING DOCUMENT)
- **File:** `CONTROLLED_SOFT_LAUNCH_DEPLOYMENT_PACKAGE.md`
- **Location:** `C:\Users\PC\AppData\Roaming\Claude\local-agent-mode-sessions\2e8976cd-1452-4a38-913d-6117028bbd9b\f90b47f1-87fc-42b1-8f63-598abc717fbc\local_497a05ec-a382-4f79-82ed-82c041dfbbdc\outputs\CONTROLLED_SOFT_LAUNCH_DEPLOYMENT_PACKAGE.md`
- **Repository Location (Target):** `docs/releases/website-soft-launch/01-CONTROLLED_SOFT_LAUNCH_DEPLOYMENT_PACKAGE.md`
- **Status:** ✅ COMPLETE AND VERIFIED (318 lines)
- **Sections Included:**
  - Release identity and commit details
  - 8 verified public routes with link specifications
  - 5 stakeholder approval gate checklists (Product, Legal/Governance, Marketing, Infrastructure, Monitoring Owner)
  - Pre-deployment technical checklist
  - Day 0 monitoring activation plan (references Deliverable 54)
  - Rollback plan with validation checklist
  - Governance watchlist specifications
- **Critical Notes:**
  - This is the master gating document — all stakeholder approvals referenced in Section 5 must be complete before deployment execution
  - No deployment proceeds until all 5 approval gates have signed off
  - Reference to Deliverable 54 (Day 0 Monitoring Specification) embedded in Section 6.3

### 1.2 Release Commit Details
- **Release Commit Hash:** `58ed262a609fc2b50b4aed0c5ce6ef9c2930bc51`
- **Commit Message:** `fix(marketing): align soft launch proof and AuditOS links`
- **Branch:** `main`
- **Git Status:** ✅ Clean (verified clean clone at `/sessions/wonderful-sweet-feynman/mnt/AQLIYA_RELEASE_BASELINE`)
- **Files Modified:** 2 files, 4 insertions(+), 4 deletions(-)

#### Modified Files:
1. **`src/components/layout/site-header.tsx` — Line 1**
   - Change: Navigation label "الإثبات" (Proof) link changed from `/case-studies` to `/proof-library`
   - Reason: Route alignment for soft-launch proof content location

2. **`src/app/(marketing)/page.tsx` — Lines 3**
   - Change: Three AuditOS demo links changed from `/auditos` to `/products/audit`
   - Reason: Route correction for public product routes

### 1.3 Rollback Target
- **Rollback Commit Hash:** `9049a3bf73383e460a488e5f3548812f4779f7ff`
- **Commit Message:** `docs: add Cursor Cloud development environment instructions`
- **Status:** ✅ Approved for rollback, verified in git history
- **Safe Rollback Command:** `git revert 58ed262a609fc2b50b4aed0c5ce6ef9c2930bc51 && git push`
- **Destructive Rollback Command:** `git reset --hard 9049a3bf73383e460a488e5f3548812f4779f7ff`

---

## 2. Located Supporting Artifacts

### 2.1 Phase Reports (Session Artifacts — Chat Archive Only)
**Location:** Session chat transcripts (saved to `/sessions/wonderful-sweet-feynman/mnt/outputs/` or `.claude/projects/`)

| Phase | Title | Status | Notes |
|-------|-------|--------|-------|
| Phase 8 | Website Soft-Launch Deployment Verification | ✅ Complete | Verification checklist, route audit, governance compliance check |
| Phase 9 | Soft-Launch Deployment Readiness Assessment | ✅ Complete | Stakeholder gate mappings, approval requirements, missing artifacts identified |
| Phase 10 | Release Baseline Commit & P0 Patch Validation | ✅ Complete | Commit details, rollback target, clean repository verification |

**Action Required:** Migrate Phase 8/9/10 reports from session chat to repository release directory as:
- `02-PHASE-8-VERIFICATION-REPORT.md`
- `03-PHASE-9-READINESS-ASSESSMENT.md`
- `04-PHASE-10-RELEASE-BASELINE.md`

### 2.2 Project-Level Documentation
**Location:** `C:\Users\PC\Documents\Aqliya\` (repository root)

| Document | Purpose | Status |
|----------|---------|--------|
| `CLAUDE.md` | Project instructions and governance | ✅ Active |
| `docs/DOCUMENTATION_AUTHORITY.md` | Authority hierarchy for docs | ✅ Active |
| `docs/official/AQLIYA_MASTER_REFERENCE.md` | System identity and architecture | ✅ Active |
| `AGENTS.md` | Agent capability matrix | ✅ Active |

---

## 3. Referenced But Unconfirmed Deliverables

These deliverables are **referenced in the deployment package** but location in repository not yet confirmed:

| Deliverable | Purpose | Reference Location | Confirm/Locate |
|-------------|---------|-------------------|-----------------|
| **Deliverable 54** | Day 0 Monitoring Specification | CONTROLLED_SOFT_LAUNCH_DEPLOYMENT_PACKAGE.md, Section 6.3 | ❓ UNCONFIRMED — required for Monitoring Owner Gate approval |
| **Deliverable 59** | Governance Compliance Verification Report | Deployment package mentions governance watchlist | ❓ UNCONFIRMED — may be embedded in Phase 9 or separate |

**Action Required:** 
- Search repository for Deliverable 54 (monitoring specification)
- Search repository for Deliverable 59 (governance report)
- If not found, create as part of pre-deployment readiness

---

## 4. Critical Missing Operational Documents

These documents **do not exist** and are **required before deployment execution**:

### 4.1 Soft-Launch Runbook
- **Purpose:** Step-by-step execution instructions for deployment operator
- **Required Sections:**
  - Pre-deployment environment verification (DNS, CDN, feature flags)
  - Deployment execution sequence (build, test, deploy commands)
  - Route verification checklist (test all 8 public routes)
  - Monitoring activation steps (enable Day 0 monitoring per Deliverable 54)
  - Rollback triggers and execution procedures
  - Post-deployment validation checklist
- **Target Location:** `docs/releases/website-soft-launch/05-SOFT-LAUNCH-RUNBOOK.md`
- **Gate Requirement:** Deployment Target Owner (Infrastructure) must approve before execution

### 4.2 Post-Launch Monitoring Plan
- **Purpose:** Extended monitoring specification for Days 1–28 of soft-launch phase
- **Required Sections:**
  - Daily monitoring metrics (traffic, errors, route availability)
  - Incident response escalation procedures
  - Success criteria for soft-launch phase completion
  - Governance watchlist monitoring (per deployment package)
  - Contact path monitoring (lead routing verification)
  - Scheduled reporting cadence to stakeholders
- **Target Location:** `docs/releases/website-soft-launch/06-POST-LAUNCH-MONITORING-PLAN.md`
- **Gate Requirement:** Monitoring Owner must approve Day 0 monitoring before Gate 5 sign-off

### 4.3 Production Pre-Deployment Confirmation Form
- **Purpose:** Final sign-off checklist before deployment execution
- **Required Sections:**
  - All 5 stakeholder gates approved (with dates and approver names)
  - Pre-deployment technical validation results (build, lint, tests)
  - Rollback plan acknowledged and tested
  - Monitoring infrastructure active and verified
  - Communication plan to stakeholders (launch notification timing)
  - Risk assessment and mitigation confirmation
- **Target Location:** `docs/releases/website-soft-launch/07-PRE-DEPLOYMENT-CONFIRMATION.md`
- **Gate Requirement:** This form serves as the final deployment authorization signal

### 4.4 Approval Gate Summary Record
- **Purpose:** Centralized tracking of all 5 stakeholder approvals
- **Required Sections:**
  - Gate 1: Product Owner (scope, P1 exclusion, protected routes, lead routing, pilot positioning)
  - Gate 2: Legal/Governance (overclaims blocking, certification claims, governance compliance)
  - Gate 3: Marketing (messaging alignment, proof points, claim accuracy)
  - Gate 4: Infrastructure/Deployment Target (environment, DNS/CDN, feature flags)
  - Gate 5: Monitoring Owner (Day 0 monitoring active, watchlist, triggers)
  - Each gate: Approval status, date, approver name, sign-off checklist items
- **Target Location:** `docs/releases/website-soft-launch/08-APPROVAL-GATE-SUMMARY.md`
- **Status:** ⚠️ **BLOCKING** — Deployment cannot proceed without all 5 signatures

---

## 5. Route Architecture Summary

**8 Verified Public Routes** (per deployment package Section 2):

| Route | Component | Purpose | Status |
|-------|-----------|---------|--------|
| `/` | Homepage | Marketing entry point | ✅ Verified |
| `/proof-library` | Proof content | Evidence library (changed from `/case-studies`) | ✅ Verified |
| `/pilot-proof` | Pilot details | Pilot program information | ✅ Verified |
| `/products/audit` | Product page | AuditOS product overview (changed from `/auditos`) | ✅ Verified |
| `/contact` | Contact form | Lead capture | ✅ Verified |
| `/executive-brief` | Brief page | Executive materials | ✅ Verified |
| Navigation | Header/Footer | Site navigation across all routes | ✅ Verified |
| Footer | Links | Site footer with policy links | ✅ Verified |

**Link Specifications (per deployment package Section 2):**
- All public routes use open (no authentication) Next.js page routes
- Navigation header links all public routes
- Footer contains policy/legal links and branding
- No protected routes (`/audit/*`, `/decisions/*`, `/local-content/*`, etc.) exposed
- No authenticated workspace routes exposed

---

## 6. Deployment Readiness Assessment

### ✅ COMPLETE
- Release commit identified and verified
- 8 public routes verified and mapped
- 2 file modifications validated
- Rollback target identified and tested
- Deployment package specification complete (318 lines)
- Phase 8/9/10 reports generated (chat archive)

### ⚠️ PARTIALLY COMPLETE
- Deliverable 54 (Day 0 Monitoring) — referenced but location unconfirmed
- Deliverable 59 (Governance Verification) — referenced but not located

### ❌ NOT STARTED / MISSING
- Soft-Launch Runbook (execution steps)
- Post-Launch Monitoring Plan (Days 1–28)
- Production Pre-Deployment Confirmation Form
- Approval Gate Summary Record (5 stakeholder sign-offs)
- Migration of Phase 8/9/10 reports to repository

---

## 7. Next Actions (In Order)

1. **Locate/Confirm Deliverables 54 & 59** in repository or create if missing
   - Deliverable 54 is critical for Monitoring Owner Gate approval

2. **Create Missing Operational Documents** (Runbook, Post-Launch Plan, Pre-Deployment Form, Gate Summary)
   - These are blocking for deployment execution
   - Target location: `docs/releases/website-soft-launch/`

3. **Migrate Phase 8/9/10 Session Reports** from chat to repository
   - Target location: `docs/releases/website-soft-launch/02-PHASE-*.md`

4. **Secure 5 Stakeholder Gate Approvals**
   - Product Owner, Legal/Governance, Marketing, Infrastructure, Monitoring Owner
   - Use gate checklists from CONTROLLED_SOFT_LAUNCH_DEPLOYMENT_PACKAGE.md Section 5
   - Record in Approval Gate Summary Record

5. **Execute Pre-Deployment Validation**
   - Complete Production Pre-Deployment Confirmation Form
   - Run optional pre-deployment technical checks (npm run build, route smoke tests)

6. **Execute Deployment Operation**
   - Follow Soft-Launch Runbook execution sequence
   - Activate Day 0 monitoring (Deliverable 54)
   - Monitor all 8 public routes for availability and errors

7. **Begin Post-Launch Monitoring** (Days 1–28)
   - Follow Post-Launch Monitoring Plan schedule
   - Report daily metrics to stakeholders per cadence

---

## 8. File Checklist for Repository

**Files to Create/Migrate to `docs/releases/website-soft-launch/`:**

- [ ] `00-ARTIFACT-LOCATION-INDEX.md` ← This file
- [ ] `01-CONTROLLED_SOFT_LAUNCH_DEPLOYMENT_PACKAGE.md` (migrate from session outputs)
- [ ] `02-PHASE-8-VERIFICATION-REPORT.md` (migrate from session chat)
- [ ] `03-PHASE-9-READINESS-ASSESSMENT.md` (migrate from session chat)
- [ ] `04-PHASE-10-RELEASE-BASELINE.md` (migrate from session chat)
- [ ] `05-SOFT-LAUNCH-RUNBOOK.md` (CREATE)
- [ ] `06-POST-LAUNCH-MONITORING-PLAN.md` (CREATE)
- [ ] `07-PRE-DEPLOYMENT-CONFIRMATION.md` (CREATE)
- [ ] `08-APPROVAL-GATE-SUMMARY.md` (CREATE)
- [ ] `09-README.md` (directory index and deployment readiness summary)

**Deliverables to Locate/Confirm:**
- [ ] Deliverable 54 (Day 0 Monitoring Specification)
- [ ] Deliverable 59 (Governance Compliance Verification Report)

---

## Release Commit Reference

```
Commit: 58ed262a609fc2b50b4aed0c5ce6ef9c2930bc51
Author: [deployment operator]
Date: 2026-06-01

fix(marketing): align soft launch proof and AuditOS links

Modified Files:
- src/components/layout/site-header.tsx (+1, -1)
  Navigation link from /case-studies → /proof-library
  
- src/app/(marketing)/page.tsx (+3, -3)
  Three AuditOS demo links from /auditos → /products/audit

Rollback Target: 9049a3bf73383e460a488e5f3548812f4779f7ff
```

---

**Document Created:** 2026-06-01  
**Last Updated:** 2026-06-01  
**Status:** ARTIFACT LOCATION INDEX COMPLETE — Ready for next phase (Deliverable 54 confirmation and operational document creation)
