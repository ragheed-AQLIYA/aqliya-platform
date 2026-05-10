"use server"

import { prisma } from "@/lib/prisma"
import { RiskLevel } from "@prisma/client"
import { isExpectedAccessDeniedError, requireDecisionAccess } from "@/lib/auth"
import { logAudit, toAuditJson } from "@/lib/platform-audit"

export async function getTenderProfile(decisionId: string) {
  try {
    await requireDecisionAccess(decisionId, "OPERATOR")
    const tender = await prisma.tenderProfile.findUnique({
      where: { decisionId },
    })

    return { success: true, data: tender }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error('Error fetching tender profile:', error)
    }
    return { success: false, error: "Failed to fetch tender profile" }
  }
}

export async function createOrUpdateTenderProfile(
  decisionId: string,
  data: {
    clientName: string;
    estimatedContractValue: number;
    estimatedCost: number;
    durationMonths: number;
    requiredCapacity: number;
    internalAvailableCapacity: number;
    marginEstimate: number;
    strategicFitScore: number;
     riskLevel: RiskLevel;
  }
) {
  try {
    const { user } = await requireDecisionAccess(decisionId, "OPERATOR")
    // Check if tender profile exists
    const existing = await prisma.tenderProfile.findUnique({
      where: { decisionId },
    })

    if (existing) {
      // Update existing
      const updated = await prisma.tenderProfile.update({
        where: { decisionId },
        data: {
          clientName: data.clientName,
          estimatedContractValue: data.estimatedContractValue,
          estimatedCost: data.estimatedCost,
          durationMonths: data.durationMonths,
          requiredCapacity: data.requiredCapacity,
          internalAvailableCapacity: data.internalAvailableCapacity,
          marginEstimate: data.marginEstimate,
          strategicFitScore: data.strategicFitScore,
          riskLevel: data.riskLevel,
        },
      })

      // Create audit log for update
      await logAudit(
        user.id,
        decisionId,
        'DECISION_UPDATED',
        'TenderProfile',
        toAuditJson(existing),
        toAuditJson(updated),
        user.organizationId
      )

      return { success: true, data: updated }
    } else {
      // Create new
      const created = await prisma.tenderProfile.create({
        data: {
          decisionId,
          clientName: data.clientName,
          estimatedContractValue: data.estimatedContractValue,
          estimatedCost: data.estimatedCost,
          durationMonths: data.durationMonths,
          requiredCapacity: data.requiredCapacity,
          internalAvailableCapacity: data.internalAvailableCapacity,
          marginEstimate: data.marginEstimate,
          strategicFitScore: data.strategicFitScore,
          riskLevel: data.riskLevel,
        },
      })

      // Create audit log for create
      await logAudit(
        user.id,
        decisionId,
        'DECISION_CREATED',
        'TenderProfile',
        undefined,
        toAuditJson(created),
        user.organizationId
      )

      return { success: true, data: created }
    }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error('Error saving tender profile:', error)
    }
    return { success: false, error: "Failed to save tender profile" }
  }
}
