import { describe, it, expect } from "@jest/globals";

describe("LoadingState", () => {
  it("should export LoadingState", async () => {
    const mod = await import("@/components/enterprise/loading-state");
    expect(mod.LoadingState).toBeDefined();
  });
});
