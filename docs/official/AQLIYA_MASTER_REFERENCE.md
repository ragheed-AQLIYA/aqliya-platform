# AQLIYA Master Reference v0.1

**Status:** Current master reference for AQLIYA v0.1 operational baseline  
**Version:** 0.1  
**File location:** `docs/official/AQLIYA_MASTER_REFERENCE.md`  
**Authority:** Level 1 — secondary only to `docs/DOCUMENTATION_AUTHORITY.md`  
**Last updated:** 2026-05-28

---

## 1. Current AQLIYA Definition

AQLIYA is a **Private Governed Institutional Intelligence Platform**.

**Arabic:** عقلية هي منصة ذكاء مؤسسي خاص ومحكوم تساعد الجهات على بناء وتشغيل أنظمة مؤسسية ذكية داخل بيئة مضبوطة، مع حوكمة، أدلة، صلاحيات، وسجل تدقيقي.

**English:** AQLIYA helps institutions build governed, evidence-based intelligent systems across cloud and private environments.

---

## 2. Platform Identity

### AQLIYA IS:

- A Private Governed Institutional Intelligence Platform
- A multi-product platform company
- Governance-first, evidence-based, human-reviewed
- Cloud + Private strategic platform
- A product factory for governed institutional workflows
- A system where evidence, review, approval, and audit logs are core design requirements

### AQLIYA IS NOT:

- AuditOS only
- SaaS only
- An AI chatbot
- A CRM
- A generic workflow tool
- A collection of disconnected demos
- A marketing website without operational systems

---

## 3. Trust Principle

> **AI assists. Humans decide. Evidence governs.**

**Arabic:** الذكاء الاصطناعي يساعد. الإنسان يقرر. الدليل يحكم.

Every AI-assisted feature obeys this principle.

---

## 4. Deployment Positioning

| Model                        | Status                                                     |
| ---------------------------- | ---------------------------------------------------------- |
| **AQLIYA Cloud**             | Implemented — current active deployment model              |
| **AQLIYA Private / On-Prem** | Strategic / future — not implemented as production package |
| **AQLIYA Air-Gapped**        | Strategic / future — not implemented                       |

---

## 5. Product Taxonomy

```
AQLIYA Company
├── AQLIYA Intelligence Core
│   ├── Shared Applications
│   │   └── Office AI Assistant
│   ├── AI Orchestration Engine
│   ├── Governance Engine
│   ├── Workflow Engine
│   ├── Evidence Graph
│   ├── RBAC / Permissions
│   ├── Audit Logs
│   ├── Document Intelligence
│   ├── Reporting Engine
│   └── Deployment Layer
├── Products / Systems
│   ├── AuditOS
│   ├── DecisionOS
│   ├── LocalContentOS
│   ├── SalesOS
│   ├── LocalContactOS
│   ├── RiskOS
│   ├── ComplianceOS
│   ├── LegalOS
│   └── GovOS
├── Custom / Client-Specific Workspaces
│   ├── WorkflowOS (canonical governed workspace)
│   └── Sunbul (legacy redirect alias to WorkflowOS)
└── Strategic Platform Layer
    └── AQLIYA Studio
```

---

## 6. Product Implementation Status

| Product                 | Status                              | Maturity                           | Details                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------------------- | ----------------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AuditOS**             | Pilot-ready product                 | **L5**                             | First proof product. Full workspace at `/audit/*`, demo at `/auditos/*`. Engagement management, trial balance, financial statements, evidence vault, findings, review/approval, exports, AI review, audit trail. v0.1 Real Program (Waves A–F, 2026-05-28): **Conditional GO** for controlled internal / limited pilot — not L6 production-certified. See `docs/reports/auditos-v0.1-go-no-go-review-2026-05-28.md`. |
| **DecisionOS**          | Active adjacent system              | **L4**                             | Workspace at `/decisions/*`. Decision request, context, options, risks, evidence, recommendation draft, committee workflow, approval, final record, exports, seed data.                                                                                                                                                                                                                                              |
| **LocalContentOS**      | Pilot-ready with conditions         | **L5 Pilot-ready with conditions** | Workspace at `/local-content/*` (12 routes). Projects, suppliers, spend, classification, evidence, findings, scoring, review/approval, reports/export (PDF/XLSX via pdfkit + xlsx), audit trail, seed data, Arabic-first UI. Mutation feedback loop verified (2026-05-23). Finding create PASS on `/local-content/projects/lc-project-demo-001/findings`. CLI validation passed (local-content tests: 30). Not L6.   |
| **Office AI Assistant** | Governed shared application         | **L4**                             | Workspace at `/assistant/*`. Task categories, document-aware responses, action logs, user review, evidence references, permission checks, audit events. Shared application, not primary product.                                                                                                                                                                                                                     |
| **Sunbul**              | Legacy redirect alias to WorkflowOS | **N/A**                            | Routes at `/sunbul/*` are `permanentRedirect(302)` to matching `/workflowos/*` routes. No standalone components or data. Preserved for backward compatibility.                                                                                                                                                                                                                                                       |
| **WorkflowOS**          | Governed custom/client workspace    | **L4**                             | Canonical governed workspace at `/workflowos/*`. Real CRUD, workflow states, audit trail, PDF export. Sunbul data models reused.                                                                                                                                                                                                                                                                                     |
| **SalesOS**             | Prototype / internal preview        | **L3**                             | Dashboard at `/sales`, marketing at `/products/sales`. Static dashboard only. No backend/workspace implementation.                                                                                                                                                                                                                                                                                                   |
| **SimulationOS**        | Marketing label                     | **L1**                             | Page at `/products/simulation`. Not a standalone system.                                                                                                                                                                                                                                                                                                                                                             |
| **LocalContactOS**      | Not implemented                     | **L0**                             | Future product. No routes, schema, or workspace.                                                                                                                                                                                                                                                                                                                                                                     |
| **RiskOS**              | Not implemented                     | **L0**                             | Future product.                                                                                                                                                                                                                                                                                                                                                                                                      |
| **ComplianceOS**        | Not implemented                     | **L0**                             | Future product.                                                                                                                                                                                                                                                                                                                                                                                                      |
| **LegalOS**             | Not implemented                     | **L0**                             | Future product.                                                                                                                                                                                                                                                                                                                                                                                                      |
| **GovOS**               | Not implemented                     | **L0**                             | Future product.                                                                                                                                                                                                                                                                                                                                                                                                      |
| **AQLIYA Studio**       | Strategic / future                  | **L0**                             | Custom systems builder layer. Not implemented.                                                                                                                                                                                                                                                                                                                                                                       |

---

## 7. Route Map

| Route                      | Purpose                                    | Status                      |
| -------------------------- | ------------------------------------------ | --------------------------- |
| `/`                        | Company homepage                           | Active                      |
| `/products/*`              | Product catalog and marketing pages        | Active                      |
| `/audit/*`                 | AuditOS governed workspace                 | Active — L5                 |
| `/auditos/*`               | AuditOS guided demo                        | Active — L1 demo            |
| `/decisions/*`             | DecisionOS workspace                       | Active — L4                 |
| `/assistant/*`             | Office AI Assistant                        | Active — L4                 |
| `/local-content/*`         | LocalContentOS workspace (12 routes)       | Active — L5 with conditions |
| `/sunbul/*`                | Sunbul legacy redirect alias to WorkflowOS | Active — redirect alias     |
| `/workflowos/*`            | WorkflowOS governed workspace              | Active — L4                 |
| `/sales`                   | SalesOS prototype dashboard                | Active — L3 prototype       |
| `/organizations/*`         | Generic organizations prototype            | Active — L3 prototype       |
| `/settings/*`              | Platform diagnostics + prototype settings  | Active — L2/L4              |
| `/monitoring`              | Platform monitoring                        | Active — L4                 |
| `/api/*`                   | API routes                                 | Active — permissioned       |
| `/custom-product`          | Custom product inquiry                     | Active — L4                 |
| `/login`, `/access-denied` | Auth pages                                 | Active                      |

---

## 8. What Is Implemented

All surfaces with active routes, server actions, database models, seed data, tests, and documentation:

- **AQLIYA Platform** — Core authentication (NextAuth v5), RBAC (tenant guard), audit logs (AuditEvent model), workspace diagnostics, health monitoring
- **AuditOS** — Full engagement lifecycle, trial balance upload, account mapping, financial statements, notes/evidence, findings, AI review, review/approval, exports (PDF/XLSX), audit trail
- **DecisionOS** — Decision request, context/options/risks, evidence attachment, recommendation, committee voting, approval, final record, export/memo, audit trail, seed data
- **LocalContentOS** — Project setup, supplier/vendor records, spend/procurement records, classification workflow, evidence upload, local content scoring, gap/risk findings, review/approval, reports/export, audit trail, seed data, Arabic-first UI
- **Office AI Assistant** — Task creation, document-aware responses, file content extraction, review workflow, action logs, permission checks, audit events
- **Sunbul** — Legacy redirect alias to WorkflowOS
- **WorkflowOS** — Canonical governed workspace, multi-client records management, governed workflow, audit trail, PDF export
- **Platform Infrastructure** — Auth, RBAC, audit logs, storage provider, export engine, health monitoring
- **Custom Product Inquiry** — Funnel with form submission API

---

## 9. What Is NOT Implemented

- Production On-Prem package
- Air-Gapped deployment
- Local AI runtime
- GPU local inference
- Kubernetes deployment
- SIEM integration
- SSO/LDAP/Active Directory integration
- Model Governance registry
- Institutional Memory engine
- AQLIYA Studio builder
- SalesOS backend/workspace
- LocalContactOS backend
- RiskOS, ComplianceOS, LegalOS, GovOS implementations
- Fully autonomous AI decisions (AI is assistive only)
- Automated backup/restore

---

## 10. What Is Pilot-Ready (L5)

- **AuditOS** — Full pilot-ready product. Complete workflow, governance, evidence, review/approval, exports, audit trail. v0.1 Real Program Go/No-Go (2026-05-28): **Conditional GO** for controlled internal / limited pilot — not production-certified.
- **LocalContentOS** — L5 Pilot-ready with conditions. Workspace, workflow, governance, evidence, review/approval, binary PDF/XLSX exports (pdfkit + xlsx), audit trail. Mutation feedback loop verified (2026-05-23). Pending: clean manual pass for review/approval/report inline forms; L6 hardening.

---

## 11. What Is Prototype (L3)

- **SalesOS** — Static dashboard only. No backend, no data persistence, no workflow.
- **Organizations surface** — Mock/internal preview only.
- **Generic settings** — Local-state-only preview.

---

## 12. What Is Marketing-Only (L1)

- **SimulationOS** — Product page only. No workspace, routes, schema, or actions.
- **auditos demo** — Guided demo experience (public, mock-backed, read-only). Not a working product.

---

## 13. What Is Strategic / Future (L0)

- **LocalContactOS**
- **RiskOS**
- **ComplianceOS**
- **LegalOS**
- **GovOS**
- **AQLIYA Studio**
- **Private / On-Prem package**
- **Air-Gapped deployment**
- **Local AI runtime**
- **Model Governance**
- **Institutional Memory**

---

## 14. Unsupported Claims That Must NOT Be Made

The following claims are not supported by current code, routes, schema, or validation:

- AQLIYA is production-hardened (L6)
- AQLIYA has regulator certification
- AQLIYA browser verification is fully complete for all products
- On-Prem package is available for deployment
- Air-Gapped mode is operational
- Local AI runtime is functional
- SSO/LDAP/AD integration is implemented
- SIEM integration exists
- Kubernetes deployment is configured
- GPU inference is available
- Full enterprise deployment is complete
- AI makes autonomous decisions
- LocalContentOS is production-hardened (L6) or regulator-certified
- LocalContentOS is marketing-only or unimplemented (contradicts workspace at `/local-content/*`)

---

## 15. Relationship Between v0.1 and v1.1 Doctrine Docs

The v1.1 doctrine docs (`docs/official/aqliya-vision-v1.1.md`, `docs/official/aqliya-implementation-rules-v1.1.md`, etc.) define the long-term platform identity, governance framework, and strategic direction.

This master reference (`AQLIYA_MASTER_REFERENCE.md`) captures the current v0.1 operational baseline — what is actually built, deployed, and validated.

**Relationship rule:**

- For identity, governance, trust principles, and strategic positioning: v1.1 doctrine governs.
- For implementation status, route reality, product maturity: this master reference and validated code evidence govern.
- If v1.1 doctrine docs contain implementation-status claims that contradict this master reference, the master reference's code-validated status wins.

---

## 16. Build & Validation Baseline (2026-05-28)

### Canonical validation gate (run before any release)

| Command                                 | Status                       |
| --------------------------------------- | ---------------------------- |
| `npx prisma validate`                   | ✅ Pass                      |
| `npx prisma generate`                   | ✅ Generated                 |
| `npx prisma db push --accept-data-loss` | ✅ Synced                    |
| `npx tsc --noEmit`                      | ✅ 0 errors                  |
| `npm run build`                         | ✅ Compiled                  |
| `npx eslint src/ --quiet`               | ✅ 0 warnings                |
| `npx jest --passWithNoTests`            | ✅ 27 suites, 213 tests pass |
| `npx tsx prisma/seed.ts`                | ✅ Seeds fully               |

### Milestone

All **18 TypeScript errors**, **135 ESLint warnings**, and **multiple test failures** resolved in one session (2026-05-28). This is the first time the codebase produces a completely clean build, zero lint warnings, and full test pass simultaneously.

### Known deferred items

- 4 separate audit log models (AuditLog, AuditEvent, PlatformAuditLog, SunbulAuditEvent) remain unmerged
- 208 console.log/warn/error remain in the codebase; most are intentional error reporting in server actions
- `actions/decisions.ts` is in eslint ignore (19 suppressed unused vars)
- 14 AuditOS Prisma enums attempted but **reverted to String** because enum values did not match existing codebase literals; `src/types/audit/index.ts` provides equivalent type safety
