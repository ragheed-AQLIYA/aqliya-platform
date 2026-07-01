/**
 * Phase 9 / 28.2 — Knowledge Foundation Diff Engine Tests.
 *
 * Diff compares version-bound candidate sets via KnowledgeFoundationVersionCandidate.
 */

import { jest } from "@jest/globals";

jest.mock("@/lib/knowledge-foundation/events", () => ({
  emitFoundationEvent: jest.fn().mockResolvedValue(undefined),
}));

const mockFindUniqueOrThrow = jest.fn();
const mockBindingsFindMany = jest.fn();
const mockDiffUpsert = jest.fn();

jest.mock("@/lib/prisma", () => {
  const base = jest.requireActual<{ default: Record<string, unknown> }>(
    "@/__mocks__/prisma-mock.js",
  );
  return {
    __esModule: true,
    default: {
      ...base.default,
      knowledgeFoundationVersion: {
        ...(base.default.knowledgeFoundationVersion as Record<string, unknown>),
        findUniqueOrThrow: mockFindUniqueOrThrow,
      },
      knowledgeFoundationVersionCandidate: {
        ...(base.default.knowledgeFoundationVersionCandidate as Record<
          string,
          unknown
        >),
        findMany: mockBindingsFindMany,
      },
      knowledgeFoundationDiff: {
        ...(base.default.knowledgeFoundationDiff as Record<string, unknown>),
        upsert: mockDiffUpsert,
      },
    },
    prisma: {
      ...base.default,
      knowledgeFoundationVersion: {
        ...(base.default.knowledgeFoundationVersion as Record<string, unknown>),
        findUniqueOrThrow: mockFindUniqueOrThrow,
      },
      knowledgeFoundationVersionCandidate: {
        ...(base.default.knowledgeFoundationVersionCandidate as Record<
          string,
          unknown
        >),
        findMany: mockBindingsFindMany,
      },
      knowledgeFoundationDiff: {
        ...(base.default.knowledgeFoundationDiff as Record<string, unknown>),
        upsert: mockDiffUpsert,
      },
    },
  };
});

import { generateDiff } from "@/lib/knowledge-foundation/diff-engine";

const VERSION_1 = {
  id: "kfv-v1",
  versionNumber: "1.0.0",
  status: "ACTIVE",
  createdAt: new Date("2026-01-01"),
};

const VERSION_2 = {
  id: "kfv-v2",
  versionNumber: "2.0.0",
  status: "RELEASED",
  createdAt: new Date("2026-06-01"),
};

function makeBinding(
  versionId: string,
  overrides: Partial<{
    candidateId: string;
    candidatePhrase: string;
    canonicalCode: string;
    category: string;
    confidence: number;
  }> = {},
) {
  return {
    id: `bind-${overrides.candidateId ?? "kc-1"}`,
    versionId,
    candidateId: overrides.candidateId ?? "kc-1",
    boundById: "user-1",
    boundAt: new Date("2026-01-01"),
    includedInRelease: true,
    releasedAt: new Date("2026-01-02"),
    candidate: {
      id: overrides.candidateId ?? "kc-1",
      candidatePhrase: overrides.candidatePhrase ?? "Rule",
      canonicalCode: overrides.canonicalCode ?? "CA-1010",
      category: overrides.category ?? "asset",
      confidence: overrides.confidence ?? 0.8,
      supportCount: 2,
      organizationCount: 1,
    },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockDiffUpsert.mockResolvedValue({ id: "kfd-1" });
});

describe("Knowledge Foundation Diff Engine", () => {
  it("detects added rules from version bindings", async () => {
    mockFindUniqueOrThrow
      .mockResolvedValueOnce(VERSION_1)
      .mockResolvedValueOnce(VERSION_2);

    mockBindingsFindMany
      .mockResolvedValueOnce([makeBinding("kfv-v1")])
      .mockResolvedValueOnce([
        makeBinding("kfv-v2"),
        makeBinding("kfv-v2", {
          candidateId: "kc-2",
          canonicalCode: "CA-2020",
          candidatePhrase: "New Rule",
          category: "liability",
          confidence: 0.9,
        }),
      ]);

    const result = await generateDiff("kfv-v1", "kfv-v2", "user-1");

    expect(result.addedRules).toHaveLength(1);
    expect(result.addedRules[0]!.canonicalCode).toBe("CA-2020");
    expect(result.removedRules).toHaveLength(0);
  });

  it("detects removed rules from version bindings", async () => {
    mockFindUniqueOrThrow
      .mockResolvedValueOnce(VERSION_1)
      .mockResolvedValueOnce(VERSION_2);

    mockBindingsFindMany
      .mockResolvedValueOnce([
        makeBinding("kfv-v1", {
          candidateId: "kc-x",
          canonicalCode: "CA-9999",
          candidatePhrase: "Removed Rule",
          confidence: 0.7,
        }),
        makeBinding("kfv-v1"),
      ])
      .mockResolvedValueOnce([makeBinding("kfv-v2")]);

    const result = await generateDiff("kfv-v1", "kfv-v2", "user-1");

    expect(result.removedRules).toHaveLength(1);
    expect(result.removedRules[0]!.canonicalCode).toBe("CA-9999");
    expect(result.breakingChange).toBe(true);
  });

  it("detects modified rules (confidence change)", async () => {
    mockFindUniqueOrThrow
      .mockResolvedValueOnce(VERSION_1)
      .mockResolvedValueOnce(VERSION_2);

    mockBindingsFindMany
      .mockResolvedValueOnce([
        makeBinding("kfv-v1", {
          candidatePhrase: "Changed Rule",
          confidence: 0.7,
        }),
      ])
      .mockResolvedValueOnce([
        makeBinding("kfv-v2", {
          candidatePhrase: "Changed Rule",
          confidence: 0.9,
        }),
      ]);

    const result = await generateDiff("kfv-v1", "kfv-v2", "user-1");

    expect(result.modifiedRules).toHaveLength(1);
    expect(result.modifiedRules[0]!.oldConfidence).toBe(0.7);
    expect(result.modifiedRules[0]!.newConfidence).toBe(0.9);
  });

  it("returns empty diff for identical bound sets", async () => {
    mockFindUniqueOrThrow
      .mockResolvedValueOnce(VERSION_1)
      .mockResolvedValueOnce(VERSION_2);

    mockBindingsFindMany
      .mockResolvedValueOnce([makeBinding("kfv-v1")])
      .mockResolvedValueOnce([makeBinding("kfv-v2")]);

    const result = await generateDiff("kfv-v1", "kfv-v2", "user-1");

    expect(result.addedRules).toHaveLength(0);
    expect(result.modifiedRules).toHaveLength(0);
    expect(result.removedRules).toHaveLength(0);
    expect(result.breakingChange).toBe(false);
    expect(result.riskScore).toBe(0);
  });

  it("computes risk score for mixed binding changes", async () => {
    mockFindUniqueOrThrow
      .mockResolvedValueOnce(VERSION_1)
      .mockResolvedValueOnce(VERSION_2);

    mockBindingsFindMany
      .mockResolvedValueOnce([
        makeBinding("kfv-v1", {
          candidateId: "kc-r",
          canonicalCode: "CA-9999",
          candidatePhrase: "Removed X",
          confidence: 0.7,
        }),
      ])
      .mockResolvedValueOnce([
        makeBinding("kfv-v2", {
          candidateId: "kc-a",
          canonicalCode: "CA-1010",
          candidatePhrase: "New Y",
          confidence: 0.9,
        }),
      ]);

    const result = await generateDiff("kfv-v1", "kfv-v2", "user-1");

    expect(result.riskScore).toBeGreaterThan(0);
    expect(result.riskScore).toBeLessThanOrEqual(1);
    expect(result.summary).toContain("+1");
    expect(result.summary).toContain("-1");
  });

  it("emits diff.generated event", async () => {
    mockFindUniqueOrThrow
      .mockResolvedValueOnce(VERSION_1)
      .mockResolvedValueOnce(VERSION_2);

    mockBindingsFindMany
      .mockResolvedValueOnce([makeBinding("kfv-v1")])
      .mockResolvedValueOnce([
        makeBinding("kfv-v2", {
          candidateId: "kc-2",
          canonicalCode: "CA-2020",
          candidatePhrase: "Added Rule",
        }),
      ]);

    const { emitFoundationEvent } = jest.requireMock(
      "@/lib/knowledge-foundation/events",
    );

    await generateDiff("kfv-v1", "kfv-v2", "user-1");

    expect(emitFoundationEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "knowledge.foundation.diff.generated" }),
    );
  });
});
