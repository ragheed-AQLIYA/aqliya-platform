# Local Content Domain

**Authority:** LCGPA (Level A)  
**Status:** Session 4 ingested (staging)  
**Jurisdiction:** Saudi Arabia

## Assets

| Slug | Catalog ID | Type | Status |
| ---- | ---------- | ---- | ------ |
| `lcgpa/` | `kf-lc-lcgpa-rules` | A (12 rules) | ingestion-staging |
| `verification-matrix/` | `kf-lc-verification-matrix` | D (8 procedures) | ingestion-staging |

## Build

```bash
node knowledge-foundation/domains/local-content/_build-session-4.mjs
```

## Governance

- Production admission requires KNOWLEDGE_REVIEWER approval
- LC conclusions require human review — no autonomous regulatory submission
- RAG / Vector DB blocked until separate Foundation adoption gate
- Verification matrix sourced from `Local_Content_Verification_Audit_Matrix_v1.xlsx`

See [`../../governance/SESSION_4_PROGRESS.md`](../../governance/SESSION_4_PROGRESS.md).
