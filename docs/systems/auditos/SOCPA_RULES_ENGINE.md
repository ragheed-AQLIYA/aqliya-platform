# SOCPA Rules Engine — AuditOS 2.0 Phase 7

**Status:** Implemented (feature-flagged, default off)  
**Flag:** `audit.socpa-rules` / `FF_AUDIT_SOCPA_RULES=true`

## Purpose

Saudi **SOCPA jurisdiction overlay** on top of IFRS factory output:

- Loads **8 admitted packs** from `knowledge-foundation/domains/socpa/*/rules.json`
- Runs only when engagement is **Saudi-applicable** (SAR currency or Saudi jurisdiction)
- Evaluates **13 executable topics** (framework, IFRS adoption, zakat/tax, overlay)
- Produces `socpaCitations` on FS lines and zakat/tax **disclosure triggers**

## Jurisdiction Gate

SOCPA rules run when:

- `currencyCode === "SAR"`, or
- Client `reportingFramework` includes IFRS/SOCPA markers

Non-Saudi engagements: all rules **skipped** (routing-gate).

## Executable Topics

| Cluster | Topics |
| ------- | ------ |
| Framework | `framework-scope`, `fair-presentation`, `framework-disclosure` |
| IFRS adoption | `full-ifrs`, `ifrs-smes-eligibility`, `supplementary-disclosure` |
| Zakat/tax | `zakat-presentation`, `separate-disclosure`, `reconciliation`, `ias12-overlay` |
| Overlay | `overlay-principle`, `routing-gate`, `lineage-required` |

## Module

| File | Role |
| ---- | ---- |
| `socpa-rules-loader.ts` | Load SOCPA packs |
| `socpa-rule-checks.ts` | Topic evaluators + jurisdiction gate |
| `socpa-disclosure-triggers.ts` | Zakat/tax note suggestions |
| `socpa-rules-engine.ts` | Run, citations, validation append |

## Integration

```
FS Rebuild → IFRS Rules → SOCPA Rules → Validation
```

| Surface | Hook |
| ------- | ---- |
| Post-FS | `maybeRunSocpaRulesAfterFsRebuild` (after IFRS) |
| Validation | `appendSocpaValidationIssues` → `socpa_rule` |
| UI | `SocpaRulesPanel` on validation tab |

## Local Testing

```env
FF_AUDIT_SOCPA_RULES=true
FF_AUDIT_IFRS_RULES=true
```

Use SAR client / seed engagement.

## Phase 8 Handoff

Disclosure auto (`FF_AUDIT_DISCLOSURE_AUTO`) materializes SOCPA + IFRS triggers into draft notes — see [`DISCLOSURE_AUTO_ENGINE.md`](./DISCLOSURE_AUTO_ENGINE.md).

## Limitations

- Heuristic zakat/tax account detection
- Auditing standards / professional conduct packs not in runtime scope
- Triggers require disclosure-auto flag to become persisted notes
