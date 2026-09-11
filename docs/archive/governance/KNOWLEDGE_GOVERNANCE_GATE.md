# Knowledge Governance Gate — Design Specification

> **Part of:** Knowledge Governance Sprint v1  
> **Phase:** 9 — Automated Governance Gate Design  
> **Charter:** docs/governance/aqliya-knowledge-governance-charter-v1.md  
> **Owner:** Governance Team  
> **Date:** 2026-06-29  
> **Status:** Design specification only — no implementation code  
> **Target script:** scripts/validate-knowledge-governance.mjs

---

## 1. Purpose

The Knowledge Governance Gate is an **automated validation script** that enforces documentation governance rules pre-commit and in CI. It ensures that:

- All documentation carries required lifecycle metadata
- No duplicate authorities exist per knowledge area
- All internal links resolve
- Product maturity claims align with the source-of-truth PRODUCT_STATUS_MATRIX.md
- No stale documentation persists beyond the review window
- All superseded references resolve correctly
- Glossary terms are used consistently
- No L0-L6 contradictions exist across authority documents within the same knowledge area

**Why this matters:** The Knowledge Governance Sprint v1 found 5 critical contradictions across authority docs. Without automated gates, these contradictions will recur.

---

## 2. Inputs

The script reads from these sources:

### 2.1 Documentation Corpus

All .md files within the docs/ directory tree, **excluding**:
- docs/archive/ (preserved historical records — not subject to current governance)
- docs/archived/ (same)
- 
ode_modules/ (not repository documentation)

### 2.2 Authority Files

| File | Purpose | Path |
|---|---|---|
| **CLAIM_REGISTRY.md** | Claim database — all CR entries | docs/governance/CLAIM_REGISTRY.md |
| **AUTHORITY MATRIX** | Area-to-authority document mapping | Inferred from Knowledge Governance Charter §3.1 |
| **PRODUCT_STATUS_MATRIX.md** | Canonical product maturity levels | docs/source-of-truth/PRODUCT_STATUS_MATRIX.md |
| **Glossary v1.x** | Official terminology | docs/official/aqliya-glossary-v1.1.md |

### 2.3 Metadata Standard

Every active (non-archive, non-historical) document must carry these metadata fields in its header:

`
**Type:** [Authority | Reference | Working]
**Status:** [Active | Draft | Review | Superseded]
**Knowledge Area:** [Architecture | Product Status | Glossary | ...]
**Owner:** [Team Name]
**Last Reviewed:** [YYYY-MM-DD]
`

Optional fields:

`
**Review Cycle:** [Every N months]
**Supersedes:** [path/to/old-file.md]
**Superseded By:** [path/to/new-file.md]
`

---

## 3. Outputs

The script produces three outputs:

### 3.1 Terminal Summary

`
╔═══════════════════════════════════════════════════╗
║       Knowledge Governance Gate Report            ║
╚═══════════════════════════════════════════════════╝

RULE-1 (Metadata):      PASS  (42/42 files checked)
RULE-2 (No duplicates): PASS  (11/11 areas unique)
RULE-3 (Links):         WARN  (3 broken links found)
RULE-4 (Maturity):      FAIL  (2 contradictions)
RULE-5 (Staleness):     PASS  (0 files >90 days stale)
RULE-6 (Supersedes):    PASS  (all resolve)
RULE-7 (Glossary):      WARN  (2 terms missing from glossary)
RULE-8 (No L0-L6 conflict): FAIL (1 conflict found)

Summary: 4 PASS · 2 WARN · 2 FAIL
Exit code: 2 (errors found)
`

### 3.2 JSON Report (machine-readable)

Written to docs/reports/knowledge-governance-gate-[timestamp].json when --report is passed.

`json
{
  "timestamp": "2026-06-29T12:00:00Z",
  "exitCode": 2,
  "rules": {
    "RULE-1": { "status": "PASS", "filesChecked": 42, "failures": [] },
    "RULE-4": {
      "status": "FAIL",
      "failures": [
        {
          "rule": "RULE-4",
          "file": "docs/official/aqliya-glossary-v1.1.md",
          "claim": "RiskOS: Not implemented",
          "matrixLevel": "L5",
          "severity": "critical"
        }
      ]
    }
  }
}
`

### 3.3 HTML/Markdown Report (human-readable)

Optional human-readable report at docs/reports/knowledge-governance-gate-[timestamp].md with:
- Per-rule pass/fail with details
- Links to failing files
- Suggested fixes for each failure

---

## 4. Validation Rules

### RULE-1: Metadata Presence

**Check:** Every active document has Type, Status, Knowledge Area, Owner, and Last Reviewed in its header.

**Exclusions:** 
- Archive/Historical docs (exempt from metadata requirement)
- README.md files (guidance-only, not governance documents)
- Files in docs/archive/ and docs/archived/

**Pass condition:** All non-excluded files have all 5 required metadata fields.

**Suggestion:** Use a regex pattern to detect **Type:**, **Status:**, **Knowledge Area:**, **Owner:**, **Last Reviewed:**.

### RULE-2: No Duplicate Authorities

**Check:** No knowledge area has more than one Authority document.

**Reference:** Authority matrix from Knowledge Governance Charter §3.1.

**Pass condition:** Each knowledge area maps to exactly one Authority document.

**Implementation:** Read document headers, collect Type=Authority, group by Knowledge Area, flag areas with count > 1.

### RULE-3: Internal Markdown Links Resolve

**Check:** All internal markdown links (text with relative-path targets) within docs/ resolve to existing files.

**Exclusions:**
- External URLs (https://, http://) — not checked
- Anchor-only links (#section) — checked for heading existence within file
- Archive docs — not checked

**Pass condition:** All internal links point to existing files.

**Note:** This is the most expensive check. Consider caching the file tree.

### RULE-4: Product Maturity Alignment

**Check:** For any product maturity claim (L0-L6) in an authority document, verify it matches the level in PRODUCT_STATUS_MATRIX.md.

**Reference:** Authority for product status is docs/source-of-truth/PRODUCT_STATUS_MATRIX.md.

**Pass condition:** All L0-L6 claims in authority docs match the matrix.

**Detection:** Search for patterns like L\d, Pilot-ready, Usable v0.1, Concept, Marketing, Prototype, Shell.

### RULE-5: No Stale Documentation

**Check:** Active documents must have Last Reviewed within the last 90 days (default) or within their declared Review Cycle.

**Pass condition:** All active docs have a Last Reviewed date ≤ 90 days from today.

**Note:** Configurable threshold via --max-age flag.

### RULE-6: Supersedes References Resolve

**Check:** If a document has **Supersedes:** or **Superseded By:**, verify the referenced path exists.

**Pass condition:** All supersedes/superseded-by paths resolve to existing files.

### RULE-7: Glossary Term Consistency

**Check:** All terms from the official glossary (the Authority for terminology) that appear in active docs use the same definition/status. Unknown terms not in the glossary are flagged.

**Pass condition:** No active doc contradicts a glossary definition. Unknown terms are flagged as warnings, not errors.

### RULE-8: No L0-L6 Contradiction Within Knowledge Area

**Check:** Within the same knowledge area, no two Authority documents claim different L0-L6 levels for the same product/system.

**Pass condition:** All authorities for the same area agree on L0-L6 levels.

---

## 5. CLI Interface

### Syntax

`ash
node scripts/validate-knowledge-governance.mjs [options]
`

### Options

| Flag | Type | Default | Description |
|---|---|---|---|
| --ci | boolean | false | CI mode: stricter exit codes, no color output, JSON-only terminal report |
| --fix | boolean | false | Auto-fix mode: fix metadata, broken links where unambiguous. Cannot fix contradictions or stale content. |
| --strict | boolean | false | All rules are errors (default: RULE-3, RULE-7 are warnings). Warnings become errors. |
| --dir | string | docs/ | Target directory for validation |
| --max-age | number | 90 | Maximum days since Last Reviewed (RULE-5) |
| --report | boolean | false | Write JSON + markdown reports to docs/reports/ |
| --matrix | string | docs/source-of-truth/PRODUCT_STATUS_MATRIX.md | Path to product status matrix |
| --glossary | string | docs/official/aqliya-glossary-v1.1.md | Path to glossary |
| --registry | string | docs/governance/CLAIM_REGISTRY.md | Path to claim registry |
| --quiet | boolean | false | Suppress terminal output except summary |
| --help | boolean | false | Show usage information |

### Examples

`ash
# Standard validation
node scripts/validate-knowledge-governance.mjs

# CI mode with strict checking
node scripts/validate-knowledge-governance.mjs --ci --strict

# Validate a specific subdirectory
node scripts/validate-knowledge-governance.mjs --dir docs/official/

# Generate reports
node scripts/validate-knowledge-governance.mjs --report --dir docs/
`

---

## 6. Exit Codes

| Code | Meaning | CI Behavior | Pre-commit Behavior |
|---|---|---|---|
| **0** | Pass — all rules pass | Pipeline continues | Commit allowed |
| **1** | Warnings — RULE-3 or RULE-7 failures only (non-strict mode) | Pipeline continues with warning annotation | Commit allowed with warning |
| **2** | Errors — RULE-1,2,4,5,6,8 failures (any) | Pipeline fails | Commit blocked |
| **3** | Critical — P0 contradictions found in Claim Registry (Status=Contradicted, Priority=P0) | Pipeline fails, immediate escalation | Commit blocked, output contains "ESCALATE TO GOVERNANCE TEAM" |

---

## 7. CI Integration (GitHub Actions)

### Workflow Step

`yaml
- name: Knowledge Governance Gate
  run: node scripts/validate-knowledge-governance.mjs --ci
  if: github.event_name == 'pull_request' || github.event_name == 'push'
`

### Placement

Should run **after build** but **before deploy** in the CI pipeline:

`
lint → typecheck → build → test → knowledge-governance-gate → deploy
`

Rationale: The governance gate checks documentation quality, not code quality. It should run after the code is verified but before anything is deployed.

### Notification on Failure

On exit code 3 (critical), the CI pipeline should:
1. Fail the build
2. Post a comment on the PR with: "⚠️ **Knowledge Governance Gate Critical Failure:** P0 contradictions found. Escalate to Governance Team."
3. Optionally notify Slack or email via GitHub Actions notification plugins

---

## 8. Pre-Commit Integration (Husky)

### Hook Configuration

`ash
# .husky/pre-commit
node scripts/validate-knowledge-governance.mjs --dir docs/ --max-age 90
`

### Performance Optimization

The pre-commit hook should only scan:
1. Files changed in the current commit (use git diff --cached --name-only -- '*.md')
2. The CLAIM_REGISTRY.md and PRODUCT_STATUS_MATRIX.md for cross-reference checks

This keeps pre-commit fast (<500ms for most changes).

### Pre-Commit Behavior

| Exit Code | Pre-commit Action |
|---|---|
| 0 | Commit proceeds |
| 1 | Warning displayed; commit proceeds with user confirmation |
| 2 | Commit blocked; error output shown |
| 3 | Commit blocked; "ESCALATE TO GOVERNANCE TEAM" displayed |

---

## 9. Performance Considerations

### 9.1 File Tree Caching

The most expensive operation is RULE-3 (link checking). Optimize by:

1. **Cache the file tree** — scan directory once, cache result for the run
2. **Incremental mode** — in pre-commit, only check changed files + files that reference changed targets
3. **Skip vendor dirs** — exclude 
ode_modules/, docs/archive/, docs/archived/
4. **Lazy link resolution** — only resolve links in files that have changed (pre-commit mode)

### 9.2 Expected Performance

| Mode | Files Scanned | Expected Time |
|---|---|---|
| Pre-commit (changed only) | 1-10 files | < 200ms |
| Full scan (ci) | 500-1500 files | < 5s |
| Full scan + reports | 500-1500 files | < 10s |

### 9.3 Memory

Expected memory usage: < 50MB for full corpus scan.

---

## 10. Rollout Strategy

### Phase 1: Warning-Only Mode

- Script runs but **never blocks** anything
- Outputs warnings to terminal
- Builds baseline metrics
- Duration: 1 sprint (2 weeks)

### Phase 2: Soft Enforcement

- CI runs in warning mode but annotates PRs with failures
- Pre-commit warning mode (exit code 1)
- Exceptions documented
- Duration: 1 sprint

### Phase 3: Full Enforcement

- CI blocks on exit code 2+
- Pre-commit blocks on exit code 2+
- All 8 rules enforced
- Permanent

### Phase 4: Strict Mode

- --strict flag available for release candidates
- P0 contradictions (exit code 3) enforced
- Documentation freeze conditions triggered automatically

---

## 11. Development Notes

### Implementation Constraints

- **Run anywhere:** Must work without database, without build step, without Next.js
- **No external dependencies:** Pure Node.js 20+ (fs, path, regex only)
- **No Prisma:** Must not require database access or Prisma generation
- **Minimal dependencies that are acceptable:** front-matter parser, markdown-link-check (if performance requires)
- **Single file:** Keep as a single .mjs file for easy deployment

### Package Dependencies to Consider

| Package | Purpose | Risk | Decision |
|---|---|---|---|
| glob | File discovery | Low — widely used | Accept |
| gray-matter | Front-matter parsing | Low — stable | Accept |
| marked | Markdown link extraction | Medium — heavy | Consider custom regex instead |
| None | Pure Node.js | Zero | **Preferred** — implement link extraction with regex |

### Test Strategy

| Area | Test Approach |
|---|---|
| Rule logic | Unit tests for each rule function |
| Link resolution | Test with known-good and known-bad links |
| Metadata parsing | Test with valid, partial, and missing metadata |
| Exit codes | Test each combination of rule failures |
| Regression | Run against current docs/ corpus |

---

## 12. Known Limitations

| Limitation | Impact | Workaround |
|---|---|---|
| Cannot detect semantic contradictions (e.g., "is governable" vs "is governed") | Some contradictions need human judgment | Flag for human review; use Claim Registry for known contradictions |
| Link checking may false-positive on dynamic routes | /decisions/[id] is not a real file | Skip route-parameter patterns or use allowlist |
| Cannot verify claims against runtime code | Only validates within documentation corpus | CLAIM_REGISTRY provides manual claim-to-code mapping |
| Glossary term matching is exact-string only | Variant spelling or pluralization may be missed | Add variant support or allowlist common variants |

---

## 13. Relationship to Other Governance Tools

| Tool | Relationship |
|---|---|
| alidate-env.mjs | Separate — validates environment variables |
| estore-drill.mjs | Separate — infrastructure restore testing |
| alidate-knowledge-governance.mjs | **This design** — documentation governance |

