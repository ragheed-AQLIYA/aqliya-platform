# AQLIYA Documentation Automation Report

> **Status:** Complete | **Version:** 1.0 | **Date:** 2026-06-26 | **Owner:** Documentation Team

## Summary

Implementation of an 11-phase Documentation Automation Program to bring the AQLIYA documentation system under automated CI validation. The program covers link validation, orphan detection, metadata validation, knowledge-map generation, authority matrix generation, health dashboard, documentation linting, AI consistency validation, and complete CI integration.

---

## Phase Implementation Details

### Phase 1 — CI Pipeline Definition

| Component | File | Status |
|-----------|------|--------|
| CI step definitions | `docs/DOCUMENTATION_CI.md` | ✅ Done |
| CI workflow integration | `.github/workflows/ci.yml` (lines 45-61) | ✅ Done |
| npm script registration | `package.json` (scripts `docs:*`) | ✅ Done |

**Description:** Defines the CI pipeline for documentation validation. Runs after `npm ci`, before `npm run build`. Five steps: validate knowledge-map → check links → find orphans → lint → validate AI consistency.

---

### Phase 2 — Link Checking

| Component | File | Status |
|-----------|------|--------|
| Script | `scripts/check-document-links.mjs` | ✅ Done |
| Output | `docs/validation/document-links-report.md` (gitignored) | ✅ Generated |

**Description:** Scans every `.md` file for internal markdown links, resolves relative paths and absolute paths from repo root, validates anchor references against heading anchors in target files. Reports broken links.

**Coverage:**
- All `.md` files under `docs/` and root-level files (`AGENTS.md`, `README.md`)
- External links skipped (`http://`, `https://`, `mailto:`)
- Anchor validation (GitHub-style heading anchors)
- Relative and absolute path resolution

---

### Phase 3 — Orphan Detection

| Component | File | Status |
|-----------|------|--------|
| Script | `scripts/find-orphan-documents.mjs` | ✅ Done |
| Output | `docs/validation/orphan-documents.md` (gitignored) | ✅ Generated |

**Description:** Detects documents under `docs/` that are never referenced from any navigation/index document, not registered in `knowledge-map.json`, or missing inbound references. Categorizes orphans as "hard" (unreferenced + not in map) vs "soft" (unreferenced but registered).

**Method:**
- Reads all navigation/index documents as reference sources
- Extracts all markdown link references and inline code references
- Strips anchors and resolves relative paths
- Cross-references against `knowledge-map.json` for registration status

---

### Phase 4 — Metadata Validation

| Component | File | Status |
|-----------|------|--------|
| Script | `scripts/validate-metadata.mjs` | ✅ Done |
| Output | `docs/validation/metadata-report.md` (gitignored) | ✅ Generated |

**Description:** Checks that every Source of Truth document has required metadata fields (owner, status, version) and optional fields (priority, last_reviewed). Reports coverage statistics.

**Checked fields:**
- `**Owner:**` — responsible team/person
- `**Status:**` — active, draft, deprecated, archived
- `**Version:**` — version number
- `**Last Reviewed:**` or `**Date:**` — last review date

---

### Phase 5 — Knowledge Map Generation

| Component | File | Status |
|-----------|------|--------|
| Script | `scripts/generate-knowledge-map.mjs` | ✅ Done |
| Output | `docs/ai/knowledge-map.json` | ✅ Regenerated |

**Description:** Reads official documentation files from `docs/` and produces a deterministic `knowledge-map.json` grouped by category (critical, high_priority, architecture, product, security, deployment, governance, operations, roadmaps, archive, deprecated, superseded).

**Deterministic algorithm:**
1. Collect all `.md` files under `docs/` and root
2. For each file, extract title (from H1), description, owner, status from content
3. Map directory structure to category/priority/sourceOfTruth
4. Handle superseded, deprecated, and archived documents
5. Sort each group by priority then path

---

### Phase 6 — Authority Matrix Generation

| Component | File | Status |
|-----------|------|--------|
| Script | `scripts/generate-authority-matrix.mjs` | ✅ Done |
| Output | `docs/DOCUMENTATION_AUTHORITY_MATRIX.md` | ✅ Generated |

**Description:** Reads `knowledge-map.json` and produces a human-readable markdown authority matrix document with all entries grouped by section, including priority, owner, status, and dependencies.

**Content:**
- Overview table with section counts
- Priority legend
- Per-section document tables with path, priority, owner, status, dependencies

---

### Phase 7 — Reading Order Generation

| Component | File | Status |
|-----------|------|--------|
| Existing document | `docs/AI_STARTUP_CURRICULUM.md` | ✅ Verified |
| Existing document | `docs/AI_READING_PROFILES.md` | ✅ Verified |

**Description:** The AI Startup Curriculum and Reading Profiles already exist as manually crafted documents. Phase 7 validates their references are accurate (handled by Phase 10 AI consistency validation). No automated generation was needed — these are carefully authored, not generated.

---

### Phase 8 — Health Dashboard

| Component | File | Status |
|-----------|------|--------|
| Script | `scripts/generate-health-dashboard.mjs` | ✅ Done |
| Output | `docs/DOCUMENTATION_HEALTH.md` | ✅ Generated |

**Description:** Produces a deterministic health dashboard that tracks:

| Metric | Description |
|--------|-------------|
| Total Markdown Files | Count of all `.md` files under `docs/` |
| Total Lines of Docs | Sum of all line counts |
| Knowledge Map Entries | Count of entries in generated map |
| Source of Truth Documents | Count of documents marked `sourceOfTruth` |
| Entries with Owners | % coverage of owner metadata |
| Entries with Dependencies | % coverage of dependency metadata |
| Entries with readWhen | % coverage of readWhen metadata |
| Duplicate Paths | Entries with the same path across groups |
| Missing Files | Entries referencing non-existent files |
| Health Score | 0-100 computed from deductions |

---

### Phase 9 — Documentation Lint

| Component | File | Status |
|-----------|------|--------|
| Script | `scripts/lint-documentation.mjs` | ✅ Done |

**Description:** Scans every markdown file under `docs/` for:

- **Duplicate headings** — same-level headings with identical text
- **Empty sections** — heading followed immediately by another heading with no content
- **Broken tables** — mismatched column counts within a table
- **Missing H1** — documents without a top-level heading (except archive/validation)
- **Oversized documents** — files exceeding 2000 lines
- **Empty alt text** — images with empty alt attributes

---

### Phase 10 — AI Consistency Validation

| Component | File | Status |
|-----------|------|--------|
| Script | `scripts/validate-ai-consistency.mjs` | ✅ Done |

**Description:** Verifies synchronization across all 7 AI guidance documents:

| # | Document | Role |
|---|----------|------|
| 1 | `docs/AI_ENTRYPOINT.md` | Session entry point |
| 2 | `docs/AI_KNOWLEDGE_MAP.md` | Human-readable inventory |
| 3 | `docs/ai/knowledge-map.json` | Machine-readable inventory |
| 4 | `docs/DOCUMENTATION_AUTHORITY.md` | Hierarchy & conflict resolution |
| 5 | `docs/DOCUMENTATION_GOVERNANCE_v2.md` | Lifecycle & ownership |
| 6 | `docs/AI_READING_PROFILES.md` | Per-tool reading plans |
| 7 | `docs/AI_STARTUP_CURRICULUM.md` | Progressive learning path |

**Checks performed:**
- All 7 files exist
- Entrypoint references all guidance docs
- File references in knowledge-map resolve to real files
- Cross-references between AI docs are bidirectional
- Curriculum reading order references exist
- Reading profile references exist

---

### Phase 11 — Automation Report (this document)

| Component | File | Status |
|-----------|------|--------|
| Report | `docs/DOCUMENTATION_AUTOMATION_REPORT.md` | ✅ Done |

---

## CI Integration

The documentation validation pipeline is integrated into `.github/workflows/ci.yml`:

```yaml
- name: Documentation validation
  run: |
    node scripts/validate-documentation.mjs
    node scripts/check-document-links.mjs
    node scripts/find-orphan-documents.mjs
    node scripts/lint-documentation.mjs
    node scripts/validate-ai-consistency.mjs
```

- **Runs after:** `npm ci`
- **Runs before:** `npx prisma generate` and `npm run build`
- **Failure policy:** Knowledge-map validation blocks; all others are warning-only

---

## Script Inventory

| Script | Purpose | CI Step | Generator |
|--------|---------|---------|-----------|
| `scripts/validate-documentation.mjs` | Knowledge-map validation | ✅ Step 1 | ❌ |
| `scripts/check-document-links.mjs` | Link checker | ✅ Step 2 | ❌ |
| `scripts/find-orphan-documents.mjs` | Orphan detection | ✅ Step 3 | ❌ |
| `scripts/lint-documentation.mjs` | Documentation linter | ✅ Step 4 | ❌ |
| `scripts/validate-ai-consistency.mjs` | AI consistency validator | ✅ Step 5 | ❌ |
| `scripts/validate-metadata.mjs` | Metadata validator | ❌ (manual) | ❌ |
| `scripts/generate-knowledge-map.mjs` | Knowledge-map generator | ❌ (manual) | ✅ |
| `scripts/generate-authority-matrix.mjs` | Authority matrix generator | ❌ (manual) | ✅ |
| `scripts/generate-health-dashboard.mjs` | Health dashboard generator | ❌ (manual) | ✅ |

---

## npm Scripts

| Script | Command |
|--------|---------|
| `npm run docs:validate` | Run all validators (km, links, orphans, lint, ai) |
| `npm run docs:validate:km` | Validate knowledge-map only |
| `npm run docs:links` | Check document links |
| `npm run docs:orphans` | Find orphan documents |
| `npm run docs:lint` | Lint documentation |
| `npm run docs:consistency` | Validate AI consistency |
| `npm run docs:metadata` | Validate metadata |
| `npm run docs:health` | Generate health dashboard |
| `npm run docs:generate-map` | Regenerate knowledge-map.json |
| `npm run docs:generate-authority-matrix` | Regenerate authority matrix |
| `npm run docs:generate-all` | Regenerate all generated docs |
| `npm run docs:validate:full` | Generate + validate (complete cycle) |
| `npm run docs:check` | Validate + health dashboard |

---

## Limitations

1. **Link checker** validates file existence and anchors, but does not validate external URLs
2. **Orphan detector** uses heuristics for navigation documents — some intended isolated docs may appear as false positives
3. **Metadata validator** checks for field presence but not field correctness (e.g., validating that `owner` is a real team)
4. **Knowledge-map generator** uses directory-based category mapping — docs in unexpected directories may get incorrect priorities
5. **Health dashboard** computes a heuristic score based on quantifiable metrics but does not assess content quality
6. **No automated archive detection** — documents that should be archived are not automatically detected
7. **No deprecated reference detection** — references to deprecated/superseded docs are not flagged

---

## Recommendations

1. **Run `npm run docs:validate:full` weekly** as part of routine documentation maintenance
2. **Add metadata to legacy SoT documents** that currently lack owner/status/version fields
3. **Fix broken links** reported by the link checker before adding new documentation
4. **Integrate metadata validation into CI** once all SoT documents have metadata
5. **Add external link validation** via a future enhancement to `check-document-links.mjs`
6. **Consider archive automation** for documents that have been superseded for >90 days

---

## Future Work

| Feature | Priority | Notes |
|---------|----------|-------|
| External link validation | Low | Integrate with a URL health checker |
| Archive automation | Medium | Auto-detect stale superseded docs |
| Content quality scoring | Low | NLP-based assessment |
| HTML/pdf export validation | Low | Check referenced outputs |
| Version drift detection | Medium | Compare doc versions against code |
| Inline reference checker | Low | Check `see §X` references resolve |

---

## Conclusion

All 11 phases of the Documentation Automation Program are complete. The AQLIYA documentation system now has:

- ✅ CI-integrated validation (5 steps)
- ✅ 9 scripts for validation and generation
- ✅ 12 npm scripts for local development
- ✅ Deterministic knowledge-map generation
- ✅ Authority matrix generation
- ✅ Health dashboard with quantifiable metrics
- ✅ Link checking with anchor validation
- ✅ Orphan detection
- ✅ Documentation linting
- ✅ AI consistency validation across 7 guidance docs
- ✅ Complete documentation in `docs/DOCUMENTATION_CI.md`
