// @ts-nocheck
import { describe, expect, it } from "@jest/globals";
import {
  resolveSalesOperatingStage,
  buildSalesWorkflowLinks,
} from "../workflow-orchestrator";

describe("sales workflow orchestrator", () => {
  it("resolves meeting stage when no interactions", () => {
    const stage = resolveSalesOperatingStage(
      {
        id: "o1",
        accountId: "a1",
        name: "Deal",
        stage: "Qualification",
        reviewStatus: "Draft",
        ownerId: "u1",
        organizationId: "org",
        createdAt: "",
        updatedAt: "",
      },
      0,
    );
    expect(stage).toBe("meeting");
  });

  it("resolves output when approved", () => {
    const stage = resolveSalesOperatingStage(
      {
        id: "o1",
        accountId: "a1",
        name: "Deal",
        stage: "Approved",
        reviewStatus: "Approved",
        approvalStatus: "Approved",
        ownerId: "u1",
        organizationId: "org",
        createdAt: "",
        updatedAt: "",
      },
      2,
    );
    expect(stage).toBe("output");
  });

  it("builds next step href for opportunity", () => {
    const links = buildSalesWorkflowLinks({
      accountId: "a1",
      opportunityId: "o1",
      stage: "proposal",
    });
    expect(links.nextStep.href).toContain("o1");
    expect(links.nextStep.href).toContain("nextStep");
  });
});
