"use server"

import { prisma } from "@/lib/prisma"

export async function getTenderProfile(decisionId: string) {
  try {
    const tender = await prisma.tenderProfile.findUnique({
      where: { decisionId },
    })

    return { success: true, data: tender }
  } catch (error) {
    console.error('Error fetching tender profile:', error)
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
    riskLevel: string;
  },
  userId: string
) {
  try {
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
          riskLevel: data.riskLevel as any,
        },
      })

      // Create audit log for update
      await prisma.auditLog.create({
        data: {
          decisionId,
          userId,
          action: 'UPDATED',
          entity: 'TenderProfile',
          before: JSON.stringify(existing),
          after: JSON.stringify(updated),
        },
      })

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
          riskLevel: data.riskLevel as any,
        },
      })

      // Create audit log for create
      await prisma.auditLog.create({
        data: {
          decisionId,
          userId,
          action: 'CREATED',
          entity: 'TenderProfile',
          after: JSON.stringify(created),
        },
      })

      return { success: true, data: created }
    }
  } catch (error) {
    console.error('Error saving tender profile:', error)
    return { success: false, error: "Failed to save tender profile" }
  }
}
