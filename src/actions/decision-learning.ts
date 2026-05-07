"use server"

import { extractPatternsFromDecision } from "@/lib/decision/learning-engine"
import { getDecisionPattern } from "@/lib/decision/decision-pattern"
import { getSectorPatterns } from "@/lib/decision/sector-pattern"
import { revalidatePath } from "next/cache"
import { requireDecisionAccess, requireUserContext } from "@/lib/auth"
import { logAudit, toAuditJson } from "@/lib/audit"

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path)
  } catch (error) {
    if (error instanceof Error && error.message.includes("static generation store missing")) {
      return
    }

    throw error
  }
}

// Per rule: Must be triggered explicitly (manual or controlled action)
export async function extractPatternsFromDecisionAction(decisionId: string) {
  const { user } = await requireDecisionAccess(decisionId, "ADMIN")
  
  try {
    const before = await getDecisionPattern(decisionId)
    const analysis = await extractPatternsFromDecision(decisionId)
    const after = await getDecisionPattern(decisionId)
    await logAudit(
      user.id,
      decisionId,
      "PATTERN_EXTRACTED",
      "DecisionPattern",
      toAuditJson(before),
      toAuditJson({ pattern: after, analysis }),
      user.organizationId
    )
    safeRevalidatePath(`/decisions/${decisionId}/sector`)
    return { success: true, data: analysis }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to extract patterns" }
  }
}

// Read metadata only
export async function getDecisionPatternAction(decisionId: string) {
  try {
    await requireDecisionAccess(decisionId, "OPERATOR")
    const pattern = await getDecisionPattern(decisionId)
    return { data: pattern }
  } catch {
    return { error: "Failed to fetch decision pattern" }
  }
}

// Query sector patterns (no extraction logic)
export async function getSectorPatternsAction(sectorId: string) {
  try {
    await requireUserContext("OPERATOR")
    const patterns = await getSectorPatterns(sectorId)
    return { data: patterns }
  } catch {
    return { error: "Failed to fetch sector patterns" }
  }
}
