# AQLIYA AuditOS — Production Readiness Action Plan

## Goal

Close the 7.5-point gap from **27.5/35 to 35/35** and achieve external production readiness.

---

## Gap 1: Real Scanner Provider Integration

| Field | Value |
|-------|-------|
| Current score | 2.5/5 |
| Target score | 5/5 |
| Points to gain | +2.5 |
| Priority | **Critical** |
| Dependency | External provider |

### Required Actions

| # | Action | Owner | Target |
|---|--------|-------|--------|
| 1.1 | Select scanner provider (ClamAV, cloud, or equivalent) | AQLIYA eng | Pre-production |
| 1.2 | Integrate provider into `src/lib/audit/file-scanner.ts` | AQLIYA eng | Pre-production |
| 1.3 | Set `SCANNER_PROVIDER` in production environment | AQLIYA eng | Pre-production |
| 1.4 | Verify clean file passes, infected file blocked | AQLIYA eng | Pre-production |
| 1.5 | Verify scan AuditEvent recorded per upload | AQLIYA eng | Pre-production |
| 1.6 | Test scanner failure blocks upload | AQLIYA eng | Pre-production |

### Success Criteria

```txt
1. SCANNER_PROVIDER configured in production
2. evidence.file_scanned AuditEvent created on each upload
3. Infected file blocks upload
4. Scanner failure blocks upload
5. Clean file proceeds to evidence creation
```

---

## Gap 2: SSO/OAuth Configuration

| Field | Value |
|-------|-------|
| Current score | 2.5/5 |
| Target score | 5/5 |
| Points to gain | +2.5 |
| Priority | **Critical** |
| Dependency | Auth provider decision |

### Required Actions

| # | Action | Owner | Target |
|---|--------|-------|--------|
| 2.1 | Select SSO/OAuth provider (Google, Azure AD, Okta) | Product lead | Pre-production |
| 2.2 | Configure provider in `src/lib/auth-config.ts` | AQLIYA eng | Pre-production |
| 2.3 | Test user login via SSO | AQLIYA eng | Pre-production |
| 2.4 | Verify session → AuditUser mapping still works | AQLIYA eng | Pre-production |
| 2.5 | Disable or restrict Credentials provider | AQLIYA eng | Pre-production |

### Success Criteria

```txt
1. Users can log in via SSO/OAuth
2. getAuditActor() maps SSO session to AuditUser
3. Credentials provider restricted or disabled
4. Role enforcement works with SSO sessions
```

---

## Gap 3: Risk Acceptance Form Signed

| Field | Value |
|-------|-------|
| Current score | 2.5/3 (Export) |
| Target score | 3/3 |
| Points to gain | +0.5 |
| Priority | High |
| Dependency | Stakeholder availability |

### Required Actions

| # | Action | Owner | Target |
|---|--------|-------|--------|
| 3.1 | Present Risk Acceptance Form to stakeholder | Pilot sponsor | Pre-production |
| 3.2 | Stakeholder reviews limitations | Stakeholder | Pre-production |
| 3.3 | Signature obtained | Pilot sponsor | Pre-production |

### Success Criteria

```txt
1. Signed Risk Acceptance Form filed in docs/
2. Export category scores 3/3
```

---

## Gap 4: On-Call Staffing

| Field | Value |
|-------|-------|
| Current score | 3.5/4 (Operations) |
| Target score | 4/4 |
| Points to gain | +0.5 |
| Priority | High |
| Dependency | Named individuals |

### Required Actions

| # | Action | Owner | Target |
|---|--------|-------|--------|
| 4.1 | Assign named L1 support person | Product lead | Pre-production |
| 4.2 | Assign named L2 engineering contact | Product lead | Pre-production |
| 4.3 | Assign named L3 infrastructure contact | Product lead | Pre-production |
| 4.4 | Update `docs/auditos/operations-on-call.md` | Product lead | Pre-production |

### Success Criteria

```txt
1. Named individuals assigned to L1, L2, L3
2. Contact information documented
3. Response time targets documented
```

---

## Gap 5: Escalation Test Execution

| Field | Value |
|-------|-------|
| Current score | 3.5/4 (Operations) |
| Target score | 4/4 |
| Points to gain | +0.5 |
| Priority | High |
| Dependency | On-call staffing completed |

### Required Actions

| # | Action | Owner | Target |
|---|--------|-------|--------|
| 5.1 | Select test scenario (e.g., DB connection lost) | Pilot operator | Pre-production |
| 5.2 | Execute escalation test per `docs/auditos/escalation-test-log.md` | Pilot operator | Pre-production |
| 5.3 | Document response times and gaps | Pilot operator | Pre-production |
| 5.4 | Remediate any gaps found | AQLIYA eng | Pre-production |

### Success Criteria

```txt
1. Escalation test executed
2. Response times documented
3. Gaps identified and assigned
4. Test log filed
```

---

## Gap 6: Backup Scheduler Activation

| Field | Value |
|-------|-------|
| Current score | 3.5/4 (Backup) |
| Target score | 4/4 |
| Points to gain | +0.5 |
| Priority | High |
| Dependency | Server access |

### Required Actions

| # | Action | Owner | Target |
|---|--------|-------|--------|
| 6.1 | Configure cron/systemd timer per `docs/auditos/backup-schedule-evidence.md` | Infra admin | Pre-production |
| 6.2 | Verify backup runs on schedule | Infra admin | Pre-production |
| 6.3 | Add backup monitoring check | Infra admin | Pre-production |

### Success Criteria

```txt
1. Scheduled backup runs automatically
2. Backup file created on schedule
3. Backup verification passes (npm run backup:verify)
```

---

## Gap 7: Penetration Test Execution

| Field | Value |
|-------|-------|
| Current score | 4/5 (Security) |
| Target score | 5/5 |
| Points to gain | +1.0 |
| Priority | High |
| Dependency | External vendor |

### Required Actions

| # | Action | Owner | Target |
|---|--------|-------|--------|
| 7.1 | Select pen test vendor | Security lead | Pre-production |
| 7.2 | Schedule and execute pen test | External vendor | Pre-production |
| 7.3 | Remediate critical/high findings | AQLIYA eng | Post-test |
| 7.4 | Re-test after fixes | External vendor | Post-test |
| 7.5 | Sign off on pen test report | Security lead | Post-test |

### Success Criteria

```txt
1. Penetration test completed
2. All critical and high findings resolved
3. Re-test confirms fixes
4. Pen test report signed off
```

---

## Summary

| Gap | Points | Priority | Owner | Target |
|-----|--------|----------|-------|--------|
| Scanner provider | +2.5 | Critical | AQLIYA eng | Pre-production |
| SSO/OAuth | +2.5 | Critical | AQLIYA eng | Pre-production |
| Risk Acceptance signature | +0.5 | High | Pilot sponsor | Pre-production |
| On-call staffing | +0.5 | High | Product lead | Pre-production |
| Escalation test | +0.5 | High | Pilot operator | Pre-production |
| Backup scheduler | +0.5 | High | Infra admin | Pre-production |
| Penetration test | +1.0 | High | Security lead | Pre-production |
| **Total** | **+7.5** | | | |

**Target score after closure: 35/35 (100%) — External Production Ready** 🎯
