import { describe, it, expect, jest, beforeEach } from "@jest/globals";

// ─── Mocks (hoisted before imports) ───

const mockGetCurrentUser = jest.fn();
const mockRequireDecisionAccess = jest.fn();

jest.mock("@/lib/auth", () => ({
  getCurrentUser: mockGetCurrentUser,
  requireUserContext: mockGetCurrentUser,
  requireDecisionAccess: mockRequireDecisionAccess,
  isExpectedAccessDeniedError: jest.fn(
    (error: Error) =>
      error?.message?.startsWith("Access denied:") ||
      error?.message === "Unauthenticated",
  ),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    decisionEvidence: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    decision: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("@/lib/platform/audit-logger", () => ({
  auditLogger: jest.fn(() => ({
    record: jest.fn().mockResolvedValue({ ok: true }),
  })),
  Product: { DECISION_OS: "decision_os" },
}));

const mockStorageStore = jest.fn();
const mockStorageDelete = jest.fn();

jest.mock("@/lib/platform/storage", () => ({
  getStorageProvider: jest.fn(() => ({
    store: mockStorageStore,
    delete: mockStorageDelete,
  })),
}));

jest.mock("crypto", () => ({
  createHash: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue("mock-hash-1234567890123456"),
  })),
}));

// ─── Imports (pick up mocked modules) ───

import { prisma } from "@/lib/prisma";
import { requireDecisionAccess } from "@/lib/auth";
import { auditLogger } from "@/lib/platform/audit-logger";
import {
  getDecisionEvidenceAction,
  uploadDecisionEvidenceAction,
  deleteDecisionEvidenceAction,
} from "@/actions/decision-evidence-actions";

// ─── Type helpers ───

type MockFn<T = unknown> = T extends (...args: infer A) => infer R
  ? jest.Mock<R, A>
  : jest.Mock;

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

function makeDecisionEvidence(overrides: Record<string, unknown> = {}) {
  return {
    id: "ev-1",
    decisionId: "decision-1",
    organizationId: "org-1",
    filename: "financial-report.pdf",
    fileType: "pdf",
    fileSize: 1024,
    fileHash: "abc123def456",
    storageKey: "decisions/decision-1/evidence/ts-report.pdf",
    uploadedById: "user-1",
    description: "Financial report",
    metadata: { uploadedAt: "2026-06-01T00:00:00.000Z" },
    createdAt: new Date("2026-06-01"),
    ...overrides,
  };
}

const base64Content = Buffer.from("test file content").toString("base64");

// ─── Tests ───

describe("DecisionOS Evidence Lifecycle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── 1. Upload Evidence ───

  describe("uploadDecisionEvidenceAction", () => {
    it("requires authentication (OPERATOR role)", async () => {
      mockRequireDecisionAccess.mockRejectedValue(
        new Error("Access denied: OPERATOR role required"),
      );

      const result = await uploadDecisionEvidenceAction({
        decisionId: "decision-1",
        filename: "report.pdf",
        fileType: "pdf",
        fileData: base64Content,
      });

      expect(result.success).toBe(false);
    });

    it("uploads evidence successfully and logs audit event", async () => {
      mockRequireDecisionAccess.mockResolvedValue({
        user: makeUser(),
        organizationId: "org-1",
      });
      mock(mockStorageStore).mockResolvedValue(undefined);
      mock(prisma.decisionEvidence.count).mockResolvedValue(0);
      mock(prisma.decisionEvidence.create).mockResolvedValue(
        makeDecisionEvidence(),
      );

      const result = await uploadDecisionEvidenceAction({
        decisionId: "decision-1",
        filename: "financial-report.pdf",
        fileType: "pdf",
        fileData: base64Content,
        description: "Annual financial report",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.filename).toBe("financial-report.pdf");
        expect(result.data.fileType).toBe("pdf");
      }

      // Verify storage was called
      expect(mockStorageStore).toHaveBeenCalledWith(
        expect.stringContaining("decisions/decision-1/evidence/"),
        expect.objectContaining({
          filename: "financial-report.pdf",
          mimeType: "application/pdf",
        }),
      );

      // Verify audit event was created
      const alogInstance = (auditLogger as unknown as jest.Mock).mock.results[0]
        ?.value;
      expect(alogInstance.record).toHaveBeenCalledWith(
        "EVIDENCE_UPLOADED",
        expect.objectContaining({
          type: "decision_evidence",
          label: "financial-report.pdf",
        }),
        expect.objectContaining({
          severity: "info",
          sourceModel: "DecisionEvidence",
          metadata: expect.objectContaining({
            decisionId: "decision-1",
          }),
        }),
      );
    });

    it("rejects unsupported file type", async () => {
      mockRequireDecisionAccess.mockResolvedValue({
        user: makeUser(),
        organizationId: "org-1",
      });

      const result = await uploadDecisionEvidenceAction({
        decisionId: "decision-1",
        filename: "file.exe",
        fileType: "exe",
        fileData: base64Content,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("غير مدعوم");
      }
    });

    it("rejects file exceeding maximum size", async () => {
      mockRequireDecisionAccess.mockResolvedValue({
        user: makeUser(),
        organizationId: "org-1",
      });
      const largeContent = Buffer.alloc(21 * 1024 * 1024).toString("base64");

      const result = await uploadDecisionEvidenceAction({
        decisionId: "decision-1",
        filename: "large_file.pdf",
        fileType: "pdf",
        fileData: largeContent,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("كبير جداً");
      }
    });
  });

  // ─── 2. List Evidence ───

  describe("getDecisionEvidenceAction", () => {
    it("requires authentication (VIEWER role)", async () => {
      mockRequireDecisionAccess.mockRejectedValue(
        new Error("Access denied: VIEWER role required"),
      );

      const result = await getDecisionEvidenceAction("decision-1");

      expect(result.success).toBe(false);
    });

    it("returns list of evidence for a decision", async () => {
      const mockEvidence = [
        makeDecisionEvidence({ id: "ev-1", filename: "report1.pdf" }),
        makeDecisionEvidence({ id: "ev-2", filename: "report2.pdf" }),
      ];
      mockRequireDecisionAccess.mockResolvedValue({
        user: makeUser(),
        organizationId: "org-1",
      });
      mock(prisma.decisionEvidence.findMany).mockResolvedValue(mockEvidence);

      const result = await getDecisionEvidenceAction("decision-1");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(2);
        expect(result.data[0].filename).toBe("report1.pdf");
        expect(result.data[1].filename).toBe("report2.pdf");
      }
    });

    it("returns empty array when no evidence exists", async () => {
      mockRequireDecisionAccess.mockResolvedValue({
        user: makeUser(),
        organizationId: "org-1",
      });
      mock(prisma.decisionEvidence.findMany).mockResolvedValue([]);

      const result = await getDecisionEvidenceAction("decision-1");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(0);
      }
    });

    it("enforces org scoping via requireDecisionAccess", async () => {
      // requireDecisionAccess should reject cross-org access
      mockRequireDecisionAccess.mockRejectedValue(
        new Error("Access denied: organization access required"),
      );

      const result = await getDecisionEvidenceAction("decision-1");

      expect(result.success).toBe(false);
    });
  });

  // ─── 3. Delete Evidence ───

  describe("deleteDecisionEvidenceAction", () => {
    it("requires authentication (OPERATOR role)", async () => {
      mock(prisma.decisionEvidence.findUnique).mockResolvedValue(
        makeDecisionEvidence(),
      );
      mockRequireDecisionAccess.mockRejectedValue(
        new Error("Access denied: OPERATOR role required"),
      );

      const result = await deleteDecisionEvidenceAction("ev-1");

      expect(result.success).toBe(false);
    });

    it("deletes evidence successfully and logs audit event", async () => {
      const evidenceRecord = makeDecisionEvidence({
        storageKey: "decisions/decision-1/evidence/ev-1-file.pdf",
      });
      mock(prisma.decisionEvidence.findUnique).mockResolvedValue(
        evidenceRecord,
      );
      mockRequireDecisionAccess.mockResolvedValue({
        user: makeUser(),
        organizationId: "org-1",
      });
      mock(prisma.decisionEvidence.delete).mockResolvedValue({ id: "ev-1" });
      mock(mockStorageDelete).mockResolvedValue(true);

      const result = await deleteDecisionEvidenceAction("ev-1");

      expect(result.success).toBe(true);

      // Verify DB delete was called
      expect(prisma.decisionEvidence.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: "ev-1" } }),
      );

      // Verify storage delete was called
      expect(mockStorageDelete).toHaveBeenCalledWith(
        "decisions/decision-1/evidence/ev-1-file.pdf",
      );

      // Verify audit event was created
      const alogInstance = (auditLogger as unknown as jest.Mock).mock.results[0]
        ?.value;
      expect(alogInstance.record).toHaveBeenCalledWith(
        "EVIDENCE_DELETED",
        expect.objectContaining({
          type: "decision_evidence",
          id: "ev-1",
          label: "financial-report.pdf",
        }),
        expect.objectContaining({
          severity: "info",
          sourceModel: "DecisionEvidence",
          metadata: expect.objectContaining({
            decisionId: "decision-1",
            storageCleanupAttempted: true,
          }),
        }),
      );
    });

    it("returns error when evidence not found", async () => {
      mock(prisma.decisionEvidence.findUnique).mockResolvedValue(null);

      const result = await deleteDecisionEvidenceAction("nonexistent");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("غير موجود");
      }
    });
  });

  // ─── 4. Tenant Isolation ───

  describe("tenant isolation", () => {
    it("prevents user from another org from uploading evidence", async () => {
      mockRequireDecisionAccess.mockRejectedValue(
        new Error("Access denied: organization access required"),
      );

      const result = await uploadDecisionEvidenceAction({
        decisionId: "decision-other-org",
        filename: "report.pdf",
        fileType: "pdf",
        fileData: base64Content,
      });

      expect(result.success).toBe(false);
      expect(mockRequireDecisionAccess).toHaveBeenCalledWith(
        "decision-other-org",
        "OPERATOR",
      );
    });

    it("prevents user from another org from listing evidence", async () => {
      mockRequireDecisionAccess.mockRejectedValue(
        new Error("Access denied: organization access required"),
      );

      const result = await getDecisionEvidenceAction("decision-other-org");

      expect(result.success).toBe(false);
      expect(mockRequireDecisionAccess).toHaveBeenCalledWith(
        "decision-other-org",
        "VIEWER",
      );
    });

    it("prevents user from another org from deleting evidence", async () => {
      const evidenceRecord = makeDecisionEvidence({
        decisionId: "decision-other-org",
      });
      mock(prisma.decisionEvidence.findUnique).mockResolvedValue(
        evidenceRecord,
      );
      mockRequireDecisionAccess.mockRejectedValue(
        new Error("Access denied: organization access required"),
      );

      const result = await deleteDecisionEvidenceAction("ev-1");

      expect(result.success).toBe(false);
    });
  });

  // ─── 5. Audit Trail ───

  describe("audit trail", () => {
    it("records audit event on evidence upload", async () => {
      mockRequireDecisionAccess.mockResolvedValue({
        user: makeUser(),
        organizationId: "org-1",
      });
      mock(mockStorageStore).mockResolvedValue(undefined);
      mock(prisma.decisionEvidence.count).mockResolvedValue(0);
      mock(prisma.decisionEvidence.create).mockResolvedValue(
        makeDecisionEvidence({ id: "ev-audit-1" }),
      );

      await uploadDecisionEvidenceAction({
        decisionId: "decision-1",
        filename: "audit-test.pdf",
        fileType: "pdf",
        fileData: base64Content,
      });

      // Verify auditLogger was created with correct context
      expect(auditLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          productKey: "decision_os",
          sourceSystem: "decision_os",
          actor: expect.objectContaining({
            id: "user-1",
          }),
        }),
      );
    });

    it("records audit event on evidence delete", async () => {
      const evidenceRecord = makeDecisionEvidence();
      mock(prisma.decisionEvidence.findUnique).mockResolvedValue(
        evidenceRecord,
      );
      mockRequireDecisionAccess.mockResolvedValue({
        user: makeUser(),
        organizationId: "org-1",
      });
      mock(prisma.decisionEvidence.delete).mockResolvedValue({ id: "ev-1" });

      await deleteDecisionEvidenceAction("ev-1");

      // Verify auditLogger was created with correct context
      expect(auditLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          productKey: "decision_os",
          sourceSystem: "decision_os",
          actor: expect.objectContaining({
            id: "user-1",
          }),
        }),
      );
    });
  });
});
