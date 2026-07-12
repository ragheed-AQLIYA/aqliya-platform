/**
 * Security-Critical: Decision Evidence Download — Tenant Mismatch 404 Tests
 *
 * Verifies that /api/decisions/[decisionId]/evidence/[evidenceId]/download
 * returns 404 (not 403) when the decision belongs to a different organization,
 * preventing information disclosure about resource existence (H-04 fix).
 */

jest.mock("@/lib/prisma", () => ({
  prisma: {
    decision: { findUnique: jest.fn() },
  },
}));

const mockGetCurrentUser = jest.fn();
jest.mock("@/lib/auth", () => ({
  getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args),
}));

jest.mock("@/lib/authorization", () => ({
  enforce: jest.fn(),
}));

jest.mock("@/lib/core/evidence", () => ({
  assertEvidenceDownloadAccess: jest.fn(),
}));

jest.mock("@/lib/platform/storage", () => ({
  getStorageProvider: jest.fn(() => ({
    retrieve: jest.fn(),
  })),
}));

jest.mock("@/lib/platform/audit-logger", () => ({
  auditLogger: jest.fn(() => ({ record: jest.fn() })),
  Product: { DECISION_OS: "decision" },
}));

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { enforce } from "@/lib/authorization";
import { assertEvidenceDownloadAccess } from "@/lib/core/evidence";
import { GET } from "@/app/api/decisions/[decisionId]/evidence/[evidenceId]/download/route";

const mockPrisma = jest.mocked(prisma);
const mockEnforce = jest.mocked(enforce);
const mockAssertEvidence = jest.mocked(assertEvidenceDownloadAccess);

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: "user-1",
    email: "user@aqliya.com",
    name: "Test User",
    role: "OPERATOR",
    organizationId: "org-alpha",
    platformOrganizationId: "plat-alpha",
    organization: { id: "org-alpha", name: "Org Alpha" },
    ...overrides,
  };
}

function makeRequest(path: string): NextRequest {
  return new NextRequest(`http://localhost${path}`);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockEnforce.mockResolvedValue(undefined);
});

describe("GET /api/decisions/[decisionId]/evidence/[evidenceId]/download — Tenant Isolation (H-04)", () => {
  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockRejectedValue(new Error("Unauthenticated"));

    const req = makeRequest("/api/decisions/d1/evidence/e1/download");
    const response = await GET(req, {
      params: Promise.resolve({ decisionId: "d1", evidenceId: "e1" }),
    });

    expect(response.status).toBe(401);
  });

  it("returns 404 when decision does not exist (no info leak)", async () => {
    const user = makeUser();
    mockGetCurrentUser.mockResolvedValue(user);
    mockPrisma.decision.findUnique.mockResolvedValue(null);

    const req = makeRequest("/api/decisions/d1/evidence/e1/download");
    const response = await GET(req, {
      params: Promise.resolve({ decisionId: "d1", evidenceId: "e1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Decision not found");
  });

  it("returns 404 (NOT 403) when decision belongs to different org — no info leak", async () => {
    const user = makeUser({ organizationId: "org-alpha" });
    mockGetCurrentUser.mockResolvedValue(user);
    // Decision belongs to org-beta — attacker shouldn't know it exists
    mockPrisma.decision.findUnique.mockResolvedValue({
      organizationId: "org-beta",
    });

    const req = makeRequest("/api/decisions/d1/evidence/e1/download");
    const response = await GET(req, {
      params: Promise.resolve({ decisionId: "d1", evidenceId: "e1" }),
    });
    const body = await response.json();

    // CRITICAL: Must be 404, NOT 403 — returning 403 would reveal the resource exists
    expect(response.status).toBe(404);
    expect(body.error).toBe("Decision not found");
  });

  it("returns 404 when evidence access assertion fails", async () => {
    const user = makeUser();
    mockGetCurrentUser.mockResolvedValue(user);
    mockPrisma.decision.findUnique.mockResolvedValue({
      organizationId: "org-alpha",
    });
    mockAssertEvidence.mockRejectedValue(new Error("Evidence not found"));

    const req = makeRequest("/api/decisions/d1/evidence/e1/download");
    const response = await GET(req, {
      params: Promise.resolve({ decisionId: "d1", evidenceId: "e1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Evidence not found");
  });

  it("returns 403 only for explicit Access denied errors", async () => {
    const user = makeUser({ organizationId: "org-alpha" });
    mockGetCurrentUser.mockResolvedValue(user);
    mockPrisma.decision.findUnique.mockResolvedValue({
      organizationId: "org-alpha",
    });
    mockAssertEvidence.mockRejectedValue(
      new Error("Access denied: insufficient clearance"),
    );

    const req = makeRequest("/api/decisions/d1/evidence/e1/download");
    const response = await GET(req, {
      params: Promise.resolve({ decisionId: "d1", evidenceId: "e1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toContain("Access denied");
  });

  it("does not leak internal error details on storage failure", async () => {
    const user = makeUser();
    mockGetCurrentUser.mockResolvedValue(user);
    mockPrisma.decision.findUnique.mockResolvedValue({
      organizationId: "org-alpha",
    });
    mockAssertEvidence.mockResolvedValue({
      id: "ev-1",
      filename: "test.pdf",
      storageKey: "uploads/test.pdf",
      fileType: "application/pdf",
    });

    const { getStorageProvider } = require("@/lib/platform/storage");
    getStorageProvider.mockReturnValue({
      retrieve: jest.fn().mockRejectedValue(
        new Error("Prisma: connection refused to db.internal:5432"),
      ),
    });

    const req = makeRequest("/api/decisions/d1/evidence/e1/download");
    const response = await GET(req, {
      params: Promise.resolve({ decisionId: "d1", evidenceId: "e1" }),
    });
    const body = await response.json();

    // Should get a generic error, not internal details
    expect(response.status).toBe(500);
    expect(body.error.message).toBe("Service temporarily unavailable");
    expect(body.error.message).not.toContain("db.internal");
    expect(body.error.message).not.toContain("5432");
  });
});
