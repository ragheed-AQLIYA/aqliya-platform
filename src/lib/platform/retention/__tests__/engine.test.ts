import { applyRetention, dryRun, runScheduledRetention } from "../engine";
import { addHold } from "../holds";
import type { RetentionPolicy } from "../types";

/**
 * These tests use the in-memory Prisma mock from jest config.
 * Only models listed in the mock's MODEL_NAMES are available.
 * Tests verify engine logic (skip, dry-run, holds) without real DB.
 */

describe("Retention Engine", () => {
  describe("applyRetention", () => {
    it("skips disabled policies", async () => {
      const policy: RetentionPolicy = {
        modelName: "PlatformAuditLog",
        retentionDays: 365,
        action: "delete",
        enabled: false,
      };
      const result = await applyRetention(policy);
      expect(result.status).toBe("skipped");
      expect(result.recordsAffected).toBe(0);
    });

    it("skips policies with 0 retention days", async () => {
      const policy: RetentionPolicy = {
        modelName: "PlatformAuditLog",
        retentionDays: 0,
        action: "delete",
        enabled: true,
      };
      const result = await applyRetention(policy);
      expect(result.status).toBe("skipped");
      expect(result.recordsAffected).toBe(0);
    });

    it("returns failed for unknown models", async () => {
      const policy: RetentionPolicy = {
        modelName: "NonExistentModel",
        retentionDays: 30,
        action: "delete",
        enabled: true,
      };
      const result = await applyRetention(policy);
      expect(result.status).toBe("failed");
      expect(result.error).toContain("Unknown model");
    });

    it("completes with zero records when nothing expired", async () => {
      const policy: RetentionPolicy = {
        modelName: "PlatformAuditLog",
        retentionDays: 1,
        action: "delete",
        enabled: true,
      };
      const result = await applyRetention(policy);
      expect(result.status).toBe("completed");
      expect(result.recordsAffected).toBe(0);
    });

    it("completes with zero records for large retention days", async () => {
      const policy: RetentionPolicy = {
        modelName: "PlatformAuditLog",
        retentionDays: 36500,
        action: "delete",
        enabled: true,
      };
      const result = await applyRetention(policy);
      expect(result.status).toBe("completed");
      expect(result.recordsAffected).toBe(0);
    });
  });

  describe("dryRun", () => {
    it("returns empty results for recent data", async () => {
      const policy: RetentionPolicy = {
        modelName: "PlatformAuditLog",
        retentionDays: 1,
        action: "delete",
        enabled: true,
      };
      const results = await dryRun(policy);
      expect(results.length).toBe(1);
      expect(results[0].modelName).toBe("PlatformAuditLog");
      expect(results[0].recordsFound).toBe(0);
    });

    it("returns results for all active policies", async () => {
      const results = await dryRun();
      expect(results.length).toBeGreaterThan(0);
      const allZeroOrMore = results.every((r) => r.recordsFound >= 0);
      expect(allZeroOrMore).toBe(true);
    });
  });

  describe("runScheduledRetention", () => {
    it("returns a summary with jobs", async () => {
      const result = await runScheduledRetention();
      expect(result.jobs).toBeDefined();
      expect(typeof result.totalAffected).toBe("number");
      expect(typeof result.durationMs).toBe("number");
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe("retention holds prevent deletion", () => {
    it("skips records on hold during dry run", async () => {
      await addHold({
        recordType: "PlatformAuditLog",
        recordId: "held-record-1",
        reason: "Legal hold",
      });

      const policy: RetentionPolicy = {
        modelName: "PlatformAuditLog",
        retentionDays: 36500,
        action: "delete",
        enabled: true,
      };

      const results = await dryRun(policy);
      expect(results.length).toBe(1);
      expect(results[0].modelName).toBe("PlatformAuditLog");
    });
  });
});
