/**
 * Phase 28.3 — Governance report generation tests.
 */

import { jest } from "@jest/globals";

const mockFindUniqueOrThrowVersion = jest.fn();
const mockEvaluateReadiness = jest.fn();
const mockBuildManifest = jest.fn();

jest.mock("@/lib/knowledge-foundation/release-readiness", () => ({
  evaluateReleaseReadiness: mockEvaluateReadiness,
}));

jest.mock("@/lib/knowledge-foundation/provenance-manifest", () => ({
  buildVersionProvenanceManifest: mockBuildManifest,
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    knowledgeFoundationVersion: {
      findUniqueOrThrow: mockFindUniqueOrThrowVersion,
    },
  },
}));

import { generateFoundationGovernanceReport } from "@/lib/knowledge-foundation/governance-report";
import { summarizeProvenanceManifest } from "@/lib/knowledge-foundation/provenance-summary";

const readinessFixture = {
  ready: true,
  score: 90,
  warnings: [],
  blockers: [],
  metrics: {
    versionStatus: "APPROVED",
    boundCandidateCount: 2,
    releasedCandidateCount: 0,
    averageConfidence: 0.85,
    averageEvidenceCount: 2,
    duplicateCanonicalCodes: [],
    candidatesWithoutEvidence: 0,
    candidatesWithLowConfidence: 0,
    provenanceCandidateCount: 2,
  },
};

const manifestFixture = {
  versionId: "kfv-1",
  versionNumber: "1.0.0",
  generatedAt: "2026-06-21T12:00:00.000Z",
  candidateCount: 2,
  candidates: [
    {
      candidateId: "kc-1",
      pattern: "Rule A",
      canonicalCode: "CA-1000",
      category: "asset",
      supportCount: 3,
      organizationCount: 2,
      confidence: 0.9,
      promotionDate: "2026-06-19T00:00:00.000Z",
      boundAt: "2026-06-20T00:00:00.000Z",
      boundById: "user-1",
      evidenceSummary: {
        evidenceCount: 2,
        contributingOrganizationCount: 2,
        evidenceTypes: ["pattern"],
      },
    },
    {
      candidateId: "kc-2",
      pattern: "Rule B",
      canonicalCode: "CA-2000",
      category: "liability",
      supportCount: 1,
      organizationCount: 1,
      confidence: 0.8,
      promotionDate: "2026-06-18T00:00:00.000Z",
      boundAt: "2026-06-20T01:00:00.000Z",
      boundById: "user-1",
      evidenceSummary: {
        evidenceCount: 1,
        contributingOrganizationCount: 1,
        evidenceTypes: ["feedback"],
      },
    },
  ],
};

describe("Phase 28.3 — provenance aggregation", () => {
  it("summarizes manifest without exposing org IDs", () => {
    const summary = summarizeProvenanceManifest(manifestFixture);

    expect(summary.candidateCount).toBe(2);
    expect(summary.totalEvidenceCount).toBe(3);
    expect(summary.contributingOrganizationCount).toBe(3);
    expect(summary.canonicalCodeDistribution).toHaveLength(2);
    expect(summary.averageConfidence).toBeCloseTo(0.85, 2);
    expect(JSON.stringify(summary)).not.toContain("organizationId");
  });
});

describe("Phase 28.3 — generateFoundationGovernanceReport", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEvaluateReadiness.mockResolvedValue(readinessFixture);
    mockBuildManifest.mockResolvedValue(manifestFixture);
    mockFindUniqueOrThrowVersion.mockResolvedValue({
      id: "kfv-1",
      versionNumber: "1.0.0",
      status: "APPROVED",
      createdAt: new Date("2026-06-20T08:00:00.000Z"),
      approvedById: "admin-1",
      activatedAt: null,
      artifactPath: null,
      rollbackVersionId: null,
      releases: [
        {
          id: "rel-1",
          createdAt: new Date("2026-06-21T10:00:00.000Z"),
          manifestPath: "/releases/1.0.0/manifest.json",
          manifestSha256: "abc123",
          artifactStatus: "COMPLETE",
          releaseNotes: "Initial",
          createdById: "op-1",
        },
      ],
    });
  });

  it("generates full governance report structure", async () => {
    const report = await generateFoundationGovernanceReport("kfv-1");

    expect(report.versionId).toBe("kfv-1");
    expect(report.versionNumber).toBe("1.0.0");
    expect(report.lifecycle.status).toBe("APPROVED");
    expect(report.candidateMetrics.boundCandidateCount).toBe(2);
    expect(report.provenanceMetrics.candidateCount).toBe(2);
    expect(report.readiness.ready).toBe(true);
    expect(report.releaseHistory).toHaveLength(1);
    expect(report.releaseHistory[0].artifactStatus).toBe("COMPLETE");
    expect(report.generatedAt).toBeDefined();
  });

  it("includes readiness blockers when version is blocked", async () => {
    mockEvaluateReadiness.mockResolvedValue({
      ...readinessFixture,
      ready: false,
      score: 50,
      blockers: ["Version status is DRAFT; must be APPROVED before release."],
    });

    const report = await generateFoundationGovernanceReport("kfv-1");

    expect(report.readiness.ready).toBe(false);
    expect(report.readiness.blockers.length).toBeGreaterThan(0);
  });
});
