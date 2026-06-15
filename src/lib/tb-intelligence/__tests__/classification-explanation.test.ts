import {
  buildExplanationFromResult,
  buildExplanationFromPatternFallback,
  mapClassificationSourceToUiType,
} from "@/lib/tb-intelligence/classification-explanation";
import type { ClassificationResult } from "@/lib/tb-intelligence/types";

describe("classification-explanation", () => {
  const firmMemoryResult: ClassificationResult = {
    canonicalAccountId: "ca-1",
    canonicalCode: "CA-1010",
    canonicalName: "Cash",
    category: "assets",
    confidence: 0.75,
    source: "firm_memory",
    sourceDetail: { tier: "gl_code" },
    evidenceDetail: {
      erpMap1: "Cash and cash equivalents",
      erpMap2: "Bank",
      matchedPatternId: "pat-1",
      matchedBy: "gl_code",
    },
    memoryGovernance: {
      status: "CONFIRMED",
      trustedForAutoSuggest: false,
      hitCount: 1,
      reviewerCount: 1,
      lastUsedAt: "2026-06-01T00:00:00.000Z",
      lastConfirmedAt: "2026-05-01T00:00:00.000Z",
    },
  };

  it("buildExplanationFromResult maps firm memory with trust not auto-suggest", () => {
    const ex = buildExplanationFromResult(firmMemoryResult, [
      "Cash and cash equivalents",
      "Bank",
    ]);
    expect(ex.source.type).toBe("firm_memory");
    expect(ex.source.tier).toBe("gl_code");
    expect(ex.memoryGovernance?.status).toBe("CONFIRMED");
    expect(ex.autoSuggestEligible).toBe(false);
    expect(ex.evidence?.erpMap1).toBe("Cash and cash equivalents");
  });

  it("autoSuggestEligible only when TRUSTED", () => {
    const trusted = buildExplanationFromResult({
      ...firmMemoryResult,
      memoryGovernance: {
        status: "TRUSTED",
        trustedForAutoSuggest: true,
        hitCount: 5,
        reviewerCount: 2,
      },
    });
    expect(trusted.autoSuggestEligible).toBe(true);
  });

  it("maps rule source to erp_rule UI type", () => {
    expect(mapClassificationSourceToUiType("rule")).toBe("erp_rule");
    expect(mapClassificationSourceToUiType("local")).toBe("local_ai");
  });

  it("pattern fallback uses evaluated governance", () => {
    const ex = buildExplanationFromPatternFallback(
      {
        id: "p1",
        clientAccountCode: "1100",
        hitCount: 1,
        erpMap1Label: "Cash",
        erpMap2Label: null,
        status: "CONFIRMED",
        confirmedReviewerIds: ["r1"],
        lastConfirmedAt: new Date("2026-05-01"),
        lastUsedAt: new Date("2026-06-01"),
        deprecatedAt: null,
      },
      "CA-1010",
    );
    expect(ex.memoryGovernance?.status).toBe("CONFIRMED");
    expect(ex.autoSuggestEligible).toBe(false);
  });
});
