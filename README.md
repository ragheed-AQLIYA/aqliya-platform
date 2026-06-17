# AQLIYA v0.1

**Private Governed Institutional Intelligence Platform**
**منصة ذكاء مؤسسي خاص، محكوم، قابل للتدقيق**

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

---

## Products (built on AQLIYA Intelligence Core)

| Product               | Status                               | Route                                                                 |
| --------------------- | ------------------------------------ | --------------------------------------------------------------------- |
| **AuditOS**           | L5 pilot-ready / v0.1 conditional go | `/audit` (workspace), `/auditos` (demo)                               |
| **LocalContentOS**    | L4→L5 partial pilot-ready            | `/local-content/*` (workspace), `/products/local-content` (marketing) |
| **DecisionOS**        | L4 usable v0.1                       | `/decisions`                                                          |
| **WorkflowOS**        | L4→L5 partial                        | `/workflowos/*`                                                       |
| **Office AI Assistant** | L4 usable v0.1                     | `/assistant/*`                                                        |
| **SalesOS**           | L4 internal preview                  | `/sales/*`                                                            |
| **LocalContactOS**    | L4→L5 partial                        | `/contacts/*`                                                         |
| **SimulationOS**      | Marketing redirect only              | `/products/simulation` → `/products`                                  |
| **AQLIYA Studio**     | L0 strategic future                  | —                                                                     |

**LocalContentOS evidence (2026-05-23):** Real workspace at `/local-content/*` with server-action mutations. Mutation feedback loop verified (`revalidatePath` + client refresh). Focused smoke **PASS** on finding create at `/local-content/projects/lc-project-demo-001/findings`. CLI validation passed (`prisma generate`, `tsc`, `lint`, `build`, local-content tests). Not L6 production-hardened; binary PDF/XLSX export deferred.

**AuditOS v0.1 Real Program (2026-05-28):** Waves A–F complete. Build + test gate passed (27 suites / 213 tests). Go/No-Go: **Conditional GO** for controlled internal / limited pilot — not production-certified. See `docs/reports/auditos-v0.1-go-no-go-review-2026-05-28.md`.

**Build verification (2026-06-17):** `tsc --noEmit` PASS, `npm run build` PASS (127 static pages), 2,321 tests pass (242 suites). Security ship gate: `/api/test-token` removed, CoreAccessControl deny-by-default, MFA JWT populated. See `docs/reports/validation-snapshot-2026-06-17.md`.

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

- `docs/official/AQLIYA_MASTER_REFERENCE.md` — Current master reference
- `docs/official/aqliya-vision-v1.1.md` — Platform identity and vision
- `docs/official/aqliya-implementation-rules-v1.1.md` — Mandatory coding rules
- `docs/official/aqliya-product-taxonomy-v1.1.md` — Product boundaries and taxonomy
- `docs/official/aqliya-core-architecture-v1.1.md` — Architecture baseline
- `docs/official/aqliya-roadmap-v1.1.md` — Execution phases
- `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` — Detailed implementation status
- `docs/source-of-truth/ROUTE_STRATEGY.md` — Route rules

---

## Trust Principle

AI assists. Humans decide. Evidence governs.

**الذكاء الاصطناعي يساعد. الإنسان يقرر. الدليل يحكم.**
