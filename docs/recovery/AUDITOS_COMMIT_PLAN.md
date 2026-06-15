# AuditOS Commit Plan — Recovery Slices

**Branch:** `auditos/factory-memory-2026-06`  
**Base:** `18366fc`  
**Rule:** No new features — recovery commits only. Exclude binaries per `AUDITOS_RECOVERY_INVENTORY.md`.

---

## Merge Order (after all slices)

```
1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → (platform wiring commit) → PR to main
```

Validate after slices 1, 2, 5, 7: `npx tsc --noEmit`

---

## Slice 1 — Schema + Prisma

**Message:** `feat(auditos): schema and migration foundation`

**Paths:**

```
prisma/schema.prisma
prisma/migrations/20260609100000_tb_intelligence_firm_memory/
prisma/migrations/20260613100000_reporting_graph_foundation/
prisma/migrations/20260614120000_engagement_presentation_profile/
prisma/migrations/20260614130000_presentation_policy_engine/
prisma/migrations/20260614140000_firm_memory_erp_context/
prisma/migrations/20260614150000_firm_memory_governance/
prisma/migrations/20260615100000_tb_classification_detail/
prisma/seed-audit.ts
prisma/seed.ts (audit-related hunks only if mixed — prefer full file)
```

---

## Slice 2 — TB Intelligence

**Message:** `feat(tb): intelligence and classification engine`

**Paths:**

```
src/lib/tb-intelligence/
knowledge/tb-intelligence/
```

---

## Slice 3 — Firm Memory (governance docs + wiring note)

**Message:** `feat(memory): firm memory and governance foundation`

**Note:** Code lives in slice 2 (`firm-memory-engine.ts`, `firm-memory-governance.ts`). Slice 3 commits architecture + audit docs:

```
docs/architecture/PHASE_3C_FIRM_MEMORY_ENGINE.md
docs/architecture/PHASE_3C_FIRM_MEMORY_VALIDATION.md
docs/architecture/PHASE_3D_MEMORY_GOVERNANCE.md
docs/audits/PHASE_3D_GOVERNANCE_VALIDATION.md
docs/audits/evidence/phase-3c-firm-memory-validation.json
docs/audits/evidence/phase-3d-governance-validation.json
docs/audits/TB_MEMORY_KPI_BASELINE.md
```

---

## Slice 4 — IFRS + SOCPA

**Message:** `feat(compliance): IFRS and SOCPA rules engines`

**Paths:**

```
src/lib/audit/rules/
src/actions/audit-ifrs-rules-actions.ts
src/actions/audit-socpa-rules-actions.ts
src/components/audit/rules/
```

---

## Slice 5 — Financial Statement Factory

**Message:** `feat(factory): reporting graph and statement generation`

**Paths:**

```
src/lib/audit/fs-engine/
src/lib/audit/reporting-graph/
src/lib/audit/reconciliation/
src/lib/audit/lead-schedule/
src/lib/audit/db/income-statement-*.ts
src/lib/audit/db/statement-builder.ts
src/lib/audit-intelligence/
src/lib/audit/coa/
src/actions/audit-fs-actions.ts
src/actions/audit-reconciliation-actions.ts
src/actions/audit-lead-schedule-actions.ts
src/actions/audit-factory-map-actions.ts
src/actions/audit-intelligence-actions.ts
```

---

## Slice 6 — Presentation Policies

**Message:** `feat(presentation): profile and policy management`

**Paths:**

```
src/lib/audit/presentation/
src/actions/audit-presentation-policy-actions.ts
src/components/audit/engagement/presentation-*.tsx
docs/audits/PHASE_13_1_VALIDATION.md
docs/audits/PHASE_13_1_1_VALIDATION.md
docs/audits/PHASE_13_2_VALIDATION.md
docs/audits/evidence/p13-2-validation.json
```

---

## Slice 7 — AuditOS UI

**Message:** `feat(ui): audit factory and memory interfaces`

**Paths:**

```
src/components/audit/ (remaining)
src/app/audit/ (new routes)
src/actions/audit-*.ts (remaining)
src/lib/audit/ (remaining modified)
messages/en.json messages/ar.json (audit.mapping keys)
src/types/audit/
```

---

## Slice 8 — Scripts

**Message:** `chore(scripts): factory and validation tooling`

**Paths:**

```
scripts/phase-*
scripts/shalfa-*
scripts/tb-*
scripts/factory-*
scripts/p13-2-validation.mjs
scripts/p14-*.mjs
scripts/p12-*.mjs
scripts/coa-phase-81-*
package.json
package-lock.json
```

---

## Slice 9 — Documentation

**Message:** `docs(auditos): program documentation and evidence`

**Paths:**

```
docs/audits/ (exclude binaries/png/pdf)
docs/architecture/ (AuditOS + ADR)
docs/systems/auditos/
docs/operations/firm-memory-*.md
docs/operations/parallel-execution-cycle-TB-MEMORY.md
docs/AUDITOS_PROGRAM_STATUS.md
docs/recovery/
docs/source-of-truth/ (modified audit routes)
```

---

## Slice 10 — Platform wiring (optional final)

**Message:** `chore(auditos): integrate factory with core audit services and CI`

**Paths:**

```
src/lib/audit/db/index.ts
src/lib/audit/services.ts
src/lib/ai/ (audit bridge handlers)
.github/workflows/ci.yml
cypress/e2e/audit-factory.cy.ts
.env.example (non-secret deltas only)
```

---

## Post-commit verification

```bash
npx prisma validate
npx tsc --noEmit
npm test -- firm-memory classification-explanation presentation-profile
npm run phase-3d:validate-governance  # requires DB
```
