import {
  aiRequestToCompletion,
  completionToAiResponse,
} from "@/lib/ai/providers/llm-http-client";
import type { AIRequest } from "@/lib/ai/types";

describe("llm-http-client", () => {
  it("maps AIRequest to completion messages", () => {
    const req: AIRequest = {
      taskType: "account_mapping",
      taskInput: { accountCode: "1101" },
      governanceContext: {
        taskType: "account_mapping",
        evidenceRequirements: [],
        humanApprovalRequired: true,
        escalationTriggers: [],
      },
      assembledPrompt: {
        layers: [{ layer: "system" as const, content: "Classify account" }],
        fullPrompt: "Map 1101 Cash",
      },
    };

    const completion = aiRequestToCompletion(req);
    expect(completion.messages[0]?.content).toBe("Map 1101 Cash");
    expect(completion.systemPrompt).toContain("Classify");
  });

  it("builds AIResponse from completion", () => {
    const response = completionToAiResponse(
      {
        content: "CA-1010",
        model: "gpt-4o",
        provider: "openai",
        usage: { promptTokens: 10, completionTokens: 5 },
      },
      "openai",
      0.9,
    );
    expect(response.providerId).toBe("openai");
    expect(response.confidence).toBe(0.9);
    expect(response.output).toBe("CA-1010");
  });
});
