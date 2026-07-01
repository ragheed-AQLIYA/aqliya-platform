/**
 * Phase 28.3 — Release readiness assessment tests.
 */

import { jest } from "@jest/globals";

const mockFindUniqueOrThrowVersion = jest.fn();
const mockBindingsFindMany = jest.fn();
const mockBuildManifest = jest.fn();

jest.mock("@/lib/knowledge-foundation/provenance-manifest", () => ({
  buildVersionProvenanceManifest: mockBuildManifest,
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    knowledgeFoundationVersion: {
      findUniqueOrThrow: mockFindUniqueOrThrowVersion,
    },
    knowledgeFoundationVersionCandidate: {
      findMany: mockBindingsFindMany,
    },
  },
}));

import { evaluateReleaseReadiness } from "@/lib/knowledge-foundation/release-readiness";

function makeBinding(
  overrides: Partial<{
    canonicalCode: string;
    confidence: number;
    evidenceCount: number;
    includedInRelease: boolean;
  }> = {},
) {
  const canonicalCode = overrides.canonicalCode ?? "CA-1000";
  return {
    id: `bind-${canonicalCode}`,
    versionId: "kfv-1",
    candidateId: `kc-${canonicalCode}`,
    boundById: "user-1",
    boundAt: new Date("2026-06-20T10:00:00.000Z"),
    includedInRelease: overrides.includedInRelease ?? false,
    releasedAt: null,
    notes: null,
    candidate: {
      id: `kc-${canonicalCode}`,
      candidatePhrase: `Phrase ${canonicalCode}`,
      canonicalCode,
      category: "asset",
      confidence: overrides.confidence ?? 0.85,
      supportCount: 3,
      organizationCount: 2,
      _count: { evidence: overrides.evidenceCount ?? 2 },
    },
  };
}

function makeManifest(candidateCount: number) {
  return {
    versionId: "kfv-1",
    versionNumber: "1.0.0",
    generatedAt: new Date().toISOString(),
    candidateCount,
    candidates: Array.from({ length: candidateCount }, (_, i) => ({
      candidateId: `kc-${i}`,
      pattern: `P${i}`,
      canonicalCode: `CA-${i}`,
      category: "asset",
      supportCount: 1,
      organizationCount: 1,
      confidence: 0.8,
      promotionDate: null,
      boundAt: new Date().toISOString(),
      boundById: "user-1",
      evidenceSummary: {
        evidenceCount: 1,
        contributingOrganizationCount: 1,
        evidenceTypes: ["pattern"],
      },
    })),
  };
}

describe("Phase 28.3 — evaluateReleaseReadiness", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindUniqueOrThrowVersion.mockResolvedValue({
      id: "kfv-1",
      status: "APPROVED",
      versionNumber: "1.0.0",
    });
  });

  it("marks APPROVED version with bindings as ready", async () => {
    mockBindingsFindMany.mockResolvedValue([
      makeBinding({ canonicalCode: "CA-1000" }),
      makeBinding({ canonicalCode: "CA-2000" }),
    ]);
    mockBuildManifest.mockResolvedValue(makeManifest(2));

    const result = await evaluateReleaseReadiness("kfv-1");

    expect(result.ready).toBe(true);
    expect(result.blockers).toHaveLength(0);
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.metrics.boundCandidateCount).toBe(2);
  });

  it("blocks DRAFT version from release readiness", async () => {
    mockFindUniqueOrThrowVersion.mockResolvedValue({
      id: "kfv-1",
      status: "DRAFT",
      versionNumber: "0.1.0",
    });
    mockBindingsFindMany.mockResolvedValue([makeBinding()]);
    mockBuildManifest.mockResolvedValue(makeManifest(1));

    const result = await evaluateReleaseReadiness("kfv-1");

    expect(result.ready).toBe(false);
    expect(result.blockers.some((b) => b.includes("APPROVED"))).toBe(true);
  });

  it("blocks when no candidates are bound", async () => {
    mockBindingsFindMany.mockResolvedValue([]);
    mockBuildManifest.mockResolvedValue(makeManifest(0));

    const result = await evaluateReleaseReadiness("kfv-1");

    expect(result.ready).toBe(false);
    expect(result.blockers.some((b) => b.includes("No candidates"))).toBe(true);
    expect(result.score).toBe(0);
  });

  it("blocks duplicate canonical codes", async () => {
    mockBindingsFindMany.mockResolvedValue([
      makeBinding({ canonicalCode: "CA-DUP" }),
      makeBinding({ canonicalCode: "CA-DUP" }),
    ]);
    mockBuildManifest.mockResolvedValue(makeManifest(2));

    const result = await evaluateReleaseReadiness("kfv-1");

    expect(result.ready).toBe(false);
    expect(result.metrics.duplicateCanonicalCodes).toContain("CA-DUP");
    expect(result.blockers.some((b) => b.includes("Duplicate"))).toBe(true);
  });

  it("warns on missing evidence and low confidence", async () => {
    mockBindingsFindMany.mockResolvedValue([
      makeBinding({ canonicalCode: "CA-A", evidenceCount: 0, confidence: 0.3 }),
    ]);
    mockBuildManifest.mockResolvedValue(makeManifest(1));

    const result = await evaluateReleaseReadiness("kfv-1");

    expect(result.warnings.some((w) => w.includes("no linked evidence"))).toBe(
      true,
    );
    expect(result.warnings.some((w) => w.includes("confidence below"))).toBe(
      true,
    );
    expect(result.metrics.candidatesWithoutEvidence).toBe(1);
    expect(result.metrics.candidatesWithLowConfidence).toBe(1);
  });

  it("counts released candidates in metrics", async () => {
    mockBindingsFindMany.mockResolvedValue([
      makeBinding({ canonicalCode: "CA-R1", includedInRelease: true }),
      makeBinding({ canonicalCode: "CA-R2", includedInRelease: false }),
    ]);
    mockBuildManifest.mockResolvedValue(makeManifest(2));

    const result = await evaluateReleaseReadiness("kfv-1");

    expect(result.metrics.releasedCandidateCount).toBe(1);
  });
});
