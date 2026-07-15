import {
  getPromptBuilder,
  getPromptVersion,
  getPromptMetadata,
  listPromptVersions,
  assemblePrompt,
  PROMPT_REGISTRY,
} from "@/lib/core/ai/prompt-registry";

jest.mock("@/lib/governance/prompt-framework", () => ({
  buildStatementDraftingPrompt: jest.fn(() => ({ layers: [], fullPrompt: "statement draft" })),
  buildMappingRecommendationPrompt: jest.fn(() => ({ layers: [], fullPrompt: "mapping rec" })),
  buildAccountClassificationPrompt: jest.fn(() => ({ layers: [], fullPrompt: "classification" })),
  buildEvidenceReviewPrompt: jest.fn(() => ({ layers: [], fullPrompt: "evidence review" })),
  buildAuditFindingPrompt: jest.fn(() => ({ layers: [], fullPrompt: "audit finding" })),
  buildCommercialClaimReviewPrompt: jest.fn(() => ({ layers: [], fullPrompt: "commercial claim" })),
}));

jest.mock("@/lib/governance/retrieval-router", () => ({
  getGovernanceContext: jest.fn(() => null),
}));

describe("Prompt Registry Versioning", () => {
  describe("getPromptBuilder", () => {
    it("returns builder for registered task type", () => {
      const builder = getPromptBuilder("statement_drafting");
      expect(builder).toBeDefined();
      expect(typeof builder).toBe("function");
    });

    it("returns null for unregistered task type", () => {
      const builder = getPromptBuilder("nonexistent" as never);
      expect(builder).toBeNull();
    });
  });

  describe("getPromptVersion", () => {
    it("returns version for registered task type", () => {
      const version = getPromptVersion("statement_drafting");
      expect(version).toBe("1.0.0");
    });

    it("returns null for unregistered task type", () => {
      const version = getPromptVersion("nonexistent" as never);
      expect(version).toBeNull();
    });
  });

  describe("getPromptMetadata", () => {
    it("returns metadata for registered task type", () => {
      const meta = getPromptMetadata("statement_drafting");
      expect(meta).toEqual({
        version: "1.0.0",
        updatedAt: "2026-07-14",
        outputBoundary: "draft_only",
      });
    });

    it("returns null for unregistered task type", () => {
      const meta = getPromptMetadata("nonexistent" as never);
      expect(meta).toBeNull();
    });
  });

  describe("listPromptVersions", () => {
    it("returns all registered prompt versions", () => {
      const versions = listPromptVersions();
      expect(versions.length).toBeGreaterThan(0);
      expect(versions[0]).toHaveProperty("taskType");
      expect(versions[0]).toHaveProperty("version");
      expect(versions[0]).toHaveProperty("updatedAt");
    });

    it("includes all registered task types", () => {
      const versions = listPromptVersions();
      const taskTypes = versions.map((v) => v.taskType);
      expect(taskTypes).toContain("statement_drafting");
      expect(taskTypes).toContain("account_mapping");
      expect(taskTypes).toContain("evidence_review");
      expect(taskTypes).toContain("audit_findings");
      expect(taskTypes).toContain("commercial_claim_review");
    });
  });

  describe("assemblePrompt", () => {
    it("assembles prompt for registered task type", () => {
      const request = {
        taskType: "statement_drafting" as never,
        taskInput: { accountsMapped: true },
      };
      const result = assemblePrompt(request);
      expect(result.assembledPrompt).toBeDefined();
      expect(result.assembledPrompt?.fullPrompt).toBe("statement draft");
    });

    it("returns empty prompt for unregistered task type", () => {
      const request = {
        taskType: "nonexistent" as never,
        taskInput: {},
      };
      const result = assemblePrompt(request);
      expect(result.assembledPrompt).toBeDefined();
      expect(result.assembledPrompt?.fullPrompt).toBe("");
    });
  });

  describe("PROMPT_REGISTRY", () => {
    it("has version and updatedAt on all entries", () => {
      for (const [taskType, entry] of Object.entries(PROMPT_REGISTRY)) {
        expect(entry.version).toBeDefined();
        expect(entry.updatedAt).toBeDefined();
        expect(typeof entry.version).toBe("string");
        expect(typeof entry.updatedAt).toBe("string");
      }
    });

    it("has consistent version format", () => {
      for (const entry of Object.values(PROMPT_REGISTRY)) {
        expect(entry.version).toMatch(/^\d+\.\d+\.\d+$/);
      }
    });
  });
});
