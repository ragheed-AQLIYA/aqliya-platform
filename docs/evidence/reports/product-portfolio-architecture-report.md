# Product Portfolio Architecture — Report (Agent 6)

**Date:** 2026-05-29
**Agent:** 6 — Product Portfolio Architecture / Documentation Truth (Phase Q)
**Branch:** `eid-sprint-stabilization-2026-05-29`
**Committed baseline:** `6034950` (working tree **NOT clean** — inherited Agent 0 P0-1)
**Wave:** 6 — Commercial + Docs truth (Agent 6 reads, then writes the truth files last)
**Mode:** **DOCUMENTATION-ONLY** (no application code, no schema, no route changes)
**Trust principle:** AI assists. Humans decide. Evidence governs.
**Classification (unchanged, not upgraded):** Controlled pilot ready with conditions

> This report follows the program's required 9-section structure. It defines the full AQLIYA product portfolio **without building everything at once**, grounds each product's status in code/report reality, applies the Agent 9 taxonomy recommendations (T-1..T-5) with judgment, and records exactly what changed in the two single-owner files this agent owns. Sole-editor scope honored: only `PRODUCT_STATUS_MATRIX.md` and `aqliya-product-taxonomy-v1.1.md` were edited among the truth files; `AGENTS.md` (Agent 10) was **not** touched.

---

## 1. Scope Inspected

### 1.1 Authority & program docs read (in full)

- `docs/reports/aqliya-full-platform-build-program-plan.md` (Agent 0 master plan — baseline, waves, FROZEN Core, honest ceilings)
- `AGENTS.md` (operating contract; §4 taxonomy/intent, §6 L0–L6, §20 commercial truthfulness, §23 hard stops, §32 Low-Load)
- `docs/reports/core-platform-architecture-v02-report.md` (Agent 1 — RBAC/tenant/download/nav)
- `docs/official/aqliya-intelligence-core-v0.1.md` (Agent 2 — governed-deterministic AI, forbidden claims)
- `docs/source-of-truth/PRODUCT_FACTORY.md` (Agent 3 — factory doctrine, L0–L6 mapping)
- `docs/source-of-truth/GOVERNANCE_FRAMEWORK.md` + `docs/source-of-truth/DEPLOYMENT_MODELS.md` (Agent 5 — governance status, deployment honesty)
- `docs/reports/auditos-v02-product-completion-report.md` (Agent 7), `docs/reports/localcontentos-v02-product-completion-report.md` (Agent 8), `docs/reports/decisionos-workflowos-v02-boundary-report.md` (Agent 9)

### 1.2 Single-owner files inspected before editing

- `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` (this agent owns)
- `docs/official/aqliya-product-taxonomy-v1.1.md` (this agent owns; shared with Agent 9, serialized to Agent 6)

### 1.3 Code reality spot-checked (narrow Glob/Read/Shell, no scans)

- **SalesOS:** `Get-ChildItem` confirms only `src/app/sales/layout.tsx` + `src/app/sales/page.tsx`; **no** `src/lib/sales/**`, **no** `src/actions/*sales*`. Confirms **L3 mock-only** (no persistence) — matches matrix.
- Deliverable pre-existence check: `PRODUCT_PORTFOLIO_ARCHITECTURE.md` and `product-portfolio-architecture-report.md` did **not** exist before this pass (created new).

### 1.4 Not run (Low-Load Execution Protocol)

`npm run build|lint|test`, `npx tsc --noEmit`, `prisma generate|validate|migrate`, dev server, Docker, browser, installs, broad scans. No application code or schema was edited, so no engineering validation was required for this documentation pass.

---

## 2. Current Reality — Portfolio Classification (grounded)

Levels mirror `PRODUCT_STATUS_MATRIX.md` (authoritative). "Evidence" cites the owning agent's report or direct code inspection.

| Product / System | Level | Type | Status (grounded) | Evidence |
| ---------------- | ----- | ---- | ----------------- | -------- |
| **AuditOS** (`/audit`) | **L5** | Primary product | Pilot-ready; **external pilot *candidate* with conditions**; 12 governed stages real; first real external session NOT executed | Agent 7 §2.1 |
| **LocalContentOS** (`/local-content`) | **L5 w/ conditions** | Strategic 2nd product | End-to-end governed loop; 4 governance transitions wired; **~13-item human smoke pending** | Agent 8 §2 |
| **DecisionOS** (`/decisions`) | **L4** | Active adjacent system | Lifecycle + export gate real; **review/approval hardening partial** (B8) | Agent 9 §2.2 |
| **WorkflowOS** (`/workflowos`) | **L4** | Governed workspace (canonical) | Real CRUD/state-machine; **persists via `Sunbul*` models — no own schema** | Agent 9 §2.3 |
| **Office AI Assistant** (`/assistant`) | **L4** | Shared application | Real data-backed; platform-org-scoped; deterministic/governed | Agent 0 §2.4; matrix |
| **SalesOS** (`/sales`) | **L3** | Prototype (mock-only) | Only `layout.tsx`+`page.tsx`; no lib/actions/Prisma — **code-verified** | §1.3 this report |
| **SimulationOS** (`/products/simulation`) | **L1** | Marketing label | Treat as DecisionOS capability — **locked (T-4)** | matrix; Agent 9 T-4 |
| **LocalContactOS** | **L0** | Future product | Concept only | `AGENTS.md §4` |
| **RiskOS** | **L0** | Future product | Concept only — **stays L0** | `AGENTS.md §4` |
| **ComplianceOS** | **L0** | Future product | Concept only | `AGENTS.md §4` |
| **LegalOS** | **L0** | Future product | Concept only — **stays L0**; never "lawyer replacement" | `AGENTS.md §4` |
| **GovOS** | **L0** | Future product | Concept only — **stays L0** | `AGENTS.md §4` |
| **AQLIYA Studio** | **L0** | Strategic layer | Concept only | matrix |

**Net:** deep-not-wide. 2× L5 (with conditions), 3× L4 (one is a shared application), 1× L3 prototype, 1× L1 label, the rest L0. **No L6; no executed external pilot.**

---

## 3. Gaps

- **PG1 — Taxonomy tree drift (Agent 9 G6).** Tree listed `Sunbul` and lowercase `workflowos` as co-equal siblings, and listed a "Workflow Engine" Intelligence-Core node not reconciled with master-plan G3 (deferred). **Closed this pass** (T-1, T-3).
- **PG2 — DecisionOS/WorkflowOS doctrine confusion.** No taxonomy one-liner distinguished the two adjacent products. **Closed this pass** (T-2).
- **PG3 — Canonical-name vs schema-name mismatch.** WorkflowOS is "canonical" but persists via `Sunbul*` — readers of the schema see "Sunbul." **Reconciled in docs this pass** (T-5 matrix note + taxonomy line); the actual rename remains an approval-gated Agent 5 migration.
- **PG4 — Over-claim surface area.** L0 concept products (RiskOS/LegalOS/GovOS) and strategic capabilities (On-Prem/Local-AI) are recurring over-claim risks. **Mitigated by §4 of `PRODUCT_PORTFOLIO_ARCHITECTURE.md`** (explicit may/​must-not table).
- **PG5 — Inherited P0 (Agent 0 P0-1).** Working tree uncommitted; no engineering-green transfers. Documentation truth is asserted against the working tree + reports, not a committed/validated tree.
- **PG6 — Factory tooling absent (Agent 0 G2).** Doctrine mature, no scaffold/generator — the next product is still hand-rolled. Recorded as a LATER item, not closeable by Agent 6.

---

## 4. Proposed Architecture / Plan

The portfolio architecture is delivered as `docs/source-of-truth/PRODUCT_PORTFOLIO_ARCHITECTURE.md`. Its spine:

1. **Shared platform layers** (Foundation → Core Services → {Intelligence, Governance} → Data → Factory → Deployment) with honest status + "may rely on / must not assume" per layer (§1 of that doc).
2. **Per-product definitions** — purpose, grounded status, target maturity, shared-core dependencies, build-now-vs-later (§2).
3. **Build NOW vs LATER roadmap** (§3) consistent with Agent 0's waves and the FROZEN-Core / gated-schema constraints.
4. **Fake-active-product prevention** table (§4) — the anti-overclaim contract.

**Build-now-vs-later split (summary):**

- **NOW (depth, no new products):** AuditOS export-labels/admin-gate/honest-model-label + execute first real external pilot; LocalContentOS human smoke + XLSX depth; DecisionOS review/approval hardening (D-1); keep truth docs synced; gated cross-cutting download/middleware/nav fixes.
- **LATER (gated/tasked):** Product Factory tooling; WorkflowOS `Sunbul*`→`Workflow*` rename; identity unification + central permission enforcer; shared Intelligence/Evidence services; SalesOS L0→L4; L0 concept products + AQLIYA Studio; L6/production/On-Prem only after code+ops prove them.
- **NOT now:** new product surfaces, schema migrations in a docs pass, FROZEN-Core expansion, any Local/On-Prem/Air-Gapped/Local-AI or external-pilot-executed or production/GA claim.

---

## 5. Files Changed

| File | Change | Owner rule |
| ---- | ------ | ---------- |
| `docs/source-of-truth/PRODUCT_PORTFOLIO_ARCHITECTURE.md` | **Created** — full portfolio architecture (shared layers, per-product definitions, NOW/LATER, anti-overclaim table) | New source-of-truth doc (this agent) |
| `docs/reports/product-portfolio-architecture-report.md` | **Created** — this 9-section report | Report |
| `docs/official/aqliya-product-taxonomy-v1.1.md` | **Edited** — T-1, T-2, T-3, T-5-coherence (see §5.1) | Single-owner (Agent 6) |
| `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` | **Edited** — T-5 reality note (see §5.2) | Single-owner (Agent 6) |

**Not touched:** `AGENTS.md` (Agent 10), application code, `prisma/schema.prisma`, routes, nav, any other product agent's surface.

### 5.1 Exact taxonomy edits (`aqliya-product-taxonomy-v1.1.md`)

1. **T-3 (tree, Intelligence Core node):** `│   ├── Workflow Engine` → `│   ├── Workflow Engine (deferred / concept — no shared engine built)`.
2. **T-1 (tree, Custom/Client-Specific Workspaces):** replaced the two co-equal sibling lines
   ```
   │   ├── Sunbul
   │   └── workflowos
   ```
   with
   ```
   │   └── WorkflowOS
   │       └── Sunbul (legacy alias — 302 redirect to WorkflowOS)
   ```
   (canonical casing **WorkflowOS**; Sunbul nested **under** WorkflowOS, not a sibling).
3. **T-1/T-5 coherence (WorkflowOS subsection):** added one bullet — "Persists via the legacy `Sunbul*` Prisma models (`SunbulClient`, `SunbulRecord`, `SunbulUserMembership`); has **no distinct schema of its own** — pending an approval-gated Agent 5 rename".
4. **T-2 (Boundaries section):** added item **6** — a one-line DecisionOS (executive-decision lifecycle) vs WorkflowOS (operational records/documents) boundary, with the explicit "share only the platform shell + governance/audit primitives" clause.

> **T-4** (SimulationOS = "treat as DecisionOS capability") was already correct in both files — **locked, no change** as instructed.

### 5.2 Exact matrix edit (`PRODUCT_STATUS_MATRIX.md`)

- **T-5 (Reality Notes):** inserted one note directly after the existing "WorkflowOS is the canonical product name…" line — recording that WorkflowOS persists via the legacy `Sunbul*` models and has no distinct schema, that the canonical claim is at the routing/UI/product level, and that the `Sunbul*`→`Workflow*` data-layer rename is an approval-gated Agent 5 migration (so schema readers seeing `Sunbul*` is expected, not drift).

No level, route, release-inclusion, demo-status, or intended-status cell was changed. Every existing accurate status was preserved.

---

## 6. Commands Run

```text
move_agent_to_root → C:\Users\PC\Documents\Aqliya            (MCP, workspace root)
Read   Agent 0 plan; AGENTS.md; Agent 1/2/3/5/7/8/9 reports;
       PRODUCT_STATUS_MATRIX.md; aqliya-product-taxonomy-v1.1.md;
       GOVERNANCE_FRAMEWORK.md; DEPLOYMENT_MODELS.md
Shell  Get-ChildItem (list docs dirs)                        (light)
Shell  Get-ChildItem src/app/sales, src/lib/sales, src/actions (SalesOS reality) (light)
Shell  Get-ChildItem (deliverable pre-existence check)       (light)
Edit   docs/official/aqliya-product-taxonomy-v1.1.md  (T-1, T-2, T-3, T-5-coherence)
Edit   docs/source-of-truth/PRODUCT_STATUS_MATRIX.md  (T-5 reality note)
Write  docs/source-of-truth/PRODUCT_PORTFOLIO_ARCHITECTURE.md (new)
Write  docs/reports/product-portfolio-architecture-report.md  (new)
```

No `git` mutations. No heavy commands (no build/lint/test/prisma/docker/dev-server/installs).

---

## 7. Validation Result

| Check | Result |
| ----- | ------ |
| `npx tsc --noEmit` | **Not run / not required** — documentation-only; no code/schema edited |
| `npx prisma validate` | **Not run / not required** — no schema edited |
| `npm run lint|test|build` | **Not run** (Low-Load; heavy) |
| Single-owner edits confined to owned files | **Pass** — only `PRODUCT_STATUS_MATRIX.md` + `aqliya-product-taxonomy-v1.1.md` edited; `AGENTS.md` untouched |
| Markdown coherence (taxonomy tree + boundaries renumber) | **Pass — by inspection** (tree fences valid; Boundaries now 1–6) |
| No inactive product presented as active | **Pass** — verified across matrix, taxonomy, and portfolio doc (see §8) |

**Interpretation:** This pass changes only documentation truth files and adds two new docs. Findings are grounded in the **uncommitted working tree** + Agents 0–9 reports (Agent 0 P0-1). No engineering-green is claimed or transferred; QA (Agent 13) re-validates code on a committed tree.

---

## 8. Risks

| ID | Risk | Severity | Mitigation |
| -- | ---- | -------- | ---------- |
| R1 | Working tree dirty (Agent 0 P0-1) — product levels rest on report claims, not a validated committed tree | High | Levels mirror existing matrix (no upgrades); QA re-validates on commit before any promotion |
| R2 | Taxonomy/matrix edit contention (shared with Agent 9) | Medium | Agent 9 explicitly handed T-1..T-5 to Agent 6 and made no taxonomy edits; this pass is the single serialized owner edit |
| R3 | Over-claim creep (RiskOS/LegalOS/GovOS, On-Prem/Local-AI) in future copy | High | §4 anti-overclaim table in the portfolio doc; L0 products stay L0; forbidden-claim list restated |
| R4 | "Canonical WorkflowOS" vs `Sunbul*` schema confuses readers | Medium | T-5 note in matrix + taxonomy line explicitly reconcile name-vs-schema; rename flagged as gated Agent 5 work |
| R5 | Building everything at once (against the brief) | High | Deep-not-wide enforced; NOW = depth on existing L4/L5; new products are LATER + explicitly-tasked only |
| R6 | Documentation drifts from code over time | Medium | Portfolio doc is descriptive + cites owning agents; defers level authority to the single-owner matrix |

---

## 9. Next Lowest-Load Step

1. **Program owner:** resolve Agent 0 P0-1 (commit vs stash the working tree) so QA (Agent 13) can re-validate on a single baseline before any level promotion.
2. **Agent 5 (gated):** plan the `Sunbul*` → `Workflow*` schema rename (seed + tenant-isolation + audit parity) to retire the canonical-name/schema-name mismatch reconciled in docs this pass.
3. **Depth-now owners:** AuditOS first real external-pilot session (Agent 7 + human ops); LocalContentOS ~13-item human smoke (Agent 8 + operator); DecisionOS review/approval hardening D-1 (Agent 9). None upgrades a level until evidence + committed-tree validation exist.
4. **Agent 6 (next pass):** after QA green on a committed tree and any pilot/smoke evidence, reconcile levels in `PRODUCT_STATUS_MATRIX.md` — Agent 6 runs last and alone on that file.

---

## Agent 6 Sign-off

| Field | Value |
| ----- | ----- |
| **Status** | **DONE_WITH_CONCERNS** (dirty working tree inherited; levels mirror matrix, not re-validated) |
| **Code changed** | No |
| **Schema changed** | No |
| **Single-owner docs touched** | `PRODUCT_STATUS_MATRIX.md` (T-5 note), `aqliya-product-taxonomy-v1.1.md` (T-1/T-2/T-3 + coherence) — both owned by Agent 6. `AGENTS.md` **not** touched. |
| **Classification** | Controlled pilot ready with conditions (unchanged — not upgraded) |
| **Deliverables** | `docs/source-of-truth/PRODUCT_PORTFOLIO_ARCHITECTURE.md`, `docs/reports/product-portfolio-architecture-report.md`, edits to matrix + taxonomy |
| **Fake-active-product check** | **Pass** — RiskOS/ComplianceOS/LegalOS/GovOS/LocalContactOS = L0; SalesOS = L3 mock-only; SimulationOS = L1; Studio = L0; no external-pilot-executed / production / L6 / On-Prem / Local-AI claim |

*Agent 6 — Product Portfolio Architecture. Portfolio defined deep-not-wide; taxonomy and matrix reconciled to code reality; no inactive product presented as active. AI assists. Humans decide. Evidence governs.*
