jest.mock("@/lib/prisma", () => ({
  prisma: {
    salesAccount: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    salesContact: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    salesDeal: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    salesInteraction: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    salesEvidenceLink: {
      findMany: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    salesAuditEvent: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { prisma } from "@/lib/prisma";
import { accountRepository } from "../account-repository";
import { contactRepository } from "../contact-repository";
import { opportunityRepository } from "../opportunity-repository";
import { interactionRepository } from "../interaction-repository";
import { evidenceRepository } from "../evidence-repository";
import { auditRepository } from "../audit-repository";
import type { SalesAccount, SalesContact, SalesOpportunity, SalesInteractionLog } from "../../types";
import type { SalesAuditEntry, SalesEvidenceRef } from "../../store";

const ORG_A = "org-a";
const ORG_B = "org-b";

function mockDate(iso = "2026-06-04T00:00:00.000Z"): Date {
  return new Date(iso);
}

describe("SalesOS Repositories", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("accountRepository", () => {
    const mockAccount = {
      id: "acct-1",
      organizationId: ORG_A,
      platformOrganizationId: null,
      name: "Test Corp",
      nameAr: null,
      industry: "Tech",
      status: "active",
      isDemo: false,
      metadata: null,
      createdById: "user-1",
      updatedById: null,
      createdAt: mockDate(),
      updatedAt: mockDate(),
    };

    it("findById returns mapped account", async () => {
      (prisma.salesAccount.findFirst as jest.Mock).mockResolvedValue(mockAccount);
      const result = await accountRepository.findById(ORG_A, "acct-1");
      expect(result).not.toBeNull();
      expect(result!.id).toBe("acct-1");
      expect(result!.organizationId).toBe(ORG_A);
      expect(prisma.salesAccount.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: "acct-1", organizationId: ORG_A } }),
      );
    });

    it("findById returns null for wrong org", async () => {
      (prisma.salesAccount.findFirst as jest.Mock).mockResolvedValue(null);
      const result = await accountRepository.findById(ORG_B, "acct-1");
      expect(result).toBeNull();
    });

    it("findByOrganization returns mapped accounts", async () => {
      (prisma.salesAccount.findMany as jest.Mock).mockResolvedValue([mockAccount]);
      const results = await accountRepository.findByOrganization(ORG_A);
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Test Corp");
    });

    it("create calls prisma.salesAccount.create", async () => {
      (prisma.salesAccount.create as jest.Mock).mockResolvedValue(mockAccount);
      const domain: SalesAccount = {
        id: "acct-1",
        organizationId: ORG_A,
        name: "Test Corp",
        status: "active",
        ownerId: "user-1",
        createdById: "user-1",
        createdAt: "2026-06-04T00:00:00.000Z",
        updatedAt: "2026-06-04T00:00:00.000Z",
        source: "manual",
      };
      await accountRepository.create(domain);
      expect(prisma.salesAccount.create).toHaveBeenCalledTimes(1);
    });

    it("update calls updateMany with scoped where", async () => {
      (prisma.salesAccount.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
      await accountRepository.update(ORG_A, "acct-1", { name: "New Name" });
      expect(prisma.salesAccount.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "acct-1", organizationId: ORG_A },
          data: { name: "New Name" },
        }),
      );
    });

    it("count returns total per org", async () => {
      (prisma.salesAccount.count as jest.Mock).mockResolvedValue(3);
      const count = await accountRepository.count(ORG_A);
      expect(count).toBe(3);
      expect(prisma.salesAccount.count).toHaveBeenCalledWith(
        expect.objectContaining({ where: { organizationId: ORG_A } }),
      );
    });
  });

  describe("contactRepository", () => {
    const mockContact = {
      id: "contact-1",
      organizationId: ORG_A,
      platformOrganizationId: null,
      accountId: "acct-1",
      name: "John Doe",
      email: "john@test.com",
      role: "CEO",
      createdAt: mockDate(),
      updatedAt: mockDate(),
    };

    it("findByAccount returns mapped contacts", async () => {
      (prisma.salesContact.findMany as jest.Mock).mockResolvedValue([mockContact]);
      const results = await contactRepository.findByAccount(ORG_A, "acct-1");
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("John Doe");
      expect(results[0].email).toBe("john@test.com");
      expect(results[0].title).toBe("CEO");
    });

    it("create calls prisma.salesContact.create", async () => {
      (prisma.salesContact.create as jest.Mock).mockResolvedValue(mockContact);
      const domain: SalesContact = {
        id: "contact-1",
        organizationId: ORG_A,
        accountId: "acct-1",
        name: "John Doe",
        sensitivityLevel: "standard",
        ownerId: "",
        createdById: "",
        status: "active",
        source: "manual",
      };
      await contactRepository.create(domain);
      expect(prisma.salesContact.create).toHaveBeenCalledTimes(1);
    });
  });

  describe("opportunityRepository", () => {
    const mockDeal = {
      id: "deal-1",
      organizationId: ORG_A,
      platformOrganizationId: null,
      accountId: "acct-1",
      stageId: null,
      title: "Test Deal",
      status: "open",
      amount: 50000,
      currency: "SAR",
      probability: 0.7,
      expectedCloseDate: mockDate("2026-07-01T00:00:00.000Z"),
      isDemo: false,
      metadata: { stage: "Qualified" },
      createdById: "user-1",
      updatedById: null,
      createdAt: mockDate(),
      updatedAt: mockDate(),
    };

    it("findById returns mapped opportunity with stage from metadata", async () => {
      (prisma.salesDeal.findFirst as jest.Mock).mockResolvedValue(mockDeal);
      const result = await opportunityRepository.findById(ORG_A, "deal-1");
      expect(result).not.toBeNull();
      expect(result!.name).toBe("Test Deal");
      expect(result!.stage).toBe("Qualified");
      expect(result!.valueEstimate).toBe(50000);
    });

    it("create calls prisma.salesDeal.create with mapped data", async () => {
      (prisma.salesDeal.create as jest.Mock).mockResolvedValue(mockDeal);
      const domain: SalesOpportunity = {
        id: "deal-1",
        organizationId: ORG_A,
        accountId: "acct-1",
        name: "Test Deal",
        stage: "Qualified",
        valueEstimate: 50000,
        currency: "SAR",
        probability: 0.7,
        expectedCloseDate: "2026-07-01T00:00:00.000Z",
        ownerId: "user-1",
        createdById: "user-1",
        source: "manual",
      };
      await opportunityRepository.create(domain);
      expect(prisma.salesDeal.create).toHaveBeenCalledTimes(1);
    });

    it("findByOrganization scopes by org", async () => {
      (prisma.salesDeal.findMany as jest.Mock).mockResolvedValue([]);
      await opportunityRepository.findByOrganization(ORG_A);
      expect(prisma.salesDeal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { organizationId: ORG_A } }),
      );
    });
  });

  describe("interactionRepository", () => {
    const mockInteraction = {
      id: "int-1",
      organizationId: ORG_A,
      platformOrganizationId: null,
      accountId: "acct-1",
      dealId: "deal-1",
      type: "meeting",
      subject: "Q2 Review",
      summary: "Discussed pipeline",
      occurredAt: mockDate(),
      metadata: null,
      createdById: "user-1",
      createdAt: mockDate(),
      updatedAt: mockDate(),
    };

    it("findByOpportunity returns interactions for deal", async () => {
      (prisma.salesInteraction.findMany as jest.Mock).mockResolvedValue([mockInteraction]);
      const results = await interactionRepository.findByOpportunity(ORG_A, "deal-1");
      expect(results).toHaveLength(1);
      expect(results[0].summary).toBe("Discussed pipeline");
    });

    it("create calls prisma.salesInteraction.create", async () => {
      (prisma.salesInteraction.create as jest.Mock).mockResolvedValue(mockInteraction);
      const domain: SalesInteractionLog = {
        id: "int-1",
        organizationId: ORG_A,
        accountId: "acct-1",
        opportunityId: "deal-1",
        type: "meeting",
        summary: "Discussed pipeline",
        loggedById: "user-1",
        loggedAt: "2026-06-04T00:00:00.000Z",
      };
      await interactionRepository.create(domain);
      expect(prisma.salesInteraction.create).toHaveBeenCalledTimes(1);
    });
  });

  describe("evidenceRepository", () => {
    const mockEvidence = {
      id: "ev-1",
      organizationId: ORG_A,
      platformOrganizationId: null,
      targetType: "opportunity",
      targetId: "deal-1",
      dealId: "deal-1",
      accountId: null,
      evidenceId: "file-1",
      evidenceSource: "platform",
      label: "Audit Report",
      evidenceType: null,
      metadata: null,
      createdById: "user-1",
      createdAt: mockDate(),
    };

    it("findByOpportunity returns evidence for deal", async () => {
      (prisma.salesEvidenceLink.findMany as jest.Mock).mockResolvedValue([mockEvidence]);
      const results = await evidenceRepository.findByOpportunity(ORG_A, "deal-1");
      expect(results).toHaveLength(1);
      expect(results[0].label).toBe("Audit Report");
    });

    it("create calls prisma.salesEvidenceLink.create", async () => {
      (prisma.salesEvidenceLink.create as jest.Mock).mockResolvedValue(mockEvidence);
      const ref: SalesEvidenceRef = {
        id: "ev-1",
        organizationId: ORG_A,
        opportunityId: "deal-1",
        typeId: "file-1",
        label: "Audit Report",
        linkedAt: "2026-06-04T00:00:00.000Z",
        linkedById: "user-1",
      };
      await evidenceRepository.create(ref);
      expect(prisma.salesEvidenceLink.create).toHaveBeenCalledTimes(1);
    });
  });

  describe("auditRepository", () => {
    const mockAudit = {
      id: "audit-1",
      organizationId: ORG_A,
      platformOrganizationId: null,
      actorId: "user-1",
      actorName: "Test User",
      action: "sales.deal.created",
      targetType: "deal",
      targetId: "deal-1",
      metadata: null,
      createdAt: mockDate(),
    };

    it("findByOrganization returns mapped audit entries", async () => {
      (prisma.salesAuditEvent.findMany as jest.Mock).mockResolvedValue([mockAudit]);
      const results = await auditRepository.findByOrganization(ORG_A);
      expect(results).toHaveLength(1);
      expect(results[0].action).toBe("sales.deal.created");
    });

    it("create calls prisma.salesAuditEvent.create", async () => {
      (prisma.salesAuditEvent.create as jest.Mock).mockResolvedValue(mockAudit);
      const entry: SalesAuditEntry = {
        id: "audit-1",
        organizationId: ORG_A,
        action: "sales.deal.created",
        actorId: "user-1",
        targetType: "deal",
        targetId: "deal-1",
        timestamp: "2026-06-04T00:00:00.000Z",
      };
      await auditRepository.create(entry, "Test User");
      expect(prisma.salesAuditEvent.create).toHaveBeenCalledTimes(1);
      const callArg = (prisma.salesAuditEvent.create as jest.Mock).mock.calls[0][0];
      expect(callArg.data.actorName).toBe("Test User");
    });
  });
});
