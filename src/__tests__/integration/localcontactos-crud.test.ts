/** @jest-environment node */

import { describe, it, expect, jest, beforeEach } from "@jest/globals";

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

const mockGetCurrentUser = jest.fn();
jest.mock("@/lib/auth", () => ({
  getCurrentUser: mockGetCurrentUser,
  isExpectedAccessDeniedError: jest.fn().mockReturnValue(false),
}));

jest.mock("@/lib/authorization", () => ({ enforce: jest.fn().mockResolvedValue(undefined) }));

jest.mock("@/lib/localcontactos/compliance-service", () => ({
  checkExportRestrictions: jest.fn().mockResolvedValue({ restricted: false, reason: null }),
  getExportComplianceSummary: jest.fn().mockResolvedValue({ restricted: false, checks: [{ name: "Sensitivity", passed: true }] }),
}));

const mockLocalContactCreate = jest.fn();
const mockLocalContactFindFirst = jest.fn();
const mockLocalContactFindUnique = jest.fn();
const mockLocalContactFindMany = jest.fn();
const mockLocalContactUpdate = jest.fn();
const mockLocalContactCount = jest.fn().mockResolvedValue(0);
const mockLocalContactRelationCreate = jest.fn();
const mockLocalContactInteractionCreate = jest.fn();
const mockContactReviewCreate = jest.fn();
const mockContactExportRequestCreate = jest.fn();
const mockContactExportRequestFindFirst = jest.fn();
const mockContactExportRequestUpdate = jest.fn();
const mockUserFindUnique = jest.fn();
const mockPlatformAuditLogCreate = jest.fn();
const mockDollarTransaction = jest.fn((ops) => Promise.all(ops));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    localContact: {
      create: mockLocalContactCreate,
      findFirst: mockLocalContactFindFirst,
      findUnique: mockLocalContactFindUnique,
      findMany: mockLocalContactFindMany,
      update: mockLocalContactUpdate,
      count: mockLocalContactCount,
    },
    localContactRelation: { create: mockLocalContactRelationCreate },
    localContactInteraction: { create: mockLocalContactInteractionCreate },
    contactReview: { create: mockContactReviewCreate },
    contactExportRequest: {
      create: mockContactExportRequestCreate,
      findFirst: mockContactExportRequestFindFirst,
      update: mockContactExportRequestUpdate,
    },
    user: { findUnique: mockUserFindUnique },
    platformAuditLog: { create: mockPlatformAuditLogCreate },
    $transaction: mockDollarTransaction,
  },
}));

import { createContact, getContact, updateContact, deleteContact, listContacts, createContactRelation, logContactInteraction, addContactRiskFlag, getContactRiskFlags, resolveContactRiskFlag } from "@/actions/contact-actions";
import { assignReviewer } from "@/actions/contact-review-actions";
import { requestContactExport, approveContactExport } from "@/actions/contact-export-actions";

const mockUser = { id: "user-1", name: "Test User", email: "test@aqliya.com", organizationId: "org-1", platformOrganizationId: "plat-1", role: "ADMIN" };

const mockContact = {
  id: "contact-1", organizationId: "org-1", platformOrganizationId: "plat-1",
  name: "سارة القحطاني", email: "sara@example.com", phone: "+966551234567",
  position: "مدير", department: "المالية", organizationName: "شركة الاختبار",
  sensitivityLevel: "normal", exportStatus: "none", notes: "ملاحظات",
  tags: [], isActive: true, metadata: null,
  createdById: "user-1", createdAt: new Date("2026-06-01"), updatedAt: new Date("2026-06-01"),
  outgoingRelations: [], incomingRelations: [], interactions: [], evidence: [],
};

beforeEach(() => { jest.clearAllMocks(); mockGetCurrentUser.mockResolvedValue(mockUser); });

describe("LocalContactOS Full Lifecycle", () => {
  it("creates, retrieves, updates, lists, and soft-deletes a contact", async () => {
    mockLocalContactCreate.mockResolvedValue(mockContact);
    expect((await createContact({ name: "سارة القحطاني", email: "sara@example.com" })).ok).toBe(true);

    mockLocalContactFindFirst.mockResolvedValue(mockContact);
    expect((await getContact("contact-1")).ok).toBe(true);

    mockLocalContactFindFirst.mockResolvedValue(mockContact);
    mockLocalContactUpdate.mockResolvedValue({...mockContact, position: "مدير مالي"});
    expect((await updateContact("contact-1", { position: "مدير مالي" })).ok).toBe(true);

    mockLocalContactFindMany.mockResolvedValue([mockContact]);
    expect((await listContacts("org-1")).ok).toBe(true);

    mockLocalContactFindFirst.mockResolvedValue(mockContact);
    mockLocalContactUpdate.mockResolvedValue({...mockContact, isActive: false});
    expect((await deleteContact("contact-1")).ok).toBe(true);
  });

  it("manages relations and interactions", async () => {
    mockLocalContactFindFirst.mockResolvedValueOnce(mockContact).mockResolvedValueOnce({...mockContact, id: "contact-2", name: "فيصل"});
    mockLocalContactRelationCreate.mockResolvedValue({ id: "rel-1", sourceContactId: "contact-1", targetContactId: "contact-2", relationType: "partner" });
    expect((await createContactRelation("contact-1", "contact-2", "partner", "شريك")).ok).toBe(true);

    mockLocalContactFindFirst.mockResolvedValue(mockContact);
    mockLocalContactInteractionCreate.mockResolvedValue({ id: "int-1", contactId: "contact-1", interactionType: "meeting", subject: "اجتماع", summary: "ملخص", occurredAt: new Date() });
    expect((await logContactInteraction("contact-1", "meeting", "اجتماع", "ملخص", new Date().toISOString())).ok).toBe(true);
  });

  it("manages risk flags (add, get, resolve)", async () => {
    mockLocalContactFindUnique.mockResolvedValueOnce({ id: "contact-1", organizationId: "org-1", metadata: null });
    mockLocalContactUpdate.mockResolvedValue(mockContact);
    mockPlatformAuditLogCreate.mockResolvedValue({});
    expect((await addContactRiskFlag("contact-1", { type: "compliance", severity: "high", description: "مخالفة" })).ok).toBe(true);

    mockLocalContactFindUnique.mockResolvedValue({ id: "contact-1", organizationId: "org-1", metadata: { riskFlags: [{ id: "flag-1", type: "compliance", severity: "high" }] } });
    const getResult = await getContactRiskFlags("contact-1");
    expect(getResult.ok).toBe(true);

    mockLocalContactFindUnique.mockResolvedValue({ id: "contact-1", organizationId: "org-1", metadata: { riskFlags: [{ id: "flag-1", type: "compliance", severity: "high" }] } });
    mockLocalContactUpdate.mockResolvedValue(mockContact);
    mockPlatformAuditLogCreate.mockResolvedValue({});
    expect((await resolveContactRiskFlag("contact-1", "flag-1")).ok).toBe(true);
  });

  it("assigns a reviewer for a contact", async () => {
    mockLocalContactFindUnique.mockResolvedValue({ id: "contact-1", organizationId: "org-1", platformOrganizationId: "plat-1" });
    mockUserFindUnique.mockResolvedValue({ id: "reviewer-1", name: "Reviewer", organizationId: "org-1" });
    mockContactReviewCreate.mockResolvedValue({ id: "review-1", contactId: "contact-1", reviewerId: "reviewer-1", status: "pending", createdAt: new Date() });
    mockPlatformAuditLogCreate.mockResolvedValue({});
    expect((await assignReviewer("contact-1", "reviewer-1", "sensitivity")).ok).toBe(true);
  });

  it("handles export workflow (request and approve)", async () => {
    mockLocalContactFindUnique.mockResolvedValue({ id: "contact-1", organizationId: "org-1", platformOrganizationId: "plat-1", sensitivityLevel: "normal", exportStatus: "none" });
    mockContactExportRequestCreate.mockResolvedValue({ id: "export-1", contactId: "contact-1", status: "pending", createdAt: new Date() });
    mockLocalContactUpdate.mockResolvedValue({...mockContact, exportStatus: "requested"});
    mockPlatformAuditLogCreate.mockResolvedValue({});
    expect((await requestContactExport("contact-1", "تحليل")).ok).toBe(true);

    mockContactExportRequestFindFirst.mockResolvedValue({ id: "export-1", contactId: "contact-1", status: "pending" });
    mockLocalContactUpdate.mockResolvedValue({...mockContact, exportStatus: "exported"});
    mockContactExportRequestUpdate.mockResolvedValue({ id: "export-1", status: "approved", approvedBy: "user-1", approvedAt: new Date() });
    mockPlatformAuditLogCreate.mockResolvedValue({});
    expect((await approveContactExport("export-1")).ok).toBe(true);
  });

  it("rejects cross-organization access", async () => {
    mockLocalContactFindFirst.mockResolvedValue(null);
    expect((await getContact("other-contact")).ok).toBe(false);
  });
});
