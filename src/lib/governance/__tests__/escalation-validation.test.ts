import { describe, expect, it } from "@jest/globals";
import {
  evaluateEscalation,
  getEscalationLevel,
  getEscalationMessage,
  requiresHumanResolution,
} from "../escalation";
import type { EscalationTrigger } from "../runtime-types";

const EXPECTED_LEVELS: Record<EscalationTrigger, string> = {
  missing_evidence: "review_required",
  weak_evidence: "review_required",
  conflicting_evidence: "review_required",
  low_mapping_confidence: "notice",
  unsupported_accounting_treatment: "senior_review_required",
  governance_ambiguity: "review_required",
  commercial_overclaim_risk: "senior_review_required",
  approval_bypass_attempt: "blocked",
  reviewer_disagreement: "review_required",
  high_materiality: "senior_review_required",
  unusual_transaction: "notice",
  policy_conflict: "senior_review_required",
};

describe("governance escalation", () => {
  it.each(Object.entries(EXPECTED_LEVELS))(
    "maps %s to %s",
    (trigger: string, level: string) => {
      expect(getEscalationLevel([trigger as EscalationTrigger])).toBe(level);
    },
  );

  it("marks approval bypass attempts as blocked", () => {
    const result = evaluateEscalation({
      detectedTriggers: ["approval_bypass_attempt"],
    });

    expect(result.blocked).toBe(true);
    expect(requiresHumanResolution(result)).toBe(true);
    expect(getEscalationMessage(result)).toContain("BLOCKED");
  });

  it("auto-detects evidence and mapping triggers", () => {
    expect(
      evaluateEscalation({ evidenceStatus: "missing" }).triggers[0]?.trigger,
    ).toBe("missing_evidence");
    expect(
      evaluateEscalation({ mappingConfidence: 50 }).triggers[0]?.trigger,
    ).toBe("low_mapping_confidence");
    expect(
      evaluateEscalation({ isUnusualTransaction: true }).triggers[0]?.trigger,
    ).toBe("unusual_transaction");
  });

  it("keeps clean scenarios at none", () => {
    expect(evaluateEscalation({}).level).toBe("none");
  });
});
