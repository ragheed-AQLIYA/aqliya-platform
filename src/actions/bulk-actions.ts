"use server"

import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { DecisionStatus } from "@/generated/prisma/client"

export interface BulkActionResult {
  success: number
  failed: number
  errors: Array<{ id: string; error: string }>
  totalRequested: number
}

async function assertAdmin(organizationId: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Authentication required")
  if (user.role !== "ADMIN") {
    throw new Error("Admin access required")
  }
  if (user.organizationId !== organizationId) {
    throw new Error("Organization mismatch")
  }
  return user
}

async function assertUser(organizationId?: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Authentication required")
  return user
}

// Bulk delete engagements
export async function bulkDeleteEngagements(ids: string[], organizationId: string): Promise<BulkActionResult> {
  await assertAdmin(organizationId)
  const result: BulkActionResult = { success: 0, failed: 0, errors: [], totalRequested: ids.length }

  // Batch-read ownership validation
  const existing = await prisma.auditEngagement.findMany({
    where: { id: { in: ids }, organizationId },
    select: { id: true },
  })
  const validIds = new Set(existing.map((e) => e.id))

  // Report invalid IDs
  for (const id of ids) {
    if (!validIds.has(id)) {
      result.failed++
      result.errors.push({ id, error: "Engagement not found" })
    }
  }

  // Batch delete all valid ones
  if (validIds.size > 0) {
    try {
      const deleteResult = await prisma.auditEngagement.deleteMany({
        where: { id: { in: [...validIds] } },
      })
      result.success = deleteResult.count
    } catch (e) {
      result.failed += validIds.size
      for (const id of validIds) {
        result.errors.push({ id, error: e instanceof Error ? e.message : "Unknown error" })
      }
    }
  }

  revalidatePath("/audit")
  return result
}

const VALID_ENGAGEMENT_STATUSES = [
  "setup", "draft", "in_progress", "under_review",
  "awaiting_client", "ready_for_approval", "approved", "published", "archived",
] as const

type EngagementStatus = typeof VALID_ENGAGEMENT_STATUSES[number]

// Bulk update engagement status
export async function bulkUpdateEngagementStatus(ids: string[], newStatus: string, organizationId: string): Promise<BulkActionResult> {
  await assertAdmin(organizationId)
  const result: BulkActionResult = { success: 0, failed: 0, errors: [], totalRequested: ids.length }

  if (!VALID_ENGAGEMENT_STATUSES.includes(newStatus as EngagementStatus)) {
    throw new Error(`Invalid status: ${newStatus}. Valid: ${VALID_ENGAGEMENT_STATUSES.join(", ")}`)
  }

  // Batch-read ownership validation
  const existing = await prisma.auditEngagement.findMany({
    where: { id: { in: ids }, organizationId },
    select: { id: true },
  })
  const validIds = new Set(existing.map((e) => e.id))

  // Report invalid IDs
  for (const id of ids) {
    if (!validIds.has(id)) {
      result.failed++
      result.errors.push({ id, error: "Engagement not found" })
    }
  }

  // Batch update all valid ones
  if (validIds.size > 0) {
    try {
      const updateResult = await prisma.auditEngagement.updateMany({
        where: { id: { in: [...validIds] } },
        data: { status: newStatus },
      })
      result.success = updateResult.count
    } catch (e) {
      result.failed += validIds.size
      for (const id of validIds) {
        result.errors.push({ id, error: e instanceof Error ? e.message : "Unknown error" })
      }
    }
  }

  revalidatePath("/audit")
  return result
}

// Bulk archive decisions
export async function bulkArchiveDecisions(ids: string[], organizationId: string): Promise<BulkActionResult> {
  await assertAdmin(organizationId)
  const result: BulkActionResult = { success: 0, failed: 0, errors: [], totalRequested: ids.length }

  // Batch-read ownership validation
  const existing = await prisma.decision.findMany({
    where: { id: { in: ids }, organizationId },
    select: { id: true },
  })
  const validIds = new Set(existing.map((e) => e.id))

  // Report invalid IDs
  for (const id of ids) {
    if (!validIds.has(id)) {
      result.failed++
      result.errors.push({ id, error: "Decision not found" })
    }
  }

  // Batch archive all valid ones
  if (validIds.size > 0) {
    try {
      const updateResult = await prisma.decision.updateMany({
        where: { id: { in: [...validIds] } },
        data: { status: DecisionStatus.ARCHIVED },
      })
      result.success = updateResult.count
    } catch (e) {
      result.failed += validIds.size
      for (const id of validIds) {
        result.errors.push({ id, error: e instanceof Error ? e.message : "Unknown error" })
      }
    }
  }

  revalidatePath("/decisions")
  return result
}