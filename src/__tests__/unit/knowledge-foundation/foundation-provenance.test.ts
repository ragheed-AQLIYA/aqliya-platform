/**
 * Phase 28.1 — Provenance manifest tests.
 */

import { jest } from "@jest/globals";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    knowledgeFoundationVersion: {
      findUniqueOrThrow: async () => ({
        id: "kfv-1",
        versionNumber: "1.0.0",
      }),
    },
    knowledgeFoundationVersionCandidate: {
      findMany: async () => [
        {
          candidateId: "kc-1",
          boundAt: new Date("2026-06-21T10:00:00.000Z"),
          boundById: "user-1",
          candidate: {
            candidatePhrase: "مصروف ايجار معدات",
            canonicalCode: "CA-5020",
            category: "expense",
            supportCount: 4,
            organizationCount: 3,
            confidence: 0.82,
            promotionHistory: [{ promotedAt: new Date("2026-06-20T12:00:00.000Z") }],
            evidence: [
              { evidenceType: "feedback", organizationId: "org-a" },
              { evidenceType: "pattern", organizationId: "org-b" },
            ],
          },
        },
      ],
    },
  },
}));

import { buildVersionProvenanceManifest } from "@/lib/knowledge-foundation/provenance-manifest";

describe("foundation-provenance", () => {
  it("generates canonical manifest without raw TB client data", async () => {
    const manifest = await buildVersionProvenanceManifest("kfv-1");

    expect(manifest.versionId).toBe("kfv-1");
    expect(manifest.versionNumber).toBe("1.0.0");
    expect(manifest.candidateCount).toBe(1);
    expect(manifest.candidates[0]).toMatchObject({
      candidateId: "kc-1",
      pattern: "مصروف ايجار معدات",
      canonicalCode: "CA-5020",
      supportCount: 4,
      organizationCount: 3,
      confidence: 0.82,
      evidenceSummary: {
        evidenceCount: 2,
        contributingOrganizationCount: 2,
        evidenceTypes: expect.arrayContaining(["feedback", "pattern"]),
      },
    });

    const serialized = JSON.stringify(manifest);
    expect(serialized).not.toContain("clientAccountCode");
    expect(serialized).not.toContain("accountName");
  });
});
