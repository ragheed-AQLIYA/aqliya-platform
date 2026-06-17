// ─── Tests: LocalContentOS Workbook Actions ───
// Tests the action wrapper shape for scoring and the export JSON shape.
// Uses mocked Prisma — no database required.

import type { LcWorkbookLine } from "@prisma/client";

// ─── Mocks (hoisted before imports) ───

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// Mock auth to avoid loading the full NextAuth chain (not needed for tested actions)
jest.mock("@/lib/auth", () => ({
  requireUserContext: jest.fn().mockResolvedValue({
    userId: "user-1",
    organizationId: "org-1",
    role: "admin",
  }),
}));

const mockLcWorkbookLineFindMany = jest.fn();
const mockLcWorkbookFindUnique = jest.fn();
const mockLcWorkbookUpdate = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    lcWorkbookLine: { findMany: mockLcWorkbookLineFindMany },
    lcWorkbook: { findUnique: mockLcWorkbookFindUnique, update: mockLcWorkbookUpdate },
    localContentProject: { findUnique: jest.fn() },
  },
}));

// ─── Imports (after mocks) ───

import { exportWorkbookJson } from "@/lib/local-content/workbook/services";
import { computeWorkbookScoreAction } from "@/actions/localcontent-workbook-actions";

// ─── Test Helpers ───

function mockLine(
  code: string,
  overrides?: Partial<LcWorkbookLine>,
): LcWorkbookLine {
  const section = code.startsWith("REV")
    ? "revenue"
    : code.startsWith("SPN")
      ? "supplier_spend"
      : code.startsWith("WRK")
        ? "workforce"
        : code.startsWith("AST")
          ? "assets"
          : "company_info";
  return {
    id: `line-${code}`,
    workbookId: "wb-1",
    section,
    code,
    name: `Line ${code}`,
    autoFillable: true,
    autoFilled: false,
    autoFillValue: null,
    autoFillSource: null,
    manualValue: null,
    source: "tb",
    confidence: "high",
    evidenceRequired: false,
    evidenceTypes: null,
    notes: null,
    displayOrder: 0,
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ─── Test: exportWorkbookJson ───

describe("exportWorkbookJson (services)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should include lcScore and lcScoreComputedAt when present", async () => {
    const mockData = {
      id: "wb-1",
      title: "Q1 2025 Workbook",
      reportingPeriod: "2025-Q1",
      status: "complete",
      completionPct: 85,
      totalLines: 20,
      autoFilledLines: 10,
      missingLines: 10,
      lcScore: 55.5,
      lcScoreComputedAt: new Date("2026-01-15T10:00:00.000Z"),
      projectId: "proj-1",
      templateId: null,
      metadata: null,
      exportedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lines: [
        mockLine("REV-01", { manualValue: 300_000_000, displayOrder: 1 }),
        mockLine("REV-03", { manualValue: 550_000_000, displayOrder: 2 }),
      ],
      project: {
        id: "proj-1",
        name: "Test Project",
        reportingPeriod: "2025-Q1",
        status: "active",
        organizationId: "org-1",
        description: null,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    mockLcWorkbookFindUnique.mockResolvedValue(mockData);

    const result = await exportWorkbookJson("wb-1");
    const json = result as Record<string, unknown>;
    const wb = json.workbook as Record<string, unknown>;

    expect(wb).toHaveProperty("lcScore");
    expect(wb.lcScore).toBe(55.5);
    expect(wb).toHaveProperty("lcScoreComputedAt");
    expect(wb.lcScoreComputedAt).toBe("2026-01-15T10:00:00.000Z");
  });

  it("should set lcScore and lcScoreComputedAt to null when no score exists", async () => {
    const mockData = {
      id: "wb-2",
      title: "Unscored Workbook",
      reportingPeriod: "2025-Q1",
      status: "draft",
      completionPct: 30,
      totalLines: 20,
      autoFilledLines: 5,
      missingLines: 15,
      lcScore: null,
      lcScoreComputedAt: null,
      projectId: "proj-1",
      templateId: null,
      metadata: null,
      exportedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lines: [mockLine("REV-01")],
      project: {
        id: "proj-1",
        name: "Test Project",
        reportingPeriod: "2025-Q1",
        status: "active",
        organizationId: "org-1",
        description: null,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    mockLcWorkbookFindUnique.mockResolvedValue(mockData);

    const result = await exportWorkbookJson("wb-2");
    const json = result as Record<string, unknown>;
    const wb = json.workbook as Record<string, unknown>;

    expect(wb).toHaveProperty("lcScore");
    expect(wb.lcScore).toBeNull();
    expect(wb).toHaveProperty("lcScoreComputedAt");
    expect(wb.lcScoreComputedAt).toBeNull();
  });

  it("should throw when workbook is not found", async () => {
    mockLcWorkbookFindUnique.mockResolvedValue(null);
    await expect(exportWorkbookJson("nonexistent")).rejects.toThrow(
      "Workbook not found",
    );
  });
});

// ─── Test: computeWorkbookScoreAction ───

describe("computeWorkbookScoreAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("success path", () => {
    it("should return ok:true with full score result shape", async () => {
      const lines = [
        mockLine("REV-01", { manualValue: 300_000_000 }),
        mockLine("REV-03", { manualValue: 550_000_000 }),
        mockLine("SPN-01", { manualValue: 100_000_000 }),
        mockLine("SPN-03", { manualValue: 200_000_000 }),
        mockLine("WRK-01", { manualValue: 30 }),
        mockLine("WRK-02", { manualValue: 100 }),
        mockLine("AST-01", { manualValue: 8_000_000 }),
        mockLine("AST-02", { manualValue: 10_000_000 }),
      ];

      mockLcWorkbookLineFindMany.mockResolvedValue(lines);
      mockLcWorkbookUpdate.mockResolvedValue({ id: "wb-1", lcScore: 50.75 });

      const result = await computeWorkbookScoreAction("wb-1");

      expect(result).toEqual({
        ok: true,
        data: expect.objectContaining({
          overallScore: 50.75,
          statusLabel: "جيد",
          metrics: expect.arrayContaining([
            expect.objectContaining({ code: "revenue" }),
            expect.objectContaining({ code: "supplier_spend" }),
            expect.objectContaining({ code: "workforce" }),
            expect.objectContaining({ code: "assets" }),
          ]),
          contributions: expect.any(Array),
          sectionBreakdown: expect.any(Array),
          computedAt: expect.any(String),
          summaryAr: expect.any(String),
        }),
      });
    });

    it("should have 4 contributions with code and effectiveWeight", async () => {
      const lines = [
        mockLine("REV-01", { manualValue: 100 }),
        mockLine("REV-03", { manualValue: 200 }),
        mockLine("SPN-01", { manualValue: 50 }),
        mockLine("SPN-03", { manualValue: 100 }),
        mockLine("WRK-01", { manualValue: 30 }),
        mockLine("WRK-02", { manualValue: 60 }),
        mockLine("AST-01", { manualValue: 40 }),
        mockLine("AST-02", { manualValue: 80 }),
      ];

      mockLcWorkbookLineFindMany.mockResolvedValue(lines);
      mockLcWorkbookUpdate.mockResolvedValue({});

      const result = await computeWorkbookScoreAction("wb-1");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.contributions).toHaveLength(4);
        for (const c of result.data.contributions!) {
          expect(c).toHaveProperty("code");
          expect(c).toHaveProperty("effectiveWeight");
          expect(c).toHaveProperty("contributionPct");
          expect(c).toHaveProperty("score");
        }
      }
    });

    it("should persist lcScore and lcScoreComputedAt to workbook", async () => {
      const lines = [
        mockLine("REV-01", { manualValue: 100 }),
        mockLine("REV-03", { manualValue: 200 }),
      ];

      mockLcWorkbookLineFindMany.mockResolvedValue(lines);
      mockLcWorkbookUpdate.mockResolvedValue({});

      await computeWorkbookScoreAction("wb-1");

      expect(mockLcWorkbookUpdate).toHaveBeenCalledTimes(1);
      expect(mockLcWorkbookUpdate).toHaveBeenCalledWith({
        where: { id: "wb-1" },
        data: {
          lcScore: 50,
          lcScoreComputedAt: expect.any(Date),
        },
      });
    });

    it("should return null overallScore when all data is missing", async () => {
      const lines = [
        mockLine("REV-01"),
        mockLine("REV-03"),
        mockLine("SPN-01"),
        mockLine("SPN-03"),
        mockLine("WRK-01"),
        mockLine("WRK-02"),
        mockLine("AST-01"),
        mockLine("AST-02"),
      ];

      mockLcWorkbookLineFindMany.mockResolvedValue(lines);
      mockLcWorkbookUpdate.mockResolvedValue({});

      const result = await computeWorkbookScoreAction("wb-1");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.overallScore).toBeNull();
        expect(result.data.statusLabel).toBe("لا توجد بيانات كافية");
        expect(result.data.metrics).toHaveLength(4);
        expect(result.data.contributions).toHaveLength(4);
        expect(result.data.sectionBreakdown).toBeDefined();
      }
    });

    it("should persist null lcScore when no data available", async () => {
      const lines = [mockLine("REV-01"), mockLine("REV-03")];

      mockLcWorkbookLineFindMany.mockResolvedValue(lines);
      mockLcWorkbookUpdate.mockResolvedValue({});

      await computeWorkbookScoreAction("wb-1");

      expect(mockLcWorkbookUpdate).toHaveBeenCalledWith({
        where: { id: "wb-1" },
        data: {
          lcScore: null,
          lcScoreComputedAt: expect.any(Date),
        },
      });
    });
  });

  describe("error path", () => {
    it("should return ok:false when prisma findMany throws", async () => {
      mockLcWorkbookLineFindMany.mockRejectedValue(
        new Error("DB connection failed"),
      );

      const result = await computeWorkbookScoreAction("wb-1");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe("DB connection failed");
      }
    });

    it("should return ok:false when prisma update throws after scoring", async () => {
      const lines = [
        mockLine("REV-01", { manualValue: 100 }),
        mockLine("REV-03", { manualValue: 200 }),
      ];

      mockLcWorkbookLineFindMany.mockResolvedValue(lines);
      mockLcWorkbookUpdate.mockRejectedValue(
        new Error("Update failed"),
      );

      const result = await computeWorkbookScoreAction("wb-1");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe("Update failed");
      }
    });
  });
});
