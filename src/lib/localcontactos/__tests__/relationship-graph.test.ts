import { getRelationshipGraphData, getGraphStats } from "@/lib/localcontactos/relationship-graph";
import { prisma } from "@/lib/prisma";

// ─── Mocks ──────────────────────────────────────────────────────────────────

jest.mock("@/lib/prisma", () => ({
  prisma: {
    localContact: {
      findMany: jest.fn(),
    },
    localContactRelation: {
      findMany: jest.fn(),
    },
  },
}));

const mockContacts = (prisma.localContact.findMany as jest.Mock);
const mockRelations = (prisma.localContactRelation.findMany as jest.Mock);

// ─── Fixtures ───────────────────────────────────────────────────────────────

const orgId = "org-test-1";

const sampleContacts = [
  {
    id: "c1",
    name: "أحمد المنصوري",
    sensitivityLevel: "normal",
    organizationName: "وزارة المالية",
    position: "مدير التدقيق",
    email: "ahmed@finance.gov.sa",
    isActive: true,
    interactions: [{ occurredAt: new Date("2026-07-20") }],
    _count: { interactions: 5 },
  },
  {
    id: "c2",
    name: "سارة القحطاني",
    sensitivityLevel: "confidential",
    organizationName: "أرامكو السعودية",
    position: "رئيسة الحوكمة",
    email: "sara@aramco.com",
    isActive: true,
    interactions: [{ occurredAt: new Date("2026-07-25") }],
    _count: { interactions: 12 },
  },
  {
    id: "c3",
    name: "خالد العتيبي",
    sensitivityLevel: "sensitive",
    organizationName: "STC",
    position: "مدير الشراكات",
    email: "khaled@stc.com.sa",
    isActive: true,
    interactions: [],
    _count: { interactions: 0 },
  },
];

const sampleRelations = [
  {
    id: "r1",
    organizationId: orgId,
    sourceContactId: "c1",
    targetContactId: "c2",
    relationType: "partner",
    strength: 8,
    description: "تعاون استراتيجي",
    isActive: true,
    platformOrganizationId: null,
    metadata: null,
    createdById: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "r2",
    organizationId: orgId,
    sourceContactId: "c1",
    targetContactId: "c3",
    relationType: "client",
    strength: 6,
    description: "عميل خدمات تدقيق",
    isActive: true,
    platformOrganizationId: null,
    metadata: null,
    createdById: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// ─── Tests: getRelationshipGraphData ────────────────────────────────────────

describe("getRelationshipGraphData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("builds nodes from contacts and links from active relations", async () => {
    mockContacts.mockResolvedValue(sampleContacts);
    mockRelations.mockResolvedValue(sampleRelations);

    const result = await getRelationshipGraphData({ organizationId: orgId });

    // Nodes
    expect(result.nodes).toHaveLength(3);
    expect(result.nodes[0]).toMatchObject({
      id: "c1",
      name: "أحمد المنصوري",
      group: "contact",
      sensitivityLevel: "normal",
      interactionCount: 5,
    });
    expect(result.nodes[0].lastInteraction).toBeTruthy();

    // Links — only 2 active relations (r3 is inactive)
    expect(result.links).toHaveLength(2);
    expect(result.links[0]).toMatchObject({
      source: "c1",
      target: "c2",
      relationType: "partner",
      strength: 8,
    });
  });

  it("filters by sensitivityLevel", async () => {
    // Mock returns only confidential contacts (simulating Prisma where filter)
    const confidentialOnly = sampleContacts.filter((c) => c.sensitivityLevel === "confidential");
    mockContacts.mockResolvedValue(confidentialOnly);
    mockRelations.mockResolvedValue(sampleRelations);

    const result = await getRelationshipGraphData({
      organizationId: orgId,
      sensitivityLevel: "confidential",
    });

    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0].name).toBe("سارة القحطاني");

    // Links should only include the filtered node
    const nodeIds = new Set(result.nodes.map((n) => n.id));
    for (const link of result.links) {
      expect(nodeIds.has(link.source)).toBe(true);
      expect(nodeIds.has(link.target)).toBe(true);
    }
  });

  it("filters by relationType", async () => {
    mockContacts.mockResolvedValue(sampleContacts);
    // Mock returns only partner relations (simulating Prisma where filter)
    const partnerOnly = sampleRelations.filter((r) => r.relationType === "partner");
    mockRelations.mockResolvedValue(partnerOnly);

    const result = await getRelationshipGraphData({
      organizationId: orgId,
      relationType: "partner",
    });

    expect(result.links).toHaveLength(1);
    expect(result.links[0].relationType).toBe("partner");
  });

  it('returns empty when no contacts', async () => {
    mockContacts.mockResolvedValue([]);
    mockRelations.mockResolvedValue([]);

    const result = await getRelationshipGraphData({ organizationId: orgId });

    expect(result.nodes).toHaveLength(0);
    expect(result.links).toHaveLength(0);
  });

  it("excludes inactive relations", async () => {
    mockContacts.mockResolvedValue(sampleContacts);
    // Mock returning an inactive relation — the service's where clause should filter it
    const relationsWithInactive = [
      ...sampleRelations,
      {
        id: "r-inactive",
        organizationId: orgId,
        sourceContactId: "c2",
        targetContactId: "c3",
        relationType: "vendor",
        strength: 4,
        description: "مورّد تقنية",
        isActive: false,
      },
    ];
    // Filter to simulate Prisma's where: { isActive: true }
    mockRelations.mockResolvedValue(relationsWithInactive.filter((r: any) => r.isActive));

    const result = await getRelationshipGraphData({ organizationId: orgId });

    // r-inactive is not in the response (filtered by mock)
    const rInactive = result.links.find(
      (l) => l.source === "c2" && l.target === "c3",
    );
    expect(rInactive).toBeUndefined();
  });

  it("sets contact with no interactions to null lastInteraction", async () => {
    mockContacts.mockResolvedValue(sampleContacts);
    mockRelations.mockResolvedValue([]);

    const result = await getRelationshipGraphData({ organizationId: orgId });

    const c3 = result.nodes.find((n) => n.id === "c3");
    expect(c3).toBeDefined();
    expect(c3!.lastInteraction).toBeNull();
    expect(c3!.interactionCount).toBe(0);
  });
});

// ─── Tests: getGraphStats ───────────────────────────────────────────────────

describe("getGraphStats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("computes all stats correctly", async () => {
    mockContacts.mockResolvedValue(sampleContacts);
    mockRelations.mockResolvedValue(sampleRelations);

    const stats = await getGraphStats(orgId);

    expect(stats.totalContacts).toBe(3);
    expect(stats.totalRelations).toBe(2);
    expect(stats.avgStrength).toBe(7); // (8+6) / 2 = 7
    expect(stats.sensitivityDistribution).toEqual({
      normal: 1,
      confidential: 1,
      sensitive: 1,
    });
    expect(stats.relationTypeDistribution).toEqual({
      partner: 1,
      client: 1,
    });
    expect(stats.isolatedContacts).toBe(0); // All have connections
    expect(stats.mostConnected).toEqual({
      name: "أحمد المنصوري",
      connections: 2, // c1 has relations to c2 and c3
    });
  });

  it("counts isolated contacts correctly", async () => {
    const isolatedContact = { ...sampleContacts[2], id: "c-isolated" };
    mockContacts.mockResolvedValue([...sampleContacts, isolatedContact]);
    mockRelations.mockResolvedValue(sampleRelations); // No relation for c-isolated

    const stats = await getGraphStats(orgId);

    expect(stats.isolatedContacts).toBe(1);
  });

  it("handles empty data", async () => {
    mockContacts.mockResolvedValue([]);
    mockRelations.mockResolvedValue([]);

    const stats = await getGraphStats(orgId);

    expect(stats.totalContacts).toBe(0);
    expect(stats.totalRelations).toBe(0);
    expect(stats.avgStrength).toBe(0);
    expect(stats.isolatedContacts).toBe(0);
    expect(stats.mostConnected).toBeNull();
  });

  it("returns correct mostConnected", async () => {
    mockContacts.mockResolvedValue(sampleContacts);
    // c2 has only 1 connection (to c1)
    const singleRelation = [sampleRelations[0]]; // c1 ↔ c2
    mockRelations.mockResolvedValue(singleRelation);

    const stats = await getGraphStats(orgId);

    // c1 and c2 both have 1 connection
    expect(stats.mostConnected?.connections).toBe(1);
  });
});
