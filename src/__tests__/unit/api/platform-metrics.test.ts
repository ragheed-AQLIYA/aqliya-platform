/**
 * Security-Critical: Platform Metrics API — Tenant Isolation + RBAC Tests
 *
 * Verifies that /api/metrics:
 * 1. Requires ADMIN role (returns 403 for non-admin)
 * 2. Returns 401 for unauthenticated users
 * 3. Scopes all Prisma queries by organizationId
 */

jest.mock("@/lib/prisma", () => ({
  prisma: {
    auditEngagement: {
      groupBy: jest.fn(),
      count: jest.fn(),
    },
    decision: {
      groupBy: jest.fn(),
      count: jest.fn(),
    },
    auditClient: { count: jest.fn() },
    auditEvidence: { count: jest.fn() },
  },
}));

const mockGetCurrentUser = jest.fn();
jest.mock("@/lib/auth", () => ({
  getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args),
  hasRequiredRole: (user: { role: string }, requiredRole: string): boolean => {
    if (requiredRole === "ADMIN") return user.role === "ADMIN";
    if (requiredRole === "OPERATOR") return ["OPERATOR", "ADMIN"].includes(user.role);
    return ["VIEWER", "OPERATOR", "ADMIN"].includes(user.role);
  },
}));

import { prisma } from "@/lib/prisma";
import { GET } from "@/app/api/metrics/route";

const mockPrisma = jest.mocked(prisma);

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: "user-1",
    email: "admin@aqliya.com",
    name: "Admin User",
    role: "ADMIN",
    organizationId: "org-alpha",
    platformOrganizationId: "plat-alpha",
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockPrisma.auditEngagement.groupBy.mockResolvedValue([]);
  mockPrisma.auditEngagement.count.mockResolvedValue(0);
  mockPrisma.decision.groupBy.mockResolvedValue([]);
  mockPrisma.decision.count.mockResolvedValue(0);
  mockPrisma.auditClient.count.mockResolvedValue(0);
  mockPrisma.auditEvidence.count.mockResolvedValue(0);
});

describe("GET /api/metrics — Authentication & Authorization", () => {
  it("returns 401 with UNAUTHENTICATED code when not authenticated", async () => {
    mockGetCurrentUser.mockRejectedValue(new Error("Unauthenticated"));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error.code).toBe("UNAUTHENTICATED");
  });

  it("returns 403 with FORBIDDEN code when user is not ADMIN", async () => {
    const user = makeUser({ role: "OPERATOR" });
    mockGetCurrentUser.mockResolvedValue(user);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error.code).toBe("FORBIDDEN");
  });

  it("returns 403 for VIEWER role", async () => {
    const user = makeUser({ role: "VIEWER" });
    mockGetCurrentUser.mockResolvedValue(user);

    const response = await GET();
    expect(response.status).toBe(403);
  });
});

describe("GET /api/metrics — Tenant Isolation", () => {
  it("scopes engagement groupBy by organizationId", async () => {
    const user = makeUser({ organizationId: "org-alpha" });
    mockGetCurrentUser.mockResolvedValue(user);

    await GET();

    expect(mockPrisma.auditEngagement.groupBy).toHaveBeenCalledWith({
      by: ["status"],
      where: { organizationId: "org-alpha" },
      _count: true,
    });
  });

  it("scopes decision groupBy by organizationId", async () => {
    const user = makeUser({ organizationId: "org-beta" });
    mockGetCurrentUser.mockResolvedValue(user);

    await GET();

    expect(mockPrisma.decision.groupBy).toHaveBeenCalledWith({
      by: ["status"],
      where: { organizationId: "org-beta" },
      _count: true,
    });
  });

  it("scopes totalEngagements count by organizationId", async () => {
    const user = makeUser({ organizationId: "org-alpha" });
    mockGetCurrentUser.mockResolvedValue(user);

    await GET();

    expect(mockPrisma.auditEngagement.count).toHaveBeenCalledWith({
      where: { organizationId: "org-alpha" },
    });
  });

  it("scopes totalClients count by organizationId", async () => {
    const user = makeUser({ organizationId: "org-alpha" });
    mockGetCurrentUser.mockResolvedValue(user);

    await GET();

    expect(mockPrisma.auditClient.count).toHaveBeenCalledWith({
      where: { organizationId: "org-alpha" },
    });
  });

  it("scopes totalEvidence count via engagement.organizationId", async () => {
    const user = makeUser({ organizationId: "org-alpha" });
    mockGetCurrentUser.mockResolvedValue(user);

    await GET();

    expect(mockPrisma.auditEvidence.count).toHaveBeenCalledWith({
      where: { engagement: { organizationId: "org-alpha" } },
    });
  });

  it("never queries without organizationId filter (cross-tenant guard)", async () => {
    const user = makeUser({ organizationId: "org-guard" });
    mockGetCurrentUser.mockResolvedValue(user);

    await GET();

    // Verify all count/groupBy calls include the correct org filter
    for (const call of mockPrisma.auditEngagement.groupBy.mock.calls) {
      expect(call[0].where).toEqual({ organizationId: "org-guard" });
    }
    for (const call of mockPrisma.auditEngagement.count.mock.calls) {
      expect(call[0].where).toEqual({ organizationId: "org-guard" });
    }
    for (const call of mockPrisma.decision.count.mock.calls) {
      expect(call[0].where).toEqual({ organizationId: "org-guard" });
    }
  });

  it("returns success response with metrics data", async () => {
    const user = makeUser({ organizationId: "org-alpha" });
    mockGetCurrentUser.mockResolvedValue(user);
    mockPrisma.auditEngagement.count.mockResolvedValue(5);
    mockPrisma.decision.count.mockResolvedValue(3);
    mockPrisma.auditClient.count.mockResolvedValue(2);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.totalEngagements).toBe(5);
    expect(body.data.totalDecisions).toBe(3);
    expect(body.data.totalClients).toBe(2);
    expect(body.meta.timestamp).toBeDefined();
  });

  it("returns 500 for unexpected database errors (sanitized)", async () => {
    const user = makeUser();
    mockGetCurrentUser.mockResolvedValue(user);
    mockPrisma.auditEngagement.groupBy.mockRejectedValue(
      new Error("Prisma: connection refused ECONNREFUSED localhost:5432"),
    );

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    // Must not leak connection string or internal details
    expect(body.error.message).not.toContain("ECONNREFUSED");
    expect(body.error.message).not.toContain("localhost:5432");
    expect(body.error.message).not.toContain("Prisma");
  });
});
