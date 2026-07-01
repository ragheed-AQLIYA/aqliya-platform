# Verification — Local AI Findings

**Verification date:** 2026-06-17 02:30:08 +03:00

---

## CLAIM: `npm run local-ai:smoke` PASS

**Command:** `npm run local-ai:smoke`  
**Exit code:** `0`  
**Overall:** `PASS`

### Raw output (excerpt)

```
env: {
  "FF_AI_REAL_PROVIDERS": "true",
  "AI_MODE": "hybrid",
  "AI_LOCAL_BASE_URL": "http://localhost:11434",
  "AI_LOCAL_MODEL": "qwen3:8b"
}
[PASS] localProvider.health(/api/tags): true
[PASS] localProvider.execute(direct): {"model":"ollama/qwen3:8b","provider":"local","latencyMs":9672}
[PASS] runInference(preferProvider=local): {"providerId":"local","modelVersion":"ollama/qwen3:8b"}
overall: PASS
```

| Sub-claim | Verified |
|-----------|----------|
| Smoke PASS | ✅ |
| Ollama reachable | ✅ `/api/tags` health true |
| qwen3:8b active | ✅ model string in output |
| Hybrid routing works | ✅ account_mapping→local, notes_generation→openai |

**VERDICT:** **CONFIRMED**

---

## CLAIM: Local AI "not L0" / implementation exists

### Code evidence — working provider

```1:6:src/lib/ai/providers/local-provider.ts
// LocalAIProvider — Ollama REST /api/chat (ADR-001 Cycle 2)
export class LocalAIProvider implements AIProvider {
```

Registered in orchestrator:

```97:97:src/lib/ai/orchestrator.ts
    this.providers.set('local', new LocalAIProvider(config.localConfig))
```

Unit test exists: `src/lib/ai/providers/__tests__/local-provider.test.ts`

**VERDICT:** **CONFIRMED** — not L0; real HTTP implementation

---

## CLAIM: Local AI docs outdated

### Doc statement — `src/lib/ai/README.md:50`

```
| **LocalAIProvider** | Not implemented | IC-10 future |
```

Also line 77: `local-provider.ts | Local AI stub (Phase 4)`

### Code reality

- Full Ollama client with `/api/chat`, health check, smoke PASS

**VERDICT:** **CONFIRMED** — documentation contradicts code

---

## Side effect observed (not in original audit scope)

```
prisma:error Invalid `prisma.platformAuditLog.create()` invocation
[PlatformAuditLog] Write failed
```

Smoke still exits 0 — audit log write failure is **non-fatal** to smoke.  
Indicates **DB unavailable or schema mismatch at runtime** — separate from AI provider function.

---

## What works vs mocked (verified)

| Component | Status | Evidence |
|-----------|--------|----------|
| Ollama inference | **REAL** | Smoke execute PASS |
| Hybrid router | **REAL** | Task routing PASS |
| Provider fallback chain | **REAL** | Logged in smoke |
| Default production AI | **Deterministic** | `FF_AI_REAL_PROVIDERS` off by default (smoke forces true) |
| Embeddings default | **MOCK** | Not exercised in smoke — UNVERIFIED this run |
| Office AI | **Deterministic** | Not exercised — UNVERIFIED this run |
| Production-ready local AI | **PARTIAL** | Requires operator Ollama + env flags |

**Raw log:** `verification-local-ai-output.txt`
