/** @jest-environment node */

import { assertWorkflowOsTransition } from "@/lib/core/workflow/workflowos-adapter";

describe("WorkflowOS adapter", () => {
  it("returns UnderReview on submit", () => {
    expect(assertWorkflowOsTransition("Draft", "submit")).toBe("UnderReview");
  });

  it("throws on invalid approve from Draft", () => {
    expect(() => assertWorkflowOsTransition("Draft", "approve")).toThrow();
  });
});
