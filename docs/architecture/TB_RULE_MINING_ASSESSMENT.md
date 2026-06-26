# TB Rule Mining Assessment — Synonym Recommendation Feasibility

**Date:** 2026-06-21  
**Status:** Architecture proposal (no automatic implementation)  
**Scope:** Whether repeated TB corrections can safely generate `synonyms.ts` recommendations

---

## Executive Summary

Repeated manual corrections **can** produce **candidate synonym rules**, but they must **never** auto-merge into `synonyms.ts`. A governed **human approval workflow** is required.

Deterministic rules (`synonyms.ts`, ERP JSON) remain the benchmarked engine — this assessment covers a **parallel recommendation pipeline** only.

---

## Signal Sources

| Source | Signal | Quality |
|--------|--------|---------|
| `TBMappingFeedback` (`wasAccepted=false`) | Rejected suggestion → accepted canonical | High — explicit human override |
| `TBMappingPattern` | Stable GL → canonical mapping | High — org-specific, not global synonym |
| `TBClassificationHistory` | Rule misses before correction | Medium — needs clustering |
| Offline `erp-intelligence-mining.ts` | Train-set co-occurrence | Medium — batch only |

---

## Proposed Architecture

```text
TBMappingFeedback (rejections)
        ↓
  Correction Aggregator (batch job)
        ↓
  Synonym Candidate Generator
        ↓
  Governance Review Queue
        ↓
  Human Approver (admin/operator)
        ↓
  PR to synonyms.ts + ERP JSON (manual merge)
```

### Components (future)

1. **`scripts/audit/tb-synonym-candidate-miner.mjs`** — weekly batch; clusters Arabic name fingerprints with divergent rule vs human canonical.
2. **`SynonymCandidate` store** — file-based JSON queue under `knowledge/tb-intelligence/candidates/` (no runtime schema change in v1).
3. **`/settings/tb-intelligence/review`** — UI to approve/reject candidates (future).
4. **Export format** — TypeScript snippet matching `COA_SYNONYM_RULES` entry shape for copy-paste or PR.

---

## Governance Controls

| Control | Requirement |
|---------|-------------|
| Minimum occurrences | ≥3 distinct rejections with same Arabic fingerprint |
| Cross-reviewer | ≥2 distinct `reviewerId` for promotion |
| Confidence cap | Candidate rules start at `confidence: 0.85`, never ≥0.99 until re-validated on holdout |
| Org isolation | Candidates tagged `organizationId`; global promotion requires platform admin |
| Negative guard | If candidate would override existing rule with higher hit count, block auto-suggest |
| Audit trail | Every approval logged to `AuditEvent` + candidate file version |
| Rollback | Deprecate via `deprecateFirmMemoryPattern` + revert synonym PR |

---

## Approval Workflow

1. Batch job emits candidate JSON with evidence bundle (account codes, names, reject counts).
2. Operator reviews in Arabic-first UI with side-by-side: rule prediction vs human canonical.
3. Approver exports TS snippet; **does not** hot-reload runtime.
4. Engineering merges via PR; runs `phase-3b:rebenchmark` on Shalfa holdout.
5. Promotion only if holdout accuracy **non-regressing**.

---

## Risks

| Risk | Mitigation |
|------|------------|
| Overfitting one client ERP | Org-scoped candidates; global rules need multi-org evidence |
| Arabic normalization drift | Reuse `normaliseAccountText` / `buildNameFingerprint` |
| Conflicting synonyms | Lexicographic tie-break + human review |
| Bypassing firm memory | Synonyms are global; firm memory remains org-first in pipeline |

---

## Recommendation

**Feasible with human approval.** Do not implement runtime auto-generation in this program. Next step: batch candidate miner (read-only output) + review queue UI in a future sprint.

---

## Relation to Firm Memory Completion

Firm memory (GL-code keyed) closes the loop **immediately** for same-account reuse. Rule mining closes the loop for **similar-name, different-GL** cases — complementary, not redundant.
