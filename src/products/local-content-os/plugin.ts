import type { ProductPlugin, PluginDependencies } from "@/lib/kernel/plugin/product-plugin";
import type { KernelHealth, ProductRoute, ProductSchema } from "@/lib/kernel/types";
import type { DomainEvent, EventHandler } from "@/lib/kernel/contracts/event-bus";
import { createLogger } from "@/lib/observability/logger";

const logger = createLogger({ product: "local-content-os", action: "plugin" });

export class LocalContentOSPlugin implements ProductPlugin {
  readonly id = "local-content-os";
  readonly name = "LocalContentOS";
  readonly version = "1.0.0";
  readonly description = "Local content intelligence — Nitaqat compliance, supplier classification, spend analytics";
  readonly requiredCapabilities = ["identity", "tenant", "policy", "evidence", "events", "workflow", "cache", "ai"];

  dependencies: PluginDependencies = {};
  private unsubscribers: Array<() => void> = [];

  async initialize(): Promise<void> {
    const eventBus = this.dependencies.events;
    if (!eventBus) return;

    const handleAuditOSEvidence: EventHandler = async (event: DomainEvent) => {
      if (event.productSlug === "local-content-os") return;
      logger.info(`AuditOS evidence event: ${event.action} — resource ${event.resourceId}`);
    };

    const handleAIOutput: EventHandler = async (event: DomainEvent) => {
      logger.info(`AI output generated: ${event.action} — resource ${event.resourceId}`);
    };

    eventBus.subscribe("evidence", "*", handleAuditOSEvidence);
    eventBus.subscribe("ai", "*", handleAIOutput);

    this.unsubscribers.push(
      () => eventBus.unsubscribe("evidence", "*", handleAuditOSEvidence),
      () => eventBus.unsubscribe("ai", "*", handleAIOutput),
    );
  }

  async shutdown(): Promise<void> {
    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.unsubscribers = [];
  }

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
