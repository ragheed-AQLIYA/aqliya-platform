/**
 * TB Intelligence commercial MVP path:
 * classify → suggested mappings → confirm → FS rebuild → firm memory.
 * Uses Jest in-memory Prisma mock (no live PostgreSQL required).
 */
import { prisma } from "@/lib/prisma";
import { classifyTrialBalanceRows } from "@/lib/tb-intelligence";
import {
  recordFirmMemoryFeedback,
  getLatestClassificationSources,
} from "@/lib/tb-intelligence/firm-memory";
import { resolveFirmMemoryOrganizationIdFromEngagement } from "@/lib/tb-intelligence/org-resolver";
import {
  createSuggestedMappingsForTrialBalance,
  confirmMapping,
  getMappings,
} from "@/lib/audit/db";

async function cleanupTbPipeline() {
  await prisma.tBMappingPattern.deleteMany();
  await prisma.tBMappingFeedback.deleteMany();
  await prisma.tBClassificationHistory.deleteMany();
  await prisma.auditFinancialStatement.deleteMany();
  await prisma.auditAccountMapping.deleteMany();
  await prisma.auditTrialBalanceLine.deleteMany();
  await prisma.auditTrialBalance.deleteMany();
  await prisma.auditEvent.deleteMany();
  await prisma.auditCanonicalAccount.deleteMany();
  await prisma.auditEngagement.deleteMany();
  await prisma.auditClient.deleteMany();
  await prisma.auditOrganization.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.platformOrganization.deleteMany();
}

describe("TB upload → mapping → FS integration", () => {
  beforeEach(async () => {
    await cleanupTbPipeline();
  });

  afterEach(async () => {
    await cleanupTbPipeline();
  });

  it("classifies via COA rules, creates mappings, confirms, rebuilds FS, records firm memory", async () => {
    const platformOrg = await prisma.platformOrganization.create({
      data: {
        slug: "tb-integ-plat",
        name: "TB Integ Platform",
        displayName: "TB Integ Platform",
      },
    });

    const org = await prisma.organization.create({
      data: {
        name: "TB Integ Org",
        platformOrganizationId: platformOrg.id,
      },
    });

    const auditOrg = await prisma.auditOrganization.create({
      data: {
        name: "TB Integ Audit Firm",
        slug: "tb-integ-audit",
        jurisdiction: "Saudi Arabia",
        regulatoryFramework: "IFRS for SMEs",
        platformOrganizationId: platformOrg.id,
      },
    });

    const client = await prisma.auditClient.create({
      data: {
        organizationId: auditOrg.id,
        name: "Demo Client",
        registrationNumber: "CR-TB-001",
        industry: "Trade",
        reportingFramework: "ifrs_for_smes",
        fiscalPeriodEnd: "12-31",
        currencyCode: "SAR",
      },
    });

    const engagement = await prisma.auditEngagement.create({
      data: {
        organizationId: auditOrg.id,
        clientId: client.id,
        fiscalPeriod: "FY2025",
        engagementType: "full_audit",
        status: "in_progress",
      },
    });

    const canonical = await prisma.auditCanonicalAccount.create({
      data: {
        id: "ca-cash-1010",
        code: "CA-1010",
        name: "Cash and Cash Equivalents",
        category: "asset",
        statementType: "balance_sheet",
        displayOrder: 1,
        reportingFramework: "ifrs_for_smes",
        version: "1",
      },
    });

    const classified = await classifyTrialBalanceRows(
      auditOrg.id,
      engagement.id,
      [
        {
          accountCode: "1101",
          accountName: "صندوق النقدية",
          debitAmount: 100_000,
          creditAmount: 0,
        },
      ],
      { enableCloudAi: false },
    );

    expect(classified).toHaveLength(1);
    expect(classified[0]?.classification?.source).toBe("rule");
    expect(classified[0]?.classification?.canonicalAccountId).toBe(canonical.id);

    const mappingCount = await createSuggestedMappingsForTrialBalance(
      engagement.id,
      auditOrg.id,
      classified
        .filter((c) => c.classification?.canonicalAccountId)
        .map((c) => ({
          accountCode: c.row.accountCode,
          accountName: c.row.accountName,
          debitAmount: c.row.debitAmount,
          creditAmount: c.row.creditAmount,
          canonicalAccountId: c.classification!.canonicalAccountId,
          confidence: c.classification!.confidence,
          source: c.classification!.source,
        })),
    );

    expect(mappingCount).toBe(1);

    const mappings = await getMappings(engagement.id);
    expect(mappings).toHaveLength(1);
    expect(mappings[0]?.classificationSource).toBe("rule");
    expect(mappings[0]?.confidence).toBeGreaterThan(0.8);

    const confirmed = await confirmMapping(engagement.id, mappings[0]!.id);
    expect(confirmed?.status).toBe("confirmed");

    const firmMemoryOrgId =
      await resolveFirmMemoryOrganizationIdFromEngagement(engagement.id);
    expect(firmMemoryOrgId).toBe(org.id);

    await recordFirmMemoryFeedback({
      organizationId: firmMemoryOrgId!,
      engagementId: engagement.id,
      clientAccountCode: "1101",
      clientAccountName: "صندوق النقدية",
      suggestedCanonicalId: canonical.id,
      acceptedCanonicalId: canonical.id,
      wasAccepted: true,
      reviewerId: "reviewer-1",
    });

    const pattern = await prisma.tBMappingPattern.findUnique({
      where: {
        organizationId_clientAccountCode: {
          organizationId: org.id,
          clientAccountCode: "1101",
        },
      },
    });
    expect(pattern?.canonicalAccountId).toBe(canonical.id);
    expect(pattern?.hitCount).toBe(1);

    const statements = await prisma.auditFinancialStatement.findMany({
      where: { engagementId: engagement.id },
    });
    expect(statements.length).toBe(3);
    expect(
      statements.some((s) => s.statementType === "balance_sheet"),
    ).toBe(true);

    const sources = await getLatestClassificationSources(engagement.id);
    expect(sources["1101"]).toBe("rule");
  });

  it("uses firm memory on second classification after confirm feedback", async () => {
    const platformOrg = await prisma.platformOrganization.create({
      data: {
        slug: "tb-integ-plat-2",
        name: "TB Integ Platform 2",
        displayName: "TB Integ Platform 2",
      },
    });

    const org = await prisma.organization.create({
      data: {
        name: "TB Integ Org 2",
        platformOrganizationId: platformOrg.id,
      },
    });

    const auditOrg = await prisma.auditOrganization.create({
      data: {
        name: "TB Integ Audit Firm 2",
        slug: "tb-integ-audit-2",
        jurisdiction: "Saudi Arabia",
        regulatoryFramework: "IFRS for SMEs",
        platformOrganizationId: platformOrg.id,
      },
    });

    const client = await prisma.auditClient.create({
      data: {
        organizationId: auditOrg.id,
        name: "Demo Client 2",
        registrationNumber: "CR-TB-002",
        industry: "Trade",
        reportingFramework: "ifrs_for_smes",
        fiscalPeriodEnd: "12-31",
        currencyCode: "SAR",
      },
    });

    const engagement = await prisma.auditEngagement.create({
      data: {
        organizationId: auditOrg.id,
        clientId: client.id,
        fiscalPeriod: "FY2025",
        engagementType: "full_audit",
        status: "in_progress",
      },
    });

    await prisma.auditCanonicalAccount.create({
      data: {
        id: "ca-cash-1010-b",
        code: "CA-1010",
        name: "Cash and Cash Equivalents",
        category: "asset",
        statementType: "balance_sheet",
        displayOrder: 1,
        reportingFramework: "ifrs_for_smes",
        version: "1",
      },
    });

    await prisma.tBMappingPattern.create({
      data: {
        organizationId: org.id,
        clientAccountCode: "1101",
        clientAccountName: "صندوق النقدية",
        canonicalAccountId: "ca-cash-1010-b",
        hitCount: 10,
        lastConfidence: 0.99,
      },
    });

    const classified = await classifyTrialBalanceRows(
      auditOrg.id,
      engagement.id,
      [
        {
          accountCode: "1101",
          accountName: "صندوق النقدية",
          debitAmount: 50_000,
          creditAmount: 0,
        },
      ],
      { enableCloudAi: false },
    );

    expect(classified[0]?.classification?.source).toBe("firm_memory");
    expect(classified[0]?.classification?.confidence).toBe(0.99);
  });
});
