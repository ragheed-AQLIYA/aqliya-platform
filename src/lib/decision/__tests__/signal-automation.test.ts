import { describe, expect, it } from "@jest/globals";
import { buildMonitoringSignalsFromRisks } from "../signal-automation";

describe("signal-automation (D3-02)", () => {
  it("creates drafts for HIGH/MEDIUM risks on APPROVED decisions", () => {
    const drafts = buildMonitoringSignalsFromRisks({
      decisionId: "d1",
      organizationId: "org1",
      decisionStatus: "APPROVED",
      risks: [
        { id: "r1", description: "Vendor delay", level: "HIGH" },
        { id: "r2", description: "Minor gap", level: "LOW" },
      ],
      existingReferenceIds: new Set(),
    });
    expect(drafts).toHaveLength(1);
    expect(drafts[0].referenceId).toBe("r1");
    expect(drafts[0].severity).toBe("HIGH");
  });

  it("skips when reference already signaled", () => {
    const drafts = buildMonitoringSignalsFromRisks({
      decisionId: "d1",
      organizationId: "org1",
      decisionStatus: "APPROVED",
      risks: [{ id: "r1", description: "X", level: "HIGH" }],
      existingReferenceIds: new Set(["r1"]),
    });
    expect(drafts).toHaveLength(0);
  });

  it("does not run on DRAFT decisions", () => {
    expect(
      buildMonitoringSignalsFromRisks({
        decisionId: "d1",
        organizationId: "org1",
        decisionStatus: "DRAFT",
        risks: [{ id: "r1", description: "X", level: "HIGH" }],
        existingReferenceIds: new Set(),
      }),
    ).toHaveLength(0);
  });
});
