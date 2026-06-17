#!/usr/bin/env tsx
/**
 * Phase 0 — Local AI smoke (Ollama + qwen3:8b via existing Intelligence Core stack).
 * Usage: tsx -r ./scripts/mock-server-only.cjs scripts/local-ai-phase0-smoke.ts
 *
 * Note: dotenv must load before AI module imports — orchestrator singleton reads env at construct time.
 */
import { config } from "dotenv"
import { resolve } from "path"
import { writeFileSync, mkdirSync } from "fs"

config({ path: resolve(__dirname, "../../.env") })

type CheckResult = {
  name: string
  pass: boolean
  detail: string | number | boolean | Record<string, unknown>
}

const checks: CheckResult[] = []

function record(name: string, pass: boolean, detail: CheckResult["detail"]) {
  checks.push({ name, pass, detail })
  const icon = pass ? "PASS" : "FAIL"
  console.log(`[${icon}] ${name}: ${typeof detail === "object" ? JSON.stringify(detail) : detail}`)
}

async function main() {
  const {
    LocalAIProvider,
  } = await import("../../src/lib/ai/providers/local-provider")
  const {
    selectProviderForTask,
    resolveExecutionModeFromEnv,
  } = await import("../../src/lib/ai/hybrid-router")
  const {
    selectOptimalProvider,
    getAllProviderHealth,
    getProviderObservabilitySnapshot,
  } = await import("../../src/lib/ai/provider-router")
  const { PROVIDER_FALLBACK_CHAIN } = await import(
    "../../src/lib/ai/provider-router-constants"
  )
  const { isEnabled } = await import(
    "../../src/lib/platform/feature-flags/registry"
  )
  const { runInference } = await import("../../src/lib/ai/runtime/inference-service")

  const startedAt = new Date().toISOString()
  console.log("=== Local AI Phase 0 Smoke ===")
  console.log(`startedAt: ${startedAt}`)

  const envSnapshot = {
    FF_AI_REAL_PROVIDERS: process.env.FF_AI_REAL_PROVIDERS ?? "(unset)",
    AI_MODE: process.env.AI_MODE ?? "(unset)",
    AI_LOCAL_BASE_URL: process.env.AI_LOCAL_BASE_URL ?? "(unset)",
    AI_LOCAL_MODEL: process.env.AI_LOCAL_MODEL ?? "(unset)",
  }
  console.log("env:", JSON.stringify(envSnapshot, null, 2))

  record(
    "env.FF_AI_REAL_PROVIDERS",
    process.env.FF_AI_REAL_PROVIDERS === "true",
    envSnapshot.FF_AI_REAL_PROVIDERS,
  )
  record("env.AI_MODE", process.env.AI_MODE === "hybrid", envSnapshot.AI_MODE)
  record(
    "env.AI_LOCAL_MODEL",
    process.env.AI_LOCAL_MODEL === "qwen3:8b",
    envSnapshot.AI_LOCAL_MODEL,
  )
  record(
    "flag.ai.real-providers",
    isEnabled("ai.real-providers"),
    isEnabled("ai.real-providers"),
  )

  const localProvider = new LocalAIProvider()
  const status = localProvider.getStatus()
  record("localProvider.configured", status.configured, status.modelVersion)

  const healthOk = await localProvider.isAvailable()
  record("localProvider.health(/api/tags)", healthOk, healthOk)

  const chainHasLocal = PROVIDER_FALLBACK_CHAIN.includes("local")
  record(
    "providerRouter.fallbackChainIncludesLocal",
    chainHasLocal,
    PROVIDER_FALLBACK_CHAIN.join(" → "),
  )

  const healthEntries = await getAllProviderHealth()
  const localHealth = healthEntries.find((e) => e.providerId === "local")
  record(
    "providerRouter.localInHealthSnapshot",
    Boolean(localHealth),
    localHealth ?? "missing",
  )

  const optimalLocal = await selectOptimalProvider("account_mapping", "local")
  record(
    "providerRouter.selectOptimalProvider(prefer=local)",
    optimalLocal.selected === "local",
    optimalLocal,
  )

  const obs = getProviderObservabilitySnapshot()
  record(
    "providerRouter.realProvidersEnabled",
    obs.realProvidersEnabled === true,
    { realProvidersEnabled: obs.realProvidersEnabled, chain: obs.fallbackChain },
  )

  const execMode = resolveExecutionModeFromEnv()
  record("hybridRouter.executionMode", execMode === "hybrid", execMode)

  const hybridRoute = await selectProviderForTask("account_mapping")
  record(
    "hybridRouter.selectProviderForTask(account_mapping)",
    hybridRoute === "local",
    hybridRoute,
  )

  const hybridCloudTask = await selectProviderForTask("notes_generation")
  record(
    "hybridRouter.selectProviderForTask(notes_generation)",
    hybridCloudTask === "openai",
    hybridCloudTask,
  )

  const prompt = "Reply with exactly: AQLIYA_LOCAL_OK"
  const directStart = Date.now()
  const directResponse = await localProvider.execute({
    taskType: "account_mapping",
    taskInput: { smoke: true },
    governanceContext: {
      taskType: "account_mapping",
      evidenceRequirements: [],
      humanApprovalRequired: true,
      escalationTriggers: [],
      doctrineRefs: [],
    },
    assembledPrompt: {
      layers: [],
      fullPrompt: prompt,
    },
  })
  const directLatencyMs = Date.now() - directStart
  const directText = (directResponse.output ?? "").trim()
  record(
    "localProvider.execute(direct)",
    directText.length > 0,
    {
      model: directResponse.modelVersion,
      provider: directResponse.providerId,
      latencyMs: directLatencyMs,
      preview: directText.slice(0, 120),
    },
  )

  await import("../../src/lib/ai/handlers/register-handlers")

  const orchStart = Date.now()
  const inference = await runInference({
    taskType: "account_mapping",
    taskInput: {
      accountCount: 1,
      mappedCount: 0,
      lowConfidenceCount: 0,
      unmappedCount: 1,
    },
    preferProvider: "local",
  })
  const orchLatencyMs = Date.now() - orchStart
  const orchText = (inference.response.output ?? "").trim()
  record(
    "runInference(preferProvider=local, account_mapping)",
    inference.providerId === "local" && orchText.length > 0,
    {
      providerId: inference.providerId,
      modelVersion: inference.response.modelVersion,
      runtimeMode: inference.runtimeMode,
      latencyMs: orchLatencyMs,
      preview: orchText.slice(0, 120),
    },
  )

  const allPass = checks.every((c) => c.pass)
  const artifact = {
    phase: "0",
    startedAt,
    finishedAt: new Date().toISOString(),
    pass: allPass,
    env: envSnapshot,
    routingPath:
      "runInference → aiOrchestrator.generate → resolveProvider → LocalAIProvider.execute → Ollama POST /api/chat",
    providerSelected: inference.providerId,
    modelUsed: inference.response.modelVersion ?? process.env.AI_LOCAL_MODEL,
    latencyMs: {
      directLocalProvider: directLatencyMs,
      runInference: orchLatencyMs,
    },
    checks,
  }

  const outDir = resolve(__dirname, "../../docs/audits/evidence")
  mkdirSync(outDir, { recursive: true })
  const outPath = resolve(outDir, "local-ai-phase0-smoke.json")
  writeFileSync(outPath, JSON.stringify(artifact, null, 2))
  console.log(`\nartifact: ${outPath}`)
  console.log(`overall: ${allPass ? "PASS" : "FAIL"}`)

  if (!allPass) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
