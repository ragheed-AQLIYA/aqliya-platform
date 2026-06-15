import {
  resolveExecutionModeFromEnv,
  selectProviderForTask,
} from "@/lib/ai/hybrid-router";

describe("hybrid-router", () => {
  const originalMode = process.env.AI_MODE;

  afterEach(() => {
    if (originalMode === undefined) delete process.env.AI_MODE;
    else process.env.AI_MODE = originalMode;
  });

  it("defaults to cloud when AI_MODE unset", () => {
    delete process.env.AI_MODE;
    expect(resolveExecutionModeFromEnv()).toBe("cloud");
  });

  it("selects local for account_mapping in local mode", async () => {
    process.env.AI_MODE = "local";
    const provider = await selectProviderForTask("account_mapping");
    expect(provider).toBe("local");
  });

  it("selects openai for notes in cloud mode", async () => {
    process.env.AI_MODE = "cloud";
    const provider = await selectProviderForTask("notes_generation");
    expect(provider).toBe("openai");
  });
});
