import { describe, it, expect } from "@jest/globals";

describe("Status Badge Component", () => {
  it("should export StatusBadge and related utilities", async () => {
    const mod = await import("@/components/audit/shared/status-badge");
    expect(mod.StatusBadge).toBeDefined();
    expect(mod.statusConfig).toBeDefined();
    expect(mod.colorClasses).toBeDefined();
    expect(mod.getStatusLabel).toBeDefined();
  });
});
