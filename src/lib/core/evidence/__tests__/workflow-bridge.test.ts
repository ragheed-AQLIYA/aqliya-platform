/** @jest-environment node */

import {
  mapWorkflowActionToEvidenceLifecycle,
  inferWorkflowActionFromAuditState,
  inferWorkflowActionFromLocalContentStatus,
} from "@/lib/core/evidence/workflow-bridge";

describe("Evidence workflow bridge", () => {
  it("maps workflow actions to lifecycle states", () => {
    expect(mapWorkflowActionToEvidenceLifecycle("submit")).toBe("reviewed");
    expect(mapWorkflowActionToEvidenceLifecycle("approve")).toBe("approved");
    expect(mapWorkflowActionToEvidenceLifecycle("reject")).toBe("rejected");
    expect(mapWorkflowActionToEvidenceLifecycle("archive")).toBe("archived");
    expect(mapWorkflowActionToEvidenceLifecycle("return")).toBe("created");
  });

  it("infers audit workflow actions from evidence state", () => {
    expect(inferWorkflowActionFromAuditState("reviewed")).toBe("submit");
    expect(inferWorkflowActionFromAuditState("accepted")).toBe("approve");
    expect(inferWorkflowActionFromAuditState("rejected")).toBe("reject");
    expect(inferWorkflowActionFromAuditState("uploaded")).toBeNull();
  });

  it("infers local content workflow actions from evidence status", () => {
    expect(inferWorkflowActionFromLocalContentStatus("reviewed")).toBe(
      "submit",
    );
    expect(inferWorkflowActionFromLocalContentStatus("verified")).toBe(
      "approve",
    );
    expect(inferWorkflowActionFromLocalContentStatus("rejected")).toBe(
      "reject",
    );
    expect(inferWorkflowActionFromLocalContentStatus("uploaded")).toBeNull();
  });
});
