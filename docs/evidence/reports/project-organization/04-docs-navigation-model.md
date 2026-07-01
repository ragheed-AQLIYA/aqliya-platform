# Phase 4 — Active Documentation Navigation Model

**Audit date:** 2026-05-31  
**Purpose:** Proposed navigation for humans and agents without replacing `DOCUMENTATION_AUTHORITY.md`.

---

## Navigation Principles

1. **Load order matches authority** — Level 0 → official → source-of-truth → product/systems → reports (evidence).
2. **One front door** — `docs/README.md` is the navigation hub; product READMEs are secondary indexes.
3. **Reports are evidence** — Never the first stop for product status or identity.
4. **Archive is terminal** — No upward links from archive to active docs without "historical" banner.
5. **Annexes must be labeled** — Planning packs (Notion, agent waves) live under `docs/reports/` or `docs/archive/` with explicit non-authority labels.

---

## Proposed Tree (Active)

```
docs/
├── DOCUMENTATION_AUTHORITY.md          ← START (Level 0)
├── README.md                           ← Navigation hub
├── official/                           ← Doctrine (Level 1–2)
├── source-of-truth/                    ← Implementation support (Level 4)
├── releases/                           ← v0.1 scope, limitations, release notes
├── product/                            ← Product specs & pilot packs
│   ├── localcontentos-v0.1/
│   ├── workflowos/                     ← Canonical (Sunbul → archive)
│   └── pilot-control-pack/
├── systems/                            ← Operator manuals per product
├── pilot/                              ← Live pilot execution
├── deployment/                         ← Deployment & security posture
├── clients/                            ← Client org profiles (not products)
├── commercial/                         ← GTM demo storyline
├── reports/                            ← Evidence (Level 6)
│   ├── project-organization/           ← THIS AUDIT (meta-governance)
│   ├── stabilization/
│   ├── audits/
│   └── locks/                          ← PROPOSED: release locks & claim alignment
├── theoretical-reference/              ← Background (Level 7)
└── archive/                            ← Historical (Level 8)
```

---

## Agent Loading Path (Recommended)

```
1. docs/DOCUMENTATION_AUTHORITY.md
2. docs/official/AQLIYA_MASTER_REFERENCE.md
3. AGENTS.md
4. Relevant docs/official/aqliya-*.md
5. docs/source-of-truth/PRODUCT_STATUS_MATRIX.md + ROUTE_STRATEGY.md
6. Product-specific: docs/systems/<product>/ or docs/product/<product>/
7. Evidence: docs/reports/<latest-lock-or-validation>.md
```

---

## Human Reading Paths

| Goal | Path |
|------|------|
| What is AQLIYA? | `official/aqliya-vision-v1.1.md` → `AQLIYA_MASTER_REFERENCE.md` |
| What's built? | `source-of-truth/PRODUCT_STATUS_MATRIX.md` + code inspection |
| Route rules | `source-of-truth/ROUTE_STRATEGY.md` |
| AuditOS pilot | `systems/auditos/` + `reports/auditos-v0.1-go-no-go-review-2026-05-28.md` |
| LocalContentOS pilot | `product/localcontentos-v0.1/` + `reports/localcontentos-v0.1-documentation-truth-sync-2026-05-23.md` |
| Commercial claims | `reports/public-claim-alignment-2026-05-24.md` |
| Release scope | `releases/aqliya-v0.1-release-scope.md` |
| Historical context | `archive/` only |

---

## Gaps in Current `docs/README.md`

| Missing from index | Proposed addition |
|--------------------|-------------------|
| `docs/deployment/` | Row in Level 5 table: deployment/security posture |
| `docs/clients/` | Row: client org profiles (Sunbul client clarification) |
| `docs/execution/` | Row: engineering prompts — **stale content warning** |
| `docs/notion/` | Row: Notion OS planning annex — **not product authority** |
| `docs/reports/project-organization/` | Row: documentation governance audits |
| `docs/releases/` | Explicit row (currently implied via product docs) |
| `commercial-pack/` | Remove or fix broken link — directory not found |

---

## Proposed `docs/reports/` Sub-Index

| Subfolder | Contents |
|-----------|----------|
| `project-organization/` | Repo governance audits (this pass) |
| `stabilization/` | Phases 1–5 stabilization (existing) |
| `audits/` | Full project audits (existing) |
| `locks/` *(proposed)* | `*-release-lock-*`, `public-claim-alignment-*`, `go-no-go-*` |
| `agent-waves/` *(proposed)* | Consolidated agent wave reports from root |

---

## Safe Patches Applied

See Phase 7. Minimal patches to:

- `docs/README.md` — add annex rows, fix commercial-pack note, link project-organization
- `docs/archive/README.md` — expand categories and warnings

---

## Navigation Model Status

**Recommendation:** Adopt tree above. Do not create parallel root folders (`agent-reports/`, `wave-5/`) for new agent output — use `docs/reports/agent-waves/` with dated filenames.
