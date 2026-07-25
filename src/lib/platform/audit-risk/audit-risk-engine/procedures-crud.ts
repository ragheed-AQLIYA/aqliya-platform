import 'server-only'
import { prisma } from '@/lib/prisma'
import { AuditRiskError } from './types'
import type { AuditRiskProcedure, UpdateProcedureData } from './types'
import { mapProcedure } from './common'
import { RISK_STRINGS } from '../risk-strings'

export async function getRiskProcedures(assessmentId: string): Promise<AuditRiskProcedure[]> {
  const procedures = await prisma.auditRiskProcedure.findMany({
    where: { assessmentId },
    orderBy: { createdAt: 'asc' },
    take: 100,
  })
  return procedures.map(mapProcedure)
}

export async function updateProcedure(
  procedureId: string,
  data: UpdateProcedureData,
): Promise<AuditRiskProcedure> {
  const existing = await prisma.auditRiskProcedure.findUnique({ where: { id: procedureId } })
  if (!existing) throw new AuditRiskError(RISK_STRINGS.error.PROCEDURE_NOT_FOUND)

  const updatePayload: Record<string, unknown> = {}
  if (data.description !== undefined) updatePayload.description = data.description
  if (data.evidenceRequired !== undefined) updatePayload.evidenceRequired = data.evidenceRequired
  if (data.status !== undefined) updatePayload.status = data.status
  if (data.procedureSteps !== undefined) {
    updatePayload.procedureSteps = data.procedureSteps as unknown as Record<string, unknown>[]
  }

  const updated = await prisma.auditRiskProcedure.update({
    where: { id: procedureId },
    data: updatePayload,
  })

  return mapProcedure(updated)
}
