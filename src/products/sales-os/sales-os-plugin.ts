import type { ProductPlugin, PluginDependencies } from "@/lib/kernel/plugin/product-plugin";
import type { KernelHealth, ProductRoute, ProductSchema } from "@/lib/kernel/types";
import type { DomainEvent, EventHandler } from "@/lib/kernel/contracts/event-bus";

export class SalesOSPlugin implements ProductPlugin {
  readonly id = "sales-os";
  readonly name = "SalesOS";
  readonly version = "1.0.0";
  readonly description = "Governed revenue intelligence — deals, accounts, pipeline, proof networks, institutional memory";
  readonly requiredCapabilities = ["identity", "tenant", "policy", "evidence", "events", "workflow", "cache", "toolRegistry"];

  dependencies: PluginDependencies = {};
  private unsubscribers: Array<() => void> = [];

  async initialize(): Promise<void> {
    const eventBus = this.dependencies.events;
    if (!eventBus) return;

    const handleDealEvents: EventHandler = async (event: DomainEvent) => {
      if (event.productSlug === "sales-os") return;
      console.log(
        `[SalesOS] Cross-product deal event: ${event.action} from ${event.productSlug} — resource ${event.resourceId}`,
      );
    };

    const handleAuditEvents: EventHandler = async (event: DomainEvent) => {
      if (event.domain === "audit" && event.action === "review.completed") {
        console.log(
          `[SalesOS] Audit review completed: ${event.resourceId} — checking for linked deals`,
        );
      }
    };

    const handleLCOSEvents: EventHandler = async (event: DomainEvent) => {
      if (event.domain === "lc" && event.action === "project.classified") {
        console.log(
          `[SalesOS] Local content classification completed: ${event.resourceId} — checking for supplier overlap`,
        );
      }
    };

    eventBus.subscribe("sales", "*", handleDealEvents);
    eventBus.subscribe("audit", "review.completed", handleAuditEvents);
    eventBus.subscribe("lc", "project.classified", handleLCOSEvents);

    this.unsubscribers.push(
      () => eventBus.unsubscribe("sales", "*", handleDealEvents),
      () => eventBus.unsubscribe("audit", "review.completed", handleAuditEvents),
      () => eventBus.unsubscribe("lc", "project.classified", handleLCOSEvents),
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
      { path: "/sales", type: "workspace" },
      { path: "/sales/deals", type: "workspace" },
      { path: "/sales/accounts", type: "workspace" },
      { path: "/sales/pipeline", type: "workspace" },
      { path: "/sales/opportunities", type: "workspace" },
      { path: "/sales/intelligence", type: "workspace" },
      { path: "/sales/approval", type: "workspace" },
      { path: "/sales/activities", type: "workspace" },
      { path: "/sales/review", type: "workspace" },
      { path: "/sales/reports", type: "workspace" },
      { path: "/sales/revenue", type: "workspace" },
      { path: "/sales/outreach", type: "workspace" },
      { path: "/sales/signals", type: "workspace" },
      { path: "/sales/icp", type: "workspace" },
      { path: "/sales/funnel", type: "workspace" },
      { path: "/sales/forecast", type: "workspace" },
    ];
  }

  getSchemas(): ProductSchema[] {
    return [
      { model: "SalesPipeline", key: "salesPipeline" },
      { model: "SalesPipelineStage", key: "salesPipelineStage" },
      { model: "SalesAccount", key: "salesAccount" },
      { model: "SalesDeal", key: "salesDeal" },
      { model: "SalesEvidenceLink", key: "salesEvidenceLink" },
      { model: "SalesInteraction", key: "salesInteraction" },
      { model: "SalesContact", key: "salesContact" },
      { model: "SalesProposal", key: "salesProposal" },
      { model: "SalesReview", key: "salesReview" },
      { model: "SalesApproval", key: "salesApproval" },
      { model: "SalesAuditEvent", key: "salesAuditEvent" },
    ];
  }
}
