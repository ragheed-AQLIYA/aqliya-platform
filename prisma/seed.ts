import { config } from 'dotenv'
import { resolve } from 'path'
import bcrypt from 'bcryptjs'
import { PrismaClient, DecisionType, DecisionStatus, UserRole, RiskLevel, ScenarioType, ApprovalStatus } from '@prisma/client'
import { PrismaPg } from "@prisma/adapter-pg"

// Load .env file explicitly
config({ path: resolve(__dirname, '../.env') })

const adapter = new PrismaPg(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter })

async function main() {
  // Clean existing data
  await prisma.auditLog.deleteMany()
  await prisma.decisionReport.deleteMany()
  await prisma.approval.deleteMany()
  await prisma.recommendation.deleteMany()
  await prisma.simulationResult.deleteMany()
  await prisma.scenario.deleteMany()
  await prisma.risk.deleteMany()
  await prisma.alternative.deleteMany()
  await prisma.assumption.deleteMany()
  await prisma.constraint.deleteMany()
  await prisma.objective.deleteMany()
  await prisma.tenderProfile.deleteMany()
  await prisma.decision.deleteMany()
  await prisma.user.deleteMany()
  await prisma.organization.deleteMany()

  console.log('Seeding database...')

  // Create Organization
  const org = await prisma.organization.create({
    data: {
      name: 'AQLIYA Demo Organization',
    },
  })
  console.log(`Created organization: ${org.name}`)

  // Create Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@aqliya.com',
      name: 'Ahmed Al-Mansouri',
      role: UserRole.ADMIN,
      organizationId: org.id,
      passwordHash: await bcrypt.hash('admin123', 10),
    },
  })

  const reviewer = await prisma.user.create({
    data: {
      email: 'sara@aqliya.com',
      name: 'Sara Al-Otaibi',
       role: UserRole.OPERATOR,
      organizationId: org.id,
      passwordHash: await bcrypt.hash('operator123', 10),
    },
  })

  const approver = await prisma.user.create({
    data: {
      email: 'mohammad@aqliya.com',
      name: 'Mohammad Al-Harbi',
      role: UserRole.VIEWER,
      organizationId: org.id,
      passwordHash: await bcrypt.hash('viewer123', 10),
    },
  })
  console.log('Created 3 users')

  // Create Decision
  const decision = await prisma.decision.create({
    data: {
      title: 'Non-Profit Training & Empowerment Tender - 1,000 Beneficiaries',
      type: DecisionType.TENDER,
      ownerId: admin.id,
      reviewerId: reviewer.id,
      approverId: approver.id,
      organizationId: org.id,
      status: DecisionStatus.IN_REVIEW,
    },
  })
  console.log(`Created decision: ${decision.title}`)

  // Create Objectives
  await prisma.objective.createMany({
    data: [
      { decisionId: decision.id, description: 'Train and empower 1,000 social security beneficiaries' },
      { decisionId: decision.id, description: 'Establish long-term partnership with non-profit sector' },
      { decisionId: decision.id, description: 'Achieve 12% margin target' },
    ],
  })

  // Create Constraints
  await prisma.constraint.createMany({
    data: [
      { decisionId: decision.id, description: '4-month delivery timeline' },
      { decisionId: decision.id, description: 'Limited internal training resources' },
      { decisionId: decision.id, description: 'Compliance with non-profit regulations' },
    ],
  })

  // Create Assumptions
  await prisma.assumption.createMany({
    data: [
      { decisionId: decision.id, description: 'Stable training material costs' },
      { decisionId: decision.id, description: 'No major regulatory changes during project' },
      { decisionId: decision.id, description: 'Client payment within 45 days' },
    ],
  })

  // Create Alternatives
  await prisma.alternative.createMany({
    data: [
      { decisionId: decision.id, description: 'Partner with local training center' },
      { decisionId: decision.id, description: 'Subcontract training delivery' },
      { decisionId: decision.id, description: 'Decline and focus on private sector' },
    ],
  })

  // Create Risks
  await prisma.risk.createMany({
    data: [
      { decisionId: decision.id, description: 'Resource overallocation', level: RiskLevel.MEDIUM },
      { decisionId: decision.id, description: 'Training material price volatility', level: RiskLevel.LOW },
      { decisionId: decision.id, description: 'Client payment delays', level: RiskLevel.MEDIUM },
    ],
  })

  // Create TenderProfile
  await prisma.tenderProfile.create({
    data: {
      decisionId: decision.id,
      clientName: 'Social Development Non-Profit Organization',
      estimatedContractValue: 2800000,
      estimatedCost: 2460000,
      durationMonths: 4,
      requiredCapacity: 35,
      internalAvailableCapacity: 50,
      strategicFitScore: 90,
      riskLevel: RiskLevel.LOW,
      marginEstimate: 12.1,
    },
  })
  console.log('Created tender profile')

  // Create Scenarios
  const bestCase = await prisma.scenario.create({
    data: {
      decisionId: decision.id,
      type: ScenarioType.BEST_CASE,
    },
  })

  const expectedCase = await prisma.scenario.create({
    data: {
      decisionId: decision.id,
      type: ScenarioType.EXPECTED_CASE,
    },
  })

  const worstCase = await prisma.scenario.create({
    data: {
      decisionId: decision.id,
      type: ScenarioType.WORST_CASE,
    },
  })

  // Create SimulationResults
  await prisma.simulationResult.createMany({
    data: [
      {
        decisionId: decision.id,
        scenarioId: bestCase.id,
        feasibilityScore: 95,
        financialScore: 90,
        capacityScore: 92,
        riskScore: 94,
        strategicFitScore: 95,
        overallDecisionScore: 93.2,
      },
      {
        decisionId: decision.id,
        scenarioId: expectedCase.id,
        feasibilityScore: 82,
        financialScore: 78,
        capacityScore: 85,
        riskScore: 80,
        strategicFitScore: 90,
        overallDecisionScore: 83.0,
      },
      {
        decisionId: decision.id,
        scenarioId: worstCase.id,
        feasibilityScore: 65,
        financialScore: 62,
        capacityScore: 70,
        riskScore: 68,
        strategicFitScore: 90,
        overallDecisionScore: 71.0,
      },
    ],
  })
  console.log('Created scenarios and simulation results')

  // Create Recommendation
  await prisma.recommendation.create({
    data: {
      decisionId: decision.id,
      recommendedAction: "Proceed with the tender with conditions",
      rationale: "Strong strategic fit and acceptable Expected Case score of 83. Capacity and financial scores are adequate with identified manageable risks.",
      expectedNextState: "Contract signed with reallocated capacity and price lock-in secured",
      scopeExclusions: "Does not include additional training material development beyond current scope",
      assumptionsUsed: "Current resource allocation can be reallocated by 20% without impacting other projects",
      risksAccepted: "Medium risks related to resource allocation and payment delays with mitigation plan",
      risksRejected: "High financial risk from uncapped payment terms - mitigated through contract clauses",
      humanReviewRequired: true,
    },
  })
  console.log('Created recommendation')

  // Create Approval
  await prisma.approval.create({
    data: {
      decisionId: decision.id,
      approverId: approver.id,
      status: ApprovalStatus.PENDING,
      comments: 'Under review - need to verify capacity reallocation plan',
    },
  })

  // Create AuditLogs
  await prisma.auditLog.createMany({
    data: [
      {
        decisionId: decision.id,
        organizationId: org.id,
        userId: admin.id,
        action: 'DECISION_CREATED',
        entity: 'Decision',
        after: JSON.stringify({ title: decision.title, status: 'DRAFT' }),
      },
      {
        decisionId: decision.id,
        organizationId: org.id,
        userId: admin.id,
        action: 'DECISION_UPDATED',
        entity: 'TenderProfile',
        after: JSON.stringify({ clientName: 'Social Development Non-Profit Organization' }),
      },
      {
        decisionId: decision.id,
        organizationId: org.id,
        userId: admin.id,
        action: 'DECISION_UPDATED',
        entity: 'Decision',
        before: 'DRAFT',
        after: 'IN_REVIEW',
      },
    ],
  })
  console.log('Created audit logs')

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
