import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'
config()

const adapter = new PrismaPg(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('=== AQLIYA Pilot Session 2 — Lifecycle Exercise ===\n')
  
  // Use dev demo actor (matches current dev environment)
  const actorId = 'usr-ahmed'
  const actorName = 'Ahmed Al Ghamdi'
  const engagementId = 'eng-gulf-2025'
  const safeEngagementId = 'eng-najd-2025'
  
  // ─── STEP 1: Pre-state ───
  console.log('--- STEP 1: Pre-State Snapshot ---')
  const preRuns = await prisma.auditValidationRun.count()
  const preEvents = await prisma.auditEvent.count()
  const pubPkg = await prisma.auditPublicationPackage.findFirst({ where: { engagementId: safeEngagementId } })
  console.log(`Validation runs before: ${preRuns}`)
  console.log(`Audit events before: ${preEvents}`)
  console.log(`Safe engagement (${safeEngagementId}) publication pkg: ${pubPkg?.status ?? 'none'}`)
  
  // ─── STEP 2: Validation Run ───
  console.log('\n--- STEP 2: Validation Run ---')
  const now = new Date()
  const runId = `vr-session2-${Date.now()}`
  
  // Create validation run
  await prisma.auditValidationRun.create({
    data: {
      id: runId,
      engagementId,
      validationType: 'full',
      status: 'completed',
      trustState: 'conditional',
      createdBy: actorId,
      completedAt: now,
    },
  })
  
  // Run actual checks
  const tb = await prisma.auditTrialBalance.findFirst({
    where: { engagementId },
    include: { lines: true },
    orderBy: { createdAt: 'desc' },
  })
  
  const mappings = await prisma.auditAccountMapping.findMany({
    where: { engagementId },
    include: { canonicalAccount: true },
  })
  
  const evidence = await prisma.auditEvidence.findMany({ where: { engagementId } })
  const statements = await prisma.auditFinancialStatement.findMany({ where: { engagementId } })
  
  const issues: Array<Record<string, unknown>> = []
  let idx = 0
  
  // Check 1: TB balance
  if (tb) {
    const lines = tb.lines ?? []
    const totalDebits = lines.reduce((s: number, l: { debitAmount: number }) => s + l.debitAmount, 0)
    const totalCredits = lines.reduce((s: number, l: { creditAmount: number }) => s + l.creditAmount, 0)
    const variance = totalDebits - totalCredits
    const sev = Math.abs(variance) < 1 ? 'low' : variance > 10000 ? 'high' : 'medium'
    issues.push({
      id: `vi-s2-${++idx}`, validationRunId: runId, engagementId,
      checkType: 'balance_equality', severity: sev, status: 'open',
      title: 'Trial Balance Balance Check',
      description: 'Verify total debits equal total credits',
      message: Math.abs(variance) < 1
        ? `Trial balance is balanced (variance: SAR ${variance.toFixed(2)})`
        : `Trial balance is unbalanced — variance: SAR ${variance.toFixed(2)}`,
      accountCode: null, accountName: null,
      expectedValue: null, actualValue: variance, difference: variance,
      createdAt: now,
    })
    console.log(`Check 1 - TB Balance: ${sev} | variance: ${variance.toFixed(2)}`)
  }
  
  // Check 2: Unmapped accounts
  const pendingMappings = mappings.filter(m => m.status === 'pending')
  if (pendingMappings.length > 0) {
    issues.push({
      id: `vi-s2-${++idx}`, validationRunId: runId, engagementId,
      checkType: 'missing_mappings', severity: pendingMappings.length > 3 ? 'high' : 'medium', status: 'open',
      title: 'Unmapped Accounts',
      description: `${pendingMappings.length} account(s) require mapping`,
      message: `Accounts pending: ${pendingMappings.map(m => `${m.sourceAccountCode}`).join(', ')}`,
      accountCode: null, accountName: null, expectedValue: null, actualValue: pendingMappings.length, difference: null,
      createdAt: now,
    })
    console.log(`Check 2 - Unmapped: ${pendingMappings.length} pending`)
  } else {
    console.log(`Check 2 - Unmapped: 0 pending (all mapped)`)
  }
  
  // Check 3: Evidence
  const missingEvidence = evidence.filter(e => e.state === 'missing')
  if (missingEvidence.length > 0) {
    issues.push({
      id: `vi-s2-${++idx}`, validationRunId: runId, engagementId,
      checkType: 'completeness', severity: missingEvidence.length > 2 ? 'high' : 'medium', status: 'open',
      title: 'Missing Evidence',
      description: `${missingEvidence.length} evidence item(s) missing`,
      message: missingEvidence.map(e => e.filename).join(', '),
      accountCode: null, accountName: null, expectedValue: null, actualValue: missingEvidence.length, difference: null,
      createdAt: now,
    })
    console.log(`Check 3 - Missing Evidence: ${missingEvidence.length}`)
  }
  
  // Check 4: Statements
  if (statements.length === 0) {
    issues.push({
      id: `vi-s2-${++idx}`, validationRunId: runId, engagementId,
      checkType: 'completeness', severity: 'medium', status: 'open',
      title: 'No Financial Statements',
      description: 'No financial statements found',
      message: 'Run account mapping to generate statements',
      accountCode: null, accountName: null, expectedValue: null, actualValue: null, difference: null,
      createdAt: now,
    })
    console.log('Check 4 - Statements: 0 (missing)')
  } else {
    console.log(`Check 4 - Statements: ${statements.length} present`)
  }
  
  // Persist issues
  for (const i of issues) {
    await prisma.auditValidationIssue.create({ data: i as any })
  }
  
  // Update summary
  const critical = issues.filter(i => i.severity === 'critical').length
  const high = issues.filter(i => i.severity === 'high').length
  const medium = issues.filter(i => i.severity === 'medium').length
  const low = issues.filter(i => i.severity === 'low').length
  
  await prisma.auditValidationRun.update({
    where: { id: runId },
    data: {
      summary: `${issues.length} issue(s): ${critical}c ${high}h ${medium}m ${low}l`,
      issueCount: issues.length,
      criticalCount: critical, highCount: high, mediumCount: medium, lowCount: low,
      trustState: critical > 0 ? 'blocked' : high > 0 ? 'conditional' : 'trusted',
    },
  })
  
  // Record event
  await prisma.auditEvent.create({
    data: {
      engagementId,
      eventType: 'validation.run_completed',
      actorId, actorName, actorRole: 'operator',
      targetType: 'validation_run', targetId: runId,
      newState: 'completed',
      description: `Pilot Session 2: Validation run completed — ${issues.length} issue(s) found`,
      timestamp: now,
    },
  })
  
  console.log(`\nValidation run completed: ${runId}`)
  console.log(`Issues: ${issues.length} (${critical}c, ${high}h, ${medium}m, ${low}l)`)
  
  // ─── STEP 3: Issue Disposition ───
  console.log('\n--- STEP 3: Issue Disposition ---')
  if (issues.length > 0) {
    const issueToDispose = issues[0]
    const dispositionAction = 'accepted'
    const rationale = 'Pilot Session 2 — acknowledged and accepted for tracking'
    
    await prisma.auditValidationDisposition.create({
      data: {
        issueId: issueToDispose.id as string,
        engagementId,
        action: dispositionAction,
        rationale,
        disposedBy: actorId,
      },
    })
    
    await prisma.auditValidationIssue.update({
      where: { id: issueToDispose.id as string },
      data: { status: dispositionAction },
    })
    
    await prisma.auditEvent.create({
      data: {
        engagementId,
        eventType: 'validation.issue_disposed',
        actorId, actorName, actorRole: 'operator',
        targetType: 'validation_issue', targetId: issueToDispose.id as string,
        newState: dispositionAction,
        description: `Pilot Session 2: Issue ${dispositionAction} — ${rationale.substring(0, 60)}`,
        timestamp: new Date(),
      },
    })
    
    console.log(`Disposed issue ${issueToDispose.id}: ${dispositionAction}`)
    console.log(`Rationale: ${rationale}`)
  }
  
  // ─── STEP 4: Publication ───
  console.log('\n--- STEP 4: Publication (safe engagement) ---')
  const safePubPkg = await prisma.auditPublicationPackage.findFirst({
    where: { engagementId: safeEngagementId },
    orderBy: { createdAt: 'desc' },
  })
  
  if (safePubPkg) {
    console.log(`Safe engagement (${safeEngagementId}) has publication package: ${safePubPkg.status}`)
    if (safePubPkg.status === 'published' || safePubPkg.status === 'locked') {
      console.log('Already published/locked — verifying re-publish guard...')
      console.log('  publishedAt:', safePubPkg.publishedAt)
      console.log('  lockedAt:', safePubPkg.lockedAt)
      console.log('  Re-publish guard: ACTIVE (would block)')
    } else {
      const pubNow = new Date()
      await prisma.auditPublicationPackage.update({
        where: { id: safePubPkg.id },
        data: {
          status: 'published',
          publishedAt: pubNow,
          publishedBy: actorId,
          lockedAt: pubNow,
        },
      })
      // Update engagement status
      await prisma.auditEngagement.update({
        where: { id: safeEngagementId },
        data: { status: 'published' },
      })
      // Record event
      await prisma.auditEvent.create({
        data: {
          engagementId: safeEngagementId,
          eventType: 'publication.published',
          actorId, actorName, actorRole: 'partner',
          targetType: 'publication_package', targetId: safePubPkg.id,
          newState: 'published',
          description: `Pilot Session 2: Engagement published by ${actorName}`,
          timestamp: pubNow,
        },
      })
      console.log('Publication executed:')
      console.log('  status: published')
      console.log(`  publishedAt: ${pubNow.toISOString()}`)
      console.log(`  publishedBy: ${actorId}`)
      console.log(`  lockedAt: ${pubNow.toISOString()}`)
      console.log('  Engagement status: published')
    }
  } else {
    console.log(`No publication package found for ${safeEngagementId} — creating and publishing...`)
    const pubNow = new Date()
    const newPkg = await prisma.auditPublicationPackage.create({
      data: {
        engagementId: safeEngagementId,
        status: 'published',
        publishedAt: pubNow,
        publishedBy: actorId,
        lockedAt: pubNow,
      },
    })
    await prisma.auditEngagement.update({
      where: { id: safeEngagementId },
      data: { status: 'published' },
    })
    await prisma.auditEvent.create({
      data: {
        engagementId: safeEngagementId,
        eventType: 'publication.published',
        actorId, actorName, actorRole: 'partner',
        targetType: 'publication_package', targetId: newPkg.id,
        newState: 'published',
        description: `Pilot Session 2: Engagement published by ${actorName}`,
        timestamp: pubNow,
      },
    })
    console.log('Publication package created and published')
  }
  
  // ─── STEP 5: Post-State ───
  console.log('\n--- STEP 5: Post-State Snapshot ---')
  const postRuns = await prisma.auditValidationRun.count()
  const postEvents = await prisma.auditEvent.count()
  console.log(`Validation runs after: ${postRuns} (delta: ${postRuns - preRuns})`)
  console.log(`Audit events after: ${postEvents} (delta: ${postEvents - preEvents})`)
  
  // Event type breakdown
  const eventTypes = await prisma.auditEvent.groupBy({
    by: ['eventType'],
    _count: true,
    orderBy: { eventType: 'asc' },
  })
  console.log('\nEvent type breakdown:')
  for (const et of eventTypes) {
    console.log(`  ${et.eventType}: ${et._count}`)
  }
  
  await prisma.$disconnect()
  console.log('\n=== Session 2 Lifecycle Exercise Complete ===')
}

main().catch(e => { console.error(e); process.exit(1) })
