// ─── LocalContactOS Compliance Service Tests ───

import { describe, expect, it, jest, beforeEach } from "@jest/globals";

// Mock Prisma with stateful store for LocalContact
const contactStore: Array<Record<string, unknown>> = [];
const exportRequestStore: Array<Record<string, unknown>> = [];
const reviewStore: Array<Record<string, unknown>> = [];

jest.mock("@/lib/prisma", () => ({
  prisma: {
    localContact: {
      findUnique: jest.fn(async ({ where, select }: { where: Record<string, unknown>; select?: Record<string, unknown> }) => {
        const contact = contactStore.find((c) => c.id === (where as { id: string }).id);
        if (!contact) return null;

        // Check org access
        if (where.organizationId && contact.organizationId !== where.organizationId) return null;

        if (select) {
          const result: Record<string, unknown> = {};
          for (const key of Object.keys(select)) {
            if (key === "_count") {
              result._count = {
                evidence: (contact as Record<string, unknown>)._count?.evidence ?? 0,
                reviews: (contact as Record<string, unknown>)._count?.reviews ?? 0,
              };
            } else {
              result[key] = contact[key];
            }
          }
          return result;
        }
        return contact;
      }),
    },
    contactExportRequest: {
      findMany: jest.fn(async ({ where }: { where: Record<string, unknown> }) => {
        const contactId = (where as { contactId: string }).contactId;
        return exportRequestStore.filter((r) => r.contactId === contactId);
      }),
    },
    contactReview: {
      findMany: jest.fn(async ({ where }: { where: Record<string, unknown> }) => {
        const contactId = (where as { contactId: string }).contactId;
        return reviewStore.filter((r) => r.contactId === contactId);
      }),
    },
  },
}));

import { checkExportRestrictions, getExportComplianceSummary } from "../compliance-service";
import type { CurrentUser } from "@/lib/auth";

const mockUser: CurrentUser = {
  id: "user-1",
  organizationId: "org-1",
  role: "ADMIN",
  email: "admin@test.com",
  name: "Admin",
} as CurrentUser;

beforeEach(() => {
  contactStore.length = 0;
  exportRequestStore.length = 0;
  reviewStore.length = 0;
});

function addContact(overrides: Record<string, unknown> = {}) {
  const contact = {
    id: "contact-1",
    organizationId: "org-1",
    sensitivityLevel: "normal",
    exportStatus: "none",
    name: "Test Contact",
    _count: { evidence: 0, reviews: 0 },
    ...overrides,
  };
  contactStore.push(contact);
  return contact;
}

function addExportRequest(overrides: Record<string, unknown> = {}) {
  const req = {
    id: `er-${exportRequestStore.length + 1}`,
    contactId: "contact-1",
    status: "pending",
    ...overrides,
  };
  exportRequestStore.push(req);
  return req;
}

function addReview(overrides: Record<string, unknown> = {}) {
  const rev = {
    id: `rev-${reviewStore.length + 1}`,
    contactId: "contact-1",
    organizationId: "org-1",
    status: "pending",
    ...overrides,
  };
  reviewStore.push(rev);
  return rev;
}

// ─── checkExportRestrictions ───

describe("checkExportRestrictions", () => {
  it("returns canExport=true for normal sensitivity with no export", async () => {
    addContact({ sensitivityLevel: "normal", exportStatus: "none" });
    const result = await checkExportRestrictions("contact-1", mockUser);
    expect(result.canExport).toBe(true);
    expect(result.requiresExportApproval).toBe(false);
    expect(result.requiresLegalReview).toBe(false);
  });

  it("requires approval for confidential contacts", async () => {
    addContact({ sensitivityLevel: "confidential", exportStatus: "none" });
    const result = await checkExportRestrictions("contact-1", mockUser);
    expect(result.canExport).toBe(false);
    expect(result.requiresExportApproval).toBe(true);
    expect(result.requiresLegalReview).toBe(true);
  });

  it("requires approval for sensitive contacts (no legal review)", async () => {
    addContact({ sensitivityLevel: "sensitive", exportStatus: "none" });
    const result = await checkExportRestrictions("contact-1", mockUser);
    expect(result.canExport).toBe(false);
    expect(result.requiresExportApproval).toBe(true);
    expect(result.requiresLegalReview).toBe(false);
  });

  it("blocks export when status is exported", async () => {
    addContact({ sensitivityLevel: "normal", exportStatus: "exported" });
    const result = await checkExportRestrictions("contact-1", mockUser);
    expect(result.canExport).toBe(false);
    expect(result.reason).toBe("Contact has already been exported");
  });

  it("blocks export when status is rejected", async () => {
    addContact({ sensitivityLevel: "normal", exportStatus: "rejected" });
    const result = await checkExportRestrictions("contact-1", mockUser);
    expect(result.canExport).toBe(false);
    expect(result.reason).toBe("Previous export request was rejected");
  });

  it("blocks export when status is requested (pending)", async () => {
    addContact({ sensitivityLevel: "normal", exportStatus: "requested" });
    const result = await checkExportRestrictions("contact-1", mockUser);
    expect(result.canExport).toBe(false);
    expect(result.reason).toBe("Export request is pending approval");
  });

  it("returns access denied for non-existent contact", async () => {
    const result = await checkExportRestrictions("nonexistent", mockUser);
    expect(result.canExport).toBe(false);
    expect(result.reason).toBe("Access denied");
  });

  it("returns access denied for wrong organization", async () => {
    addContact({ organizationId: "org-other" });
    const result = await checkExportRestrictions("contact-1", mockUser);
    expect(result.canExport).toBe(false);
    expect(result.reason).toBe("Access denied");
  });

  it("allows export when approved for confidential", async () => {
    addContact({ sensitivityLevel: "confidential", exportStatus: "approved" });
    const result = await checkExportRestrictions("contact-1", mockUser);
    expect(result.canExport).toBe(true);
  });
});

// ─── getExportComplianceSummary ───

describe("getExportComplianceSummary", () => {
  it("returns summary for normal contact with no activity", async () => {
    addContact({ sensitivityLevel: "normal", exportStatus: "none" });
    const summary = await getExportComplianceSummary("contact-1", mockUser);
    expect(summary.sensitivityLevel).toBe("normal");
    expect(summary.canExport).toBe(true);
    expect(summary.requiresExportApproval).toBe(false);
    expect(summary.hasPendingExportRequest).toBe(false);
    expect(summary.evidenceCount).toBe(0);
  });

  it("requires export approval for sensitive contacts", async () => {
    addContact({ sensitivityLevel: "sensitive", exportStatus: "none" });
    const summary = await getExportComplianceSummary("contact-1", mockUser);
    expect(summary.requiresExportApproval).toBe(true);
    expect(summary.requiresLegalReview).toBe(false);
    expect(summary.canExport).toBe(false);
  });

  it("detects pending, approved, and rejected export requests", async () => {
    addContact({ sensitivityLevel: "confidential", exportStatus: "requested" });
    addExportRequest({ status: "pending" });
    addExportRequest({ status: "approved" });
    addExportRequest({ status: "rejected" });

    const summary = await getExportComplianceSummary("contact-1", mockUser);
    expect(summary.hasPendingExportRequest).toBe(true);
    expect(summary.hasApprovedExport).toBe(true);
    expect(summary.hasRejectedExport).toBe(true);
  });

  it("counts pending reviews", async () => {
    addContact({ sensitivityLevel: "normal", exportStatus: "none" });
    addReview({ status: "pending" });
    addReview({ status: "approved" });
    addReview({ status: "pending" });

    const summary = await getExportComplianceSummary("contact-1", mockUser);
    expect(summary.pendingReviews).toBe(2);
    expect(summary.approvedReviews).toBe(1);
    expect(summary.rejectedReviews).toBe(0);
  });

  it("throws for non-existent contact", async () => {
    await expect(getExportComplianceSummary("nonexistent", mockUser)).rejects.toThrow("Contact not found or access denied");
  });
});
