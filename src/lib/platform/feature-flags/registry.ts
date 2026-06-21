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
  "audit.intelligence": {
    key: "audit.intelligence",
    name: "AuditOS Intelligence Layer",
    description:
      "When on, enriches rule-citation disclosure drafts via governed inference after FS rebuild.",
    variant: "off",
    owner: "eng",
    dependencies: [],
    createdAt: "2026-06-13",
    updatedAt: "2026-06-13",
  },
  "audit.reporting-graph": {
    key: "audit.reporting-graph",
    name: "AuditOS Reporting Graph",
    description:
      "When on, dual-writes TB/mapping/FS/notes into ReportingGraphNode/Edge tables.",
    variant: "off",
    owner: "eng",
    dependencies: [],
    createdAt: "2026-06-13",
    updatedAt: "2026-06-13",
  },
  "audit.lead-schedule-auto": {
    key: "audit.lead-schedule-auto",
    name: "AuditOS Lead Schedule Auto-Generation",
    description:
      "When on, auto-generates lead schedules from confirmed mappings after mapping confirm.",
    variant: "off",
    owner: "eng",
    dependencies: [],
    createdAt: "2026-06-13",
    updatedAt: "2026-06-13",
  },
  "audit.reconciliation": {
    key: "audit.reconciliation",
    name: "AuditOS Factory Reconciliation",
    description:
      "When on, runs TB↔LS↔FS tie-out checks on validation and after FS rebuild.",
    variant: "off",
    owner: "eng",
    dependencies: [],
    createdAt: "2026-06-13",
    updatedAt: "2026-06-13",
  },
  "audit.reconciliation-gates": {
    key: "audit.reconciliation-gates",
    name: "AuditOS Reconciliation Approval Gates",
    description:
      "When on, failed reconciliation checks block engagement approval.",
    variant: "off",
    owner: "eng",
    dependencies: ["audit.reconciliation"],
    createdAt: "2026-06-13",
    updatedAt: "2026-06-13",
  },
  "audit.fs-v2": {
    key: "audit.fs-v2",
    name: "AuditOS FS Engine v2",
    description:
      "When on, rebuilds 4 statements including cash flow and enables FS status lifecycle.",
    variant: "off",
    owner: "eng",
    dependencies: [],
    createdAt: "2026-06-13",
    updatedAt: "2026-06-13",
  },
  "audit.ifrs-rules": {
    key: "audit.ifrs-rules",
    name: "AuditOS IFRS Rules Engine",
    description:
      "When on, evaluates admitted IFRS knowledge rules after FS rebuild and on validation.",
    variant: "off",
    owner: "eng",
    dependencies: [],
    createdAt: "2026-06-13",
    updatedAt: "2026-06-13",
  },
  "audit.socpa-rules": {
    key: "audit.socpa-rules",
    name: "AuditOS SOCPA Rules Engine",
    description:
      "When on, evaluates SOCPA jurisdiction overlay rules for SAR/Saudi engagements.",
    variant: "off",
    owner: "eng",
    dependencies: [],
    createdAt: "2026-06-13",
    updatedAt: "2026-06-13",
  },
  "audit.disclosure-auto": {
    key: "audit.disclosure-auto",
    name: "AuditOS Disclosure Auto Engine",
    description:
      "When on, materializes IFRS/SOCPA rule triggers into draft disclosure notes after FS rebuild.",
    variant: "off",
    owner: "eng",
    dependencies: [],
    createdAt: "2026-06-13",
    updatedAt: "2026-06-13",
  },
  "audit.approval-gates": {
    key: "audit.approval-gates",
    name: "AuditOS Factory Approval Gates",
    description:
      "When on, blocks approval and export until factory disclosure, validation, and FS gates pass.",
    variant: "off",
    owner: "eng",
    dependencies: [],
    createdAt: "2026-06-13",
    updatedAt: "2026-06-13",
  },
  "audit.mind-map": {
    key: "audit.mind-map",
    name: "AuditOS Factory Mind Map",
    description:
      "When on, shows TB→mapping→FS→disclosure graph UI and captures GraphSnapshot on approval.",
    variant: "off",
    owner: "eng",
    dependencies: [],
    createdAt: "2026-06-13",
    updatedAt: "2026-06-13",
  },
  "platform.abac-shadow": {
    key: "platform.abac-shadow",
    name: "ABAC Shadow Evaluation",
    description: "Log-only ABAC evaluation at unified access gate.",
    variant: "on",
    owner: "platform",
    dependencies: [],
    createdAt: "2026-06-21",
    updatedAt: "2026-06-21",
  },
  "platform.abac-shadow-verbose": {
    key: "platform.abac-shadow-verbose",
    name: "ABAC Shadow Verbose Logging",
    description: "Log every ABAC shadow evaluation, not only mismatches.",
    variant: "off",
    owner: "platform",
    dependencies: ["platform.abac-shadow"],
    createdAt: "2026-06-21",
    updatedAt: "2026-06-21",
  },
  "platform.abac-enforce": {
    key: "platform.abac-enforce",
    name: "ABAC Enforce Mode",
    description: "When on, ABAC denial blocks access for allowlisted orgs.",
    variant: "off",
    owner: "platform",
    dependencies: ["platform.abac-shadow"],
    createdAt: "2026-06-21",
    updatedAt: "2026-06-21",
  },
  "platform.event-outbox": {
    key: "platform.event-outbox",
    name: "Platform Event Outbox",
    description: "Transactional outbox on platform audit writes (Event Bus Phase 1).",
    variant: "off",
    owner: "platform",
    dependencies: [],
    createdAt: "2026-06-21",
    updatedAt: "2026-06-21",
  },
  "platform.event-schema-registry": {
    key: "platform.event-schema-registry",
    name: "Event Schema Registry",
    description: "Validate core event envelopes against registered schemas (Event Bus Phase 2).",
    variant: "off",
    owner: "platform",
    dependencies: ["platform.event-outbox"],
    createdAt: "2026-06-21",
    updatedAt: "2026-06-21",
  },
  "audit.isa-rules": {
    key: "audit.isa-rules",
    name: "AuditOS ISA Rules Runtime",
    description: "When on, evaluates admitted ISA knowledge packs after FS rebuild.",
    variant: "off",
    owner: "eng",
    dependencies: [],
    createdAt: "2026-06-21",
    updatedAt: "2026-06-21",
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
    case "audit.intelligence":
      return process.env.FF_AUDIT_INTELLIGENCE === "true" ? "on" : undefined
    case "audit.reporting-graph":
      return process.env.FF_AUDIT_REPORTING_GRAPH === "true" ? "on" : undefined
    case "audit.lead-schedule-auto":
      return process.env.FF_AUDIT_LEAD_SCHEDULE_AUTO === "true" ? "on" : undefined
    case "audit.reconciliation":
      return process.env.FF_AUDIT_RECONCILIATION === "true" ? "on" : undefined
    case "audit.reconciliation-gates":
      return process.env.FF_AUDIT_RECONCILIATION_GATES === "true" ? "on" : undefined
    case "audit.fs-v2":
      return process.env.FF_AUDIT_FS_V2 === "true" ? "on" : undefined
    case "audit.ifrs-rules":
      return process.env.FF_AUDIT_IFRS_RULES === "true" ? "on" : undefined
    case "audit.socpa-rules":
      return process.env.FF_AUDIT_SOCPA_RULES === "true" ? "on" : undefined
    case "audit.disclosure-auto":
      return process.env.FF_AUDIT_DISCLOSURE_AUTO === "true" ? "on" : undefined
    case "audit.approval-gates":
      return process.env.FF_AUDIT_APPROVAL_GATES === "true" ? "on" : undefined
    case "audit.mind-map":
      return process.env.FF_AUDIT_MIND_MAP === "true" ? "on" : undefined
    case "platform.abac-shadow":
      return process.env.FF_ABAC_SHADOW === "false" ? "off" : undefined
    case "platform.abac-enforce":
      return process.env.FF_ABAC_ENFORCE === "true" ? "on" : undefined
    case "platform.event-outbox":
      return process.env.FF_EVENT_OUTBOX === "true" ? "on" : undefined
    case "platform.event-schema-registry":
      return process.env.FF_EVENT_SCHEMA_REGISTRY === "true" ? "on" : undefined
    case "audit.isa-rules":
      return process.env.FF_AUDIT_ISA_RULES === "true" ? "on" : undefined
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
