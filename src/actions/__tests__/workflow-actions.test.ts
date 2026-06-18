// ─── Unit/Integration Test: WorkflowOS Actions ───
// Tests template CRUD, workflow record lifecycle, evidence, and export approval.
// Uses mocked Prisma — no database required.

// ─── Mocks (hoisted before imports) ───

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

const mockGetCurrentUser = jest.fn();

jest.mock("@/lib/auth", () => ({
  getCurrentUser: mockGetCurrentUser,
  requireUserContext: mockGetCurrentUser,
  isExpectedAccessDeniedError: jest.fn((error) =>
    error instanceof Error &&
    (error.message.startsWith("Access denied:") || error.message === "Unauthenticated")
  ),
}));

jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest.fn().mockResolvedValue({ ok: true }),
}));

jest.mock("@/lib/workflowos/notification-service", () => ({
  notifyExportRequested: jest.fn().mockResolvedValue(undefined),
  notifyExportApproved: jest.fn().mockResolvedValue(undefined),
  notifyExportRejected: jest.fn().mockResolvedValue(undefined),
}));
// ─── Prisma mock functions ───

const mockWorkflowTemplateCreate = jest.fn();
const mockWorkflowTemplateFindMany = jest.fn();
const mockWorkflowTemplateFindUnique = jest.fn();
const mockWorkflowTemplateUpdate = jest.fn();
const mockWorkflowTemplateCount = jest.fn();
const mockWorkflowRecordCreate = jest.fn();
const mockWorkflowRecordFindMany = jest.fn();
const mockWorkflowRecordFindUnique = jest.fn();
const mockWorkflowRecordUpdate = jest.fn();
const mockWorkflowRecordCount = jest.fn();
const mockWorkflowRecordGroupBy = jest.fn();
const mockWorkflowEvidenceCreate = jest.fn();
const mockWorkflowEvidenceFindMany = jest.fn();
const mockWorkflowAuditEventCreate = jest.fn();
const mockWorkflowAuditEventFindMany = jest.fn();
const mockUserFindUnique = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    workflowTemplate: {
      create: mockWorkflowTemplateCreate,
      findMany: mockWorkflowTemplateFindMany,
      findUnique: mockWorkflowTemplateFindUnique,
      update: mockWorkflowTemplateUpdate,
      count: mockWorkflowTemplateCount,
    },
    workflowRecord: {
      create: mockWorkflowRecordCreate,
      findMany: mockWorkflowRecordFindMany,
      findUnique: mockWorkflowRecordFindUnique,
      update: mockWorkflowRecordUpdate,
      count: mockWorkflowRecordCount,
      groupBy: mockWorkflowRecordGroupBy,
    },
    workflowEvidence: {
      create: mockWorkflowEvidenceCreate,
      findMany: mockWorkflowEvidenceFindMany,
    },
    workflowAuditEvent: {
      create: mockWorkflowAuditEventCreate,
      findMany: mockWorkflowAuditEventFindMany,
    },
    user: {
      findUnique: mockUserFindUnique,
    },
    $transaction: jest.fn((ops) => Promise.all(ops)),
  },
}));
// ─── Imports (after mocks) ───

import {
  createTemplate,
  listTemplates,
  publishTemplate,
  archiveTemplate,
} from "@/actions/workflowos-template-actions";

import {
  startWorkflowFromTemplate,
  workflow_listOrgRecords,
  updateWorkflowRecordStatus,
  uploadWorkflowEvidence,
  listWorkflowEvidence,
  getWorkflowDashboardStats,
} from "@/actions/workflowos-actions";

import {
  requestWorkflowExport,
  approveWorkflowExport,
  rejectWorkflowExport,
  downloadWorkflowExport,
} from "@/actions/workflowos-export-actions";

// ─── Mock Data ───

const mockUser = {
  id: "user-1",
  name: "مستخدم اختبار",
  email: "test@aqliya.com",
  organizationId: "org-1",
  platformOrganizationId: "plat-org-1",
  role: "ADMIN",
  organization: { id: "org-1", name: "منظمة اختبار" },
};

const mockTemplate = {
  id: "template-1",
  organizationId: "org-1",
  platformOrganizationId: "plat-org-1",
  name: "نموذج مراجعة العقود",
  description: "نموذج لمراجعة العقود القانونية",
  category: "review",
  status: "active",
  steps: [
    { name: "مراجعة أولية", type: "review" },
    { name: "اعتماد نهائي", type: "approval" },
  ],
  metadata: null,
  createdById: "user-1",
  createdAt: new Date("2026-06-01"),
  updatedAt: new Date("2026-06-01"),
  _count: { records: 0 },
  records: [],
};

const mockDraftTemplate = { ...mockTemplate, id: "template-2", name: "نموذج مسودة", status: "draft", steps: [] };

const mockRecord = {
  id: "record-1",
  organizationId: "org-1",
  platformOrganizationId: "plat-org-1",
  templateId: "template-1",
  title: "مراجعة عقد الموردين",
  description: "مراجعة عقد موردي المواد الخام",
  status: "pending",
  currentStep: 0,
  steps: mockTemplate.steps,
  stepResults: {},
  assignedToId: null,
  priority: "high",
  dueDate: null,
  completedAt: null,
  metadata: null,
  createdById: "user-1",
  createdAt: new Date("2026-06-01"),
  updatedAt: new Date("2026-06-01"),
  exportStatus: "none",
  exportRequestedAt: null,
  exportRequestedById: null,
  exportApprovedAt: null,
  exportApprovedById: null,
  exportRejectedReason: null,
  escalatedAt: null,
  escalatedToId: null,
  template: { name: "نموذج مراجعة العقود", steps: mockTemplate.steps },
};

const mockEvidence = {
  id: "ev-1",
  organizationId: "org-1",
  recordId: "record-1",
  filename: "عقد-موردين.pdf",
  fileType: "pdf",
  storageKey: "workflow/record-1/evidence/ev-1",
  fileHash: "abc123",
  sizeBytes: 2048,
  description: "عقد الموردين الموقع",
  stepIndex: 0,
  uploadedById: "user-1",
  createdAt: new Date("2026-06-01"),
};

// ─── Tests ───

beforeEach(() => {
  jest.clearAllMocks();
  mockGetCurrentUser.mockResolvedValue(mockUser);
});
describe("createTemplate", () => {
  it("creates a template with valid steps", async () => {
    mockWorkflowTemplateCreate.mockResolvedValue(mockTemplate);

    const result = await createTemplate({
      name: "نموذج مراجعة العقود",
      description: "نموذج لمراجعة العقود القانونية",
      category: "review",
      steps: [
        { name: "مراجعة أولية", type: "review" },
        { name: "اعتماد نهائي", type: "approval" },
      ],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("نموذج مراجعة العقود");
    }
    expect(mockWorkflowTemplateCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "نموذج مراجعة العقود",
          organizationId: "org-1",
          createdById: "user-1",
        }),
      }),
    );
  });

  it("rejects empty template name", async () => {
    const result = await createTemplate({
      name: "",
      steps: [{ name: "خطوة", type: "review" }],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("اسم القالب مطلوب");
    }
  });

  it("rejects invalid steps", async () => {
    const result = await createTemplate({
      name: "نموذج بدون خطوات صالحة",
      steps: [{ invalid: true }],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("غير صالحة");
    }
  });

  it("rejects steps with invalid type", async () => {
    const result = await createTemplate({
      name: "نموذج",
      steps: [{ name: "خطوة", type: "invalid_type" }],
    });

    expect(result.success).toBe(false);
  });

  it("rejects non-array steps", async () => {
    const result = await createTemplate({
      name: "نموذج",
      steps: "not_an_array" as unknown as unknown[],
    });

    expect(result.success).toBe(false);
  });
});

describe("listTemplates", () => {
  it("lists templates for the organization", async () => {
    mockWorkflowTemplateFindMany.mockResolvedValue([mockTemplate, mockDraftTemplate]);

    const result = await listTemplates("all");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
    }
    expect(mockWorkflowTemplateFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ organizationId: "org-1" }),
      }),
    );
  });

  it("filters by active status", async () => {
    mockWorkflowTemplateFindMany.mockResolvedValue([mockTemplate]);

    const result = await listTemplates("active");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
    }
    expect(mockWorkflowTemplateFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ organizationId: "org-1", status: "active" }),
      }),
    );
  });

  it("returns empty array when no templates match", async () => {
    mockWorkflowTemplateFindMany.mockResolvedValue([]);

    const result = await listTemplates("archived");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(0);
    }
  });
});

describe("publishTemplate", () => {
  it("publishes a draft template with steps", async () => {
    const templateWithSteps = { ...mockDraftTemplate, steps: [{ name: "خطوة", type: "review" }] };
    mockWorkflowTemplateFindUnique.mockResolvedValue(templateWithSteps);
    mockWorkflowTemplateUpdate.mockResolvedValue({ ...templateWithSteps, status: "active" });

    const result = await publishTemplate("template-2");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("active");
    }
    expect(mockWorkflowTemplateUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "template-2" },
        data: { status: "active" },
      }),
    );
  });

  it("rejects publishing a non-draft template", async () => {
    mockWorkflowTemplateFindUnique.mockResolvedValue(mockTemplate); // already active

    const result = await publishTemplate("template-1");

    expect(result.success).toBe(false);
  });

  it("rejects publishing a template with no steps", async () => {
    mockWorkflowTemplateFindUnique.mockResolvedValue(mockDraftTemplate);

    const result = await publishTemplate("template-2");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("خطوة واحدة");
    }
  });

  it("rejects publishing a template from another organization", async () => {
    mockWorkflowTemplateFindUnique.mockResolvedValue({ ...mockDraftTemplate, organizationId: "org-other" });

    const result = await publishTemplate("template-2");

    expect(result.success).toBe(false);
  });

  it("returns error for non-existent template", async () => {
    mockWorkflowTemplateFindUnique.mockResolvedValue(null);

    const result = await publishTemplate("nonexistent");

    expect(result.success).toBe(false);
  });
});

describe("startWorkflowFromTemplate", () => {
  it("creates a workflow record from a template", async () => {
    mockWorkflowTemplateFindUnique.mockResolvedValue(mockTemplate);
    mockWorkflowRecordCreate.mockResolvedValue(mockRecord);

    const result = await startWorkflowFromTemplate("template-1", "مراجعة عقد الموردين");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("مراجعة عقد الموردين");
      expect(result.data.status).toBe("pending");
      expect(result.data.templateId).toBe("template-1");
    }
    expect(mockWorkflowRecordCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          templateId: "template-1",
          title: "مراجعة عقد الموردين",
          organizationId: "org-1",
          createdById: "user-1",
        }),
      }),
    );
  });

  it("returns error when template not found", async () => {
    mockWorkflowTemplateFindUnique.mockResolvedValue(null);

    const result = await startWorkflowFromTemplate("nonexistent", "سجل");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("غير موجود");
    }
  });

  it("rejects cross-organization template access", async () => {
    mockWorkflowTemplateFindUnique.mockResolvedValue({ ...mockTemplate, organizationId: "org-other" });

    const result = await startWorkflowFromTemplate("template-1", "سجل");

    expect(result.success).toBe(false);
  });

  it("assigns record to specified user", async () => {
    mockWorkflowTemplateFindUnique.mockResolvedValue(mockTemplate);
    mockWorkflowRecordCreate.mockResolvedValue({ ...mockRecord, assignedToId: "user-2" });

    const result = await startWorkflowFromTemplate("template-1", "سجل", "user-2");

    expect(result.success).toBe(true);
    expect(mockWorkflowRecordCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ assignedToId: "user-2" }),
      }),
    );
  });
});

describe("workflow_listOrgRecords", () => {
  it("lists records for the organization", async () => {
    mockWorkflowRecordFindMany.mockResolvedValue([mockRecord]);

    const result = await workflow_listOrgRecords("org-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe("مراجعة عقد الموردين");
    }
  });

  it("filters by status when provided", async () => {
    mockWorkflowRecordFindMany.mockResolvedValue([mockRecord]);

    const result = await workflow_listOrgRecords("org-1", "pending");

    expect(result.success).toBe(true);
    expect(mockWorkflowRecordFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ organizationId: "org-1", status: "pending" }),
      }),
    );
  });

  it("rejects cross-organization access", async () => {
    const result = await workflow_listOrgRecords("org-other");

    expect(result.success).toBe(false);
  });

  it("returns empty array when no records match", async () => {
    mockWorkflowRecordFindMany.mockResolvedValue([]);

    const result = await workflow_listOrgRecords("org-1", "completed");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(0);
    }
  });
});

describe("updateWorkflowRecordStatus", () => {
  it("advances workflow record to in_progress", async () => {
    mockWorkflowRecordFindUnique.mockResolvedValue(mockRecord);
    mockWorkflowRecordUpdate.mockResolvedValue({ ...mockRecord, status: "in_progress", currentStep: 1 });

    const result = await updateWorkflowRecordStatus("record-1", "in_progress");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("in_progress");
    }
    expect(mockWorkflowRecordUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "record-1" },
        data: expect.objectContaining({
          status: "in_progress",
        }),
      }),
    );
  });

  it("completes a workflow record", async () => {
    const inProgressRecord = { ...mockRecord, status: "in_progress", currentStep: 1 };
    mockWorkflowRecordFindUnique.mockResolvedValue(inProgressRecord);
    mockWorkflowRecordUpdate.mockResolvedValue({ ...inProgressRecord, status: "completed", completedAt: new Date() });

    const result = await updateWorkflowRecordStatus("record-1", "completed");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("completed");
    }
    expect(mockWorkflowRecordUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "record-1" },
        data: expect.objectContaining({
          status: "completed",
          completedAt: expect.any(Date),
        }),
      }),
    );
  });

  it("records step result when provided", async () => {
    mockWorkflowRecordFindUnique.mockResolvedValue({ ...mockRecord, stepResults: {} });
    mockWorkflowRecordUpdate.mockResolvedValue({ ...mockRecord, status: "in_progress" });

    const result = await updateWorkflowRecordStatus("record-1", "in_progress", { approved: true, notes: "تمت المراجعة" });

    expect(result.success).toBe(true);
    expect(mockWorkflowRecordUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "record-1" },
        data: expect.objectContaining({
          stepResults: expect.objectContaining({
            step_0: expect.objectContaining({ approved: true, notes: "تمت المراجعة" }),
          }),
        }),
      }),
    );
  });

  it("returns error for non-existent record", async () => {
    mockWorkflowRecordFindUnique.mockResolvedValue(null);

    const result = await updateWorkflowRecordStatus("nonexistent", "in_progress");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("غير موجود");
    }
  });

  it("rejects cross-organization record update", async () => {
    mockWorkflowRecordFindUnique.mockResolvedValue({ ...mockRecord, organizationId: "org-other" });

    const result = await updateWorkflowRecordStatus("record-1", "in_progress");

    expect(result.success).toBe(false);
  });
});

describe("uploadWorkflowEvidence", () => {
  it("uploads evidence for a workflow record", async () => {
    mockWorkflowRecordFindUnique.mockResolvedValue({ id: "record-1", organizationId: "org-1" });
    mockWorkflowEvidenceCreate.mockResolvedValue(mockEvidence);

    const result = await uploadWorkflowEvidence({
      recordId: "record-1",
      filename: "عقد-موردين.pdf",
      fileType: "pdf",
      storageKey: "workflow/record-1/evidence/ev-1",
      fileHash: "abc123",
      sizeBytes: 2048,
      description: "عقد الموردين الموقع",
      stepIndex: 0,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.filename).toBe("عقد-موردين.pdf");
    }
    expect(mockWorkflowEvidenceCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          recordId: "record-1",
          filename: "عقد-موردين.pdf",
          uploadedById: "user-1",
        }),
      }),
    );
  });

  it("returns error when record not found", async () => {
    mockWorkflowRecordFindUnique.mockResolvedValue(null);

    const result = await uploadWorkflowEvidence({
      recordId: "nonexistent",
      filename: "test.pdf",
      fileType: "pdf",
    });

    expect(result.success).toBe(false);
  });

  it("rejects cross-organization evidence upload", async () => {
    mockWorkflowRecordFindUnique.mockResolvedValue({ id: "record-1", organizationId: "org-other" });

    const result = await uploadWorkflowEvidence({
      recordId: "record-1",
      filename: "test.pdf",
      fileType: "pdf",
    });

    expect(result.success).toBe(false);
  });
});

describe("listWorkflowEvidence", () => {
  it("lists evidence for a workflow record", async () => {
    mockWorkflowEvidenceFindMany.mockResolvedValue([mockEvidence]);

    const result = await listWorkflowEvidence("record-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].filename).toBe("عقد-موردين.pdf");
    }
  });

  it("returns empty array when no evidence exists", async () => {
    mockWorkflowEvidenceFindMany.mockResolvedValue([]);

    const result = await listWorkflowEvidence("record-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(0);
    }
  });
});
describe("requestWorkflowExport", () => {
  it("requests export for a completed record", async () => {
    const completedRecord = { ...mockRecord, status: "completed" };
    mockWorkflowRecordFindUnique.mockResolvedValue(completedRecord);
    mockWorkflowRecordUpdate.mockResolvedValue({ ...completedRecord, exportStatus: "requested", exportRequestedById: "user-1", exportRequestedAt: new Date() });
    mockWorkflowAuditEventCreate.mockResolvedValue({});
    mockUserFindUnique.mockResolvedValue({ id: "user-1", name: "مستخدم اختبار" });

    const result = await requestWorkflowExport("record-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.exportStatus).toBe("requested");
    }
    expect(mockWorkflowRecordUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "record-1" },
        data: expect.objectContaining({ exportStatus: "requested" }),
      }),
    );
  });

  it("rejects export request for non-completed record", async () => {
    mockWorkflowRecordFindUnique.mockResolvedValue(mockRecord); // status: pending

    const result = await requestWorkflowExport("record-1");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("مكتملة");
    }
  });

  it("rejects duplicate export request", async () => {
    const alreadyRequestedRecord = { ...mockRecord, status: "completed", exportStatus: "requested" };
    mockWorkflowRecordFindUnique.mockResolvedValue(alreadyRequestedRecord);

    const result = await requestWorkflowExport("record-1");

    expect(result.success).toBe(false);
  });

  it("rejects export when already approved", async () => {
    const approvedRecord = { ...mockRecord, status: "completed", exportStatus: "approved" };
    mockWorkflowRecordFindUnique.mockResolvedValue(approvedRecord);

    const result = await requestWorkflowExport("record-1");

    expect(result.success).toBe(false);
  });
});

describe("approveWorkflowExport", () => {
  it("approves a pending export request", async () => {
    const requestedRecord = { ...mockRecord, status: "completed", exportStatus: "requested", exportRequestedById: "user-2" };
    mockWorkflowRecordFindUnique.mockResolvedValue(requestedRecord);
    mockWorkflowRecordUpdate.mockResolvedValue({ ...requestedRecord, exportStatus: "approved", exportApprovedById: "user-1", exportApprovedAt: new Date() });
    mockWorkflowAuditEventCreate.mockResolvedValue({});
    mockUserFindUnique.mockResolvedValue({ id: "user-1", name: "مستخدم اختبار" });

    const result = await approveWorkflowExport("record-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.exportStatus).toBe("approved");
    }
  });

  it("rejects approving non-requested export", async () => {
    mockWorkflowRecordFindUnique.mockResolvedValue(mockRecord); // exportStatus: none

    const result = await approveWorkflowExport("record-1");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("لا يوجد طلب");
    }
  });
});

describe("rejectWorkflowExport", () => {
  it("rejects a pending export request with reason", async () => {
    const requestedRecord = { ...mockRecord, status: "completed", exportStatus: "requested", exportRequestedById: "user-2" };
    mockWorkflowRecordFindUnique.mockResolvedValue(requestedRecord);
    mockWorkflowRecordUpdate.mockResolvedValue({ ...requestedRecord, exportStatus: "rejected", exportRejectedReason: "المستندات غير مكتملة", exportApprovedById: "user-1", exportApprovedAt: new Date() });
    mockWorkflowAuditEventCreate.mockResolvedValue({});
    mockUserFindUnique.mockResolvedValue({ id: "user-1", name: "مستخدم اختبار" });

    const result = await rejectWorkflowExport("record-1", "المستندات غير مكتملة");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.exportStatus).toBe("rejected");
    }
  });

  it("rejects rejection without reason", async () => {
    mockWorkflowRecordFindUnique.mockResolvedValue({ ...mockRecord, status: "completed", exportStatus: "requested" });

    const result = await rejectWorkflowExport("record-1", "");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("سبب الرفض");
    }
  });

  it("rejects rejecting non-requested export", async () => {
    mockWorkflowRecordFindUnique.mockResolvedValue(mockRecord);

    const result = await rejectWorkflowExport("record-1", "سبب");

    expect(result.success).toBe(false);
  });
});

describe("downloadWorkflowExport", () => {
  it("downloads an approved export", async () => {
    const approvedRecord = {
      ...mockRecord,
      status: "completed",
      exportStatus: "approved",
      completedAt: new Date(),
    };
    mockWorkflowRecordFindUnique.mockResolvedValue(approvedRecord);
    mockWorkflowEvidenceFindMany.mockResolvedValue([mockEvidence]);
    mockWorkflowAuditEventFindMany.mockResolvedValue([]);
    mockWorkflowTemplateFindUnique.mockResolvedValue({ name: "نموذج مراجعة العقود", category: "review" });
    mockWorkflowAuditEventCreate.mockResolvedValue({});

    const result = await downloadWorkflowExport("record-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBeDefined();
      expect(result.data.mimeType).toBe("application/json");
      expect(result.data.filename).toContain("workflow_export");
    }
  });

  it("rejects download for non-approved export", async () => {
    mockWorkflowRecordFindUnique.mockResolvedValue(mockRecord); // exportStatus: none

    const result = await downloadWorkflowExport("record-1");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("اعتماد التصدير أولاً");
    }
  });
});

describe("getWorkflowDashboardStats", () => {
  it("returns dashboard statistics", async () => {
    mockWorkflowTemplateCount.mockResolvedValue(2);
    mockWorkflowRecordCount
      .mockResolvedValueOnce(10)  // totalRecords
      .mockResolvedValueOnce(5);   // activeRecords
    mockWorkflowRecordFindMany.mockResolvedValue([
      { id: "r1", title: "سجل 1", status: "in_progress", priority: "high", updatedAt: new Date() },
    ]);
    mockWorkflowRecordGroupBy
      .mockResolvedValueOnce([
        { status: "pending", _count: 3 },
        { status: "in_progress", _count: 4 },
        { status: "completed", _count: 3 },
      ])
      .mockResolvedValueOnce([
        { priority: "high", _count: 4 },
        { priority: "medium", _count: 6 },
      ]);

    const result = await getWorkflowDashboardStats("org-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.totalTemplates).toBe(2);
      expect(result.data.totalRecords).toBe(10);
    }
  });

  it("rejects cross-organization access", async () => {
    const result = await getWorkflowDashboardStats("org-other");

    expect(result.success).toBe(false);
  });
});
