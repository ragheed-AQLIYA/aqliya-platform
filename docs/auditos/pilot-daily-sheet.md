# AQLIYA AuditOS — Pilot Daily Operations Sheet

## Day ___ — Date: __________________

### Pre-Op Check

| Check | Status | Notes |
|-------|--------|-------|
| `npm run audit:health` | ☐ | All 7 checks must pass before operations |
| Database backup verified | ☐ | |
| Active feedback count | | |
| Critical bugs | | |
| High bugs | | |

---

### Workflow Tracking

| Workflow | Today | Cumulative | Notes |
|----------|-------|------------|-------|
| Engagements created | | | |
| Trial balances uploaded | | | |
| Accounts mapped | | | |
| Evidence items created | | | |
| Evidence linked to findings | | | |
| Findings created | | | |
| Recommendations created | | | |
| Review comments added | | | |
| Review comments resolved | | | |
| Approval attempts | | | |
| Approval blockers encountered | | | |
| AI outputs generated | | | |
| AI outputs accepted | | | |
| AI outputs rejected | | | |
| Exports generated | | | |
| Traceability views | | | |

---

### Feedback Log

| ID | Title | Source | Category | Severity | Status | Owner |
|----|-------|--------|----------|----------|--------|-------|
| | | | | | | |
| | | | | | | |
| | | | | | | |

---

### Issues / Blockers

| ID | Description | Severity | Status | Owner | ETA |
|----|-------------|----------|--------|-------|-----|
| | | | | | |
| | | | | | |

---

### Support Tickets

| ID | User | Issue | Resolution | Time |
|----|------|-------|------------|------|
| | | | | |
| | | | | |

---

### Daily Decisions

| # | Decision | Rationale | Decided By |
|---|----------|-----------|------------|
| | | | |
| | | | |

---

### End-of-Day Summary

| Metric | Value |
|--------|-------|
| Workflows completed today | |
| Blocked workflows | |
| New feedback items | |
| Resolved feedback items | |
| Critical bugs | |
| High bugs | |
| Support tickets | |
| Decisions made | |

### Next-Day Actions

| Action | Owner | Priority |
|--------|-------|----------|
| | | |
| | | |

---

### Sign-Off

**Operator:** __________________ **Date:** __________________

**Notes for weekly review:**

```
```

---

## Daily Quick Reference

### Commands

```bash
# Health check
npm run audit:health

# Backup
npm run db:backup

# Check logs
Get-Content .next/dev/logs/next-development.log -Tail 50
```

### Escalation

| Level | Contact | Response Time |
|-------|---------|---------------|
| L1 | Pilot operator | 4 hours |
| L2 | AQLIYA engineering | 24 hours |
| L3 | Infrastructure admin | 48 hours |
