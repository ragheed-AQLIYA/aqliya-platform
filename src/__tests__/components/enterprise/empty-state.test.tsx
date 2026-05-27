import { describe, it, expect } from "@jest/globals";

describe("EmptyState", () => {
  it("should export EmptyState", async () => {
    const mod = await import("@/components/enterprise/empty-state");
    expect(mod.EmptyState).toBeDefined();
  });
});
