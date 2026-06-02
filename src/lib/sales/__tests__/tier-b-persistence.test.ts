// @ts-nocheck
import {
  describe,
  expect,
  it,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import fs from "fs/promises";
import path from "path";
import {
  emptyTierB1Maps,
  hydrateTierB1IntelligenceMaps,
  loadTierB1IntelligenceFromPrisma,
  loadTierB1IntelligenceOverlay,
  mergeTierB1IntelligenceIntoStore,
} from "../tier-b-persistence";
import { saveSalesOrgSnapshot } from "../persistence";
import type {
  SalesCommercialRecommendation,
  SalesMarketSignal,
} from "../types";

const ORG_A = "org-tier-b-a";
const ORG_B = "org-tier-b-b";
const DATA_DIR = path.join(process.cwd(), ".data", "sales");
const NOW = "2026-05-31T12:00:00.000Z";

jest.mock("../prisma-repository", () => ({
  prismaLoadTierB1Intelligence: jest.fn(),
}));

const prismaLoadTierB1Intelligence = jest.requireMock<
  typeof import("../prisma-repository")
>("../prisma-repository").prismaLoadTierB1Intelligence as jest.MockedFunction<
  (organizationId: string) => Promise<ReturnType<typeof emptyTierB1Maps> | null>
>;

function marketSignal(id: string, orgId: string): SalesMarketSignal {
  return {
    id,
    organizationId: orgId,
    label: `market-${id}`,
    category: "buying",
    signalSource: "stored",
    score: 0.72,
    outputStatus: "draft",
    snapshotAt: NOW,
    source: "integration",
    status: "active",
    createdById: "user-1",
    createdAt: NOW,
    updatedAt: NOW,
  };
}

function commercialRecommendation(
  id: string,
  orgId: string,
): SalesCommercialRecommendation {
  return {
    id,
    organizationId: orgId,
    category: "industries",
    ruleId: "rule-industry",
    title: `rec-${id}`,
    reasoning: "persisted reasoning",
    recommendedAction: "Review ICP alignment.",
    priority: "medium",
    confidence: 0.66,
    outputStatus: "recommendation",
    notAutonomous: true,
    snapshotAt: NOW,
    source: "integration",
    status: "active",
    createdById: "user-1",
    createdAt: NOW,
    updatedAt: NOW,
  };
}

describe("tier-b-persistence", () => {
  const originalPrismaFlag = process.env.SALESOS_PRISMA_PERSISTENCE;

  beforeEach(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    prismaLoadTierB1Intelligence.mockReset();
    process.env.SALESOS_PRISMA_PERSISTENCE = "1";
  });

  afterEach(async () => {
    for (const org of [ORG_A, ORG_B]) {
      const safe = org.replace(/[^a-zA-Z0-9_-]/g, "_");
      await fs.rm(path.join(DATA_DIR, `${safe}.json`), { force: true });
    }
    if (originalPrismaFlag === undefined) {
      delete process.env.SALESOS_PRISMA_PERSISTENCE;
    } else {
      process.env.SALESOS_PRISMA_PERSISTENCE = originalPrismaFlag;
    }
  });

  it("hydrates Tier B1 overlay from file snapshot", async () => {
    await saveSalesOrgSnapshot(ORG_A, {
      accounts: [],
      contacts: [],
      leads: [],
      opportunities: [],
      interactions: [],
      evidence: [],
      auditLog: [],
      seeded: true,
      marketSignals: [marketSignal("mkt-1", ORG_A)],
    });

    const overlay = await loadTierB1IntelligenceOverlay(ORG_A);
    expect(overlay).not.toBeNull();
    expect(overlay!.marketSignals.size).toBe(1);
    expect(overlay!.marketSignals.get("mkt-1")?.label).toBe("market-mkt-1");
  });

  it("enforces tenant isolation on overlay load", async () => {
    await saveSalesOrgSnapshot(ORG_A, {
      accounts: [],
      contacts: [],
      leads: [],
      opportunities: [],
      interactions: [],
      evidence: [],
      auditLog: [],
      seeded: true,
      marketSignals: [marketSignal("mkt-a", ORG_A), marketSignal("mkt-b", ORG_B)],
      commercialRecommendations: [
        commercialRecommendation("rec-a", ORG_A),
        commercialRecommendation("rec-b", ORG_B),
      ],
    });

    const overlay = await loadTierB1IntelligenceOverlay(ORG_A);
    expect(overlay!.marketSignals.size).toBe(1);
    expect(overlay!.marketSignals.has("mkt-a")).toBe(true);
    expect(overlay!.commercialRecommendations.size).toBe(1);
    expect(overlay!.commercialRecommendations.has("rec-a")).toBe(true);
  });

  it("merges overlay into empty Tier B1 maps without dropping existing rows", async () => {
    const target = emptyTierB1Maps();
    target.marketSignals.set("existing", marketSignal("existing", ORG_A));

    const overlay = emptyTierB1Maps();
    overlay.marketSignals.set("from-file", marketSignal("from-file", ORG_A));

    mergeTierB1IntelligenceIntoStore(target, overlay);
    expect(target.marketSignals.size).toBe(2);
    expect(target.marketSignals.get("from-file")?.label).toBe("market-from-file");
  });

  it("returns null overlay when file is missing (fallback-safe)", async () => {
    const overlay = await loadTierB1IntelligenceOverlay("org-missing-tier-b");
    expect(overlay).toBeNull();
  });

  it("fail-soft when prisma loader is unavailable", async () => {
    prismaLoadTierB1Intelligence.mockRejectedValueOnce(
      new Error("Tier B1 tables not migrated"),
    );

    const maps = await loadTierB1IntelligenceFromPrisma(ORG_A);
    expect(maps).toBeNull();
  });

  it("merges prisma base then file overlay with file winning on id collision", async () => {
    const prismaMaps = emptyTierB1Maps();
    prismaMaps.marketSignals.set("shared", {
      ...marketSignal("shared", ORG_A),
      label: "from-prisma",
    });
    prismaLoadTierB1Intelligence.mockResolvedValueOnce(prismaMaps);

    await saveSalesOrgSnapshot(ORG_A, {
      accounts: [],
      contacts: [],
      leads: [],
      opportunities: [],
      interactions: [],
      evidence: [],
      auditLog: [],
      seeded: true,
      marketSignals: [marketSignal("shared", ORG_A), marketSignal("file-only", ORG_A)],
    });

    const target = emptyTierB1Maps();
    await hydrateTierB1IntelligenceMaps(ORG_A, target);
    expect(target.marketSignals.size).toBe(2);
    expect(target.marketSignals.get("shared")?.label).toBe("market-shared");
    expect(target.marketSignals.get("file-only")?.label).toBe("market-file-only");
  });

  it("hydrates org store maps via hydrateTierB1IntelligenceMaps", async () => {
    process.env.SALESOS_PRISMA_PERSISTENCE = "0";

    await saveSalesOrgSnapshot(ORG_A, {
      accounts: [],
      contacts: [],
      leads: [],
      opportunities: [],
      interactions: [],
      evidence: [],
      auditLog: [],
      seeded: true,
      commercialRecommendations: [commercialRecommendation("rec-store", ORG_A)],
    });

    const store = emptyTierB1Maps();
    await hydrateTierB1IntelligenceMaps(ORG_A, store);
    expect(store.commercialRecommendations.get("rec-store")?.title).toBe(
      "rec-rec-store",
    );
  });
});
