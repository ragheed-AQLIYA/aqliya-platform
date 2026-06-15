import { describe, expect, it, jest, beforeEach } from "@jest/globals";

const mockOrganizationFindUnique = jest.fn();
const mockOrganizationFindFirst = jest.fn();
const mockAuditOrganizationFindUnique = jest.fn();
const mockAuditEngagementFindUnique = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    organization: {
      findUnique: mockOrganizationFindUnique,
      findFirst: mockOrganizationFindFirst,
    },
    auditOrganization: {
      findUnique: mockAuditOrganizationFindUnique,
    },
    auditEngagement: {
      findUnique: mockAuditEngagementFindUnique,
    },
  },
}));

import {
  resolveFirmMemoryOrganizationId,
  resolveFirmMemoryOrganizationIdFromEngagement,
} from "@/lib/tb-intelligence/org-resolver";

describe("resolveFirmMemoryOrganizationId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns Organization.id when passed directly", async () => {
    mockOrganizationFindUnique.mockResolvedValueOnce({ id: "org-1" });
    await expect(resolveFirmMemoryOrganizationId("org-1")).resolves.toBe(
      "org-1",
    );
  });

  it("maps AuditOrganization.id via platformOrganizationId bridge", async () => {
    mockOrganizationFindUnique.mockResolvedValueOnce(null);
    mockAuditOrganizationFindUnique.mockResolvedValueOnce({
      platformOrganizationId: "plat-1",
    });
    mockOrganizationFindFirst.mockResolvedValueOnce({ id: "org-linked" });

    await expect(resolveFirmMemoryOrganizationId("audit-org-1")).resolves.toBe(
      "org-linked",
    );
  });

  it("maps PlatformOrganization.id directly", async () => {
    mockOrganizationFindUnique.mockResolvedValueOnce(null);
    mockAuditOrganizationFindUnique.mockResolvedValueOnce(null);
    mockOrganizationFindFirst.mockResolvedValueOnce({ id: "org-from-plat" });

    await expect(resolveFirmMemoryOrganizationId("plat-1")).resolves.toBe(
      "org-from-plat",
    );
  });
});

describe("resolveFirmMemoryOrganizationIdFromEngagement", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("resolves from engagement audit organization", async () => {
    mockAuditEngagementFindUnique.mockResolvedValueOnce({
      organizationId: "audit-org-1",
    });
    mockOrganizationFindUnique.mockResolvedValueOnce(null);
    mockAuditOrganizationFindUnique.mockResolvedValueOnce({
      platformOrganizationId: "plat-1",
    });
    mockOrganizationFindFirst.mockResolvedValueOnce({ id: "org-linked" });

    await expect(
      resolveFirmMemoryOrganizationIdFromEngagement("eng-1"),
    ).resolves.toBe("org-linked");
  });
});
