import { describe, it, expect, jest, beforeEach } from "@jest/globals";

// ─── Mocks (hoisted before imports) ───

const mockRequireUserContext = jest.fn();

jest.mock("@/lib/auth", () => ({
  requireUserContext: mockRequireUserContext,
  getCurrentUser: mockRequireUserContext,
  isExpectedAccessDeniedError: jest.fn(
    (error: Error) =>
      error?.message?.startsWith("Access denied:") ||
      error?.message === "Unauthenticated",
  ),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    workflowRecord: {
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    workflowAuditEvent: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    workflowEvidence: {
      findMany: jest.fn(),
    },
    workflowTemplate: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("@/lib/workflowos/notification-service", () => ({
  notifyExportRequested: jest.fn().mockResolvedValue([]),
  notifyExportApproved: jest.fn().mockResolvedValue({}),
  notifyExportRejected: jest.fn().mockResolvedValue({}),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// ─── Imports (pick up mocked modules) ───

import { prisma } from "@/lib/prisma";
import {
  requestWorkflowExport,
  approveWorkflowExport,
  rejectWorkflowExport,
  downloadWorkflowExport,
  getWorkflowExportStatus,
} from "@/actions/workflowos-export-actions";
import {
  notifyExportRequested,
  notifyExportApproved,
  notifyExportRejected,
} from "@/lib/workflowos/notification-service";

// ─── Type helpers ───

function mock<T>(fn: T): jest.Mock {
  return fn as unknown as jest.Mock;
}

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: "user-1",
    email: "user@test.com",
    name: "Test User",
    role: "ADMIN",
    organizationId: "org-1",
    platformOrganizationId: "plat-1",
    organization: { id: "org-1", name: "Test Org" },
    ...overrides,
  };
}

function makeWorkflowRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "record-1",
    organizationId: "org-1",
    templateId: "template-1",
    title: "Audit Report Q1",
    description: "Q1 audit report workflow record",
    status: "completed",
    currentStep: 5,
    steps: [],
    stepResults: {},
    priority: "high",
    dueDate: new Date("2026-07-01"),
    completedAt: new Date("2026-06-15"),
    exportStatus: "none",
    exportRequestedAt: null,
    exportRequestedById: null,
    exportApprovedAt: null,
    exportApprovedById: null,
    exportRejectedReason: null,
    escalatedAt: null,
    escalatedToId: null,
    createdById: "user-1",
    createdAt: new Date("2026-06-01"),
    updatedAt: new Date("2026-06-15"),
    ...overrides,
  };
}

function makeAuditEvent(overrides: Record<string, unknown> = {}) {
  return {
    id: "audit-1",
    organizationId: "org-1",
    recordId: "record-1",
    actorId: "user-1",
    actorName: "Test User",
    action: "export_requested",
    comment: "طلب تصدير السجل",
    metadata: null,
    createdAt: new Date("2026-06-15"),
    ...overrides,
  };
}

// ─── Tests ───

describe("WorkflowOS Export Flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── 1. Request Export ───

  describe("requestWorkflowExport", () => {
    it("requires authentication", async () => {
      mockRequireUserContext.mockRejectedValue(new Error("Unauthenticated"));

      const result = await requestWorkflowExport("record-1");

      expect(result.success).toBe(false);
    });

    it("requests export successfully for a completed record", async () => {
      const record = makeWorkflowRecord();
      mockRequireUserContext.mockResolvedValue(makeUser());
      mock(prisma.workflowRecord.findUnique).mockResolvedValue(record);
      mock(prisma.workflowRecord.update).mockResolvedValue({
        ...record,
        exportStatus: "requested",
        exportRequestedAt: new Date("2026-06-16"),
        exportRequestedById: "user-1",
      });
      mock(prisma.user.findUnique).mockResolvedValue(makeUser());
      mock(prisma.workflowAuditEvent.create).mockResolvedValue(
        makeAuditEvent(),
      );

      const result = await requestWorkflowExport("record-1");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.exportStatus).toBe("requested");
        expect(result.data.exportRequestedById).toBe("user-1");
      }
    });

    it("rejects export for non-completed record", async () => {
      const record = makeWorkflowRecord({ status: "in_progress" });
      mockRequireUserContext.mockResolvedValue(makeUser());
      mock(prisma.workflowRecord.findUnique).mockResolvedValue(record);

      const result = await requestWorkflowExport("record-1");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("المكتملة");
      }
    });

    it("rejects duplicate export request", async () => {
      const record = makeWorkflowRecord({ exportStatus: "requested" });
      mockRequireUserContext.mockResolvedValue(makeUser());
      mock(prisma.workflowRecord.findUnique).mockResolvedValue(record);

      const result = await requestWorkflowExport("record-1");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("قيد المراجعة");
      }
    });
  });

  // ─── 2. Approve/Reject Export ───

  describe("approveWorkflowExport", () => {
    it("requires authentication", async () => {
      mockRequireUserContext.mockRejectedValue(new Error("Unauthenticated"));

      const result = await approveWorkflowExport("record-1");

      expect(result.success).toBe(false);
    });

    it("approves a pending export request", async () => {
      const record = makeWorkflowRecord({
        exportStatus: "requested",
        exportRequestedById: "user-1",
      });
      const updatedRecord = {
        ...record,
        exportStatus: "approved",
        exportApprovedAt: new Date("2026-06-16"),
        exportApprovedById: "user-1",
      };
      mockRequireUserContext.mockResolvedValue(makeUser());
      mock(prisma.workflowRecord.findUnique).mockResolvedValue(record);
      mock(prisma.workflowRecord.update).mockResolvedValue(updatedRecord);
      mock(prisma.user.findUnique).mockResolvedValue(makeUser());
      mock(prisma.workflowAuditEvent.create).mockResolvedValue(
        makeAuditEvent({ action: "export_approved" }),
      );

      const result = await approveWorkflowExport("record-1");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.exportStatus).toBe("approved");
      }

      // Verify notification was sent
      expect(notifyExportApproved).toHaveBeenCalled();
    });

    it("rejects approval when no pending request exists", async () => {
      const record = makeWorkflowRecord({ exportStatus: "none" });
      mockRequireUserContext.mockResolvedValue(makeUser());
      mock(prisma.workflowRecord.findUnique).mockResolvedValue(record);

      const result = await approveWorkflowExport("record-1");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("لا يوجد");
      }
    });
  });

  describe("rejectWorkflowExport", () => {
    it("requires authentication", async () => {
      mockRequireUserContext.mockRejectedValue(new Error("Unauthenticated"));

      const result = await rejectWorkflowExport("record-1", "Missing documents");

      expect(result.success).toBe(false);
    });

    it("rejects a pending export request with reason", async () => {
      const record = makeWorkflowRecord({
        exportStatus: "requested",
        exportRequestedById: "user-1",
      });
      const updatedRecord = {
        ...record,
        exportStatus: "rejected",
        exportRejectedReason: "Missing supporting documents",
        exportApprovedAt: new Date("2026-06-16"),
        exportApprovedById: "user-1",
      };
      mockRequireUserContext.mockResolvedValue(makeUser());
      mock(prisma.workflowRecord.findUnique).mockResolvedValue(record);
      mock(prisma.workflowRecord.update).mockResolvedValue(updatedRecord);
      mock(prisma.user.findUnique).mockResolvedValue(makeUser());
      mock(prisma.workflowAuditEvent.create).mockResolvedValue(
        makeAuditEvent({ action: "export_rejected" }),
      );

      const result = await rejectWorkflowExport(
        "record-1",
        "Missing supporting documents",
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.exportStatus).toBe("rejected");
      }

      // Verify notification was sent
      expect(notifyExportRejected).toHaveBeenCalled();
      expect(notifyExportRejected).toHaveBeenCalledWith(
        record.id,
        record.title,
        record.organizationId,
        "user-1",
        expect.any(String),
        expect.any(String),
      );
    });

    it("requires a reason for rejection", async () => {
      const record = makeWorkflowRecord({ exportStatus: "requested" });
      mockRequireUserContext.mockResolvedValue(makeUser());
      mock(prisma.workflowRecord.findUnique).mockResolvedValue(record);

      const result = await rejectWorkflowExport("record-1", "");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("سبب");
      }
    });
  });

  // ─── 3. Download Export ───

  describe("downloadWorkflowExport", () => {
    it("requires authentication", async () => {
      mockRequireUserContext.mockRejectedValue(new Error("Unauthenticated"));

      const result = await downloadWorkflowExport("record-1");

      expect(result.success).toBe(false);
    });

    it("downloads an approved export with correct content", async () => {
      const record = makeWorkflowRecord({ exportStatus: "approved" });
      mockRequireUserContext.mockResolvedValue(makeUser());
      mock(prisma.workflowRecord.findUnique).mockResolvedValue(record);
      mock(prisma.workflowEvidence.findMany).mockResolvedValue([
        {
          filename: "source_doc.pdf",
          fileType: "pdf",
          description: "Source document",
          createdAt: new Date("2026-06-10"),
        },
      ]);
      mock(prisma.workflowAuditEvent.findMany).mockResolvedValue([
        {
          action: "export_requested",
          actorName: "Test User",
          comment: "طلب تصدير السجل",
          fromStatus: null,
          toStatus: null,
          createdAt: new Date("2026-06-15"),
        },
      ]);
      mock(prisma.workflowTemplate.findUnique).mockResolvedValue({
        name: "Audit Report",
        category: "audit",
      });
      mock(prisma.user.findUnique).mockResolvedValue(makeUser());
      mock(prisma.workflowAuditEvent.create).mockResolvedValue(
        makeAuditEvent({ action: "export_downloaded" }),
      );

      const result = await downloadWorkflowExport("record-1");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.mimeType).toBe("application/json");
        expect(result.data.filename).toContain("workflow_export_");
        expect(result.data.filename).toContain(".json");

        // Verify content structure
        const content = JSON.parse(result.data.content);
        expect(content.record.id).toBe("record-1");
        expect(content.record.title).toBe("Audit Report Q1");
        expect(content.record.templateName).toBe("Audit Report");
        expect(content.evidence).toHaveLength(1);
        expect(content.evidence[0].filename).toBe("source_doc.pdf");
        expect(content.auditEvents).toHaveLength(1);
        expect(content.governance.aiAssists).toBe(true);
        expect(content.governance.humanDecides).toBe(true);
        expect(content.governance.evidenceGoverns).toBe(true);
      }
    });

    it("rejects download when export not approved", async () => {
      const record = makeWorkflowRecord({ exportStatus: "requested" });
      mockRequireUserContext.mockResolvedValue(makeUser());
      mock(prisma.workflowRecord.findUnique).mockResolvedValue(record);

      const result = await downloadWorkflowExport("record-1");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("اعتماد");
      }
    });
  });

  // ─── 4. Tenant Isolation ───

  describe("tenant isolation", () => {
    it("prevents user from another org from requesting export", async () => {
      const record = makeWorkflowRecord({ organizationId: "org-other" });
      mockRequireUserContext.mockResolvedValue(
        makeUser({ organizationId: "org-1" }),
      );
      mock(prisma.workflowRecord.findUnique).mockResolvedValue(record);

      const result = await requestWorkflowExport("record-1");

      // assertRecordAccess throws when org IDs don't match
      expect(result.success).toBe(false);
    });

    it("prevents user from another org from approving export", async () => {
      const record = makeWorkflowRecord({
        organizationId: "org-other",
        exportStatus: "requested",
      });
      mockRequireUserContext.mockResolvedValue(
        makeUser({ organizationId: "org-1" }),
      );
      mock(prisma.workflowRecord.findUnique).mockResolvedValue(record);

      const result = await approveWorkflowExport("record-1");

      expect(result.success).toBe(false);
    });

    it("prevents user from another org from downloading export", async () => {
      const record = makeWorkflowRecord({
        organizationId: "org-other",
        exportStatus: "approved",
      });
      mockRequireUserContext.mockResolvedValue(
        makeUser({ organizationId: "org-1" }),
      );
      mock(prisma.workflowRecord.findUnique).mockResolvedValue(record);

      const result = await downloadWorkflowExport("record-1");

      expect(result.success).toBe(false);
    });
  });

  // ─── 5. Audit Trail ───

  describe("audit trail", () => {
    it("creates audit event on export request", async () => {
      const record = makeWorkflowRecord({ exportRequestedById: null });
      mockRequireUserContext.mockResolvedValue(makeUser());
      mock(prisma.workflowRecord.findUnique).mockResolvedValue(record);
      mock(prisma.workflowRecord.update).mockResolvedValue({
        ...record,
        exportStatus: "requested",
        exportRequestedAt: new Date("2026-06-16"),
        exportRequestedById: "user-1",
      });
      mock(prisma.user.findUnique).mockResolvedValue(makeUser());
      mock(prisma.workflowAuditEvent.create).mockResolvedValue(
        makeAuditEvent(),
      );

      await requestWorkflowExport("record-1");

      // Verify audit event was created with correct action
      expect(prisma.workflowAuditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "export_requested",
            recordId: "record-1",
            actorId: "user-1",
          }),
        }),
      );
    });

    it("creates audit event on export approval", async () => {
      const record = makeWorkflowRecord({
        exportStatus: "requested",
        exportRequestedById: "user-1",
      });
      mockRequireUserContext.mockResolvedValue(makeUser());
      mock(prisma.workflowRecord.findUnique).mockResolvedValue(record);
      mock(prisma.workflowRecord.update).mockResolvedValue({
        ...record,
        exportStatus: "approved",
      });
      mock(prisma.user.findUnique).mockResolvedValue(makeUser());
      mock(prisma.workflowAuditEvent.create).mockResolvedValue(
        makeAuditEvent({ action: "export_approved" }),
      );

      await approveWorkflowExport("record-1");

      expect(prisma.workflowAuditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "export_approved",
          }),
        }),
      );
    });

    it("creates audit event on export rejection", async () => {
      const record = makeWorkflowRecord({
        exportStatus: "requested",
        exportRequestedById: "user-1",
      });
      mockRequireUserContext.mockResolvedValue(makeUser());
      mock(prisma.workflowRecord.findUnique).mockResolvedValue(record);
      mock(prisma.workflowRecord.update).mockResolvedValue({
        ...record,
        exportStatus: "rejected",
      });
      mock(prisma.user.findUnique).mockResolvedValue(makeUser());
      mock(prisma.workflowAuditEvent.create).mockResolvedValue(
        makeAuditEvent({ action: "export_rejected" }),
      );

      await rejectWorkflowExport("record-1", "Missing data");

      expect(prisma.workflowAuditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "export_rejected",
          }),
        }),
      );
    });
  });
});
