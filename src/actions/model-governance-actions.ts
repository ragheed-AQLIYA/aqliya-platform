// ─── Model Governance Actions ───
// Wraps model-governance-service for UI use.

"use server"

import { getCurrentUser } from "@/lib/auth"
import {
  registerModel,
  listModels,
  getModel,
  submitForReview,
  reviewModel,
  approveModel,
  rejectModel,
  deprecateModel,
  deployModel,
  getModelGovernanceStats,
} from "@/lib/platform/model-governance/model-governance-service"
import { listModelRegistryEntries } from "@/lib/core/ai/model-registry"
import type { RegisterModelInput, ReviewInput, ApproveInput, DeployInput } from "@/lib/platform/model-governance/model-governance-service"

export type ActionResult = { ok: boolean; data?: unknown; error?: string }

export async function registerModelAction(input: RegisterModelInput): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const model = await registerModel({ ...input, createdBy: user.id })
    return { ok: true, data: model }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function listModelsAction(): Promise<ActionResult> {
  try {
    await getCurrentUser()
    const models = await listModels()
    const stats = await getModelGovernanceStats()
    return { ok: true, data: { models, stats } }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function getModelAction(id: string): Promise<ActionResult> {
  try {
    await getCurrentUser()
    const model = await getModel(id)
    return { ok: true, data: model }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function submitModelForReviewAction(id: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const model = await submitForReview(id, user.id)
    return { ok: true, data: model }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function reviewModelAction(id: string, input: ReviewInput): Promise<ActionResult> {
  try {
    await getCurrentUser()
    const model = await reviewModel(id, input)
    return { ok: true, data: model }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function approveModelAction(id: string, notes?: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const model = await approveModel(id, { approvedById: user.id, approvalNotes: notes })
    return { ok: true, data: model }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function rejectModelAction(id: string, reason: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const model = await rejectModel(id, { rejectedById: user.id, rejectionReason: reason })
    return { ok: true, data: model }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function deployModelAction(id: string, input: DeployInput): Promise<ActionResult> {
  try {
    await getCurrentUser()
    const deployment = await deployModel(id, input)
    return { ok: true, data: deployment }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function deprecateModelAction(id: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const model = await deprecateModel(id, user.id)
    return { ok: true, data: model }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function getFileBasedRegistryAction(): Promise<ActionResult> {
  try {
    await getCurrentUser()
    const entries = listModelRegistryEntries()
    return { ok: true, data: entries }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}
