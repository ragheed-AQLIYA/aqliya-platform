# SPEC-GOV-05: CLI Design

> **Engineering Specification** | **Interface:** Command Line

---

## 1. CLI Name

`aqliya-gov` — Governance Engine CLI

## 2. Commands

### aqliya-gov validate

```
aqliya-gov validate [type] [options]

Types:
  claims           Validate claims registry
  evidence         Validate evidence registry
  products         Validate product registry
  authorities      Validate authority assignments
  relationships    Validate C01–C21 relationships
  integrity        Validate evidence chains
  freshness        Validate evidence freshness
  freeze           Validate M2 freeze compliance
  decisions        Validate decision preconditions
  governance       Full governance validation (all types)

Options:
  --scope <scope>     all, product, wave, product:<id>
  --format <fmt>      cli, json, ci (default: cli)
  --verbose           Detailed output
  --strict            Warnings become errors
  --threshold <days>  Freshness threshold (default: 90)
  --output <file>     Write output to file

Exit codes:
  0   All checks pass
  1   Warnings (non-blocking)
  2   Errors (blocking)
  3   Critical violations
  10  Registry not found
  20  Internal error
```

### aqliya-gov generate

```
aqliya-gov generate [artifact] [options]

Artifacts:
  manifest <product>    Generate manifest for product
  dossier <product>     Generate dossier for product
  coverage              Generate coverage matrix
  freshness             Generate freshness report
  governance-brief      Generate governance review brief
  all                   Generate all artifacts

Options:
  --output <dir>        Output directory (default: evidence-catalog/)
  --force               Overwrite existing files
```

### aqliya-gov report

```
aqliya-gov report [type] [options]

Types:
  summary             Governance summary
  coverage            Coverage metrics
  freshness           Freshness status
  integrity           Integrity scores
  decisions           Decision status
  governance          Full governance report

Options:
  --format <fmt>      cli, json (default: cli)
  --output <file>     Write to file
```

### aqliya-gov status

```
aqliya-gov status

Output:
  Engine version
  Baseline version
  Claim count
  Evidence count
  Product count
  DEC count
  Freshness overview
  Last validation timestamp
  Governance health (PASS/WARN/FAIL)
```

### aqliya-gov audit

```
aqliya-gov audit [options]

Options:
  --scope <scope>     all, freeze, consistency
  --output <file>     Write audit report

Produces:
  Freeze compliance
  Consistency check
  Contradiction detection
  Engineering findings
```

## 3. JSON Mode Output

```json
{
  "status": "pass",
  "summary": {
    "total": 13,
    "passed": 12,
    "failed": 0,
    "warnings": 1,
    "blocked": false
  },
  "results": [
    {
      "rule": "GR-001",
      "name": "Immutable IDs Rule",
      "status": "pass",
      "details": "All 83 EV IDs immutable"
    }
  ],
  "metadata": {
    "engineVersion": "1.0",
    "baselineVersion": "M2 v1.2",
    "duration": 234,
    "timestamp": "2026-06-30T00:00:00Z"
  }
}
```

## 4. CI Mode Output

```
::group::Governance Validation
::notice title=GR-001::Immutable IDs Rule: PASS
::warning title=GR-004::Glossary Precision: 0 violations
::error title=GR-006::Decision Preconditions: FAIL (missing manifest)
::endgroup::
::set-output name=governance_status::fail
::set-output name=blocking_violations::1
```

## 5. Error Handling

- All errors produce non-zero exit codes
- JSON mode always produces valid JSON on stdout
- CLI mode produces human-readable output on stdout
- Errors go to stderr in all modes
- CI mode produces GitHub Actions annotations
