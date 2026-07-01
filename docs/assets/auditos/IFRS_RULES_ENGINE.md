# IFRS Rules Engine — AuditOS 2.0 Phase 6

**Status:** Implemented (feature-flagged, default off)  
**Flag:** `audit.ifrs-rules` / `FF_AUDIT_IFRS_RULES=true`

## Purpose

Runtime evaluation of **admitted IFRS knowledge packs** from:

```
knowledge-foundation/domains/ifrs/*/rules.json
```

Produces:

- Rule evaluations (pass / fail / warning / advisory / skipped)
- `RULE_CITATION` markers on financial statement lines
- Suggested **disclosure triggers** for Phase 8 handoff

## Executable Topics (Phase 6)

| Topic cluster | Standards |
| ------------- | --------- |
| Presentation | IAS 1 (complete set, going concern, materiality, notes) |
| Revenue | IFRS 15 (five-step, contract ID) |
| PPE | IAS 16 (definition, measurement, depreciation) |
| Leases | IFRS 16 (recognition, ROU, liability) |
| Cash flow | IAS 7 (classification, operating method) |

Non-executable topics in packs are **skipped** at load time.

## Module

| File | Role |
| ---- | ---- |
| `types.ts` | Evaluations, triggers, EXECUTABLE_IFRS_TOPICS |
| `ifrs-rules-loader.ts` | Load 32 IFRS packs (approved only) |
| `ifrs-rule-checks.ts` | Deterministic topic evaluators |
| `disclosure-triggers.ts` | Map warnings → suggested notes |
| `ifrs-rules-engine.ts` | Context load, run, citations, validation append |
| `index.ts` | Flag + post-FS hook |

## Integration

| Surface | When |
| ------- | ---- |
| FS rebuild hook | `maybeRunIfrsRulesAfterFsRebuild` |
| Validation | `appendIfrsValidationIssues` → `ifrs_rule` check type |
| Validation UI | `IfrsRulesPanel` |

## Local Testing

```env
FF_AUDIT_IFRS_RULES=true
FF_AUDIT_FS_V2=true
```

Flow: confirm mappings → FS rebuild → IFRS panel on validation tab

## Phase 7 — Complete

SOCPA overlay runtime — see [`SOCPA_RULES_ENGINE.md`](./SOCPA_RULES_ENGINE.md).

## Limitations

- Deterministic heuristics — not full IFRS compliance engine
- OCI presentation skipped in v1
- Citations attached heuristically to FS lines
- Disclosure triggers are suggestions only (human review required)
