import { describe, expect, it, jest, beforeEach } from "@jest/globals";

const mockCreateAnyAIProviderFromResolver = jest.fn<
  () => Promise<{ getStatus: () => { configured: boolean; available: boolean }; isAvailable: () => Promise<boolean>; execute: () => Promise<unknown> }>
>();

jest.mock("@/lib/ai/providers/ai-provider-factory", () => ({
  createAnyAIProviderFromResolver: mockCreateAnyAIProviderFromResolver,
}));

jest.mock("@/lib/platform/feature-flags/registry", () => ({
  isEnabled: (flag: string) => flag === "ai.real-providers",
}));

jest.mock("@/lib/governance/retrieval-router", () => ({
  getGovernanceContext: () => ({
    evidenceRequirements: [],
    humanApprovalRequired: true,
  }),
}));

jest.mock("@/lib/ai/orchestrator-rag-inject", () => ({
  injectGovernedRagIntoRequest: async (req: unknown) => req,
}));

jest.mock("@/lib/ai/prompt-registry", () => ({
  getPromptBuilder: () => null,
  assemblePrompt: (req: unknown) => req,
}));

import { AIOrchestrator } from "@/lib/ai/orchestrator";

describe("AIOrchestrator tenant resolver", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AI_MODE = "cloud";
    process.env.OPENAI_API_KEY = "";

    const tenantProvider = {
      providerId: "openai" as const,
      getStatus: () => ({ configured: true, available: true, providerId: "openai" }),
      isAvailable: async () => true,
      execute: async () => ({
        output: "ok",
        confidence: 0.9,
        providerId: "openai",
        modelVersion: "tenant-model",
        warnings: [],
        metadata: {},
      }),
    };

    mockCreateAnyAIProviderFromResolver.mockResolvedValue(tenantProvider);
  });

  it("uses createAnyAIProviderFromResolver when organizationId is present", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    const orchestrator = new AIOrchestrator();

    await orchestrator.generate({
      taskType: "notes_generation",
      taskInput: { text: "hello" },
      organizationId: "org-tenant-1",
    });

    expect(mockCreateAnyAIProviderFromResolver).toHaveBeenCalledWith(
      "org-tenant-1",
      expect.stringMatching(/openai|anthropic|cloud|local/),
    );
  });
});
