# POST-LAUNCH MONITORING PLAN — SOFT-LAUNCH v1.0

**Release Commit:** `58ed262a609fc2b50b4aed0c5ce6ef9c2930bc51`  
**Launch Date:** 2026-06-01 (pending env, monitoring, gate, and authorization confirmation)  
**Monitoring Start:** T+0 (immediately after Vercel confirms deployment)  
**Plan Effectiveness:** First 7 days post-launch  
**Owner:** Monitoring Gate Stakeholder  
**Confirmed Vercel Project:** `aqliya-platform`  
**Confirmed Production Domains:** `https://www.aqliya.com`, `https://aqliya.com`, `https://aqliya-platform.vercel.app`  
**Runtime Consistency Still Pending:** `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`, `AUTH_SECRET`, and Sentry runtime confirmation

---

## 1. FIRST-HOUR CHECKS (T+0 to T+60 minutes)

### URL Availability & Response (0-15 minutes)

| Route | Expected Code | Check Method | Pass Criteria | Owner |
|-------|---------------|--------------|---------------|-------|
| `https://www.aqliya.com/` | 200 | HTTP HEAD | Responds within 2s | CDN/Vercel |
| `https://www.aqliya.com/proof-library` | 200 | HTTP HEAD | Responds within 2s | CDN/Vercel |
| `https://www.aqliya.com/pilot-proof` | 200 | HTTP HEAD | Responds within 2s | CDN/Vercel |
| `https://www.aqliya.com/products/audit` | 200 | HTTP HEAD | Responds within 2s | CDN/Vercel |
| `https://www.aqliya.com/contact` | 200 | HTTP HEAD | Responds within 2s | CDN/Vercel |
| `https://www.aqliya.com/executive-brief` | 200 | HTTP HEAD | Responds within 2s | CDN/Vercel |

**Failure Action:** If any route returns non-200 or timeout >3s, immediately escalate to Monitoring Gate Owner.

### Routing Verification (15-30 minutes)

| Check | Expected Result | Method | Owner |
|-------|-----------------|--------|-------|
| `/case-studies` redirects | Should 404 (not in soft-launch) | Browser visit | Monitoring Owner |
| `/auditos` path exists | Should 404 (replaced with `/products/audit`) | Browser visit | Monitoring Owner |
| Navigation header link | `/case-studies` → `/proof-library` | Browser inspect | Product Owner |
| Audit product link | `/auditos` → `/products/audit` | Browser inspect | Product Owner |

**Pass Criteria:** All internal routes correctly point to new URLs. No broken redirects.

### Vercel Dashboard Inspection (30-45 minutes)

| Check | Expected State | Verification | Owner |
|-------|----------------|--------------|-------|
| Deployment status | "Ready" or "Building" then "Ready" | Vercel dashboard | Infrastructure Owner |
| Build log | No errors, success message | Vercel → Deployments | Infrastructure Owner |
| Function execution time | <1s average response | Vercel → Analytics | Infrastructure Owner |
| Edge caching | Responses from CDN | Vercel → Analytics | Infrastructure Owner |

**Failure Action:** If build failed or deployment is "Error", immediately activate rollback procedure.

### Client-Side Console Check (45-60 minutes)

| Environment | Check | Expected State | Owner |
|-------------|-------|-----------------|-------|
| All routes | Browser console errors | No "404 Not Found" or "Routing error" messages | QA/Monitoring Owner |
| Homepage | Console warnings | No missing resource warnings | QA/Monitoring Owner |
| Contact form | Form submission test | No JavaScript errors on form focus | QA/Monitoring Owner |

**Pass Criteria:** No critical JavaScript errors, no routing exceptions, no resource 404s.

---

## 2. FIRST 24 HOURS (T+1h to T+24h)

### Hourly Response Time Sampling (Every Hour)

```
Time Window | Check | Tool | Pass Criteria
------------|-------|------|---------------
Every hour  | Homepage load time | SpeedCurve or Vercel Analytics | <2.5s (p95)
Every hour  | /products/audit load | SpeedCurve or Vercel Analytics | <2.5s (p95)
Every 2h    | All 6 routes response code | Custom monitoring | 100% returning 200
Every 2h    | Vercel build function latency | Vercel Analytics | <500ms p95
```

**Failure Trigger:** If p95 latency exceeds 5s or any 2-hour window sees <95% 200 responses, escalate.

### Engagement Monitoring (24-hour aggregate)

| Metric | Expected Range | Data Source | Owner |
|--------|-----------------|-------------|-------|
| Homepage visits | >10 (internal + stakeholders) | Analytics | Marketing Owner |
| /products/audit visits | >5 (targeted) | Analytics | Product Owner |
| /contact form submissions | >0 (if launched to contacts) | CRM integration | Sales Owner |
| Bounce rate (homepage) | <60% (internal benchmarks) | Analytics | Marketing Owner |

**Low-traffic note:** During soft-launch, traffic will be minimal (internal stakeholders + invited contacts only). These baselines assume limited initial audience.

### Error Rate Tracking (24-hour aggregate)

| Check | Pass Criteria | Data Source | Owner |
|-------|---------------|-------------|-------|
| HTTP 5xx errors | 0 errors expected | Vercel Analytics | Infrastructure Owner |
| JavaScript uncaught errors | 0 errors expected | Sentry (if enabled) | QA Owner |
| Contact form failures | 0 failures expected | Contact form backend logs | DevOps Owner |

**Failure Action:** Any unexpected error constitutes immediate incident escalation.

---

## 3. DAYS 2-7 MONITORING (T+24h to T+7d)

### Daily Health Check (Each Day 10:00 AM KSA)

**Checklist:**
- [ ] All 6 soft-launch routes returning 200
- [ ] Vercel dashboard shows "Ready" status
- [ ] No new deployment errors in build log
- [ ] Average response time <3s across all routes
- [ ] Engagement metrics trending (visits/day non-declining)
- [ ] No escalated error reports from team

**Format:** Daily 1-minute Slack status update. Template:

```
✓ Day X Post-Launch Status:
Routes: [6/6 live]
Vercel Status: [Ready]
Avg Response: [XXms]
Errors: [0]
Engagement: [YY visits]
Action Required: [None | details]
```

### Weekly Reporting (Day 7)

| Section | Content | Owner |
|---------|---------|-------|
| Route Uptime | % uptime for each route (target: 99.5%) | Infrastructure Owner |
| Response Performance | p50, p95, p99 latencies for each route | Infrastructure Owner |
| Error Summary | Total errors, categorized by type | QA/Monitoring Owner |
| Engagement Summary | Total visits, referral sources, engagement time | Marketing Owner |
| Stakeholder Feedback | Any feedback from invited contacts | Product Owner |
| Incidents | Any outages, bugs, or escalations | Incident Owner |

---

## 4. GOVERNANCE WATCHLIST

**Real-time monitoring for governance violations:**

### Route Compliance

| Watch For | Trigger | Action |
|-----------|---------|--------|
| Unauthorized routes appearing | Any route accessed that is NOT in the 8 soft-launch routes | Immediate investigation + potential rollback |
| Production workspace exposure | `/audit/*` or `/decisions/*` returning 200 to unauthenticated users | IMMEDIATE ROLLBACK |
| Real customer data in soft-launch | Customer names, audit records, or decisions in HTTP responses | IMMEDIATE ROLLBACK + Data audit |
| Authentication bypass | Homepage returns 403→200 without login | IMMEDIATE ROLLBACK |

### Data Compliance

| Watch For | Trigger | Action |
|-----------|---------|--------|
| PII in errors | Error messages contain email/phone/account IDs | Immediate escalation to Legal/Security |
| Unencrypted data transmission | Contact form data sent over HTTP | IMMEDIATE ROLLBACK |
| Log exposure | Vercel build logs contain secrets | Immediate rotation + investigation |

---

## 5. INCIDENT RESPONSE MATRIX

### Severity Levels

| Level | Criteria | Response Time | Owner |
|-------|----------|---------------|-------|
| **CRITICAL** | All routes down, data exposure, auth bypass | Immediate (<5 min) | Infrastructure Owner |
| **HIGH** | Single route down, poor performance (<1.5s p95), contact form broken | <15 min | Product Owner |
| **MEDIUM** | Non-critical route slow (>3s), minor UX issues | <1 hour | QA Owner |
| **LOW** | Console warnings, non-impact typos, minor styling | <24 hours | Monitoring Owner |

### Escalation Path

```
Detected → Severity Assessment → Owner Notification → Decision Point

Decision Point (CRITICAL):
├─ Rollback Immediately (most likely)
└─ Fix Forward (only if fix <30 min, very low risk)

Decision Point (HIGH):
├─ Rollback
├─ Fix Forward (max 2 hour window)
└─ Accept Risk (documented)

Decision Point (MEDIUM/LOW):
└─ Schedule fix, no rollback trigger
```

---

## 6. DAILY REPORT TEMPLATE

**File:** `monitoring-reports/post-launch-day-X.md`  
**Created:** Daily at 5:00 PM KSA  
**Owner:** Monitoring Owner

```markdown
# Post-Launch Monitoring Report — Day X

**Reporting Period:** [Date] 10:00 AM – [Date] 10:00 AM KSA
**Release Commit:** 58ed262a609fc2b50b4aed0c5ce6ef9c2930bc51

## Uptime Summary
| Route | Uptime % | Incidents |
|-------|----------|-----------|
| / | 100% | None |
| /proof-library | 100% | None |
| /pilot-proof | 100% | None |
| /products/audit | 100% | None |
| /contact | 100% | None |
| /executive-brief | 100% | None |

**Overall:** 100%

## Performance Summary
| Route | p50 | p95 | p99 |
|-------|-----|-----|-----|
| / | 500ms | 1200ms | 2100ms |
| [other routes...] | ... | ... | ... |

## Engagement Summary
- Total Visits: XX
- Unique Visitors: XX
- Top Route: [route] (XX visits)
- Contact Form: XX submissions
- Referral Sources: [listed]

## Error Summary
- HTTP 4xx: 0
- HTTP 5xx: 0
- JavaScript Errors: 0
- Governance Violations: 0

## Stakeholder Feedback
- Internal team: [feedback]
- Invited contacts: [feedback]
- Social mentions: [if applicable]

## Issues & Escalations
[None | details]

## Risk Assessment
- Deployment Stability: ✓ GREEN
- Data Compliance: ✓ GREEN
- Performance: ✓ GREEN
- User Engagement: ✓ GREEN

## Recommended Actions
[None | list]

---
Reported by: [Owner]  
Next Report: [Date & Time]
```

---

## 7. PHASE 9 EXIT CRITERIA (Day 7)

### Success Metrics to Achieve

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Route availability | 99.5% | TBD | |
| Average response time | <2.5s p95 | TBD | |
| Zero critical errors | 100% compliance | TBD | |
| Zero data exposure | 100% compliance | TBD | |
| Stakeholder approval | 100% satisfied | TBD | |
| Contact engagement | >1 qualified inquiry | TBD | |

### Day 7 Approval Gate

**Questions for Monitoring Owner:**

1. ✓ Have all 8 soft-launch routes been available 99.5%+ of the time?
2. ✓ Have we identified and resolved all post-launch incidents?
3. ✓ Have we confirmed zero governance violations or data exposure?
4. ✓ Are we ready to promote to next launch phase?

**Sign-off Required From:** Monitoring Gate Stakeholder

---

## 8. TRANSITION TO PHASE 11

If all Day 7 exit criteria are met:

1. **Archive Monitoring Reports** → `/monitoring-reports/post-launch-archived/`
2. **Update Product Status Matrix** → Mark soft-launch as "Complete"
3. **Prepare Phase 11 Brief** → Readiness for expanded launch
4. **Notify Stakeholders** → Day 7 success + next phase timeline

If any Day 7 criteria NOT met:

1. **Extend Monitoring** → Additional 7 days
2. **Issue Incident Report** → Document findings + root causes
3. **Propose Mitigation** → Fix forward or rollback decision
4. **Reschedule Day 7 Gate** → New evaluation date

---

**Monitoring Plan Status:** Ready for Day 0 Activation  
**Deliverable:** Deliverable 54 (Day 0 Monitoring Specification)  
**Next Owner Handoff:** Infrastructure Owner (Vercel) → Monitoring Owner (Post-Launch)
