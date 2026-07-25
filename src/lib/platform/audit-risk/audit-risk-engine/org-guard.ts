import 'server-only'
import { prisma } from '@/lib/prisma'

export async function verifyOrgAccess(
  resourceType: 'model' | 'assessment' | 'procedure',
  resourceId: string,
  orgId: string,
): Promise<boolean> {
  let record: { organizationId: string } | null = null
  switch (resourceType) {
    case 'model':
      record = await prisma.auditRiskModel.findUnique({
        where: { id: resourceId },
        select: { organizationId: true },
      })
      break
    case 'assessment':
      record = await prisma.auditRiskAssessment.findUnique({
        where: { id: resourceId },
        select: { organizationId: true },
      })
      break
    case 'procedure':
      record = await prisma.auditRiskProcedure.findUnique({
        where: { id: resourceId },
        select: { organizationId: true },
      })
      break
  }
  if (!record) return false
  return record.organizationId === orgId
}
