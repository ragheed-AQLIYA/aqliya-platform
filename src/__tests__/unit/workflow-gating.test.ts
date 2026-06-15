import {
  evaluateTabGate,
  evaluateAllTabGates,
  isTabAccessible,
} from "@/lib/audit/workflow-gating";
import type { WorkflowContext } from "@/lib/audit/workflow-gating";

function emptyContext(overrides?: Partial<WorkflowContext>): WorkflowContext {
  return {
    engagementStatus: "setup",
    hasTrialBalance: false,
    hasMappings: false,
    hasConfirmedMappings: false,
    hasFinancialStatements: false,
    hasNotes: false,
    hasEvidence: false,
    hasFindings: false,
    hasRecommendations: false,
    hasReviewActivity: false,
    isApproved: false,
    isPublished: false,
    governanceFinalizationAllowed: false,
    ...overrides,
  };
}

function fullContext(overrides?: Partial<WorkflowContext>): WorkflowContext {
  return {
    engagementStatus: "ready_for_approval",
    hasTrialBalance: true,
    hasMappings: true,
    hasConfirmedMappings: true,
    hasFinancialStatements: true,
    hasNotes: true,
    hasEvidence: true,
    hasFindings: true,
    hasRecommendations: true,
    hasReviewActivity: true,
    isApproved: false,
    isPublished: false,
    governanceFinalizationAllowed: false,
    ...overrides,
  };
}

describe("evaluateTabGate", () => {
  describe("overview", () => {
    it("is always unlocked", () => {
      expect(evaluateTabGate("overview", emptyContext()).locked).toBe(false);
    });
  });

  describe("trial-balance", () => {
    it("is always unlocked", () => {
      expect(evaluateTabGate("trial-balance", emptyContext()).locked).toBe(
        false,
      );
    });
  });

  describe("sampling", () => {
    it("is locked without trial balance", () => {
      const result = evaluateTabGate("sampling", emptyContext());
      expect(result.locked).toBe(true);
      expect(result.reason).toContain("ميزان المراجعة");
    });

    it("is unlocked with trial balance", () => {
      const result = evaluateTabGate(
        "sampling",
        emptyContext({ hasTrialBalance: true }),
      );
      expect(result.locked).toBe(false);
    });
  });

  describe("mapping", () => {
    it("is locked without trial balance", () => {
      const result = evaluateTabGate("mapping", emptyContext());
      expect(result.locked).toBe(true);
      expect(result.reason).toContain("ميزان المراجعة");
    });

    it("is unlocked with trial balance", () => {
      const result = evaluateTabGate(
        "mapping",
        emptyContext({ hasTrialBalance: true }),
      );
      expect(result.locked).toBe(false);
    });
  });

  describe("statements", () => {
    it("is locked without both TB and mappings", () => {
      const result = evaluateTabGate("statements", emptyContext());
      expect(result.locked).toBe(true);
    });

    it("is locked with TB but no mappings", () => {
      const result = evaluateTabGate(
        "statements",
        emptyContext({ hasTrialBalance: true }),
      );
      expect(result.locked).toBe(true);
    });

    it("is unlocked with TB and mappings", () => {
      const result = evaluateTabGate(
        "statements",
        emptyContext({ hasTrialBalance: true, hasMappings: true }),
      );
      expect(result.locked).toBe(false);
    });
  });

  describe("lead-schedules", () => {
    it("is locked without confirmed mappings", () => {
      expect(
        evaluateTabGate(
          "lead-schedules",
          emptyContext({ hasTrialBalance: true, hasMappings: true }),
        ).locked,
      ).toBe(true);
    });

    it("is unlocked with confirmed mappings", () => {
      expect(
        evaluateTabGate(
          "lead-schedules",
          emptyContext({
            hasTrialBalance: true,
            hasMappings: true,
            hasConfirmedMappings: true,
          }),
        ).locked,
      ).toBe(false);
    });
  });

  describe("factory-map", () => {
    it("is locked without financial statements", () => {
      expect(
        evaluateTabGate(
          "factory-map",
          emptyContext({ hasTrialBalance: true, hasMappings: true }),
        ).locked,
      ).toBe(true);
    });

    it("is unlocked with TB, mappings, and FS", () => {
      expect(
        evaluateTabGate(
          "factory-map",
          emptyContext({
            hasTrialBalance: true,
            hasMappings: true,
            hasFinancialStatements: true,
          }),
        ).locked,
      ).toBe(false);
    });
  });

  describe("notes", () => {
    it("is locked without financial statements", () => {
      expect(evaluateTabGate("notes", emptyContext()).locked).toBe(true);
    });

    it("is unlocked with financial statements", () => {
      expect(evaluateTabGate("notes", fullContext()).locked).toBe(false);
    });
  });

  describe("evidence", () => {
    it("is always unlocked", () => {
      expect(evaluateTabGate("evidence", emptyContext()).locked).toBe(false);
    });
  });

  describe("findings", () => {
    it("is locked without evidence", () => {
      expect(evaluateTabGate("findings", emptyContext()).locked).toBe(true);
    });

    it("is unlocked with evidence", () => {
      expect(
        evaluateTabGate("findings", emptyContext({ hasEvidence: true })).locked,
      ).toBe(false);
    });
  });

  describe("recommendations", () => {
    it("is locked without findings", () => {
      expect(evaluateTabGate("recommendations", emptyContext()).locked).toBe(
        true,
      );
    });

    it("is unlocked with findings", () => {
      expect(
        evaluateTabGate("recommendations", emptyContext({ hasFindings: true }))
          .locked,
      ).toBe(false);
    });
  });

  describe("review", () => {
    it("is locked without any review-related data", () => {
      expect(evaluateTabGate("review", emptyContext()).locked).toBe(true);
    });

    it("is unlocked when findings exist", () => {
      expect(
        evaluateTabGate("review", emptyContext({ hasFindings: true })).locked,
      ).toBe(false);
    });

    it("is unlocked when recommendations exist", () => {
      expect(
        evaluateTabGate("review", emptyContext({ hasRecommendations: true }))
          .locked,
      ).toBe(false);
    });
  });

  describe("publication", () => {
    it("is locked in early engagement state", () => {
      const result = evaluateTabGate("publication", emptyContext());
      expect(result.locked).toBe(true);
    });

    it("is locked when not approved", () => {
      const result = evaluateTabGate(
        "publication",
        fullContext({
          isApproved: false,
          governanceFinalizationAllowed: false,
        }),
      );
      expect(result.locked).toBe(true);
      expect(result.reason).toContain("الاعتماد");
    });

    it("is unlocked when approved and governance allows", () => {
      const result = evaluateTabGate(
        "publication",
        fullContext({ isApproved: true, governanceFinalizationAllowed: true }),
      );
      expect(result.locked).toBe(false);
    });

    it("is locked when already published", () => {
      const result = evaluateTabGate(
        "publication",
        fullContext({ isPublished: true }),
      );
      expect(result.locked).toBe(true);
      expect(result.reason).toContain("نشر");
    });
  });

  describe("approval", () => {
    it("is locked without review activity", () => {
      expect(evaluateTabGate("approval", emptyContext()).locked).toBe(true);
    });

    it("is locked when already approved", () => {
      const result = evaluateTabGate(
        "approval",
        fullContext({ isApproved: true }),
      );
      expect(result.locked).toBe(true);
      expect(result.reason).toContain("اعتماد");
    });

    it("is unlocked with review activity", () => {
      const result = evaluateTabGate(
        "approval",
        emptyContext({ hasReviewActivity: true }),
      );
      expect(result.locked).toBe(false);
    });
  });

  describe("audit-trail", () => {
    it("is always unlocked", () => {
      expect(evaluateTabGate("audit-trail", emptyContext()).locked).toBe(false);
    });
  });

  describe("pilot", () => {
    it("is always unlocked", () => {
      expect(evaluateTabGate("pilot", emptyContext()).locked).toBe(false);
    });
  });
});

describe("evaluateAllTabGates", () => {
  it("returns results for all 16 tabs", () => {
    const results = evaluateAllTabGates(emptyContext());
    expect(Object.keys(results).length).toBe(18);
    expect(results).toHaveProperty("sampling");
  });

  it("locks intermediate tabs in empty context", () => {
    const results = evaluateAllTabGates(emptyContext());
    expect(results.overview.locked).toBe(false);
    expect(results.sampling.locked).toBe(true);
    expect(results.mapping.locked).toBe(true);
    expect(results.statements.locked).toBe(true);
    expect(results.exports.locked).toBe(true);
    expect(results.publication.locked).toBe(true);
  });

  it("unlocks most tabs in a well-progressed context", () => {
    const ctx = fullContext();
    const results = evaluateAllTabGates(ctx);
    expect(results.overview.locked).toBe(false);
    expect(results["trial-balance"].locked).toBe(false);
    expect(results.sampling.locked).toBe(false);
    expect(results.mapping.locked).toBe(false);
    expect(results.statements.locked).toBe(false);
    expect(results.notes.locked).toBe(false);
    expect(results.evidence.locked).toBe(false);
    expect(results.findings.locked).toBe(false);
    expect(results.recommendations.locked).toBe(false);
    expect(results.review.locked).toBe(false);
    expect(results.approval.locked).toBe(false);
    // Publication still locked until governance finalization is allowed
    expect(results.publication.locked).toBe(true);
  });

  it("unlocks publication when approved and governance cleared", () => {
    const ctx = fullContext({
      isApproved: true,
      governanceFinalizationAllowed: true,
    });
    const results = evaluateAllTabGates(ctx);
    expect(results.publication.locked).toBe(false);
    expect(results.approval.locked).toBe(true); // Already approved, no longer actionable
  });
});

describe("isTabAccessible", () => {
  it("returns true for unlocked tabs", () => {
    expect(isTabAccessible("overview", emptyContext())).toBe(true);
  });

  it("returns false for locked tabs", () => {
    expect(isTabAccessible("publication", emptyContext())).toBe(false);
  });
});
