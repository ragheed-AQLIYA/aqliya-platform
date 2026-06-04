# AuditOS — Governed AI Generation (A1-09)

**Status:** Repo complete — staging live validation pending (OpenCode)  
**Entry point:** `src/lib/audit/audit-ai-bridge.ts` → `runGovernedAuditAI()`

---

## What is implemented

| Layer | Detail |
| ----- | ------ |
| Intelligence Core | `aiOrchestrator` with IC-09 routing, IC-06 budget, IC-01 RAG when flagged |
| Tenant scope | `organizationId` from `AuditEngagement` |
| Audit trail | Engagement `AuditEvent` (actions) + platform `auditos_ai_generation` log |
| Human review | All outputs remain `suggested` until accept/reject actions |
| Fallback | Deterministic handlers when `FF_AI_REAL_PROVIDERS` off or provider fails |

---

## Environment flags (staging pilot)

```bash
# Safe default — deterministic only
# FF_AI_REAL_PROVIDERS=false

# Staged activation (see ai-intelligence-activation.md)
FF_AI_REAL_PROVIDERS=true
FF_AI_BUDGET_QUOTAS=true
FF_AI_BUDGET_ALERTS=true
FF_AI_RAG=true          # requires pgvector migration on DB
OPENAI_API_KEY=...
```

---

## Covered server actions

- `generateAnalyticalReviewAction`
- `generateFindingDraftsAction`
- `generateDraftNotesAction`
- `generateEvidenceSuggestionsAction`
- `generateRecommendationDraftsAction`

---

## Commercial rules

- Do **not** label outputs as final audit opinions.
- Do **not** enable on `/auditos/*` demo routes.
- Do **not** claim production AI until live smoke log passes.

---

## Related

- `docs/operations/parallel-execution-cycle-2026-06-06-a1-09.md`
- `docs/operations/ai-intelligence-activation.md`
- `src/lib/rag/index.ts`
