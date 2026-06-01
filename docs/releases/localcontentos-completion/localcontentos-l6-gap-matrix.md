# LocalContentOS L6 Gap Matrix

**Date:** 2026-06-01 (post-B3 closure sync)  
**Program:** LocalContentOS L6 — Institutional Pilot-Ready  
**Baseline:** L4 **DONE_WITH_CONCERNS** (Content Studio pass); compliance workspace **L5** (PRODUCT_STATUS_MATRIX)  
**Production claim:** **NO**  
**Validation:** Documentation + gap analysis only (no build/lint/migrate)

> **Sync note:** Post-smoke integrator ran before B3 engineering finished; matrix reconciled after Prisma-only guard in `repository-instance.ts`.

---

## Level definitions (AQLIYA LocalContentOS program)

| Level | Name | Meaning in this program |
|-------|------|-------------------------|
| **L4** | Usable v0.1 | Real workflow, persistence, basic governance, light QA. Internal engineers can demo end-to-end. |
| **L5** | Pilot operational | One internal tenant can run a 1–2 week pilot without engineer babysitting; migration applied; smoke mostly PASS. |
| **L6** | **Institutional pilot-ready** | One **external institution** can run a governed, time-bounded pilot under AQLIYA trust principles — full RBAC, evidence, review/approval, audit trail, operator docs, repeatable smoke evidence. **Not** marketing “Production Ready”, **not** regulator certification, **not** AGENTS.md §6 “Production-hardened” (HA, SIEM, multi-region). |

> **Naming note:** AGENTS.md §6 labels L6 as “Production-hardened.” For LocalContentOS L6 Program, **L6 = institutional pilot-ready with full governance**. Ops hardening (monitoring, backups, scale) is **L7+ / deferred** unless explicitly scoped.

---

## Summary gap counts (L4 → L6) — post-B3 closure sync

| Severity | Count | Themes |
|----------|-------|--------|
| **Blocker** | 1 open (2 closed) | **B2 CLOSED** (Worker 2 smoke); **B3 CLOSED** (Prisma-only guard); **B1** SalesOS drift |
| **High** | 4 | Unified workflow narrative; governed AI boundaries doc; integration tests; operator sign-off pack |
| **Medium** | 6 | UI resilience on Content Studio routes; export/content coupling; repo-wide tsc; browser automation reliability; bilingual export disclaimers; commit/release hygiene |
| **Low / deferred** | 4 | Production LLM; pagination/scale; formal SLA; On-Prem / Air-Gapped |

---

## Gap matrix by dimension

### 1. Workflow

| Aspect | L4 (current) | L5 (target) | L6 (target) | Gap L4→L6 | Priority | Owner |
|--------|--------------|-------------|-------------|-----------|----------|-------|
| Content Studio E2E | **6/6 smoke PASS** (Worker 2); `crev_mpulmiwi_nzagcrh` | All 6 smoke steps **PASS** in one ADMIN session | Same + **documented institutional playbook** (roles, SLAs, escalation) | Export without approved content policy decision; institutional playbook | **Medium** | Worker 2 ✓ |
| Compliance workspace E2E | L5: suppliers/spend/evidence/classification/review/approval/export | Stable under pilot load | **Unified command center** linking compliance project + content campaign where applicable | Cross-track navigation and status clarity | **Medium** | Worker 2 (Workflow unify) |
| State transitions | `workflow.ts` + unit tests; export can bypass approved content | Export gated when `includesApprovedContent` flag set | Explicit business rules documented + enforced in UI copy | Export succeeded with item still `in_review` (documented concern) | **High** | Worker 2 |
| Review before approve | **PASS** — `ContentStudioReview` `crev_mpulmiwi_nzagcrh`; ADMIN approve in smoke | Review record required before ADMIN approve (or explicit waiver doc) | Dimension checklist mandatory for institutional pilot | — (B2 **CLOSED**) | — | Worker 2 ✓ |

### 2. Persistence

| Aspect | L4 (current) | L5 (target) | L6 (target) | Gap L4→L6 | Priority | Owner |
|--------|--------------|-------------|-------------|-----------|----------|-------|
| Content Studio schema | Migration `20260601120000` **applied on localhost** | Applied on **shared pilot DB** | Pilot DB + **documented backup/restore** for LC tables | Shared pilot DB may differ from localhost | **High** | Worker 3 (Persistence) |
| Migration history | **Drift** with SalesOS (6 DB-only, 3 pending local) | Drift **resolved or baselined** before deploy | Clean `migrate status` on every pilot environment | `migrate deploy` would apply SalesOS P0/P1 — scope risk | **Blocker** | Worker 3 + Platform |
| Dual backend | Prisma default when `DATABASE_URL` set; **B3 CLOSED** — production-like env refuses file (`repository-instance.ts`) | File backend **test-only** (`LOCALCONTENT_CONTENT_BACKEND=file` in tests) | Production path **Prisma-only**; env guard enforced | Residual singleton risk if tests run in dev process | **Medium** (was Blocker) | Worker 3 ✓ |
| Seeds | Compliance seeds exist; Content Studio smoke data ad hoc | Seed script for Content Studio demo path | Institutional demo org template in seed/docs | No repeatable Content Studio seed in `prisma/seed.ts` | **Medium** | Worker 3 |
| createdBy / lineage | Compliance models have `createdById`; Content Studio partial | Full actor lineage on Content Studio mutations | Audit queries by actor for pilot support | Verify Content Studio models vs compliance parity | **Medium** | Worker 3 |

### 3. AI (governed)

| Aspect | L4 (current) | L5 (target) | L6 (target) | Gap L4→L6 | Priority | Owner |
|--------|--------------|-------------|-------------|-----------|----------|-------|
| Draft assist | Deterministic template via `ai.ts`; `reviewRequired=true` | Same, documented in pilot handoff | **Governed AI boundary doc**: inputs, outputs, human review, no autonomous approval | Not production LLM — must not be implied | **High** | Worker 4 (AI/Governance) |
| Provider routing | Core prompt builder; no external call in smoke | Explicit env flag for provider (if any) | Data classification: what may leave tenant | External routing rules not documented for LC | **Medium** | Worker 4 |
| AI audit | Action logged via workspace actions | AI assist events queryable | Pilot operator can trace AI assist → review → approval | Verify audit event shape for Content Studio | **Medium** | Worker 4 |
| Compliance AI | Classification assist (if any) separate track | Aligned terminology with Content Studio | Single “AI assists, humans decide” operator section | Two tracks may confuse pilot users | **Low** | Worker 7 (Docs) |

### 4. Governance

| Aspect | L4 (current) | L5 (target) | L6 (target) | Gap L4→L6 | Priority | Owner |
|--------|--------------|-------------|-------------|-----------|----------|-------|
| RBAC | VIEWER/OPERATOR/ADMIN on workspace actions | Verified in smoke for all Content Studio mutations | **Institutional RBAC matrix** published (who can approve/export) | grep-verified only; not institution-facing | **High** | Worker 5 (Governance) |
| Tenant isolation | Org scoping in unit tests (14/14) | Smoke on second org negative test | Documented tenant isolation proof for pilot | No second-org smoke evidence | **Medium** | Worker 6 (Tests) |
| Audit trail | Platform audit logger wired; compliance trail mature | Content Studio mutations logged | Export/download audit + retention note | Content Studio audit parity vs compliance | **Medium** | Worker 5 |
| Review / approval gates | Submit review + ADMIN approve; dimension form **smoke-proven** | Review dimensions required before approve | Approval identity + timestamp on exports | — | **Closed** (B2) | Worker 2 |
| Export control | ADMIN export; metadata `{productId, exportedBy}` | Export disclaimer in UI/PDF | Institutional disclaimer (not certified compliance) | Bilingual disclaimer completeness | **Medium** | Worker 7 |
| Evidence | `evidence.ts` for sources; compliance evidence vault L5 | Source verification tied to output readiness | Evidence linked in export payload when flagged | Output readiness tests pass; browser evidence upload not re-smoked | **Medium** | Worker 2 |

### 5. UI

| Aspect | L4 (current) | L5 (target) | L6 (target) | Gap L4→L6 | Priority | Owner |
|--------|--------------|-------------|-------------|-----------|----------|-------|
| Routes | `/local-content`, campaigns, review, outputs + compliance `/projects/*` | All routes load with auth | loading/error/not-found on **Content Studio** routes | Content Studio may lack resilience files vs compliance | **Medium** | Worker 9 (UI) |
| Arabic-first / RTL | Shell Arabic-first; forms refresh after mutation | No blocking RTL bugs in smoke | Pilot feedback form for UX issues | Glass browser hydration warnings observed | **Low** | Worker 9 |
| Command center | Content Studio tiles + compliance section | Accurate counts from Prisma | Single institutional “start here” guide | Counts may be 0 until seeded | **Medium** | Worker 9 |
| Form reliability | Form ref fix on campaign/output forms | Step 2 create→campaign link re-verified | Operator can complete without hard refresh | Step 2 **PARTIAL** historically | **Medium** | Worker 8 |
| Navigation registry | `product-registry.ts` updated | Review nav `prefetch={false}` stable | Marketing → workspace CTAs truthful | Verify `/products/local-content` claims | **Medium** | Worker 7 |

### 6. Tests

| Aspect | L4 (current) | L5 (target) | L6 (target) | Gap L4→L6 | Priority | Owner |
|--------|--------------|-------------|-------------|-----------|----------|-------|
| Unit tests | **25/25 PASS** `content-studio.test.ts` | Same + review dimension edge cases | **≥20 tests** covering approve-without-review rejection (if policy added) | Policy for mandatory review not enforced in code | **High** | Worker 6 ✓ |
| Integration tests | File backend only in unit tests | Optional Prisma integration test (test DB) | One integration test on test compose DB | `npm run test:integration` not run for LC | **Medium** | Worker 6 |
| Repo-wide tsc | LC **0 errors**; repo **4317** (SalesOS binary) | LC clean; SalesOS corruption tracked separately | LC clean; CI gate for LC path only documented | SalesOS blocks monorepo CI | **Medium** | Platform (out of LC scope) |
| Export tests | Compliance PDF/XLSX tests (30 LC tests per matrix) | Content Studio export metadata test | Export disclaimer content test | Content Studio export is metadata/status, not binary PDF | **Low** | Worker 6 |
| Governance tests | **25/25** includes VIEWER/OPERATOR denial | Automated action tests for forbidden roles | VIEWER cannot approve/export tests | No server-action integration tests | **Medium** | Worker 6 ✓ |

### 7. Docs

| Aspect | L4 (current) | L5 (target) | L6 (target) | Gap L4→L6 | Priority | Owner |
|--------|--------------|-------------|-------------|-----------|----------|-------|
| Completion pack | L6 closure pack complete | Synced after each worker | **L6 sign-off pack** + institutional onboarding | Institutional onboarding not PO-signed | **High** | Integrator ✓ |
| Operator manual | Compliance README exists | Content Studio section added | Troubleshooting: queue empty, migration, dual backend | Content Studio troubleshooting partial | **Medium** | Worker 7 |
| PRODUCT_STATUS_MATRIX | LC at L5 (compliance); Content Studio not split | Reflect dual-track levels honestly | L6 row with “institutional pilot-ready” qualifier | Matrix may overstate Content Studio | **High** | Worker 7 |
| Commercial truth | Production claim **NO** everywhere | Pilot-only language | Signed **non-production** attestation in onboarding | Marketing page audit not in this pass | **Medium** | Worker 7 |
| Migration runbook | `localcontentos-migration-readiness.md` | Updated post-drift resolution | Per-environment status table | SalesOS drift unresolved | **Blocker** | Worker 3 |

### 8. Smoke / E2E evidence

| Aspect | L4 (current) | L5 (target) | L6 (target) | Gap L4→L6 | Priority | Owner |
|--------|--------------|-------------|-------------|-----------|----------|-------|
| Steps 1–2 | PASS / PARTIAL | PASS | PASS with recording | Campaign create refresh | **Medium** | Worker 8 |
| Steps 3–4 | **PASS** (browser) | PASS | PASS | — | — | — |
| Step 5 | **PASS** — dimension form + `crev_mpulmiwi_nzagcrh` (Worker 2) | **PASS** including dimension checkboxes | PASS + **second reviewer** scenario documented | Second-reviewer scenario not documented | **Low** | Worker 2 ✓ |
| Step 6 | **PASS** (export metadata) | PASS | PASS with approved-content policy aligned | Export without approved item | **Medium** | Worker 8 |
| Auth reliability | Glass stale session issues | curl SSR + browser both PASS | Pilot login guide (seed vs SSO future) | Browser automation flaky | **Medium** | Worker 8 |
| Compliance smoke | Historical PASS (2026-05-23 mutation loop) | Re-run after Content Studio merge | Combined institutional checklist | Two checklists not merged | **High** | Worker 8 |
| Evidence artifact | `agent-14-smoke-results.md` — 6/6 PASS | Updated scorecard | L6 smoke sign-off doc with dates/operators | PO sign-off pending | **Medium** | Integrator ✓ |

---

## Cross-cutting blockers (other workers)

| ID | Blocker | Blocks | Resolution owner |
|----|---------|--------|------------------|
| **B1** | SalesOS migration history drift | `migrate deploy` on shared DB | Platform / DBA — baseline or rename reconciliation |
| **B2** | Review dimension form not smoke-tested | ~~L5/L6 governance sign-off~~ | **CLOSED** — Worker 2: `crev_mpulmiwi_nzagcrh`, 2026-06-01 |
| **B3** | Dual persistence (file vs Prisma) | ~~Institutional pilot data integrity~~ | **CLOSED** — Worker 3: `repository-instance.ts` `guardFileBackendResolution()` + test isolation via `resetContentRepositoryForTests()` (2026-06-01) |
| **B4** | Uncommitted LC changes | Reproducible pilot build | Worker 10 — commit plan execution (user approval) |
| **B5** | SalesOS binary TS corruption | Monorepo CI / full tsc | Platform — separate from LC L6 |

---

## L6 gate checklist (all must pass) — post-B3 closure sync

- [ ] All 8 dimensions: no **Blocker** gaps open — **B1, B4 remain** (B2, B3 **CLOSED**)
- [x] Smoke steps 1–6 **PASS** (including review dimensions) — Worker 2 closure
- [ ] `npx prisma migrate status` clean on pilot DB (or documented baseline) — **B1**
- [x] Prisma-only persistence on pilot path — **B3 CLOSED** (`repository-instance.ts`)
- [ ] Institutional onboarding pack reviewed by product owner
- [ ] PRODUCT_STATUS_MATRIX updated — **L6 institutional pilot-ready**, not “Production Ready”
- [ ] Human sign-off on scorecard
- [x] Production claim remains **NO**

**Checklist:** **4/8** satisfied. **Honest level:** **L5 with conditions** until **B1 + B4 + PO sign-off**. **NOT Production Ready**.

---

## Production claim

**NO** — gap analysis only. L6 ≠ production deployment authorization.
