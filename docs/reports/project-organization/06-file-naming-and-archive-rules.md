# Phase 6 — File Naming & Archival Rules

**Audit date:** 2026-05-31  
**Authority:** Extends `docs/DOCUMENTATION_AUTHORITY.md` §11 (pre-v1.1 concepts) and archive policy.

---

## 1. Naming Conventions (Active Docs)

| Rule | Pattern | Example |
|------|---------|---------|
| Official doctrine | `aqliya-<topic>-v1.1.md` or `AQLIYA_MASTER_REFERENCE.md` | `aqliya-vision-v1.1.md` |
| Source-of-truth | `AQLIYA_<TOPIC>.md` or descriptive kebab | `PRODUCT_STATUS_MATRIX.md` |
| Product packs | `<product>-v0.1/` directory with `README.md` | `localcontentos-v0.1/` |
| Reports / evidence | `<topic>-<YYYY-MM-DD>.md` or descriptive kebab | `auditos-v0.1-go-no-go-review-2026-05-28.md` |
| Release docs | `aqliya-v0.1-<artifact>.md` in `docs/releases/` | `aqliya-v0.1-known-limitations.md` |
| Pilot ops | Descriptive kebab in `docs/pilot/` or product pack | `pilot-session-5-tb-arrival-checklist.md` |

### Forbidden in active paths

- Product names as company (`AQLIYA AuditOS`)
- Spaced legacy names (`Decision OS`, `Tender Decisions`) except in archive banners
- `FINAL`, `COMPLETE`, `PRODUCTION-READY` in filenames without date and scope qualifier
- Spaces in filenames (e.g. `website-content-rewrite-v1- chatGPT.md`)
- Root-level agent reports (`wave*.md`, `agent-*.md`) — use `docs/reports/`

---

## 2. Product Naming Rules

| Name | Use for | Do not use for |
|------|---------|----------------|
| **AQLIYA** | Platform / company | Single product shorthand |
| **AuditOS** | Audit product | Whole platform |
| **DecisionOS** | Decision product (one word) | "Decision OS", "Tender Decisions" |
| **WorkflowOS** | Governed workflow product | — |
| **Sunbul** | Redirect alias OR client org (`docs/clients/sunbul/`) | Product name in new docs |
| **LocalContentOS** | Local content product | "Local Content OS" in code routes (use `local-content`) |

---

## 3. Archive Rules

### When to archive

1. Document superseded by official v1.1 or source-of-truth update
2. Pre-v1.1 product concepts (Edit OS, Content Authority OS, Tender Decisions)
3. Agent-generated reports after evidence extracted to locks/go-no-go docs
4. Duplicate pilot/checklist trees when canonical pack identified
5. Stale engineering guards that contradict current multi-product reality

### When NOT to archive

1. Official v1.1 doctrine (update in place)
2. Active source-of-truth files (patch contradictions)
3. Latest release locks and public-claim alignment reports
4. Files with uncertain authority (list in archive candidates; do not move)

### Archive procedure

1. **Copy** (never delete) to `docs/archive/<category>/`
2. Add **banner** at top: `> **Historical — not authoritative.** Superseded by: <path>`
3. Leave **redirect stub** or README link in original location if heavily linked
4. Update `docs/archive/README.md` category table
5. Log move in `docs/reports/project-organization/` or release governance note

### Proposed archive categories

| Category | Contents |
|----------|----------|
| `legacy-numbered/` | Pre-v1.1 numbered docs (existing) |
| `decision-os/` | Tender Decisions era (existing) |
| `sunbul-product-legacy/` | Sunbul-as-product documentation |
| `agent-reports-YYYY-MM/` | Agent wave outputs |
| `execution-stale/` | Obsolete engineering guards |
| `notion-planning-YYYY-MM/` | Notion OS planning packs (optional) |
| `content-drafts/` | Website drafts (existing) |
| `pilot-history/` | Historical pilot runs (existing) |
| `commercial-legacy/` | Legacy commercial (existing) |

---

## 4. Untracked / Tool Artifact Rules

| Pattern | Rule |
|---------|------|
| `.understand-anything/` | Add to `.gitignore` — tool output |
| `.data/` | Add to `.gitignore` — runtime JSON |
| `tmp-*`, `tmp_*` at root | Do not commit; delete or archive |
| `scripts/_*.py`, `scripts/_*.ts` | Prefix `_` = scratch; gitignore or move to `scripts/scratch/` |

---

## 5. Report Sprawl Controls

1. **One lock doc per milestone** — e.g. controlled-pilot-release-lock, go-no-go review
2. **Wave reports** → single index file + optional archive of individual waves
3. **New agent output** → `docs/reports/agent-waves/<date>-<topic>.md` only
4. **Duplication check** — grep product name + date before creating new report

---

## 6. Validation Before Archive Move

- [ ] Identified superseding authoritative doc
- [ ] No inbound links from official or source-of-truth (or stub added)
- [ ] Historical banner added
- [ ] Entry in `docs/archive/README.md`
- [ ] Category A (safe) vs B (approval) classified in safe-patch plan

---

## 7. Optional Patch

`docs/archive/README.md` updated in this pass with expanded categories and warnings (see Phase 7).
