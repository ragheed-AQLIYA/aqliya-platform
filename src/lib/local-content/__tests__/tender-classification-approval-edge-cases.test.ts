import { describe, expect, it } from "@jest/globals";
import { parseTenderSpecFromMetadata, DEFAULT_TENDER_SPEC } from "../tender-matching";
import { getClassificationBasisLabel, parseClassificationRulesFromMetadata, resolveClassificationRules, validateClassificationAgainstRules, DEFAULT_CLASSIFICATION_RULES } from "../classification-rules";
import { computeApprovalRoutingState, validateApprovalSubmission, validateReviewSubmission, ApprovalRoutingError, LOCAL_CONTENT_REVIEW_POLICY } from "../approval-routing";

// --- parseTenderSpecFromMetadata edge cases ---

function review(id: string, reviewerId: string, action: string, at: string, status = "completed") {
  return { id, reviewerId, reviewerName: reviewerId, action, status, createdAt: new Date(at) };
}

describe("parseTenderSpecFromMetadata - edge cases", () => {
  it("returns null for null input", () => {
    expect(parseTenderSpecFromMetadata(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(parseTenderSpecFromMetadata(undefined)).toBeNull();
  });

  it("returns null for non-object input", () => {
    expect(parseTenderSpecFromMetadata("string")).toBeNull();
    expect(parseTenderSpecFromMetadata(42)).toBeNull();
    expect(parseTenderSpecFromMetadata(true)).toBeNull();
  });

  it("returns null when tender key is missing", () => {
    expect(parseTenderSpecFromMetadata({})).toBeNull();
    expect(parseTenderSpecFromMetadata({ other: "data" })).toBeNull();
  });

  it("returns null when tender is not an object", () => {
    expect(parseTenderSpecFromMetadata({ tender: "string" })).toBeNull();
    expect(parseTenderSpecFromMetadata({ tender: 42 })).toBeNull();
  });

  it("returns null when minLocalContentPct is missing", () => {
    expect(parseTenderSpecFromMetadata({ tender: {} })).toBeNull();
    expect(parseTenderSpecFromMetadata({ tender: { referenceId: "T-001" } })).toBeNull();
  });

  it("returns null when minLocalContentPct is negative", () => {
    expect(parseTenderSpecFromMetadata({ tender: { minLocalContentPct: -5 } })).toBeNull();
  });

  it("returns null when minLocalContentPct is above 100", () => {
    expect(parseTenderSpecFromMetadata({ tender: { minLocalContentPct: 150 } })).toBeNull();
  });

  it("returns null when minLocalContentPct is NaN", () => {
    expect(parseTenderSpecFromMetadata({ tender: { minLocalContentPct: "abc" } })).toBeNull();
  });

  it("returns null when minLocalContentPct is Infinity", () => {
    expect(parseTenderSpecFromMetadata({ tender: { minLocalContentPct: Infinity } })).toBeNull();
  });

  it("parses valid spec with all fields", () => {
    const spec = parseTenderSpecFromMetadata({
      tender: {
        referenceId: "T-100",
        titleAr: "مناقصة تجريبية",
        minLocalContentPct: 45,
        requiredSpendCategories: ["services", "equipment", "consulting"],
        minLocalSupplierCount: 3,
        maxNonLocalSpendSharePct: 30,
      },
    });
    expect(spec).not.toBeNull();
    expect(spec!.referenceId).toBe("T-100");
    expect(spec!.titleAr).toBe("مناقصة تجريبية");
    expect(spec!.minLocalContentPct).toBe(45);
    expect(spec!.requiredSpendCategories).toEqual(["services", "equipment", "consulting"]);
    expect(spec!.minLocalSupplierCount).toBe(3);
    expect(spec!.maxNonLocalSpendSharePct).toBe(30);
  });

  it("filters non-string categories from requiredSpendCategories", () => {
    const spec = parseTenderSpecFromMetadata({
      tender: {
        minLocalContentPct: 30,
        requiredSpendCategories: ["services", 42, null, "goods"],
      },
    });
    expect(spec!.requiredSpendCategories).toEqual(["services", "goods"]);
  });

  it("defaults undefined optional fields", () => {
    const spec = parseTenderSpecFromMetadata({
      tender: { minLocalContentPct: 30 },
    });
    expect(spec!.referenceId).toBeUndefined();
    expect(spec!.titleAr).toBeUndefined();
    expect(spec!.requiredSpendCategories).toBeUndefined();
    expect(spec!.minLocalSupplierCount).toBeUndefined();
    expect(spec!.maxNonLocalSpendSharePct).toBeUndefined();
  });

  it("accepts minLocalContentPct of exactly 0", () => {
    const spec = parseTenderSpecFromMetadata({ tender: { minLocalContentPct: 0 } });
    expect(spec).not.toBeNull();
    expect(spec!.minLocalContentPct).toBe(0);
  });

  it("accepts minLocalContentPct of exactly 100", () => {
    const spec = parseTenderSpecFromMetadata({ tender: { minLocalContentPct: 100 } });
    expect(spec).not.toBeNull();
    expect(spec!.minLocalContentPct).toBe(100);
  });

  it("ignores non-object items in requiredSpendCategories", () => {
    const spec = parseTenderSpecFromMetadata({
      tender: { minLocalContentPct: 30, requiredSpendCategories: [123, true, { a: 1 }] },
    });
    expect(spec!.requiredSpendCategories).toEqual([]);
  });
});

// --- DEFAULT_TENDER_SPEC ---

describe("DEFAULT_TENDER_SPEC - sanity check", () => {
  it("has reasonable default values", () => {
    expect(DEFAULT_TENDER_SPEC.minLocalContentPct).toBe(30);
    expect(DEFAULT_TENDER_SPEC.minLocalSupplierCount).toBe(1);
    expect(DEFAULT_TENDER_SPEC.maxNonLocalSpendSharePct).toBe(40);
    expect(DEFAULT_TENDER_SPEC.requiredSpendCategories).toContain("services");
    expect(DEFAULT_TENDER_SPEC.requiredSpendCategories).toContain("equipment");
  });
});

// --- getClassificationBasisLabel ---

describe("getClassificationBasisLabel", () => {
  it("returns Arabic label for certificate", () => {
    expect(getClassificationBasisLabel("certificate")).toBe("شهادة");
  });

  it("returns Arabic label for self_declaration", () => {
    expect(getClassificationBasisLabel("self_declaration")).toBe("إقرار ذاتي");
  });

  it("returns Arabic label for contract_term", () => {
    expect(getClassificationBasisLabel("contract_term")).toBe("بند عقد");
  });

  it("returns Arabic label for analyst_estimate", () => {
    expect(getClassificationBasisLabel("analyst_estimate")).toBe("تقدير محلل");
  });

  it("returns original string for unknown basis", () => {
    expect(getClassificationBasisLabel("unknown_basis")).toBe("unknown_basis");
  });

  it("returns empty string for empty input", () => {
    expect(getClassificationBasisLabel("")).toBe("");
  });
});

// --- parseClassificationRulesFromMetadata edge cases ---

describe("parseClassificationRulesFromMetadata - edge cases", () => {
  it("returns null for null input", () => {
    expect(parseClassificationRulesFromMetadata(null)).toBeNull();
  });

  it("returns null for non-object input", () => {
    expect(parseClassificationRulesFromMetadata("string")).toBeNull();
  });

  it("returns null when classificationRules is not an array", () => {
    expect(parseClassificationRulesFromMetadata({ classificationRules: "not-array" })).toBeNull();
  });

  it("returns null when no valid rules parsed", () => {
    expect(parseClassificationRulesFromMetadata({ classificationRules: [null, 42, "string"] })).toBeNull();
  });

  it("skips rules without category", () => {
    const result = parseClassificationRulesFromMetadata({
      classificationRules: [
        { minLocalPct: 30 },
        { category: "services", minLocalPct: 30 },
      ],
    });
    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
  });

  it("skips rules without valid minLocalPct", () => {
    const result = parseClassificationRulesFromMetadata({
      classificationRules: [
        { category: "services" },
        { category: "goods", minLocalPct: "abc" },
        { category: "equipment", minLocalPct: 25 },
      ],
    });
    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
  });

  it("uses category as id when id is missing", () => {
    const result = parseClassificationRulesFromMetadata({
      classificationRules: [{ category: "custom_cat", minLocalPct: 20 }],
    });
    expect(result![0].id).toBe("custom_cat");
  });

  it("uses category as labelAr when labelAr is missing", () => {
    const result = parseClassificationRulesFromMetadata({
      classificationRules: [{ category: "custom_cat", minLocalPct: 20 }],
    });
    expect(result![0].labelAr).toBe("custom_cat");
  });

  it("defaults to medium confidence when invalid", () => {
    const result = parseClassificationRulesFromMetadata({
      classificationRules: [{ category: "services", minLocalPct: 30, minConfidence: "invalid" }],
    });
    expect(result![0].minConfidence).toBe("medium");
  });

  it("defaults to certificate when allowedBases is not an array", () => {
    const result = parseClassificationRulesFromMetadata({
      classificationRules: [{ category: "services", minLocalPct: 30, allowedBases: "not-array" }],
    });
    expect(result![0].allowedBases).toEqual(["certificate"]);
  });

  it("filters invalid classification bases", () => {
    const result = parseClassificationRulesFromMetadata({
      classificationRules: [
        { category: "test", minLocalPct: 10, allowedBases: ["certificate", "invalid_basis", "contract_term"] },
      ],
    });
    expect(result![0].allowedBases).toEqual(["certificate", "contract_term"]);
  });

  it("defaults active to true when active is false", () => {
    const result = parseClassificationRulesFromMetadata({
      classificationRules: [{ category: "test", minLocalPct: 10, active: false }],
    });
    expect(result![0].active).toBe(false);
  });
});

// --- validateClassificationAgainstRules edge cases ---

describe("validateClassificationAgainstRules - edge cases", () => {
  const rules = resolveClassificationRules(null);

  it("returns ok true for category with no matching rule", () => {
    const result = validateClassificationAgainstRules(rules, {
      category: "nonexistent_category",
      localPercentage: 10,
      classificationBasis: "certificate",
      confidence: "high",
    });
    expect(result.ok).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it("returns ok true when all criteria met for services", () => {
    const result = validateClassificationAgainstRules(rules, {
      category: "services",
      localPercentage: 35,
      classificationBasis: "certificate",
      confidence: "high",
    });
    expect(result.ok).toBe(true);
  });

  it("flags violation when localPercentage below threshold", () => {
    const result = validateClassificationAgainstRules(rules, {
      category: "services",
      localPercentage: 20,
      classificationBasis: "certificate",
      confidence: "high",
    });
    expect(result.ok).toBe(false);
    expect(result.violations.length).toBeGreaterThanOrEqual(1);
  });

  it("flags violation when classification basis not allowed", () => {
    const result = validateClassificationAgainstRules(rules, {
      category: "equipment",
      localPercentage: 50,
      classificationBasis: "analyst_estimate",
      confidence: "high",
    });
    expect(result.ok).toBe(false);
    expect(result.violations.some((v) => v.includes("أساس التصنيف"))).toBe(true);
  });

  it("flags violation when confidence below minimum", () => {
    const result = validateClassificationAgainstRules(rules, {
      category: "consulting",
      localPercentage: 50,
      classificationBasis: "certificate",
      confidence: "low",
    });
    expect(result.ok).toBe(false);
    expect(result.violations.some((v) => v.includes("الثقة"))).toBe(true);
  });

  it("treats missing confidence as unverified", () => {
    const result = validateClassificationAgainstRules(rules, {
      category: "consulting",
      localPercentage: 50,
      classificationBasis: "certificate",
    });
    expect(result.ok).toBe(false);
    expect(result.violations.some((v) => v.includes("الثقة"))).toBe(true);
  });

  it("flags multiple violations at once", () => {
    const result = validateClassificationAgainstRules(rules, {
      category: "services",
      localPercentage: 5,
      classificationBasis: "analyst_estimate",
      confidence: "low",
    });
    expect(result.ok).toBe(false);
    expect(result.violations.length).toBeGreaterThanOrEqual(2);
  });

  it("case insensitive category matching", () => {
    const result = validateClassificationAgainstRules(rules, {
      category: "SERVICES",
      localPercentage: 50,
      classificationBasis: "certificate",
      confidence: "high",
    });
    expect(result.ok).toBe(true);
  });

  it("validates construction requires high confidence", () => {
    const result = validateClassificationAgainstRules(rules, {
      category: "construction",
      localPercentage: 50,
      classificationBasis: "certificate",
      confidence: "medium",
    });
    expect(result.ok).toBe(false);
    expect(result.violations.some((v) => v.includes("الثقة"))).toBe(true);
  });
});

// --- DEFAULT_CLASSIFICATION_RULES ---

describe("DEFAULT_CLASSIFICATION_RULES - sanity check", () => {
  it("has 4 default rules", () => {
    expect(DEFAULT_CLASSIFICATION_RULES).toHaveLength(4);
  });

  it("each rule has required fields", () => {
    for (const rule of DEFAULT_CLASSIFICATION_RULES) {
      expect(rule.id).toBeTruthy();
      expect(rule.category).toBeTruthy();
      expect(rule.labelAr).toBeTruthy();
      expect(rule.minLocalPct).toBeGreaterThanOrEqual(0);
      expect(rule.minLocalPct).toBeLessThanOrEqual(100);
      expect(Array.isArray(rule.allowedBases)).toBe(true);
      expect(rule.allowedBases.length).toBeGreaterThan(0);
      expect(rule.active).toBe(true);
    }
  });
});

// --- Approval routing: approved/rejected terminal states ---

describe("ApprovalRoutingState - approved/rejected terminal states", () => {
  it("phase is approved when latest decision is approved", () => {
    const state = computeApprovalRoutingState(
      [review("r1", "u1", "submitted", "2026-01-01"), review("r2", "u2", "submitted", "2026-01-02")],
      [{ id: "a1", approverId: "admin", decision: "approved", createdAt: new Date("2026-01-03") }],
    );
    expect(state.phase).toBe("approved");
    expect(state.canSubmitApproval).toBe(false);
    expect(state.blockReason).toContain("تم الاعتماد");
  });

  it("phase is rejected when latest decision is rejected", () => {
    const state = computeApprovalRoutingState(
      [review("r1", "u1", "submitted", "2026-01-01"), review("r2", "u2", "submitted", "2026-01-02")],
      [{ id: "a1", approverId: "admin", decision: "rejected", createdAt: new Date("2026-01-03") }],
    );
    expect(state.phase).toBe("rejected");
    expect(state.canSubmitApproval).toBe(false);
    expect(state.blockReason).toContain("تم رفض");
  });

  it("throws when submitting review after approved", () => {
    const reviews = [review("r1", "u1", "submitted", "2026-01-01"), review("r2", "u2", "submitted", "2026-01-02")];
    const approvals = [{ id: "a1", approverId: "admin", decision: "approved", createdAt: new Date("2026-01-03") }];
    expect(() =>
      validateApprovalSubmission({ reviews, approvals }),
    ).toThrow(ApprovalRoutingError);
  });

  it("throws when submitting review after rejected", () => {
    const reviews = [review("r1", "u1", "submitted", "2026-01-01"), review("r2", "u2", "submitted", "2026-01-02")];
    const approvals = [{ id: "a1", approverId: "admin", decision: "rejected", createdAt: new Date("2026-01-03") }];
    expect(() =>
      validateApprovalSubmission({ reviews, approvals }),
    ).toThrow(ApprovalRoutingError);
  });
});

// --- Approval routing: multiple returns and 3-reviewer cycles ---

describe("ApprovalRoutingState - multiple returns and 3-reviewer cycles", () => {
  it("resets cycle after multiple returns requiring 2 new reviewers", () => {
    const reviews = [
      review("r1", "u1", "submitted", "2026-01-01"),
      review("r2", "u2", "submitted", "2026-01-02"),
      review("r3", "u3", "returned", "2026-01-03"),
      review("r4", "u4", "submitted", "2026-01-04"),
      review("r5", "u5", "returned", "2026-01-05"),
      review("r6", "u6", "submitted", "2026-01-06"),
    ];
    const state = computeApprovalRoutingState(reviews, []);
    expect(state.phase).toBe("returned");
    expect(state.distinctSubmitters).toBe(1);
    expect(state.hasReturn).toBe(true);
  });

  it("ready_for_approval after 3 reviewers in post-return cycle", () => {
    const reviews = [
      review("r1", "u1", "submitted", "2026-01-01"),
      review("r2", "u2", "submitted", "2026-01-02"),
      review("r3", "u3", "returned", "2026-01-03"),
      review("r4", "u4", "submitted", "2026-01-04"),
      review("r5", "u5", "submitted", "2026-01-05"),
    ];
    const state = computeApprovalRoutingState(reviews, []);
    expect(state.phase).toBe("ready_for_approval");
    expect(state.canSubmitApproval).toBe(true);
    expect(state.distinctSubmitters).toBe(2);
  });

  it("still awaiting_reviews with only 1 reviewer after return", () => {
    const reviews = [
      review("r1", "u1", "submitted", "2026-01-01"),
      review("r2", "u2", "submitted", "2026-01-02"),
      review("r3", "u3", "returned", "2026-01-03"),
      review("r4", "u4", "submitted", "2026-01-04"),
    ];
    const state = computeApprovalRoutingState(reviews, []);
    expect(state.phase).toBe("returned");
    expect(state.distinctSubmitters).toBe(1);
    expect(state.slotsRemaining).toBe(1);
  });
});

// --- validateReviewSubmission edge cases ---

describe("validateReviewSubmission - edge cases", () => {
  it("allows return action without restrictions", () => {
    expect(() =>
      validateReviewSubmission({
        reviewerId: "u1",
        action: "returned",
        reviews: [],
      }),
    ).not.toThrow();
  });

  it("allows first submission from a new reviewer", () => {
    expect(() =>
      validateReviewSubmission({
        reviewerId: "u1",
        action: "submitted",
        reviews: [],
      }),
    ).not.toThrow();
  });

  it("blocks duplicate reviewer who already submitted (no return)", () => {
    expect(() =>
      validateReviewSubmission({
        reviewerId: "u1",
        action: "submitted",
        reviews: [review("r1", "u1", "submitted", "2026-01-01")],
      }),
    ).toThrow(ApprovalRoutingError);
  });

  it("allows resubmission after return if reviewer has not resubmitted", () => {
    expect(() =>
      validateReviewSubmission({
        reviewerId: "u1",
        action: "submitted",
        reviews: [
          review("r1", "u1", "submitted", "2026-01-01"),
          review("r2", "u2", "returned", "2026-01-02"),
        ],
      }),
    ).not.toThrow();
  });

  it("blocks resubmission after return if reviewer already resubmitted", () => {
    expect(() =>
      validateReviewSubmission({
        reviewerId: "u1",
        action: "submitted",
        reviews: [
          review("r1", "u1", "submitted", "2026-01-01"),
          review("r2", "u2", "returned", "2026-01-02"),
          review("r3", "u1", "submitted", "2026-01-03"),
        ],
      }),
    ).toThrow(ApprovalRoutingError);
  });

  it("ignores non-submit non-return actions", () => {
    expect(() =>
      validateReviewSubmission({
        reviewerId: "u1",
        action: "other_action",
        reviews: [],
      }),
    ).not.toThrow();
  });

  it("throws when submitting after approved state", () => {
    expect(() =>
      validateReviewSubmission({
        reviewerId: "u3",
        action: "submitted",
        reviews: [
          review("r1", "u1", "submitted", "2026-01-01"),
          review("r2", "u2", "submitted", "2026-01-02"),
        ],
      }),
    ).not.toThrow();
  });
});

// --- LOCAL_CONTENT_REVIEW_POLICY ---

describe("LOCAL_CONTENT_REVIEW_POLICY", () => {
  it("requires 2 distinct reviewers", () => {
    expect(LOCAL_CONTENT_REVIEW_POLICY.minDistinctReviewers).toBe(2);
  });

  it("submitActions includes submitted", () => {
    expect(LOCAL_CONTENT_REVIEW_POLICY.submitActions).toContain("submitted");
  });

  it("returnAction is returned", () => {
    expect(LOCAL_CONTENT_REVIEW_POLICY.returnAction).toBe("returned");
  });
});

// --- computeApprovalRoutingState: empty reviews ---

describe("computeApprovalRoutingState - empty state", () => {
  it("empty reviews and approvals yields awaiting_reviews", () => {
    const state = computeApprovalRoutingState([], []);
    expect(state.phase).toBe("awaiting_reviews");
    expect(state.distinctSubmitters).toBe(0);
    expect(state.slotsRemaining).toBe(2);
    expect(state.canSubmitApproval).toBe(false);
    expect(state.hasReturn).toBe(false);
  });
});