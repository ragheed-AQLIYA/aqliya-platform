import type { ProductPlugin, PluginDependencies } from "@/lib/kernel/plugin/product-plugin";
import type { KernelHealth, ProductRoute, ProductSchema } from "@/lib/kernel/types";

export class AuditOSPlugin implements ProductPlugin {
  readonly id = "audit-os";
  readonly name = "AuditOS";
  readonly version = "1.0.0";
  readonly description = "Audit intelligence product — engagements, findings, evidence, financial statements";
  readonly requiredCapabilities = ["identity", "tenant", "policy", "audit", "evidence", "events", "workflow", "cache"];

  dependencies: PluginDependencies = {};

  async initialize(): Promise<void> {
    // Register event handlers, load product config
  }

  async shutdown(): Promise<void> {
    // Cleanup
  }

  async healthCheck(): Promise<{ status: KernelHealth }> {
    return { status: "healthy" };
  }

  getRoutes(): ProductRoute[] {
    return [
      { path: "/audit", type: "workspace" },
      { path: "/api/audit", type: "api" },
    ];
  }

  getSchemas(): ProductSchema[] {
    return [
      { model: "AuditEngagement", key: "auditEngagement" },
      { model: "AuditFinding", key: "auditFinding" },
      { model: "AuditEntry", key: "auditEntry" },
      { model: "AuditScope", key: "auditScope" },
      { model: "AuditReport", key: "auditReport" },
      { model: "AuditTrialBalance", key: "auditTrialBalance" },
      { model: "AuditAccountMapping", key: "auditAccountMapping" },
      { model: "AuditFinancialStatement", key: "auditFinancialStatement" },
      { model: "AuditNote", key: "auditNote" },
      { model: "AuditEvidence", key: "auditEvidence" },
      { model: "AuditClient", key: "auditClient" },
      { model: "AuditDocument", key: "auditDocument" },
      { model: "AuditReview", key: "auditReview" },
      { model: "AuditApproval", key: "auditApproval" },
      { model: "AuditVersion", key: "auditVersion" },
    ];
  }
}
