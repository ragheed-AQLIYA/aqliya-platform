> **Historical — not authoritative.** Aspirational v0.2/v0.3 platform build program (2026-05-29). Superseded by `docs/official/AQLIYA_MASTER_REFERENCE.md` and `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`.

---

# AQLIYA Full Institutional Platform Build Program — Master Architecture Plan (Agent 0)

**Date:** 2026-05-29
**Agent:** 0 — Program Architect / Reality Lock
**Branch:** `eid-sprint-stabilization-2026-05-29`
**HEAD:** `6034950` — `chore(sprint): stabilize Eid sprint readiness`
**Program:** AQLIYA Full Institutional Platform Build (13-agent program, Agent 0–13)
**Trust principle:** AI assists. Humans decide. Evidence governs.
**Baseline classification (unchanged, not upgraded):** Controlled pilot ready with conditions

> **Scope of this document.** This is a *platform build program* master plan — not a customer sprint and not an external-pilot execution map. It supersedes the agent-role map in `docs/archive/historical-strategy/aqliya-eid-expansion-program-plan.md` (which defined a 7-agent Eid v0.2 pilot-expansion program). The earlier document remains valid as the v0.2 pilot record; this document defines the v0.2/v0.3 *platform architecture* program with 14 roles (Agent 0–13). Where the two disagree on agent numbering, **this document governs the platform build program only**.

---

## 1. Scope Inspected

### 1.1 Git (light commands only)

| Command | Result |
| ------- | ------ |
| `git rev-parse --abbrev-ref HEAD` | `eid-sprint-stabilization-2026-05-29` |
| `git rev-parse --short HEAD` | `6034950` |
| `git status --short` | **NOT clean** — 41 modified tracked files + 8 untracked files |
| `git diff --stat` | 40 files changed, 943 insertions(+), 209 deletions(−) (excludes untracked) |
| `git log --oneline -10` | HEAD `6034950` stabilize · `c9e9adb` Session 4 gate · `5aad2c9` L3 cert · … |

**Baseline discrepancy (see Risks P0-1).** The branch and commit match the stated baseline, but the working tree is **not** clean. This directly contradicts the prior Agent 0 record (`aqliya-eid-expansion-program-plan.md`, "Scope Inspected → `git status --short` → **Clean**"). The platform build program must treat the *committed* `6034950` tree and the *current working* tree as two different states.

### 1.2 Authority & status docs read

- `README.md`, `AGENTS.md`, `CLAUDE.md`
- `docs/official/`: `AQLIYA_MASTER_REFERENCE.md`, `aqliya-vision-v1.1.md`, `aqliya-product-taxonomy-v1.1.md`, `aqliya-implementation-rules-v1.1.md`, `aqliya-core-architecture-v1.1.md` (index-confirmed via Glob; 11 official docs present)
- `docs/source-of-truth/`: `PRODUCT_STATUS_MATRIX.md`, `ROUTE_STRATEGY.md`, `READINESS_GATES.md`, `AQLIYA_ARCHITECTURE.md`, `CORE_PLATFORM_ARCHITECTURE.md`, `AQLIYA_SYSTEM_TAXONOMY.md` (index-confirmed; 15 docs present)
- `docs/reports/`: `aqliya-eid-expansion-program-plan.md` (prior Agent 0), plus indexed report set (core-platform-v02, eid-sprint-reality-check, v02-readiness, auditos-external-pilot-candidate, localcontentos-v01-completion, decisionos-workflowos-boundary-stabilization)

### 1.3 Code reality inspected (narrow Glob/Read, no scans)

- `src/lib/platform/*.ts` (15 files), `src/lib/governance/*.ts` (7 files + tests + examples), `src/lib/ai/**` (12 files), `src/lib/**` index (157 files), `.skills/aqliya/*.md` (7 skills), `scripts/**` (47 scripts)
- Read in full: `src/lib/ai/orchestrator.ts`, `src/lib/ai/providers/local-provider.ts`, `src/lib/platform/CORE_PLATFORM_ARCHITECTURE.md` (doc)

### 1.4 Not run (Low-Load Execution Protocol)

`npm run build`, `npm run lint`, `npm test`, `npx tsc --noEmit`, `prisma generate/validate/migrate`, dev server, Docker, browser, dependency installs, broad repo scans.

---

## 2. Current Reality — Layer-by-Layer Classification

Classification legend: **IMPLEMENTED** (real, working, validated by prior phases) · **PARTIAL** (real but incomplete or conditional) · **PROTOTYPE** (UI/mock, no durable backing) · **DOCUMENTATION-ONLY** (doctrine/spec exists, no code) · **MISSING** (not present).

### 2.1 Core Platform

| Component | Classification | Evidence |
| --------- | -------------- | -------- |
| Auth / session (NextAuth v5) | IMPLEMENTED | `src/lib/auth-config.ts`, `auth-next.ts`, `/api/auth/[...nextauth]` |
| Middleware / route perimeter | IMPLEMENTED | `src/middleware.ts`; protected-prefix + public-allowlist model in `ROUTE_STRATEGY.md` |
| Orgs / workspaces / projects / tenants | IMPLEMENTED | `platform-organization-context.ts`, `client-workspace-context.ts`, `project-context.ts`, guards in `src/lib/platform/guards/*` |
| Roles / permissions (RBAC) | PARTIAL | `require-platform-admin.ts` + ADMIN gates exist; centralized `PermissionEnforcer` explicitly **deferred** (CORE_PLATFORM_ARCHITECTURE §4) |
| Navigation / shell | IMPLEMENTED | `src/lib/platform/navigation.ts`, command palette / sidebar / header components |
| Settings / admin | PARTIAL | `/settings/*` sub-routes L4 (workspaces, platform-organization, audit-logs); generic `/settings` shell is **L2** |
| Monitoring / metrics | PARTIAL | `/monitoring` L4 tenant-scoped; `/api/metrics` admin-only; not production observability/alerting |
| Audit logs | IMPLEMENTED | `audit-logger.ts` + `audit-log.ts` (`writePlatformAuditLog`); 19 call sites migrated |

**Core stance:** `CORE_PLATFORM_ARCHITECTURE.md` declares Phase 1 (Foundation) **FROZEN** as of 2026-05-28. Higher-risk primitives (OrgResolver, PermissionEnforcer, WorkflowEngine, EvidenceService, generic download/export routers) are explicitly **deferred** and must not be added without approval.

### 2.2 Intelligence Core (AI / governance-aware AI layer)

| Component | Classification | Evidence |
| --------- | -------------- | -------- |
| AI orchestrator + provider selection | IMPLEMENTED | `src/lib/ai/orchestrator.ts` (singleton, deterministic default, governance-context injection, deterministic fallback) |
| Deterministic provider | IMPLEMENTED | `providers/deterministic-provider.ts` (default, no external LLM) |
| Cloud provider | PARTIAL | `providers/cloud-provider.ts` exists; requires `apiKey`/`baseUrl`; falls back to deterministic when unconfigured |
| Local provider (On-Prem/Air-Gapped runtime) | MISSING (stub) | `providers/local-provider.ts` is an explicit **Phase-4 stub**: `isAvailable()` → false, `execute()` throws "Local AI is not implemented" |
| Prompt registry / assembly | IMPLEMENTED | `prompt-registry.ts`, governance prompt framework |
| AI task handlers (AuditOS) | IMPLEMENTED | analytical-review, evidence-suggestions, recommendation-drafts, finding-drafts, draft-notes |
| Model Governance registry | DOCUMENTATION-ONLY | Listed L0 in matrix; no model-registry code |
| Institutional Memory | DOCUMENTATION-ONLY | L0 concept in matrix/architecture |

**Intelligence stance:** A real, governed AI layer exists and is wired into AuditOS generation, defaulting to deterministic output with human-approval warnings. It is **not** an external-LLM-dependent system and **must not** be claimed as Local/On-Prem/Air-Gapped or Model-Governed.

### 2.3 Governance Layer

| Component | Classification | Evidence |
| --------- | -------------- | -------- |
| Actor lineage / mutation authority | IMPLEMENTED | `governance/actor-lineage.ts` (`canMutateByLineage`, `actorDisplayName`) |
| Approval state machine | IMPLEMENTED | `governance/approval-state.ts` |
| Provenance / evidence provenance | IMPLEMENTED | `governance/provenance.ts` + provenance-validation tests |
| Escalation | IMPLEMENTED | `governance/escalation.ts` + escalation-validation tests |
| Retrieval router / governance context | IMPLEMENTED | `governance/retrieval-router.ts`, `runtime-types.ts` |
| Governance UI visibility rules | IMPLEMENTED | `governance/ui/governance-visibility-rules.ts`, `governance-display.ts` |
| Worked governance scenarios | IMPLEMENTED (as examples) | `governance/examples/governance-scenarios/*` |
| RBAC enforcement (centralized) | PARTIAL | Per-product guards + admin gates; no single shared enforcer (deferred) |

### 2.4 Product Portfolio

| Product | Classification | Level | Notes |
| ------- | -------------- | ----- | ----- |
| AuditOS (`/audit`) | IMPLEMENTED | L5 | Pilot-ready; external pilot **candidate with conditions**, not executed |
| AuditOS demo (`/auditos`) | IMPLEMENTED | L1 | Public, mock, read-only |
| LocalContentOS (`/local-content`) | IMPLEMENTED | L5 w/ conditions | Human smoke (~13 items) still pending |
| DecisionOS (`/decisions`) | IMPLEMENTED | L4 | Evidence + export gate; review/approval hardening partial (B8 open) |
| Office AI Assistant (`/assistant`) | IMPLEMENTED | L4 | Shared application, not a standalone product |
| WorkflowOS (`/workflowos`) | IMPLEMENTED | L4 | Canonical; reuses Sunbul models (no distinct schema) |
| Sunbul (`/sunbul`) | IMPLEMENTED | redirect | `permanentRedirect(302)` alias only |
| SalesOS (`/sales`) | PROTOTYPE | L3 | Mock-only; no Prisma/actions/persistence |
| SimulationOS (`/products/simulation`) | DOCUMENTATION-ONLY | L1 | Marketing label; treat as DecisionOS capability |
| LocalContactOS / RiskOS / ComplianceOS / LegalOS / GovOS | MISSING | L0 | Concept only |
| AQLIYA Studio | DOCUMENTATION-ONLY | L0 | Strategic future layer |

### 2.5 Product Factory (repeatable product-building framework)

| Component | Classification | Evidence |
| --------- | -------------- | -------- |
| v0.1 Definition-of-Done matrices | DOCUMENTATION-ONLY | `AGENTS.md` §21, `.skills/aqliya/aqliya-product-completion.md` |
| Completion-level rubric (L0–L6) | DOCUMENTATION-ONLY | `AGENTS.md` §6 |
| Reusable Core primitives (factory inputs) | PARTIAL | `src/lib/platform/*` thin core exists but **FROZEN**; no scaffolding/codegen |
| Product scaffolding / generator | MISSING | No template, generator, or product-bootstrap tooling in repo |

**Factory stance:** The *doctrine* of repeatable product building is mature; the *tooling* (scaffold, shared workspace template, generator) does not exist. This is the single largest architectural gap between "multi-product v0.1" and "product factory v0.2/v0.3."

### 2.6 Data / Evidence Layer

| Component | Classification | Evidence |
| --------- | -------------- | -------- |
| Prisma schema + tenant fields | IMPLEMENTED | `createdById` on 10+ models; `platformOrganizationId` tenant fields; migration `add_governance_fields_v0_2` |
| Evidence models | IMPLEMENTED | DecisionEvidence; LocalContent evidence; AuditOS evidence vault |
| File storage | IMPLEMENTED | `src/lib/platform/storage/*`, `audit/storage/*`, `workflowos/storage.ts` (local provider) |
| Protected downloads (auth + 404 + audit) | IMPLEMENTED | Download Security Standard enforced on 5 route families |
| Exports (PDF/XLSX/CSV/JSON) | IMPLEMENTED | `platform/export.ts`, AuditOS + LocalContent + WorkflowOS exporters (pdfkit/xlsx) |
| Backup / restore | PARTIAL | `scripts/db-backup.ts`, `db-restore.ts`, `backup-verify.ts` exist; **not automated/scheduled** |
| Traceability | IMPLEMENTED | AuditOS traceability + audit-trail routes |

### 2.7 Commercial Layer

| Component | Classification | Evidence |
| --------- | -------------- | -------- |
| Marketing site (`/`, `/products/*`, briefs) | IMPLEMENTED | L4 active marketing routes |
| Custom-product funnel | IMPLEMENTED | `/custom-product` + `/api/custom-product-submit` |
| Pilot outreach ops pack | PARTIAL | `docs/product/launch/batch-1-*` (untracked); send gated; webhook fail-open risk |
| Executed external pilots | MISSING | No real external-org session executed (rehearsal PASS only) |

### 2.8 Developer / Agent Operating System

| Component | Classification | Evidence |
| --------- | -------------- | -------- |
| Agent operating contract | IMPLEMENTED | `AGENTS.md` (28+ sections), `CLAUDE.md` |
| Skills | IMPLEMENTED | 7 skills in `.skills/aqliya/` (security-gate, demo-safety, docs-authority, product-completion, release-checklist, low-load-dev, opencode-agent) |
| Validation / verify / seed scripts | IMPLEMENTED | 47 scripts in `scripts/` (verify-*, seed-*, backup*, pilot-*, phase*) |
| Documentation authority hierarchy | IMPLEMENTED | `docs/DOCUMENTATION_AUTHORITY.md` referenced as conflict authority |

---

## 3. Gaps

**G1 — Working tree not committed (P0).** ~49 paths of uncommitted v0.2 work sit on top of `6034950`. Any agent that reads "the committed baseline" sees a different reality than one reading the working tree. Validation evidence from prior phases was on the *committed* tree, not this working tree.

**G2 — Product Factory tooling absent.** Doctrine (DoD, L0–L6, skills) is mature; no scaffold/generator/shared-workspace template exists. Building the 4th+ product would still be hand-rolled.

**G3 — Core is FROZEN below platform ambition.** The shared Core is intentionally thin (3 primitives + contexts/guards). Reusable services the program implies (OrgResolver, PermissionEnforcer, shared WorkflowEngine, EvidenceService) are explicitly deferred — they cannot be "assumed built."

**G4 — Intelligence Core is deterministic-only in practice.** Cloud provider is unconfigured-by-default; Local provider is a stub; Model Governance + Institutional Memory are L0. The "intelligence layer" is real but must be described as governed-deterministic-with-optional-cloud, not autonomous AI.

**G5 — RBAC is per-product, not centralized.** No single permission enforcer; correctness depends on each product's guards. Platform-wide RBAC is a governance-layer gap.

**G6 — Portfolio breadth vs depth.** Two products at L5 (with conditions), three at L4, one L3 prototype, rest L0–L1. No product is L6. Roadmap must not present L0–L3 surfaces as portfolio products.

**G7 — Commercial proof is unexecuted.** Funnel + outreach docs exist; zero real external pilots. Commercial layer claims must stay at "controlled pilot ready with conditions."

**G8 — Backup/observability not production-grade.** Backup scripts exist but unscheduled; no alerting/monitoring stack; no external pen-test. Blocks any "production/L6" claim.

---

## 4. Proposed Architecture — Master Build Map + Phase Plan

### 4.1 Layer ↔ Phase model

The platform is built bottom-up; higher layers depend on lower ones being stable.

```text
Phase F — Foundation            → Core Platform (auth, tenant, middleware, contexts, nav)
Phase C — Core Services         → audit-logger, download/export, storage, (approved) shared services
Phase I — Intelligence Core     → AI orchestrator, providers, prompt/governance-context, handlers
Phase G — Governance & Compliance → RBAC, approval, provenance, escalation, evidence, export safety
Phase X — Product Factory       → scaffold/template/DoD-as-tooling (NEW build, currently doctrine-only)
Phase P — Product Portfolio     → AuditOS, LocalContentOS, DecisionOS, WorkflowOS, Office AI (+future)
Phase Q — QA / Release System   → validation gate, readiness gates, status matrix, Go/No-Go
```

Dependency direction (must not invert): `Foundation → Core Services → {Intelligence, Governance} → Product Factory → Product Portfolio → QA/Release`. Data/Evidence and the Developer/Agent OS are cross-cutting and underlie all phases.

### 4.2 Agent → Layer/Phase map (Agent 0–13)

> Roles below are the **proposed** platform-build assignments derived from the program layers and the coordinator's shared-file hints (Agent 6 → status matrix; Agent 10 → AGENTS.md; Agents 6/9 → product taxonomy). The parent program owner confirms or amends before launch.

| Agent | Role | Primary layer / phase | Exclusive write surfaces (proposed) |
| ----- | ---- | --------------------- | ----------------------------------- |
| **0** | Program Architect / Reality Lock | All (planning only) | This doc + handoff; **no code** |
| **1** | Core Platform Foundation | Foundation (F) | `src/middleware.ts`, `src/lib/auth-*`, `src/lib/platform/*-context.ts`, `guards/*` |
| **2** | Core Services | Core Services (C) | `src/lib/platform/{audit-logger,download,export,storage,navigation}.ts` |
| **3** | Intelligence Core | Intelligence (I) | `src/lib/ai/**`, prompt registry |
| **4** | Governance & Compliance | Governance (G) | `src/lib/governance/**` (incl. RBAC consolidation if approved) |
| **5** | Data / Evidence Layer | cross-cutting (data) | `prisma/schema.prisma` (approval-gated), evidence models, exporters, `scripts/db-*` |
| **6** | Product Status & Documentation Truth | QA/Release (Q) | `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`, readiness/route docs; **shares taxonomy w/ 9** |
| **7** | AuditOS Product | Portfolio (P) | `src/app/audit/*`, `src/components/audit/*`, `src/lib/audit/*` |
| **8** | LocalContentOS Product | Portfolio (P) | `src/app/local-content/*`, `src/lib/local-content/*`, `src/actions/localcontent-*` |
| **9** | DecisionOS / WorkflowOS + Portfolio Taxonomy | Portfolio (P) | `src/app/{decisions,workflowos,sunbul}/*`; **shares `aqliya-product-taxonomy` w/ 6** |
| **10** | Developer / Agent Operating System | cross-cutting (dev OS) | `AGENTS.md`, `.skills/aqliya/*`, `scripts/verify-*` |
| **11** | Product Factory | Product Factory (X) | NEW: product scaffold/template/generator (no existing owner — greenfield) |
| **12** | Commercial Layer | Commercial | `src/app/(marketing)/*`, `docs/product/launch/*`, funnel API |
| **13** | QA / Release System | QA/Release (Q) | validation execution + `docs/reports/*-validation-*`; **does not** edit matrix (Agent 6 owns) |

### 4.3 Recommended execution order (waves)

```text
Wave 0 — Reality lock (this doc)              Agent 0
Wave 1 — Foundation freeze-or-extend          Agent 1 (+ Agent 10 dev-OS in parallel)
Wave 2 — Core + Intelligence + Governance     Agents 2, 3, 4 (parallel; disjoint dirs)
Wave 3 — Data/Evidence consolidation          Agent 5 (schema gated; blocks portfolio writes)
Wave 4 — Product Factory framework            Agent 11 (greenfield; depends on Waves 1–2)
Wave 5 — Product portfolio deepening          Agents 7, 8, 9 (parallel; disjoint products)
Wave 6 — Commercial + Docs truth              Agents 12, 6 (6 reads, then writes matrix last)
Wave 7 — QA/Release gate + Go/No-Go           Agent 13 → Agent 6 final classification
```

### 4.4 Parallel-safe vs sequential

**Safe to run in parallel (disjoint write surfaces):**
- Agents 2, 3, 4 (Core / Intelligence / Governance live in separate `src/lib/*` trees)
- Agents 7, 8, 9 (separate product trees) — *except* shared nav/command-palette files
- Agent 10 (dev OS) parallel with most code work
- Agent 12 (marketing) parallel with backend work

**Must be sequential / coordinated:**
- **Agent 5 (schema)** blocks all portfolio writes that depend on new fields → run before Wave 5; schema changes are approval-gated per AGENTS.md §13.
- **Agent 6 (PRODUCT_STATUS_MATRIX.md)** runs **last** and alone on that file; no agent reclassifies status concurrently.
- **Agents 6 + 9 share `aqliya-product-taxonomy-v1.1.md`** → serialize taxonomy edits; one owner per pass.
- **Agent 10 (AGENTS.md)** is the sole writer of `AGENTS.md`; other agents propose, Agent 10 commits.
- **Agent 1 + Agent 4** both touch RBAC concepts (middleware vs governance) → coordinate any centralized-enforcer work; do not edit auth + governance guards in the same pass.
- **Shared nav files** (`command-palette.tsx`, `platform-sidebar.tsx`, `platform-header.tsx`, `navigation.ts`) → single editor per pass across Agents 7/9/12.

### 4.5 Target classifications (honest ceilings)

| Milestone | Classification | Required evidence |
| --------- | -------------- | ----------------- |
| Platform architecture v0.2 | Documented reusable core + intelligence + governance map | This plan + per-layer reports; medium validation green on a committed tree |
| Product factory v0.2 | Scaffold/template usable for a new product | Agent 11 framework + one product bootstrapped through it |
| Portfolio depth v0.3 | Two L5 products pilot-closed; adjacents stable | AuditOS + LocalContentOS smoke/pilot evidence |
| **Not in scope** | Production / L6 / external-pilot-executed / On-Prem / Local AI | Explicitly forbidden claims until code + ops prove them |

---

## 5. Files Changed

| File | Change |
| ---- | ------ |
| `docs/archive/historical-strategy/aqliya-full-platform-build-program-plan.md` | **Created** — this master architecture plan |

No application code, schema, route, or config changes (Agent 0 scope).

---

## 6. Commands Run

```text
git rev-parse --abbrev-ref HEAD
git rev-parse --short HEAD
git status --short
git diff --stat
git log --oneline -10
```

Plus read-only Glob/Read inspection of authority docs, source-of-truth docs, the prior Agent 0 plan, and narrow `src/lib/{platform,governance,ai}`, `.skills/aqliya`, and `scripts/` listings. No heavy commands.

---

## 7. Validation Result

| Command | Result |
| ------- | ------ |
| `git status` / `git diff --stat` / `git log` | **Run — Pass** (state captured) |
| `npx tsc --noEmit` | **Not run** (Low-Load; delegate to QA agent) |
| `npx prisma validate` | **Not run** (Low-Load) |
| `npm run lint` / `npm test` / `npm run build` | **Not run** (Low-Load; heavy) |

**Interpretation:** Prior phases (7–10) report green validation on the **committed** `6034950` tree. This Agent 0 run did **not** re-validate, and the **current working tree is uncommitted** — so no validation claim transfers to it. Engineering green must be re-established by the QA agent on a committed tree before any classification change.

---

## 8. Risks

| ID | Risk | Severity | Mitigation |
| -- | ---- | -------- | ---------- |
| **P0-1** | **Working tree not clean / baseline misstated.** ~49 uncommitted paths on `6034950`; prior Agent 0 doc recorded a clean tree. Validation evidence does not cover the working tree. | **P0 / High** | Decide commit-or-stash before any build wave; QA agent re-validates on a committed tree; do not trust "clean baseline." |
| P1 | Core is FROZEN but program implies new reusable services | High | Treat OrgResolver/PermissionEnforcer/WorkflowEngine/EvidenceService as **approval-gated**; no silent Core expansion |
| P2 | Shared-file contention (matrix, taxonomy, AGENTS.md, nav) | High | One-owner-per-file rule (§4.4); Agent 6 last on matrix; Agent 10 sole AGENTS.md writer |
| P3 | Schema drift blocks portfolio agents | Medium | Agent 5 schema pass gated + sequenced before Wave 5; AGENTS.md §13 discipline |
| P4 | Over-claiming intelligence/On-Prem/Local AI | High | Local provider is a stub; describe as governed-deterministic + optional cloud only |
| P5 | Over-claiming commercial / external-pilot readiness | High | No executed pilot; hold at "controlled pilot ready with conditions" |
| P6 | Product Factory greenfield scope creep (Agent 11) | Medium | Scope to scaffold + one product bootstrap; defer generic generators |
| P7 | RBAC remains per-product; centralization risk | Medium | Any enforcer consolidation is a dedicated approved Agent 1+4 task, not a side effect |
| P8 | Parallel agents edit shared nav/command-palette | Medium | Single editor per pass; Agent 0 resolves conflicts |

---

## 9. Next Lowest-Load Step

**Resolve P0-1 first, with the cheapest possible action:** the parent program owner decides whether the ~49 uncommitted paths are (a) intended v0.2 work to be committed on `eid-sprint-stabilization-2026-05-29`, or (b) scratch to be stashed. Until then, run **`git diff --stat` review only** — no build, no further edits — so that the QA agent can later re-validate against a single, committed baseline. After the baseline is committed, the lowest-load follow-up is a `npx tsc --noEmit` + `npx prisma validate` light pass by the QA/Release agent (Agent 13) before any Wave 1 foundation work begins.

---

## Agent 0 Sign-off

| Field | Value |
| ----- | ----- |
| **Status** | **DONE_WITH_CONCERNS** (P0-1 working-tree discrepancy) |
| **Code changed** | No |
| **Schema changed** | No |
| **Classification** | Controlled pilot ready with conditions (unchanged — not upgraded) |
| **Deliverable** | `docs/archive/historical-strategy/aqliya-full-platform-build-program-plan.md` |

*Agent 0 — Full Institutional Platform Build Program. Reality locked at committed `6034950` with an uncommitted working tree on top; layer build delegated to Agents 1–13 per the map above. AI assists. Humans decide. Evidence governs.*
