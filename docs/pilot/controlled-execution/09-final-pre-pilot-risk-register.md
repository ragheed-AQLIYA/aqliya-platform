# AQLIYA Controlled Pilot — Final Pre-Pilot Risk Register

**Document:** 09-final-pre-pilot-risk-register.md  
**Purpose:** Document all known risks before the first controlled pilot.  

---

## Risk Classification

| Level | Definition | Response |
|-------|------------|----------|
| **Critical** | Blocks pilot entirely | Must resolve before proceeding |
| **High** | Significantly impacts pilot quality | Mitigation plan required |
| **Medium** | Impacts experience, workaround exists | Monitor; address if triggered |
| **Low** | Minor impact, acceptable | Accept; document |

---

## Risk Register

| # | Risk | Category | Severity | Likelihood | Impact | Mitigation | Owner |
|---|------|----------|----------|------------|--------|------------|-------|
| 1 | Real TB file not received from customer | Data availability | **Critical** | High | Pilot cannot start | Customer request message prepared; follow-up cadence defined | Pilot Lead |
| 2 | TB file fails intake (format, balance, missing data) | Data quality | **High** | Medium | Corrected file needed; delayed start | Intake checklist with clear rejection criteria; customer notified of required corrections | Technical Lead |
| 3 | Account mapping has ambiguous or unmappable accounts | Mapping | **Medium** | Medium | Manual review overhead | Reviewer to flag ambiguous accounts; customer may need to clarify | Reviewer |
| 4 | Financial statements fail to balance | Financial output | **Critical** | Low | Outputs cannot be presented as-is | Root cause investigation; mapping verification; possible TB data issue | Technical Lead |
| 5 | Notes data is incomplete or missing for material accounts | Notes | **Medium** | Medium | Customer sees incomplete outputs | AI-drafted notes are templates; gaps flagged as missing information | Reviewer |
| 6 | Evidence requirements not generated for all accounts | Evidence | **Low** | Medium | Not all accounts have evidence links | Acceptable for pilot; evidence is manually addable | Reviewer |
| 7 | Reviewer is unavailable during the pilot window | People | **High** | Low | No one to validate outputs | Identify backup reviewer; schedule reviewer time in advance | Pilot Lead |
| 8 | Customer misunderstands pilot vs production | Expectation | **High** | Medium | Misaligned expectations; trust damage | Limitation disclaimer in onboarding; clear "draft" labeling on all outputs; founder rehearses objection handling | Founder |
| 9 | Customer does not trust AI suggestions | Trust | **Medium** | Medium | Reduced confidence in system | Confidence scores visible; human review emphasized; traceability demonstrated | Founder |
| 10 | Demo timing conflicts with customer availability | Scheduling | **Medium** | Medium | Delayed feedback collection | Schedule demo early; offer multiple time slots | Pilot Lead |
| 11 | Escalation response exceeds target time | Process | **Medium** | Low | Customer frustration | Pre-defined escalation path; all participants know their role | Technical Lead |
| 12 | Customer confuses demo data (`/auditos`) with real workspace (`/audit`) | Confusion | **Medium** | Medium | Customer thinks mock data is their own | Clear labeling on demo routes; explicit distinction during walkthrough | Pilot Lead |
| 13 | Customer expects features that do not exist (e.g., cash flow statement) | Expectation | **Medium** | Medium | Disappointment | Pre-pilot scope document; documented feedback process for requests | Founder |
| 14 | No dry run was executed before pilot | Process | **Medium** | High | Team not fully rehearsed | Dry run materials are ready; schedule before TB arrival | Pilot Lead |

## Risk Summary

| Severity | Count | Action |
|----------|-------|--------|
| Critical | 2 | Must resolve before pilot: (1) TB receipt, (4) Statement balance |
| High | 3 | Mitigation plans in place: (2) TB intake, (7) Reviewer availability, (8) Customer expectations |
| Medium | 8 | Monitor and address if triggered |
| Low | 1 | Accept and document |
| **Total** | **14** | |

## Top 3 Risks Requiring Immediate Attention

1. **TB file not received** — The pilot cannot start without the real data. The customer TB request message is ready for sending.
2. **No dry run executed** — The team should schedule the dry run before the TB file arrives to ensure operational readiness.
3. **Customer expectation management** — Founder readiness assessment must confirm preparation for objection handling.

## Signoff

| Role | Name | Date |
|------|------|------|
| Pilot Lead | | |
| Technical Lead | | |
| Founder | | |
