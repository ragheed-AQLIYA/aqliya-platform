import 'server-only'
import { generateProcedureCode } from './common'
import type { RiskLevel, AuditRiskProcedure, ProcedureStep } from './types'

export function generateProcedures(
  riskLevel: RiskLevel,
  categoryScores: { name: string; score: number; level: RiskLevel }[],
  userId: string,
  assessmentId: string,
  organizationId: string,
): Omit<AuditRiskProcedure, 'id' | 'createdAt' | 'updatedAt'>[] {
  const topCategories = [...categoryScores]
    .sort((a, b) => b.score - a.score)
    .filter((c) => c.level === 'HIGH' || c.level === 'CRITICAL' || c.score > 30)

  if (!topCategories.length) {
    topCategories.push(categoryScores[0])
  }

  const stepsByLevel: Record<RiskLevel, number> = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  }

  const procedureCount = riskLevel === 'CRITICAL' ? topCategories.length : Math.min(topCategories.length, 2)

  const procedures: Omit<AuditRiskProcedure, 'id' | 'createdAt' | 'updatedAt'>[] = []

  for (let i = 0; i < procedureCount; i++) {
    const cat = topCategories[i]
    const steps: ProcedureStep[] = []

    switch (riskLevel) {
      case 'CRITICAL':
      case 'HIGH': {
        steps.push({ stepNumber: 1, instruction: `Review all documentation and evidence for ${cat.name}` })
        steps.push({ stepNumber: 2, instruction: `Perform detailed testing on high-risk areas within ${cat.name}` })
        steps.push({ stepNumber: 3, instruction: `Document findings and obtain management representation for ${cat.name}` })
        if (riskLevel === 'CRITICAL') {
          steps.push({ stepNumber: 4, instruction: `Escalate to senior review committee for ${cat.name}` })
        }
        break
      }
      case 'MEDIUM': {
        steps.push({ stepNumber: 1, instruction: `Review process documentation and perform walkthrough for ${cat.name}` })
        steps.push({ stepNumber: 2, instruction: `Perform substantive testing on sample transactions in ${cat.name}` })
        break
      }
      case 'LOW': {
        steps.push({ stepNumber: 1, instruction: `Perform limited review and analytical procedures for ${cat.name}` })
        break
      }
    }

    procedures.push({
      assessmentId,
      organizationId,
      procedureCode: generateProcedureCode(i),
      description: `Risk procedure for ${cat.name} (${riskLevel} risk)`,
      riskCategory: cat.name,
      procedureSteps: steps,
      evidenceRequired: riskLevel === 'LOW' ? false : true,
      status: 'DRAFT',
      createdById: userId,
    })
  }

  return procedures
}
