/**
 * Security-Critical: Evidence Download Routes — Sanitized Error Tests
 *
 * Verifies that evidence download routes across products:
 * 1. Use sanitizeError() for consistent, safe error responses
 * 2. Never leak internal details (storage paths, Prisma errors, file system errors)
 * 3. Return proper HTTP status codes based on error code
 */

const mockGetCurrentUser = jest.fn();
jest.mock("@/lib/auth", () => ({
  getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args),
}));

jest.mock("@/lib/kernel", () => ({
  enforce: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/lib/core/evidence", () => ({
  assertEvidenceDownloadAccess: jest.fn(),
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

jest.mock("@/lib/platform/storage", () => ({
  getStorageProvider: jest.fn(() => ({
    retrieve: jest.fn(),
  })),
}));

jest.mock("@/lib/platform/download", () => ({
  buildDownloadResponse: jest.fn(
    (input: { content: Buffer; filename: string; mimeType: string }) => {
      return new Response(input.content, {
        status: 200,
        headers: {
          "Content-Type": input.mimeType,
          "Content-Disposition": `attachment; filename="${input.filename}"`,
        },
      });
    },
  ),
}));

jest.mock("@/lib/local-content/guards", () => ({
  assertProjectAccess: jest.fn().mockResolvedValue({
    user: {
      id: "user-1",
      email: "user@test.com",
      name: "Test",
      role: "OPERATOR",
      organizationId: "org-alpha",
      platformOrganizationId: "plat-alpha",
    },
    project: {
      id: "proj-1",
      organizationId: "org-alpha",
      platformOrganizationId: "plat-alpha",
      clientWorkspaceId: null,
      projectId: "proj-1",
    },
  }),
}));

import { NextRequest } from "next/server";
import { assertEvidenceDownloadAccess } from "@/lib/core/evidence";
import { enforce } from "@/lib/kernel";

const mockAssertEvidence = jest.mocked(assertEvidenceDownloadAccess);
const mockEnforce = jest.mocked(enforce);

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
  mockEnforce.mockResolvedValue(undefined);
});

// ─── Audit Evidence Download ───
describe("GET /api/audit/evidence/[evidenceId]/download — Error Sanitization", () => {
  it("returns 401 when not authenticated (no token)", async () => {
    mockGetCurrentUser.mockRejectedValue(new Error("Unauthenticated"));
    const { GET } = await import(
      "@/app/api/audit/evidence/[evidenceId]/download/route"
    );

    const req = new NextRequest("http://localhost/api/audit/evidence/e1/download");
    const response = await GET(req, {
      params: Promise.resolve({ evidenceId: "e1" }),
    });

    expect(response.status).toBe(401);
  });

  it("sanitizes storage errors — no file path leak", async () => {
    const user = makeUser();
    mockGetCurrentUser.mockResolvedValue(user);
    mockAssertEvidence.mockResolvedValue({
      id: "ev-1",
      filename: "test.pdf",
      storageKey: "uploads/secret/path.pdf",
      fileType: "application/pdf",
    });

    const { getStorageProvider } = require("@/lib/audit/storage");
    getStorageProvider.mockReturnValue({
      retrieve: jest.fn().mockRejectedValue(
        new Error("ENOENT: no such file or directory '/uploads/secret/path.pdf'"),
      ),
    });

    const { GET } = await import(
      "@/app/api/audit/evidence/[evidenceId]/download/route"
    );
    const req = new NextRequest("http://localhost/api/audit/evidence/e1/download");
    const response = await GET(req, {
      params: Promise.resolve({ evidenceId: "e1" }),
    });
    const body = await response.json();

    // Must not leak file system paths
    expect(body.error).not.toContain("/uploads/secret");
    expect(body.error).not.toContain("ENOENT");
    expect(body.error).not.toContain("path.pdf");
  });

  it("sanitizes Prisma errors — no database details leak", async () => {
    const user = makeUser();
    mockGetCurrentUser.mockResolvedValue(user);
    mockAssertEvidence.mockRejectedValue(
      new Error("Prisma: Unique constraint failed on the fields: (`id`)"),
    );

    const { GET } = await import(
      "@/app/api/audit/evidence/[evidenceId]/download/route"
    );
    const req = new NextRequest("http://localhost/api/audit/evidence/e1/download");
    const response = await GET(req, {
      params: Promise.resolve({ evidenceId: "e1" }),
    });
    const body = await response.json();

    // Prisma details must never reach the client
    expect(body.error).not.toContain("Prisma");
    expect(body.error).not.toContain("Unique constraint");
    expect(body.error).not.toContain("fields:");
  });
});

// ─── Local Content Evidence Download ───
describe("GET /api/local-content/projects/[projectId]/evidence/[evidenceId]/download — Error Sanitization", () => {
  it("sanitizes storage errors — no internal paths leak", async () => {
    mockAssertEvidence.mockResolvedValue({
      id: "ev-2",
      filename: "report.xlsx",
      storageKey: "internal/s3/bucket/path.xlsx",
      fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const { getStorageProvider } = require("@/lib/platform/storage");
    getStorageProvider.mockReturnValue({
      retrieve: jest.fn().mockRejectedValue(
        new Error("S3 bucket 'prod-aqliya-evidence' access denied"),
      ),
    });

    const { GET } = await import(
      "@/app/api/local-content/projects/[projectId]/evidence/[evidenceId]/download/route"
    );
    const req = new NextRequest(
      "http://localhost/api/local-content/projects/p1/evidence/e2/download",
    );
    const response = await GET(req, {
      params: Promise.resolve({ projectId: "p1", evidenceId: "e2" }),
    });
    const body = await response.json();

    // S3 details must never reach the client
    expect(body.error).not.toContain("S3");
    expect(body.error).not.toContain("prod-aqliya-evidence");
    expect(body.error).not.toContain("bucket");
  });

  it("sanitizes generic errors to safe message", async () => {
    mockAssertEvidence.mockRejectedValue(
      new Error("Something truly unexpected happened at runtime"),
    );

    const { GET } = await import(
      "@/app/api/local-content/projects/[projectId]/evidence/[evidenceId]/download/route"
    );
    const req = new NextRequest(
      "http://localhost/api/local-content/projects/p1/evidence/e2/download",
    );
    const response = await GET(req, {
      params: Promise.resolve({ projectId: "p1", evidenceId: "e2" }),
    });

    // The error message gets sanitized via sanitizeError to a safe generic message
    const body = await response.json();
    // Verify no internal details leak
    expect(body.error).not.toContain("runtime");
    expect(body.error).not.toContain("unexpected");
  });

  it("returns 404 for evidence not found (not 500)", async () => {
    mockAssertEvidence.mockRejectedValue(new Error("Evidence not found"));

    const { GET } = await import(
      "@/app/api/local-content/projects/[projectId]/evidence/[evidenceId]/download/route"
    );
    const req = new NextRequest(
      "http://localhost/api/local-content/projects/p1/evidence/e2/download",
    );
    const response = await GET(req, {
      params: Promise.resolve({ projectId: "p1", evidenceId: "e2" }),
    });

    expect(response.status).toBe(404);
  });

  it("returns 403 for Access denied errors", async () => {
    mockEnforce.mockRejectedValue(
      new Error("Access denied: insufficient clearance"),
    );

    const { GET } = await import(
      "@/app/api/local-content/projects/[projectId]/evidence/[evidenceId]/download/route"
    );
    const req = new NextRequest(
      "http://localhost/api/local-content/projects/p1/evidence/e2/download",
    );
    const response = await GET(req, {
      params: Promise.resolve({ projectId: "p1", evidenceId: "e2" }),
    });

    expect(response.status).toBe(403);
  });
});

