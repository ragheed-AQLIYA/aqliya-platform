/**
 * Security-Critical: Local Content Metrics API — Tenant Isolation Tests
 *
 * Verifies that /api/local-content/metrics scopes all Prisma queries
 * by the authenticated user's organizationId, preventing cross-tenant data leakage.
 */

jest.mock("@/lib/prisma", () => ({
  prisma: {
    localContentProject: { count: jest.fn() },
    lcWorkbook: { count: jest.fn() },
    localContentSupplier: { count: jest.fn() },
    localContentSpendRecord: { count: jest.fn() },
    localContentEvidence: { count: jest.fn() },
    localContentFinding: { count: jest.fn() },
    localContentReview: { count: jest.fn() },
  },
}));

const mockGetCurrentUser = jest.fn();
jest.mock("@/lib/auth", () => ({
  getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args),
}));

import { prisma } from "@/lib/prisma";
import { GET } from "@/app/api/local-content/metrics/route";

const mockPrisma = jest.mocked(prisma);

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: "user-1",
    email: "user@aqliya.com",
    name: "Test User",
    role: "OPERATOR",
    organizationId: "org-alpha",
    platformOrganizationId: "plat-alpha",
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  // Default: all counts return 0
  mockPrisma.localContentProject.count.mockResolvedValue(0);
  mockPrisma.lcWorkbook.count.mockResolvedValue(0);
  mockPrisma.localContentSupplier.count.mockResolvedValue(0);
  mockPrisma.localContentSpendRecord.count.mockResolvedValue(0);
  mockPrisma.localContentEvidence.count.mockResolvedValue(0);
  mockPrisma.localContentFinding.count.mockResolvedValue(0);
  mockPrisma.localContentReview.count.mockResolvedValue(0);
});

describe("GET /api/local-content/metrics — Tenant Isolation", () => {
  it("returns 401 when user is not authenticated", async () => {
    mockGetCurrentUser.mockRejectedValue(new Error("Unauthenticated"));

    const response = await GET();

    expect(response.status).toBe(401);
  });

  it("scopes project count by organizationId", async () => {
    const user = makeUser({ organizationId: "org-alpha" });
    mockGetCurrentUser.mockResolvedValue(user);
    mockPrisma.localContentProject.count.mockResolvedValue(5);

    await GET();

    expect(mockPrisma.localContentProject.count).toHaveBeenCalledWith({
      where: { organizationId: "org-alpha" },
    });
  });

  it("scopes workbook count by project.organizationId", async () => {
    const user = makeUser({ organizationId: "org-alpha" });
    mockGetCurrentUser.mockResolvedValue(user);
    mockPrisma.lcWorkbook.count.mockResolvedValue(3);

    await GET();

    expect(mockPrisma.lcWorkbook.count).toHaveBeenCalledWith({
      where: { project: { organizationId: "org-alpha" } },
    });
  });

  it("scopes supplier count by project.organizationId", async () => {
    const user = makeUser({ organizationId: "org-beta" });
    mockGetCurrentUser.mockResolvedValue(user);

    await GET();

    expect(mockPrisma.localContentSupplier.count).toHaveBeenCalledWith({
      where: { project: { organizationId: "org-beta" } },
    });
  });

  it("scopes spend record count by project.organizationId", async () => {
    const user = makeUser({ organizationId: "org-gamma" });
    mockGetCurrentUser.mockResolvedValue(user);

    await GET();

    expect(mockPrisma.localContentSpendRecord.count).toHaveBeenCalledWith({
      where: { project: { organizationId: "org-gamma" } },
    });
  });

  it("scopes evidence count by project.organizationId", async () => {
    const user = makeUser({ organizationId: "org-alpha" });
    mockGetCurrentUser.mockResolvedValue(user);

    await GET();

    expect(mockPrisma.localContentEvidence.count).toHaveBeenCalledWith({
      where: { project: { organizationId: "org-alpha" } },
    });
  });

  it("scopes finding count by project.organizationId", async () => {
    const user = makeUser({ organizationId: "org-alpha" });
    mockGetCurrentUser.mockResolvedValue(user);

    await GET();

    expect(mockPrisma.localContentFinding.count).toHaveBeenCalledWith({
      where: { project: { organizationId: "org-alpha" } },
    });
  });

  it("scopes review count by project.organizationId", async () => {
    const user = makeUser({ organizationId: "org-alpha" });
    mockGetCurrentUser.mockResolvedValue(user);

    await GET();

    expect(mockPrisma.localContentReview.count).toHaveBeenCalledWith({
      where: { project: { organizationId: "org-alpha" } },
    });
  });

  it("returns Prometheus-format text with correct counts", async () => {
    const user = makeUser({ organizationId: "org-alpha" });
    mockGetCurrentUser.mockResolvedValue(user);
    mockPrisma.localContentProject.count.mockResolvedValue(10);
    mockPrisma.lcWorkbook.count.mockResolvedValue(5);
    mockPrisma.localContentSupplier.count.mockResolvedValue(3);
    mockPrisma.localContentSpendRecord.count.mockResolvedValue(20);
    mockPrisma.localContentEvidence.count.mockResolvedValue(7);
    mockPrisma.localContentFinding.count.mockResolvedValue(2);
    mockPrisma.localContentReview.count.mockResolvedValue(4);

    const response = await GET();
    const body = await response.text();

    expect(response.headers.get("Content-Type")).toContain("text/plain");
    expect(body).toContain("lcos_projects_total 10");
    expect(body).toContain("lcos_workbooks_total 5");
    expect(body).toContain("lcos_suppliers_total 3");
    expect(body).toContain("lcos_spend_records_total 20");
    expect(body).toContain("lcos_evidence_total 7");
    expect(body).toContain("lcos_findings_total 2");
    expect(body).toContain("lcos_reviews_total 4");
  });

  it("never queries without organizationId filter (cross-tenant guard)", async () => {
    const user = makeUser({ organizationId: "org-target" });
    mockGetCurrentUser.mockResolvedValue(user);

    await GET();

    // Every count call must include organizationId in its where clause
    const allCalls = [
      mockPrisma.localContentProject.count.mock.calls,
      mockPrisma.lcWorkbook.count.mock.calls,
      mockPrisma.localContentSupplier.count.mock.calls,
      mockPrisma.localContentSpendRecord.count.mock.calls,
      mockPrisma.localContentEvidence.count.mock.calls,
      mockPrisma.localContentFinding.count.mock.calls,
      mockPrisma.localContentReview.count.mock.calls,
    ];

    for (const calls of allCalls) {
      expect(calls.length).toBeGreaterThan(0);
      const where = calls[0][0]?.where;
      expect(where).toBeDefined();
      // Either direct organizationId or nested via project
      const hasOrgFilter =
        where?.organizationId === "org-target" ||
        where?.project?.organizationId === "org-target";
      expect(hasOrgFilter).toBe(true);
    }
  });
});
