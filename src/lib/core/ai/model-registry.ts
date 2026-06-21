/**
 * IC-05 — File-based model registry (no schema change).
 * Central catalog of allowed model IDs, provider binding, and lifecycle status.
 */

import type { AIProviderId } from "@/lib/ai/types"
import type { GovernanceTaskType } from "@/lib/governance/runtime-types"

export type ModelRegistryStatus = "active" | "deprecated" | "disabled"

export interface ModelRegistryEntry {
  id: string
  providerId: AIProviderId
  displayName: string
  status: ModelRegistryStatus
  /** Default when routing selects this provider and no modelId is supplied */
  isDefault?: boolean
  supportedTaskTypes?: GovernanceTaskType[]
  notes?: string
}

export const MODEL_REGISTRY_VERSION = "1.0.0"

/** Canonical registry — ids align with `cost-mapping.ts` keys where applicable */
export const MODEL_REGISTRY: readonly ModelRegistryEntry[] = [
  {
    id: "deterministic-v1.0",
    providerId: "deterministic",
    displayName: "Deterministic rule handlers",
    status: "active",
    isDefault: true,
    notes: "Always available fallback; no external LLM",
  },
  {
    id: "audit-os-llm-v1",
    providerId: "deterministic",
    displayName: "AuditOS deterministic handler bundle",
    status: "active",
    supportedTaskTypes: [
      "trial_balance_upload",
      "evidence_review",
      "audit_findings",
      "approval_review",
      "notes_generation",
      "disclosure_enrichment",
    ],
    notes: "Handler-emitted modelVersion label",
  },
  {
    id: "gpt-4o",
    providerId: "openai",
    displayName: "GPT-4o",
    status: "active",
    isDefault: true,
  },
  {
    id: "gpt-4o-mini",
    providerId: "openai",
    displayName: "GPT-4o Mini",
    status: "active",
  },
  {
    id: "claude-sonnet-4-20250514",
    providerId: "anthropic",
    displayName: "Claude Sonnet 4",
    status: "active",
    isDefault: true,
  },
  {
    id: "claude-haiku-3-5",
    providerId: "anthropic",
    displayName: "Claude Haiku 3.5",
    status: "active",
  },
  {
    id: "cloud-legacy-v1",
    providerId: "cloud",
    displayName: "Legacy cloud provider path",
    status: "deprecated",
    notes: "Partial; prefer openai/anthropic with FF_AI_REAL_PROVIDERS",
  },
  {
    id: "local-not-implemented",
    providerId: "local",
    displayName: "Local GPU runtime",
    status: "disabled",
    notes: "IC-10 — not implemented",
  },
] as const

const byId = new Map(MODEL_REGISTRY.map((e) => [e.id, e]))

export function getModelRegistryEntry(modelId: string): ModelRegistryEntry | null {
  return byId.get(modelId) ?? null
}

export function listModelRegistryEntries(options?: {
  providerId?: AIProviderId
  status?: ModelRegistryStatus | ModelRegistryStatus[]
}): ModelRegistryEntry[] {
  const statuses = options?.status
    ? Array.isArray(options.status)
      ? options.status
      : [options.status]
    : null

  return MODEL_REGISTRY.filter((entry) => {
    if (options?.providerId && entry.providerId !== options.providerId) return false
    if (statuses && !statuses.includes(entry.status)) return false
    return true
  })
}

export function listActiveModels(providerId?: AIProviderId): ModelRegistryEntry[] {
  return listModelRegistryEntries({ providerId, status: "active" })
}

export function resolveDefaultModelForProvider(providerId: AIProviderId): string | null {
  const active = listActiveModels(providerId)
  const preferred = active.find((e) => e.isDefault)
  return (preferred ?? active[0])?.id ?? null
}

export function validateModelForProvider(
  modelId: string,
  providerId: AIProviderId,
): { valid: boolean; reason?: string; entry?: ModelRegistryEntry } {
  const entry = getModelRegistryEntry(modelId)
  if (!entry) {
    return { valid: false, reason: `Unknown model id: ${modelId}` }
  }
  if (entry.providerId !== providerId) {
    return {
      valid: false,
      reason: `Model ${modelId} is registered for provider ${entry.providerId}, not ${providerId}`,
      entry,
    }
  }
  if (entry.status === "disabled") {
    return { valid: false, reason: `Model ${modelId} is disabled`, entry }
  }
  if (entry.status === "deprecated") {
    return { valid: false, reason: `Model ${modelId} is deprecated`, entry }
  }
  return { valid: true, entry }
}

export function resolveRoutableModelId(
  providerId: AIProviderId,
  requestedModelId?: string,
): { modelId: string | undefined; validationNote?: string } {
  if (requestedModelId) {
    const check = validateModelForProvider(requestedModelId, providerId)
    if (check.valid) return { modelId: requestedModelId }
    const fallback = resolveDefaultModelForProvider(providerId)
    return {
      modelId: fallback ?? undefined,
      validationNote: check.reason,
    }
  }
  return { modelId: resolveDefaultModelForProvider(providerId) ?? undefined }
}

export function getModelRegistrySnapshot() {
  return {
    version: MODEL_REGISTRY_VERSION,
    models: listModelRegistryEntries(),
    activeCount: listActiveModels().length,
  }
}

