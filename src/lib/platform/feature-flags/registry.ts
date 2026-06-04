import "server-only"
import type { FeatureFlag, FlagVariant } from "./types"

const FLAG_REGISTRY: Record<string, FeatureFlag> = {
  "ai.real-providers": {
    key: "ai.real-providers",
    name: "Real AI Providers",
    description:
      "When off, all AI uses deterministic fallback handlers. When on, real Anthropic/OpenAI providers are enabled.",
    variant: "off",
    owner: "ai-gov",
    dependencies: ["ai.cost-tracking"],
    createdAt: "2026-06-03",
    updatedAt: "2026-06-03",
  },
  "ai.cost-tracking": {
    key: "ai.cost-tracking",
    name: "AI Cost Tracking",
    description: "Enables per-request token cost calculation and audit logging of spend.",
    variant: "on",
    owner: "ai-gov",
    dependencies: [],
    createdAt: "2026-06-03",
    updatedAt: "2026-06-03",
  },
  "ai.streaming": {
    key: "ai.streaming",
    name: "AI Response Streaming",
    description: "When on, AI responses use streaming for lower perceived latency.",
    variant: "on",
    owner: "eng",
    dependencies: [],
    createdAt: "2026-06-03",
    updatedAt: "2026-06-03",
  },
  "ai.budget-quotas": {
    key: "ai.budget-quotas",
    name: "AI Budget Quotas",
    description: "When on, per-tenant monthly budget quotas are enforced before AI generation.",
    variant: "off",
    owner: "ai-gov",
    dependencies: ["ai.cost-tracking"],
    createdAt: "2026-06-03",
    updatedAt: "2026-06-03",
  },
  "ai.rag": {
    key: "ai.rag",
    name: "AI RAG/pgvector Pipeline",
    description: "When on, embeddings and vector search are available for RAG retrieval.",
    variant: "off",
    owner: "ai-gov",
    dependencies: ["ai.cost-tracking"],
    createdAt: "2026-06-03",
    updatedAt: "2026-06-03",
  },
  "ai.budget-alerts": {
    key: "ai.budget-alerts",
    name: "AI Budget Alerts",
    description:
      "When on, budget threshold alerts are fired via the notification engine after AI generation.",
    variant: "off",
    owner: "ai-gov",
    dependencies: ["ai.cost-tracking"],
    createdAt: "2026-06-03",
    updatedAt: "2026-06-03",
  },
  "audit.mock-ai": {
    key: "audit.mock-ai",
    name: "AuditOS Mock AI Fallback",
    description: "When on, AuditOS AI falls back to mock data when real provider fails.",
    variant: "on",
    owner: "eng",
    dependencies: ["ai.real-providers"],
    createdAt: "2026-06-03",
    updatedAt: "2026-06-03",
  },
  "queue.enabled": {
    key: "queue.enabled",
    name: "Async Queue Runtime",
    description: "When on, AI requests and exports are processed through the async queue.",
    variant: "off",
    owner: "eng",
    dependencies: [],
    createdAt: "2026-06-03",
    updatedAt: "2026-06-03",
  },
  "tenant.self-service": {
    key: "tenant.self-service",
    name: "Tenant Self-Service Onboarding",
    description: "When on, organizations can self-register. When off, only admin-created orgs exist.",
    variant: "on",
    owner: "product",
    dependencies: [],
    createdAt: "2026-06-03",
    updatedAt: "2026-06-03",
  },
  "tenant.lifecycle": {
    key: "tenant.lifecycle",
    name: "Tenant Lifecycle Management",
    description: "When on, org CRUD operations are available. When off, the mock org page is shown.",
    variant: "off",
    owner: "eng",
    dependencies: [],
    createdAt: "2026-06-03",
    updatedAt: "2026-06-03",
  },
  "storage.s3-as-default": {
    key: "storage.s3-as-default",
    name: "S3 as Default Storage Provider",
    description:
      "When on, S3 is the primary storage provider (subject to env availability). When off, local storage remains the default.",
    variant: "off",
    owner: "platform",
    dependencies: [],
    createdAt: "2026-06-03",
    updatedAt: "2026-06-03",
  },
}

function getEnvOverride(key: string): FlagVariant | undefined {
  switch (key) {
    case "ai.real-providers":
      return process.env.FF_AI_REAL_PROVIDERS === "true" ? "on" : undefined
    case "ai.cost-tracking":
      return process.env.FF_AI_COST_TRACKING === "false" ? "off" : undefined
    case "ai.streaming":
      return process.env.FF_AI_STREAMING === "false" ? "off" : undefined
    case "ai.budget-quotas":
      return process.env.FF_AI_BUDGET_QUOTAS === "true" ? "on" : undefined
    case "ai.rag":
      return process.env.FF_AI_RAG === "true" ? "on" : undefined
    case "ai.budget-alerts":
      return process.env.FF_AI_BUDGET_ALERTS === "true" ? "on" : undefined
    case "audit.mock-ai":
      return process.env.FF_AUDIT_MOCK_AI === "false" ? "off" : undefined
    case "queue.enabled":
      return process.env.FF_QUEUE_ENABLED === "true" ? "on" : undefined
    case "tenant.self-service":
      return process.env.FF_TENANT_SELF_SERVICE === "false" ? "off" : undefined
    case "tenant.lifecycle":
      return process.env.FF_TENANT_LIFECYCLE === "true" ? "on" : undefined
    case "storage.s3-as-default":
      return process.env.FF_STORAGE_S3 === "true" ? "on" : undefined
    default:
      return undefined
  }
}

function resolveVariant(key: string): FlagVariant {
  const flag = FLAG_REGISTRY[key]
  if (!flag) return "off"
  return getEnvOverride(key) ?? flag.variant
}

function dependenciesMet(key: string): boolean {
  const flag = FLAG_REGISTRY[key]
  if (!flag) return false
  return flag.dependencies.every((dep) => resolveVariant(dep) === "on")
}

export function isEnabled(key: string): boolean {
  if (!FLAG_REGISTRY[key]) return false
  if (resolveVariant(key) !== "on") return false
  return dependenciesMet(key)
}

export function requireEnabled(key: string): void {
  if (!isEnabled(key)) {
    throw new Error(`Feature "${key}" is disabled`)
  }
}

export function getFlag(key: string): FeatureFlag | undefined {
  return FLAG_REGISTRY[key]
}
