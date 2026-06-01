# AQLIYA Website Soft-Launch Documentation Package — Directory Index

**Release Name:** AQLIYA Website Soft-Launch Phase 10 — P0 Patch  
**Release Commit:** `58ed262a609fc2b50b4aed0c5ce6ef9c2930bc51`  
**Rollback Target:** `9049a3bf73383e460a488e5f3548812f4779f7ff`  
**Current Deployment Status:** ⏸ **BLOCKED — VERCEL PROJECT AND DOMAIN CONFIRMED, ENV/MONITORING/GATES PENDING**  
**Package Prepared:** 2026-06-01  
**Total Files:** 10 (00–09)  

---

## 📋 PACKAGE OVERVIEW

This directory contains a complete, repository-based soft-launch documentation package for AQLIYA. The package includes:

- **Master governance and gating documents** (source of truth for approvals)
- **Deployment runbook** (step-by-step execution)
- **Monitoring specification** (Day 0 and beyond)
- **Pre-deployment confirmation** (blocking status and unblocking path)
- **Approval tracking** (5-gate stakeholder sign-off matrix)
- **Repository baseline verification** (clean state documentation)
- **Phase readiness assessments** (post-governance verification)
- **Artifact location index** (all deliverables mapped)
- **This index** (directory guide)

**Deployment Method:** Vercel via `git push origin main` with automatic build and deployment.

**Key Constraint:** No deployment code pushed. No build/lint/test run. Documentation and governance only.

---

## 📂 FILE-BY-FILE GUIDE

### 00-ARTIFACT-LOCATION-INDEX.md
**Purpose:** Master index mapping all 10 files, their status, and interdependencies.  
**Contains:**
- Artifact location map (all 10 files with paths)
- Release identity (commit, rollback target, scope)
- Artifact status summary (completion %)
- File relationship diagram
- Governance checkpoint list

**Use When:** You need a bird's-eye view of the entire package or need to find where something is documented.

**Status:** ✅ COMPLETE  

---

### 01-CONTROLLED_SOFT_LAUNCH_DEPLOYMENT_PACKAGE.md
**Purpose:** Master gating document containing release identity, included changes, verified launch routes, and 5-gate approval checklist.  
**Contains:**
- Release identity (commit `58ed262`, rollback `9049a3b`)
- 2 file changes (site-header.tsx, page.tsx) with exact line references
- 8 verified soft-launch routes (/, /proof-library, /pilot-proof, /products/audit, etc.)
- Explicitly excluded items (P1 pages, protected workspaces, broad campaigns)
- 5-gate pre-deployment approval checklist
- Rollback strategy (primary revert + destructive reset)
- Day 0 monitoring activation checklist
- Deployment decision block: BLOCKED — VERCEL PROJECT AND DOMAIN CONFIRMED, ENV/MONITORING/GATES PENDING

**Use When:** You need to understand the full scope of the soft-launch and what's included/excluded.

**Status:** ✅ READY FOR STAKEHOLDER APPROVAL  

---

### 02-PHASE-8-VERIFICATION-REPORT.md
**Purpose:** Post-governance audit route verification confirming all 8 soft-launch routes are operational and governance-compliant.  
**Contains:**
- Route verification results (8/8 routes ✅)
- Governance compliance audit per route
- Link correction verification (site-header.tsx, page.tsx)
- Redirect confirmation (/case-studies → /proof-library, /auditos → /products/audit)
- Governance statement verification (no overclaims, pilot positioning)
- Test data disclaimer verification

**Use When:** You need evidence that routes are actually compliant and ready.

**Status:** ✅ COMPLETE  

---

### 03-PHASE-9-READINESS-ASSESSMENT.md
**Purpose:** Post-governance Phase 9 readiness confirmation that system is technically ready for deployment.  
**Contains:**
- Technical readiness assessment (✅ COMPLETE)
- Deployment blockers current status (stakeholder approvals pending)
- Go/no-go decision: COMPLETE — DEPLOYMENT BLOCKED PENDING APPROVALS
- Next steps: await stakeholder sign-offs

**Use When:** You need confirmation of technical readiness (separate from governance/stakeholder approval).

**Status:** ✅ COMPLETE  

---

### 04-PHASE-10-RELEASE-BASELINE.md
**Purpose:** Repository baseline verification confirming clean state, release commit integrity, and rollback target verification.  
**Contains:**
- Clean repository state verification (git status, no uncommitted changes)
- Release commit integrity verification (commit `58ed262` on main branch)
- Baseline verification checklist (all items ✅)
- Soft-launch routes baseline (all 8 routes documented)
- Excluded items confirmation (P1 pages, protected workspaces)
- Baseline sign-off (clean state confirmed)

**Use When:** You need to verify the repository is in the correct state before deployment.

**Status:** ✅ COMPLETE  

---

### 05-SOFT-LAUNCH-RUNBOOK.md
**Purpose:** Step-by-step execution guide for deployment, aligned with Vercel deployment method.  
**Contains:**
- Pre-deployment checklist (5 stakeholder gates, environment verification)
- Deployment execution sequence (5 steps)
- STEP 1: Pre-deployment technical validation
- STEP 2: Pre-deployment monitoring check
- STEP 3: Soft-launch routes smoke test
- STEP 4: Production deployment via Vercel
  - Verify release commit
  - Push to main: `git push origin main`
  - Monitor Vercel build completion
  - Verify Vercel dashboard shows successful deployment
  - Confirm build command: `npx prisma generate && next build --webpack`
- STEP 5: Post-deployment verification
- Execution status tracking
- Operator sign-off

**Use When:** You're about to deploy or need deployment instructions.

**Status:** ✅ UPDATED — VERCEL-SPECIFIC  

---

### 06-POST-LAUNCH-MONITORING-PLAN.md
**Purpose:** Day 0 and beyond monitoring specification (Deliverable 54) defining checks, sampling, and governance watchlist.  
**Contains:**
- Release commit and rollback target
- First-hour checks (T+0 to T+60 min): 9 URL availability checks + routing verification
- First 24 hours monitoring (hourly sampling of response times, error rates, engagement)
- Days 2–7 monitoring (daily health checks, weekly summary reporting)
- Governance watchlist (4 real-time alerts for compliance violations)
- Incident response matrix (severity levels and escalation paths)
- Daily report template (for Day 0–7 monitoring)
- Phase 9 exit criteria (conditions for moving to ongoing monitoring)
- Transition to Phase 11 (normal ops)

**Use When:** Monitoring begins (Day 0) or you need to understand what to monitor and how.

**Status:** ✅ COMPLETE (This is Deliverable 54)  

---

### 07-PRE-DEPLOYMENT-CONFIRMATION.md
**Purpose:** Documents blocking status, confirmed Vercel project/domain identity, and remaining unblocking path.  
**Contains:**
- Current deployment status: ⏸ BLOCKED — VERCEL PROJECT AND DOMAIN CONFIRMED, ENV/MONITORING/GATES PENDING
- Deployment blocking reasons (env confirmation, monitoring runtime confirmation, all 5 gates PENDING)
- Readiness checklist (✅ completed items vs. ⏳ pending items)
- Validation questions for all 5 stakeholder gates
  - Gate 1: Product Owner (scope, P1 exclusion, positioning)
  - Gate 2: Legal/Governance (compliance, no false claims)
  - Gate 3: Marketing (messaging, pilot positioning)
  - Gate 4: Infrastructure (Vercel ready, DNS/CDN)
  - Gate 5: Monitoring (Deliverable 54 tested in Vercel, alerts active)
- Gate summary table (current status of all 5 gates)
- Unblocking instructions (how to resolve each blocker)
- Deployment procedure (command and steps after unblocking)
- Rollback procedure (primary and destructive rollback methods)
- Final authorization sign-offs (coordinator, operator, on-call)

**Use When:**
- You're blocked and need to understand why
- You're a stakeholder and need to know what to approve
- You're unblocking deployment and need instructions

**Status:** ⏸ BLOCKING DEPLOYMENT  

---

### 08-APPROVAL-GATE-SUMMARY.md
**Purpose:** 5-gate stakeholder approval tracking matrix showing current sign-off status.  
**Contains:**
- Executive summary (gate status: 0 of 5 signed off)
- Gate 1–5 approval status (each gate with items to verify, owner, date, status)
- Overall gate status matrix (all gates, owners, sign-off dates, timelines)
- Approval timeline (Phase 1: notifications → Phase 2: testing → Phase 3: unblock/deploy)
- Current blockers summary (Monitoring Owner test status, all gates PENDING)
- Gate sign-off collection workflow
- Contingency if gate rejects (remediation steps)

**Use When:**
- You need to track which gates have signed off
- You're collecting approvals and need a matrix
- You need to know the current approval status

**Status:** ⏳ 0 of 5 gates signed off  

---

### 09-README.md
**Purpose:** This file. Directory index and navigation guide for the entire package.  
**Contains:**
- Package overview
- File-by-file guide (what each file contains, when to use it, status)
- Quick-start guide (for different personas)
- Key documents and dependencies
- Important constraints
- Navigation and cross-references

**Use When:** You're new to the package or need to find a specific document.

**Status:** ✅ THIS FILE  

---

## 🚀 QUICK-START GUIDE

### If You're a **Stakeholder** (need to approve deployment):

1. Read **08-APPROVAL-GATE-SUMMARY.md** to see your gate and what you're approving
2. Read your specific validation questions in **07-PRE-DEPLOYMENT-CONFIRMATION.md**
3. Review **01-CONTROLLED_SOFT_LAUNCH_DEPLOYMENT_PACKAGE.md** for the full scope
4. Sign off your gate with ✅ APPROVED or provide rejection reason

**Time Estimate:** 30 minutes

---

### If You're the **Monitoring Owner** (critical blocker):

1. Read **06-POST-LAUNCH-MONITORING-PLAN.md** (Deliverable 54 — what to monitor)
2. Read **07-PRE-DEPLOYMENT-CONFIRMATION.md**, Gate 5 section (your validation questions)
3. **TEST Deliverable 54 IN PRODUCTION VERCEL ENVIRONMENT** using the testing checklist
4. Confirm status: ✅ TESTED IN VERCEL
5. Sign off your gate

**Time Estimate:** 1–2 hours (mostly testing in Vercel)

---

### If You're the **Deployment Operator** (executing deployment):

1. Read **05-SOFT-LAUNCH-RUNBOOK.md** (execution steps)
2. Ensure all 5 gates in **08-APPROVAL-GATE-SUMMARY.md** are ✅ APPROVED
3. Execute STEP 1–5 in the runbook
4. Start monitoring per **06-POST-LAUNCH-MONITORING-PLAN.md**
5. Sign off completion

**Time Estimate:** 30 minutes (execution) + 1 hour (Day 0 monitoring)

---

### If You're **Unblocking Deployment** (deployment coordinator):

1. Read **07-PRE-DEPLOYMENT-CONFIRMATION.md** to understand current blockers
2. Distribute validation questions to all 5 gate owners
3. **Track Monitoring Owner's test of Deliverable 54 in Vercel** (critical blocker)
4. Collect all 5 sign-offs
5. Update **08-APPROVAL-GATE-SUMMARY.md** with collected approvals
6. Update **07-PRE-DEPLOYMENT-CONFIRMATION.md** status to ✅ READY FOR DEPLOYMENT
7. Schedule deployment window and notify operator

**Time Estimate:** 2–3 days (waiting for approvals)

---

### If You're **Verifying Governance Compliance**:

1. Read **01-CONTROLLED_SOFT_LAUNCH_DEPLOYMENT_PACKAGE.md** for scope and exclusions
2. Read **02-PHASE-8-VERIFICATION-REPORT.md** for route compliance verification
3. Read **03-PHASE-9-READINESS-ASSESSMENT.md** for technical readiness
4. Check **04-PHASE-10-RELEASE-BASELINE.md** for repository baseline

**Time Estimate:** 1 hour

---

## 🔗 KEY DOCUMENTS AND DEPENDENCIES

### Master Documents (Source of Truth)

- **01-CONTROLLED_SOFT_LAUNCH_DEPLOYMENT_PACKAGE.md** — The governance bible. Everything else is derived from this.
- **08-APPROVAL-GATE-SUMMARY.md** — Real-time tracking of approval status. Update this as gates sign off.

### Execution Documents

- **05-SOFT-LAUNCH-RUNBOOK.md** — Step-by-step execution. Use this when deploying.
- **07-PRE-DEPLOYMENT-CONFIRMATION.md** — Validation questions and unblocking path. Use this when blocked.

### Verification Documents

- **02-PHASE-8-VERIFICATION-REPORT.md** → Proves routes are compliant
- **03-PHASE-9-READINESS-ASSESSMENT.md** → Proves technical readiness
- **04-PHASE-10-RELEASE-BASELINE.md** → Proves clean repository state

### Monitoring Document

- **06-POST-LAUNCH-MONITORING-PLAN.md** (Deliverable 54) → What to monitor on Day 0 and beyond. **Critical for Gate 5 sign-off.**

### Navigation

- **00-ARTIFACT-LOCATION-INDEX.md** → Artifact location map
- **09-README.md** → You are here

---

## ⚠️ IMPORTANT CONSTRAINTS

### Hard Constraints (Non-Negotiable)

- ❌ **Do NOT deploy.** This package is documentation only.
- ❌ **Do NOT push to main.** Deployment is pending stakeholder approvals.
- ❌ **Do NOT modify product code.** Only documentation has been created.
- ❌ **Do NOT run build/lint/test.** Deployment verification is pending approval.
- ❌ **Do NOT run Prisma.** Schema is unchanged.
- ❌ **Do NOT add P1 pages.** Only 8 verified routes are soft-launching.
- ❌ **Do NOT change routes.** Site-header.tsx and page.tsx changes are documented; no new routes.

### Deployment Blockers (Active)

- ✅ **Vercel project and production domains confirmed.** Project `aqliya-platform`; domains `https://www.aqliya.com`, `https://aqliya.com`, `https://aqliya-platform.vercel.app`.
- ⏳ **Vercel env names and URL consistency still pending.** Confirm `AUTH_SECRET`, auth/app URLs, and Sentry names in production Vercel.
- ⏳ **All 5 stakeholder gates PENDING.** No gate has signed off yet.

### Key Release Information

- **Release Commit:** `58ed262a609fc2b50b4aed0c5ce6ef9c2930bc51`
- **Rollback Target:** `9049a3bf73383e460a488e5f3548812f4779f7ff`
- **Deployment Method:** Vercel via `git push origin main` (auto-deploys)
- **Current Status:** ⏸ BLOCKED — VERCEL PROJECT AND DOMAIN CONFIRMED, ENV/MONITORING/GATES PENDING.

---

## 📊 PACKAGE STATUS AT A GLANCE

| Aspect | Status |
|--------|--------|
| **Documentation Complete** | ✅ 10 files ready |
| **Governance Compliance** | ✅ Verified in Phase 8 |
| **Technical Readiness** | ✅ Confirmed in Phase 9 |
| **Repository Baseline** | ✅ Clean release baseline documented (Phase 10) |
| **Stakeholder Approvals** | ⏳ 0 of 5 gates signed (0%) |
| **Monitoring Specification** | ✅ Complete (Deliverable 54) |
| **Monitoring Testing in Vercel** | ⏳ Pending (Gate 5 blocker) |
| **Deployment Readiness** | ⏸ **BLOCKED** |
| **Unblocking Timeline** | 2–3 days (awaiting approvals) |

---

## 🔄 FILE RELATIONSHIPS

```
01-CONTROLLED_SOFT_LAUNCH_DEPLOYMENT_PACKAGE.md (Master)
    ├─ Scope & Governance
    ├─ 5-Gate Requirements
    └─ Rollback Strategy

02-PHASE-8-VERIFICATION-REPORT.md (Evidence)
    └─ Proves routes compliant

03-PHASE-9-READINESS-ASSESSMENT.md (Evidence)
    └─ Proves technical ready

04-PHASE-10-RELEASE-BASELINE.md (Evidence)
    └─ Proves clean state

05-SOFT-LAUNCH-RUNBOOK.md (Execution)
    ├─ Uses release commit from 01
    ├─ References rollback target from 01
    └─ Uses Vercel method from 01

06-POST-LAUNCH-MONITORING-PLAN.md (Deliverable 54)
    ├─ What to monitor after deployment
    └─ Critical for Gate 5 sign-off

07-PRE-DEPLOYMENT-CONFIRMATION.md (Gating)
    ├─ Validation questions for Gates 1–5
    ├─ References requirements from 01
    └─ Unblocking path to deployment

08-APPROVAL-GATE-SUMMARY.md (Tracking)
    ├─ 5-gate approval status
    ├─ Collects sign-offs from Gates 1–5
    └─ Updated as gates sign off

00-ARTIFACT-LOCATION-INDEX.md (Navigation)
    └─ Maps all 9 files + this index

09-README.md (You are here)
    └─ Directory guide
```

---

## 📝 DOCUMENT MAINTENANCE

### Updating This Package

**If scope changes:**
1. Update **01-CONTROLLED_SOFT_LAUNCH_DEPLOYMENT_PACKAGE.md** (master)
2. Re-verify routes in **02-PHASE-8-VERIFICATION-REPORT.md**
3. Update **05-SOFT-LAUNCH-RUNBOOK.md** if execution steps change
4. Update **07-PRE-DEPLOYMENT-CONFIRMATION.md** validation questions

**If gates sign off:**
1. Update **08-APPROVAL-GATE-SUMMARY.md** with date + signature
2. Update status in **07-PRE-DEPLOYMENT-CONFIRMATION.md** to reflect progress
3. When all gates ✅: Update status to ✅ READY FOR DEPLOYMENT

**If deployment fails:**
1. Log failure reason in **05-SOFT-LAUNCH-RUNBOOK.md** execution section
2. Document rollback execution in **07-PRE-DEPLOYMENT-CONFIRMATION.md**
3. Post-mortem findings in **03-PHASE-9-READINESS-ASSESSMENT.md** as remediation

---

## 🎯 SUCCESS CRITERIA

**Deployment is successful when:**

- [ ] All 5 stakeholder gates signed off (✅ APPROVED)
- [ ] Monitoring Owner tested Deliverable 54 in production Vercel
- [ ] Deployment executed: `git push origin main` to Vercel
- [ ] Vercel build completed successfully
- [ ] Day 0 monitoring (first-hour checks) all ✅ PASS
- [ ] No errors in Vercel dashboard
- [ ] 8 soft-launch routes responding 200 OK
- [ ] Governance watchlist showing no violations
- [ ] Contact form submissions routing correctly

---

## 📞 QUESTIONS OR ESCALATIONS

**If you have questions:**

1. Check the file-by-file guide above to find the relevant document
2. Read the relevant document section for your question
3. If still unclear, refer to **01-CONTROLLED_SOFT_LAUNCH_DEPLOYMENT_PACKAGE.md** (master document)

**If deployment is blocked:**

1. Read **07-PRE-DEPLOYMENT-CONFIRMATION.md** (why you're blocked)
2. Follow unblocking instructions in that document
3. Critical blocker: Monitoring Owner must test Deliverable 54 in Vercel

**If something changed after this package was prepared:**

1. Update the relevant file in this directory
2. Note the change date and reason
3. Re-verify governance compliance if scope changed

---

## 📄 DOCUMENT CONTROL

**Package Version:** 1.0  
**Last Updated:** 2026-06-01  
**Current Status:** ⏸ BLOCKED — VERCEL PROJECT AND DOMAIN CONFIRMED, ENV/MONITORING/GATES PENDING.  
**Total Files:** 10 (00–09)  
**Deployment Method:** Vercel via `git push origin main`  
**Release Commit:** `58ed262a609fc2b50b4aed0c5ce6ef9c2930bc51`  
**Rollback Target:** `9049a3bf73383e460a488e5f3548812f4779f7ff`  

---

## 🚦 NEXT STEPS

1. **Deployment Coordinator:** Distribute **07-PRE-DEPLOYMENT-CONFIRMATION.md** to all 5 gate owners
2. **Monitoring Owner:** Test Deliverable 54 in production Vercel (critical blocker)
3. **All Gates:** Complete validation questions in **07-PRE-DEPLOYMENT-CONFIRMATION.md**
4. **Deployment Coordinator:** Collect sign-offs and update **08-APPROVAL-GATE-SUMMARY.md**
5. **When all gates ✅ APPROVED:** Proceed to deployment using **05-SOFT-LAUNCH-RUNBOOK.md**

**Expected Timeline:** 2–3 days to unblock, 30 minutes to deploy, 1 hour Day 0 monitoring.

---

**End of README**
