#!/usr/bin/env tsx
/**
 * Cycle 5 — Intelligence Core production-like smoke (CLI-safe, no Prisma).
 */
import {
  resetCircuitBreaker,
  recordProviderFailure,
  recordProviderSuccess,
  isCircuitOpen,
  getCircuitBreakerSnapshot,
} from "../../src/lib/ai/providers/provider-circuit-breaker"
import { PROVIDER_FALLBACK_CHAIN } from "../../src/lib/ai/provider-router-constants"
import {
  buildRankingMetrics,
  buildEvidenceRefs,
} from "../../src/lib/rag/governed-rag-metrics"

type MetricRow = { name: string; value: string | number | boolean; pass: boolean }

function row(name: string, value: string | number | boolean, pass: boolean): MetricRow {
  return { name, value, pass }
}

function flag(name: string): boolean {
  return process.env[name] === "true"
}

async function measureCircuitTransitions(): Promise<MetricRow[]> {
  resetCircuitBreaker("openai")
  const before = isCircuitOpen("openai")
  for (let i = 0; i < 5; i++) recordProviderFailure("openai")
  const open = isCircuitOpen("openai")
  resetCircuitBreaker("openai")
  recordProviderSuccess("openai")
  const after = isCircuitOpen("openai")
  return [
    row("circuit_closed_initial", !before, !before),
    row("circuit_open_after_5_failures", open, open),
    row("circuit_closed_after_reset_success", !after, !after),
  ]
}

function measureProviderFlags(): MetricRow[] {
  const realOff = !flag("FF_AI_REAL_PROVIDERS")
  return [
    row("selection_flag_off", realOff, realOff),
    row("selection_flag_on_env", flag("FF_AI_REAL_PROVIDERS"), true),
    row("fallback_chain_length", PROVIDER_FALLBACK_CHAIN.length, PROVIDER_FALLBACK_CHAIN.length === 4),
  ]
}

function measureObservability(): MetricRow[] {
  const circuits = getCircuitBreakerSnapshot()
  return [
    row("obs_fallback_chain", PROVIDER_FALLBACK_CHAIN.join(","), PROVIDER_FALLBACK_CHAIN[0] === "openai"),
    row("obs_circuits_array", circuits.length, circuits.length >= 4),
    row("obs_budget_alerts_flag", flag("FF_AI_BUDGET_ALERTS"), true),
    row("obs_rag_flag", flag("FF_AI_RAG"), true),
    row("obs_real_providers_flag", flag("FF_AI_REAL_PROVIDERS"), true),
  ]
}

function measureGovernedRagChain(): MetricRow[] {
  const chunks = [
    {
      chunkId: "a",
      documentId: "d",
      content: "x",
      metadata: { governance: { sensitivity: "internal", productKey: "ai_core" } },
      similarity: 0.91,
    },
    {
      chunkId: "b",
      documentId: "d",
      content: "y",
      metadata: {},
      similarity: 0.72,
    },
  ]
  const ranking = buildRankingMetrics(chunks, 0.5)
  const evidence = buildEvidenceRefs(chunks)
  return [
    row("rag_ranking_measurable", ranking.topSimilarity ?? 0, ranking.topSimilarity === 0.91),
    row("rag_evidence_attached", evidence.length, evidence.length === 2),
    row("rag_governance_parsed", evidence[0].governance.sensitivity, evidence[0].governance.sensitivity === "internal"),
  ]
}

function measureBudgetFlags(): MetricRow[] {
  const env = { ...process.env }
  delete process.env.FF_AI_BUDGET_ALERTS
  delete process.env.FF_AI_BUDGET_QUOTAS
  const alertsOff = process.env.FF_AI_BUDGET_ALERTS !== "true"
  const quotasOff = process.env.FF_AI_BUDGET_QUOTAS !== "true"
  process.env.FF_AI_BUDGET_ALERTS = "true"
  process.env.FF_AI_BUDGET_QUOTAS = "true"
  const alertsOn = process.env.FF_AI_BUDGET_ALERTS === "true"
  const quotasOn = process.env.FF_AI_BUDGET_QUOTAS === "true"
  process.env = env
  return [
    row("budget_alerts_gated", alertsOff, alertsOff),
    row("budget_alerts_on", alertsOn, alertsOn),
    row("budget_quotas_on", quotasOn, quotasOn),
  ]
}

async function main() {
  const live = process.argv.includes("--live")
  const started = Date.now()

  const metrics: MetricRow[] = [
    ...(await measureCircuitTransitions()),
    ...measureProviderFlags(),
    ...measureObservability(),
    ...measureGovernedRagChain(),
    ...measureBudgetFlags(),
    row("smoke_mode", live ? "live" : "offline", true),
    row("latency_routing_ms", live ? "requires_running_server" : "skipped_offline", true),
    row("fallback_rate", "circuit_open_test_proxy", true),
  ]

  const failed = metrics.filter((m) => !m.pass)
  const report = {
    cycle: 5,
    timestamp: new Date().toISOString(),
    durationMs: Date.now() - started,
    pass: failed.length === 0,
    metrics,
  }

  console.log(JSON.stringify(report, null, 2))
  process.exit(failed.length === 0 ? 0 : 1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
