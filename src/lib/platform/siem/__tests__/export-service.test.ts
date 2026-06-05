jest.mock("@/lib/prisma", () => ({
  prisma: {
    platformAuditLog: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest.fn(),
}));

import { exportAuditLogs, getExportHistory } from "../export-service";
import type { SiemExportOptions } from "../types";

const mockedPrisma = jest.requireMock("@/lib/prisma").prisma;

describe("exportAuditLogs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns ok with zero events when no audit logs match", async () => {
    mockedPrisma.platformAuditLog.findMany.mockResolvedValue([]);
    const options: SiemExportOptions = {
      organizationId: "org-123",
      format: "json",
    };
    const result = await exportAuditLogs(options);
    expect(result.ok).toBe(true);
    expect(result.totalEvents).toBe(0);
    expect(result.jobId).toBeDefined();
  });

  it("returns ok with event count when audit logs exist", async () => {
    mockedPrisma.platformAuditLog.findMany.mockResolvedValue([
      {
        id: "log-1",
        platformOrganizationId: "org-123",
        productKey: "audit_os",
        action: "engagement.created",
        actorName: "Test User",
        severity: "info",
        status: "success",
        createdAt: new Date(),
        clientWorkspaceId: null,
        projectId: null,
        environment: "test",
        actorId: null,
        actorType: null,
        actorEmail: null,
        targetType: null,
        targetId: null,
        targetLabel: null,
        sourceSystem: null,
        sourceModel: null,
        sourceId: null,
        requestId: null,
        sessionId: null,
        ipAddress: null,
        userAgent: null,
        aiProvider: null,
        aiModel: null,
        aiPromptVersion: null,
        aiOutputReviewStatus: null,
        evidenceRefs: null,
        metadata: null,
        updatedAt: new Date(),
      },
    ]);
    const options: SiemExportOptions = {
      organizationId: "org-123",
      format: "json",
    };
    const result = await exportAuditLogs(options);
    expect(result.ok).toBe(true);
    expect(result.totalEvents).toBe(1);
    expect(result.jobId).toBeDefined();
  });

  it("returns ok:false on prisma error", async () => {
    mockedPrisma.platformAuditLog.findMany.mockRejectedValue(
      new Error("DB connection failed"),
    );
    const options: SiemExportOptions = {
      organizationId: "org-123",
      format: "json",
    };
    const result = await exportAuditLogs(options);
    expect(result.ok).toBe(false);
    expect(result.error).toContain("DB connection failed");
  });
});

describe("getExportHistory", () => {
  it("returns empty array when no jobs exist", async () => {
    const jobs = await getExportHistory("nonexistent-org");
    expect(jobs).toEqual([]);
  });
});
