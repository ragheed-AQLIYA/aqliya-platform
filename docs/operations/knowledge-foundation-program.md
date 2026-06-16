# AQLIYA Knowledge Foundation Program

**Date:** 2026-06-09  
**Status:** Charter frozen; Sessions 0–3 in scope  
**Authority:** Strategic program decision (not implementation-status doctrine)

---

## Summary

AQLIYA Knowledge Foundation Charter v1.0 is **frozen**. The platform strategic asset is the Knowledge Foundation; AuditOS, LocalContentOS, and intelligence engines are applications built on it.

**Governing statement:** This Foundation shall always privilege authoritative professional judgment over automated inference.

---

## Repository Location

```text
knowledge-foundation/
├── charter/     AQLIYA_KNOWLEDGE_FOUNDATION_CHARTER_v1.0.md (FROZEN)
├── artifacts/   Seven canonical JSON deliverables
├── governance/  Master Prompt Pack v1, Execution Program
└── domains/     IFRS, ISA, ISQM, SOCPA (Sessions 1–3)
```

Entry point: [`knowledge-foundation/README.md`](../../knowledge-foundation/README.md)

---

## Active Execution

| Session | Scope | Status |
| ------- | ----- | ------ |
| 0 | Master Knowledge Catalog | ✅ Complete — 62 entries |
| 0.5 | Knowledge Governance Model + Admission Workflow + Priority Backlog | ✅ Complete |
| 1 | IFRS / IAS / IFRIC | ✅ Complete (32 standards, staging) |
| 2 | ISA / ISQM | ✅ Complete (16 standards, staging) |
| 3 | SOCPA | ✅ Complete (8 assets, staging) |

**Pause after Session 3.** Sessions 4–12 not authorized. RAG / Ollama / Fine-tuning not authorized.

**Reviews:**
- Session 0: [`SESSION_0_CROSS_ARTIFACT_REVIEW.md`](../../knowledge-foundation/governance/SESSION_0_CROSS_ARTIFACT_REVIEW.md) — APPROVED
- Session 0.5: [`SESSION_0.5_CROSS_ARTIFACT_REVIEW.md`](../../knowledge-foundation/governance/SESSION_0.5_CROSS_ARTIFACT_REVIEW.md) — APPROVED
- Session 1: [`SESSION_1_PROGRESS.md`](../../knowledge-foundation/governance/SESSION_1_PROGRESS.md) — ✅ Complete
- Session 2: [`SESSION_2_PROGRESS.md`](../../knowledge-foundation/governance/SESSION_2_PROGRESS.md) — ✅ Complete
- Session 3: [`SESSION_3_PROGRESS.md`](../../knowledge-foundation/governance/SESSION_3_PROGRESS.md) — ✅ Complete
- **Pause:** [`SESSIONS_1-3_COMPLETION.md`](../../knowledge-foundation/governance/SESSIONS_1-3_COMPLETION.md)
- Remediation: [`SESSION_1_REMEDIATION_REPORT.md`](../../knowledge-foundation/governance/SESSION_1_REMEDIATION_REPORT.md) — PASS, Wave 2 blocked

---

## Relationship to Code

- Governed Knowledge API: `docs/operations/ai-platform/KNOWLEDGE_API_STATUS.md`
- Runtime ingest requires charter-compliant metadata (`FF_AI_RAG`)
- Foundation JSON artifacts are source-of-truth for admission rules; code must conform

---

## Amendment

Charter changes require ADR or v1.1 release only. See `knowledge-foundation/charter/FREEZE_NOTICE.md`.
