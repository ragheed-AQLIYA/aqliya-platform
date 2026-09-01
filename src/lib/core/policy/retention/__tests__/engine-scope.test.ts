import { applyRetention, runScheduledRetention } from "@/lib/core/policy/retention/engine";
import type { RetentionPolicy } from "@/lib/core/policy/retention/types";

describe("retention tenant scope", () => {
  it("rejects unscoped scheduled retention", async () => {
    await expect(runScheduledRetention()).rejects.toThrow(
      "organizationId is required for retention",
    );
  });

  it("skips applyRetention without organizationId", async () => {
    const policy: RetentionPolicy = {
      modelName: "Decision",
      retentionDays: 1,
      action: "delete",
      enabled: true,
    };
    const result = await applyRetention(policy);
    expect(result.status).toBe("skipped");
    expect(result.error).toContain("organizationId is required");
    expect(result.recordsAffected).toBe(0);
  });
});
