import { describe, expect, it, jest, beforeEach } from "@jest/globals";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: jest.fn(),
  },
}));

jest.mock("@/lib/kernel", () => ({
  Kernel: {
    getInstance: jest.fn().mockReturnValue({
      isInitialized: jest.fn().mockReturnValue(false),
    }),
  },
}));

jest.mock("@/lib/observability/tracing", () => ({
  getTracingStatus: jest.fn().mockReturnValue({ initialized: true }),
}));


import { prisma } from "@/lib/prisma";

describe("platform health check route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 when database is healthy", async () => {
    (prisma.$queryRaw as jest.MockedFunction<typeof prisma.$queryRaw>).mockResolvedValue([{ "?column?": 1 }]);

    const { GET } = await import("../route");
    const res = await GET();
    const body = (await res.json()) as {
      status: string;
      checks: Record<string, { status: string }>;
      version: string;
      timestamp: string;
    };

    expect(res.status).toBe(200);
    expect(body.status).toBe("healthy");
    expect(body.checks.database.status).toBe("ok");
  });

  it("returns 503 when database check fails", async () => {
    (prisma.$queryRaw as jest.MockedFunction<typeof prisma.$queryRaw>).mockRejectedValue(
      new Error("connection refused"),
    );

    const { GET } = await import("../route");
    const res = await GET();
    const body = (await res.json()) as {
      status: string;
      checks: Record<string, { status: string; error?: string }>;
    };

    expect(res.status).toBe(503);
    expect(body.status).toBe("degraded");
    expect(body.checks.database.status).toBe("error");
    expect(body.checks.database.error).toBe("connection refused");
  });

  it("includes all check results in response", async () => {
    (prisma.$queryRaw as jest.MockedFunction<typeof prisma.$queryRaw>).mockResolvedValue([{ "?column?": 1 }]);

    const { GET } = await import("../route");
    const res = await GET();
    const body = (await res.json()) as {
      checks: Record<string, { status: string; latencyMs?: number }>;
      timestamp: string;
    };

    expect(body.checks).toBeDefined();
    expect(body.checks.database).toBeDefined();
    expect(body.checks.database.latencyMs).toBeGreaterThanOrEqual(0);
    expect(typeof body.timestamp).toBe("string");
  });

  it("includes version number", async () => {
    (prisma.$queryRaw as jest.MockedFunction<typeof prisma.$queryRaw>).mockResolvedValue([{ "?column?": 1 }]);

    const { GET } = await import("../route");
    const res = await GET();
    const body = (await res.json()) as { version: string };

    expect(body.version).toBe("0.1.0");
  });
});
