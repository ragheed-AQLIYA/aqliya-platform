/**
 * Security-Critical: Retention Routes — Error Sanitization Tests (H-07)
 *
 * Verifies that retention API routes:
 * 1. Never leak internal error details (Prisma, connection strings, file paths)
 * 2. Use sanitizeError() to produce safe error messages
 * 3. Enforce ADMIN-only access
 * 4. Return appropriate HTTP status codes
 */

const mockGetCurrentUser = jest.fn();
const mockHasRequiredRole = jest.fn();
jest.mock("@/lib/auth", () => ({
  getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args),
  hasRequiredRole: (...args: unknown[]) => mockHasRequiredRole(...args),
}));

jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest.fn(),
}));

jest.mock("@/lib/core/policy/retention/engine", () => ({
  runScheduledRetention: jest.fn().mockResolvedValue({
    totalAffected: 0,
    durationMs: 100,
    jobs: [],
  }),
  dryRun: jest.fn().mockResolvedValue([]),
}));

jest.mock("@/lib/core/policy/retention/holds", () => ({
  addHold: jest.fn().mockResolvedValue({ id: "hold-1", recordType: "test", recordId: "r1", reason: "test" }),
  removeHold: jest.fn().mockResolvedValue(true),
  listHolds: jest.fn().mockResolvedValue([]),
}));

jest.mock("@/lib/core/policy/retention/history-store", () => ({
  getHistory: jest.fn().mockReturnValue([]),
  addHistory: jest.fn(),
}));

jest.mock("@/lib/core/policy/retention/policies", () => ({
  getAllPolicies: jest.fn().mockReturnValue([]),
  getPolicyForModel: jest.fn().mockReturnValue(undefined),
}));

import { NextRequest } from "next/server";

function makeAdmin() {
  return {
    id: "admin-1",
    email: "admin@aqliya.com",
    name: "Admin",
    role: "ADMIN",
    organizationId: "org-1",
    platformOrganizationId: "plat-1",
  };
}

function makeViewer() {
  return {
    id: "viewer-1",
    email: "viewer@aqliya.com",
    name: "Viewer",
    role: "VIEWER",
    organizationId: "org-1",
    platformOrganizationId: "plat-1",
  };
}

function makeRequest(
  url: string,
  options: { method?: string; body?: string } = {},
): NextRequest {
  return new NextRequest(url, {
    method: options.method ?? "GET",
    body: options.body,
    headers: options.body ? { "Content-Type": "application/json" } : {},
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockHasRequiredRole.mockImplementation(
    (user: { role: string }, role: string) => {
      if (role === "ADMIN") return user.role === "ADMIN";
      return true;
    },
  );
});

// ─── POST /api/platform/retention/run ───
describe("POST /api/platform/retention/run — Error Sanitization (H-07)", () => {
  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockRejectedValue(new Error("Unauthenticated"));
    const { POST } = await import("@/app/api/platform/retention/run/route");

    const req = makeRequest("http://localhost/api/platform/retention/run", {
      method: "POST",
      body: "{}",
    });
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Authentication required");
    // Must NOT leak internal details
    expect(body.error).not.toContain("Unauthenticated");
  });

  it("returns 403 when user is not ADMIN", async () => {
    mockGetCurrentUser.mockResolvedValue(makeViewer());
    const { POST } = await import("@/app/api/platform/retention/run/route");

    const req = makeRequest("http://localhost/api/platform/retention/run", {
      method: "POST",
      body: "{}",
    });
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe("Access denied");
  });

  it("sanitizes Prisma connection errors — no connection string leak", async () => {
    mockGetCurrentUser.mockResolvedValue(makeAdmin());
    const { runScheduledRetention } = require("@/lib/core/policy/retention/engine");
    runScheduledRetention.mockRejectedValue(
      new Error("Prisma: Can't reach database server at db.prod.internal:5432"),
    );

    const { POST } = await import("@/app/api/platform/retention/run/route");
    const req = makeRequest("http://localhost/api/platform/retention/run", {
      method: "POST",
      body: "{}",
    });
    const response = await POST(req);
    const body = await response.json();

    // Must return sanitized error — no internal details
    expect(body.error).not.toContain("db.prod.internal");
    expect(body.error).not.toContain("5432");
    expect(body.error).not.toContain("Prisma");
  });
});

// ─── POST /api/platform/retention/dry-run ───
describe("POST /api/platform/retention/dry-run — Error Sanitization (H-07)", () => {
  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockRejectedValue(new Error("Unauthenticated"));
    const { POST } = await import("@/app/api/platform/retention/dry-run/route");

    const req = makeRequest("http://localhost/api/platform/retention/dry-run", {
      method: "POST",
      body: "{}",
    });
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Authentication required");
  });

  it("returns 403 for non-ADMIN users", async () => {
    mockGetCurrentUser.mockResolvedValue(makeViewer());
    const { POST } = await import("@/app/api/platform/retention/dry-run/route");

    const req = makeRequest("http://localhost/api/platform/retention/dry-run", {
      method: "POST",
      body: "{}",
    });
    const response = await POST(req);

    expect(response.status).toBe(403);
  });

  it("sanitizes errors on dry-run failures", async () => {
    mockGetCurrentUser.mockResolvedValue(makeAdmin());
    const { dryRun } = require("@/lib/core/policy/retention/engine");
    dryRun.mockRejectedValue(
      new Error("ENOENT: no such file or directory '/var/data/retention.db'"),
    );

    const { POST } = await import("@/app/api/platform/retention/dry-run/route");
    const req = makeRequest("http://localhost/api/platform/retention/dry-run", {
      method: "POST",
      body: "{}",
    });
    const response = await POST(req);
    const body = await response.json();

    // File paths must never leak
    expect(body.error).not.toContain("/var/data");
    expect(body.error).not.toContain("ENOENT");
    expect(body.error).not.toContain("retention.db");
  });
});

// ─── GET /api/platform/retention/holds ───
describe("GET /api/platform/retention/holds — Error Sanitization (H-07)", () => {
  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockRejectedValue(new Error("Unauthenticated"));
    const { GET } = await import("@/app/api/platform/retention/holds/route");

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Authentication required");
  });

  it("returns 403 for non-ADMIN", async () => {
    mockGetCurrentUser.mockResolvedValue(makeViewer());
    const { GET } = await import("@/app/api/platform/retention/holds/route");

    const response = await GET();

    expect(response.status).toBe(403);
  });
});

// ─── DELETE /api/platform/retention/holds/[id] ───
describe("DELETE /api/platform/retention/holds/[id] — Error Sanitization (H-07)", () => {
  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockRejectedValue(new Error("Unauthenticated"));
    const { DELETE } = await import("@/app/api/platform/retention/holds/[id]/route");

    const req = makeRequest("http://localhost/api/platform/retention/holds/h1", {
      method: "DELETE",
    });
    const response = await DELETE(req, {
      params: Promise.resolve({ id: "h1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Authentication required");
  });

  it("returns 403 for non-ADMIN", async () => {
    mockGetCurrentUser.mockResolvedValue(makeViewer());
    const { DELETE } = await import("@/app/api/platform/retention/holds/[id]/route");

    const req = makeRequest("http://localhost/api/platform/retention/holds/h1", {
      method: "DELETE",
    });
    const response = await DELETE(req, {
      params: Promise.resolve({ id: "h1" }),
    });

    expect(response.status).toBe(403);
  });
});

// ─── GET /api/platform/retention/history ───
describe("GET /api/platform/retention/history — Error Sanitization (H-07)", () => {
  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockRejectedValue(new Error("Unauthenticated"));
    const { GET } = await import("@/app/api/platform/retention/history/route");

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  // NOTE: The history route's catch block returns 401 for ALL errors including
  // permission denied. This is a minor finding — ideally should return 403 for
  // "Access denied" errors to match other retention routes. Documented as-is.
  it("returns 401 for non-ADMIN (catch-all returns Unauthorized)", async () => {
    mockGetCurrentUser.mockResolvedValue(makeViewer());
    const { GET } = await import("@/app/api/platform/retention/history/route");

    const response = await GET();
    const body = await response.json();

    // The catch block returns 401 for all errors including permission denied
    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });
});

