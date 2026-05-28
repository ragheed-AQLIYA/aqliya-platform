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
- A Cloud + Private/On-Prem dual-deployment platform
- A multi-product company (AuditOS, LocalContentOS, DecisionOS, etc.)
- A builder of custom institutional systems (via AQLIYA Studio)

---

## Products (built on AQLIYA Intelligence Core)

| Product            | Status                            | Route                                                                 |
| ------------------ | --------------------------------- | --------------------------------------------------------------------- |
| **AuditOS**        | Pilot-ready (first proof product) | `/audit` (workspace), `/auditos` (demo)                               |
| **LocalContentOS** | L5 Pilot-ready with conditions    | `/local-content/*` (workspace), `/products/local-content` (marketing) |
| **DecisionOS**     | Active adjacent system            | `/decisions`                                                          |
| **SalesOS**        | Prototype dashboard               | `/sales`                                                              |
| **SimulationOS**   | Marketing-only                    | `/products/simulation`                                                |
| **AQLIYA Studio**  | Future (custom systems builder)   | —                                                                     |

**LocalContentOS evidence (2026-05-23):** Real workspace at `/local-content/*` with server-action mutations. Mutation feedback loop verified (`revalidatePath` + client refresh). Focused smoke **PASS** on finding create at `/local-content/projects/lc-project-demo-001/findings`. CLI validation passed (`prisma generate`, `tsc`, `lint`, `build`, local-content tests). Not L6 production-hardened; binary PDF/XLSX export deferred.

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
