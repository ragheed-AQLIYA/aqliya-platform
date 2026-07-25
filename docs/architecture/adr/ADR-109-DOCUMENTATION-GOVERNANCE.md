# ADR-109: Documentation Governance

**Status:** Accepted — Codifies authority hierarchy; mandates truth reconciliation  
**Date:** 2026-07-19  
**Owner:** Documentation / Governance Team  
**Related:** `docs/DOCUMENTATION_AUTHORITY.md`, ADR-100, Architecture Governance Program P0  
**Amends practice:** Resolves path and maturity conflicts identified in CEAP Stream 14

---

## Context

AQLIYA maintains a layered documentation authority system (L0 conflict resolution through archive). In practice, `PRODUCT_STATUS_MATRIX` (mass L6), `README` (L4–L5), `ROUTE_STRATEGY`, `AQLIYA_CURRENT_STATE` (“do not claim L6”), `AI_ENTRYPOINT`, and Reality Notes **disagree**. Entry path `docs/AI_ENTRYPOINT.md` is referenced but the file lives at `docs/official/AI_ENTRYPOINT.md`. Commercial pricing conflicts with `WHAT_WE_DO_NOT_CLAIM.md`. ADR indexes also collide (Constitution index ADR-001 ≠ file ADR-001 AI Runtime).

---

## Problem

Documentation drift is now an **architectural risk**: engineers, agents, and buyers can pick contradictory “truths.” Architecture decisions without documentation governance will not stick.

---

## Options Considered

### Option A — Delete most docs; keep code as only truth

| Pros | Cons |
|------|------|
| Less drift | Loses doctrine, commercial, ops value |

### Option B — Allow multiple status docs without enforcement

| Pros | Cons |
|------|------|
| Status quo | Continues CEAP Critical contradictions |

### Option C — Strict authority + maturity freeze rules + ADR series 100+ (selected)

| Pros | Cons |
|------|------|
| Restores single decision path | Requires P0 edit pass |
| Fits existing DOCUMENTATION_AUTHORITY | Agents must be re-pointed |

---

## Decision

### 1. Authority order (binding)

When documents conflict, resolve in this order:

1. `docs/DOCUMENTATION_AUTHORITY.md` (process)
2. `docs/official/` doctrine (identity, trust, taxonomy principles)
3. **Implementation status:** code + `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` **after Reality Notes reconciliation**
4. `docs/commercial/WHAT_WE_DO_NOT_CLAIM.md` **wins over pricing/marketing** for claim boundaries
5. ADRs in `docs/architecture/adr/` and `docs/adr/` for technical decisions
6. Reports/evidence — evidence only, not doctrine
7. `docs/archive/**` — historical only

### 2. Entry point

- Canonical AI/human entry: **`docs/official/AI_ENTRYPOINT.md`**
- References to `docs/AI_ENTRYPOINT.md` must be updated **or** a stub redirect file may be added that points to official (docs-only change).
- `CLAUDE.md` / `AGENTS.md` must cite the canonical path.

### 3. Maturity labels

- L0–L6 labels in Matrix must be **consistent with Reality Notes and commercial exclusions** in the same document.
- **Internal rule:** Do not label a system L6 Production-hardened if unrestricted production blockers remain open (pen-test, ACCOUNT-BLOCKED prod DB, unverified Redis/ClamAV) — use L5 Pilot-ready or L4 with conditions.
- `ENTERPRISE_COMPLETION_ROADMAP.md` statement that no product is L6 is treated as a **governance warning** until Matrix is reconciled.

### 4. ADR numbering

| Series | Location | Purpose |
|--------|----------|---------|
| Constitution principles | `AQLIYA_ARCHITECTURE_CONSTITUTION.md` + Decision Index | Binding principles |
| File ADRs 001–099 | `docs/architecture/`, `docs/architecture/adr/`, `docs/adr/` | Historical/domain ADRs |
| **File ADRs 100–199** | `docs/architecture/adr/ADR-1xx-*.md` | Platform governance ADRs (this series) |

New ADRs: create file under `docs/architecture/adr/`, add row to `ARCHITECTURE_DECISION_INDEX.md`.

### 5. Commercial docs

- `WHAT_WE_DO_NOT_CLAIM.md` is binding for external claims.
- Pricing docs may not sell On-Prem/Air-Gap/Private appliance until ADR-108 non-goals are lifted.

### 6. Continuous docs drift

- CI docs validators remain mandatory.
- CEAP authority-drift gate (design) should lint Matrix vs README vs exclusions (engineering backlog).

---

## Consequences

### Positive
- Single conflict-resolution path for agents and humans.
- Stops L6 inflation as an accidental architecture decision.
- ADR-100+ series becomes discoverable.

### Negative
- Requires a deliberate Matrix/README edit pass (P0).
- Some “L6” pride labels will be demoted.

---

## Migration Strategy

1. P0: Reconcile Matrix table ↔ Reality Notes ↔ README ↔ ROUTE ↔ AI_ENTRYPOINT status table.
2. P0: Fix entry path references; repair commercial README broken links.
3. P0: Align pricing with exclusions.
4. P1: Update Decision Index with ADR-100–109 rows.
5. Ongoing: No new status claim without code evidence + Matrix update in same change set.

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Contradictions C-01/C-02 class (maturity/pricing) | Closed |
| Broken entry/nav paths for AI_ENTRYPOINT | 0 |
| New PRs changing status without Matrix update | 0 (review rule) |
| ADR-100–109 indexed | Yes |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Matrix edit wars | Architecture + Docs dual approval for L5↔L6 |
| Archive docs cited as current | Authority rule 7 |
| Agents reading CLAUDE.md only | Keep CLAUDE.md pointer accurate |

---

## Related Components

- `docs/DOCUMENTATION_AUTHORITY.md`
- `docs/official/AI_ENTRYPOINT.md`
- `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`
- `docs/commercial/WHAT_WE_DO_NOT_CLAIM.md`
- `docs/architecture/ARCHITECTURE_DECISION_INDEX.md`
- `docs/architecture/AQLIYA_ARCHITECTURE_CONSTITUTION.md`
- CI: `npm run docs:validate` family in `ci.yml`

---

## Repository Evidence

| Evidence | Path |
|----------|------|
| Authority hierarchy | `docs/DOCUMENTATION_AUTHORITY.md` |
| Entry path mismatch | Referenced `docs/AI_ENTRYPOINT.md` vs actual `docs/official/AI_ENTRYPOINT.md` |
| Reality Notes conflicts | `PRODUCT_STATUS_MATRIX.md` §Reality Notes (Organizations mock-only; ContentStudio L4 vs L6) |
| “Do not claim L6” | `docs/source-of-truth/AQLIYA_CURRENT_STATE.md` / ENTERPRISE_COMPLETION_ROADMAP |
| Pricing vs exclusions | `docs/commercial/PRICING_MODEL.md` vs `WHAT_WE_DO_NOT_CLAIM.md` |
| CEAP Contradiction Matrix | CEAP Stream 14 (2026-07-19) |
| Decision Index template | `docs/architecture/ARCHITECTURE_DECISION_INDEX.md` |
