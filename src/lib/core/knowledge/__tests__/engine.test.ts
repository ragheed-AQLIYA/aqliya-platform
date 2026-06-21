/** @jest-environment node */

jest.mock("@/lib/rag/intelligence-core-rag", () => ({
  retrieveGovernedContext: jest.fn(async () => ({
    chunks: [],
    query: "test",
    organizationId: "org-1",
    evidence: [],
    ranking: { resultCount: 0, topSimilarity: null, minSimilarityApplied: 0 },
    governanceSummary: { productKeys: [], sensitivities: [] },
    retrievedAt: new Date().toISOString(),
  })),
}));

import { KnowledgeEngine, retrieve } from "@/lib/core/knowledge/engine";
import { retrieveGovernedContext } from "@/lib/rag/intelligence-core-rag";

describe("KnowledgeEngine (IC-P1-04)", () => {
  it("delegates retrieve to retrieveGovernedContext", async () => {
    const ctx = await retrieve({
      organizationId: "org-1",
      query: "local content rules",
      limit: 5,
    });

    expect(ctx.query).toBe("test");
    expect(retrieveGovernedContext).toHaveBeenCalledWith("local content rules", {
      organizationId: "org-1",
      limit: 5,
      minSimilarity: undefined,
    });
  });

  it("exposes KnowledgeEngine.retrieve alias", async () => {
    await KnowledgeEngine.retrieve({
      organizationId: "org-1",
      query: "audit standards",
    });
    expect(retrieveGovernedContext).toHaveBeenCalled();
  });
});
