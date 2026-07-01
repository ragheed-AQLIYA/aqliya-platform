/** @jest-environment node */

const mockFindUnique = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockLifecycleCreate = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    coreEvidence: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      create: (...args: unknown[]) => mockCreate(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
    evidenceLifecycle: {
      create: (...args: unknown[]) => mockLifecycleCreate(...args),
    },
  },
}));

jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest.fn(async () => {}),
}));

import { registerCoreEvidence } from "@/lib/core/evidence/core-evidence-service";

describe("CoreEvidence registration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue({
      id: "core-ev-1",
      organizationId: "org-1",
      platformOrganizationId: null,
      productSlug: "audit",
      productEvidenceId: "audit-ev-1",
      resourceType: "AuditEngagement",
      resourceId: "eng-1",
      filename: "invoice.pdf",
      fileType: "pdf",
      storageKey: "key-1",
      fileHash: "hash-1",
      evidenceType: null,
      lifecycleStatus: "created",
      sensitivity: "standard",
      uploadedById: "user-1",
      graphNodeId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockLifecycleCreate.mockResolvedValue({ id: "lc-1" });
  });

  it("creates CoreEvidence and initial lifecycle event", async () => {
    const result = await registerCoreEvidence({
      organizationId: "org-1",
      productSlug: "audit",
      productEvidenceId: "audit-ev-1",
      resourceType: "AuditEngagement",
      resourceId: "eng-1",
      filename: "invoice.pdf",
      fileType: "pdf",
      storageKey: "key-1",
      fileHash: "hash-1",
      productState: "uploaded",
      uploadedById: "user-1",
      actorId: "user-1",
    });

    expect(result.id).toBe("core-ev-1");
    expect(mockCreate).toHaveBeenCalled();
    expect(mockLifecycleCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          toStatus: "created",
          coreEvidenceId: "core-ev-1",
        }),
      }),
    );
  });

  it("upserts when product evidence already registered", async () => {
    mockFindUnique.mockResolvedValue({
      id: "core-ev-1",
      storageKey: "old-key",
      fileHash: null,
      evidenceType: null,
      sensitivity: "standard",
      graphNodeId: null,
    });
    mockUpdate.mockResolvedValue({
      id: "core-ev-1",
      organizationId: "org-1",
      platformOrganizationId: null,
      productSlug: "audit",
      productEvidenceId: "audit-ev-1",
      resourceType: "AuditEngagement",
      resourceId: "eng-1",
      filename: "invoice-v2.pdf",
      fileType: "pdf",
      storageKey: "key-2",
      fileHash: "hash-2",
      evidenceType: null,
      lifecycleStatus: "reviewed",
      sensitivity: "standard",
      uploadedById: "user-1",
      graphNodeId: "node-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await registerCoreEvidence({
      organizationId: "org-1",
      productSlug: "audit",
      productEvidenceId: "audit-ev-1",
      resourceType: "AuditEngagement",
      resourceId: "eng-1",
      filename: "invoice-v2.pdf",
      fileType: "pdf",
      storageKey: "key-2",
      productState: "reviewed",
      graphNodeId: "node-1",
    });

    expect(result.filename).toBe("invoice-v2.pdf");
    expect(mockUpdate).toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
