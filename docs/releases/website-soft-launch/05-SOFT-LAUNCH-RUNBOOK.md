# AQLIYA Website Soft-Launch Runbook

**Release:** AQLIYA Website Soft-Launch  
**Release Commit:** `58ed262a609fc2b50b4aed0c5ce6ef9c2930bc51`  
**Rollback Target:** `9049a3bf73383e460a488e5f3548812f4779f7ff`  
**Deployment Date:** [TO BE FILLED BY DEPLOYMENT OPERATOR]  
**Operator Name:** [TO BE FILLED BY DEPLOYMENT OPERATOR]  
**Execution Status:** [ ] NOT STARTED | [ ] IN PROGRESS | [ ] COMPLETE | [ ] ROLLED BACK

---

## PRE-DEPLOYMENT CHECKLIST

**All items must be completed before proceeding to Deployment Execution.**

### 1. Stakeholder Gate Approvals

- [ ] **Gate 1: Product Owner** has signed off (Section 5.1, CONTROLLED_SOFT_LAUNCH_DEPLOYMENT_PACKAGE.md)
  - Scope confirmed (8 public routes only)
  - P1 features excluded from soft-launch
  - Protected routes (`/audit/*`, `/decisions/*`, etc.) NOT exposed
  - Lead routing to pilot program confirmed
  - Pilot positioning messaging approved
  - Approver Name: _________________ Date: _________

- [ ] **Gate 2: Legal/Governance** has signed off (Section 5.2)
  - No overclaims in public content verified
  - No false product certifications present
  - Governance compliance confirmed (AQLIYA is platform, AuditOS is product, etc.)
  - Deployment scope clearly defined and compliant
  - Approver Name: _________________ Date: _________

- [ ] **Gate 3: Marketing** has signed off (Section 5.3)
  - Messaging alignment with soft-launch narrative verified
  - Proof point accuracy confirmed (case studies/examples)
  - Claim accuracy reviewed and approved
  - Copy tone and positioning consistent
  - Approver Name: _________________ Date: _________

- [ ] **Gate 4: Infrastructure/Deployment Target Owner** has signed off (Section 5.4)
  - Production environment identified and ready
  - DNS records updated (if applicable)
  - CDN configuration verified
  - Feature flags ready for soft-launch routes
  - Approver Name: _________________ Date: _________

- [ ] **Gate 5: Monitoring Owner** has signed off (Section 5.5)
  - Day 0 monitoring specification (Deliverable 54) active
  - Governance watchlist configured
  - Contact path monitoring enabled
  - Rollback triggers defined and monitored
  - Approver Name: _________________ Date: _________

### 2. Environment Verification

- [ ] **Production Deployment Target** confirmed: _________________________________
  - Cloud provider: [ ] AWS | [ ] GCP | [ ] Azure | [ ] Other: __________
  - Environment name: ________________________
  - Region: ________________________
  - Access credentials configured securely

- [ ] **Domain and DNS**
  - Primary domain: ________________________
  - DNS A records pointing to deployment target: ✅ VERIFIED
  - DNS propagation complete (if new): ✅ VERIFIED
  - TTL settings appropriate for rollback: ✅ VERIFIED

- [ ] **CDN Configuration** (if applicable)
  - CDN provider: [ ] Cloudflare | [ ] AWS CloudFront | [ ] Akamai | [ ] Other: __________
  - Cache invalidation process documented: ✅ YES
  - Purge on deployment plan: ✅ READY

- [ ] **Feature Flags**
  - Feature flag system configured: [ ] LaunchDarkly | [ ] Custom | [ ] Other: __________
  - 8 public routes flagged for soft-launch: ✅ READY
  - Rollback via flag disable tested: ✅ READY

- [ ] **Monitoring Infrastructure Active**
  - Monitoring platform: [ ] DataDog | [ ] New Relic | [ ] Prometheus | [ ] Other: __________
  - Alerting configured for Day 0: ✅ READY
  - Dashboards created (per Deliverable 54): ✅ READY

---

## DEPLOYMENT EXECUTION SEQUENCE

**Execute each step in order. Do not skip steps.**

### STEP 1: Pre-Deployment Technical Validation (30 minutes)

- [ ] **Verify Release Commit is Checked Out**
  ```bash
  git log --oneline -1
  # Output should be: 58ed262 fix(marketing): align soft launch proof and AuditOS links
  ```
  - **Status:** ✅ CONFIRMED | ❌ FAILED (explain): _________________________

- [ ] **Run TypeScript Compilation Check**
  ```bash
  npx tsc --noEmit
  ```
  - **Status:** ✅ PASSED | ❌ FAILED (explain): _________________________
  - If failed, stop and escalate to engineering

- [ ] **Verify Modified Files Are Correct**
  ```bash
  git diff 58ed262~1 58ed262
  ```
  Should show:
  - `src/components/layout/site-header.tsx`: `/case-studies` → `/proof-library`
  - `src/app/(marketing)/page.tsx`: `/auditos` → `/products/audit` (3 occurrences)
  - **Status:** ✅ VERIFIED | ❌ MISMATCH (explain): _________________________

- [ ] **Clean Environment Check**
  ```bash
  git status
  ```
  Output should be: "nothing to commit, working tree clean"
  - **Status:** ✅ CLEAN | ❌ DIRTY (list uncommitted changes): _________________________

### STEP 2: Build and Package (45 minutes)

- [ ] **Install Dependencies** (if not already present in deployment artifact)
  ```bash
  npm install
  ```
  - **Status:** ✅ COMPLETE | ❌ FAILED (explain): _________________________
  - Estimated time: 10-15 minutes

- [ ] **Run Production Build**
  ```bash
  npm run build
  ```
  - **Status:** ✅ COMPLETE | ❌ FAILED (explain): _________________________
  - Expected output: "compiled successfully" or similar
  - Estimated time: 15-20 minutes

- [ ] **Verify Build Output**
  - Check `.next/` directory exists: ✅ YES | ❌ NO
  - Check `.next/static/` contains optimized assets: ✅ YES | ❌ NO
  - Check build warnings/errors: [ ] None | [ ] Minor (list): _____________ | [ ] Critical (stop)

### STEP 3: Route Verification on Local/Staging (30 minutes)

*Skip if direct production deployment required; proceed to Step 4 in that case.*

- [ ] **Start Local Dev Server**
  ```bash
  npm run dev
  ```
  - Server running on: http://localhost:3000
  - **Status:** ✅ STARTED

- [ ] **Test All 8 Public Routes** (manual or automated smoke test)

| Route | HTTP Status | Content Check | Notes |
|-------|-------------|---------------|-------|
| `/` | [ ] 200 | [ ] Homepage loads | |
| `/proof-library` | [ ] 200 | [ ] Link verified (changed from `/case-studies`) | |
| `/pilot-proof` | [ ] 200 | [ ] Pilot info displays | |
| `/products/audit` | [ ] 200 | [ ] Product page loads (changed from `/auditos`) | |
| `/contact` | [ ] 200 | [ ] Contact form present | |
| `/executive-brief` | [ ] 200 | [ ] Brief content loads | |
| Navigation Header | [ ] All links | [ ] All public routes linked | |
| Navigation Footer | [ ] All links | [ ] Policy/legal links present | |

- **Overall Route Verification Status:** ✅ PASS | ❌ FAIL (explain): _________________________

- [ ] **Stop Local Dev Server**
  ```bash
  Ctrl+C
  ```

### STEP 4: Production Deployment via Vercel (15-30 minutes)

**Deployment Method: Vercel (via `git push origin main`)**

Vercel automatically deploys on pushes to the main branch. No manual deployment command is required after the git push.

- [ ] **Verify Vercel Configuration**
  - Vercel project linked to repository: ✅ YES
  - Build command configured: `npx prisma generate && next build --webpack`
  - Environment variables set in Vercel dashboard: ✅ YES
  - Production domain verified: _________________________________

- [ ] **Push Release Commit to Vercel**
  ```bash
  # Verify correct commit is checked out
  git log --oneline -1
  # Should show: 58ed262 fix(marketing): align soft launch proof and AuditOS links
  
  # Push to origin main (Vercel auto-deploys on push)
  git push origin main
  ```
  - **Status:** ✅ PUSHED
  - **Expected time:** < 1 minute for push
  - Expected output: `To github.com:[org]/[repo].git [new branch] main -> main` or similar

- [ ] **Monitor Vercel Deployment**
  - Vercel Dashboard URL: https://vercel.com/dashboard
  - Project: AQLIYA Website
  - Deployment status page: [Check Vercel UI for live progress]
  - **Status:** ✅ DEPLOYING | ✅ COMPLETE | ❌ FAILED (explain): _________________________
  - Expected deployment time: 5-20 minutes (build: ~5-10 min, deploy: ~1-5 min)

- [ ] **Verify Vercel Build Logs**
  - Open deployment URL in Vercel dashboard
  - Build stages should show:
    1. `npx prisma generate` — ✅ PASS
    2. `next build --webpack` — ✅ PASS (look for "compiled successfully")
    3. Deploy to edge network — ✅ PASS
  - **Status:** ✅ ALL STAGES PASSED | ❌ FAILED (explain): _________________________

- [ ] **Confirm Production URL is Live**
  - Vercel provides automatic URL: `https://[project-name].vercel.app`
  - Or custom domain: _________________________________
  - **Status:** ✅ LIVE | ❌ NOT ACCESSIBLE (explain): _________________________

### STEP 5: Production Route Verification (30 minutes)

*After deployment is complete, verify all 8 routes are live and accessible.*

- [ ] **Production Domain Ready**
  - Domain: _________________________________
  - DNS resolution: ✅ CONFIRMED (test with `ping` or `nslookup`)

- [ ] **Smoke Test All 8 Public Routes on Production**

| Route | Full URL | HTTP Status | Content Check | Notes |
|-------|----------|-------------|---------------|-------|
| `/` | | [ ] 200 | [ ] Loads | |
| `/proof-library` | | [ ] 200 | [ ] Content present | |
| `/pilot-proof` | | [ ] 200 | [ ] Loads | |
| `/products/audit` | | [ ] 200 | [ ] Loads | |
| `/contact` | | [ ] 200 | [ ] Form works | |
| `/executive-brief` | | [ ] 200 | [ ] Loads | |
| Nav header (all links) | | [ ] 200 | [ ] All functional | |
| Nav footer (all links) | | [ ] 200 | [ ] All functional | |

- **Overall Production Route Verification Status:** ✅ PASS | ❌ FAIL (explain): _________________________

- [ ] **Security Verification** (quick checks)
  - [ ] No console errors in browser dev tools
  - [ ] No 404/500 errors in network tab
  - [ ] HTTPS/TLS certificate valid: ✅ YES
  - [ ] Mixed content warnings: [ ] None | [ ] Present (explain): __________

### STEP 6: Activate Day 0 Monitoring (15 minutes)

*Reference Deliverable 54 (Day 0 Monitoring Specification)*

- [ ] **Enable Monitoring Dashboards**
  - Platform: _________________________ (DataDog, New Relic, etc.)
  - Dashboard URL: _________________________________
  - **Status:** ✅ ACTIVE

- [ ] **Verify Monitoring Data Collection**
  - Metrics arriving: ✅ YES | ❌ NO
  - Errors being captured: ✅ YES | ❌ NO
  - Logs streaming: ✅ YES | ❌ NO

- [ ] **Activate Governance Watchlist**
  - Watchlist configuration: ✅ READY (per Deliverable 54)
  - Alerts enabled: ✅ YES

- [ ] **Activate Contact Path Monitoring**
  - Lead capture path: ✅ MONITORING
  - Routing to pilot program: ✅ VERIFIED

- [ ] **Define and Test Rollback Triggers**
  - Primary trigger 1 (e.g., error rate > 5%): ✅ CONFIGURED
  - Primary trigger 2 (e.g., 404 errors > 100/min): ✅ CONFIGURED
  - Escalation path to operator: ✅ DOCUMENTED

- **Day 0 Monitoring Activation Status:** ✅ COMPLETE

---

## POST-DEPLOYMENT VALIDATION

**To be completed within 2 hours of deployment.**

- [ ] **Verify No Errors in Monitoring**
  - Review Day 0 dashboard
  - Error rate: ________% (should be < 1%)
  - 5xx errors: ________ count (should be < 10)
  - 4xx errors: ________ count (should be < 100)
  - **Status:** ✅ HEALTHY | ⚠️ ELEVATED | ❌ CRITICAL (escalate)

- [ ] **Verify All Route Response Times**
  - Average response time: ________ ms (should be < 500ms)
  - P95 response time: ________ ms (should be < 1000ms)
  - **Status:** ✅ ACCEPTABLE | ⚠️ SLOW | ❌ CRITICAL (escalate)

- [ ] **Confirm Contact Path Working**
  - Test lead capture: ✅ RECEIVED
  - Routing to pilot program verified: ✅ YES
  - **Status:** ✅ FUNCTIONAL

- [ ] **Notify Stakeholders**
  - Product Owner: ✅ NOTIFIED
  - Marketing: ✅ NOTIFIED
  - Monitoring Owner: ✅ NOTIFIED
  - Time notified: _________________________________

---

## ROLLBACK PROCEDURES

**Use only if post-deployment validation detects critical issues.**

### Rollback Trigger Conditions

Deploy rollback procedures if **any** of the following occur within 24 hours of deployment:

1. **Error Rate Exceeds 5%** for more than 5 minutes continuously
2. **Complete Route Unavailability** (more than 2 of 8 routes returning 5xx)
3. **Database Connectivity Loss** or data corruption detected
4. **Security Incident** detected (unauthorized access, data breach attempt)
5. **Lead Capture Path Failure** (no leads routing to pilot program)
6. **Manual Escalation** by Monitoring Owner or Product Owner

### Safe Rollback (Reversible via Git)

**Recommended method — can be reverted if rollback was incorrect.**

```bash
# Verify current state
git log --oneline -1

# Create revert commit (does NOT delete the release commit)
git revert 58ed262a609fc2b50b4aed0c5ce6ef9c2930bc51

# Push to remote
git push origin main

# Re-deploy from updated main branch
[Run deployment pipeline from Step 4]
```

- [ ] **Rollback Initiated** Time: _____________ Reason: _________________________________
- [ ] **Revert Commit Created** Hash: _________________________________
- [ ] **Changes Deployed** Status: ✅ LIVE
- [ ] **Monitoring Verified** Status: ✅ ERRORS RESOLVED
- [ ] **Stakeholders Notified** Status: ✅ COMPLETE

### Destructive Rollback (Permanent Reset)

**Use ONLY if safe rollback fails. Permanently removes release commit from history.**

```bash
# Verify rollback target is correct
git log --oneline 9049a3bf73383e460a488e5f3548812f4779f7ff

# Reset to rollback target (DESTRUCTIVE — will remove release commit)
git reset --hard 9049a3bf73383e460a488e5f3548812f4779f7ff

# Force push to remote (requires permissions)
git push origin main --force-with-lease
```

⚠️ **WARNING:** This action permanently removes the release commit. Use only as last resort.

- [ ] **Destructive Rollback Authorized By:** _________________________________ (name/approver)
- [ ] **Rollback Executed** Time: _____________ Hash reset to: 9049a3bf73383e460a488e5f3548812f4779f7ff
- [ ] **Production Verified** Status: ✅ ROLLED BACK
- [ ] **Post-Incident Review Scheduled** Date: _________________________________

---

## DEPLOYMENT SIGN-OFF

**Complete after successful deployment and post-deployment validation.**

- [ ] **Deployment Operator:** _____________________________ Date: __________
- [ ] **Monitoring Owner Verification:** _____________________________ Date: __________
- [ ] **Product Owner Approval:** _____________________________ Date: __________

**Deployment Status:** [ ] ✅ SUCCESS | [ ] ⚠️ PARTIAL | [ ] ❌ ROLLED BACK

**Notes/Issues Encountered:**

___________________________________________________________________________

___________________________________________________________________________

___________________________________________________________________________

---

**End of Runbook**

For rollback, monitoring, or escalation, refer to:
- CONTROLLED_SOFT_LAUNCH_DEPLOYMENT_PACKAGE.md (Section 7 & 8)
- Deliverable 54 (Day 0 Monitoring Specification)
- 06-POST-LAUNCH-MONITORING-PLAN.md
