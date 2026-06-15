import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    auditPresentationPolicy: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    auditEngagement: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import {
  GENERIC_PRESENTATION_POLICY_V1,
  SHALFA_PILOT_PRESENTATION_POLICY_V1,
  getBuiltinPolicyBySlug,
} from "@/lib/audit/presentation/presentation-policy-types";
import {
  listPresentationPolicyTemplates,
  updateOrgPresentationPolicy,
  createOrgPresentationPolicyFromTemplate,
} from "@/lib/audit/presentation/presentation-policy-service";

describe("presentation policy service helpers", () => {
  it("exposes builtin templates for clone UI", () => {
    const templates = listPresentationPolicyTemplates();
    expect(templates).toHaveLength(2);
    expect(templates.map((t) => t.slug)).toContain("generic-v1");
    expect(templates.map((t) => t.slug)).toContain("shalfa-pilot-audited-v1");
  });

  it("loads shalfa template with pilot exclusion codes", () => {
    const policy = getBuiltinPolicyBySlug("shalfa-pilot-audited-v1");
    expect(policy?.revenue.operatingExclusionGlCodes).toEqual([
      "4401010004",
      "4601010003",
      "4701010001",
    ]);
    expect(policy?.otherIncome.targetNet).toBe(735_915);
  });

  it("generic template has no audited headline rules", () => {
    expect(GENERIC_PRESENTATION_POLICY_V1.headline.useAuditedHeadlineRules).toBe(
      false,
    );
    expect(
      SHALFA_PILOT_PRESENTATION_POLICY_V1.headline.useAuditedHeadlineRules,
    ).toBe(true);
  });

  it("generic template has empty affiliate GL codes (R-004 fix)", () => {
    expect(GENERIC_PRESENTATION_POLICY_V1.revenue.affiliateGlCodes).toEqual([]);
    expect(GENERIC_PRESENTATION_POLICY_V1.revenue.contractRevenueGlCodes).toEqual([]);
    expect(GENERIC_PRESENTATION_POLICY_V1.revenue.unbilledDuplicateGlCodes).toEqual([]);
    expect(GENERIC_PRESENTATION_POLICY_V1.revenue.operatingExclusionGlCodes).toEqual([]);
  });
});

describe("createOrgPresentationPolicyFromTemplate", () => {
  const mockedPrisma = jest.mocked(prisma);

  beforeEach(() => {
    mockedPrisma.auditPresentationPolicy.findFirst.mockReset();
    mockedPrisma.auditPresentationPolicy.create.mockReset();
  });

  it("clones from builtin template when slug is found in memory", async () => {
    mockedPrisma.auditPresentationPolicy.create.mockResolvedValue({
      id: "pol-custom-1",
      slug: "custom-v1",
      name: "Custom Policy",
      version: "custom-v1",
      isSystem: false,
      organizationId: "org-1",
    } as any);

    const result = await createOrgPresentationPolicyFromTemplate({
      organizationId: "org-1",
      templateSlug: "generic-v1",
      name: "Custom Policy",
    });

    expect(result.name).toBe("Custom Policy");
    expect(result.organizationId).toBe("org-1");
    expect(mockedPrisma.auditPresentationPolicy.findFirst).not.toHaveBeenCalled();
  });

  it("falls back to builtin generic when template not found anywhere", async () => {
    mockedPrisma.auditPresentationPolicy.findFirst.mockResolvedValue(null);
    mockedPrisma.auditPresentationPolicy.create.mockResolvedValue({
      id: "pol-fallback-1",
      slug: "fallback-v1",
      name: "Fallback Policy",
      version: "fallback-v1",
      isSystem: false,
      organizationId: "org-1",
    } as any);

    const result = await createOrgPresentationPolicyFromTemplate({
      organizationId: "org-1",
      templateSlug: "nonexistent-template",
      name: "Fallback Policy",
    });

    expect(result.name).toBe("Fallback Policy");
  });
});

describe("updateOrgPresentationPolicy", () => {
  const mockedPrisma = jest.mocked(prisma);

  beforeEach(() => {
    mockedPrisma.auditPresentationPolicy.findFirst.mockReset();
    mockedPrisma.auditPresentationPolicy.update.mockReset();
  });

  it("throws when policy not found or not editable", async () => {
    mockedPrisma.auditPresentationPolicy.findFirst.mockResolvedValue(null);

    await expect(
      updateOrgPresentationPolicy({
        organizationId: "org-1",
        policyId: "pol-nonexistent",
        fields: { name: "Renamed" },
      }),
    ).rejects.toThrow("Policy not found or not editable");
  });

  it("throws on invalid rules in database", async () => {
    mockedPrisma.auditPresentationPolicy.findFirst.mockResolvedValue({
      id: "pol-1",
      rules: { invalid: "no slug" },
      isSystem: false,
      organizationId: "org-1",
    } as any);

    await expect(
      updateOrgPresentationPolicy({
        organizationId: "org-1",
        policyId: "pol-1",
        fields: { name: "Renamed" },
      }),
    ).rejects.toThrow("Invalid policy rules in database");
  });

  it("updates existing policy when found", async () => {
    const existingPolicy = {
      id: "pol-1",
      slug: "custom-v1",
      name: "Original Policy",
      version: "custom-v1",
      rules: {
        slug: "custom-v1",
        name: "Original Policy",
        version: "custom-v1",
        revenue: { operatingExclusionGlCodes: [], affiliateGlCodes: [], contractRevenueGlCodes: [], unbilledDuplicateGlCodes: [], excludeAffiliateFromOperatingHeadline: false },
        costOfRevenue: { exclusionGlCodes: [], exclusionPrefixPatterns: [] },
        otherIncome: { miscNettingGlCode: null, targetNet: null },
        finance: { netOffset: null },
        headline: { useOperatingRevenueLabel: false, useAuditedHeadlineRules: false },
      },
      isSystem: false,
      organizationId: "org-1",
    };

    mockedPrisma.auditPresentationPolicy.findFirst.mockResolvedValue(existingPolicy as any);
    mockedPrisma.auditPresentationPolicy.update.mockResolvedValue({
      id: "pol-1",
      slug: "custom-v1",
      name: "Renamed Policy",
      version: "custom-v1",
      isSystem: false,
      organizationId: "org-1",
    } as any);

    const result = await updateOrgPresentationPolicy({
      organizationId: "org-1",
      policyId: "pol-1",
      fields: { name: "Renamed Policy" },
    });

    expect(result.name).toBe("Renamed Policy");
    expect(mockedPrisma.auditPresentationPolicy.update).toHaveBeenCalledTimes(1);
  });
});
