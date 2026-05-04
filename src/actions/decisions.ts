"use server"

import { prisma } from "@/lib/prisma"

export async function getDecisions() {
  try {
    const decisions = await prisma.decision.findMany({
      include: {
        organization: true,
        owner: true,
        tenderProfile: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return { success: true, data: decisions }
  } catch (error) {
    console.error('Error fetching decisions:', error)
    return { success: false, error: "Failed to fetch decisions" }
  }
}

export async function getDecisionById(id: string) {
  try {
    const decision = await prisma.decision.findUnique({
      where: { id },
      include: {
        organization: true,
        owner: true,
        reviewer: true,
        approver: true,
        objectives: true,
        constraints: true,
        assumptions: true,
        alternatives: true,
        risks: true,
        tenderProfile: true,
        scenarios: {
          include: {
            simulation: true,
          },
        },
        recommendation: true,
        approvals: {
          include: {
            approver: true,
          },
        },
        auditLogs: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!decision) {
      return { success: false, error: "Decision not found" }
    }

    return { success: true, data: decision }
  } catch (error) {
    console.error('Error fetching decision:', error)
    return { success: false, error: "Failed to fetch decision" }
  }
}

export async function createDecision(data: {
  title: string;
  type?: string;
  ownerId: string;
  organizationId: string;
  objectives?: string;
  constraints?: string;
  assumptions?: string;
  alternatives?: string;
  risks?: string;
}) {
  try {
    const decision = await prisma.decision.create({
      data: {
        title: data.title,
        type: data.type as any || 'TENDER',
        ownerId: data.ownerId,
        organizationId: data.organizationId,
        status: 'DRAFT',
      },
    })
    return { success: true, data: decision }
  } catch (error) {
    console.error('Error creating decision:', error)
    return { success: false, error: "Failed to create decision" }
  }
}

export async function updateDecisionStatus(id: string, status: string) {
  try {
    const decision = await prisma.decision.update({
      where: { id },
      data: { status: status as any },
    })
    return { success: true, data: decision }
  } catch (error) {
    console.error('Error updating decision status:', error)
    return { success: false, error: "Failed to update decision status" }
  }
}
