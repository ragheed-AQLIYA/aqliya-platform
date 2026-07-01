/** @jest-environment node */

import { describe, it, expect, jest, beforeEach } from "@jest/globals";

const mockGetGovernanceContext = jest.fn();
const mockListSupportedGovernanceTasks = jest.fn();
const mockRequiresHumanApproval = jest.fn();

jest.mock("@/lib/governance/retrieval-router", () => ({
  getGovernanceContext: (...args) => mockGetGovernanceContext(...args),
  listSupportedGovernanceTasks: (...args) => mockListSupportedGovernanceTasks(...args),
  requiresHumanApproval: (...args) => mockRequiresHumanApproval(...args),
}));

import { GovernanceEngine } from "@/lib/core/governance/engine";

const mockContext = {
  taskType: "account_mapping",
  doctrineReferences: [{ documentId: "04.07", title: "COA Mapping", principle: "Mapping translates", relevance: "Critical" }],
  governanceReferences: [],
  evidenceRequirements: [],
  humanApprovalRequired: true,
  escalationTriggers: [],
  outputBoundary: "draft_only",
  recommendedPromptLayers: [],
};

describe("GovernanceEngine", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe("evaluate", () => {
    it("returns context and approval requirement for known task", () => {
      mockGetGovernanceContext.mockReturnValue(mockContext);
      mockRequiresHumanApproval.mockReturnValue(true);
      const result = GovernanceEngine.evaluate({ taskType: "account_mapping" });
      expect(result.context).toEqual(mockContext);
      expect(result.taskType).toBe("account_mapping");
      expect(result.humanApprovalRequired).toBe(true);
    });

    it("returns false when human approval not required", () => {
      const ctx = { ...mockContext, taskType: "trial_balance_upload", humanApprovalRequired: false };
      mockGetGovernanceContext.mockReturnValue(ctx);
      mockRequiresHumanApproval.mockReturnValue(false);
      expect(GovernanceEngine.evaluate({ taskType: "trial_balance_upload" }).humanApprovalRequired).toBe(false);
    });

    it("throws for unknown task type", () => {
      mockGetGovernanceContext.mockImplementation(() => { throw new Error("Unknown governance task type: unknown"); });
      expect(() => GovernanceEngine.evaluate({ taskType: "unknown" })).toThrow("Unknown governance task type");
    });
  });

  describe("listSupportedTasks", () => {
    it("returns list of supported tasks", () => {
      mockListSupportedGovernanceTasks.mockReturnValue(["account_mapping", "evidence_review"]);
      expect(GovernanceEngine.listSupportedTasks()).toContain("account_mapping");
    });
    it("returns empty array when no tasks registered", () => {
      mockListSupportedGovernanceTasks.mockReturnValue([]);
      expect(GovernanceEngine.listSupportedTasks()).toEqual([]);
    });
  });
});
