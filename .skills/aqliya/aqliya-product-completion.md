---
name: aqliya-product-completion
description: Product completion discipline for AQLIYA. Enforces end-to-end flows, CRUD, dashboards, evidence, exports, review/approval, audit logs, and QA before calling a product done.
---

# AQLIYA Product Completion Skill

> **Purpose:** Prevent products from being stuck at demo/shell/prototype stage (L1-L3). Ensure every product reaches at least L4 (Usable v0.1) before being called complete.

---

## 1. Product Completion Levels (from AGENTS.md §6)

| Level | Name                | Meaning                             |
| ----- | ------------------- | ----------------------------------- |
| L0    | Concept             | Docs or idea only                   |
| L1    | Marketing           | Public page/copy only               |
| L2    | Shell               | Route exists but no real workflow   |
| L3    | Prototype           | UI + mock data, limited persistence |
| L4    | **Usable v0.1**     | **Target minimum**                  |
| L5    | Pilot-ready         | Evidence, review, approval, exports |
| L6    | Production-hardened | Security, monitoring, ops           |

---

## 2. Universal v0.1 Definition of Done

A product reaches v0.1 (L4) only when all of the following exist:

### Persistence

- [ ] Domain data model in Prisma schema (or documented reason why not)
- [ ] CRUD or task-specific mutations via Server Actions
- [ ] Real data persisted to database
- [ ] Seed data for development/demo

### UI/UX

- [ ] Authenticated route/workspace (where required)
- [ ] Dashboard with real metrics (not static)
- [ ] List/detail/create/update flows (where relevant)
- [ ] Error states (actionable)
- [ ] Loading states (async pages/actions)
- [ ] Empty states (explain next action)
- [ ] Bilingual/RTL support (Arabic-first)

### Governance

- [ ] RBAC or tenant guard for all mutations
- [ ] Audit trail for every create/update/delete
- [ ] Evidence/files workflow (where product depends on sources)
- [ ] Review/approval step (where output is decision/report/action-bearing)
- [ ] Export/report/output (where relevant)

### Quality

- [ ] Validation passing (TypeScript, lint)
- [ ] Documentation updated
- [ ] No known blocking bugs

---

## 3. Forbidden Completion Claims

Do not claim a product is "complete" or "v0.1 ready" if:

- Only marketing page exists (L1)
- Route exists but no workflow (L2)
- UI shows mock data with no persistence (L3)
- No audit trail for mutations
- No RBAC or tenant isolation
- No exports or outputs
- No seed data
- Validation not passing
- Docs not updated

---

## 4. Product-Specific DoD References

| Product             | DoD Section in AGENTS.md |
| ------------------- | ------------------------ |
| AuditOS             | §21.2                    |
| LocalContentOS      | §21.3                    |
| DecisionOS          | §21.4                    |
| SalesOS             | §21.5                    |
| LocalContactOS      | §21.6                    |
| Office AI Assistant | §21.7                    |

---

## 5. Completion Workflow

### Step 1: Assess Current Level

- Inspect code, routes, schema, actions, UI, governance
- Determine current level (L0-L6)
- Reference `PRODUCT_STATUS_MATRIX.md`

### Step 2: Identify Gaps

- Compare against v0.1 DoD (section 2 above)
- List missing items per category (persistence, UI, governance, quality)
- Prioritize: governance first, then persistence, then UI

### Step 3: Fill Gaps (minimum completions)

- Add data model if missing
- Add CRUD Server Actions if missing
- Add audit logging if missing
- Add RBAC if missing
- Add seed data if missing
- Add exports if relevant
- Add review/approval if relevant

### Step 4: Validate

- Run `npx tsc --noEmit`
- Check lint for new errors
- Verify seed data runs
- Verify routes work

### Step 5: Update Status

- Update `PRODUCT_STATUS_MATRIX.md`
- Update relevant product docs
- Update roadmap if needed

### Step 6: Report

- New completion level
- What was added
- What remains for L5/L6

---

## 6. Anti-Patterns to Avoid

- Adding a dashboard without real data
- Adding a form without a Server Action
- Adding a list page without create/update
- Adding persistence without audit trail
- Adding exports without permission checks
- Adding AI output without human review
- Calling something "done" when only UI exists
- Copying mock data patterns from demo to production
