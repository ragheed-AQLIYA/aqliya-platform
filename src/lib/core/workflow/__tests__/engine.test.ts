/** @jest-environment node */

import { evaluateTransition, getProductTemplate } from "@/lib/core/workflow/state-machine";

describe("Core workflow state machine", () => {
  it("returns decisionos template", () => {
    const template = getProductTemplate("decisionos");
    expect(template?.productKey).toBe("decisionos");
    expect(template?.transitions.length).toBeGreaterThan(0);
  });

  it("allows DRAFT submit to IN_REVIEW", () => {
    const result = evaluateTransition({
      productKey: "decisionos",
      fromStatus: "DRAFT",
      action: "submit",
    });
    expect(result.allowed).toBe(true);
    expect(result.toStatus).toBe("IN_REVIEW");
  });

  it("blocks invalid workflowos transition", () => {
    const result = evaluateTransition({
      productKey: "workflowos",
      fromStatus: "Draft",
      action: "approve",
    });
    expect(result.allowed).toBe(false);
  });
});
