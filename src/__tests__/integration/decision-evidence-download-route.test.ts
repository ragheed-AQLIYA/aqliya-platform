import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import type { NextRequest } from "next/server";

// ── Module-level mocks ──

jest.mock("@/lib/auth", () => ({
  requireDecisionAccess: jest.fn(),
}));

jest.mock("@/core/access/server-action-guard", () => ({
  requireServerActionAccess: jest.fn(),
}));

jest.mock("@/lib/core/evidence", () => ({
  assertEvidenceDownloadAccess: jest.fn(),
}));

jest.mock("@/lib/platform/storage", () => ({
  getStorageProvider: jest.fn(),
}));

jest.mock("@/lib/platform/audit-logger", () => ({
  auditLogger: jest.fn(() => ({ record: jest.fn() })),
  Product: { DECISION_OS: "decision_os" },
}));

// ── Imports (picks up mocked modules) ──

import { requireDecisionAccess } from "@/lib/auth";
import { requireServerActionAccess } from "@/core/access/server-action-guard";
import { assertEvidenceDownloadAccess } from "@/lib/core/evidence";
import { getStorageProvider } from "@/lib/platform/storage";
import { auditLogger } from "@/lib/platform/audit-logger";

// ── Type helpers ──

type MockFn<T = unknown> = T extends (...args: infer A) => infer R
  ? jest.Mock<R, A>
  : jest.Mock;

function mock<T>(fn: T): jest.Mock {
  return fn as unknown as jest.Mock;
}

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: "user-1",
    email: "admin@test.com",
    name: "Admin User",
    role: "ADMIN",
    organizationId: "org-1",
    platformOrganizationId: "plat-1",
    organization: { id: "org-1", name: "Test Org" },
    ...overrides,
  };
}

function makeEvidence(overrides: Record<string, unknown> = {}) {
  return {
    id: "ev-1",
    decisionId: "dec-1",
    filename: "report.pdf",
    fileType: "application/pdf",
    fileSize: 1024,
    storageKey: "uploads/ev-1/report.pdf",
    ...overrides,
  };
}

function makeFile(overrides: Record<string, unknown> = {}) {
  return {
    content: Buffer.from("PDF content"),
    mimeType: "application/pdf",
    sizeBytes: 1024,
    ...overrides,
  };
}

// ── Tests ──

describe("GET /api/decisions/[decisionId]/evidence/[evidenceId]/download", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mock(requireServerActionAccess).mockResolvedValue(makeUser());
  });

  // ── 1. Authentication ──

  it("returns 401 when unauthenticated", async () => {
    mock(requireDecisionAccess).mockRejectedValue(new Error("Unauthenticated"));

    const { GET } = await import("@/app/api/decisions/[decisionId]/evidence/[evidenceId]/download/route");
    const req = new Request("http://localhost/api/decisions/dec-1/evidence/ev-1/download") as unknown as NextRequest;
    const response = await GET(req, {
      params: Promise.resolve({ decisionId: "dec-1", evidenceId: "ev-1" }),
    });

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ error: "Authentication required" });
  });

  // ── 2. Decision not found ──

  it("returns 404 when decision not found", async () => {
    mock(requireDecisionAccess).mockRejectedValue(new Error("Decision not found"));

    const { GET } = await import("@/app/api/decisions/[decisionId]/evidence/[evidenceId]/download/route");
    const req = new Request("http://localhost/api/decisions/dec-1/evidence/ev-1/download") as unknown as NextRequest;
    const response = await GET(req, {
      params: Promise.resolve({ decisionId: "dec-1", evidenceId: "ev-1" }),
    });

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body).toEqual({ error: "Decision not found" });
  });

  // ── 3. Access denied ──

  it("returns 403 when access denied", async () => {
    mock(requireDecisionAccess).mockRejectedValue(new Error("Access denied: user lacks permission"));

    const { GET } = await import("@/app/api/decisions/[decisionId]/evidence/[evidenceId]/download/route");
    const req = new Request("http://localhost/api/decisions/dec-1/evidence/ev-1/download") as unknown as NextRequest;
    const response = await GET(req, {
      params: Promise.resolve({ decisionId: "dec-1", evidenceId: "ev-1" }),
    });

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body).toEqual({ error: "Access denied: user lacks permission" });
  });

  // ── 4. Evidence not found (null from Prisma) ──

  it("returns 404 when evidence not found", async () => {
    mock(requireDecisionAccess).mockResolvedValue({
      user: makeUser(),
      organizationId: "org-1",
    });
    mock(assertEvidenceDownloadAccess).mockRejectedValue(
      new Error("Evidence not found"),
    );

    const { GET } = await import("@/app/api/decisions/[decisionId]/evidence/[evidenceId]/download/route");
    const req = new Request("http://localhost/api/decisions/dec-1/evidence/ev-1/download") as unknown as NextRequest;
    const response = await GET(req, {
      params: Promise.resolve({ decisionId: "dec-1", evidenceId: "ev-1" }),
    });

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body).toEqual({ error: "Evidence not found" });
  });

  // ── 5. Evidence with mismatched decisionId ──

  it("returns 404 when evidence decisionId does not match", async () => {
    mock(requireDecisionAccess).mockResolvedValue({
      user: makeUser(),
      organizationId: "org-1",
    });
    mock(assertEvidenceDownloadAccess).mockRejectedValue(
      new Error("Evidence not found"),
    );

    const { GET } = await import("@/app/api/decisions/[decisionId]/evidence/[evidenceId]/download/route");
    const req = new Request("http://localhost/api/decisions/dec-1/evidence/ev-1/download") as unknown as NextRequest;
    const response = await GET(req, {
      params: Promise.resolve({ decisionId: "dec-1", evidenceId: "ev-1" }),
    });

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body).toEqual({ error: "Evidence not found" });
  });

  // ── 6. Evidence with null storageKey ──

  it("returns 404 when evidence has no storage key", async () => {
    mock(requireDecisionAccess).mockResolvedValue({
      user: makeUser(),
      organizationId: "org-1",
    });
    mock(assertEvidenceDownloadAccess).mockRejectedValue(
      new Error("Evidence not found or no file stored"),
    );

    const { GET } = await import("@/app/api/decisions/[decisionId]/evidence/[evidenceId]/download/route");
    const req = new Request("http://localhost/api/decisions/dec-1/evidence/ev-1/download") as unknown as NextRequest;
    const response = await GET(req, {
      params: Promise.resolve({ decisionId: "dec-1", evidenceId: "ev-1" }),
    });

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body).toEqual({ error: "Evidence not found" });
  });

  // ── 7. Stored file not found ──

  it("returns 404 when stored file not found", async () => {
    mock(requireDecisionAccess).mockResolvedValue({
      user: makeUser(),
      organizationId: "org-1",
    });
    mock(assertEvidenceDownloadAccess).mockResolvedValue({
      id: "ev-1",
      filename: "report.pdf",
      fileType: "application/pdf",
      storageKey: "uploads/ev-1/report.pdf",
      organizationId: "org-1",
    });
    mock(getStorageProvider).mockReturnValue({
      retrieve: jest.fn().mockResolvedValue(null),
    });

    const { GET } = await import("@/app/api/decisions/[decisionId]/evidence/[evidenceId]/download/route");
    const req = new Request("http://localhost/api/decisions/dec-1/evidence/ev-1/download") as unknown as NextRequest;
    const response = await GET(req, {
      params: Promise.resolve({ decisionId: "dec-1", evidenceId: "ev-1" }),
    });

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body).toEqual({ error: "Stored file not found" });
  });

  // ── 8. Successful download ──

  it("returns 200 with file content and security headers", async () => {
    const user = makeUser();
    mock(requireDecisionAccess).mockResolvedValue({
      user,
      organizationId: "org-1",
    });
    const evidence = makeEvidence({ filename: "audit-report.pdf" });
    mock(assertEvidenceDownloadAccess).mockResolvedValue({
      id: evidence.id,
      filename: evidence.filename,
      fileType: evidence.fileType,
      storageKey: evidence.storageKey,
      organizationId: "org-1",
    });
    const file = makeFile({ content: Buffer.from("PDF binary data"), mimeType: "application/pdf", sizeBytes: 14 });
    mock(getStorageProvider).mockReturnValue({
      retrieve: jest.fn().mockResolvedValue(file),
    });
    mock(auditLogger).mockReturnValue({ record: jest.fn() });

    const { GET } = await import("@/app/api/decisions/[decisionId]/evidence/[evidenceId]/download/route");
    const req = new Request("http://localhost/api/decisions/dec-1/evidence/ev-1/download") as unknown as NextRequest;
    const response = await GET(req, {
      params: Promise.resolve({ decisionId: "dec-1", evidenceId: "ev-1" }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Disposition")).toContain('attachment; filename="audit-report.pdf"');
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("Content-Length")).toBe("14");

    const body = await response.text();
    expect(body).toBe("PDF binary data");
  });

  // ── 9. Audit log on successful download ──

  it("creates audit event on successful download", async () => {
    const user = makeUser({ id: "user-audit", name: "Auditable User", role: "ADMIN" });
    mock(requireDecisionAccess).mockResolvedValue({
      user,
      organizationId: "org-1",
    });
    mock(assertEvidenceDownloadAccess).mockResolvedValue({
      id: "ev-1",
      filename: "report.pdf",
      fileType: "application/pdf",
      storageKey: "uploads/ev-1/report.pdf",
      organizationId: "org-1",
    });
    mock(getStorageProvider).mockReturnValue({
      retrieve: jest.fn().mockResolvedValue(makeFile()),
    });
    const auditRecord = jest.fn();
    mock(auditLogger).mockReturnValue({ record: auditRecord });

    const { GET } = await import("@/app/api/decisions/[decisionId]/evidence/[evidenceId]/download/route");
    const req = new Request("http://localhost/api/decisions/dec-1/evidence/ev-1/download") as unknown as NextRequest;
    await GET(req, {
      params: Promise.resolve({ decisionId: "dec-1", evidenceId: "ev-1" }),
    });

    expect(mock(auditLogger)).toHaveBeenCalledWith(
      expect.objectContaining({
        productKey: "decision_os",
        sourceSystem: "decision_evidence_download",
      }),
    );
    expect(auditRecord).toHaveBeenCalledWith(
      "evidence.download",
      expect.objectContaining({ type: "decision_evidence" }),
      expect.objectContaining({ status: "success" }),
    );
  });

  // ── 10. Server error on storage failure ──

  it("returns 500 when storage retrieval throws", async () => {
    mock(requireDecisionAccess).mockResolvedValue({
      user: makeUser(),
      organizationId: "org-1",
    });
    mock(assertEvidenceDownloadAccess).mockResolvedValue({
      id: "ev-1",
      filename: "report.pdf",
      fileType: "application/pdf",
      storageKey: "uploads/ev-1/report.pdf",
      organizationId: "org-1",
    });
    mock(getStorageProvider).mockReturnValue({
      retrieve: jest.fn().mockRejectedValue(new Error("Storage connection failed")),
    });

    const { GET } = await import("@/app/api/decisions/[decisionId]/evidence/[evidenceId]/download/route");
    const req = new Request("http://localhost/api/decisions/dec-1/evidence/ev-1/download") as unknown as NextRequest;
    const response = await GET(req, {
      params: Promise.resolve({ decisionId: "dec-1", evidenceId: "ev-1" }),
    });

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({ error: "Failed to serve file" });
  });
});
