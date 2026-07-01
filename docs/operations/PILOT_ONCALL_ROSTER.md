# Pilot On-Call Roster

**Version:** 1.0  
**Date:** 2026-06-21  
**Scope:** First institutional pilot — AQLIYA Cloud (me-south-1)  
**Related:** `PILOT_OPERATIONAL_HANDBOOK.md`, `production-deployment-runbook.md`

---

## On-call rotation

| Role | Primary | Secondary | Timezone | Contact |
|------|---------|-----------|----------|---------|
| **Platform L3** | `[NAME]` | `[NAME]` | `[TZ]` | `[PHONE]` / `[EMAIL]` |
| **Product L2 (AuditOS/LC)** | `[NAME]` | `[NAME]` | `[TZ]` | `[PHONE]` / `[EMAIL]` |
| **Commercial escalation** | `[NAME]` | — | `[TZ]` | `[PHONE]` / `[EMAIL]` |

> **Action required before go-live:** Replace bracket placeholders with named individuals and verify 24/7 reachability for production incidents.

---

## Escalation matrix

| Severity | Definition | First responder | Escalate to | Target response |
|----------|------------|-----------------|-------------|-----------------|
| **SEV-1** | Platform down, data breach suspected, tenant isolation failure | Primary L3 | Secondary L3 + founder | 30 min |
| **SEV-2** | Major workflow broken, export failure, auth outage | Primary L2 | Primary L3 | 2 hours |
| **SEV-3** | Single-user issue, UI defect, non-blocking error | Customer admin (L1) | Primary L2 | 8 business hours |
| **SEV-4** | How-to, training, feature question | Customer admin | L2 if unresolved | 1 business day |

---

## Customer escalation contacts

| Customer role | Name | Email | Phone | Notes |
|---------------|------|-------|-------|-------|
| Executive sponsor | `[NAME]` | `[EMAIL]` | `[PHONE]` | Contract authority |
| IT / security | `[NAME]` | `[EMAIL]` | `[PHONE]` | SSO, access |
| Day-to-day admin | `[NAME]` | `[EMAIL]` | `[PHONE]` | L1 support lead |

---

## Incident channels

| Channel | Purpose |
|---------|---------|
| `[SUPPORT_EMAIL]` | Customer tickets |
| `[SLACK/TEAMS]` | Internal incident coordination |
| CloudWatch alarms | Automated SEV-1/2 detection |
| Sentry | Application error triage |

---

## Handoff checklist (shift change)

- [ ] Open incidents reviewed
- [ ] CloudWatch alarm status green
- [ ] `/api/platform/enterprise-health` — no critical
- [ ] `/api/platform/evidence/health` — coverage 100%
- [ ] Pending customer tickets acknowledged

---

## Validation status

| Check | Status | Evidence |
|-------|--------|----------|
| Roster template complete | Done | This document |
| Named contacts assigned | **Pending** | Requires customer + team names |
| Handbook cross-reference | Done | `PILOT_OPERATIONAL_HANDBOOK.md` §2 |
| Onboarding simulation run | See `PILOT_ONBOARDING_SIMULATION.md` | |
