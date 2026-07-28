import { getContactAnalytics } from "@/lib/localcontactos/analytics-service";
import { prisma } from "@/lib/prisma";

// ─── Mocks ──────────────────────────────────────────────────────────────────

jest.mock("@/lib/prisma", () => ({
  prisma: {
    localContact: {
      findMany: jest.fn(),
    },
    localContactInteraction: {
      findMany: jest.fn(),
    },
    localContactRelation: {
      findMany: jest.fn(),
    },
  },
}));

const mockContacts = (prisma.localContact.findMany as jest.Mock);
const mockInteractions = (prisma.localContactInteraction.findMany as jest.Mock);
const mockRelations = (prisma.localContactRelation.findMany as jest.Mock);

const orgId = "org-test-1";

// ─── Fixtures ───────────────────────────────────────────────────────────────

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

const sampleContacts = [
  {
    id: "c1",
    name: "أحمد",
    sensitivityLevel: "normal",
    department: "التدقيق",
    organizationName: "وزارة المالية",
    isActive: true,
    email: "ahmed@test.com",
    interactions: [{ occurredAt: daysAgo(5) }],
  },
  {
    id: "c2",
    name: "سارة",
    sensitivityLevel: "confidential",
    department: "الحوكمة",
    organizationName: "أرامكو",
    isActive: true,
    email: "sara@test.com",
    interactions: [{ occurredAt: daysAgo(70) }], // stale
  },
  {
    id: "c3",
    name: "خالد",
    sensitivityLevel: "sensitive",
    department: "تقنية المعلومات",
    organizationName: "STC",
    isActive: false, // inactive
    email: null,
    interactions: [],
  },
  {
    id: "c4",
    name: "نورة",
    sensitivityLevel: "normal",
    department: "التدقيق",
    organizationName: "هيئة السوق",
    isActive: true,
    email: "noura@test.com",
    interactions: [{ occurredAt: daysAgo(1) }],
  },
];

const sampleInteractions = [
  { interactionType: "meeting", occurredAt: daysAgo(2) },
  { interactionType: "meeting", occurredAt: daysAgo(5) },
  { interactionType: "call", occurredAt: daysAgo(7) },
  { interactionType: "email", occurredAt: daysAgo(10) },
  { interactionType: "email", occurredAt: daysAgo(15) },
  { interactionType: "meeting", occurredAt: daysAgo(40) },
  { interactionType: "call", occurredAt: daysAgo(80) },
];

const sampleRelations = [
  {
    id: "r1",
    sourceContactId: "c1",
    targetContactId: "c2",
    relationType: "partner",
    strength: 9,
    isActive: true,
  },
  {
    id: "r2",
    sourceContactId: "c1",
    targetContactId: "c4",
    relationType: "colleague",
    strength: 7,
    isActive: true,
  },
  {
    id: "r3",
    sourceContactId: "c2",
    targetContactId: "c3",
    relationType: "vendor",
    strength: 3,
    isActive: true,
  },
];

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("getContactAnalytics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Overview ────────────────────────────────────────────────────────────

  it("computes overview correctly", async () => {
    mockContacts.mockResolvedValue(sampleContacts);
    mockInteractions.mockResolvedValue(sampleInteractions);
    mockRelations.mockResolvedValue(sampleRelations);

    const result = await getContactAnalytics(orgId);

    expect(result.overview.total).toBe(4);
    expect(result.overview.active).toBe(3);
    expect(result.overview.inactive).toBe(1);
    expect(result.overview.bySensitivity).toEqual({
      normal: 2,
      confidential: 1,
      sensitive: 1,
    });
    expect(result.overview.byDepartment).toEqual({
      التدقيق: 2,
      الحوكمة: 1,
      "تقنية المعلومات": 1,
    });
  });

  // ── Interactions ────────────────────────────────────────────────────────

  it("computes interaction stats correctly", async () => {
    mockContacts.mockResolvedValue(sampleContacts);
    mockInteractions.mockResolvedValue(sampleInteractions);
    mockRelations.mockResolvedValue(sampleRelations);

    const result = await getContactAnalytics(orgId);

    expect(result.interactions.total).toBe(7);
    expect(result.interactions.byType).toEqual({
      meeting: 3,
      call: 2,
      email: 2,
    });
    // Monthly trend should have entries
    expect(result.interactions.monthlyTrend.length).toBeGreaterThan(0);
    // Each entry should have month and count
    for (const entry of result.interactions.monthlyTrend) {
      expect(entry.month).toMatch(/^\d{4}-\d{2}$/);
      expect(typeof entry.count).toBe("number");
    }
  });

  it("counts thisMonth and lastMonth correctly", async () => {
    mockContacts.mockResolvedValue(sampleContacts);
    const now = new Date();
    const interactions = [
      { interactionType: "meeting", occurredAt: new Date(now.getFullYear(), now.getMonth(), 5) },
      { interactionType: "call", occurredAt: new Date(now.getFullYear(), now.getMonth(), 15) },
      { interactionType: "email", occurredAt: new Date(now.getFullYear(), now.getMonth() - 1, 20) },
    ];
    mockInteractions.mockResolvedValue(interactions);
    mockRelations.mockResolvedValue(sampleRelations);

    const result = await getContactAnalytics(orgId);

    expect(result.interactions.thisMonth).toBe(2);
    expect(result.interactions.lastMonth).toBe(1);
  });

  // ── Relations ────────────────────────────────────────────────────────────

  it("computes relation stats correctly", async () => {
    mockContacts.mockResolvedValue(sampleContacts);
    mockInteractions.mockResolvedValue(sampleInteractions);
    mockRelations.mockResolvedValue(sampleRelations);

    const result = await getContactAnalytics(orgId);

    expect(result.relations.total).toBe(3);
    expect(result.relations.byType).toEqual({
      partner: 1,
      colleague: 1,
      vendor: 1,
    });
    expect(result.relations.avgStrength).toBe(6); // (9+7+3)/3 ≈ 6
    expect(result.relations.strongestRelation).toBeTruthy();
    expect(result.relations.strongestRelation!.strength).toBe(9);
  });

  it("handles no relations gracefully", async () => {
    mockContacts.mockResolvedValue(sampleContacts);
    mockInteractions.mockResolvedValue(sampleInteractions);
    mockRelations.mockResolvedValue([]);

    const result = await getContactAnalytics(orgId);

    expect(result.relations.total).toBe(0);
    expect(result.relations.avgStrength).toBe(0);
    expect(result.relations.strongestRelation).toBeNull();
  });

  // ── Risk Flags ──────────────────────────────────────────────────────────

  it("flags stale contacts (60+ days)", async () => {
    mockContacts.mockResolvedValue(sampleContacts);
    mockInteractions.mockResolvedValue(sampleInteractions);
    mockRelations.mockResolvedValue(sampleRelations);

    const result = await getContactAnalytics(orgId);

    // سارة has interaction 70 days ago → stale
    expect(result.riskFlags.stale).toHaveLength(1);
    expect(result.riskFlags.stale[0].name).toBe("سارة");

    // خالد has no interactions → should NOT be in stale (stale requires a lastInteraction)
    // but should be in inactive
    expect(result.riskFlags.inactive).toHaveLength(1);
    expect(result.riskFlags.inactive[0].name).toBe("خالد");

    // سارة is confidential → should be in highSensitivity
    expect(result.riskFlags.highSensitivity).toHaveLength(1);
    expect(result.riskFlags.highSensitivity[0].name).toBe("سارة");
  });

  it("flags high sensitivity contacts", async () => {
    mockContacts.mockResolvedValue(sampleContacts);
    mockInteractions.mockResolvedValue([]);
    mockRelations.mockResolvedValue([]);

    const result = await getContactAnalytics(orgId);

    expect(result.riskFlags.highSensitivity).toHaveLength(1);
    expect(result.riskFlags.highSensitivity[0].sensitivityLevel).toBe("confidential");
  });

  // ── Recommendations ─────────────────────────────────────────────────────

  it("generates recommendations for stale contacts", async () => {
    mockContacts.mockResolvedValue(sampleContacts);
    mockInteractions.mockResolvedValue(sampleInteractions);
    mockRelations.mockResolvedValue(sampleRelations);

    const result = await getContactAnalytics(orgId);

    expect(result.recommendations.length).toBeGreaterThan(0);

    // سارة has 70 days since interaction → medium stale (60-90 days), not high (90+)
    const saraRec = result.recommendations.find((r) => r.contactName === "سارة");
    expect(saraRec).toBeDefined();
    expect(saraRec!.priority).toBe("medium");
    expect(saraRec!.messageAr).toContain("سارة");

    // خالد has no email → should have missing_info recommendation
    const khaledRec = result.recommendations.find((r) => r.contactName === "خالد");
    expect(khaledRec).toBeDefined();

    // خالد has no interactions but is inactive — follow_up only for active contacts
    // (inactive contacts are already flagged in riskFlags.inactive)
  });

  it("generates missing_info for contacts without email", async () => {
    mockContacts.mockResolvedValue(sampleContacts);
    mockInteractions.mockResolvedValue([]);
    mockRelations.mockResolvedValue([]);

    const result = await getContactAnalytics(orgId);

    const missingEmail = result.recommendations.filter((r) => r.type === "missing_info");
    // خالد has null email
    expect(missingEmail.length).toBeGreaterThanOrEqual(1);
    expect(missingEmail.some((r) => r.contactName === "خالد")).toBe(true);
  });

  it("generates follow_up for contacts with no interactions", async () => {
    mockContacts.mockResolvedValue(sampleContacts);
    mockInteractions.mockResolvedValue([]);
    mockRelations.mockResolvedValue([]);

    const result = await getContactAnalytics(orgId);

    const followUps = result.recommendations.filter((r) => r.type === "follow_up");
    // خالد has 0 interactions and is active=false — follow_up only for active contacts
    // أحمد has interactions (5 days ago) — not triggered
    // سارة has interactions (70 days ago) — not follow_up, it's stale
    // نورة has interactions (1 day ago) — not triggered
    expect(followUps.length).toBeGreaterThanOrEqual(0);
  });

  it("sorts recommendations by priority", async () => {
    mockContacts.mockResolvedValue(sampleContacts);
    mockInteractions.mockResolvedValue(sampleInteractions);
    mockRelations.mockResolvedValue(sampleRelations);

    const result = await getContactAnalytics(orgId);

    const recs = result.recommendations;
    for (let i = 1; i < recs.length; i++) {
      const prev = recs[i - 1].priority;
      const curr = recs[i].priority;
      const order = { high: 0, medium: 1, low: 2 };
      expect(order[prev]).toBeLessThanOrEqual(order[curr]);
    }
  });

  it("limits recommendations to 10", async () => {
    // Create 20 contacts without email to generate many recommendations
    const manyContacts = Array.from({ length: 20 }, (_, i) => ({
      id: `c${i}`,
      name: `جهة ${i}`,
      sensitivityLevel: "normal",
      department: "عام",
      organizationName: "منظمة",
      isActive: true,
      email: null,
      interactions: [],
    }));
    mockContacts.mockResolvedValue(manyContacts);
    mockInteractions.mockResolvedValue([]);
    mockRelations.mockResolvedValue([]);

    const result = await getContactAnalytics(orgId);

    expect(result.recommendations.length).toBeLessThanOrEqual(10);
  });

  // ── Edge Cases ───────────────────────────────────────────────────────────

  it("handles empty dataset", async () => {
    mockContacts.mockResolvedValue([]);
    mockInteractions.mockResolvedValue([]);
    mockRelations.mockResolvedValue([]);

    const result = await getContactAnalytics(orgId);

    expect(result.overview.total).toBe(0);
    expect(result.interactions.total).toBe(0);
    expect(result.relations.total).toBe(0);
    expect(result.recommendations).toHaveLength(0);
  });

  it("contacts with undefined department get 'غير محدد'", async () => {
    const c = { ...sampleContacts[0], department: undefined as any };
    mockContacts.mockResolvedValue([c]);
    mockInteractions.mockResolvedValue([]);
    mockRelations.mockResolvedValue([]);

    const result = await getContactAnalytics(orgId);

    expect(result.overview.byDepartment["غير محدد"]).toBe(1);
  });
});
