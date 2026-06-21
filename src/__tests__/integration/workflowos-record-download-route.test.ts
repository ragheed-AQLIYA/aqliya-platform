import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import type { NextRequest } from "next/server";

// ── Module-level mocks ──

jest.mock("@/lib/auth", () => ({
  requireUserContext: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    workflowRecord: { findUnique: jest.fn() },
    workflowEvidence: { findMany: jest.fn() },
    workflowAuditEvent: { findMany: jest.fn(), create: jest.fn() },
    workflowTemplate: { findUnique: jest.fn() },
  },
}));

// ── Imports (picks up mocked modules) ──

import { requireUserContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    email: "operator@test.com",
    name: "Operator User",
    role: "OPERATOR",
    organizationId: "org-1",
    platformOrganizationId: "plat-1",
    organization: { id: "org-1", name: "Test Org" },
    ...overrides,
  };
}

function makeRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "rec-1",
    organizationId: "org-1",
    templateId: "tpl-1",
    title: "Test Record",
    description: "A test workflow record",
    status: "completed",
    priority: "high",
    exportStatus: "approved",
    exportRequestedById: "user-1",
    createdAt: new Date("2026-06-01T00:00:00Z"),
    completedAt: new Date("2026-06-15T00:00:00Z"),
    ...overrides,
  };
}

function makeTemplate(overrides: Record<string, unknown> = {}) {
  return {
    id: "tpl-1",
    name: "Inspection Template",
    category: "quality",
    ...overrides,
  };
}

function makeEvidenceItem(overrides: Record<string, unknown> = {}) {
  return {
    id: "ev-1",
    organizationId: "org-1",
    recordId: "rec-1",
    filename: "photo.jpg",
    fileType: "image/jpeg",
    description: "Site photo",
    createdAt: new Date("2026-06-10T00:00:00Z"),
    ...overrides,
  };
}

function makeAuditEvent(overrides: Record<string, unknown> = {}) {
  return {
    id: "audit-1",
    organizationId: "org-1",
    recordId: "rec-1",
    actorId: "user-1",
    actorName: "Operator User",
    action: "status_changed",
    comment: "تم تغيير الحالة إلى مكتمل",
    fromStatus: "in_progress",
    toStatus: "completed",
    createdAt: new Date("2026-06-15T00:00:00Z"),
    ...overrides,
  };
}

// ── Tests ──

describe("GET /api/workflowos/records/[recordId]/download", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── 1. Authentication ──

  it("returns 401 when unauthenticated", async () => {
    mock(requireUserContext).mockRejectedValue(new Error("Unauthenticated"));

    const { GET } = await import("@/app/api/workflowos/records/[recordId]/download/route");
    const req = new Request("http://localhost/api/workflowos/records/rec-1/download") as unknown as NextRequest;
    const response = await GET(req, {
      params: Promise.resolve({ recordId: "rec-1" }),
    });

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ error: "Authentication required" });
  });

  // ── 2. Record not found ──

  it("returns 404 when record not found", async () => {
    mock(requireUserContext).mockResolvedValue(makeUser());
    mock(prisma.workflowRecord.findUnique).mockResolvedValue(null);

    const { GET } = await import("@/app/api/workflowos/records/[recordId]/download/route");
    const req = new Request("http://localhost/api/workflowos/records/rec-1/download") as unknown as NextRequest;
    const response = await GET(req, {
      params: Promise.resolve({ recordId: "rec-1" }),
    });

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body).toEqual({ error: "Record not found" });
  });

  // ── 3. Organization access denied ──

  it("returns 403 when record belongs to a different organization", async () => {
    mock(requireUserContext).mockResolvedValue(makeUser({ organizationId: "org-2" }));
    mock(prisma.workflowRecord.findUnique).mockResolvedValue(makeRecord({ organizationId: "org-1" }));

    const { GET } = await import("@/app/api/workflowos/records/[recordId]/download/route");
    const req = new Request("http://localhost/api/workflowos/records/rec-1/download") as unknown as NextRequest;
    const response = await GET(req, {
      params: Promise.resolve({ recordId: "rec-1" }),
    });

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body).toEqual({ error: "Access denied" });
  });

  // ── 4. Export not approved ──

  it("returns 403 when export status is not approved", async () => {
    mock(requireUserContext).mockResolvedValue(makeUser());
    mock(prisma.workflowRecord.findUnique).mockResolvedValue(
      makeRecord({ exportStatus: "requested" }),
    );

    const { GET } = await import("@/app/api/workflowos/records/[recordId]/download/route");
    const req = new Request("http://localhost/api/workflowos/records/rec-1/download") as unknown as NextRequest;
    const response = await GET(req, {
      params: Promise.resolve({ recordId: "rec-1" }),
    });

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body).toEqual({ error: "Export must be approved before download" });
  });

  // ── 5. Successful download ──

  it("returns 200 with JSON export file", async () => {
    const user = makeUser({ id: "user-success", name: "Success User" });
    mock(requireUserContext).mockResolvedValue(user);
    const record = makeRecord({
      title: "Inspection #42",
      description: "Site inspection report",
      status: "completed",
      priority: "high",
    });
    mock(prisma.workflowRecord.findUnique).mockResolvedValue(record);
    mock(prisma.workflowEvidence.findMany).mockResolvedValue([
      makeEvidenceItem({ filename: "photo.jpg", fileType: "image/jpeg", description: "Site photo" }),
    ]);
    mock(prisma.workflowAuditEvent.findMany).mockResolvedValue([
      makeAuditEvent({ action: "status_changed", actorName: "Operator User" }),
    ]);
    mock(prisma.workflowTemplate.findUnique).mockResolvedValue(
      makeTemplate({ name: "Inspection Template", category: "quality" }),
    );
    mock(prisma.workflowAuditEvent.create).mockResolvedValue({});

    const { GET } = await import("@/app/api/workflowos/records/[recordId]/download/route");
    const req = new Request("http://localhost/api/workflowos/records/rec-1/download") as unknown as NextRequest;
    const response = await GET(req, {
      params: Promise.resolve({ recordId: "rec-1" }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/json");
    expect(response.headers.get("Content-Disposition")).toContain('attachment; filename="');
    expect(response.headers.get("Content-Disposition")).toContain(".json");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");

    const body = await response.text();
    const parsed = JSON.parse(body);

    // Export header
    expect(parsed.exportedBy).toBe("Success User");
    expect(parsed.exportType).toBe("workflow_record");
    expect(parsed.organizationId).toBe("org-1");
    expect(parsed.source).toBe("workflowos");
    expect(parsed.version).toBe("1.0");
    expect(parsed.disclaimer).toContain("AI assists");

    // Record section
    expect(parsed.record.id).toBe("rec-1");
    expect(parsed.record.title).toBe("Inspection #42");
    expect(parsed.record.description).toBe("Site inspection report");
    expect(parsed.record.status).toBe("completed");
    expect(parsed.record.priority).toBe("high");
    expect(parsed.record.templateName).toBe("Inspection Template");
    expect(parsed.record.templateCategory).toBe("quality");

    // Evidence section
    expect(parsed.evidence).toHaveLength(1);
    expect(parsed.evidence[0].filename).toBe("photo.jpg");
    expect(parsed.evidence[0].fileType).toBe("image/jpeg");

    // Audit events
    expect(parsed.auditEvents).toHaveLength(1);
    expect(parsed.auditEvents[0].action).toBe("status_changed");
    expect(parsed.auditEvents[0].actorName).toBe("Operator User");

    // Governance disclaimer
    expect(parsed.governance.disclaimer).toContain("AI");
    expect(parsed.governance.localeNotice).toContain("هذا التقرير");
    expect(parsed.governance.aiAssists).toBe(true);
    expect(parsed.governance.humanDecides).toBe(true);
    expect(parsed.governance.evidenceGoverns).toBe(true);
  });

  // ── 6. Audit event created on download ──

  it("creates audit event on successful download", async () => {
    const user = makeUser({ id: "user-audit", name: "Export User" });
    mock(requireUserContext).mockResolvedValue(user);
    mock(prisma.workflowRecord.findUnique).mockResolvedValue(makeRecord());
    mock(prisma.workflowEvidence.findMany).mockResolvedValue([]);
    mock(prisma.workflowAuditEvent.findMany).mockResolvedValue([]);
    mock(prisma.workflowTemplate.findUnique).mockResolvedValue(makeTemplate());

    const { GET } = await import("@/app/api/workflowos/records/[recordId]/download/route");
    const req = new Request("http://localhost/api/workflowos/records/rec-1/download") as unknown as NextRequest;
    await GET(req, {
      params: Promise.resolve({ recordId: "rec-1" }),
    });

    expect(mock(prisma.workflowAuditEvent.create)).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizationId: "org-1",
          recordId: "rec-1",
          actorId: "user-audit",
          action: "export_downloaded",
          comment: "تم تنزيل التصدير",
        }),
      }),
    );
  });

  // ── 7. Server error on unexpected failure ──

  it("returns 500 on unexpected error", async () => {
    mock(requireUserContext).mockRejectedValue(new Error("Database connection lost"));

    const { GET } = await import("@/app/api/workflowos/records/[recordId]/download/route");
    const req = new Request("http://localhost/api/workflowos/records/rec-1/download") as unknown as NextRequest;
    const response = await GET(req, {
      params: Promise.resolve({ recordId: "rec-1" }),
    });

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({ error: "Export download failed" });
  });
});
