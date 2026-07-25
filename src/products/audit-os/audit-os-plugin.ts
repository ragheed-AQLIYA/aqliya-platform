import type { ProductPlugin, PluginDependencies } from "@/lib/kernel/plugin/product-plugin";
import type { KernelHealth, ProductRoute, ProductSchema } from "@/lib/kernel/types";
import type { DomainEvent, EventHandler } from "@/lib/kernel/contracts/event-bus";
import { createLogger } from "@/lib/observability/logger";

const logger = createLogger({ product: "audit-os", action: "plugin" });

export class AuditOSPlugin implements ProductPlugin {
  readonly id = "audit-os";
  readonly name = "AuditOS";
  readonly version = "1.0.0";
  readonly description = "Audit intelligence product — engagements, findings, evidence, financial statements";
  readonly requiredCapabilities = ["identity", "tenant", "policy", "audit", "evidence", "events", "workflow", "cache"];

  dependencies: PluginDependencies = {};
  private unsubscribers: Array<() => void> = [];

  async initialize(): Promise<void> {
    const eventBus = this.dependencies.events;
    if (!eventBus) return;

    const handleCrossProductEvidence: EventHandler = async (event: DomainEvent) => {
      if (event.productSlug === "audit-os") return;
      logger.info(`Cross-product evidence event: ${event.action} from ${event.productSlug} — resource ${event.resourceId}`);
    };

    const handleKnowledgePattern: EventHandler = async (event: DomainEvent) => {
      logger.info(`Knowledge pattern recorded: ${event.action} — resource ${event.resourceId}`);
    };

    eventBus.subscribe("evidence", "*", handleCrossProductEvidence);
    eventBus.subscribe("knowledge", "*", handleKnowledgePattern);

    this.unsubscribers.push(
      () => eventBus.unsubscribe("evidence", "*", handleCrossProductEvidence),
      () => eventBus.unsubscribe("knowledge", "*", handleKnowledgePattern),
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
