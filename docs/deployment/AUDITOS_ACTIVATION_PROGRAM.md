# AQLIYA AuditOS Activation Program

**Status:** Active | **Date:** 2026-07-09 | **Platform:** `app.aqliya.com`  
**Product:** AuditOS — First Consumer Product on AQLIYA Platform Runtime

---

## Program Structure

```
Phase 1: Truth Audit    → Verify AuditOS readiness claims
Phase 2: Surface Design → Route + navigation decision
Phase 3: Remediation    → Close gaps before activation
Phase 4: Activation     → Deploy + smoke tests on production
Phase 5: Pilot Pack     → Demo flow + pilot checklist
```

---

## Phase 1 — Truth Audit

### What to check

| Area | Check | Expected |
|------|-------|----------|
| Routes | All `/audit/*` paths exist | 20+ route segments |
| Database | Prisma migrations applied | All tables exist |
| Auth | RBAC + tenant isolation | Audit-specific roles |
| Evidence | Upload/download flow | S3 storage + tokens |
| Exports | PDF generation | Bilingual, audit trail |
| AI features | AI review/analysis | Human-in-loop |
| Tests | Smoke + unit | 30+ audit-specific tests |
| Seed data | Sample engagements | Realistic demo data |

### Deliverable

`docs/audits/AUDITOS_TRUTH_AUDIT.md`

---

## Phase 2 — Surface Design

### Option A: Platform route (recommended)

```
app.aqliya.com/audit
app.aqliya.com/audit/engagements/[id]
app.aqliya.com/audit/evidence/[id]
```

### Option B: Standalone subdomain

```
audit.aqliya.com
```

**Recommendation:** Option A — faster activation, shared auth, single CloudFront distribution.

---

## Phase 3 — Readiness Remediation

| Gap | Fix | Priority |
|-----|-----|----------|
| Missing migration | `prisma migrate deploy` | Critical |
| Broken route | Fix route config | High |
| Auth gap | Wire RBAC check | High |
| Export error | Fix PDF generation | Medium |
| UI bug | Patch component | Low |

---

## Phase 4 — Activation Checklist

- [ ] Routes verified on production
- [ ] Auth/RBAC working
- [ ] Evidence upload/download tested
- [ ] PDF export tested
- [ ] Seed data loaded
- [ ] Smoke tests pass
- [ ] CI/CD includes AuditOS tests

---

## Phase 5 — Pilot Pack

- [ ] Demo workspace with sample engagement
- [ ] Pilot runbook
- [ ] Known limitations documented
- [ ] User acceptance checklist
- [ ] Feedback collection mechanism
