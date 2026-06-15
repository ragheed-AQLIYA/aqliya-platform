import {
  evaluateMemoryGovernance,
  mergeReviewerIds,
  MEMORY_TRUST_MIN_HIT_COUNT,
  MEMORY_TRUST_MIN_REVIEWERS,
} from "@/lib/tb-intelligence/firm-memory-governance";

describe("firm-memory-governance", () => {
  const now = new Date("2026-06-14T12:00:00.000Z");

  it("mergeReviewerIds deduplicates", () => {
    expect(mergeReviewerIds(["a"], "b")).toEqual(["a", "b"]);
    expect(mergeReviewerIds(["a", "b"], "a")).toEqual(["a", "b"]);
  });

  it("CONFIRMED when hitCount below trust threshold", () => {
    const g = evaluateMemoryGovernance(
      {
        status: "CONFIRMED",
        hitCount: 2,
        confirmedReviewerIds: ["r1", "r2"],
        lastConfirmedAt: now,
        lastUsedAt: now,
      },
      now,
    );
    expect(g.status).toBe("CONFIRMED");
    expect(g.trustedForAutoSuggest).toBe(false);
  });

  it("TRUSTED when all criteria met", () => {
    const g = evaluateMemoryGovernance(
      {
        status: "CONFIRMED",
        hitCount: MEMORY_TRUST_MIN_HIT_COUNT,
        confirmedReviewerIds: ["r1", "r2"],
        lastConfirmedAt: now,
        lastUsedAt: now,
      },
      now,
    );
    expect(g.status).toBe("TRUSTED");
    expect(g.trustedForAutoSuggest).toBe(true);
  });

  it("not TRUSTED when only one reviewer", () => {
    const g = evaluateMemoryGovernance(
      {
        status: "CONFIRMED",
        hitCount: MEMORY_TRUST_MIN_HIT_COUNT,
        confirmedReviewerIds: ["r1"],
        lastConfirmedAt: now,
        lastUsedAt: now,
      },
      now,
    );
    expect(g.trustedForAutoSuggest).toBe(false);
  });

  it("DEPRECATED never trusted", () => {
    const g = evaluateMemoryGovernance(
      {
        status: "DEPRECATED",
        hitCount: 10,
        confirmedReviewerIds: ["r1", "r2", "r3"],
        lastConfirmedAt: now,
        lastUsedAt: now,
        deprecatedAt: now,
      },
      now,
    );
    expect(g.trustedForAutoSuggest).toBe(false);
    expect(g.status).toBe("DEPRECATED");
  });
});
