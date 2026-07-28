import { getCrossProductContactView } from "@/lib/localcontactos/cross-product-service";
import { prisma } from "@/lib/prisma";

// ─── Mocks ──────────────────────────────────────────────────────────────────

jest.mock("@/lib/prisma", () => ({
  prisma: {
    localContact: {
      findFirst: jest.fn(),
    },
    salesAccount: {
      findMany: jest.fn(),
    },
    salesDeal: {
      findMany: jest.fn(),
    },
    salesInteraction: {
      findMany: jest.fn(),
    },
    decision: {
      findMany: jest.fn(),
    },
  },
}));

const mockFindFirst = (prisma.localContact.findFirst as jest.Mock);
const mockSalesAccounts = (prisma.salesAccount.findMany as jest.Mock);
const mockSalesDeals = (prisma.salesDeal.findMany as jest.Mock);
const mockSalesInteractions = (prisma.salesInteraction.findMany as jest.Mock);
const mockDecisions = (prisma.decision.findMany as jest.Mock);

const orgId = "org-test-1";

// ─── Fixtures ───────────────────────────────────────────────────────────────

const sampleContact = {
  id: "c1",
  name: "أحمد المنصوري",
  organizationName: "وزارة المالية",
  sensitivityLevel: "normal",
  position: "مدير التدقيق",
  email: "ahmed@finance.gov.sa",
  phone: "+966501234567",
  tags: ["حكومي", "تدقيق"],
  interactions: [
    { id: "ix1", interactionType: "meeting", subject: "اجتماع تنسيقي", occurredAt: new Date("2026-07-20") },
    { id: "ix2", interactionType: "call", subject: "مكالمة متابعة", occurredAt: new Date("2026-07-15") },
    { id: "ix3", interactionType: "email", subject: "إرسال تقرير", occurredAt: new Date("2026-06-01") },
  ],
  outgoingRelations: [
    {
      id: "r1",
      relationType: "partner",
      targetContact: { id: "c2", name: "سارة", organizationName: "أرامكو" },
    },
  ],
  incomingRelations: [
    {
      id: "r2",
      relationType: "client",
      sourceContact: { id: "c3", name: "خالد", organizationName: "STC" },
    },
  ],
};

const sampleSalesAccounts = [
  { id: "sa1", name: "وزارة المالية - حساب رئيسي", industry: "حكومي" },
  { id: "sa2", name: "مؤسسة النقد", industry: "مالي" },
];

const sampleSalesDeals = [
  { id: "sd1", title: "عقد تدقيق 2026", status: "negotiation", amount: 500000 },
  { id: "sd2", title: "استشارات حوكمة", status: "won", amount: 250000 },
];

const sampleSalesInteractions = [
  { id: "si1", type: "meeting", subject: "عرض الخدمات", occurredAt: new Date("2026-07-22") },
  { id: "si2", type: "call", subject: "متابعة العرض", occurredAt: new Date("2026-07-18") },
];

const sampleDecisions = [
  { id: "d1", title: "اعتماد سياسة التدقيق الداخلي", status: "APPROVED", type: "policy" },
  { id: "d2", title: "تطوير نظام الحوكمة المؤسسية", status: "IN_REVIEW", type: "strategic" },
];

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("getCrossProductContactView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws when contact not found", async () => {
    mockFindFirst.mockResolvedValue(null);

    await expect(
      getCrossProductContactView("bad-id", orgId),
    ).rejects.toThrow("Contact not found");
  });

  it("builds full cross-product view", async () => {
    mockFindFirst.mockResolvedValue(sampleContact);
    mockSalesAccounts.mockResolvedValue(sampleSalesAccounts);
    mockSalesDeals.mockResolvedValue(sampleSalesDeals);
    mockSalesInteractions.mockResolvedValue(sampleSalesInteractions);
    mockDecisions.mockResolvedValue(sampleDecisions);

    const result = await getCrossProductContactView("c1", orgId);

    // Contact info
    expect(result.contact.name).toBe("أحمد المنصوري");
    expect(result.contact.tags).toEqual(["حكومي", "تدقيق"]);

    // LocalContactOS
    expect(result.localContactOS.totalInteractions).toBe(3);
    expect(result.localContactOS.totalRelations).toBe(2); // 1 outgoing + 1 incoming
    expect(result.localContactOS.lastInteraction).toBeTruthy();

    // SalesOS
    expect(result.salesOS.relatedAccounts).toHaveLength(2);
    expect(result.salesOS.relatedDeals).toHaveLength(2);
    expect(result.salesOS.totalDealValue).toBe(750000);
    expect(result.salesOS.recentInteractions).toHaveLength(2);

    // DecisionOS
    expect(result.decisionOS.relatedDecisions).toHaveLength(2);
    expect(result.decisionOS.decisionsAsStakeholder).toBe(2);

    // Timeline should have entries from all products
    const products = new Set(result.timeline.map((t) => t.product));
    expect(products.has("localcontactos")).toBe(true);
    expect(products.has("salesos")).toBe(true);
    expect(products.has("decisionos")).toBe(true);

    // Timeline should be sorted by date descending
    for (let i = 1; i < result.timeline.length; i++) {
      expect(
        new Date(result.timeline[i - 1].date).getTime(),
      ).toBeGreaterThanOrEqual(
        new Date(result.timeline[i].date).getTime(),
      );
    }
  });

  it("handles empty cross-product data gracefully", async () => {
    mockFindFirst.mockResolvedValue(sampleContact);
    mockSalesAccounts.mockResolvedValue([]);
    mockSalesDeals.mockResolvedValue([]);
    mockSalesInteractions.mockResolvedValue([]);
    mockDecisions.mockResolvedValue([]);

    const result = await getCrossProductContactView("c1", orgId);

    expect(result.salesOS.relatedAccounts).toHaveLength(0);
    expect(result.salesOS.relatedDeals).toHaveLength(0);
    expect(result.salesOS.totalDealValue).toBe(0);
    expect(result.decisionOS.relatedDecisions).toHaveLength(0);
  });

  it("detects risk flags for stale contacts", async () => {
    const oldContact = {
      ...sampleContact,
      interactions: [
        { id: "ix1", interactionType: "meeting", subject: "قديم", occurredAt: new Date("2025-01-01") },
      ],
      outgoingRelations: [],
      incomingRelations: [],
    };
    mockFindFirst.mockResolvedValue(oldContact);
    mockSalesAccounts.mockResolvedValue([]);
    mockSalesDeals.mockResolvedValue([]);
    mockSalesInteractions.mockResolvedValue([]);
    mockDecisions.mockResolvedValue([]);

    const result = await getCrossProductContactView("c1", orgId);

    expect(result.localContactOS.riskFlags.length).toBeGreaterThan(0);
    expect(result.localContactOS.riskFlags.some((f) => f.includes("يوم"))).toBe(true);
  });

  it("detects risk flags for confidential contacts", async () => {
    const confidentialContact = {
      ...sampleContact,
      sensitivityLevel: "confidential",
      interactions: [{ id: "ix1", interactionType: "meeting", subject: "سري", occurredAt: new Date() }],
      outgoingRelations: [],
      incomingRelations: [],
    };
    mockFindFirst.mockResolvedValue(confidentialContact);
    mockSalesAccounts.mockResolvedValue([]);
    mockSalesDeals.mockResolvedValue([]);
    mockSalesInteractions.mockResolvedValue([]);
    mockDecisions.mockResolvedValue([]);

    const result = await getCrossProductContactView("c1", orgId);

    expect(result.localContactOS.riskFlags).toContain("حساسية عالية");
  });

  it("detects no relations flag", async () => {
    const noRelationContact = {
      ...sampleContact,
      interactions: [{ id: "ix1", interactionType: "meeting", subject: "تحديث", occurredAt: new Date() }],
      outgoingRelations: [],
      incomingRelations: [],
    };
    mockFindFirst.mockResolvedValue(noRelationContact);
    mockSalesAccounts.mockResolvedValue([]);
    mockSalesDeals.mockResolvedValue([]);
    mockSalesInteractions.mockResolvedValue([]);
    mockDecisions.mockResolvedValue([]);

    const result = await getCrossProductContactView("c1", orgId);

    expect(result.localContactOS.riskFlags).toContain("لا توجد علاقات مسجلة");
  });

  it("handles null phone and position", async () => {
    const minimalContact = {
      ...sampleContact,
      phone: null,
      position: null,
    };
    mockFindFirst.mockResolvedValue(minimalContact);
    mockSalesAccounts.mockResolvedValue([]);
    mockSalesDeals.mockResolvedValue([]);
    mockSalesInteractions.mockResolvedValue([]);
    mockDecisions.mockResolvedValue([]);

    const result = await getCrossProductContactView("c1", orgId);

    expect(result.contact.phone).toBe("");
    expect(result.contact.position).toBe("");
  });

  it("limits timeline to 30 entries", async () => {
    // Create contact with many interactions
    const manyInteractions = Array.from({ length: 50 }, (_, i) => ({
      id: `ix${i}`,
      interactionType: "note",
      subject: `ملاحظة ${i}`,
      occurredAt: new Date(Date.now() - i * 60 * 60 * 1000),
    }));
    mockFindFirst.mockResolvedValue({
      ...sampleContact,
      interactions: manyInteractions,
    });
    mockSalesAccounts.mockResolvedValue([]);
    mockSalesDeals.mockResolvedValue([]);
    mockSalesInteractions.mockResolvedValue([]);
    mockDecisions.mockResolvedValue([]);

    const result = await getCrossProductContactView("c1", orgId);

    expect(result.timeline.length).toBeLessThanOrEqual(30);
  });

  it("timeline entries have correct product labels", async () => {
    mockFindFirst.mockResolvedValue(sampleContact);
    mockSalesAccounts.mockResolvedValue(sampleSalesAccounts);
    mockSalesDeals.mockResolvedValue([]);
    mockSalesInteractions.mockResolvedValue(sampleSalesInteractions);
    mockDecisions.mockResolvedValue(sampleDecisions);

    const result = await getCrossProductContactView("c1", orgId);

    for (const entry of result.timeline) {
      expect(["localcontactos", "salesos", "decisionos"]).toContain(entry.product);
      expect(entry.description).toBeTruthy();
    }
  });
});
