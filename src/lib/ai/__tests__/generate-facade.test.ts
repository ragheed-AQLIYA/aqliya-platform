import { generateClassification, generateCompletion } from "@/lib/ai/generate";

jest.mock("@/lib/ai/orchestrator", () => ({
  aiOrchestrator: {
    generate: jest.fn().mockResolvedValue({
      response: {
        output: "CA-1010",
        confidence: 0.8,
        providerId: "deterministic",
        modelVersion: "deterministic/v1",
        metadata: {},
        warnings: [],
      },
      providerId: "deterministic",
      governanceContext: {},
      warnings: [],
    }),
  },
}));

describe("generate facade", () => {
  it("generateCompletion delegates to orchestrator", async () => {
    const { aiOrchestrator } = await import("@/lib/ai/orchestrator");
    const response = await generateCompletion({
      taskType: "account_mapping",
      taskInput: { foo: "bar" },
      organizationId: "org-1",
    });
    expect(aiOrchestrator.generate).toHaveBeenCalled();
    expect(response.output).toBe("CA-1010");
  });

  it("generateClassification sets account_mapping task", async () => {
    const { aiOrchestrator } = await import("@/lib/ai/orchestrator");
    await generateClassification({
      accountCode: "1101",
      accountName: "Cash",
      organizationId: "org-1",
    });
    expect(aiOrchestrator.generate).toHaveBeenCalledWith(
      expect.objectContaining({
        taskType: "account_mapping",
        taskInput: expect.objectContaining({
          accountCode: "1101",
          mode: "classification",
        }),
      }),
    );
  });
});
