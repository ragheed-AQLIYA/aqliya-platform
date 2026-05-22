# AuditOS Operator Manual Normalization Plan

**Date:** 2026-05-16
**Task:** Plan for normalizing the AuditOS operator manual location and discoverability.

---

## 1. Executive Summary

| Metric | Count |
|--------|-------|
| File analyzed | `docs/systems/AUDITOS_OPERATOR_MANUAL.md` (797 lines) |
| Direct references to the file | 9 (all in documentation index/report files, zero in source code) |
| Indirect references ("operator manual") | 29 total occurrences |
| Content sections | 15 main sections + quick reference |
| Conflict terms found | 0 (all "Studio" references are Prisma Studio — acceptable) |
| Recommended option | **Option A — Link-only pass first** (Phase 1), defer move to Phase 2 |
| Risk of immediate move | Low — no source code references, no markdown links from non-index docs |

### Key Findings

1. **No source code references** to `AUDITOS_OPERATOR_MANUAL.md` exist. The file is only referenced in documentation index files and reports.
2. **No markdown links** from other docs point to the full filename. All references are plain-text mentions in README tables and report findings.
3. **The manual is purely operational** — deployment, login, demo, pilot operations, troubleshooting. No commercial content, no product claims.
4. **`docs/systems/auditos/README.md` (27 lines)** does NOT currently link to the operator manual, making it undiscoverable from within the auditos folder.
5. **`docs/systems/README.md`** DOES link to it (`AUDITOS_OPERATOR_MANUAL.md`) in the Read First column.
6. **Minimal risk** for moving — but the safest approach is to first add the link in `auditos/README.md`, then move in a separate pass.

---

## 2. Reference Search Results

### Direct references to `AUDITOS_OPERATOR_MANUAL` (9 matches)

| Referencing File | Reference Text | Link Type | Would Break If Moved? | Notes |
|-----------------|---------------|-----------|----------------------|-------|
| `docs/systems/README.md:7` | `AUDITOS_OPERATOR_MANUAL.md` (in Read First column) | Plain text in table cell | Yes — would need update | Quick fix |
| `docs/reports/systems-documentation-audit.md:35` | `AUDITOS_OPERATOR_MANUAL.md` | Plain text in table | Yes — would need update | Report — can stay or update |
| `docs/reports/systems-documentation-audit.md:79` | `docs/systems/AUDITOS_OPERATOR_MANUAL.md` | Plain text | Yes | Report |
| `docs/reports/systems-documentation-audit.md:191` | `docs/systems/AUDITOS_OPERATOR_MANUAL.md:68,73,119,779` | Plain text with line refs | Yes | Report |
| `docs/reports/systems-documentation-audit.md:269` | `AUDITOS_OPERATOR_MANUAL.md` | Plain text in move plan | Yes | Report |
| `docs/reports/product-commercial-docs-structure-review.md:57` | `AUDITOS_OPERATOR_MANUAL.md` | Plain text in directory map | Yes | Report |
| `docs/reports/product-commercial-docs-structure-review.md:100` | `docs/systems/AUDITOS_OPERATOR_MANUAL.md` | Plain text | Yes | Report |
| `docs/reports/product-commercial-docs-structure-review.md:280` | `AUDITOS_OPERATOR_MANUAL.md` | Plain text in target structure | Yes | Report |
| `docs/reports/product-commercial-docs-structure-review.md:320` | `docs/systems/AUDITOS_OPERATOR_MANUAL.md` | Plain text in move table | Yes | Report |

### Indirect / plain text references ("operator manual" — 20+ matches)

All references are in README narrative sections and report findings. None are functional markdown links.

### Search for `.md` link syntax referencing the manual

No markdown links `[...](AUDITOS_OPERATOR_MANUAL.md)` or `[...](docs/systems/AUDITOS_OPERATOR_MANUAL.md)` were found outside README table cells (which are plain text, not link syntax).

**Conclusion:** Moving the file would require updating 9 plain-text references, all in documentation files. Zero markdown hyperlinks would break. Zero source code references would break.

---

## 3. Manual Content Classification

| Section | Lines | Purpose | Category | Keep in Operator Manual? | Notes |
|---------|-------|---------|----------|------------------------|-------|
| 1. Product Overview | 11–45 | What AuditOS is, who it's for | Operational | Yes | General intro, bilingual |
| 2. Current Readiness | 46–61 | Pilot status, known blockers | Operational | Yes | Status summary |
| 3. Known Limitations | 62–82 | Current technical limits | Operational | Yes | Self-documented constraints |
| 4. Local Environment Setup | 83–128 | How to start dev environment | Operational | Yes | Prisma, seed, dev server |
| 5. Login Flow | 129–159 | Default credentials, roles | Operational | Yes | Testing credentials |
| 6. Demo Details | 160–190 | Demo engagement data | Operational | Yes | Sample data reference |
| 7. Full Workflow Guide | 191–409 | Step-by-step workflow from TB to export | Operational | Yes | Core operational content |
| 8. Audit Trail | 410–427 | How traceability works | Operational | Yes | Audit system explanation |
| 9. How to Run a Demo | 428–462 | Demo execution guide | Operational | Yes | Internal demo running |
| 10. How to Run a Pilot | 463–498 | Pilot execution steps | Operational | Yes | Pilot operations |
| 11. Pilot Log Template | 499–581 | Log template (can be extracted) | Operational | Yes (or extract) | Template could be separate file |
| 12. Issue Classification | 582–621 | How to classify problems | Operational | Yes | Support reference |
| 13. What Not to Change | 622–643 | Freeze list during pilot | Operational | Yes | Operational constraints |
| 14. Troubleshooting | 644–721 | Common issues and fixes | Operational | Yes | Support reference |
| 15. Post-Pilot Decision | 722–759 | Go/no-go decision process | Operational | Yes | Governance process |
| Quick Reference | 760–797 | Command cheat sheet | Operational | Yes (or extract) | Quick reference commands |

**Assessment:**
- **100% operational** — no commercial content, no marketing claims, no aspirational language.
- **No duplicates with commercial docs** — the manual is purely about running the system.
- **No outdated claims found** — accurately describes pilot-ready status.
- **Fits perfectly under `docs/systems/auditos/`** — this is where system-level operator docs belong.
- **Could stay as one file** — splitting is unnecessary at this stage (797 lines is manageable for a single operator manual).

---

## 4. Current AuditOS Systems Folder Review

| File | Purpose | Current Quality | Missing Links | Recommendation |
|------|---------|----------------|--------------|----------------|
| `docs/systems/auditos/README.md` (27 lines) | System overview with status, exists/not-exists, forbidden claims | Well-structured | Does NOT link to `AUDITOS_OPERATOR_MANUAL.md` at parent level | Add link to operator manual immediately |
| `AUDITOS_OPERATOR_MANUAL.md` (797 lines) | Full bilingual operator manual at `docs/systems/` root | Comprehensive | Does not appear in `auditos/` folder navigation | Normalize into `auditos/` folder |

**Current discoverability gap:**
- From `docs/systems/README.md`, users see the operator manual in "Read First."
- From `docs/systems/auditos/README.md`, users see system status but have NO link to the actual operator manual.
- A new reader entering through `docs/systems/auditos/` would not find the manual.

---

## 5. Normalization Options

### Option A — No move, link-only (RECOMMENDED PHASE 1)

Keep: `docs/systems/AUDITOS_OPERATOR_MANUAL.md`
Update: `docs/systems/auditos/README.md` to link to `../AUDITOS_OPERATOR_MANUAL.md`

| Pros | Cons | Link Risk | Recommendation |
|------|------|-----------|----------------|
| Zero breakage risk | File still outside folder | None — only adding a link | **Phase 1: Do this first** |

### Option B — Move manual into AuditOS folder (RECOMMENDED PHASE 2)

Move: `docs/systems/AUDITOS_OPERATOR_MANUAL.md` → `docs/systems/auditos/operator-manual.md`
Update: All 9 references + the link in `auditos/README.md`

| Pros | Cons | Link Risk | Recommendation |
|------|------|-----------|----------------|
| Consistent with other systems (DecisionOS has all files in its folder) | Requires updating 9 references in 3 files | Low — all references are in doc index files | **Phase 2: After link pass** |

### Option C — Split manual later (FUTURE, NOT NOW)

Move and split: Create multiple files in `docs/systems/auditos/`

| Pros | Cons | Link Risk | Recommendation |
|------|------|-----------|----------------|
| Modular, easier to maintain | 797 lines is not excessive; premature splitting adds complexity | Higher — more moves, more references | **Do not split now** |

---

## 6. Recommended Decision

**Phase 1: Link-only pass (IMMEDIATE NEXT TASK)**

1. Update `docs/systems/auditos/README.md` — add a link to `../AUDITOS_OPERATOR_MANUAL.md` in a new section
2. Do NOT move the file yet
3. Do NOT update other references yet

**Phase 2: Move pass (AFTER Phase 1 is committed and stable)**

1. `git mv docs/systems/AUDITOS_OPERATOR_MANUAL.md docs/systems/auditos/operator-manual.md`
2. Update 9 references across 3 files:
   - `docs/systems/README.md` (1 reference)
   - `docs/reports/systems-documentation-audit.md` (4 references)
   - `docs/reports/product-commercial-docs-structure-review.md` (4 references)
3. Update `docs/systems/auditos/README.md` link target
4. Validate with `git status` and `npx tsc --noEmit` (source code should not change)
5. Commit `docs: move AuditOS operator manual into auditos/ folder`

---

## 7. Future Move Plan

### Exact Move Commands

```bash
git mv docs/systems/AUDITOS_OPERATOR_MANUAL.md docs/systems/auditos/operator-manual.md
```

### Required Link Updates After Move

| Current Reference | File to Update | New Reference |
|------------------|---------------|---------------|
| `AUDITOS_OPERATOR_MANUAL.md` | `docs/systems/README.md:7` | `auditos/operator-manual.md` |
| `docs/systems/AUDITOS_OPERATOR_MANUAL.md` | `docs/reports/systems-documentation-audit.md:35` | `docs/systems/auditos/operator-manual.md` |
| `docs/systems/AUDITOS_OPERATOR_MANUAL.md` | `docs/reports/systems-documentation-audit.md:79` | `docs/systems/auditos/operator-manual.md` |
| `docs/systems/AUDITOS_OPERATOR_MANUAL.md` | `docs/reports/systems-documentation-audit.md:191` | `docs/systems/auditos/operator-manual.md` |
| `AUDITOS_OPERATOR_MANUAL.md` | `docs/reports/systems-documentation-audit.md:269` | `auditos/operator-manual.md` |
| `AUDITOS_OPERATOR_MANUAL.md` | `docs/reports/product-commercial-docs-structure-review.md:57` | `auditos/operator-manual.md` |
| `docs/systems/AUDITOS_OPERATOR_MANUAL.md` | `docs/reports/product-commercial-docs-structure-review.md:100` | `docs/systems/auditos/operator-manual.md` |
| `AUDITOS_OPERATOR_MANUAL.md` | `docs/reports/product-commercial-docs-structure-review.md:280` | `auditos/operator-manual.md` |
| `docs/systems/AUDITOS_OPERATOR_MANUAL.md` | `docs/reports/product-commercial-docs-structure-review.md:320` | `docs/systems/auditos/operator-manual.md` |

### Search Commands

Before move:
```bash
grep -rn "AUDITOS_OPERATOR_MANUAL" .
```

After move:
```bash
grep -rn "AUDITOS_OPERATOR_MANUAL" .
# Expected: 0 results (all references updated)
```

### Validation Steps After Move

```bash
git status --short
npx tsc --noEmit
npm run lint
```

---

## 8. Claims / Conflict Check

| Term | Occurrences | Context | Severity | Recommendation |
|------|:-----------:|---------|----------|---------------|
| `Mind The Future` | 0 | — | None | Clean |
| `On-Prem` | 0 | — | None | Clean |
| `Air-Gapped` | 0 | — | None | Clean |
| `Docker` | 0 | — | None | Clean |
| `Kubernetes` | 0 | — | None | Clean |
| `Local AI` | 0 | — | None | Clean |
| `Studio` | 4 | Prisma Studio (database GUI tool) | Low — acceptable | Operational tool reference, not AQLIYA Studio |
| `SAMA` | 0 | — | None | Clean |
| `PDPL` | 0 | — | None | Clean |
| `SOC 2` | 0 | — | None | Clean |
| `Azure` | 0 | — | None | Clean |
| `production-ready` | 0 | — | None | Clean |
| `ready now` | 0 | — | None | Clean |
| `real-time` | 0 | — | None | Clean |
| `continuous audit` | 0 | — | None | Clean |
| `KYC` | 0 | — | None | Clean |
| `AML` | 0 | — | None | Clean |

**No conflicts found.** The manual is clean of brand/claim issues.

---

## 9. Immediate Next Task

**`AuditOS Operator Manual Link-Only Pass`**

This task should:
1. Update `docs/systems/auditos/README.md` to add a link to `../AUDITOS_OPERATOR_MANUAL.md` in a new "Operator Manual" section
2. Do not move the file
3. Do not update other references
4. Validate with `git status --short`
5. Commit with message: `docs: link AuditOS operator manual from auditos/ README`
