import { LocalAIProvider } from "@/lib/ai/providers/local-provider";

describe("LocalAIProvider", () => {
  it("reports configured when env set", () => {
    const provider = new LocalAIProvider({
      baseUrl: "http://localhost:11434",
      defaultModel: "llama3",
    });
    expect(provider.getStatus().configured).toBe(true);
    expect(provider.getStatus().providerId).toBe("local");
  });
});
