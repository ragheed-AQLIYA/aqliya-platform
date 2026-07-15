"use server"

import { extractPatternsFromDecision } from "@/lib/decision/learning-engine"
import { getDecisionPattern } from "@/lib/decision/decision-pattern"
import { getSectorPatterns } from "@/lib/decision/sector-pattern"
import { revalidatePath } from "next/cache"
import { getCurrentUser, hasRequiredRole } from "@/lib/auth"
import { enforce } from "@/lib/kernel"
import { prisma } from "@/lib/prisma"
import { logAudit, toAuditJson } from "@/lib/decision/decision-audit"

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
  const user = await getCurrentUser()
  const decisionLookup = await prisma.decision.findUnique({
    where: { id: decisionId },
    select: { organizationId: true },
  })
  if (!decisionLookup) {
    return { error: "Decision not found" }
  }
  await enforce(user, { type: "decision", id: decisionId, tenantId: decisionLookup.organizationId }, "admin")
  
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
      decisionLookup.organizationId
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
    const user = await getCurrentUser()
    const decisionLookup = await prisma.decision.findUnique({
      where: { id: decisionId },
      select: { organizationId: true },
    })
    if (!decisionLookup) {
      return { error: "Decision not found" }
    }
    await enforce(user, { type: "decision", id: decisionId, tenantId: decisionLookup.organizationId }, "update")
    const pattern = await getDecisionPattern(decisionId)
    return { data: pattern }
  } catch {
    return { error: "Failed to fetch decision pattern" }
  }
}

// Query sector patterns (no extraction logic)
export async function getSectorPatternsAction(sectorId: string) {
  try {
    const user = await getCurrentUser();
    if (!hasRequiredRole(user, "OPERATOR")) {
      throw new Error("Access denied: OPERATOR role required");
    }
    const patterns = await getSectorPatterns(sectorId)
    return { data: patterns }
  } catch {
    return { error: "Failed to fetch sector patterns" }
  }
}
