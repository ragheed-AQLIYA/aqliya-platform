import { describe, expect, it, beforeEach, afterEach, jest } from "@jest/globals";
import fs from "fs/promises";
import path from "path";
import {
  emptyTierAMaps,
  hydrateTierAIntelligenceMaps,
  loadTierAIntelligenceFromPrisma,
  loadTierAIntelligenceOverlay,
  mergeTierAIntelligenceIntoStore,
  tierAMapsFromPayload,
} from "../tier-a-persistence";
import { saveSalesOrgSnapshot } from "../persistence";
import type { SalesSignal } from "../types";

jest.mock("../prisma-repository", () => ({
  prismaLoadTierAIntelligence: jest.fn(),
}));

import { prismaLoadTierAIntelligence } from "../prisma-repository";

const mockedPrismaLoadTierA = jest.mocked(prismaLoadTierAIntelligence);

const ORG_A = "org-tier-a-a";
const ORG_B = "org-tier-a-b";
const DATA_DIR = path.join(process.cwd(), ".data", "sales");

function signal(id: string, orgId: string): SalesSignal {
  const now = new Date().toISOString();
  return {
    id,
    organizationId: orgId,
    signalType: "buying",
    description: `signal-${id}`,
    strength: "moderate",
    source: "manual",
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
}

describe("tier-a-persistence", () => {
  beforeEach(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    mockedPrismaLoadTierA.mockReset();
    delete process.env.SALESOS_PRISMA_PERSISTENCE;
  });

  afterEach(async () => {
    for (const org of [ORG_A, ORG_B]) {
      const safe = org.replace(/[^a-zA-Z0-9_-]/g, "_");
      await fs.rm(path.join(DATA_DIR, `${safe}.json`), { force: true });
    }
    delete process.env.SALESOS_PRISMA_PERSISTENCE;
  });

  it("hydrates Tier A overlay from file snapshot", async () => {
    await saveSalesOrgSnapshot(ORG_A, {
      accounts: [],
      contacts: [],
      leads: [],
      opportunities: [],
      interactions: [],
      evidence: [],
      auditLog: [],
      seeded: true,
      signals: [signal("sig-1", ORG_A)],
    });

    const overlay = await loadTierAIntelligenceOverlay(ORG_A);
    expect(overlay).not.toBeNull();
    expect(overlay!.signals.size).toBe(1);
    expect(overlay!.signals.get("sig-1")?.description).toBe("signal-sig-1");
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
      signals: [signal("sig-a", ORG_A), signal("sig-b", ORG_B)],
    });

    const overlay = await loadTierAIntelligenceOverlay(ORG_A);
    expect(overlay!.signals.size).toBe(1);
    expect(overlay!.signals.has("sig-a")).toBe(true);
    expect(overlay!.signals.has("sig-b")).toBe(false);
  });

  it("merges overlay into empty Tier A maps without dropping existing rows", async () => {
    const target = emptyTierAMaps();
    target.signals.set("existing", signal("existing", ORG_A));

    const overlay = emptyTierAMaps();
    overlay.signals.set("from-file", signal("from-file", ORG_A));

    mergeTierAIntelligenceIntoStore(target, overlay);
    expect(target.signals.size).toBe(2);
    expect(target.signals.get("from-file")?.description).toBe(
      "signal-from-file",
    );
  });

  it("returns null overlay when file is missing (fallback-safe)", async () => {
    const overlay = await loadTierAIntelligenceOverlay("org-missing-tier-a");
    expect(overlay).toBeNull();
  });

  it("loads Tier A from prisma repository when persistence flag is on", async () => {
    process.env.SALESOS_PRISMA_PERSISTENCE = "1";
    mockedPrismaLoadTierA.mockResolvedValue({
      signals: [signal("sig-db", ORG_A)],
    });

    const maps = await loadTierAIntelligenceFromPrisma(ORG_A);
    expect(maps).not.toBeNull();
    expect(maps!.signals.get("sig-db")?.description).toBe("signal-sig-db");
    expect(mockedPrismaLoadTierA).toHaveBeenCalledWith(ORG_A);
  });

  it("hydrates prisma base then file overlay with file winning on id collision", async () => {
    process.env.SALESOS_PRISMA_PERSISTENCE = "1";
    mockedPrismaLoadTierA.mockResolvedValue({
      signals: [signal("shared", ORG_A)],
    });

    await saveSalesOrgSnapshot(ORG_A, {
      accounts: [],
      contacts: [],
      leads: [],
      opportunities: [],
      interactions: [],
      evidence: [],
      auditLog: [],
      seeded: true,
      signals: [
        {
          ...signal("shared", ORG_A),
          description: "signal-from-file-wins",
        },
        signal("file-only", ORG_A),
      ],
    });

    const target = emptyTierAMaps();
    await hydrateTierAIntelligenceMaps(ORG_A, target);

    expect(target.signals.size).toBe(2);
    expect(target.signals.get("shared")?.description).toBe(
      "signal-from-file-wins",
    );
    expect(target.signals.get("file-only")?.description).toBe(
      "signal-file-only",
    );
  });

  it("normalizes map payloads from prisma repository", () => {
    const maps = tierAMapsFromPayload(ORG_A, {
      signals: new Map([[signal("map-1", ORG_A).id, signal("map-1", ORG_A)]]),
      objections: new Map(),
      competitorMentions: new Map(),
      proofAssets: new Map(),
      icpInsights: new Map(),
      nextActions: new Map(),
      winLossInsights: new Map(),
    });

    expect(maps.signals.get("map-1")?.description).toBe("signal-map-1");
  });
});
