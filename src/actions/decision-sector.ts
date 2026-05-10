"use server"

import { getSectors, getSectorById, createSector, updateSector, assignSectorToDecision, getDecisionSector } from "@/lib/decision/sector"
import { getBenchmarksBySector, createBenchmark } from "@/lib/decision/sector-benchmark"
import { revalidatePath } from "next/cache"
import { requireDecisionAccess, requireUserContext } from "@/lib/auth"
import { logAudit, toAuditJson } from "@/lib/platform-audit"

// Sector actions
export async function getSectorsAction() {
  try {
    await requireUserContext("OPERATOR")
    const sectors = await getSectors()
    return { data: sectors }
  } catch {
    return { error: "Failed to fetch sectors" }
  }
}

export async function getSectorAction(sectorId: string) {
  try {
    await requireUserContext("OPERATOR")
    const sector = await getSectorById(sectorId)
    return { data: sector }
  } catch {
    return { error: "Failed to fetch sector" }
  }
}

export async function createSectorAction(formData: FormData) {
  await requireUserContext("OPERATOR")
  
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const code = formData.get("code") as string

  try {
    await createSector({ name, description, code })
    revalidatePath("/intelligence/sectors")
    return { success: true }
  } catch {
    return { error: "Failed to create sector" }
  }
}

export async function updateSectorAction(sectorId: string, formData: FormData) {
  await requireUserContext("ADMIN")
  
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const code = formData.get("code") as string
  const isActive = formData.get("isActive") === "true"

  try {
    await updateSector({ id: sectorId, name, description, code, isActive })
    revalidatePath(`/intelligence/sectors/${sectorId}`)
    return { success: true }
  } catch {
    return { error: "Failed to update sector" }
  }
}

// Decision sector assignment
export async function assignSectorToDecisionAction(
  decisionId: string,
  sectorId: string
) {
  const { user } = await requireDecisionAccess(decisionId, "OPERATOR")
  
  try {
    const before = await getDecisionSector(decisionId)
    await assignSectorToDecision(decisionId, sectorId)
    const after = await getDecisionSector(decisionId)
    await logAudit(
      user.id,
      decisionId,
      "SECTOR_ASSIGNED",
      "Decision",
      toAuditJson(before),
      toAuditJson(after),
      user.organizationId
    )
    revalidatePath(`/decisions/${decisionId}/sector`)
    return { success: true }
  } catch {
    return { error: "Failed to assign sector" }
  }
}

export async function getDecisionSectorAction(decisionId: string) {
  try {
    await requireDecisionAccess(decisionId, "OPERATOR")
    const result = await getDecisionSector(decisionId)
    return { data: result }
  } catch {
    return { error: "Failed to fetch decision sector" }
  }
}

// Benchmark actions
export async function getSectorBenchmarksAction(sectorId: string) {
  try {
    await requireUserContext("OPERATOR")
    const benchmarks = await getBenchmarksBySector(sectorId)
    return { data: benchmarks }
  } catch {
    return { error: "Failed to fetch benchmarks" }
  }
}

export async function createBenchmarkAction(formData: FormData) {
  await requireUserContext("OPERATOR")
  
  const sectorId = formData.get("sectorId") as string
  const metricName = formData.get("metricName") as string
  const value = parseFloat(formData.get("value") as string)
  const unit = formData.get("unit") as string
  const benchmarkType = formData.get("benchmarkType") as string
  const sourceType = formData.get("sourceType") as string || "manual"
  const confidence = parseFloat(formData.get("confidence") as string) || 1.0

  try {
    await createBenchmark({
      sectorId,
      metricName,
      value,
      unit,
      benchmarkType,
      sourceType: sourceType as "manual" | "derived" | "assumption",
      confidence,
    })
    revalidatePath(`/intelligence/sectors/${sectorId}`)
    return { success: true }
  } catch {
    return { error: "Failed to create benchmark" }
  }
}
