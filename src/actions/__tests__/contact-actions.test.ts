// ─── Unit/Integration Test: LocalContactOS Actions ───
// Tests CRUD operations, risk flags, relations, and interactions for contacts.
// Uses mocked Prisma — no database required.

// ─── Mocks (hoisted before imports) ───

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

const mockGetCurrentUser = jest.fn();
jest.mock("@/lib/auth", () => ({
  requireUserContext: mockGetCurrentUser,
  getCurrentUser: mockGetCurrentUser,
  isExpectedAccessDeniedError: jest.fn().mockReturnValue(false),
}));

// ─── Prisma mock functions ───

const mockLocalContactCreate = jest.fn();
const mockLocalContactFindFirst = jest.fn();
const mockLocalContactFindUnique = jest.fn();
const mockLocalContactFindMany = jest.fn();
const mockLocalContactUpdate = jest.fn();
const mockLocalContactCount = jest.fn();
const mockLocalContactGroupBy = jest.fn();
const mockLocalContactRelationCreate = jest.fn();
const mockLocalContactInteractionCreate = jest.fn();
const mockContactEvidenceFindMany = jest.fn();
const mockContactReviewFindMany = jest.fn();
const mockContactReviewCreate = jest.fn();
const mockContactApprovalCreate = jest.fn();
const mockContactExportRequestFindMany = jest.fn();
const mockContactExportRequestFindFirst = jest.fn();
const mockContactExportRequestCreate = jest.fn();
const mockPlatformAuditLogCreate = jest.fn();
const mockPlatformAuditLogCreateMany = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    localContact: {
      create: mockLocalContactCreate,
      findFirst: mockLocalContactFindFirst,
      findUnique: mockLocalContactFindUnique,
      findMany: mockLocalContactFindMany,
      update: mockLocalContactUpdate,
      count: mockLocalContactCount,
      groupBy: mockLocalContactGroupBy,
    },
    localContactRelation: {
      create: mockLocalContactRelationCreate,
    },
    localContactInteraction: {
      create: mockLocalContactInteractionCreate,
    },
    contactEvidence: {
      findMany: mockContactEvidenceFindMany,
    },
    contactReview: {
      findMany: mockContactReviewFindMany,
      create: mockContactReviewCreate,
    },
    contactApproval: {
      create: mockContactApprovalCreate,
    },
    contactExportRequest: {
      findMany: mockContactExportRequestFindMany,
      findFirst: mockContactExportRequestFindFirst,
      create: mockContactExportRequestCreate,
    },
    platformAuditLog: {
      create: mockPlatformAuditLogCreate,
      createMany: mockPlatformAuditLogCreateMany,
    },
    $transaction: jest.fn((ops: any[]) => Promise.all(ops)),
  },
}));

// ─── Imports (after mocks) ───

import {
  createContact,
  getContact,
  updateContact,
  deleteContact,
  listContacts,
  createContactRelation,
  logContactInteraction,
  addContactRiskFlag,
  getContactRiskFlags,
  resolveContactRiskFlag,
} from "@/actions/contact-actions";

const mockUser = {
  id: "user-1",
  name: "Test User",
  email: "test@aqliya.com",
  organizationId: "org-1",
  platformOrganizationId: "plat-org-1",
  role: "ADMIN",
};

const mockContact = {
  id: "contact-1",
  organizationId: "org-1",
  platformOrganizationId: "plat-org-1",
  name: "سارة القحطاني",
  email: "sara@example.com",
  phone: "+966 55 123 4567",
  position: "مدير",
  department: "المالية",
  organizationName: "شركة الاختبار",
  sensitivityLevel: "normal",
  exportStatus: "none",
  notes: "ملاحظات اختبار",
  tags: ["عميل", "شريك"],
  isActive: true,
  metadata: null,
  createdById: "user-1",
  createdAt: new Date("2026-06-01"),
  updatedAt: new Date("2026-06-01"),
  outgoingRelations: [],
  incomingRelations: [],
  interactions: [],
  evidence: [],
};

// ─── Tests ───

beforeEach(() => {
  jest.clearAllMocks();
  mockGetCurrentUser.mockResolvedValue(mockUser);
});

describe("listContacts", () => {
  it("returns contacts for the user's organization", async () => {
    mockLocalContactFindMany.mockResolvedValue([mockContact]);

    const result = await listContacts("org-1");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe("سارة القحطاني");
    }
    expect(mockLocalContactFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ organizationId: "org-1", isActive: true }),
      }),
    );
  });

  it("applies sensitivity filter when provided", async () => {
    mockLocalContactFindMany.mockResolvedValue([mockContact]);

    const result = await listContacts("org-1", { sensitivityLevel: "sensitive" });

    expect(result.ok).toBe(true);
    expect(mockLocalContactFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ sensitivityLevel: "sensitive" }),
      }),
    );
  });

  it("applies search filter when provided", async () => {
    mockLocalContactFindMany.mockResolvedValue([mockContact]);

    const result = await listContacts("org-1", { search: "سارة" });

    expect(result.ok).toBe(true);
    expect(mockLocalContactFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ OR: expect.any(Array) }),
      }),
    );
  });

  it("returns empty array when no contacts match", async () => {
    mockLocalContactFindMany.mockResolvedValue([]);

    const result = await listContacts("org-1");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toHaveLength(0);
    }
  });

  it("rejects cross-organization access", async () => {
    mockLocalContactFindMany.mockRejectedValue(new Error("Access denied"));

    const result = await listContacts("org-2");

    expect(result.ok).toBe(false);
  });
});

describe("createContact", () => {
  it("creates a contact with required fields", async () => {
    mockLocalContactCreate.mockResolvedValue(mockContact);

    const result = await createContact({
      name: "سارة القحطاني",
      email: "sara@example.com",
      organizationName: "شركة الاختبار",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.name).toBe("سارة القحطاني");
    }
    expect(mockLocalContactCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "سارة القحطاني",
          organizationId: "org-1",
        }),
      }),
    );
  });

  it("defaults sensitivity level to normal", async () => {
    mockLocalContactCreate.mockResolvedValue(mockContact);

    const result = await createContact({ name: "Test Contact" });

    expect(result.ok).toBe(true);
    expect(mockLocalContactCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ sensitivityLevel: "normal" }),
      }),
    );
  });

  it("requires OPERATOR role", async () => {
    mockGetCurrentUser.mockResolvedValue({ ...mockUser, role: "VIEWER" });
    mockLocalContactCreate.mockRejectedValue(new Error("Access denied"));

    const result = await createContact({ name: "Test" });

    expect(result.ok).toBe(false);
  });
});

describe("getContact", () => {
  it("returns a contact by id", async () => {
    mockLocalContactFindFirst.mockResolvedValue(mockContact);

    const result = await getContact("contact-1");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.id).toBe("contact-1");
      expect(result.data.name).toBe("سارة القحطاني");
    }
  });

  it("returns error for non-existent contact", async () => {
    mockLocalContactFindFirst.mockResolvedValue(null);

    const result = await getContact("nonexistent");

    expect(result.ok).toBe(false);
  });

  it("scopes to user's organization", async () => {
    mockLocalContactFindFirst.mockResolvedValue(null);

    const result = await getContact("other-contact");

    expect(result.ok).toBe(false);
    expect(mockLocalContactFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ organizationId: "org-1" }),
      }),
    );
  });
});

describe("updateContact", () => {
  it("updates contact fields", async () => {
    mockLocalContactFindFirst.mockResolvedValue(mockContact);
    mockLocalContactUpdate.mockResolvedValue({
      ...mockContact,
      name: "الاسم المحدث",
      position: "مدير مالي",
    });

    const result = await updateContact("contact-1", {
      name: "الاسم المحدث",
      position: "مدير مالي",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.name).toBe("الاسم المحدث");
    }
    expect(mockLocalContactUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "contact-1" },
        data: expect.objectContaining({ name: "الاسم المحدث", position: "مدير مالي" }),
      }),
    );
  });

  it("rejects update for non-existent contact", async () => {
    mockLocalContactFindFirst.mockResolvedValue(null);

    const result = await updateContact("nonexistent", { name: "New" });

    expect(result.ok).toBe(false);
  });
});

describe("deleteContact", () => {
  it("soft-deletes a contact", async () => {
    mockLocalContactFindFirst.mockResolvedValue(mockContact);
    mockLocalContactUpdate.mockResolvedValue({ ...mockContact, isActive: false });

    const result = await deleteContact("contact-1");

    expect(result.ok).toBe(true);
    expect(mockLocalContactUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "contact-1" },
        data: { isActive: false },
      }),
    );
  });
});

describe("Risk Flags", () => {
  const contactWithRiskFlags = {
    ...mockContact,
    metadata: {
      riskFlags: [
        {
          id: "flag-1",
          type: "compliance",
          severity: "high",
          description: "مخالفة امتثال محتملة",
          createdBy: "Test User",
          createdAt: "2026-06-01T00:00:00.000Z",
        },
      ],
    },
  };

  it("adds a risk flag to a contact", async () => {
    mockLocalContactFindUnique
      .mockResolvedValueOnce({ id: "contact-1", organizationId: "org-1", metadata: null });
    mockLocalContactUpdate.mockResolvedValue(contactWithRiskFlags);
    mockPlatformAuditLogCreate.mockResolvedValue({});

    const result = await addContactRiskFlag("contact-1", {
      type: "compliance",
      severity: "high",
      description: "مخالفة امتثال محتملة",
    });

    expect(result.ok).toBe(true);
    expect(mockLocalContactUpdate).toHaveBeenCalled();
    expect(mockPlatformAuditLogCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "riskFlagAdded" }),
      }),
    );
  });

  it("retrieves risk flags from metadata", async () => {
    mockLocalContactFindUnique.mockResolvedValue({
      id: "contact-1",
      organizationId: "org-1",
      metadata: { riskFlags: contactWithRiskFlags.metadata.riskFlags },
    });

    const result = await getContactRiskFlags("contact-1");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].type).toBe("compliance");
    }
  });

  it("returns empty array when no risk flags exist", async () => {
    mockLocalContactFindUnique.mockResolvedValue({
      id: "contact-1",
      organizationId: "org-1",
      metadata: null,
    });

    const result = await getContactRiskFlags("contact-1");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual([]);
    }
  });

  it("resolves a risk flag", async () => {
    mockLocalContactFindUnique.mockResolvedValue({
      id: "contact-1",
      organizationId: "org-1",
      metadata: { riskFlags: contactWithRiskFlags.metadata.riskFlags },
    });
    mockLocalContactUpdate.mockResolvedValue(contactWithRiskFlags);
    mockPlatformAuditLogCreate.mockResolvedValue({});

    const result = await resolveContactRiskFlag("contact-1", "flag-1");

    expect(result.ok).toBe(true);
    expect(mockLocalContactUpdate).toHaveBeenCalled();
    expect(mockPlatformAuditLogCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "riskFlagResolved" }),
      }),
    );
  });
});

describe("Contact Relations", () => {
  it("creates a relation between two contacts", async () => {
    mockLocalContactFindFirst
      .mockResolvedValueOnce(mockContact) // source
      .mockResolvedValueOnce({ ...mockContact, id: "contact-2", name: "فيصل الدوسري" }); // target
    mockLocalContactRelationCreate.mockResolvedValue({
      id: "rel-1",
      sourceContactId: "contact-1",
      targetContactId: "contact-2",
      relationType: "partner",
      description: "شريك تجاري",
    });

    const result = await createContactRelation("contact-1", "contact-2", "partner", "شريك تجاري");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.relationType).toBe("partner");
    }
  });

  it("rejects relation when source contact missing", async () => {
    mockLocalContactFindFirst.mockResolvedValueOnce(null);

    const result = await createContactRelation("nonexistent", "contact-2", "partner");

    expect(result.ok).toBe(false);
  });
});

describe("Contact Interactions", () => {
  it("logs a new interaction", async () => {
    mockLocalContactFindFirst.mockResolvedValue(mockContact);
    mockLocalContactInteractionCreate.mockResolvedValue({
      id: "int-1",
      contactId: "contact-1",
      interactionType: "meeting",
      subject: "اجتماع اختبار",
      summary: "ملخص الاجتماع",
      occurredAt: new Date(),
    });

    const result = await logContactInteraction(
      "contact-1",
      "meeting",
      "اجتماع اختبار",
      "ملخص الاجتماع",
      new Date().toISOString(),
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.interactionType).toBe("meeting");
      expect(result.data.subject).toBe("اجتماع اختبار");
    }
  });
});
