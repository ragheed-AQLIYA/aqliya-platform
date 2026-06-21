/**
 * GAP-07 — API Route Smoke Tests
 *
 * Unit-level smoke tests that import route handlers directly and verify
 * security boundaries without requiring a running server or database.
 */

// ─── Mocks (must be declared before imports) ───

jest.mock("next-auth/jwt", () => ({
  getToken: jest.fn(),
  encode: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    auditEvidence: {
      findUnique: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  },
}));

jest.mock("@/lib/auth/encryption", () => ({
  encrypt: jest.fn((v: string) => `enc:${v}`),
  decrypt: jest.fn((v: string) => v.replace("enc:", "")),
}));

jest.mock("@/lib/auth/mfa", () => ({
  verifyMFAToken: jest.fn().mockReturnValue(false),
  verifyBackupCode: jest.fn().mockReturnValue(false),
  generateMFASecret: jest.fn(),
}));

jest.mock("@/lib/auth/scim-service", () => ({
  listUsers: jest.fn(),
  createUser: jest.fn(),
}));

jest.mock("@/lib/audit/actor-context", () => ({
  getAuditActor: jest.fn().mockRejectedValue(new Error("Unauthenticated")),
}));

jest.mock("@/lib/audit/storage", () => ({
  getStorageProvider: jest.fn(() => ({
    retrieve: jest.fn(),
  })),
}));

jest.mock("@/lib/audit/rate-limit", () => ({
  enforceAuditRateLimit: jest.fn(),
}));

jest.mock("@/lib/download-token", () => ({
  verifyDownloadToken: jest.fn(),
}));

jest.mock("@/lib/platform/audit-logger", () => ({
  auditLogger: jest.fn(() => ({ record: jest.fn() })),
  Product: { AUDIT: "audit" },
}));

jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest.fn(),
}));

jest.mock("@/lib/platform/logger", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

// ─── Imports (after mocks) ───

import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { CoreAccessControl } from "@/core/access/access-control";
import { resolveMfaGateState } from "@/lib/auth/mfa-gate";
import { resetMFARequiredRolesCache } from "@/lib/auth/mfa-roles";

// Typed mock helpers
const mockGetToken = getToken as jest.MockedFunction<typeof getToken>;

// ─── Helper: build a minimal NextRequest ───

function makeRequest(
  url: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  } = {},
): NextRequest {
  return new NextRequest(url, {
    method: options.method ?? "GET",
    headers: options.headers ?? {},
    body: options.body,
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// Suite 1: MFA Verify Route
// ──────────────────────────────────────────────────────────────────────────────

describe("POST /api/auth/mfa/verify — route handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when no session token is present", async () => {
    mockGetToken.mockResolvedValueOnce(null);

    // Dynamic import to pick up mocks
    const { POST } = await import(
      "@/app/api/auth/mfa/verify/route"
    );

    const req = makeRequest("http://localhost/api/auth/mfa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "123456" }),
    });

    const response = await POST(req);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toMatchObject({ code: "UNAUTHENTICATED" });
  });

  it("exports a POST handler", async () => {
    const routeModule = await import(
      "@/app/api/auth/mfa/verify/route"
    );
    expect(typeof routeModule.POST).toBe("function");
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Suite 2: SCIM Users Route — auth guard
// ──────────────────────────────────────────────────────────────────────────────

describe("GET /api/scim/v2/users — auth guard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.SCIM_API_KEY;
  });

  it("returns 401 when Authorization header is missing", async () => {
    const { GET } = await import(
      "@/app/api/scim/v2/Users/route"
    );

    const req = makeRequest("http://localhost/api/scim/v2/Users");
    const response = await GET(req);

    expect(response.status).toBe(401);
  });

  it("returns 401 when Bearer token is wrong", async () => {
    process.env.SCIM_API_KEY = "correct-key-32-characters-exactly";

    const { GET } = await import(
      "@/app/api/scim/v2/Users/route"
    );

    const req = makeRequest("http://localhost/api/scim/v2/users", {
      headers: { Authorization: "Bearer wrong-key-32-characters-exactly" },
    });
    const response = await GET(req);

    expect(response.status).toBe(401);
  });

  it("exports GET and POST handlers", async () => {
    const routeModule = await import(
      "@/app/api/scim/v2/Users/route"
    );
    expect(typeof routeModule.GET).toBe("function");
    expect(typeof routeModule.POST).toBe("function");
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Suite 3: Evidence Download Route — auth guard
// ──────────────────────────────────────────────────────────────────────────────

describe("GET /api/audit/evidence/[evidenceId]/download — auth guard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when not authenticated (no token param, getAuditActor throws)", async () => {
    const { GET } = await import(
      "@/app/api/audit/evidence/[evidenceId]/download/route"
    );

    const req = makeRequest(
      "http://localhost/api/audit/evidence/test-id/download",
    );

    const response = await GET(req, {
      params: Promise.resolve({ evidenceId: "test-evidence-id" }),
    });

    expect(response.status).toBe(401);
  });

  it("exports a GET handler", async () => {
    const routeModule = await import(
      "@/app/api/audit/evidence/[evidenceId]/download/route"
    );
    expect(typeof routeModule.GET).toBe("function");
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Suite 4: CoreAccessControl — deny unknown actions
// ──────────────────────────────────────────────────────────────────────────────

describe("CoreAccessControl — deny unknown actions", () => {
  it("denies an unknown action with a descriptive reason", async () => {
    const ctrl = new CoreAccessControl();
    const result = await ctrl.check({
      userId: "user-1",
      organizationId: "org-1",
      resource: "audit",
      action: "unknown_action" as never,
      role: "VIEWER",
    });

    expect(result.decision).toBe("denied");
    expect(result.reason).toContain("unknown_action");
  });

  it("denies when role is null even for a known action", async () => {
    const ctrl = new CoreAccessControl();
    const result = await ctrl.check({
      userId: "user-1",
      organizationId: "org-1",
      resource: "audit",
      action: "read",
      role: null,
    });

    expect(result.decision).toBe("denied");
  });

  it("grants VIEWER read access", async () => {
    const ctrl = new CoreAccessControl();
    const result = await ctrl.check({
      userId: "user-1",
      organizationId: "org-1",
      resource: "audit",
      action: "read",
      role: "VIEWER",
    });

    expect(result.decision).toBe("granted");
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Suite 5: MFA gate challenge state
// ──────────────────────────────────────────────────────────────────────────────

describe("resolveMfaGateState — challenge flow", () => {
  beforeEach(() => {
    resetMFARequiredRolesCache();
    delete process.env.MFA_REQUIRED_ROLES;
  });

  afterEach(() => {
    resetMFARequiredRolesCache();
    delete process.env.MFA_REQUIRED_ROLES;
  });

  it("returns 'challenge' when ADMIN has MFA enabled but not verified", () => {
    const state = resolveMfaGateState({
      role: "ADMIN",
      mfaEnabled: true,
      mfaVerified: false,
      isExempt: false,
    });

    expect(state).toBe("challenge");
  });

  it("returns 'enroll' when OPERATOR has MFA not yet enabled", () => {
    const state = resolveMfaGateState({
      role: "OPERATOR",
      mfaEnabled: false,
      mfaVerified: false,
      isExempt: false,
    });

    expect(state).toBe("enroll");
  });

  it("returns 'allow' for exempt paths regardless of MFA state", () => {
    const state = resolveMfaGateState({
      role: "ADMIN",
      mfaEnabled: false,
      mfaVerified: false,
      isExempt: true,
    });

    expect(state).toBe("allow");
  });

  it("returns 'allow' when MFA is fully verified", () => {
    const state = resolveMfaGateState({
      role: "ADMIN",
      mfaEnabled: true,
      mfaVerified: true,
      isExempt: false,
    });

    expect(state).toBe("allow");
  });
});
