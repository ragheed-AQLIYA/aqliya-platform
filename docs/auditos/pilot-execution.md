# Phase 15 — Limited Production Pilot Execution

## Pre-Pilot Readiness Verification

### Checklist Status as of May 9, 2026

| # | Check | Status | Evidence |
|---|-------|--------|----------|
| 1 | Pilot Environment Checklist completed | ☐ | Use `docs/auditos/pilot-environment-checklist.md` |
| 2 | Risk Acceptance Form signed | ☐ | Use `docs/auditos/risk-acceptance-form.md` |
| 3 | Manual backup tested | ☐ | Run `npm run db:backup` and verify dump |
| 4 | `audit:health` passes | ✅ | 7/7 checks pass |
| 5 | Admin users provisioned | ✅ | Seeded + Admin UI at `/audit/admin/users` |
| 6 | Roles assigned | ✅ | 6 users across admin/operator/reviewer/partner/viewer |
| 7 | Tenant isolation verified | ✅ | Guard active on 29 server actions |
| 8 | Scanner policy documented | ✅ | Production fail-closed; docs at `docs/auditos/file-scanning.md` |
| 9 | Export limitation acknowledged | ☐ | Stakeholder signs Risk Acceptance Form |
| 10 | Support SOP reviewed | ☐ | Team reviews `docs/auditos/pilot-support-sop.md` |

---

## Pilot Kickoff

### Pilot Objective

Validate AQLIYA AuditOS in a controlled real-engagement environment with live stakeholder feedback.

### Pilot Users

| Role | User | Provisioned |
|------|------|-------------|
| Admin | khalid@aqliya.sa | ✅ |
| Operator | ahmed@aqliya.sa | ✅ |
| Reviewer | sarah@aqliya.sa | ✅ |
| Partner | khalid@aqliya.sa | ✅ |
| Viewer | faisal@gulf-trading.sa | ✅ |

### Pilot Dataset

| Dataset | Status | Notes |
|---------|--------|-------|
| Gulf Trading Co. FY2025 | ✅ Seeded | 22 TB lines, 10 notes, 6 evidence, 4 findings, 3 recs |
| Najd Services Co. FY2025 | ✅ Seeded | For tenant isolation testing |

### Pilot Timeline

| Phase | Duration | Activities |
|-------|----------|------------|
| Kickoff | Day 1 | Environment verification, team training |
| Execution | Weeks 1–4 | Active workflow execution, feedback capture |
| Review | Week 5 | Metrics analysis, exit criteria assessment |
| Decision | Week 6 | Extend, prepare production, or pause |

### Success Criteria

See `docs/auditos/pilot-success-criteria.md` — 32 measurable criteria across 6 categories.

### Communication

| Channel | Purpose |
|---------|---------|
| Daily standup | Issues, blockers, next actions |
| Weekly review | Metrics, trends, feedback summary |
| Pilot log | `docs/auditos/pilot-log.md` (issues, decisions, timeline) |

### Escalation Path

```
Pilot Operator → AQLIYA Engineering Lead → Product Lead → Stakeholder
```

### Issue Reporting

All issues must be logged in the Pilot Feedback System:
`/audit/engagements/[engagementId]/pilot`

---

## Pilot Execution Tracking

### Daily Tracking Template

**Date:** __________________

| Metric | Value |
|--------|-------|
| Engagements created | |
| Trial balances uploaded | |
| Mappings reviewed | |
| Evidence requests created | |
| Evidence linked to findings | |
| Findings created | |
| Recommendations created | |
| Review comments added | |
| Review comments resolved | |
| Approval gate passed | |
| AI outputs accepted | |
| Exports generated | |
| Traceability used | |

### Workflow Completion Rate

| Workflow | Attempted | Completed | Rate |
|----------|-----------|-----------|------|
| Engagement setup | | | % |
| Trial balance upload | | | % |
| Account mapping | | | % |
| Evidence → finding link | | | % |
| Finding creation | | | % |
| Recommendation creation | | | % |
| Review → resolve | | | % |
| Approval | | | % |
| AI output generation | | | % |
| Export | | | % |
| Traceability | | | % |

### Blocked Workflows

| ID | Workflow | Blocking Issue | Status | Owner |
|----|----------|---------------|--------|-------|

---

## Feedback Capture

### Process

1. User identifies issue/request during pilot
2. Record in Pilot Feedback System at `/audit/engagements/[engagementId]/pilot`
3. Include: title, source, category, severity, description
4. Owner assigned, status set to "open"
5. Daily review — triage and assign next actions
6. Status transitions: open → in_review → accepted/resolved/dismissed

### Feedback Template

```
Title: [Brief description]
Source: [Client / Internal / Partner]
Category: [Workflow / Audit methodology / AI output / Traceability / UX / Export / Security / Performance / Client request / Bug]
Severity: [Low / Medium / High / Critical]
Product area: [Engagement / TB / Mapping / Statements / Notes / Evidence / Findings / Recommendations / Review / Approval / AI / Export / Traceability / Admin / Pilot]
Description: [Detailed description]
Decision: [Accepted / Rejected / Deferred]
Owner: [Name]
Next action: [Description]
```

### Categories

| Category | Examples |
|----------|----------|
| Workflow | Missing step, unclear process, broken flow |
| Audit methodology | Control gap, evidence gap, review gap |
| AI output | Inaccurate draft, low confidence, wrong suggestion |
| Traceability | Missing link, broken navigation, incomplete data |
| UX | Slow load, confusing UI, missing feedback |
| Export | Missing data, wrong format, broken download |
| Security | Unexpected access, missing restriction |
| Performance | Slow query, timeout, high memory |
| Client request | Specific feature request from client |
| Bug | Crash, error, data loss, regression |

---

## Daily Pilot Review

### Structure (15 minutes)

| Segment | Duration | Agenda |
|---------|----------|--------|
| New feedback | 3 min | Review items added since last check |
| Open blockers | 3 min | Review unresolved blockers, assign owners |
| Resolved items | 2 min | Confirm resolution, archive |
| Risks | 2 min | New risks, changing risk levels |
| User adoption | 2 min | Usage trends, dropped workflows |
| Support issues | 2 min | Review support tickets |
| Next actions | 1 min | Confirm actions for next period |

### Daily Review Log

**Date:** __________________ **Attendees:** __________________

| Item | Type | Status | Action |
|------|------|--------|--------|
| | | | |
| | | | |

### Weekly Review (30 minutes)

- Metrics trends
- Feedback patterns
- Exit criteria progress
- Prioritization
- Resource planning

---

## Pilot Metrics

### Workflow Metrics

| Metric | Target | Current | Trend |
|--------|--------|---------|-------|
| Completed workflows / day | > 5 | | |
| Evidence completion rate | > 80% | | |
| Review resolution rate | > 70% | | |
| Approval readiness rate | > 90% | | |
| AI suggestion acceptance rate | > 50% | | |
| Export success rate | 100% | | |

### Quality Metrics

| Metric | Target | Current | Trend |
|--------|--------|---------|-------|
| User-reported issues / week | < 5 | | |
| Critical bugs | 0 | | |
| High-severity bugs | < 2 | | |
| Blocked workflows | 0 | | |
| Support tickets / week | < 3 | | |

### Performance Metrics

| Metric | Target | Current | Trend |
|--------|--------|---------|-------|
| Dashboard load time | < 3s | | |
| Upload processing time | < 5s | | |
| AI generation time | < 10s | | |
| Export download time | < 5s | | |
| Health check pass rate | 100% | | |

---

## Exit Criteria Assessment

Use `docs/auditos/pilot-exit-criteria.md`.

### Assessment Table

| # | Category | Required | Met | Evidence | Action |
|---|----------|----------|-----|----------|--------|
| 1.1 | Scanner provider integrated | ✅ | ☐ | | |
| 1.2 | Scanner configured | ✅ | ☐ | | |
| 1.3 | Scanner test passes | ✅ | ☐ | | |
| 1.4 | Scan AuditEvent recorded | ✅ | ☐ | | |
| 1.5 | Scanner failure blocks | ✅ | ☐ | | |
| 2.1 | SSO/OAuth configured | ✅ | ☐ | | |
| ... | (full 35 criteria) | | | | |

### Decision

| Score | Action |
|-------|--------|
| 35/35 | ✅ Candidate for external production review |
| 30–34 | 🔄 Extend pilot — document exceptions |
| < 30 | ⛔ Pause and remediate |

---

## Pilot Log

**File:** `docs/auditos/pilot-log.md`

### Timeline

| Date | Event | Actor | Notes |
|------|-------|-------|-------|
| | | | |

### Decisions

| Date | Decision | Rationale | Decided By |
|------|----------|-----------|------------|
| | | | |

### Key Learnings

| Date | Learning | Impact |
|------|----------|--------|
| | | |
