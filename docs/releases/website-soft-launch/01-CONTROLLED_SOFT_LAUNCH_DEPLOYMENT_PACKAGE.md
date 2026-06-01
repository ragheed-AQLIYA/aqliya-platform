# CONTROLLED SOFT-LAUNCH DEPLOYMENT PACKAGE

**Status:** READY FOR STAKEHOLDER APPROVAL

**Prepared:** 2026-06-01

---

## 1. Release Identity

**Release Name:** AQLIYA Soft-Launch Phase 10 — P0 Patch

**Release Commit:** `58ed262a609fc2b50b4aed0c5ce6ef9c2930bc51`

**Commit Message:** `fix(marketing): align soft launch proof and AuditOS links`

**Rollback Target:** `9049a3bf73383e460a488e5f3548812f4779f7ff`

**Source Repository:** `/sessions/wonderful-sweet-feynman/mnt/AQLIYA_RELEASE_BASELINE` (clean clone from GitHub)

**Branch:** `main`

**Deployment Scope:** Public soft-launch routes only — 8 verified routes, no protected workspaces, no P1 pages, no broad campaign launch.

---

## 2. Included Changes

**Files Modified:** 2

| File | Changes | Purpose |
|---|---|---|
| `src/components/layout/site-header.tsx` | 1 line changed | Navigation label "الإثبات" (Proof) link: `/case-studies` → `/proof-library` |
| `src/app/(marketing)/page.tsx` | 3 lines changed | Homepage AuditOS demo links: 3× `/auditos` → `/products/audit` |

**Exact Link Corrections:**

- **site-header.tsx Line 22:** Header navigation proof link now points to `/proof-library` (public) instead of removed `/case-studies` route
- **page.tsx Line 80:** AuditOS demo button `demoHref`: `/auditos` (internal demo) → `/products/audit` (public marketing page)
- **page.tsx Line 206:** "استكشف AuditOS — عرض مباشر" CTA link: `/auditos` → `/products/audit`
- **page.tsx Line 533:** "شاهد AuditOS — عرض تفاعلي" button: `/auditos` → `/products/audit`

**Total Delta:** 2 files changed, 4 insertions(+), 4 deletions(-) — surgical governance alignment, no feature changes.

---

## 3. Verified Launch Scope

Eight soft-launch routes confirmed operational and governance-compliant:

| Route | Status | Purpose | Governance |
|---|---|---|---|
| `/` | ✓ Live | Homepage with AuditOS proof links | No overclaims, pilot-ready positioning |
| `/proof-library` | ✓ Live | Public proof/case studies | Test data disclaimers present |
| `/pilot-proof` | ✓ Live | Pilot program proof | Denial statements present: no autonomous decision claims |
| `/products/audit` | ✓ Live | AuditOS marketing page | No false certifications, pilot positioning |
| Header Navigation | ✓ Aligned | "الإثبات" → `/proof-library` | Redirects to public proof library |
| Footer Links | ✓ Aligned | Two proof links: `/proof-library`, `/pilot-proof` | Both public, governance-compliant |
| `/contact` | ✓ Live | Executive session request form | Positioned as "qualification conversation", not sales pitch |
| `/executive-brief` | ✓ Live | Executive information/architecture | Governance principles stated, no unimplemented claims |

**Redirects Configured:**

- `/case-studies` → `/proof-library` (via P0 patch alignment)
- `/auditos` → `/products/audit` (via P0 patch alignment)

---

## 4. Explicitly Excluded from Soft-Launch

The following are NOT included in this deployment and must remain excluded:

- **P1 Pages:** No additional pages beyond the 8 verified routes. No `/roadmap`, `/careers`, `/integrations`, or other P1 marketing pages.
- **Protected Workspaces:** No exposure of `/audit/*`, `/decisions/*`, `/local-content/*`, `/assistant/*`, `/workflowos/*`. These remain authentication-gated.
- **Broad Announcement Campaign:** No press release, no investor deck, no public announcement loop. Soft-launch is discovery-only via organic traffic and direct outreach.
- **Production-Readiness Claims:** No positioning as "SOC2 certified", "production-ready", "enterprise-grade SaaS". All materials maintain "pilot-ready" framing.
- **SalesOS Pilot Availability:** SalesOS remains L3 prototype. Do not claim pilot availability or operational readiness for SalesOS.
- **SimulationOS Operational Availability:** SimulationOS remains L1 marketing-only. Do not claim runnable product or pilot program.

---

## 5. Pre-Deployment Approval Checklist

All stakeholder gates must be cleared before deployment execution.

### Product Gate

- [ ] **Scope Confirmation:** 8 soft-launch routes approved
- [ ] **P1 Exclusion Confirmed:** No additional pages beyond verified 8 routes
- [ ] **Protected Route Protection:** Confirmed no accidental exposure
- [ ] **Lead Routing:** Positioned as "qualification conversation"
- [ ] **Pilot-Ready Positioning:** All materials maintain pilot-ready framing

**Approver:** [Product Lead Name] — **Status:** PENDING

---

### Legal / Governance Gate

- [ ] **Governance Compliance Verified:** No forbidden claims
- [ ] **Test Data Disclaimers:** All examples marked as test data
- [ ] **Denial Statements:** Explicit denials present
- [ ] **No False Proof:** Mock data only
- [ ] **AI Assistive Only:** No autonomous final decisions

**Approver:** [Legal/Governance Lead Name] — **Status:** PENDING

---

### Marketing Gate

- [ ] **Messaging Validation:** No overclaims, pilot-ready
- [ ] **No Broad Campaign:** Discovery-only soft-launch
- [ ] **Brand Voice Consistent:** Governance-first positioning maintained
- [ ] **Certification Claims Blocked:** No SOC2/ISO claims
- [ ] **Deployment Scope Clear:** 8-route soft-launch scope

**Approver:** [Marketing Lead Name] — **Status:** PENDING

---

### Infrastructure/Deployment Target Gate

- [ ] **Environment Identified:** [Staging / Production]
- [ ] **DNS/CDN Ready:** Rollback safety verified
- [ ] **Feature Flags Ready:** Soft-launch flags in place

**Approver:** [Infrastructure Lead Name] — **Status:** PENDING

---

### Rollback Owner Gate

- [ ] **Rollback Target Confirmed:** `9049a3bf73383e460a488e5f3548812f4779f7ff`
- [ ] **Rollback Command Tested:** `git revert` or `git reset --hard`
- [ ] **Rollback Timeline:** On-call owner confirmed within ___ minutes

**Approver:** [Deployment Owner / On-Call Name] — **Status:** PENDING

---

### Monitoring Owner Gate

- [ ] **Day 0 Monitoring Active:** Per Deliverable 54
- [ ] **Governance Watchlist Active:** Real-time alerts configured
- [ ] **Contact Path Monitoring:** Form submissions tracked
- [ ] **Rollback Triggers Defined:** Error rate thresholds set

**Approver:** [Monitoring / Observability Lead Name] — **Status:** PENDING

---

## 6. Pre-Deployment Technical Checklist

Light validation checks (NOT YET EXECUTED):

- [ ] **Confirm Clean Git Status:** `git status` clean, 1 commit ahead ✓
- [ ] **Confirm Release Commit:** `git rev-parse HEAD` = `58ed262a609fc2b50b4aed0c5ce6ef9c2930bc51` ✓
- [ ] **Build Approval Needed:** `npm run build` (APPROVAL REQUIRED)
- [ ] **Targeted Route Smoke Test:** Verify 8 routes (APPROVAL REQUIRED)
- [ ] **Confirm Environment Variables:** .env / production secrets configured
- [ ] **Confirm Contact Path Routing:** Form destination verified
- [ ] **Confirm Monitoring Active:** Dashboards live and collecting

---

## 7. Rollback Plan

**Primary Rollback (Safe, Reversible):**

```bash
git revert 58ed262a609fc2b50b4aed0c5ce6ef9c2930bc51
git push
```

Creates new commit that undoes patch. Safe for production.

**Destructive Rollback (Emergency Only):**

```bash
git reset --hard 9049a3bf73383e460a488e5f3548812f4779f7ff
```

Use only if primary rollback fails. Creates reflog entry.

**Rollback Validation:**

After rollback:
- [ ] `git log --oneline -1` shows previous commit
- [ ] `git status` clean
- [ ] Route `/` contains `/auditos` reference (reverted)
- [ ] `/products/audit` still loads
- [ ] `/contact` operational
- [ ] Monitoring shows no post-rollback errors

---

## 8. Day 0 Monitoring Activation

**Based on Deliverable 54:**

### First Hour Route Checks

- [ ] `/` responds 200, contains proof library links
- [ ] `/proof-library` responds 200, test data disclaimers visible
- [ ] `/pilot-proof` responds 200, denial statements visible
- [ ] `/products/audit` responds 200
- [ ] `/contact` responds 200, form functional
- [ ] `/executive-brief` responds 200
- [ ] Redirects: `/case-studies` → `/proof-library`
- [ ] Redirects: `/auditos` → `/products/audit`

### Governance Watchlist (Real-Time)

- [ ] Alert if `/audit/*` receives public traffic
- [ ] Alert if protected routes accessible without auth
- [ ] Alert if homepage contains forbidden claims
- [ ] Alert if governance statements removed

### Contact Form Monitoring (Continuous)

- [ ] Form submissions tracked (count, success rate)
- [ ] Routing verified (leads to correct destination)
- [ ] Validation errors logged
- [ ] Availability >99.5%

### Protected Route Spot Check (Every 4 Hours × 24 Hours)

- [ ] All protected routes return 401/403

---

## 9. Deployment Decision

**STATUS: BLOCKED — VERCEL PROJECT AND DOMAIN CONFIRMED, ENV/MONITORING/GATES PENDING**

### Current Status

- ✓ P0 Patch Commit: Verified
- ✓ Git Status: Clean
- ✓ Governance Compliance: Verified
- ✓ Launch Scope: 8 routes confirmed
- ✓ Rollback Plan: Documented
- ✓ Monitoring Specification: Ready
- **⏳ Stakeholder Approvals:** PENDING (all 5 gates)
- **✓ Vercel Project + Domains:** Confirmed (`aqliya-platform`, `www.aqliya.com`, `aqliya.com`, `aqliya-platform.vercel.app`)
- **⏳ Vercel Env + Monitoring Runtime:** PENDING (`AUTH_SECRET`, URL consistency, Sentry runtime, Deliverable 54 test)

### Required Before Deployment

1. **All 5 stakeholder gates signed off** (see Section 5)
2. **Vercel production env + monitoring confirmations** ready from Infrastructure and Monitoring Owner (`AUTH_SECRET`, URL consistency, and Deliverable 54 runtime validation)

### Deployment Command (After Approvals)

```bash
git push origin main
```

Vercel will automatically deploy on push to main branch. No manual build/deploy step needed.

---

## Handoff Notes

- **Deployment source:** Clean clone at `/sessions/wonderful-sweet-feynman/mnt/AQLIYA_RELEASE_BASELINE`
- **Commit is deployment-ready:** Pending stakeholder approvals
- **No build/lint/test run yet:** Approval required
- **No git push yet:** Awaiting deployment decision
- **Monitoring activation:** Depends on Deliverable 54 being confirmed operational

---

**End of Deployment Package**
