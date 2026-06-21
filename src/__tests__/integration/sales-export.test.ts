import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import type { NextRequest } from "next/server";

// ─── Module-level mocks (jest.mock is hoisted above imports) ───

jest.mock("@/lib/auth", () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    salesAccount: { count: jest.fn() },
    salesDeal: { count: jest.fn(), findMany: jest.fn() },
    salesPipelineStage: { findMany: jest.fn() },
  },
}));

jest.mock("@/lib/platform/audit-logger", () => ({
  auditLogger: jest.fn(() => ({ record: jest.fn() })),
  Product: { SALES_OS: "sales_os" },
}));

// ─── Imports (pick up mocked modules) ───

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { auditLogger } from "@/lib/platform/audit-logger";

// ─── Type helpers ───

type MockFn<T = unknown> = T extends (...args: infer A) => infer R
  ? jest.Mock<R, A>
  : jest.Mock;

function mock<T>(fn: T): jest.Mock {
  return fn as unknown as jest.Mock;
}

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: "user-1",
    email: "user@test.com",
    name: "Test User",
    role: "VIEWER",
    organizationId: "org-1",
    platformOrganizationId: "plat-1",
    organization: { id: "org-1", name: "Test Org" },
    ...overrides,
  };
}

describe("GET /api/sales/export", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── 1. Authentication ───

  it("returns 401 when not authenticated", async () => {
    mock(getCurrentUser).mockRejectedValue(new Error("Unauthenticated"));

    const { GET } = await import("@/app/api/sales/export/route");
    const req = new Request("http://localhost/api/sales/export") as unknown as NextRequest;
    const response = await GET(req);

    expect(response.status).toBe(401);
    const text = await response.text();
    expect(text).toContain("Authentication required");
  });

  // ─── 2. Authorization ───

  it("returns 403 when user lacks salesos:read permission", async () => {
    mock(getCurrentUser).mockResolvedValue(makeUser({ role: "NONE" }));

    const { GET } = await import("@/app/api/sales/export/route");
    const req = new Request("http://localhost/api/sales/export") as unknown as NextRequest;
    const response = await GET(req);

    expect(response.status).toBe(403);
    const text = await response.text();
    expect(text).toContain("Access denied");
  });

  // ─── 3. Rate Limiting ───

  it("returns 429 after 10 rapid requests", async () => {
    const rateUser = makeUser({ id: "user-rate-limited" });
    mock(getCurrentUser).mockResolvedValue(rateUser);
    mock(prisma.salesAccount.count).mockResolvedValue(0);
    mock(prisma.salesDeal.count).mockResolvedValue(0);
    mock(prisma.salesPipelineStage.findMany).mockResolvedValue([]);
    mock(prisma.salesDeal.findMany).mockResolvedValue([]);

    const { GET } = await import("@/app/api/sales/export/route");
    const req = new Request("http://localhost/api/sales/export") as unknown as NextRequest;

    for (let i = 0; i < 10; i++) {
      const res = await GET(req.clone() as unknown as NextRequest);
      expect(res.status).toBe(200);
    }

    const res = await GET(req.clone() as unknown as NextRequest);
    expect(res.status).toBe(429);
    const text = await res.text();
    expect(text).toContain("Too many requests");
  });

  // ─── 4. Successful Export ───

  it("returns CSV with Content-Disposition header", async () => {
    const user = makeUser({ id: "user-success" });
    mock(getCurrentUser).mockResolvedValue(user);
    mock(prisma.salesAccount.count).mockResolvedValue(5);
    mock(prisma.salesDeal.count).mockResolvedValue(10);
    mock(prisma.salesPipelineStage.findMany).mockResolvedValue([
      { name: "Discovery", _count: { deals: 4 } },
      { name: "Proposal", _count: { deals: 6 } },
    ]);
    mock(prisma.salesDeal.findMany).mockResolvedValue([
      {
        title: "Deal 1",
        status: "open",
        amount: 10000,
        currency: "SAR",
        updatedAt: new Date("2026-06-01"),
        account: { name: "Account A" },
      },
    ]);

    const { GET } = await import("@/app/api/sales/export/route");
    const req = new Request("http://localhost/api/sales/export") as unknown as NextRequest;
    const response = await GET(req);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/csv; charset=utf-8");
    expect(response.headers.get("Content-Disposition")).toMatch(
      /^attachment; filename="salesos-export-\d+\.csv"$/,
    );
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");

    const body = await response.text();
    expect(body).toContain("# SalesOS Export —");
    expect(body).toContain("# Total accounts: 5");
    expect(body).toContain("# Total deals: 10");
    expect(body).toContain('# Stage "Discovery": 4 deals');
    expect(body).toContain('# Stage "Proposal": 6 deals');
    expect(body).toContain("title,account,status,amount,currency,updatedAt");
    expect(body).toContain('"Deal 1"');
    expect(body).toContain('"Account A"');
  });

  // ─── 5. Audit Log Verification ───

  it("creates audit event on successful export", async () => {
    const user = makeUser({ id: "user-audit" });
    mock(getCurrentUser).mockResolvedValue(user);
    mock(prisma.salesAccount.count).mockResolvedValue(0);
    mock(prisma.salesDeal.count).mockResolvedValue(0);
    mock(prisma.salesPipelineStage.findMany).mockResolvedValue([]);
    mock(prisma.salesDeal.findMany).mockResolvedValue([]);

    const { GET } = await import("@/app/api/sales/export/route");
    const req = new Request("http://localhost/api/sales/export") as unknown as NextRequest;
    await GET(req);

    expect(mock(auditLogger)).toHaveBeenCalledTimes(1);
    expect(mock(auditLogger)).toHaveBeenCalledWith(
      expect.objectContaining({
        productKey: "sales_os",
        sourceSystem: "sales_export",
      }),
    );

    const auditInstance = (auditLogger as unknown as jest.Mock).mock.results[0]?.value;
    expect(auditInstance.record).toHaveBeenCalledTimes(1);
    expect(auditInstance.record).toHaveBeenCalledWith(
      "export.dashboard",
      expect.objectContaining({
        type: "sales_dashboard_export",
        label: "SalesOS dashboard export",
      }),
      expect.objectContaining({
        metadata: expect.objectContaining({ format: "csv" }),
      }),
    );
  });
});
