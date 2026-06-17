// ─── LocalContentOS — Local AI Health Service ───
// Phase 0: Mandatory health check before any AI feature runs.
// Verifies ollama runtime, model availability, provider routing,
// and end-to-end generation capability.
// Never throws — always returns a structured HealthReport.

import "server-only";

import { prisma } from "@/lib/prisma";
import { aiOrchestrator } from "@/lib/ai/orchestrator";
import { runGovernedProductAI } from "@/lib/platform/product-ai-bridge";

// ─── Types ───

export interface AiHealthReport {
  /** Overall health: true only if all critical checks pass */
  healthy: boolean;
  /** ISO timestamp of the check */
  checkedAt: string;
  /** Per-component status */
  components: AiComponentStatus[];
  /** Suggested action if unhealthy */
  recommendation: string;
}

export interface AiComponentStatus {
  name: string;
  status: "ok" | "warning" | "error";
  detail: string;
  /** Optional: measured latency in ms */
  latencyMs?: number;
}

// ─── Helpers ───

const OLLAMA_BASE_URL =
  process.env.AI_LOCAL_BASE_URL ?? "http://localhost:11434";
const EXPECTED_GENERATION_MODEL =
  process.env.AI_LOCAL_MODEL ?? "qwen3:8b";
const EXPECTED_EMBEDDING_MODEL = "nomic-embed-text";
const LOG_PREFIX = "[LocalContentAIHealth]";

// ─── Public API ───

/**
 * Run a full health check on the local AI stack.
 * Lightweight — safe to call on every AI Advisor page load.
 */
export async function checkAiHealth(): Promise<AiHealthReport> {
  const startedAt = Date.now();
  const components: AiComponentStatus[] = [];
  let healthy = true;

  // 1. Ollama process reachable
  const ollamaStatus = await checkOllamaReachable();
  components.push(ollamaStatus);
  if (ollamaStatus.status !== "ok") healthy = false;

  // 2. Expected generation model exists (qwen3:8b)
  const genModelStatus = await checkModelExists(EXPECTED_GENERATION_MODEL);
  components.push(genModelStatus);
  if (genModelStatus.status !== "ok") healthy = false;

  // 3. Expected embedding model exists (nomic-embed-text)
  const embModelStatus = await checkModelExists(EXPECTED_EMBEDDING_MODEL);
  components.push(embModelStatus);
  if (embModelStatus.status !== "ok") healthy = false;

  // 4. Provider Router — local provider configured
  const providerStatus = checkLocalProviderConfigured();
  components.push(providerStatus);
  if (providerStatus.status !== "ok") healthy = false;

  // 5. Orchestrator — can enumerate providers
  const orchestratorStatus = checkOrchestratorStatus();
  components.push(orchestratorStatus);
  if (orchestratorStatus.status !== "ok") healthy = false;

  // 6. Quick generation test (only if all critical checks pass)
  if (healthy && shouldRunGenerationTest()) {
    const genTestStatus = await checkGenerationCapability();
    components.push(genTestStatus);
    if (genTestStatus.status !== "ok") healthy = false;
  }

  const totalMs = Date.now() - startedAt;

  // Build recommendation
  let recommendation = "كل الأنظمة تعمل بشكل طبيعي ✅";
  if (!healthy) {
    const errors = components
      .filter((c) => c.status === "error")
      .map((c) => c.detail);
    recommendation = `حالة صحية غير جيدة: ${errors.join("; ")}`;
  }

  console.info(LOG_PREFIX, "health check complete", {
    healthy,
    durationMs: totalMs,
    componentCount: components.length,
  });

  return {
    healthy,
    checkedAt: new Date().toISOString(),
    components,
    recommendation,
  };
}

// ─── Internal Checks ───

async function checkOllamaReachable(): Promise<AiComponentStatus> {
  const name = "Ollama Runtime";
  try {
    const start = Date.now();
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    });
    const latencyMs = Date.now() - start;
    if (!res.ok) {
      return {
        name,
        status: "error",
        detail: `Ollama at ${OLLAMA_BASE_URL} returned ${res.status}`,
        latencyMs,
      };
    }
    const body = await res.json();
    const modelCount = body.models?.length ?? 0;
    return {
      name,
      status: "ok",
      detail: `Ollama reachable at ${OLLAMA_BASE_URL} — ${modelCount} model(s) installed`,
      latencyMs,
    };
  } catch (err) {
    return {
      name,
      status: "error",
      detail: `Cannot reach Ollama at ${OLLAMA_BASE_URL}: ${err instanceof Error ? err.message : "unknown"}`,
    };
  }
}

async function checkModelExists(model: string): Promise<AiComponentStatus> {
  const name = `Model: ${model}`;
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      return { name, status: "error", detail: `Cannot list models: ${res.status}` };
    }
    const body = await res.json();
    const models = body.models ?? [];
    const found = models.some(
      (m: { name?: string }) =>
        m.name?.startsWith(model) || m.name === model,
    );
    if (found) {
      return { name, status: "ok", detail: `Model '${model}' is installed and available` };
    }
    return {
      name,
      status: "error",
      detail: `Model '${model}' not found. Run: ollama pull ${model}`,
    };
  } catch (err) {
    return {
      name,
      status: "error",
      detail: `Failed to check model '${model}': ${err instanceof Error ? err.message : "unknown"}`,
    };
  }
}

function checkLocalProviderConfigured(): AiComponentStatus {
  const name = "Local AI Provider";
  const baseUrl = process.env.AI_LOCAL_BASE_URL;
  const model = process.env.AI_LOCAL_MODEL;

  if (!baseUrl) {
    return {
      name,
      status: "warning",
      detail: "AI_LOCAL_BASE_URL not set — defaults to http://localhost:11434",
    };
  }
  if (!model) {
    return {
      name,
      status: "warning",
      detail: "AI_LOCAL_MODEL not set — defaults to llama3",
    };
  }
  return {
    name,
    status: "ok",
    detail: `Local provider configured: ${baseUrl} / ${model}`,
  };
}

function checkOrchestratorStatus(): AiComponentStatus {
  const name = "AI Orchestrator";
  try {
    const status = aiOrchestrator.getAllStatus();
    const providerCount = Object.keys(status).length;
    const configured = Object.values(status).filter((s) => s.configured).length;
    return {
      name,
      status: configured > 0 ? "ok" : "warning",
      detail: `Orchestrator loaded — ${configured}/${providerCount} providers configured`,
    };
  } catch (err) {
    return {
      name,
      status: "error",
      detail: `Orchestrator error: ${err instanceof Error ? err.message : "unknown"}`,
    };
  }
}

/** Only run generation test if we're not in test mode and not forbidden */
const GENERATION_TEST_RATE_LIMIT_KEY = "ai_health_gen_test";
const lastTestRun = new Map<string, number>();

function shouldRunGenerationTest(): boolean {
  if (process.env.NODE_ENV === "test") return false;
  const last = lastTestRun.get(GENERATION_TEST_RATE_LIMIT_KEY) ?? 0;
  const now = Date.now();
  // Only run once per 60 seconds per process
  if (now - last < 60_000) return false;
  lastTestRun.set(GENERATION_TEST_RATE_LIMIT_KEY, now);
  return true;
}

async function checkGenerationCapability(): Promise<AiComponentStatus> {
  const name = "AI Generation (quick test)";
  const start = Date.now();
  try {
    // Simple direct ollama test to avoid audit log spam
    const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        model: EXPECTED_GENERATION_MODEL,
        prompt: "Say exactly: OK",
        stream: false,
        options: { temperature: 0 },
      }),
    });

    const latencyMs = Date.now() - start;
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        name,
        status: "warning",
        detail: `Gen test returned ${res.status}: ${text.slice(0, 200)}`,
        latencyMs,
      };
    }

    const data = await res.json();
    const output = data.response ?? "";
    if (!output.trim()) {
      return {
        name,
        status: "warning",
        detail: "Generation test returned empty output",
        latencyMs,
      };
    }

    return {
      name,
      status: "ok",
      detail: `Generation successful (${output.length} chars)`,
      latencyMs,
    };
  } catch (err) {
    const latencyMs = Date.now() - start;
    return {
      name,
      status: "warning",
      detail: `Generation test failed: ${err instanceof Error ? err.message : "unknown"}`,
      latencyMs,
    };
  }
}

// ─── Governing Health Decision ───

/**
 * Whether AI features should be available.
 * Returns true only if all critical components are healthy.
 */
export async function isAiHealthy(): Promise<boolean> {
  if (process.env.NODE_ENV === "test") return true;
  try {
    const report = await checkAiHealth();
    return report.healthy;
  } catch {
    return false;
  }
}
