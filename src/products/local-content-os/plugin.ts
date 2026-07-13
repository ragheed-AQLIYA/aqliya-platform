import type { ProductPlugin, PluginDependencies } from "@/lib/kernel/plugin/product-plugin";
import type { KernelHealth, ProductRoute, ProductSchema } from "@/lib/kernel/types";

export class LocalContentOSPlugin implements ProductPlugin {
  readonly id = "local-content-os";
  readonly name = "LocalContentOS";
  readonly version = "1.0.0";
  readonly description = "Local content intelligence — Nitaqat compliance, supplier classification, spend analytics";
  readonly requiredCapabilities = ["identity", "tenant", "policy", "evidence", "events", "workflow", "cache", "ai"];

  dependencies: PluginDependencies = {};

  async initialize(): Promise<void> {}

  async shutdown(): Promise<void> {}

  async healthCheck(): Promise<{ status: KernelHealth }> {
    return { status: "healthy" };
  }

  getRoutes(): ProductRoute[] {
    return [
      { path: "/local-content", type: "workspace" },
      { path: "/api/local-content", type: "api" },
    ];
  }

  getSchemas(): ProductSchema[] {
    return [
      { model: "LocalContentProject", key: "localContentProject" },
      { model: "LocalContentBaseline", key: "localContentBaseline" },
      { model: "LocalContentScore", key: "localContentScore" },
      { model: "LocalContentClassification", key: "localContentClassification" },
      { model: "LocalContentGapAnalysis", key: "localContentGapAnalysis" },
      { model: "LocalContentRecommendation", key: "localContentRecommendation" },
      { model: "LocalContentEvidence", key: "localContentEvidence" },
      { model: "LocalContentReport", key: "localContentReport" },
      { model: "LocalContentSupplier", key: "localContentSupplier" },
      { model: "LocalContentSpend", key: "localContentSpend" },
      { model: "LocalContentHealthRecord", key: "localContentHealthRecord" },
      { model: "LocalContentIndustryMemory", key: "localContentIndustryMemory" },
      { model: "LocalContentVersion", key: "localContentVersion" },
      { model: "LocalContentAuditTrail", key: "localContentAuditTrail" },
    ];
  }
}
