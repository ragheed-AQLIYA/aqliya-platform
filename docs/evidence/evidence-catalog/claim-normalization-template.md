# Claim Normalization Template — P2

> **Part of:** Sprint v2 — P2: Claim Normalization & Extraction  
> **Date:** 2026-06-29

Every Claim must pass through this pipeline before registry entry:

```
Raw Statement → Normalized Claim → Type → Origin → Completeness Check → Registry
```

## Template

```text
CLM-ID:      CLM-{AREA}-{NNNN}
Version:     1.0
Hash:        SHA256(KABCE)
Type:        Implementation | Architecture | Governance | Product | Commercial | Strategic | Operational | Documentation
Origin:      Document | Observation | Code Inspection | Governance Decision | Manual Review | Imported

Claim Text:  [Normalized, single-fact statement]

Dimension:   Implementation Reality | Product Maturity | Commercial Claim | Strategic Intent

KnowledgeArea: KA-XXX
Product:       PROD-XXX
Authorities:   [AUTH-XXX]
Evidence Refs: [EV-NNNN, ...]
CurrentDecision: [DEC-YYYY-NNNN or empty]

Confidence:  High | Medium | Low
Freshness:
  Evidence Date:     YYYY-MM-DD
  Verification Date: YYYY-MM-DD
  Reviewer:          OpenCode
  Expires:           YYYY-MM-DD

SourceDocument: [path to source]

Completeness: [X]% — calculated from (ID + Type + Origin + Authority + Evidence + Confidence + Freshness + Hash + Version) / 10
```

## Completeness Weighting

| Field | Weight | Required? |
|-------|--------|-----------|
| CLM-ID | 10% | ✅ Required |
| Type | 10% | ✅ Required |
| Origin | 10% | ✅ Required |
| Authority (≥1) | 10% | ✅ Required |
| Evidence (≥1) | 10% | ✅ Required |
| Confidence | 10% | ✅ Required |
| Freshness | 10% | ✅ Required |
| Dimension | 10% | ✅ Required |
| Hash | 10% | Recommended |
| Version | 10% | Recommended |

**≥80%**: May enter Manifest  
**100%**: May enter Governance Review Brief
