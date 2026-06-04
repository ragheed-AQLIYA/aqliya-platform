// @ts-nocheck
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    localContact: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    contactReview: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    contactApproval: {
      create: jest.fn(),
    },
    contactExportRequest: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    platformAuditLog: {
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock("@/lib/auth", () => ({
  requireUserContext: jest.fn(),
  isExpectedAccessDeniedError: jest.fn(() => false),
}));

import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { prisma } from "@/lib/prisma";
import { requireUserContext } from "@/lib/auth";

const MOCK_USER = {
  id: "user-1",
  email: "admin@test.com",
  name: "Admin",
  role: "OPERATOR",
  organizationId: "org-1",
  platformOrganizationId: "plat-1",
  organization: { id: "org-1", name: "Test Org" },
};

const NORMAL_CONTACT = {
  id: "contact-1",
  organizationId: "org-1",
  platformOrganizationId: "plat-1",
  name: "أحمد محمد",
  email: "ahmed@example.com",
  sensitivityLevel: "normal",
  exportStatus: "none",
  isActive: true,
};

const SENSITIVE_CONTACT = {
  id: "contact-2",
  organizationId: "org-1",
  platformOrganizationId: "plat-1",
  name: "مستخدم حساس",
  sensitivityLevel: "sensitive",
  exportStatus: "none",
  isActive: true,
};

const CONFIDENTIAL_CONTACT = {
  id: "contact-3",
  organizationId: "org-1",
  platformOrganizationId: "plat-1",
  name: "سري للغاية",
  sensitivityLevel: "confidential",
  exportStatus: "none",
  isActive: true,
};

const BASE_EXPORT_REQUEST = {
  id: "export-req-1",
  organizationId: "org-1",
  platformOrganizationId: "plat-1",
  contactId: "contact-2",
  status: "pending",
  requestedById: "user-1",
  requestedByName: "Admin",
  reason: "للتقييم",
  requiresLegalReview: false,
  legalReviewStatus: "not_required",
  reviewedById: null,
  reviewedByName: null,
  reviewNote: null,
  reviewedAt: null,
  exportedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const MOCK_REVIEWER = {
  id: "reviewer-1",
  name: "مراجع",
  email: "reviewer@test.com",
  role: "OPERATOR",
  organizationId: "org-1",
};

describe("LocalContactOS L5 — Export Approval Gate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (requireUserContext as jest.Mock).mockResolvedValue(MOCK_USER);
  });

  describe("requestContactExport", () => {
    it("creates export request for sensitive contact", async () => {
      const { requestContactExport } = await import("@/actions/contact-export-actions");
      (prisma.localContact.findUnique as jest.Mock).mockResolvedValue(SENSITIVE_CONTACT);
      (prisma.contactExportRequest.create as jest.Mock).mockResolvedValue(BASE_EXPORT_REQUEST);
      (prisma.localContact.update as jest.Mock).mockResolvedValue({ ...SENSITIVE_CONTACT, exportStatus: "requested" });

      const result = await requestContactExport("contact-2", "للتقييم");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.status).toBe("pending");
      }
      expect(prisma.localContact.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "contact-2" },
          data: { exportStatus: "requested" },
        }),
      );
    });

    it("rejects duplicate export request", async () => {
      const { requestContactExport } = await import("@/actions/contact-export-actions");
      (prisma.localContact.findUnique as jest.Mock).mockResolvedValue({
        ...SENSITIVE_CONTACT,
        exportStatus: "requested",
      });

      const result = await requestContactExport("contact-2");

      expect(result.ok).toBe(false);
      expect(result.error).toContain("already requested");
    });

    it("rejects request for already exported contact", async () => {
      const { requestContactExport } = await import("@/actions/contact-export-actions");
      (prisma.localContact.findUnique as jest.Mock).mockResolvedValue({
        ...CONFIDENTIAL_CONTACT,
        exportStatus: "exported",
      });

      const result = await requestContactExport("contact-3");

      expect(result.ok).toBe(false);
      expect(result.error).toContain("already been exported");
    });
  });

  describe("approveContactExport", () => {
    it("approves a pending export request", async () => {
      const { approveContactExport } = await import("@/actions/contact-export-actions");
      (prisma.localContact.findUnique as jest.Mock).mockResolvedValue(SENSITIVE_CONTACT);
      (prisma.contactExportRequest.findFirst as jest.Mock).mockResolvedValue(BASE_EXPORT_REQUEST);
      (prisma.$transaction as jest.Mock).mockImplementation(async (queries) => {
        return Promise.all(queries.map((q) => q));
      });
      (prisma.contactExportRequest.update as jest.Mock).mockResolvedValue({
        ...BASE_EXPORT_REQUEST,
        status: "approved",
      });
      (prisma.localContact.update as jest.Mock).mockResolvedValue({
        ...SENSITIVE_CONTACT,
        exportStatus: "approved",
      });

      const result = await approveContactExport("contact-2");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.status).toBe("approved");
      }
    });

    it("rejects approval when no pending request exists", async () => {
      const { approveContactExport } = await import("@/actions/contact-export-actions");
      (prisma.localContact.findUnique as jest.Mock).mockResolvedValue(SENSITIVE_CONTACT);
      (prisma.contactExportRequest.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await approveContactExport("contact-2");

      expect(result.ok).toBe(false);
      expect(result.error).toContain("No pending export request");
    });

    it("rejects approval when legal review not cleared", async () => {
      const { approveContactExport } = await import("@/actions/contact-export-actions");
      (prisma.localContact.findUnique as jest.Mock).mockResolvedValue(CONFIDENTIAL_CONTACT);
      (prisma.contactExportRequest.findFirst as jest.Mock).mockResolvedValue({
        ...BASE_EXPORT_REQUEST,
        requiresLegalReview: true,
        legalReviewStatus: "pending",
      });

      const result = await approveContactExport("contact-3");

      expect(result.ok).toBe(false);
      expect(result.error).toContain("legal review");
    });
  });

  describe("rejectContactExport", () => {
    it("rejects a pending export request with reason", async () => {
      const { rejectContactExport } = await import("@/actions/contact-export-actions");
      (prisma.localContact.findUnique as jest.Mock).mockResolvedValue(SENSITIVE_CONTACT);
      (prisma.contactExportRequest.findFirst as jest.Mock).mockResolvedValue(BASE_EXPORT_REQUEST);
      (prisma.$transaction as jest.Mock).mockImplementation(async (queries) => {
        return Promise.all(queries.map((q) => q));
      });
      (prisma.contactExportRequest.update as jest.Mock).mockResolvedValue({
        ...BASE_EXPORT_REQUEST,
        status: "rejected",
      });
      (prisma.localContact.update as jest.Mock).mockResolvedValue({
        ...SENSITIVE_CONTACT,
        exportStatus: "rejected",
      });

      const result = await rejectContactExport("contact-2", "معلومات غير كافية");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.status).toBe("rejected");
      }
    });

    it("requires rejection reason", async () => {
      const { rejectContactExport } = await import("@/actions/contact-export-actions");
      (prisma.localContact.findUnique as jest.Mock).mockResolvedValue(SENSITIVE_CONTACT);
      (prisma.contactExportRequest.findFirst as jest.Mock).mockResolvedValue(BASE_EXPORT_REQUEST);

      const result = await rejectContactExport("contact-2", "");

      expect(result.ok).toBe(false);
    });
  });

  describe("getExportStatus", () => {
    it("returns export status for a contact", async () => {
      const { getExportStatus } = await import("@/actions/contact-export-actions");
      (prisma.localContact.findUnique as jest.Mock).mockResolvedValue({
        ...SENSITIVE_CONTACT,
        exportStatus: "requested",
      });
      (prisma.contactExportRequest.findFirst as jest.Mock).mockResolvedValue(BASE_EXPORT_REQUEST);

      const result = await getExportStatus("contact-2");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.exportStatus).toBe("requested");
        expect(result.data.request).toBeDefined();
      }
    });
  });

  describe("exportContactProfile gate", () => {
    it("allows export for normal contacts without approval", async () => {
      const { exportContactProfile } = await import("@/actions/contact-actions");
      (prisma.localContact.findUnique as jest.Mock).mockResolvedValue({
        ...NORMAL_CONTACT,
        evidence: [],
        reviews: [],
        interactions: [],
        outgoingRelations: [],
        incomingRelations: [],
      });

      const result = await exportContactProfile("contact-1");

      expect(result.ok).toBe(true);
    });

    it("blocks export for sensitive contacts without approval", async () => {
      const { exportContactProfile } = await import("@/actions/contact-actions");
      (prisma.localContact.findUnique as jest.Mock).mockResolvedValue({
        ...SENSITIVE_CONTACT,
        exportStatus: "none",
        evidence: [],
        reviews: [],
        interactions: [],
        outgoingRelations: [],
        incomingRelations: [],
      });

      const result = await exportContactProfile("contact-2");

      expect(result.ok).toBe(false);
      expect(result.error).toContain("export approval");
    });

    it("allows export for sensitive contacts with approval", async () => {
      const { exportContactProfile } = await import("@/actions/contact-actions");
      (prisma.localContact.findUnique as jest.Mock).mockResolvedValue({
        ...SENSITIVE_CONTACT,
        exportStatus: "approved",
        evidence: [],
        reviews: [],
        interactions: [],
        outgoingRelations: [],
        incomingRelations: [],
      });

      const result = await exportContactProfile("contact-2");

      expect(result.ok).toBe(true);
    });
  });
});

describe("LocalContactOS L5 — Reviewer Workflow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (requireUserContext as jest.Mock).mockResolvedValue(MOCK_USER);
  });

  describe("assignReviewer", () => {
    it("assigns a reviewer to a contact", async () => {
      const { assignReviewer } = await import("@/actions/contact-review-actions");
      (prisma.localContact.findUnique as jest.Mock).mockResolvedValue(SENSITIVE_CONTACT);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(MOCK_REVIEWER);
      (prisma.contactReview.create as jest.Mock).mockResolvedValue({
        id: "rev-1",
        contactId: "contact-2",
        reviewType: "sensitivity",
        reviewerId: "reviewer-1",
        reviewerName: "مراجع",
        status: "pending",
        createdAt: new Date(),
      });

      const result = await assignReviewer("contact-2", "reviewer-1", "sensitivity", "مراجعة دورية");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.reviewerId).toBe("reviewer-1");
      }
    });

    it("rejects assignment for cross-org reviewer", async () => {
      const { assignReviewer } = await import("@/actions/contact-review-actions");
      (prisma.localContact.findUnique as jest.Mock).mockResolvedValue(SENSITIVE_CONTACT);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...MOCK_REVIEWER,
        organizationId: "org-2",
      });

      const result = await assignReviewer("contact-2", "reviewer-1");

      expect(result.ok).toBe(false);
    });
  });

  describe("completeReview", () => {
    it("completes a pending review with notes", async () => {
      const { completeReview } = await import("@/actions/contact-review-actions");
      (prisma.contactReview.findUnique as jest.Mock).mockResolvedValue({
        id: "rev-1",
        organizationId: "org-1",
        contactId: "contact-2",
        status: "pending",
        reviewerId: "reviewer-1",
      });
      (prisma.contactReview.update as jest.Mock).mockResolvedValue({
        id: "rev-1",
        status: "approved",
        reviewerNotes: "مكتمل",
        completedAt: new Date(),
      });

      const result = await completeReview("rev-1", "مكتمل");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.status).toBe("approved");
      }
    });

    it("rejects completing already completed review", async () => {
      const { completeReview } = await import("@/actions/contact-review-actions");
      (prisma.contactReview.findUnique as jest.Mock).mockResolvedValue({
        id: "rev-1",
        organizationId: "org-1",
        contactId: "contact-2",
        status: "approved",
        reviewerId: "reviewer-1",
      });

      const result = await completeReview("rev-1");

      expect(result.ok).toBe(false);
    });
  });
});

describe("LocalContactOS L5 — Compliance Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (requireUserContext as jest.Mock).mockResolvedValue(MOCK_USER);
  });

  describe("checkExportRestrictions", () => {
    it("allows export for normal contacts", async () => {
      const { checkExportRestrictions } = await import("@/lib/localcontactos/compliance-service");
      (prisma.localContact.findUnique as jest.Mock).mockResolvedValue({
        ...NORMAL_CONTACT,
        _count: { evidence: 0, reviews: 0 },
      });

      const result = await checkExportRestrictions("contact-1", MOCK_USER);

      expect(result.canExport).toBe(true);
      expect(result.requiresExportApproval).toBe(false);
    });

    it("blocks export for sensitive contacts without approval", async () => {
      const { checkExportRestrictions } = await import("@/lib/localcontactos/compliance-service");
      (prisma.localContact.findUnique as jest.Mock).mockResolvedValue({
        ...SENSITIVE_CONTACT,
        _count: { evidence: 0, reviews: 0 },
      });

      const result = await checkExportRestrictions("contact-2", MOCK_USER);

      expect(result.canExport).toBe(false);
      expect(result.requiresExportApproval).toBe(true);
    });

    it("blocks export for rejected contacts", async () => {
      const { checkExportRestrictions } = await import("@/lib/localcontactos/compliance-service");
      (prisma.localContact.findUnique as jest.Mock).mockResolvedValue({
        ...SENSITIVE_CONTACT,
        exportStatus: "rejected",
        _count: { evidence: 0, reviews: 0 },
      });

      const result = await checkExportRestrictions("contact-2", MOCK_USER);

      expect(result.canExport).toBe(false);
      expect(result.reason).toContain("rejected");
    });
  });

  describe("getExportComplianceSummary", () => {
    it("returns full compliance summary for a contact", async () => {
      const { getExportComplianceSummary } = await import("@/lib/localcontactos/compliance-service");
      (prisma.localContact.findUnique as jest.Mock).mockResolvedValue({
        ...CONFIDENTIAL_CONTACT,
        _count: { evidence: 3, reviews: 2 },
      });
      (prisma.contactExportRequest.findMany as jest.Mock).mockResolvedValue([
        { status: "pending" },
      ]);
      (prisma.contactReview.findMany as jest.Mock).mockResolvedValue([
        { status: "pending" },
        { status: "approved" },
        { status: "rejected" },
      ]);

      const summary = await getExportComplianceSummary("contact-3", MOCK_USER);

      expect(summary.sensitivityLevel).toBe("confidential");
      expect(summary.requiresExportApproval).toBe(true);
      expect(summary.requiresLegalReview).toBe(true);
      expect(summary.hasPendingExportRequest).toBe(true);
      expect(summary.pendingReviews).toBe(1);
      expect(summary.approvedReviews).toBe(1);
      expect(summary.rejectedReviews).toBe(1);
      expect(summary.evidenceCount).toBe(3);
    });
  });
});
