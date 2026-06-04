// @ts-nocheck
jest.mock("@/lib/prisma", () => ({
  prisma: {
    workflowTemplate: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    workflowRecord: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    workflowEvidence: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    workflowAuditEvent: {
      create: jest.fn(),
    },
  },
}));

jest.mock("@/lib/auth", () => ({
  requireUserContext: jest.fn(),
  isExpectedAccessDeniedError: jest.fn().mockReturnValue(false),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

import { describe, expect, it, beforeEach } from "@jest/globals";
import { prisma } from "@/lib/prisma";
import { requireUserContext } from "@/lib/auth";
import {
  startWorkflowFromTemplate,
  workflow_listOrgRecords,
  uploadWorkflowEvidence,
  listWorkflowEvidence,
  getWorkflowDashboardStats,
  logWorkflowAuditEvent,
} from "@/actions/workflowos-actions";

describe("WorkflowOS Expansion", () => {
  const mockUser = {
    id: "user-1",
    organizationId: "org-1",
    role: "OPERATOR",
    email: "user@test.com",
    name: "Test User",
    organization: { id: "org-1", name: "Test Org" },
  };

  const mockTemplate = {
    id: "template-1",
    organizationId: "org-1",
    name: "Test Template",
    steps: [
      { name: "Step 1", assignee: "reviewer" },
      { name: "Step 2", assignee: "approver" },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (requireUserContext as jest.Mock).mockResolvedValue(mockUser);
  });

  describe("startWorkflowFromTemplate", () => {
    it("creates a WorkflowRecord with steps copied from template", async () => {
      (prisma.workflowTemplate.findUnique as jest.Mock).mockResolvedValue(mockTemplate);
      const createdRecord = {
        id: "record-1",
        organizationId: "org-1",
        templateId: "template-1",
        title: "Test Record",
        status: "pending",
        currentStep: 0,
        steps: mockTemplate.steps,
        stepResults: {},
        assignedToId: null,
        createdById: "user-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (prisma.workflowRecord.create as jest.Mock).mockResolvedValue(createdRecord);

      const result = await startWorkflowFromTemplate("template-1", "Test Record");

      expect(result.success).toBe(true);
      expect(result.data).toEqual(createdRecord);
      expect(prisma.workflowTemplate.findUnique).toHaveBeenCalledWith({
        where: { id: "template-1" },
      });
      expect(prisma.workflowRecord.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          organizationId: "org-1",
          templateId: "template-1",
          title: "Test Record",
          steps: mockTemplate.steps,
          createdById: "user-1",
        }),
      });
    });

    it("returns error if template not found", async () => {
      (prisma.workflowTemplate.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await startWorkflowFromTemplate("nonexistent", "Test Record");

      expect(result.success).toBe(false);
      expect(result.error).toBe("النموذج غير موجود");
    });

    it("returns error if template belongs to different organization", async () => {
      const otherOrgTemplate = { ...mockTemplate, organizationId: "org-2" };
      (prisma.workflowTemplate.findUnique as jest.Mock).mockResolvedValue(otherOrgTemplate);

      const result = await startWorkflowFromTemplate("template-1", "Test Record");

      expect(result.success).toBe(false);
      expect(result.error).toBe("لا تملك صلاحية الوصول لهذا النموذج");
    });
  });

  describe("workflow_listOrgRecords", () => {
    it("filters records by organizationId", async () => {
      const mockRecords = [
        {
          id: "record-1",
          organizationId: "org-1",
          title: "Record 1",
          status: "pending",
          currentStep: 0,
          steps: [],
          stepResults: {},
          priority: "medium",
          createdAt: new Date(),
          updatedAt: new Date(),
          template: { name: "Template 1" },
        },
        {
          id: "record-2",
          organizationId: "org-1",
          title: "Record 2",
          status: "in_progress",
          currentStep: 1,
          steps: [],
          stepResults: {},
          priority: "high",
          createdAt: new Date(),
          updatedAt: new Date(),
          template: { name: "Template 2" },
        },
      ];
      (prisma.workflowRecord.findMany as jest.Mock).mockResolvedValue(mockRecords);

      const result = await workflow_listOrgRecords("org-1");

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(prisma.workflowRecord.findMany).toHaveBeenCalledWith({
        where: { organizationId: "org-1" },
        include: { template: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      });
    });

    it("filters records by organizationId and status", async () => {
      (prisma.workflowRecord.findMany as jest.Mock).mockResolvedValue([]);

      await workflow_listOrgRecords("org-1", "completed");

      expect(prisma.workflowRecord.findMany).toHaveBeenCalledWith({
        where: { organizationId: "org-1", status: "completed" },
        include: { template: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      });
    });
  });

  // ─── L5: Evidence, Audit, Dashboard ──────────────────

  describe("logWorkflowAuditEvent", () => {
    it("creates an audit event", async () => {
      (prisma.workflowAuditEvent.create as jest.Mock).mockResolvedValue({
        id: "audit-1",
        action: "status_change",
      });

      const result = await logWorkflowAuditEvent({
        recordId: "record-1",
        organizationId: "org-1",
        actorId: "user-1",
        action: "status_change",
        fromStatus: "pending",
        toStatus: "in_progress",
      });

      expect(result.success).toBe(true);
      expect(prisma.workflowAuditEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          recordId: "record-1",
          action: "status_change",
        }),
      });
    });
  });

  describe("uploadWorkflowEvidence", () => {
    it("uploads evidence for a record", async () => {
      (prisma.workflowRecord.findUnique as jest.Mock).mockResolvedValue({
        id: "record-1",
        organizationId: "org-1",
      });
      (prisma.workflowEvidence.create as jest.Mock).mockResolvedValue({
        id: "we-1",
        recordId: "record-1",
        filename: "contract.pdf",
        fileType: "application/pdf",
      });

      const result = await uploadWorkflowEvidence({
        recordId: "record-1",
        filename: "contract.pdf",
        fileType: "application/pdf",
        description: "العقد الموقع",
      });

      expect(result.success).toBe(true);
      expect(result.data.filename).toBe("contract.pdf");
    });

    it("rejects upload for cross-org record", async () => {
      (prisma.workflowRecord.findUnique as jest.Mock).mockResolvedValue({
        id: "record-1",
        organizationId: "org-2",
      });

      const result = await uploadWorkflowEvidence({
        recordId: "record-1",
        filename: "contract.pdf",
        fileType: "application/pdf",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Access denied");
    });
  });

  describe("listWorkflowEvidence", () => {
    it("lists evidence for a record", async () => {
      (prisma.workflowEvidence.findMany as jest.Mock).mockResolvedValue([
        { id: "we-1", filename: "contract.pdf", fileType: "application/pdf", createdAt: new Date() },
      ]);

      const result = await listWorkflowEvidence("record-1");

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe("getWorkflowDashboardStats", () => {
    it("returns dashboard stats for the organization", async () => {
      (prisma.workflowTemplate as any).count = jest.fn().mockResolvedValue(5);
      (prisma.workflowRecord.count as jest.Mock).mockResolvedValue(20);
      (prisma.workflowRecord.count as jest.Mock).mockResolvedValue(12); // second call = active
      (prisma.workflowRecord.count as jest.Mock).mockResolvedValue(3);  // completed today
      (prisma.workflowRecord.count as jest.Mock).mockResolvedValue(2);  // overdue
      (prisma.workflowRecord.groupBy as jest.Mock).mockResolvedValue([
        { status: "pending", _count: 5 },
        { status: "in_progress", _count: 7 },
        { status: "completed", _count: 8 },
      ]);
      (prisma.workflowRecord.groupBy as jest.Mock).mockResolvedValue([
        { priority: "high", _count: 4 },
        { priority: "medium", _count: 10 },
        { priority: "low", _count: 6 },
      ]);
      (prisma.workflowRecord.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getWorkflowDashboardStats("org-1");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalTemplates).toBe(5);
        expect(result.data.totalRecords).toBeDefined();
        expect(result.data.recentRecords).toBeDefined();
      }
    });

    it("rejects cross-org access", async () => {
      const result = await getWorkflowDashboardStats("org-2");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Access denied");
    });
  });
});
