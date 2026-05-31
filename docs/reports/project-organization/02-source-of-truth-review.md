# Phase 2 — Source of Truth Hierarchy Review

**Audit date:** 2026-05-31  
**Authority reference:** `docs/DOCUMENTATION_AUTHORITY.md`

---

## Expected Hierarchy (Summary)

| Level | Path | Role |
|-------|------|------|
| 0 | `docs/DOCUMENTATION_AUTHORITY.md` | Conflict resolution |
| 1 | `docs/official/AQLIYA_MASTER_REFERENCE.md` | Master reference |
| 2 | `docs/official/*.md` (v1.1 doctrine) | Identity, governance, taxonomy |
| 3 | `README.md`, `AGENTS.md`, `docs/README.md` | Entry / navigation |
| 4 | `docs/source-of-truth/*` | Architecture, routes, product status |
| 5 | `docs/product/*`, `docs/systems/*`, `docs/pilot/*`, `docs/releases/*` | Product detail |
| 6 | `docs/reports/*` | Evidence only |
| 7 | `docs/theoretical-reference/*` | Background |
| 8 | `docs/archive/*` | Historical |

---

## README Alignment Check

| File | Reflects hierarchy? | Issue |
|------|---------------------|-------|
| `README.md` | **Mostly yes** | Points to `DOCUMENTATION_AUTHORITY.md` and official docs. Product table present. LocalContentOS PDF/XLSX line stale (see contradictions). |
| `docs/README.md` | **Mostly yes** | Level 0–8 table matches authority doc. Missing: `docs/notion/`, `docs/execution/`, `docs/deployment/`, `docs/clients/`, `docs/reports/project-organization/`. References `commercial-pack/` README — directory not found in glob. |
| `docs/archive/README.md` | **Partial** | Lists subset of archive dirs; omits `legacy-numbered/`, `pilot-history/`, `commercial-legacy/` shown in `docs/README.md`. |

---

## Contradiction Table

| ID | Path A | Path B | Conflict | Code reality | Canonical wording | Action | Status |
|----|--------|--------|----------|--------------|-------------------|--------|--------|
| C1 | `README.md` L50 | `PRODUCT_STATUS_MATRIX.md` L17, `AQLIYA_MASTER_REFERENCE.md` L105 | README: "binary PDF/XLSX export **deferred**" vs matrix/master: "**implemented** (pdfkit + xlsx)" | `src/lib/local-content/export.ts` imports pdfkit + xlsx | LocalContentOS has binary PDF/XLSX export at L5; not L6 | Update README, release-scope, systems README, limitations pack | **Open** |
| C2 | `docs/releases/aqliya-v0.1-release-scope.md` L21, L51, L76 | `docs/official/aqliya-roadmap-v1.1.md` L19 | Release scope forbids claiming PDF/XLSX live; roadmap says implemented | Code proves PDF/XLSX | Same as C1 | Sync release-scope + known-limitations to matrix | **Open** |
| C3 | `docs/systems/local-content-os/README.md` L18–33 | `PRODUCT_STATUS_MATRIX.md` | Systems README: "Binary PDF/XLSX deferred"; matrix: implemented | Code proves PDF/XLSX | Export live at v0.1; Arabic font P2 gap remains | Patch systems README | **Open** |
| C4 | `docs/product/localcontentos-v0.1/pilot-onboarding-pack/limitsations-and-safe-claims.md` L35 | Master reference | Claims text/CSV only for export | Code proves PDF/XLSX | Update safe-claims doc | **Open** |
| C5 | `docs/source-of-truth/AQLIYA_SYSTEM_TAXONOMY.md` L38–41 | `docs/official/aqliya-vision-v1.1.md`, `PRODUCT_STATUS_MATRIX.md` L11 | Taxonomy: "Sunbul = real custom workspace"; official: "Sunbul = legacy redirect alias" | `/sunbul/*` redirects to `/workflowos/*` | Sunbul = redirect alias; WorkflowOS = canonical workspace; Sunbul = client org name (`docs/clients/sunbul/`) | Update taxonomy + architecture taxonomy sections | **Open** |
| C6 | `docs/releases/aqliya-v0.1-release-scope.md` L15–16 | `PRODUCT_STATUS_MATRIX.md` L10–11 | Release scope: Sunbul L4 workspace + workflowos L3 prototype | Matrix: WorkflowOS L4, Sunbul N/A redirect | WorkflowOS L4; Sunbul redirect only | Sync release-scope table | **Open** |
| C7 | `docs/official/aqliya-core-architecture-v1.1.md` L62–63 | `ROUTE_STRATEGY.md`, matrix | Architecture lists Sunbul at `/sunbul/*` as "Real, usable v0.1" alongside workflowos alias | Redirect-only at `/sunbul` | `/sunbul/*` = redirect alias; `/workflowos/*` = workspace | Patch architecture runtime table | **Open** |
| C8 | `docs/execution/architecture-guards.md` entire doc | All official v1.1 + matrix | States Decision OS = "Tender Decisions"; AuditOS only active product; forbids other product routes | DecisionOS, LocalContentOS, WorkflowOS, Assistant all live | Multi-product platform; DecisionOS (not Tender Decisions) | Archive or rewrite with banner — **do not use as guard** | **Open — high risk** |
| C9 | `docs/theoretical-reference/institutional-memory/strategic-doctrine-map.md` L14 | `PRODUCT_STATUS_MATRIX.md` L29 | Lists Edit OS, Sales OS, Content Authority OS as current products | Not in taxonomy | Pre-v1.1 removed concepts | Add historical banner; do not cite as current | **Open** |
| C10 | `docs/DOCUMENTATION_AUTHORITY.md` L124 | File system | References `docs/official/aqliya-master-reference.md` (lowercase) | Actual file: `AQLIYA_MASTER_REFERENCE.md` | Case-sensitive path on Linux CI | Fix reference casing in authority doc | **Open — low** |

---

## Obsolete Claim Table

| Path | Obsolete claim | Why obsolete | Correct claim | Action |
|------|----------------|--------------|---------------|--------|
| `docs/execution/architecture-guards.md` | "AuditOS is the only active product" | LocalContentOS, DecisionOS, WorkflowOS, Assistant implemented | Multi-product v0.1 platform | Category B archive |
| `docs/execution/architecture-guards.md` | "Decision OS (Tender Decisions)" | Tender branding retired | DecisionOS — adjacent governance system | Category B archive |
| `docs/archive/decision-os/*` | Tender Decisions product docs | Superseded by DecisionOS | Historical reference only | Already archived — OK |
| `docs/product/sunbul/*` (20+ files) | Sunbul as product name | WorkflowOS canonical; Sunbul = client + redirect | Point to `docs/product/workflowos/` | Category B archive subset |
| `agent-reports/wave4c-onprem-architecture.md` | On-Prem as build target | Strategic only per AGENTS.md §20 | On-Prem = roadmap direction | Label as planning evidence |
| `docs/notion/*` | CEO dashboard v3, institutional memory as live | Not in code as products | Strategic Notion layer | Index as planning, not product status |

---

## Canonical Wording Reference

| Term | Canonical | Forbidden / deprecated |
|------|-----------|------------------------|
| Platform | AQLIYA — Private Governed Institutional Intelligence Platform | "AuditOS company", "SaaS chatbot" |
| AuditOS | Product; L5 pilot-ready; `/audit/*` workspace, `/auditos/*` demo | "AQLIYA is AuditOS only" |
| DecisionOS | Adjacent product; `/decisions/*` | "Decision OS", "Tender Decisions" (except archive) |
| WorkflowOS | Governed workspace L4; `/workflowos/*` | — |
| Sunbul | Legacy redirect alias to WorkflowOS; also client org name | Sunbul as separate product |
| LocalContentOS | L5 pilot-ready with conditions; PDF/XLSX via pdfkit/xlsx | "Not implemented", "export deferred" (post-2026-05-25) |
| SalesOS | L3 prototype mock-only | "Implemented CRM/product" |
| SimulationOS | L1 marketing | "Live product" |
| AQLIYA Studio | L0 strategic | "Implemented builder" |
| Institutional Memory | L0 strategic | "Implemented engine" |

---

## Hierarchy Health Score

| Dimension | Assessment |
|-----------|------------|
| Level 0–2 (authority + official) | **Strong** — v1.1 set complete and mostly aligned |
| Level 4 (source-of-truth) | **Good with gaps** — Sunbul/workflowos and export sync needed |
| Level 5 (product/systems) | **Mixed** — Sunbul product tree stale; pilot duplication |
| Level 6 (reports) | **Sprawl** — high volume, some duplicate prior audits |
| Entry READMEs | **Good** — minor stale claims |
| Undocumented annexes | **Risk** — `docs/notion/`, root `agent-reports/` outside hierarchy |

**Overall:** Source-of-truth hierarchy is **defined and mostly followed**, but **active contradictions** on LocalContentOS exports and Sunbul/WorkflowOS classification create **implementation-status risk** for agents and marketing.
