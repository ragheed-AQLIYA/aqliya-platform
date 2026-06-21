/** @jest-environment node */

import { assertDecisionOsTransition } from "@/lib/core/workflow/decision-os-adapter";
import {
  assertLocalContentGovernanceTransition,
  inferLocalContentGovernanceAction,
} from "@/lib/core/workflow/local-content-adapter";

describe("Product workflow adapters", () => {
  it("decision submit resolves target status", () => {
    expect(assertDecisionOsTransition("DRAFT", "submit")).toBe("IN_REVIEW");
  });

  it("local content blocks invalid transition", () => {
    expect(() =>
      assertLocalContentGovernanceTransition("Draft", "Approved"),
    ).toThrow();
  });

  it("local content infers governance action", () => {
    expect(inferLocalContentGovernanceAction("InReview", "Approved")).toBe(
      "approve",
    );
  });

  it("decision return from InReview to Draft does not infer action from same-status noop", () => {
    expect(
      inferLocalContentGovernanceAction("Draft", "InReview"),
    ).toBe("submit");
  });
});
