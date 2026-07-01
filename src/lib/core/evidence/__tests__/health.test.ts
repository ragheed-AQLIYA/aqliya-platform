/** @jest-environment node */

const mockCount = jest.fn();
const mockGroupBy = jest.fn();
const mockFindMany = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    coreEvidence: {
      count: (...args: unknown[]) => mockCount(...args),
      groupBy: (...args: unknown[]) => mockGroupBy(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
    auditEvidence: { count: jest.fn(async () => 10), findMany: jest.fn(async () => []) },
    localContentEvidence: {
      count: jest.fn(async () => 5),
      findMany: jest.fn(async () => []),
    },
    auditEvidenceLink: { count: jest.fn(async () => 3) },
    evidenceLink: { count: jest.fn(async () => 2) },
  },
}));

import { getEvidenceHealthSnapshot } from "@/lib/core/evidence/health";

describe("Evidence health snapshot", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCount.mockImplementation(async (args?: { where?: { productSlug?: string } }) => {
      if (args?.where?.productSlug === "audit") return 8;
      if (args?.where?.productSlug === "local_content") return 4;
      return 12;
    });
    mockGroupBy.mockImplementation(async (args: { by: string[] }) => {
      if (args.by.includes("lifecycleStatus")) {
        return [
          { lifecycleStatus: "created", _count: { id: 7 } },
          { lifecycleStatus: "approved", _count: { id: 5 } },
        ];
      }
      return [
        { productSlug: "audit", _count: { id: 8 } },
        { productSlug: "local_content", _count: { id: 4 } },
      ];
    });
    mockFindMany.mockResolvedValue([]);
  });

  it("returns operational metrics and backfill coverage", async () => {
    const snapshot = await getEvidenceHealthSnapshot();

    expect(snapshot.totalCoreEvidence).toBe(12);
    expect(snapshot.backfillCoverage.audit.productTotal).toBe(10);
    expect(snapshot.backfillCoverage.audit.coreTotal).toBe(8);
    expect(snapshot.backfillCoverage.overall.percent).toBe(80);
    expect(snapshot.lifecycleDistribution.created).toBe(7);
    expect(snapshot.failedAdapterSyncs).toBe(3);
  });
});
