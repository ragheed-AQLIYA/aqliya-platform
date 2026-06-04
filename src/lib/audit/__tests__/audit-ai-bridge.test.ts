// @ts-nocheck
jest.mock("@/lib/prisma", () => ({
  prisma: {
    auditEngagement: { findUnique: jest.fn() },
    auditOrganization: { findUnique: jest.fn() },
  },
}));

jest.mock("@/lib/ai/orchestrator", () => ({
  aiOrchestrator: { generate: jest.fn() },
}));

jest.mock("@/lib/platform/feature-flags/registry", () => ({
  isEnabled: jest.fn(() => false),
}));

jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest.fn().mockResolvedValue(undefined),
}));

import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { prisma } from "@/lib/prisma";
import { aiOrchestrator } from "@/lib/ai/orchestrator";
import {
  resolveAuditAIContext,
  runGovernedAuditAI,
  isAuditAICoreEnabled,
} from "@/lib/audit/audit-ai-bridge";

describe("audit-ai-bridge (A1-09)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("isAuditAICoreEnabled reflects flags helper", () => {
    expect(typeof isAuditAICoreEnabled()).toBe("boolean");
  });

  it("resolveAuditAIContext maps platform org and rag query", async () => {
    (prisma.auditEngagement.findUnique as jest.Mock).mockResolvedValue({
      id: "eng-1",
      organizationId: "audit-org-1",
      fiscalPeriod: "FY2024",
      engagementType: "full_audit",
      client: { name: "Acme" },
    });
    (prisma.auditOrganization.findUnique as jest.Mock).mockResolvedValue({
      id: "audit-org-1",
      platformOrganizationId: "plat-org-1",
      name: "Firm A",
    });

    const ctx = await resolveAuditAIContext("eng-1");
    expect(ctx.platformOrganizationId).toBe("plat-org-1");
    expect(ctx.ragQuery).toContain("Acme");
    expect(ctx.ragQuery).toContain("AuditOS");
  });

  it("runGovernedAuditAI passes tenant + engagement to orchestrator", async () => {
    (prisma.auditEngagement.findUnique as jest.Mock).mockResolvedValue({
      id: "eng-1",
      organizationId: "audit-org-1",
      fiscalPeriod: "FY2024",
      engagementType: "full_audit",
      client: { name: "Acme" },
    });
    (prisma.auditOrganization.findUnique as jest.Mock).mockResolvedValue({
      id: "audit-org-1",
      platformOrganizationId: "plat-org-1",
      name: "Firm A",
    });

    const mockOutput = { id: "ai-1", suggestionType: "finding" };
    (aiOrchestrator.generate as jest.Mock).mockResolvedValue({
      response: { metadata: { outputs: [mockOutput] }, output: "" },
      providerId: "deterministic",
      warnings: [],
      governanceContext: {},
    });

    const result = await runGovernedAuditAI({
      engagementId: "eng-1",
      taskType: "audit_findings",
      userId: "user-1",
      userRole: "OPERATOR",
    });

    expect(aiOrchestrator.generate).toHaveBeenCalledWith(
      expect.objectContaining({
        engagementId: "eng-1",
        organizationId: "plat-org-1",
        userId: "user-1",
        taskType: "audit_findings",
        taskInput: expect.objectContaining({
          engagementId: "eng-1",
          query: expect.stringContaining("Acme"),
        }),
      }),
    );
    expect(result.outputs).toEqual([mockOutput]);
    expect(result.reviewRequired).toBe(true);
  });
});
