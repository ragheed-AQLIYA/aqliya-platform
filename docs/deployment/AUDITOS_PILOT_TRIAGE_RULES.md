# AuditOS Pilot — Triage Rules

**Date:** 2026-07-09

---

## Classification

| Label | Definition | Action |
|-------|-----------|--------|
| 🔴 **Blocker** | Prevents session from continuing | Fix before next session |
| 🟡 **Must-fix** | Significant issue affecting usability | Fix within 24h |
| 🔵 **Backlog** | Minor issue or missing feature | Add to product backlog |
| 💡 **Usability** | Improvement suggestion | Evaluate for next iteration |
| ✅ **Opportunity** | Product direction insight | Document for roadmap |

## Examples

| Finding | Classification | Rationale |
|---------|---------------|-----------|
| Route returns 500 error | 🔴 Blocker | Cannot proceed |
| Evidence upload fails | 🟡 Must-fix | Core workflow |
| Button label confusing | 🔵 Backlog | Usability, not blocking |
| Dashboard could show more data | 💡 Usability | Enhancement |
| This would be useful for client | ✅ Opportunity | Product insight |

## Decision Timeline

| Severity | Response Time |
|----------|--------------|
| 🔴 Blocker | Before next session |
| 🟡 Must-fix | Within 24 hours |
| 🔵 Backlog | Next sprint |
| 💡 Usability | Next iteration |
| ✅ Opportunity | Roadmap review |
