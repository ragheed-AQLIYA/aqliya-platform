/**
 * Phase 28.2 — Version-scoped release and diff tests.
 */

import { jest } from "@jest/globals";
import * as fs from "fs";

const mockEmitFoundationEvent = jest.fn<() => Promise<void>>();
const mockFindUniqueOrThrowVersion = jest.fn();
const mockBindingsFindMany = jest.fn();
const mockBindingsUpdateMany = jest.fn();
const mockBindingsCount = jest.fn();
const mockVersionUpdate = jest.fn();
const mockReleaseCreate = jest.fn();
const mockReleaseUpdate = jest.fn();
const mockTransaction = jest.fn();
const mockDiffUpsert = jest.fn();
const mockWriteFile = jest.fn<() => Promise<void>>();
const mockMkdir = jest.fn<() => Promise<void>>();

jest.mock("@/lib/knowledge-foundation/events", () => ({
  emitFoundationEvent: mockEmitFoundationEvent,
  onFoundationEvent: jest.fn().mockReturnValue(() => {}),
  onAnyFoundationEvent: jest.fn().mockReturnValue(() => {}),
  clearFoundationHandlers: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  getCurrentUser: jest.fn().mockResolvedValue({
    id: "user-op",
    role: "OPERATOR",
  }),
}));

jest.mock("@/lib/knowledge-foundation/audit-handler", () => ({
  registerFoundationAuditHandler: jest.fn(),
}));

jest.mock("@/lib/knowledge-foundation/trust-chain", () => ({
  resolveChainParentRelease: jest.fn().mockResolvedValue(null),
}));

jest.mock("fs", () => ({
  promises: {
    mkdir: mockMkdir,
    writeFile: mockWriteFile,
  },
}));

const globalPromotedPool = [
  {
    id: "kc-global-1",
    candidatePhrase: "Global Only",
    canonicalCode: "CA-9000",
    category: "expense",
    confidence: 0.99,
    supportCount: 10,
    organizationCount: 5,
    status: "PROMOTED",
  },
];

const boundForVersion = [
  {
    id: "bind-1",
    versionId: "kfv-v1",
    candidateId: "kc-bound-1",
    boundById: "user-op",
    boundAt: new Date("2026-06-20T10:00:00.000Z"),
    includedInRelease: false,
    releasedAt: null,
    notes: null,
    candidate: {
      id: "kc-bound-1",
      candidatePhrase: "Bound Rule A",
      canonicalCode: "CA-1010",
      category: "asset",
      confidence: 0.8,
      supportCount: 3,
      organizationCount: 2,
      promotionHistory: [{ promotedAt: new Date("2026-06-19T12:00:00.000Z") }],
      evidence: [{ evidenceType: "pattern", organizationId: "org-1" }],
    },
  },
  {
    id: "bind-2",
    versionId: "kfv-v1",
    candidateId: "kc-bound-2",
    boundById: "user-op",
    boundAt: new Date("2026-06-20T11:00:00.000Z"),
    includedInRelease: false,
    releasedAt: null,
    notes: null,
    candidate: {
      id: "kc-bound-2",
      candidatePhrase: "Bound Rule B",
      canonicalCode: "CA-2020",
      category: "liability",
      confidence: 0.9,
      supportCount: 5,
      organizationCount: 3,
      promotionHistory: [{ promotedAt: new Date("2026-06-18T12:00:00.000Z") }],
      evidence: [{ evidenceType: "feedback", organizationId: "org-2" }],
    },
  },
];

jest.mock("@/lib/prisma", () => ({
  prisma: {
    knowledgeFoundationVersion: {
      findUniqueOrThrow: mockFindUniqueOrThrowVersion,
      update: mockVersionUpdate,
    },
    knowledgeFoundationVersionCandidate: {
      findMany: mockBindingsFindMany,
      count: mockBindingsCount,
      updateMany: mockBindingsUpdateMany,
    },
    knowledgeFoundationRelease: {
      create: mockReleaseCreate,
      update: mockReleaseUpdate,
    },
    knowledgeFoundationDiff: {
      upsert: mockDiffUpsert,
    },
    knowledgeCandidate: {
      findMany: jest.fn(async () => globalPromotedPool),
    },
    $transaction: mockTransaction,
  },
}));

import { generateReleasePackage } from "@/lib/knowledge-foundation/release-generator";
import { generateDiff } from "@/lib/knowledge-foundation/diff-engine";

function bindingRow(
  versionId: string,
  overrides: Partial<(typeof boundForVersion)[0]> & {
    candidate?: Partial<(typeof boundForVersion)[0]["candidate"]>;
  },
) {
  const base = boundForVersion[0]!;
  return {
    ...base,
    ...overrides,
    versionId,
    candidate: { ...base.candidate, ...overrides.candidate },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockMkdir.mockResolvedValue(undefined);
  mockWriteFile.mockResolvedValue(undefined);
  mockBindingsUpdateMany.mockResolvedValue({ count: 2 });
  mockBindingsCount.mockResolvedValue(2);
  mockVersionUpdate.mockImplementation((args: { data: Record<string, unknown> }) => ({
    id: "kfv-v1",
    ...args.data,
  }));
  mockReleaseCreate.mockResolvedValue({ id: "kfr-1" });
  mockReleaseUpdate.mockResolvedValue({ id: "kfr-1", artifactStatus: "COMPLETE" });
  mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
    fn({
      knowledgeFoundationVersionCandidate: {
        updateMany: mockBindingsUpdateMany,
        count: mockBindingsCount,
      },
      knowledgeFoundationVersion: {
        update: mockVersionUpdate,
      },
      knowledgeFoundationRelease: {
        create: mockReleaseCreate,
      },
    }),
  );
  mockDiffUpsert.mockResolvedValue({ id: "kfd-1" });
  mockFindUniqueOrThrowVersion.mockImplementation(
    async ({ where }: { where: { id: string } }) => {
      if (where.id === "kfv-v1") {
        return {
          id: "kfv-v1",
          versionNumber: "1.0.0",
          status: "APPROVED",
        };
      }
      if (where.id === "kfv-v2") {
        return {
          id: "kfv-v2",
          versionNumber: "2.0.0",
          status: "RELEASED",
        };
      }
      throw new Error("not found");
    },
  );
});

describe("Phase 28.2 — version-scoped release generator", () => {
  beforeEach(() => {
    mockBindingsFindMany.mockImplementation(
      async ({ where }: { where?: { versionId?: string } }) => {
        if (where?.versionId === "kfv-v1") return boundForVersion;
        return [];
      },
    );
  });

  it("releases only bound candidates (not global PROMOTED pool)", async () => {
    const result = await generateReleasePackage({
      versionId: "kfv-v1",
      versionNumber: "1.0.0",
      actorId: "user-op",
    });

    expect(result.candidateList).toHaveLength(2);
    expect(result.candidateList.map((c) => c.id)).toEqual([
      "kc-bound-1",
      "kc-bound-2",
    ]);
    expect(result.candidateList.some((c) => c.id === "kc-global-1")).toBe(false);
  });

  it("manifest contains versionId, versionNumber, candidateIds, candidateCount, sha256", async () => {
    const result = await generateReleasePackage({
      versionId: "kfv-v1",
      versionNumber: "1.0.0",
      actorId: "user-op",
    });

    expect(result.manifest.versionId).toBe("kfv-v1");
    expect(result.manifest.versionNumber).toBe("1.0.0");
    expect(result.manifest.candidateIds).toEqual(["kc-bound-1", "kc-bound-2"]);
    expect(result.manifest.candidateCount).toBe(2);
    expect(result.manifest.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(result.manifest.generatedAt).toBeDefined();
    expect(result.manifest.provenance).toBeDefined();
  });

  it("sets includedInRelease on bindings after release", async () => {
    await generateReleasePackage({
      versionId: "kfv-v1",
      versionNumber: "1.0.0",
      actorId: "user-op",
    });

    expect(mockBindingsUpdateMany).toHaveBeenCalledWith({
      where: { versionId: "kfv-v1" },
      data: expect.objectContaining({
        includedInRelease: true,
        releasedAt: expect.any(Date),
      }),
    });
  });

  it("persists provenance snapshot on KnowledgeFoundationRelease", async () => {
    await generateReleasePackage({
      versionId: "kfv-v1",
      versionNumber: "1.0.0",
      actorId: "user-op",
      releaseNotes: "Pilot release",
    });

    expect(mockReleaseCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        versionId: "kfv-v1",
        manifestPath: "knowledge/releases/v1.0.0/manifest.json",
        manifestSha256: expect.stringMatching(/^[a-f0-9]{64}$/),
        provenanceSnapshot: expect.objectContaining({
          versionId: "kfv-v1",
          candidateCount: 2,
        }),
        artifactStatus: "PENDING",
      }),
    });
    expect(mockReleaseUpdate).toHaveBeenCalledWith({
      where: { id: "kfr-1" },
      data: { artifactStatus: "COMPLETE" },
    });
  });

  it("writes provenance-manifest.json artifact", async () => {
    await generateReleasePackage({
      versionId: "kfv-v1",
      versionNumber: "1.0.0",
      actorId: "user-op",
    });

    const writtenPaths = mockWriteFile.mock.calls.map((c) => String(c[0]));
    expect(
      writtenPaths.some((p) => p.includes("provenance-manifest.json")),
    ).toBe(true);
    expect(writtenPaths.some((p) => p.includes("manifest.json"))).toBe(true);
  });
});

describe("Phase 28.2 — version-scoped diff engine", () => {
  it("compares version bindings (not createdAt proxy)", async () => {
    mockBindingsFindMany.mockImplementation(
      async ({ where }: { where?: { versionId?: string } }) => {
        if (where?.versionId === "kfv-v1") {
          return [bindingRow("kfv-v1", {})];
        }
        if (where?.versionId === "kfv-v2") {
          return [
            bindingRow("kfv-v2", { candidateId: "kc-bound-1", id: "bind-3" }),
            bindingRow("kfv-v2", {
              id: "bind-4",
              candidateId: "kc-bound-3",
              candidate: {
                id: "kc-bound-3",
                candidatePhrase: "New Rule",
                canonicalCode: "CA-3030",
                category: "equity",
                confidence: 0.85,
              },
            }),
          ];
        }
        return [];
      },
    );

    const result = await generateDiff("kfv-v1", "kfv-v2", "user-op");

    expect(result.addedRules).toHaveLength(1);
    expect(result.addedRules[0]!.canonicalCode).toBe("CA-3030");
    expect(result.removedRules).toHaveLength(0);
  });

  it("detects added, removed, and modified across overlapping bindings", async () => {
    mockBindingsFindMany.mockImplementation(
      async ({ where }: { where?: { versionId?: string } }) => {
        if (where?.versionId === "kfv-v1") {
          return [
            bindingRow("kfv-v1", {}),
            bindingRow("kfv-v1", {
              id: "bind-x",
              candidateId: "kc-removed",
              candidate: {
                id: "kc-removed",
                candidatePhrase: "Removed Rule",
                canonicalCode: "CA-9999",
                confidence: 0.7,
              },
            }),
          ];
        }
        if (where?.versionId === "kfv-v2") {
          return [
            bindingRow("kfv-v2", {
              id: "bind-y",
              candidate: { confidence: 0.95 },
            }),
            bindingRow("kfv-v2", {
              id: "bind-z",
              candidateId: "kc-added",
              candidate: {
                id: "kc-added",
                candidatePhrase: "Added Rule",
                canonicalCode: "CA-4040",
                confidence: 0.88,
              },
            }),
          ];
        }
        return [];
      },
    );

    const result = await generateDiff("kfv-v1", "kfv-v2", "user-op");

    expect(result.addedRules.map((r) => r.canonicalCode)).toContain("CA-4040");
    expect(result.removedRules.map((r) => r.canonicalCode)).toContain("CA-9999");
    expect(result.modifiedRules).toHaveLength(1);
    expect(result.modifiedRules[0]!.canonicalCode).toBe("CA-1010");
    expect(result.modifiedRules[0]!.oldConfidence).toBe(0.8);
    expect(result.modifiedRules[0]!.newConfidence).toBe(0.95);
    expect(result.riskScore).toBeGreaterThan(0);
  });
});
