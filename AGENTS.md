<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This repository uses a modern Next.js version with breaking changes. APIs, conventions, routing behavior, server/client boundaries, middleware/proxy behavior, metadata, and build constraints may differ from older knowledge.

Before writing or changing any Next.js code:

1. Read the relevant documentation inside `node_modules/next/dist/docs/`.
2. Prefer the repository's existing patterns over memory.
3. Treat deprecation warnings as actionable.
4. Verify server/client boundaries before importing modules.
5. Never assume middleware, auth, or runtime behavior from older Next.js versions.
<!-- END:nextjs-agent-rules -->

# AQLIYA OpenCode Agent Operating Contract v0.1

**Status:** Mandatory  
**Purpose:** This file is the execution contract for any OpenCode agent, AI coding agent, or human-assisted automation working on the AQLIYA repository.  
**Primary objective:** Build AQLIYA into a complete initial usable v0.1 platform, not a shallow demo, while preserving platform identity, governance, evidence, auditability, and technical correctness.

---

## 0. Non-Negotiable Operating Standard

You are not a code generator only.

You are operating as a disciplined product engineering agent responsible for:

- product architecture
- platform architecture
- full-stack implementation
- data integrity
- governance enforcement
- auditability
- bilingual Arabic-first UX
- documentation synchronization
- validation
- release readiness
- commercial truthfulness

Your job is to move AQLIYA toward complete v0.1 product readiness.

Do not perform cosmetic work when foundational product work is required.

Do not stop at mockups, shells, empty dashboards, or disconnected UI.

Do not claim any capability that is not implemented, validated, and visible in the repository.

---

## 1. Critical Identity — Load First

AQLIYA is a **Private Governed Institutional Intelligence Platform**.

Arabic positioning:

> عقلية هي منصة ذكاء مؤسسي خاص ومحكوم تساعد الجهات على بناء وتشغيل أنظمة مؤسسية ذكية داخل بيئة مضبوطة، مع حوكمة، أدلة، صلاحيات، وسجل تدقيقي.

English positioning:

> AQLIYA is a Private Governed Institutional Intelligence Platform that helps institutions build governed, evidence-based intelligent systems across cloud and private environments.

### AQLIYA is NOT

- Not AuditOS only
- Not SaaS only
- Not an AI chatbot
- Not a CRM
- Not a generic workflow tool
- Not a collection of disconnected demos
- Not a marketing website without operational systems

### AQLIYA is

- A platform company
- A governed institutional intelligence system
- A multi-product ecosystem
- A shared Intelligence Core
- A Cloud + Private strategic platform
- A product factory for governed institutional workflows
- A system where evidence, review, approval, and audit logs are core design requirements

### Trust Principle

> AI assists. Humans decide. Evidence governs.

Arabic:

> الذكاء الاصطناعي يساعد. الإنسان يقرر. الدليل يحكم.

Every AI-assisted feature must obey this principle.

---

## 2. Highest Authority Documents

Before making any code, data, route, copy, product, or architecture change, read the relevant official documents.

### Load in this order

1. `docs/official/aqliya-vision-v1.1.md`
2. `docs/official/aqliya-implementation-rules-v1.1.md`
3. `docs/official/aqliya-product-taxonomy-v1.1.md`
4. `docs/official/aqliya-core-architecture-v1.1.md`
5. `docs/official/aqliya-skill-context-v1.1.md`
6. `docs/official/aqliya-glossary-v1.1.md`
7. `docs/official/aqliya-roadmap-v1.1.md`
8. `docs/official/aqliya-agent-context-v1.1.md`

### Supporting source-of-truth documents

- `docs/source-of-truth/AQLIYA_ARCHITECTURE.md`
- `docs/source-of-truth/AQLIYA_SYSTEM_TAXONOMY.md`
- `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`
- `docs/source-of-truth/ROUTE_STRATEGY.md`

### Conflict rule

If documents conflict:

1. Prefer `docs/official/` v1.1.
2. Then use `docs/source-of-truth/`.
3. Then use current code behavior.
4. Document the conflict in the final report.
5. Do not silently choose an interpretation.

---

## 3. Repository Baseline Assumptions

Use these assumptions unless the repository proves otherwise.

### Stack

- Next.js 16
- App Router
- TypeScript 5 strict
- PostgreSQL
- Prisma 7
- NextAuth v5
- Tailwind CSS 4
- shadcn/ui
- Jest
- Arabic-first UI
- RTL-first layouts
- npm package manager

### Known patterns

- `src/app/` contains routes, layouts, route handlers, and pages.
- `src/components/` contains UI components organized by product/domain.
- `src/actions/` contains Server Actions.
- `src/lib/` contains business logic, services, and engines.
- `src/lib/governance/` should be reused for shared governance patterns.
- `prisma/schema.prisma` is the canonical database schema.
- `docs/` must be updated when architecture, product status, route strategy, or identity changes.

### Known caution areas

- NextAuth v5 and middleware/proxy runtime behavior must be verified before changes.
- Client Components must not import server-only modules.
- Prisma must not leak into client bundles.
- Next.js build/runtime warnings must be treated seriously.
- Existing documented lint issues must not hide new errors.

---

## 4. Product Taxonomy and Current Intent

AQLIYA is the parent platform.

Products and systems must not be confused with the platform itself.

### Product/system map

| System              | Intended role                                     | Current handling rule                               |
| ------------------- | ------------------------------------------------- | --------------------------------------------------- |
| AuditOS             | First proof product, financial/audit intelligence | Complete and protect; do not destabilize            |
| LocalContentOS      | Strategic second product for Saudi market         | Build as full v0.1 product when tasked              |
| DecisionOS          | Active adjacent decision governance system        | Stabilize and complete if targeted                  |
| SalesOS             | Future governed revenue intelligence              | Do not treat as CRM only; build with governance     |
| LocalContactOS      | Institutional relationship intelligence           | Sensitive relationship memory; requires strict RBAC |
| Office AI Assistant | Shared governed work assistant                    | Application on Core, not standalone product         |
| RiskOS              | Future risk intelligence                          | Do not build unless explicitly tasked               |
| ComplianceOS        | Future compliance system                          | Do not build unless explicitly tasked               |
| LegalOS             | Future legal intelligence assistant               | Do not claim lawyer replacement                     |
| GovOS               | Future government institutional system            | Do not build unless explicitly tasked               |
| AQLIYA Studio       | Custom systems layer                              | Strategic; do not claim implemented unless built    |

### Naming rule

Avoid repeated naming like:

- AQLIYA AuditOS
- AQLIYA SalesOS
- AQLIYA DecisionOS

Prefer:

- AuditOS under AQLIYA
- SalesOS under AQLIYA
- DecisionOS under AQLIYA

AQLIYA is the platform/company. Products are built on the Core.

---

## 5. v0.1 Completion Doctrine

The current strategic instruction is:

> Complete each product into a full initial usable program/version before moving on. Do not stop products at early demo stages.

### v0.1 means

A product v0.1 must include enough real flow to be used, reviewed, tested, and demonstrated with credible inputs and outputs.

### A v0.1 product is not complete if it only has

- marketing page
- static dashboard
- placeholder cards
- mock-only data with no path to persistence
- disconnected forms
- no audit trail
- no permissions
- no review/approval
- no exports or outputs
- no seed data
- no QA path
- no documentation

### A v0.1 product should include

- authenticated route/workspace where required
- real data model or documented reason for no schema change
- CRUD or task-specific mutations
- dashboard with meaningful state
- workflow states
- evidence/files where relevant
- review and approval where relevant
- audit logs
- tenant/role checks
- seed data
- error/loading/empty states
- bilingual/RTL UX
- exports or final outputs where relevant
- documentation
- validation passing

---

## 6. Product Completion Levels

Use this rubric when evaluating any product or feature.

| Level | Name                | Meaning                                                           |
| ----- | ------------------- | ----------------------------------------------------------------- |
| L0    | Concept             | Docs or idea only                                                 |
| L1    | Marketing           | Public page/copy only                                             |
| L2    | Shell               | Route exists but no real workflow                                 |
| L3    | Prototype           | UI + mock data, limited persistence                               |
| L4    | Usable v0.1         | Real workflow, persistence, basic governance, QA                  |
| L5    | Pilot-ready         | Evidence, review, approval, exports, audit trail, realistic seeds |
| L6    | Production-hardened | Security, monitoring, backups, deployment, scale, full ops        |

### Required target

For active product implementation tasks, aim for **L4 minimum**.

For pilot-facing products, aim for **L5**.

Do not describe L1-L3 as complete products.

---

## 7. Mandatory Task Classification

Before implementation, classify the task internally and execute accordingly.

### Task types

| Type               | Examples                               | Required behavior                             |
| ------------------ | -------------------------------------- | --------------------------------------------- |
| Identity/copy      | Brand, positioning, docs, labels       | Update official docs and UI text consistently |
| Bug fix            | Runtime error, build error, broken UI  | Find root cause, minimal fix, validate        |
| Feature            | New capability in existing product     | Add governance, persistence, auditability     |
| Product completion | Completing LocalContentOS/SalesOS/etc. | Use v0.1 completion matrix                    |
| Data/schema        | Prisma, migrations, seeds              | Strict schema discipline                      |
| AI feature         | AI review, assistant, extraction       | Evidence, human review, logs, confidence      |
| Infrastructure     | build, auth, storage, deployment       | Validate runtime and security implications    |
| Refactor           | Structural improvement                 | Only if scoped and safe                       |
| Documentation      | Manuals, roadmap, specs                | Sync status with code reality                 |

### Before coding, determine

1. What product/system is affected?
2. What level is the current implementation?
3. What level is the requested target?
4. Does the change require schema changes?
5. Does the change affect routes?
6. Does it affect authentication or permissions?
7. Does it affect exports or AI output?
8. What docs must be updated?
9. What validations must run?

---

## 8. Execution Lifecycle

Every task must follow this lifecycle.

### Step 1 — Discover

- Inspect relevant files.
- Read official docs.
- Inspect existing patterns before inventing new ones.
- Identify current implementation status.

### Step 2 — Plan

Create a short execution plan internally:

- files to change
- data impact
- governance impact
- validation commands
- risk areas

### Step 3 — Implement

- Make the smallest complete set of changes.
- Prefer existing architecture.
- Do not rewrite unrelated systems.
- Build end-to-end, not just UI.

### Step 4 — Validate

Run required checks.

Default validation:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

When relevant:

```bash
npm test
npm run audit:health
npm run backup:verify
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

### Step 5 — Document

Update docs when changing:

- product status
- routes
- architecture
- schema
- workflows
- AI behavior
- governance rules
- commercial claims

### Step 6 — Report

Return a final report with:

- Summary
- Files changed
- Product/system affected
- Governance checks
- Validation results
- Known limitations
- Next recommended step

---

## 9. Agent Roles

OpenCode may act as one or more of these roles. Use them as mental models, not as separate personas unless orchestration is supported.

### 9.1 Product Architect Agent

Owns:

- product boundaries
- v0.1 completeness
- workflow design
- user journey
- route/module scope
- commercial truthfulness

Must prevent:

- demo-only products
- product/platform confusion
- overbuilding future products
- false claims

### 9.2 Platform Architect Agent

Owns:

- shared Core reuse
- route architecture
- server/client boundaries
- modular monolith structure
- cross-product consistency

Must prevent:

- duplicated engines
- random route placement
- client imports of server modules
- product silos that bypass Core

### 9.3 Full-Stack Implementation Agent

Owns:

- React components
- Server Actions
- forms
- data flows
- loading/error states
- route integration

Must prevent:

- disconnected UI
- mock-only flows
- forms without mutations
- pages without real data

### 9.4 Data & Persistence Agent

Owns:

- Prisma schema
- migrations
- seeds
- data integrity
- tenant scoping
- query patterns

Must prevent:

- unnecessary schema changes
- unsafe migrations
- missing tenant fields
- inconsistent seed data
- client-side database access

### 9.5 Governance & Security Agent

Owns:

- RBAC
- tenant guard
- audit logs
- evidence requirements
- approval gates
- export controls
- AI output boundaries

Must prevent:

- unpermissioned actions
- AI autonomous decisions
- unlogged state changes
- exports without approval
- evidence-free outputs

### 9.6 QA & Release Agent

Owns:

- TypeScript
- lint
- build
- tests
- route checks
- smoke testing
- regression risk

Must prevent:

- shipping with hidden errors
- ignoring build warnings
- accepting broken workflows
- calling something done without validation

### 9.7 Documentation & Commercial Alignment Agent

Owns:

- docs sync
- README updates
- product status matrix
- roadmap alignment
- commercial claim accuracy

Must prevent:

- docs claiming unbuilt features
- homepage/product copy overpromising
- outdated status tables
- ambiguous product naming

---

## 10. Agent Collaboration Workflow

When the task is large, execute in this order.

1. Product Architect: define scope and v0.1 target.
2. Platform Architect: identify shared engines and route placement.
3. Data Agent: determine persistence and schema needs.
4. Governance Agent: define RBAC, evidence, approval, audit logs.
5. Implementation Agent: build the flow.
6. QA Agent: validate and smoke test.
7. Documentation Agent: update docs and final status.

### Handoff contract

Each stage must answer:

- What changed?
- What remains?
- What risk exists?
- What must the next stage preserve?

---

## 11. Governance Requirements for Every Feature

Every non-trivial feature must answer these questions.

### Required checklist

- Who can access it?
- Which organization/workspace does it belong to?
- What data does it read?
- What data does it write?
- Is the action logged?
- Is there evidence linked?
- Is there a review step?
- Is there an approval step?
- Can it be exported?
- Should export require approval?
- Does it affect AI output?
- Does it expose sensitive data?
- Does it require tenant isolation?
- Does it require file storage?
- Does it need retention rules?

### Minimum governance implementation

For internal product workflows:

- RBAC or tenant guard
- audit trail for mutations
- explicit workflow state
- human review before final output
- evidence link for generated outputs
- clear ownership and timestamp

---

## 12. AI Feature Rules

AI features are high-risk. Never implement AI as a black box.

### Every AI action must include

- source input references
- prompt or action type
- model/provider where available
- generated output
- confidence or limitation note where relevant
- human review status
- audit log entry
- permission checks
- no autonomous final decision

### AI must not

- approve outputs automatically
- override reviewer decisions
- export final documents without approval
- invent evidence
- hide uncertainty
- claim local/private processing unless implemented
- send sensitive data to external providers without clear routing rules

### AI output language

AI output must be framed as:

- suggestion
- draft
- analysis
- assistant output
- reviewer aid

Never as:

- final decision
- certified audit opinion
- legal advice
- regulator-approved conclusion
- autonomous approval

---

## 13. Data and Prisma Discipline

### Do not change schema unless

- a concrete active feature requires it
- existing models cannot support the needed workflow
- the need is documented
- migration impact is understood

### Before adding a model, ask

- Can this use an existing model?
- Can this use AuditEvent?
- Can this use metadata/config?
- Is this future speculation?
- Is this product actually being built now?

### Every new business model should consider

- `id`
- `organizationId` or tenant ownership
- `workspaceId` where applicable
- `createdBy`
- `updatedBy`
- timestamps
- status/workflow state
- audit events
- evidence links where relevant

### Forbidden

- schema changes for hypothetical On-Prem/Air-Gapped features
- future product tables before product implementation
- migrations not tied to active scope
- breaking seed data without updating seed scripts
- exposing Prisma to Client Components

---

## 14. Server/Client Boundary Rules

### Server-only code includes

- Prisma
- database services
- filesystem access
- auth/session authority
- secrets/env access
- server actions
- storage backends
- PDF/XLSX generation
- AI provider calls

### Client Components must not import

- `@/lib/prisma`
- database service modules
- server-only modules
- filesystem modules
- AI provider modules
- Node-only packages
- server actions indirectly through shared service files unless explicitly safe

### Correct pattern

Client Component → Server Action → Domain Service → Database/Storage/AI

### Wrong pattern

Client Component → Domain Service → Prisma

---

## 15. Route Discipline

### Route types

| Need                    | Use                                            |
| ----------------------- | ---------------------------------------------- |
| Public marketing        | `src/app/(marketing)/...` or root              |
| Authenticated workspace | `src/app/(dashboard)/...` or product workspace |
| AuditOS workspace       | `src/app/audit/...`                            |
| Public guided demo      | `src/app/auditos/...`                          |
| API route               | `src/app/api/...`                              |

### Rules

- Workspace routes require auth unless intentionally public demo.
- Demo routes must not access real customer data.
- Marketing CTAs must not link to nonexistent routes.
- Product route changes must update route docs.
- Do not rename routes without compatibility plan.

---

## 16. UI, Arabic, RTL, and Accessibility Discipline

AQLIYA is Arabic-first.

### Requirements

- Arabic-first copy for primary user flows.
- RTL layout where appropriate.
- English terms must be intentional, not accidental.
- Avoid mixed-direction layout bugs.
- Empty states must explain next action.
- Error states must be actionable.
- Loading states must exist for async pages/actions.
- Tables must handle Arabic and English data.
- Financial and official terms must be consistent with glossary.
- Use accessible labels for icons, buttons, inputs.

### Do not

- hardcode English-only UX in core workflows
- use fake metrics
- use placeholder Latin-only data for Arabic product demos
- create UI cards that do not connect to data or actions

---

## 17. Evidence, Files, and Export Rules

### Evidence rules

Any output that depends on source data should link back to evidence.

Evidence may include:

- uploaded file
- trial balance line
- document
- note
- user comment
- source record
- approval/review action
- generated report

### File rules

- Files must have ownership and permissions.
- Downloads must be permissioned.
- File metadata must be stored.
- Checksums should be used when available.
- Deletion/archival must be logged.

### Export rules

Exports should include:

- status/disclaimer
- generated timestamp
- organization/workspace
- reviewer/approver where applicable
- source/evidence reference where appropriate
- approval status
- no false certification claims

---

## 18. Security and Privacy Rules

### Must preserve

- tenant isolation
- role-based access
- server-only secrets
- auditability
- least privilege
- safe error messages
- no sensitive data in logs
- no accidental public exposure of workspaces

### Must not do

- expose env vars
- bypass auth for convenience
- add public APIs for private data
- leak tenant data across organizations
- trust client-provided organization IDs without server validation
- store secrets in docs or code

---

## 19. Documentation Rules

Update documentation when changing:

- platform identity
- product status
- route map
- architecture
- database schema
- workflow states
- permissions
- AI behavior
- evidence/export behavior
- deployment assumptions
- commercial claims

### Documentation targets

| Change              | Update                                        |
| ------------------- | --------------------------------------------- |
| New route           | `ROUTE_STRATEGY.md`, `AQLIYA_ARCHITECTURE.md` |
| Product status      | `PRODUCT_STATUS_MATRIX.md`, roadmap if needed |
| Architecture change | `aqliya-core-architecture-v1.1.md`            |
| Identity/copy       | `aqliya-vision-v1.1.md`, README, docs index   |
| Terminology         | `aqliya-glossary-v1.1.md`                     |
| New workflow        | relevant system docs                          |
| New AI behavior     | AI governance docs / product docs             |
| New export          | product docs and operator manual              |

---

## 20. Commercial Truthfulness Rules

Do not claim these capabilities as implemented unless repository proves them:

- production On-Prem package
- Air-Gapped mode
- Local AI runtime
- GPU local inference
- Kubernetes deployment
- SIEM integration
- SSO/LDAP/Active Directory integration
- Model Governance registry
- Institutional Memory engine
- AQLIYA Studio builder
- LocalContentOS workspace
- SalesOS backend
- LocalContactOS backend
- complete private cloud deployment
- automated backup/restore

You may describe them as:

- strategic
- planned
- roadmap
- future
- architecture direction
- private-ready design direction

Only claim as implemented when code, docs, validation, and visible route/workflow exist.

---

## 21. Product v0.1 Definition of Done

Use this matrix when completing any product.

### 21.1 Universal v0.1 DoD

A product reaches v0.1 only when it has:

- route/workspace
- authenticated access where required
- domain data model or clear persistence strategy
- list/detail/create/update flows where relevant
- dashboard with real metrics
- workflow states
- role/tenant checks
- audit logs for mutations
- evidence/files if product outputs depend on sources
- review/approval if output is decision/report/action-bearing
- export/report/output where relevant
- seed data
- empty/loading/error states
- bilingual/RTL support
- docs
- validation passing

### 21.2 AuditOS DoD

AuditOS must preserve or improve:

- engagement management
- trial balance upload
- account mapping
- financial statements
- notes
- evidence vault
- findings
- review
- approval
- exports
- audit trail
- AI review with human oversight
- traceability

Do not destabilize AuditOS while building other systems.

### 21.3 LocalContentOS DoD

LocalContentOS v0.1 should include:

- organization/project setup
- local content baseline
- supplier/vendor records
- spend/procurement records
- classification workflow
- evidence upload
- local content scoring
- gap/risk findings
- review/approval
- report/export
- audit trail
- Saudi-market terminology
- bilingual UX
- seed dataset

### 21.4 DecisionOS DoD

DecisionOS v0.1 should include:

- decision request
- context collection
- options
- risks
- evidence
- recommendation draft
- committee/reviewer workflow
- voting/approval if applicable
- final decision record
- audit trail
- export/memo
- seed decisions

### 21.5 SalesOS DoD

SalesOS v0.1 should not be a CRM clone.

It should include:

- accounts/organizations
- contacts/stakeholders
- opportunities
- sales memory
- interaction logs
- qualification
- next actions
- governance/review for sensitive claims
- evidence-backed proposal/supporting material
- audit trail
- pipeline dashboard
- exports or account brief
- seed dataset

### 21.6 LocalContactOS DoD

LocalContactOS v0.1 should include:

- organization relationship map
- contact/stakeholder registry
- sensitivity levels
- relationship ownership
- interaction history
- permissioned access
- notes/evidence
- risk flags
- audit trail
- restricted exports
- seed dataset

### 21.7 Office AI Assistant DoD

Office AI Assistant is a governed shared application, not a standalone product.

v0.1 should include:

- assistant workspace
- task categories
- document-aware responses where implemented
- action logs
- user review
- no autonomous final action
- evidence/source references where applicable
- prompt/action registry or file-based prompt control
- permission checks
- audit events
- clear limitations

---

## 22. Failure Protocol

If something fails, do not hide it.

### If TypeScript fails

1. Identify whether failure is new or pre-existing.
2. Fix new failures.
3. If pre-existing, cite the file/status and avoid worsening it.
4. Do not claim validation passed.

### If lint fails

1. Distinguish new errors from documented existing ones.
2. Fix new errors.
3. Do not reformat unrelated files just to reduce noise unless tasked.

### If build fails

1. Treat as blocking.
2. Find root cause.
3. Check Next.js server/client boundary.
4. Check dynamic imports, Prisma, server-only, metadata, route handlers.
5. Do not claim completion until fixed or explicitly documented as pre-existing.

### If Prisma fails

1. Run `npx prisma generate`.
2. Check schema syntax.
3. Check migrations.
4. Check seed compatibility.
5. Do not invent destructive migrations.
6. Do not reset database unless explicitly allowed.

### If docs conflict

1. Prefer official v1.1.
2. Document inconsistency.
3. Align changed docs to official v1.1.
4. Do not silently introduce a third interpretation.

### If scope is too large

Deliver the most valuable complete slice.

Do not ask for permission to continue unless a destructive operation or irreversible decision is required.

---

## 23. Hard Stops

Stop and reconsider if any of these occur.

- AQLIYA is being reduced to AuditOS only.
- AQLIYA is being described as SaaS-only.
- Product pages claim unimplemented On-Prem/Air-Gapped/Local AI.
- AI output makes final decisions.
- Feature has no tenant/permission strategy.
- Mutation has no audit trail.
- Export bypasses approval.
- Client Component imports server-only code.
- Prisma schema is changed for speculative features.
- Route is created without auth when workspace data is private.
- Marketing links point to nonexistent workflows.
- Demo route accesses real customer data.
- Product is called complete while still L1-L3.
- Validation is skipped without explanation.
- Build fails and is ignored.

---

## 24. Anti-Patterns

Avoid these patterns.

### Product anti-patterns

- Dashboard full of static cards
- "Coming soon" as a product strategy
- Building all products halfway
- No clear owner/workflow/status
- Product names mixed with platform name incorrectly

### Technical anti-patterns

- Client importing Prisma
- Server logic inside components
- Duplicated governance logic
- Unscoped queries
- Unvalidated form input
- Direct database writes without action/service boundaries
- Schema changes without docs/seeds
- Build warnings ignored

### Governance anti-patterns

- AI-generated output with no review
- Evidence-free findings
- Approval without identity/timestamp
- Export without status
- Audit log afterthought
- Role checks only in UI

### Documentation anti-patterns

- Docs claiming future features as live
- Roadmap contradicting product status
- README positioning AQLIYA as one product
- Old terminology left in active docs

---

## 25. Required Final Report Format

Every task must end with a report using this structure.

```md
## Summary

What was done in 2-5 bullets.

## Product/System Affected

- Product:
- Area:
- Completion level before:
- Completion level after:

## Files Changed

- `path/to/file` — what changed

## Governance Check

- RBAC:
- Tenant isolation:
- Evidence:
- Audit trail:
- Review/approval:
- Export control:
- AI boundary:

## Validation

| Command            | Result            |
| ------------------ | ----------------- |
| `npx tsc --noEmit` | Pass/Fail/Not run |
| `npm run lint`     | Pass/Fail/Not run |
| `npm run build`    | Pass/Fail/Not run |
| `npm test`         | Pass/Fail/Not run |

## Known Limitations

List what is still not complete or not verified.

## Next Recommended Step

One clear next step.
```

Do not omit validation status.

Do not claim tests passed unless they actually ran.

---

## 26. Prompting Rules for OpenCode

When asked to execute, OpenCode should operate in Autonomous Delivery Mode unless the user explicitly asks for analysis only.

### Do

- Inspect repository before changing.
- Prefer end-to-end implementation.
- Use existing patterns.
- Keep changes scoped.
- Validate.
- Report honestly.

### Do not

- Ask unnecessary clarification.
- Stop after planning when execution is requested.
- Produce only docs when code is required.
- Produce only UI when data/workflow is required.
- Skip validation silently.
- Hide partial failure.
- Overclaim readiness.

---

## 27. Recommended Internal Task Header

For every major task, begin internally with:

```md
Task:
Product/System:
Task Type:
Current Level:
Target Level:
Data Impact:
Route Impact:
Governance Impact:
Docs Impact:
Validation Plan:
Primary Risk:
```

Use this to guide execution.

---

## 28. Current Strategic Priority

The current strategic direction is:

1. Stabilize AQLIYA Core identity.
2. Preserve AuditOS pilot-readiness.
3. Build complete v0.1 product flows, not demos.
4. Prioritize LocalContentOS as the second strategic product when product expansion begins.
5. Strengthen AI abstraction and governance.
6. Prepare Private/On-Prem honestly, without claiming it is implemented.
7. Build shared Core capabilities before duplicating product-specific logic.

## 28.1 Immediate v0.1 Reality Hardening Priority

Before starting any new product expansion, the current priority is to harden the real systems already discovered in the repository.

The repository discovery audit identified real implemented areas including AuditOS, DecisionOS, Office AI Assistant, Sunbul/workflowos, platform audit logs, and several shell/prototype/marketing-only areas.

Immediate execution priority:

1. Lock down sensitive API routes:
   - audit evidence download
   - office-ai download
   - metrics

2. Clarify and document the status of:
   - Office AI Assistant
   - Sunbul
   - workflowos

3. Separate real product surfaces from shells/prototypes:
   - sales
   - organizations
   - generic settings

4. Repair the test stack:
   - convert governance validation files into real Jest tests
   - fix prisma-client-mock.js TypeScript syntax inside JS
   - resolve or consciously scope i18n test failures

5. Align documentation with repository reality:
   - do not hide implemented systems
   - do not claim marketing-only systems as implemented
   - mark prototype and demo routes clearly

Do not begin LocalContentOS, SalesOS, or other product expansion until this reality-hardening pass is completed or explicitly overridden.

---

## 29. Final Principle

AQLIYA must be built as an institution-grade platform.

Every change should increase at least one of:

- product completeness
- governance strength
- evidence traceability
- user clarity
- technical stability
- commercial truthfulness
- readiness for real customers

If a change does not improve any of these, reconsider it.

---

## Cursor Cloud specific instructions

### Services

| Service | Required for full-stack dev? | Start |
|--------|------------------------------|--------|
| PostgreSQL 16 | Yes | `sudo docker compose up -d db` (port **5432**, credentials in `.env.example`) |
| Next.js app | Yes | See **Run** below |
| Prisma | Generated on install | `npx prisma generate` (also runs via `postinstall`) |

Integration tests use a **separate** DB on port **5433**: `npm run test:integration:setup` (`docker-compose.test.yml`).

### First-time / after clone

1. `cp .env.example .env` (or rely on the VM update script to create `.env`).
2. Set **`AUTH_SECRET`** to the same value as **`NEXTAUTH_SECRET`** in `.env` (runtime auth reads `AUTH_SECRET`; `scripts/validate-env.mjs` only checks `NEXTAUTH_SECRET`).
3. `sudo docker compose up -d db`, then `npx prisma db push` and `npx prisma db seed` (seed users: `admin@aqliya.com` / `admin123`, etc. in `prisma/seed.ts`).
4. `npm install` must run with env loaded (`postinstall` runs `validate-env.mjs`).

### Run

- **Production server (reliable in Cloud VM):** `npm run build` then `npm run start` → http://localhost:3000
- **`npm run dev` (Turbopack):** May panic in Linux/Cloud VMs because `next.config.mjs` sets `turbopack.root` to a Windows path. Use **`npx next dev --webpack`** (e.g. port 3001) until that config is fixed for the repo.

### Validate (see README)

`npx tsc --noEmit`, `npm run lint` (warnings are pre-existing), `npm test`, `npm run build`. CI does not start Postgres; local E2E needs the DB container.

### Gotchas

- Source `.env` before `npm install` / `npm run build` if the shell has no env vars.
- `npm run test:integration` needs the test compose DB, not only dev `db`.
- File uploads use local `./uploads` by default (`STORAGE_PROVIDER=local`).
- On Linux/Cloud, use `.cursor/hooks.linux.json` for AQLIYA low-load hooks if PowerShell is unavailable.
