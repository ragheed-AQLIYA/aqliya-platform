# Phase 3D — Governed Firm Memory

**Status:** Approved (P1)  
**Date:** 2026-06-14  
**Builds on:** Phase 3C Firm Memory Engine  
**Deferred:** Fine-tuning, RAG, embeddings, Knowledge Graph, Local AI tuning

---

## Strategic Context

After Phases 3A–3C, three product conclusions are locked:

| Conclusion | Evidence |
|------------|----------|
| **AuditOS Factory works** | Shalfa Factory Accuracy 94% |
| **Local AI ≠ core classifier** | 85% synthetic / 20.4% real Shalfa |
| **Firm Memory = proven moat** | 100% same-ERP reuse |

The asset is now:

```text
Audit Factory + Audit Memory
```

What was missing: **Memory Governance** (trust, approval, aging, versioning).

---

## Governance Model

Each `TBMappingPattern` has lifecycle status:

| Status | Meaning |
|--------|---------|
| `DRAFT` | No confirmations yet |
| `CONFIRMED` | Human confirmed ≥1 time |
| `TRUSTED` | Meets trust policy — high-confidence auto-suggest allowed |
| `DEPRECATED` | Retired — excluded from lookup |

### Trust Policy (TRUSTED)

All must be true:

```text
hitCount >= 5
AND distinct reviewers >= 2
AND lastConfirmed or lastUsed within 12 months
```

Only `TRUSTED` + confidence ≥ 0.85 → **high-confidence auto-suggest**.

`CONFIRMED` patterns still **suggest** on TB upload (memory match) but require human review — no trusted auto-suggest tier.

---

## Schema Fields (Phase 3D)

On `TBMappingPattern`:

- `status` — `TBMappingPatternStatus` enum
- `lastConfirmedAt`, `confirmedReviewerIds` (JSON array)
- `auditClientId`, `erpChartKey` — client/ERP scope
- `memoryVersion` — increments on each re-confirm
- `deprecatedAt`, `deprecatedReason`

Migration: `prisma/migrations/20260614150000_firm_memory_governance/`

---

## Code

| Module | Role |
|--------|------|
| `firm-memory-governance.ts` | Pure trust evaluation |
| `firm-memory-engine.ts` | Write/read with governance |
| `ClassificationResult.memoryGovernance` | UI/API trust metadata (Phase 4) |

Functions:

- `evaluateMemoryGovernance()` — compute status + trust
- `recordAuditFirmMemoryFromConfirmation()` — writes reviewers, status, client context
- `deprecateFirmMemoryPattern()` — manual retirement
- `isFirmMemoryAutoSuggestEligible()` — requires `TRUSTED`

---

## Pipeline (unchanged order)

```text
Firm Memory (governed)
  ↓ miss / CONFIRMED-only suggest
ERP Rules (Map1, prefix)
  ↓
Pattern → Local AI → Cloud
  ↓
Human Review (mandatory confirm)
  ↓
Memory Write + governance update
```

---

## Priority Stack (Product)

| Priority | Work |
|----------|------|
| **P1** | Memory Governance (3D) — this document |
| **P2** | Phase 4 UI — show source + evidence on mapping page |
| **P3** | Production rollout — client 2, 3; measure reuse rate |
| **P4** | Re-evaluate Local AI after 3–5 clients |

---

## Explicitly Not Building

- Prefix/Map2 refinement (3B.4)
- Hold-out → 70% research program
- Vector DB, RAG, fine-tuning, agent swarms for classification

---

## Trust Principle

> AI assists. Humans decide. Evidence governs.

Even `TRUSTED` memory produces **pending** suggestions until reviewer confirms.

---

## Related

- `docs/architecture/PHASE_3C_FIRM_MEMORY_ENGINE.md`
- `docs/architecture/PHASE_3C_FIRM_MEMORY_VALIDATION.md`
- `src/lib/tb-intelligence/__tests__/firm-memory-governance.test.ts`
