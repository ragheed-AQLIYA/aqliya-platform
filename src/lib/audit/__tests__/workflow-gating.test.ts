import {
  evaluateTabGate,
  evaluateAllTabGates,
  isTabAccessible,
} from "../workflow-gating";
import type { WorkflowContext } from "../workflow-gating";

/** Base context with every gate flag set to false. */
const baseCtx: WorkflowContext = {
  engagementStatus: "draft",
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
};

/** All tab keys defined in the tabGates record. */
const ALL_TABS = [
  "overview",
  "trial-balance",
  "sampling",
  "mapping",
  "lead-schedules",
  "validation",
  "statements",
  "factory-map",
  "notes",
  "evidence",
  "findings",
  "recommendations",
  "review",
  "approval",
  "publication",
  "exports",
  "audit-trail",
  "pilot",
];

describe("workflow-gating", () => {
  // ─── Always-unlocked tabs ───

  describe("always-unlocked tabs", () => {
    it("overview tab is never locked", () => {
      expect(evaluateTabGate("overview", baseCtx)).toEqual({ locked: false });
    });

    it("trial-balance tab is never locked", () => {
      expect(evaluateTabGate("trial-balance", baseCtx)).toEqual({
        locked: false,
      });
    });

    it("evidence tab is never locked", () => {
      expect(evaluateTabGate("evidence", baseCtx)).toEqual({ locked: false });
    });

    it("audit-trail tab is never locked", () => {
      expect(evaluateTabGate("audit-trail", baseCtx)).toEqual({
        locked: false,
      });
    });
  });

  // ─── Trial-balance-gated tabs ───

  describe("trial-balance prerequisites", () => {
    it("sampling tab is locked when hasTrialBalance is false", () => {
      const result = evaluateTabGate("sampling", baseCtx);
      expect(result.locked).toBe(true);
      expect(result.reason).toBeDefined();
    });

    it("mapping tab is locked when hasTrialBalance is false", () => {
      const result = evaluateTabGate("mapping", baseCtx);
      expect(result.locked).toBe(true);
      expect(result.reason).toBeDefined();
    });

    it("lead-schedules tab is locked when hasTrialBalance is false", () => {
      const result = evaluateTabGate("lead-schedules", baseCtx);
      expect(result.locked).toBe(true);
      expect(result.reason).toBeDefined();
    });

    it("lead-schedules tab is locked when hasConfirmedMappings is false but hasTrialBalance is true", () => {
      const ctx = { ...baseCtx, hasTrialBalance: true };
      const result = evaluateTabGate("lead-schedules", ctx);
      expect(result.locked).toBe(true);
      expect(result.reason).toBeDefined();
    });

    it("validation tab is locked when hasTrialBalance is false", () => {
      const result = evaluateTabGate("validation", baseCtx);
      expect(result.locked).toBe(true);
      expect(result.reason).toBeDefined();
    });

    it("statements tab is locked when hasTrialBalance is false", () => {
      const result = evaluateTabGate("statements", baseCtx);
      expect(result.locked).toBe(true);
      expect(result.reason).toBeDefined();
    });

    it("statements tab is locked when hasMappings is false but hasTrialBalance is true", () => {
      const ctx = { ...baseCtx, hasTrialBalance: true };
      const result = evaluateTabGate("statements", ctx);
      expect(result.locked).toBe(true);
      expect(result.reason).toBeDefined();
    });

    it("sampling tab is unlocked when hasTrialBalance is true", () => {
      const ctx = { ...baseCtx, hasTrialBalance: true };
      expect(evaluateTabGate("sampling", ctx)).toEqual({ locked: false });
    });

    it("mapping tab is unlocked when hasTrialBalance is true", () => {
      const ctx = { ...baseCtx, hasTrialBalance: true };
      expect(evaluateTabGate("mapping", ctx)).toEqual({ locked: false });
    });

    it("lead-schedules tab is unlocked when hasTrialBalance and hasConfirmedMappings are true", () => {
      const ctx = { ...baseCtx, hasTrialBalance: true, hasConfirmedMappings: true };
      expect(evaluateTabGate("lead-schedules", ctx)).toEqual({ locked: false });
    });

    it("validation tab is unlocked when hasTrialBalance is true", () => {
      const ctx = { ...baseCtx, hasTrialBalance: true };
      expect(evaluateTabGate("validation", ctx)).toEqual({ locked: false });
    });

    it("statements tab is unlocked when hasTrialBalance and hasMappings are true", () => {
      const ctx = { ...baseCtx, hasTrialBalance: true, hasMappings: true };
      expect(evaluateTabGate("statements", ctx)).toEqual({ locked: false });
    });
  });

  // ─── Financial-statements-gated tabs ───

  describe("financial-statements prerequisites", () => {
    it("notes tab is locked when hasFinancialStatements is false", () => {
      const result = evaluateTabGate("notes", baseCtx);
      expect(result.locked).toBe(true);
      expect(result.reason).toBeDefined();
    });

    it("exports tab is locked when hasFinancialStatements is false", () => {
      const result = evaluateTabGate("exports", baseCtx);
      expect(result.locked).toBe(true);
      expect(result.reason).toBeDefined();
    });

    it("notes tab is unlocked when hasFinancialStatements is true", () => {
      const ctx = { ...baseCtx, hasFinancialStatements: true };
      expect(evaluateTabGate("notes", ctx)).toEqual({ locked: false });
    });

    it("exports tab is unlocked when hasFinancialStatements is true", () => {
      const ctx = { ...baseCtx, hasFinancialStatements: true };
      expect(evaluateTabGate("exports", ctx)).toEqual({ locked: false });
    });
  });

  // ─── Evidence / findings / recommendations gates ───

  describe("evidence and findings gates", () => {
    it("findings tab is locked when hasEvidence is false", () => {
      const result = evaluateTabGate("findings", baseCtx);
      expect(result.locked).toBe(true);
      expect(result.reason).toBeDefined();
    });

    it("recommendations tab is locked when hasFindings is false", () => {
      const result = evaluateTabGate("recommendations", baseCtx);
      expect(result.locked).toBe(true);
      expect(result.reason).toBeDefined();
    });

    it("findings tab is unlocked when hasEvidence is true", () => {
      const ctx = { ...baseCtx, hasEvidence: true };
      expect(evaluateTabGate("findings", ctx)).toEqual({ locked: false });
    });

    it("recommendations tab is unlocked when hasFindings is true", () => {
      const ctx = { ...baseCtx, hasEvidence: true, hasFindings: true };
      expect(evaluateTabGate("recommendations", ctx)).toEqual({
        locked: false,
      });
    });
  });

  // ─── Review gate ───

  describe("review gate", () => {
    it("review tab is locked when no findings, recommendations, or review activity", () => {
      const result = evaluateTabGate("review", baseCtx);
      expect(result.locked).toBe(true);
      expect(result.reason).toBeDefined();
    });

    it("review tab is unlocked when hasFindings is true", () => {
      const ctx = { ...baseCtx, hasEvidence: true, hasFindings: true };
      expect(evaluateTabGate("review", ctx)).toEqual({ locked: false });
    });

    it("review tab is unlocked when hasReviewActivity is true", () => {
      const ctx = { ...baseCtx, hasReviewActivity: true };
      expect(evaluateTabGate("review", ctx)).toEqual({ locked: false });
    });
  });

  // ─── Approval gate ───

  describe("approval gate", () => {
    it("approval tab is locked when no review activity", () => {
      const result = evaluateTabGate("approval", baseCtx);
      expect(result.locked).toBe(true);
      expect(result.reason).toBeDefined();
    });

    it("approval tab is locked when isPublished is true", () => {
      const ctx = {
        ...baseCtx,
        hasReviewActivity: true,
        isPublished: true,
      };
      const result = evaluateTabGate("approval", ctx);
      expect(result.locked).toBe(true);
      expect(result.reason).toBeDefined();
    });

    it("approval tab is locked when isApproved is true", () => {
      const ctx = {
        ...baseCtx,
        hasReviewActivity: true,
        isApproved: true,
      };
      const result = evaluateTabGate("approval", ctx);
      expect(result.locked).toBe(true);
      expect(result.reason).toBeDefined();
    });

    it("approval tab is unlocked when review activity exists and not published or approved", () => {
      const ctx = { ...baseCtx, hasReviewActivity: true };
      expect(evaluateTabGate("approval", ctx)).toEqual({ locked: false });
    });
  });

  // ─── Publication gate ───

  describe("publication gate", () => {
    it("publication tab is locked when not approved and governanceFinalizationAllowed is false", () => {
      const result = evaluateTabGate("publication", baseCtx);
      expect(result.locked).toBe(true);
      expect(result.reason).toBeDefined();
    });

    it("publication tab is locked when isPublished is true", () => {
      const ctx = { ...baseCtx, isApproved: true, isPublished: true };
      const result = evaluateTabGate("publication", ctx);
      expect(result.locked).toBe(true);
    });

    it("publication tab is unlocked when approved", () => {
      const ctx = { ...baseCtx, isApproved: true };
      expect(evaluateTabGate("publication", ctx)).toEqual({ locked: false });
    });

    it("publication tab is unlocked when governanceFinalizationAllowed is true", () => {
      const ctx = { ...baseCtx, governanceFinalizationAllowed: true };
      expect(evaluateTabGate("publication", ctx)).toEqual({ locked: false });
    });
  });

  // ─── Aggregated evaluation ───

  describe("evaluateAllTabGates", () => {
    it("returns results for all tabs", () => {
      const results = evaluateAllTabGates(baseCtx);

      expect(Object.keys(results).sort()).toEqual([...ALL_TABS].sort());
    });

    it("each result has a locked boolean", () => {
      const results = evaluateAllTabGates(baseCtx);

      for (const tabKey of ALL_TABS) {
        expect(results[tabKey]).toBeDefined();
        expect(typeof results[tabKey].locked).toBe("boolean");
      }
    });
  });

  // ─── isTabAccessible ───

  describe("isTabAccessible", () => {
    it("returns true for an unlocked tab", () => {
      expect(isTabAccessible("overview", baseCtx)).toBe(true);
    });

    it("returns false for a locked tab", () => {
      expect(isTabAccessible("sampling", baseCtx)).toBe(false);
    });

    it("returns a boolean", () => {
      const result = isTabAccessible("overview", baseCtx);
      expect(typeof result).toBe("boolean");
    });
  });
});
