# Local AI Phase 0 Report — Ollama + Qwen3:8b

**Date:** 2026-06-14  
**Status:** PASS  
**Scope:** Configuration + smoke only (no architecture changes, no tenant wiring, no TB prompt work, no RAG)

---

## Summary

Phase 0 proves the **existing** AQLIYA Intelligence Core stack successfully talks to **Ollama** at `http://localhost:11434` using **`qwen3:8b`**.

All 14 smoke checks passed. Governed inference via `runInference()` selected provider **`local`**, model **`ollama/qwen3:8b`**, runtime mode **`hybrid`**.

Evidence artifact: `docs/audits/evidence/local-ai-phase0-smoke.json`

---

## Configuration Located

| Setting | Source file | Function / symbol | Phase 0 value |
|---------|-------------|-------------------|---------------|
| `FF_AI_REAL_PROVIDERS` | `.env`, `.env.example` | `isEnabled("ai.real-providers")` in `src/lib/platform/feature-flags/registry.ts` | `true` |
| `AI_MODE` | `.env`, `.env.example` | `resolveExecutionModeFromEnv()` in `src/lib/ai/hybrid-router.ts` | `hybrid` |
| `AI_LOCAL_BASE_URL` | `.env`, `.env.example` | `LocalAIProvider` constructor in `src/lib/ai/providers/local-provider.ts` | `http://localhost:11434` |
| `AI_LOCAL_MODEL` | `.env`, `.env.example` | `LocalAIProvider` constructor | `qwen3:8b` |
| Local provider | `src/lib/ai/providers/local-provider.ts` | `execute()`, `isAvailable()`, `getStatus()` | Ollama `/api/chat`, health `/api/tags` |
| Provider router | `src/lib/ai/provider-router.ts` | `selectOptimalProvider()`, `getAllProviderHealth()` | Chain includes `local`; prefers `local` when requested |
| Hybrid router | `src/lib/ai/hybrid-router.ts` | `selectProviderForTask()`, `getHybridPolicy()` | `account_mapping` → `local`, `notes_generation` → `openai` |
| Fallback chain | `src/lib/ai/provider-router-constants.ts` | `PROVIDER_FALLBACK_CHAIN` | `openai → anthropic → local → cloud → deterministic` |
| Sovereign entry | `src/lib/ai/runtime/inference-service.ts` | `runInference()` | Delegates to `aiOrchestrator.generate()` |
| Settings UI (not used Phase 0) | `src/actions/ai-settings-actions.ts`, `src/app/(dashboard)/settings/ai/page.tsx` | TenantIntegration metadata | Out of scope |

---

## Files Inspected

| Path | Purpose |
|------|---------|
| `src/lib/ai/providers/local-provider.ts` | Ollama provider implementation |
| `src/lib/ai/hybrid-router.ts` | Task-level local/cloud routing |
| `src/lib/ai/provider-router.ts` | Fallback chain + circuit breaker |
| `src/lib/ai/provider-router-constants.ts` | `PROVIDER_FALLBACK_CHAIN` |
| `src/lib/ai/orchestrator.ts` | Provider resolution + `generate()` |
| `src/lib/ai/runtime/inference-service.ts` | `runInference()` entry point |
| `src/lib/platform/feature-flags/registry.ts` | `FF_AI_REAL_PROVIDERS` → `ai.real-providers` |
| `.env.example` | Documented AI env surface |
| `docs/architecture/LOCAL_AI_READINESS_AUDIT.md` | Prior gap analysis |
| `docs/architecture/LOCAL_AI_IMPLEMENTATION_PLAN.md` | Phase plan |

---

## Files Changed

| Path | Change |
|------|--------|
| `.env` | Set `FF_AI_REAL_PROVIDERS=true`, `AI_MODE=hybrid`, `AI_LOCAL_MODEL=qwen3:8b`, `AI_LOCAL_BASE_URL=http://localhost:11434` |
| `.env.example` | Comments for `AI_MODE` hybrid and `AI_LOCAL_MODEL` examples |
| `scripts/local-ai-phase0-smoke.ts` | **New** — Phase 0 smoke (dynamic imports after dotenv) |
| `package.json` | Added script `local-ai:smoke` |
| `docs/audits/evidence/local-ai-phase0-smoke.json` | **New** — machine-readable results |
| `docs/architecture/LOCAL_AI_PHASE0_REPORT.md` | **New** — this report |

**Not changed:** Application architecture, providers, routers, Prisma schema, tenant settings, TB prompts, RAG.

---

## Environment Variables Added / Updated

Applied to local `.env` (not committed):

```env
FF_AI_REAL_PROVIDERS=true
AI_MODE=hybrid
AI_LOCAL_BASE_URL=http://localhost:11434
AI_LOCAL_MODEL=qwen3:8b
```

---

## Test Results

**Command:** `npm run local-ai:smoke`  
**Result:** PASS (14/14 checks)  
**Duration:** ~14s wall clock (2026-06-14T12:16:06Z → 12:16:20Z)

| Check | Result |
|-------|--------|
| Env `FF_AI_REAL_PROVIDERS=true` | PASS |
| Env `AI_MODE=hybrid` | PASS |
| Env `AI_LOCAL_MODEL=qwen3:8b` | PASS |
| Flag `ai.real-providers` enabled | PASS |
| `LocalAIProvider` configured | PASS (`ollama/qwen3:8b`) |
| Health `/api/tags` | PASS |
| Provider router chain includes `local` | PASS |
| Provider router health snapshot includes `local` | PASS |
| `selectOptimalProvider(prefer=local)` | PASS → `local` |
| Hybrid mode | PASS → `hybrid` |
| `selectProviderForTask(account_mapping)` | PASS → `local` |
| `selectProviderForTask(notes_generation)` | PASS → `openai` |
| Direct `LocalAIProvider.execute()` | PASS — response `AQLIYA_LOCAL_OK` |
| `runInference(preferProvider=local)` | PASS — governed draft output |

---

## Routing Path Used

```
npm run local-ai:smoke
  → runInference({ taskType: "account_mapping", preferProvider: "local" })
    → aiOrchestrator.generate()
      → resolveProvider()  [realProviderOrder: local first]
        → LocalAIProvider.isAvailable()  [GET /api/tags]
        → LocalAIProvider.execute()        [POST /api/chat]
          → Ollama qwen3:8b
```

Hybrid routing (without explicit `preferProvider`, with `organizationId` + `FF_AI_REAL_PROVIDERS`):

```
selectProviderForTask("account_mapping") → "local"   (AI_MODE=hybrid policy)
selectProviderForTask("notes_generation") → "openai"
```

---

## Provider & Model Selected

| Metric | Value |
|--------|-------|
| **Provider** | `local` |
| **Model** | `ollama/qwen3:8b` |
| **Runtime mode** | `hybrid` |
| **Direct provider latency** | **2,458 ms** |
| **`runInference` latency** | **11,562 ms** (governed prompt + Qwen3 thinking tokens) |

Ollama model confirmed via `GET /api/tags`: `qwen3:8b` (8.2B, Q4_K_M, GPU-capable).

---

## Blockers & Notes

| Item | Severity | Notes |
|------|----------|-------|
| **None blocking Phase 0** | — | Stack works with current config |
| Orchestrator singleton + dotenv order | Low | CLI scripts must load `.env` **before** importing `aiOrchestrator`; smoke script uses dynamic import. Next.js app loads env at boot — OK in dev/prod. |
| `ollama` CLI not in PATH (Windows) | Info | HTTP API at `:11434` works; CLI optional |
| Qwen3 `thinking` tokens | Info | Adds latency on governed prompts; content still returned in `message.content` |
| Provider router health | Info | Circuit-breaker only — no live Ollama probe in router cache (orchestrator probes via `isAvailable()`) |
| Tenant settings UI | Out of scope | Phase 1 — saved URL/model not yet applied to provider instance |
| AuditOS UI end-to-end | Out of scope | Phase 0 proves IC → Ollama; AuditOS bridge not exercised in this smoke |
| Staging / CI | Out of scope | Smoke is manual dev-only; Ollama not available in CI |

---

## How to Reproduce

1. Ensure Ollama running with `qwen3:8b` at `http://localhost:11434`
2. Set env vars above in `.env`
3. Run:

```bash
npm run local-ai:smoke
```

Expected: `overall: PASS` and artifact at `docs/audits/evidence/local-ai-phase0-smoke.json`

---

## Next Step (Phase 1 — not started)

Tenant settings → runtime wiring per `LOCAL_AI_IMPLEMENTATION_PLAN.md` Phase 1.

---

## Related Documents

- `docs/architecture/LOCAL_AI_READINESS_AUDIT.md`
- `docs/architecture/LOCAL_AI_IMPLEMENTATION_PLAN.md`
- `docs/audits/evidence/local-ai-phase0-smoke.json`
