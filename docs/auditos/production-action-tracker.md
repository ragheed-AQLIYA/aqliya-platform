# AQLIYA AuditOS — Production Action Tracker

## Score Baseline

| Metric | Value | Target |
|--------|-------|--------|
| Current score | 27.5/35 (79%) | 35/35 (100%) |
| Remaining gap | 7.5 points | 0 |
| Fastest path to 30/35 | +2.5 (internal ops) | Phase B |
| Full 35/35 path | +7.5 (all 7 gaps) | Phases B + C |

---

## Gap 1: Scanner Provider Integration

| Field | Value |
|-------|-------|
| Score impact | +2.5 |
| Priority | Critical |
| Dependency | External provider decision |
| Type | External/vendor-dependent |
| Status | ❌ Not started |

### Evidence Required

| Evidence | Status | Date |
|----------|--------|------|
| Provider selected (ClamAV, cloud, etc.) | ❌ | |
| Provider integrated into file-scanner.ts | ❌ | |
| SCANNER_PROVIDER configured in env | ❌ | |
| Clean file test passes | ❌ | |
| Infected file blocked | ❌ | |
| Scanner failure blocks upload | ❌ | |
| evidence.file_scanned AuditEvent recorded | ❌ | |

### Next Action

Select scanner provider and plan integration.

---

## Gap 2: SSO/OAuth Implementation

| Field | Value |
|-------|-------|
| Score impact | +2.5 |
| Priority | Critical |
| Dependency | Auth provider decision |
| Type | External/vendor-dependent |
| Status | ❌ Not started |

### Evidence Required

| Evidence | Status | Date |
|----------|--------|------|
| OAuth/SSO provider configured | ❌ | |
| Session maps to AuditUser | ❌ | |
| Demo fallback disabled in production | ✅ | Already gated |
| Role mapping verified | ❌ | |
| Admin provisioning still works | ❌ | |
| Auth documentation updated | ❌ | |

### Next Action

Select SSO/OAuth provider and plan integration.

---

## Gap 3: Risk Acceptance Signature

| Field | Value |
|-------|-------|
| Score impact | +0.5 |
| Priority | High |
| Dependency | Stakeholder availability |
| Type | Internal — requires external signature |
| Status | ⏳ Pending stakeholder |

### Evidence Required

| Evidence | Status | Date |
|----------|--------|------|
| Risk Acceptance Form signed | ❌ | |
| Signer name recorded | ❌ | |
| Date recorded | ❌ | |
| Scope documented | ❌ | |
| Limitations acknowledged | ❌ | |

### Next Action

Present Risk Acceptance Form to stakeholder for signature.

---

## Gap 4: On-Call Staffing

| Field | Value |
|-------|-------|
| Score impact | +0.5 |
| Priority | High |
| Dependency | Named individuals available |
| Type | Internal |
| Status | ⏳ Template created, not staffed |

### Evidence Required

| Evidence | Status | Date |
|----------|--------|------|
| Named L1 owner | ❌ | |
| Named L2 owner | ❌ | |
| Named L3 owner | ❌ | |
| Backup owner | ❌ | |
| Security owner | ❌ | |
| Product owner | ❌ | |
| Response-time expectations documented | ❌ | |

### Next Action

Assign named individuals to L1, L2, L3 roles.

---

## Gap 5: Escalation Test Execution

| Field | Value |
|-------|-------|
| Score impact | +0.5 |
| Priority | High |
| Dependency | On-call staffing completed |
| Type | Internal — sequential |
| Status | ⏳ Template created, not executed |

### Evidence Required

| Evidence | Status | Date |
|----------|--------|------|
| Test scenario selected | ❌ | |
| L1 acknowledgement timed | ❌ | |
| L2 escalation timed | ❌ | |
| L3 escalation timed (if needed) | ❌ | |
| Time to acknowledge recorded | ❌ | |
| Time to resolve recorded | ❌ | |
| Gaps documented | ❌ | |
| Result recorded | ❌ | |

### Next Action

Execute escalation test after on-call staffing complete.

---

## Gap 6: Backup Scheduler Activation

| Field | Value |
|-------|-------|
| Score impact | +0.5 |
| Priority | High |
| Dependency | Server/environment access |
| Type | Internal — requires system access |
| Status | ⏳ Schedule documented, not activated |

### Evidence Required

| Evidence | Status | Date |
|----------|--------|------|
| Cron/systemd/cloud scheduler configured | ❌ | |
| Backup command verified | ❌ | |
| Owner assigned | ❌ | |
| Frequency documented | ❌ | |
| Restore verification linked | ❌ | |

### Next Action

Configure cron/systemd timer on production server.

---

## Gap 7: Penetration Test Execution

| Field | Value |
|-------|-------|
| Score impact | +1.0 |
| Priority | High |
| Dependency | External vendor |
| Type | External/vendor-dependent |
| Status | ❌ Not executed |

### Evidence Required

| Evidence | Status | Date |
|----------|--------|------|
| Pen test executed | ❌ | |
| Auth tested | ❌ | |
| Tenant isolation tested | ❌ | |
| File upload tested | ❌ | |
| Rate limiting tested | ❌ | |
| Server actions tested | ❌ | |
| Exports tested | ❌ | |
| Audit log tested | ❌ | |
| Findings documented | ❌ | |
| Critical/high remediated or accepted | ❌ | |
| Final security sign-off recorded | ❌ | |

### Next Action

Select vendor and schedule pen test.

---

## Summary

| Gap | Points | Type | Status | Dependency |
|-----|--------|------|--------|------------|
| Scanner provider | +2.5 | External | ❌ Not started | Provider decision |
| SSO/OAuth | +2.5 | External | ❌ Not started | Provider decision |
| Risk Acceptance | +0.5 | Internal/signature | ⏳ Pending | Stakeholder |
| On-call staffing | +0.5 | Internal | ⏳ Template | Named individuals |
| Escalation test | +0.5 | Internal/sequential | ⏳ Template | On-call staffing |
| Backup scheduler | +0.5 | Internal/system | ⏳ Documented | System access |
| Penetration test | +1.0 | External | ❌ Not started | Vendor selection |

**Internal (closable without external dependency):** 3 gaps = +1.5 points  
**External/vendor-dependent:** 3 gaps = +6.0 points  
**Signature-dependent:** 1 gap = +0.5 points
