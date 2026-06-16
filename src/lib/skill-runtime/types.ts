// ─── AQLIYA Skill Runtime — Types ───
// Types for the Skill Runtime execution engine.
// Manifests are parsed from YAML; these are the runtime representations.

import type { GovernanceTaskType } from "@/lib/governance/runtime-types"
import type { AIProviderId } from "@/lib/ai/types"

// ─── Runtime Skill Manifest (parsed from YAML) ───

export interface SkillManifest {
  id: string
  name: string
  nameAr?: string
  version: string
  description: string
  descriptionAr?: string
  category: "foundation" | "engineering" | "product" | "business" | "meta"
  level: 0 | 1 | 2 | 3 | 4
  tags?: string[]
  products?: string[]
  status: "concept" | "draft" | "validated" | "published" | "deprecated" | "retired"
  createdAt: string
  updatedAt: string
  createdBy?: string
  owner?: string

  dependencies: {
    skills?: string[]
    models?: {
      minCapability?: "low" | "medium" | "high" | "highest"
      preferredProvider?: string
      localCapable?: boolean
    }
    dataSources?: string[]
    existingInfrastructure?: string[]
  }

  inputs: {
    required: InputDef[]
    optional?: InputDef[]
  }

  outputs: {
    primary: { type: string; description: string }
    artifacts?: { name: string; type: string; description: string }[]
  }

  execution: {
    type: "workflow" | "function" | "prompt-chain" | "composite"
    workflow?: {
      steps: WorkflowStepDef[]
    }
    timeout?: number
    maxRetries?: number
    retryDelay?: number
  }

  evaluation?: {
    criteria: { name: string; type: string; weight: number; threshold: number; metric: string }[]
    datasets?: { name: string; path: string; description: string }[]
    frequency?: string
  }

  governance?: {
    access?: { roles?: string[]; requireAuth?: boolean }
    audit?: { level?: "all" | "errors-only" | "summary"; retainFor?: string }
    approval?: { required?: boolean; roles?: string[]; evidenceRequired?: boolean }
    review?: { required?: boolean; interval?: string }
  }

  modelResilience?: {
    alternativeModels?: { provider: string; model: string }[]
    fallbackEnabled?: boolean
    localEquivalent?: string | null
    degradationProfile?: "none" | "minimal" | "moderate" | "severe" | "critical"
    fallbackBehavior?: string
  }
}

export interface InputDef {
  name: string
  type: "string" | "number" | "boolean" | "object" | "array" | "file"
  description: string
  validation?: string
  default?: unknown
}

export interface WorkflowStepDef {
  id: string
  type: "prompt" | "tool" | "skill" | "decision" | "transform" | "eval" | "aggregate"
  skill?: string
  config?: Record<string, unknown>
  params?: Record<string, unknown>
  dependsOn?: string[]
  timeout?: number
  retry?: { maxAttempts?: number; delay?: number }
}

// ─── Execution Context ───

export interface StepResult {
  status: "completed" | "failed" | "skipped"
  output: unknown
  error?: string
  durationMs: number
}

export interface SkillContext {
  skillId: string
  skillName: string
  version: string
  invocationId: string
  inputs: Record<string, unknown>
  config: Record<string, unknown>
  session: {
    userId?: string
    organizationId?: string
    role?: string
  }
  stepResults: Record<string, StepResult>
  errors: string[]
  warnings: string[]
  startedAt: number
}

// ─── Execution Result ───

export interface SkillResult {
  skillId: string
  skillName: string
  invocationId: string
  version: string
  status: "completed" | "failed" | "degraded"
  primary: unknown
  artifacts: Record<string, unknown>
  steps: Record<string, StepResult>
  providerUsed?: AIProviderId
  errors: string[]
  warnings: string[]
  durationMs: number
  startedAt: string
  completedAt: string
}

// ─── Runtime Configuration ───

export interface SkillRuntimeConfig {
  skillsRoot: string
  defaultProvider?: AIProviderId
  auditEnabled?: boolean
}

// ─── Error Types ───

export class SkillManifestError extends Error {
  constructor(message: string, public readonly skillId?: string) {
    super(message)
    this.name = "SkillManifestError"
  }
}

export class SkillExecutionError extends Error {
  constructor(
    message: string,
    public readonly skillId: string,
    public readonly stepId?: string,
  ) {
    super(message)
    this.name = "SkillExecutionError"
  }
}
