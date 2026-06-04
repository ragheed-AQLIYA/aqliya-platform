// @ts-nocheck
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    localContact: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    localContactRelation: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    localContactInteraction: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    contactEvidence: {
      findMany: jest.fn(),
      create: jest.fn(),
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
    $transaction: jest.fn(),
  },
}));

import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { prisma } from "@/lib/prisma";
import {
  listContacts,
  createContact,
  getContact,
  deleteContact,
  createContactRelation,
  logContactInteraction,
  listContactRelations,
  listContactInteractions,
  uploadContactEvidence,
  listContactEvidence,
  createContactReview,
  approveContactReview,
  rejectContactReview,
  exportContactProfile,
} from "@/actions/contact-actions";

jest.mock("@/lib/auth", () => ({
  requireUserContext: jest.fn(),
  isExpectedAccessDeniedError: jest.fn(() => false),
}));

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

const BASE_CONTACT = {
  id: "contact-1",
  organizationId: "org-1",
  platformOrganizationId: "plat-1",
  name: "أحمد محمد",
  email: "ahmed@example.com",
  phone: "+966501234567",
  position: "مدير مالي",
  department: "المالية",
  organizationName: "شركة الاختبار",
  sensitivityLevel: "normal",
  notes: "ملاحظة اختبار",
  tags: JSON.stringify(["عميل", "محتمل"]),
  isActive: true,
  metadata: null,
  createdById: "user-1",
  createdAt: new Date("2026-06-01"),
  updatedAt: new Date("2026-06-01"),
};

const BASE_RELATION = {
  id: "rel-1",
  organizationId: "org-1",
  platformOrganizationId: "plat-1",
  sourceContactId: "contact-1",
  targetContactId: "contact-2",
  relationType: "colleague",
  description: "زميل سابق",
  strength: 5,
  isActive: true,
  metadata: null,
  createdById: "user-1",
  createdAt: new Date("2026-06-01"),
  updatedAt: new Date("2026-06-01"),
};

const BASE_INTERACTION = {
  id: "int-1",
  organizationId: "org-1",
  platformOrganizationId: "plat-1",
  contactId: "contact-1",
  interactionType: "meeting",
  subject: "اجتماع المتابعة",
  summary: "ناقشنا المشروع الجديد",
  occurredAt: new Date("2026-06-01T10:00:00Z"),
  duration: null,
  metadata: null,
  createdById: "user-1",
  createdAt: new Date("2026-06-01"),
  updatedAt: new Date("2026-06-01"),
};

describe("LocalContactOS actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (requireUserContext as jest.Mock).mockResolvedValue(MOCK_USER);
  });

  describe("createContact", () => {
    it("creates a contact and returns the id", async () => {
      const created = { ...BASE_CONTACT, id: "new-contact-1" };
      (prisma.localContact.create as jest.Mock).mockResolvedValue(created);

      const result = await createContact({
        name: "أحمد محمد",
        email: "ahmed@example.com",
        organizationName: "شركة الاختبار",
        tags: "عميل,محتمل",
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.id).toBe("new-contact-1");
        expect(result.data.name).toBe("أحمد محمد");
      }
    });
  });

  describe("listContacts", () => {
    it("lists contacts filtered by organization", async () => {
      (prisma.localContact.findMany as jest.Mock).mockResolvedValue([
        BASE_CONTACT,
      ]);

      const result = await listContacts("org-1");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0].name).toBe("أحمد محمد");
      }
      expect(prisma.localContact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: "org-1",
            isActive: true,
          }),
        }),
      );
    });

    it("rejects cross-org access", async () => {
      const result = await listContacts("other-org");

      expect(result.ok).toBe(false);
    });

    it("filters by sensitivity level", async () => {
      (prisma.localContact.findMany as jest.Mock).mockResolvedValue([]);

      await listContacts("org-1", { sensitivityLevel: "confidential" });

      expect(prisma.localContact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            sensitivityLevel: "confidential",
          }),
        }),
      );
    });

    it("searches contacts by name", async () => {
      (prisma.localContact.findMany as jest.Mock).mockResolvedValue([]);

      await listContacts("org-1", { search: "أحمد" });

      expect(prisma.localContact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ name: { contains: "أحمد" } }),
            ]),
          }),
        }),
      );
    });
  });

  describe("getContact", () => {
    it("returns contact with relations and interactions", async () => {
      const withRelations = {
        ...BASE_CONTACT,
        outgoingRelations: [
          {
            ...BASE_RELATION,
            targetContact: { id: "contact-2", name: "خالد" },
          },
        ],
        incomingRelations: [],
        interactions: [BASE_INTERACTION],
      };
      (prisma.localContact.findFirst as jest.Mock).mockResolvedValue(
        withRelations,
      );

      const result = await getContact("contact-1");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.outgoingRelations).toHaveLength(1);
        expect(result.data.interactions).toHaveLength(1);
      }
    });
  });

  describe("deleteContact", () => {
    it("soft deletes a contact by setting isActive to false", async () => {
      (prisma.localContact.findFirst as jest.Mock).mockResolvedValue(
        BASE_CONTACT,
      );
      (prisma.localContact.update as jest.Mock).mockResolvedValue({
        ...BASE_CONTACT,
        isActive: false,
      });

      const result = await deleteContact("contact-1");

      expect(result.ok).toBe(true);
      expect(prisma.localContact.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "contact-1" },
          data: { isActive: false },
        }),
      );
    });
  });

  describe("createContactRelation", () => {
    it("creates a relation between two contacts", async () => {
      (prisma.localContact.findFirst as jest.Mock).mockResolvedValue(
        BASE_CONTACT,
      );
      (prisma.localContactRelation.create as jest.Mock).mockResolvedValue(
        BASE_RELATION,
      );

      const result = await createContactRelation(
        "contact-1",
        "contact-2",
        "colleague",
        "زميل سابق",
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.relationType).toBe("colleague");
      }
    });
  });

  describe("listContactRelations", () => {
    it("lists all relations for a contact", async () => {
      (prisma.localContactRelation.findMany as jest.Mock).mockResolvedValue([
        {
          ...BASE_RELATION,
          sourceContact: { id: "contact-1", name: "أحمد" },
          targetContact: { id: "contact-2", name: "خالد" },
        },
      ]);

      const result = await listContactRelations("contact-1");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toHaveLength(1);
      }
    });
  });

  describe("logContactInteraction", () => {
    it("logs an interaction for a contact", async () => {
      (prisma.localContact.findFirst as jest.Mock).mockResolvedValue(
        BASE_CONTACT,
      );
      (prisma.localContactInteraction.create as jest.Mock).mockResolvedValue(
        BASE_INTERACTION,
      );

      const result = await logContactInteraction(
        "contact-1",
        "meeting",
        "اجتماع المتابعة",
        "ناقشنا المشروع",
        "2026-06-01T10:00:00Z",
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.interactionType).toBe("meeting");
      }
    });
  });

  describe("listContactInteractions", () => {
    it("lists all interactions for a contact", async () => {
      (prisma.localContactInteraction.findMany as jest.Mock).mockResolvedValue([
        BASE_INTERACTION,
      ]);

      const result = await listContactInteractions("contact-1");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toHaveLength(1);
      }
    });
  });

  // ─── L5 additions: evidence, review, export ───────────

  describe("uploadContactEvidence", () => {
    it("uploads evidence for a contact", async () => {
      (prisma.localContact.findUnique as jest.Mock).mockResolvedValue(BASE_CONTACT);
      (prisma.contactEvidence.create as jest.Mock).mockResolvedValue({
        id: "ev-1",
        contactId: "contact-1",
        filename: "report.pdf",
        fileType: "application/pdf",
        description: "تقرير مبدئي",
        uploadedById: "user-1",
        createdAt: new Date(),
      });

      const result = await uploadContactEvidence({
        contactId: "contact-1",
        filename: "report.pdf",
        fileType: "application/pdf",
        description: "تقرير مبدئي",
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.filename).toBe("report.pdf");
      }
    });

    it("rejects evidence upload for cross-org contact", async () => {
      (prisma.localContact.findUnique as jest.Mock).mockResolvedValue({
        ...BASE_CONTACT,
        organizationId: "org-2",
      });

      const result = await uploadContactEvidence({
        contactId: "contact-1",
        filename: "report.pdf",
        fileType: "application/pdf",
      });

      expect(result.ok).toBe(false);
    });
  });

  describe("listContactEvidence", () => {
    it("lists evidence for a contact", async () => {
      (prisma.contactEvidence.findMany as jest.Mock).mockResolvedValue([
        { id: "ev-1", filename: "doc.pdf", fileType: "application/pdf", createdAt: new Date() },
      ]);

      const result = await listContactEvidence("contact-1");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toHaveLength(1);
      }
    });
  });

  describe("createContactReview", () => {
    it("creates a review for a contact", async () => {
      (prisma.localContact.findUnique as jest.Mock).mockResolvedValue(BASE_CONTACT);
      (prisma.contactReview.create as jest.Mock).mockResolvedValue({
        id: "rev-1",
        contactId: "contact-1",
        reviewerId: "user-1",
        status: "pending",
        createdAt: new Date(),
      });

      const result = await createContactReview({
        contactId: "contact-1",
        reviewerId: "user-1",
        reason: "مراجعة دورية",
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.reviewerId).toBe("user-1");
      }
    });

    it("rejects review on non-existent contact", async () => {
      (prisma.localContact.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await createContactReview({
        contactId: "contact-x",
        reviewerId: "user-1",
      });

      expect(result.ok).toBe(false);
      expect(result.error).toBe("Contact not found or access denied");
    });
  });

  describe("approveContactReview", () => {
    it("approves a pending review", async () => {
      (prisma.contactReview.findUnique as jest.Mock).mockResolvedValue({
        id: "rev-1",
        organizationId: "org-1",
        contactId: "contact-1",
      });
      (prisma.$transaction as jest.Mock).mockImplementation(async (queries) => {
        return Promise.all(queries.map((q: any) => q));
      });
      (prisma.contactReview.update as jest.Mock).mockResolvedValue({
        id: "rev-1",
        status: "approved",
      });
      (prisma.contactApproval.create as jest.Mock).mockResolvedValue({
        id: "app-1",
        reviewId: "rev-1",
        status: "approved",
      });

      const result = await approveContactReview("rev-1", "موافق بعد المراجعة");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.status).toBe("approved");
      }
    });
  });

  describe("rejectContactReview", () => {
    it("rejects a pending review", async () => {
      (prisma.contactReview.findUnique as jest.Mock).mockResolvedValue({
        id: "rev-1",
        organizationId: "org-1",
        contactId: "contact-1",
      });
      (prisma.$transaction as jest.Mock).mockImplementation(async (queries) => {
        return Promise.all(queries.map((q: any) => q));
      });
      (prisma.contactReview.update as jest.Mock).mockResolvedValue({
        id: "rev-1",
        status: "rejected",
      });
      (prisma.contactApproval.create as jest.Mock).mockResolvedValue({
        id: "app-1",
        reviewId: "rev-1",
        status: "approved",
      });

      const result = await rejectContactReview("rev-1", "يحتاج تعديلات");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.status).toBe("rejected");
      }
    });
  });

  describe("exportContactProfile", () => {
    it("returns export data for a contact", async () => {
      (prisma.localContact.findUnique as jest.Mock).mockResolvedValue({
        ...BASE_CONTACT,
        evidence: [],
        reviews: [],
        interactions: [],
        outgoingRelations: [],
        incomingRelations: [],
      });

      const result = await exportContactProfile("contact-1");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.contact.name).toBe("أحمد محمد");
      }
    });

    it("rejects export from different org", async () => {
      (prisma.localContact.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await exportContactProfile("contact-x");

      expect(result.ok).toBe(false);
    });
  });
});
