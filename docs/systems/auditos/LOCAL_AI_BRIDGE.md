# Local AI Bridge — AuditOS 2.0 Phase 1

**Status:** Partial — bridge wired; local runtime not a standalone factory product  
**Scope:** Shared Intelligence Core entry point for AuditOS assistive AI

## Purpose

Phase 1 establishes a **single governed inference entry** for AuditOS instead of calling `aiOrchestrator` directly from product code. This enables runtime mode policy (cloud / hybrid / air-gapped) without rewriting each AI feature.

Trust principle: **AI assists. Humans decide. Evidence governs.**

## What Is Implemented

| Component | Path | Role |
| --------- | ---- | ---- |
| Inference service | `src/lib/ai/runtime/inference-service.ts` | `runInference()` — resolves `AI_RUNTIME_MODE`, delegates to orchestrator |
| Audit AI bridge | `src/lib/audit/audit-ai-bridge.ts` | Tenant-scoped context, RAG query, platform audit log |
| Intelligence engine | `src/lib/audit/intelligence/` | Phase 9 consumer via `runGovernedAuditAI()` |
| Validation analytical review | `src/actions/audit-actions.ts` | Uses bridge path where migrated |

### Runtime modes (`AI_RUNTIME_MODE` / `AI_MODE`)

| Mode | Behavior |
| ---- | -------- |
| `cloud` (default) | Cloud providers via orchestrator routing |
| `hybrid` | Hybrid router prefers local when configured |
| `air_gapped` / `local` / `sovereign` | Local-first policy label (orchestrator still governs provider selection) |

Local endpoint defaults (`.env.example`):

```env
AI_LOCAL_BASE_URL=http://localhost:11434
AI_LOCAL_MODEL=llama3
```

Platform flags (not factory-specific):

```env
FF_AI_REAL_PROVIDERS=false
FF_AI_RAG=false
```

## What Is NOT Implemented

- Dedicated `FF_AUDIT_LOCAL_AI` factory flag (uses platform AI flags + runtime mode)
- On-prem / air-gapped **production package** (strategic direction only)
- GPU local inference registry or model governance UI
- Autonomous AI approval or export

Do **not** claim local/private AI runtime is production-ready unless deployment proves it.

## Integration Flow

```
AuditOS UI / Server Action
  → runGovernedAuditAI() / runInference()
    → aiOrchestrator.generate()
      → provider router (openai | anthropic | local | deterministic)
  → AuditAiOutput + platform audit log
  → human review required
```

## Local Testing

1. Set `FF_AI_REAL_PROVIDERS=true` and provider keys **only in dev** (never commit secrets).
2. Optional: run Ollama at `AI_LOCAL_BASE_URL`, set `AI_RUNTIME_MODE=hybrid`.
3. Enable `FF_AUDIT_INTELLIGENCE=true` for notes enrichment smoke.
4. Run unit tests: `npm test -- src/lib/audit/__tests__/audit-ai-bridge.test.ts`

## Phase 1 Completion Criteria (Remaining)

| Criterion | Status |
| --------- | ------ |
| Single `runInference()` entry for AuditOS | ✅ |
| Platform audit log on AI generation | ✅ |
| Runtime mode surfaced in inference result | ✅ |
| All AuditOS AI call sites migrated off direct orchestrator | ⚠️ Partial |
| Operator doc (this file) | ✅ |
| Staging proof with local Ollama | ❌ Not validated in repo |

## Related Documents

- [`AUDIT_INTELLIGENCE.md`](./AUDIT_INTELLIGENCE.md) — Phase 9 consumer
- [`docs/architecture/ADR-001-AI-RUNTIME-STRATEGY.md`](../../architecture/ADR-001-AI-RUNTIME-STRATEGY.md)
- [`FACTORY_PROGRAM_CLOSURE.md`](./FACTORY_PROGRAM_CLOSURE.md)
