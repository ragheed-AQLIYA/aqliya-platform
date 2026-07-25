# AQLIYA v0.1

**Private Governed Institutional Intelligence Platform**
**منصة ذكاء مؤسسي خاص، محكوم، قابل للتدقيق**

**Status:** Active | **Version:** 0.1 | **Owner:** Governance Team | **Last Reviewed:** 2026-07-25

AQLIYA gives institutions private intelligence that runs on their data, within their environment, under their governance.

---

## Documentation Authority

This README is an entry point, not the highest documentation authority.

- **Conflict resolution authority:** `docs/DOCUMENTATION_AUTHORITY.md`
- **Current master reference:** `docs/official/AQLIYA_MASTER_REFERENCE.md`
- **Agent operating contract:** `AGENTS.md`

For product implementation status, always inspect code, routes, actions, tests, and validation reports alongside this README.

---

## Platform Identity

AQLIYA is NOT:

- An AI chatbot
- SaaS only
- AuditOS only

AQLIYA IS:

- A Private Governed Institutional Intelligence Platform
- A Cloud-deployed platform (AWS ECS/RDS/Redis) with strategic Private/On-Prem direction
- A multi-product company (AuditOS, LocalContentOS, DecisionOS, etc.)
- A platform factory for governed institutional workflows (AQLIYA Studio: strategic, not yet implemented)
- Backed by a unified audit system: single PlatformAuditLog model with productKey scoping (8 legacy models consolidated → 1, 2026-07-25)

---

## Products (built on AQLIYA Intelligence Core)

> **P0 maturity freeze (2026-07-19 / ADR-109):** Unrestricted L6 claims suspended. Pilot commercial wedges: **AuditOS** XOR **LocalContentOS**. **Audit log consolidation (2026-07-25):** All 8 legacy product audit models merged into single `PlatformAuditLog` with `productKey` scoping. See `docs/AI_ENTRYPOINT.md` and `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`.

| Product               | Status                               | Route                                                                 |
| --------------------- | ------------------------------------ | --------------------------------------------------------------------- |
| **AuditOS**           | L5 pilot-ready (conditional) — sold wedge | `/audit` (workspace), `/auditos` (demo)                          |
| **LocalContentOS**    | L5 pilot-ready (conditional) — sold wedge | `/local-content/*`, `/products/local-content`                    |
| **DecisionOS**        | L5 conditional (capability)          | `/decisions`                                                          |
| **WorkflowOS**        | L5 conditional (capability)          | `/workflowos/*`                                                       |
| **Office AI Assistant** | L5 conditional (shared app)        | `/assistant/*`                                                        |
| **SalesOS**           | L5 conditional — **internal only; not sold** | `/sales/*`                                                      |
| **LocalContactOS**    | L5 conditional                       | `/contacts/*`                                                         |
| **RiskOS**            | L5 conditional — not standalone product | `/risk/*`                                                          |
| **SimulationOS**      | Marketing redirect only              | `/products/simulation` → `/products`                                  |
| **On-Prem / Air-Gap** | L0 — not sold                        | —                                                                     |
| **AQLIYA Studio**     | L0 strategic future                  | —                                                                     |

**LocalContentOS evidence (2026-05-23):** Real workspace at `/local-content/*` with server-action mutations. Mutation feedback loop verified (`revalidatePath` + client refresh). Focused smoke **PASS** on finding create at `/local-content/projects/lc-project-demo-001/findings`. CLI validation passed (`prisma generate`, `tsc`, `lint`, `build`, local-content tests). Not unrestricted production-hardened; binary PDF/XLSX export deferred.

**AuditOS v0.1 Real Program (2026-05-28):** Waves A–F complete. Build + test gate passed (27 suites / 213 tests). Go/No-Go: **Conditional GO** for controlled internal / limited pilot — not production-certified. See `docs/reports/auditos-v0.1-go-no-go-review-2026-05-28.md`.

**Current platform metrics (2026-07-25):** `tsc --noEmit` PASS (0 errors), `npm run build` PASS (127+ static pages), **5,691 tests PASS** across 449 test files (0 failures, 99.8% pass rate, 27 pre-existing skips). **Audit log consolidation:** 8 legacy product audit models → single `PlatformAuditLog` with `productKey` scoping. Dual-write eliminated; unified query layer active. See `docs/reports/validation-snapshot-2026-06-17.md` for earlier baseline.

---

## Quick Start

```bash
npm install
npx prisma generate
npm run dev
```

## Validation

```bash
npm run build        # Production build
npm run lint         # ESLint
npx tsc --noEmit     # TypeScript check
npm test             # Jest
npm run audit:health # AuditOS health check
npm run backup:verify # Data integrity check
```

**Jest config note:** `jest.config.js` `testMatch` includes both `*.test.ts` and `*.test.tsx`. Component smoke tests are lightweight export-only checks (no `@testing-library/react` dependency).

## Documentation

See `docs/DOCUMENTATION_AUTHORITY.md` for the documentation hierarchy.

Key files:

- `docs/AI_ENTRYPOINT.md` — Session entry (canonical)
- `docs/official/AQLIYA_MASTER_REFERENCE.md` — Current master reference
- `docs/official/aqliya-vision-v1.1.md` — Platform identity and vision
- `docs/official/aqliya-implementation-rules-v1.1.md` — Mandatory coding rules
- `docs/official/aqliya-product-taxonomy-v1.1.md` — Product boundaries and taxonomy
- `docs/official/aqliya-core-architecture-v1.1.md` — Architecture baseline
- `docs/official/aqliya-roadmap-v1.1.md` — Execution phases
- `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` — Detailed implementation status
- `docs/source-of-truth/ROUTE_STRATEGY.md` — Route rules
- `docs/source-of-truth/WHAT_WE_DO_NOT_CLAIM.md` — Commercial exclusions

---

## Trust Principle

AI assists. Humans decide. Evidence governs.

**الذكاء الاصطناعي يساعد. الإنسان يقرر. الدليل يحكم.**
