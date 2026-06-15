import {
  evaluateMemoryGovernance,
  mergeReviewerIds,
  MEMORY_TRUST_MIN_HIT_COUNT,
} from "@/lib/tb-intelligence/firm-memory-governance";
import { confidenceFromHitCount } from "@/lib/tb-intelligence/firm-memory";

const FIRM_MEMORY_AUTO_SUGGEST_MIN_CONFIDENCE = 0.85;

function isAutoSuggestEligible(hitCount: number, reviewerIds: string[], now: Date) {
  const g = evaluateMemoryGovernance(
    {
      status: "CONFIRMED",
      hitCount,
      confirmedReviewerIds: reviewerIds,
      lastConfirmedAt: now,
      lastUsedAt: now,
    },
    now,
  );
  const confidence = confidenceFromHitCount(hitCount);
  return g.trustedForAutoSuggest && confidence >= FIRM_MEMORY_AUTO_SUGGEST_MIN_CONFIDENCE;
}

describe("firm-memory lifecycle (confirm → trust)", () => {
  const now = new Date("2026-06-14T12:00:00.000Z");

  it("backfill-shaped pattern: CONFIRMED, not auto-suggest", () => {
    const g = evaluateMemoryGovernance(
      {
        status: "CONFIRMED",
        hitCount: 1,
        confirmedReviewerIds: ["reviewer-a"],
        lastConfirmedAt: now,
        lastUsedAt: now,
      },
      now,
    );
    expect(g.status).toBe("CONFIRMED");
    expect(g.trustedForAutoSuggest).toBe(false);
    expect(isAutoSuggestEligible(1, ["reviewer-a"], now)).toBe(false);
  });

  it("simulated reuse: merges reviewers across confirms", () => {
    let reviewers = mergeReviewerIds([], "reviewer-a");
    reviewers = mergeReviewerIds(reviewers, "reviewer-b");
    expect(reviewers).toEqual(["reviewer-a", "reviewer-b"]);
  });

  it("after trust thresholds: TRUSTED and auto-suggest eligible", () => {
    const reviewers = ["reviewer-a", "reviewer-b"];
    expect(isAutoSuggestEligible(MEMORY_TRUST_MIN_HIT_COUNT, reviewers, now)).toBe(true);
    const g = evaluateMemoryGovernance(
      {
        status: "CONFIRMED",
        hitCount: MEMORY_TRUST_MIN_HIT_COUNT,
        confirmedReviewerIds: reviewers,
        lastConfirmedAt: now,
        lastUsedAt: now,
      },
      now,
    );
    expect(g.status).toBe("TRUSTED");
  });
});
