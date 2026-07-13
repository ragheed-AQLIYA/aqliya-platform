/**
 * AEOS Platform Core — AI Layer
 *
 * Dedicated AI governance layer. NOT embedded in agents.
 * Provides AI capability as a platform service that all agents consume.
 *
 * Architecture:
 *   AI Provider → Model → Policy → Prompt → Evaluation → Cost → Observability → Memory
 *
 * This aligns with AQLIYA's role as an AI-governed platform.
 * The AI layer is a CROSS-CUTTING concern, not a single agent.
 *
 * @module core/ai-layer
 * @version 1.0.0
 */

import { emit } from "../kernel/event-engine.mjs";

// ═══════════════════════════════════════════════════════════
// AI Provider Registry
// ═══════════════════════════════════════════════════════════

/** @type {Map<string, object>} */
const providers = new Map();

/**
 * Register an AI provider.
 * @param {string} id - e.g., "openai", "anthropic", "local-ollama"
 * @param {object} config
 * @param {string} config.name
 * @param {string} config.type - "cloud" | "local" | "hybrid"
 * @param {string[]} config.models - Available model IDs
 * @param {number} config.costPer1kTokens - USD
 */
export function registerProvider(id, config) {
  providers.set(id, { id, ...config, status: "active", registeredAt: new Date().toISOString() });
  emit("ai.provider_registered", { providerId: id }, { source: "ai-layer" });
  return providers.get(id);
}

export function getProvider(id) { return providers.get(id) || null; }
export function listProviders() { return [...providers.values()]; }

// ═══════════════════════════════════════════════════════════
// Model Registry
// ═══════════════════════════════════════════════════════════

/** @type {Map<string, object>} */
const models = new Map();

/**
 * Register a model under a provider.
 * @param {string} id
 * @param {string} providerId
 * @param {object} config
 * @param {string} config.name
 * @param {string} config.capability - "text" | "code" | "vision" | "embedding"
 * @param {number} config.contextWindow
 * @param {number} config.costPer1kTokens
 * @param {number} config.latencyBaselineMs
 */
export function registerModel(id, providerId, config) {
  if (!providers.has(providerId)) throw new Error(`Provider not found: ${providerId}`);
  models.set(id, { id, providerId, ...config, status: "active", registeredAt: new Date().toISOString() });
  emit("ai.model_registered", { modelId: id, providerId }, { source: "ai-layer" });
  return models.get(id);
}

export function getModel(id) { return models.get(id) || null; }
export function listModels(providerId) {
  return [...models.values()].filter((m) => !providerId || m.providerId === providerId);
}

// ═══════════════════════════════════════════════════════════
// Prompt Registry
// ═══════════════════════════════════════════════════════════

/** @type {Map<string, object>} */
const prompts = new Map();

/**
 * Register a prompt template.
 * @param {string} id
 * @param {object} config
 * @param {string} config.name
 * @param {string} config.template - Prompt template with {{variables}}
 * @param {string[]} config.variables
 * @param {string} config.category - "code_review" | "architecture" | "security" | "testing" | "documentation"
 * @param {string[]} config.recommendedModels
 */
export function registerPrompt(id, config) {
  prompts.set(id, { id, ...config, version: "1.0", registeredAt: new Date().toISOString() });
  emit("ai.prompt_registered", { promptId: id, category: config.category }, { source: "ai-layer" });
  return prompts.get(id);
}

export function getPrompt(id) { return prompts.get(id) || null; }

/**
 * Render a prompt with variables.
 * @param {string} promptId
 * @param {Record<string, string>} variables
 * @returns {string}
 */
export function renderPrompt(promptId, variables = {}) {
  const prompt = prompts.get(promptId);
  if (!prompt) throw new Error(`Prompt not found: ${promptId}`);

  let rendered = prompt.template;
  for (const [key, value] of Object.entries(variables)) {
    rendered = rendered.replace(new RegExp(`{{${key}}}`, "g"), value);
  }
  return rendered;
}

// ═══════════════════════════════════════════════════════════
// Evaluation Registry
// ═══════════════════════════════════════════════════════════

/** @type {Array<object>} */
const evaluations = [];

/**
 * Record an AI evaluation.
 * @param {object} eval_
 * @param {string} eval_.promptId
 * @param {string} eval_.modelId
 * @param {number} eval_.qualityScore - 0-100
 * @param {number} eval_.latencyMs
 * @param {number} eval_.costUsd
 * @param {boolean} eval_.hallucinationDetected
 * @param {string} [eval_.humanReviewOutcome]
 */
export function recordEvaluation(eval_) {
  const entry = { ...eval_, timestamp: new Date().toISOString() };
  evaluations.push(entry);
  emit("ai.evaluation_recorded", { promptId: eval_.promptId, qualityScore: eval_.qualityScore }, { source: "ai-layer" });
  return entry;
}

/**
 * Get average quality per model.
 * @returns {Record<string, { avgQuality: number, avgLatency: number, count: number }>}
 */
export function getModelPerformance() {
  const perf = {};
  for (const ev of evaluations) {
    if (!perf[ev.modelId]) perf[ev.modelId] = { avgQuality: 0, avgLatency: 0, totalCost: 0, count: 0 };
    perf[ev.modelId].avgQuality += ev.qualityScore;
    perf[ev.modelId].avgLatency += ev.latencyMs;
    perf[ev.modelId].totalCost += ev.costUsd;
    perf[ev.modelId].count++;
  }
  for (const [id, p] of Object.entries(perf)) {
    p.avgQuality = Math.round((p.avgQuality / p.count) * 10) / 10;
    p.avgLatency = Math.round(p.avgLatency / p.count);
    p.totalCost = Math.round(p.totalCost * 1000) / 1000;
  }
  return perf;
}

// ═══════════════════════════════════════════════════════════
// Cost Tracking
// ═══════════════════════════════════════════════════════════

let totalCostUsd = 0;

export function trackCost(usd) {
  totalCostUsd += usd;
  emit("ai.cost_tracked", { cost: usd, total: totalCostUsd }, { source: "ai-layer" });
}

export function getTotalCost() { return Math.round(totalCostUsd * 1000) / 1000; }

// ═══════════════════════════════════════════════════════════
// AI Governance Policy
// ═══════════════════════════════════════════════════════════

const governanceRules = [
  { id: "AI-GOV-01", rule: "No autonomous decisions", description: "AI output must pass human review before becoming actionable." },
  { id: "AI-GOV-02", rule: "Prompt sanitization required", description: "All prompts must be sanitized before provider dispatch." },
  { id: "AI-GOV-03", rule: "Cost budget enforcement", description: "Per-organization AI cost budgets must be enforced." },
  { id: "AI-GOV-04", rule: "Model fallback required", description: "Every provider call must have a fallback model." },
  { id: "AI-GOV-05", rule: "Hallucination monitoring", description: "All AI outputs must be evaluated for hallucination risk." },
];

export function getAiGovernanceRules() { return governanceRules; }

/**
 * Check if an AI usage is compliant.
 * @param {{ humanReviewed: boolean, sanitized: boolean, withinBudget: boolean }} check
 * @returns {{ compliant: boolean, violations: string[] }}
 */
export function checkCompliance({ humanReviewed, sanitized, withinBudget }) {
  const violations = [];
  if (!humanReviewed) violations.push("AI-GOV-01: No human review gate");
  if (!sanitized) violations.push("AI-GOV-02: Prompt not sanitized");
  if (!withinBudget) violations.push("AI-GOV-03: Budget exceeded");
  return { compliant: violations.length === 0, violations };
}

// ═══════════════════════════════════════════════════════════
// Pre-register Standard Providers (example)
// ═══════════════════════════════════════════════════════════

registerProvider("anthropic", { name: "Anthropic", type: "cloud", models: ["claude-sonnet-4", "claude-opus-4"], costPer1kTokens: 0.015 });
registerProvider("local-ollama", { name: "Local Ollama", type: "local", models: ["llama3", "mistral"], costPer1kTokens: 0 });
registerModel("claude-sonnet-4", "anthropic", { name: "Claude Sonnet 4", capability: "code", contextWindow: 200000, costPer1kTokens: 0.003, latencyBaselineMs: 2000 });
registerModel("claude-opus-4", "anthropic", { name: "Claude Opus 4", capability: "code", contextWindow: 200000, costPer1kTokens: 0.015, latencyBaselineMs: 5000 });

registerPrompt("eng-code-review", { name: "Code Review Prompt", template: "Review the following code for quality:\n\n```\n{{code}}\n```\n\nCheck for: complexity, duplication, SOLID, testability.", variables: ["code"], category: "code_review", recommendedModels: ["claude-sonnet-4"] });
registerPrompt("eng-architecture", { name: "Architecture Review Prompt", template: "Review the architecture of {{module}}.\n\nCurrent dependencies: {{deps}}\n\nCheck for: layer violations, boundary integrity, Core reuse.", variables: ["module", "deps"], category: "architecture", recommendedModels: ["claude-opus-4"] });
registerPrompt("eng-security", { name: "Security Audit Prompt", template: "Audit the following for security:\n\n{{target}}\n\nCheck: auth, RBAC, tenant isolation, injection, secrets.", variables: ["target"], category: "security", recommendedModels: ["claude-opus-4"] });

// ═══════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════

export default {
  registerProvider, getProvider, listProviders,
  registerModel, getModel, listModels,
  registerPrompt, getPrompt, renderPrompt,
  recordEvaluation, getModelPerformance,
  trackCost, getTotalCost,
  getAiGovernanceRules, checkCompliance,
};
