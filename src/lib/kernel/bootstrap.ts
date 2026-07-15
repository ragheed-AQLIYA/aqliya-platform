import type { ProductPlugin } from "./plugin/product-plugin";
import { ProductRegistry } from "./plugin/product-registry";
import type { KernelHealthReport } from "./types";

const SERVICE_CONTRACTS = [
  "identity",
  "tenant",
  "workflow",
  "policy",
  "evidence",
  "ai",
  "events",
  "audit",
  "notification",
  "files",
  "search",
  "knowledge",
  "automation",
  "scheduling",
  "featureFlags",
  "secrets",
  "encryption",
  "cache",
  "toolRegistry",
] as const;

type ServiceContract = (typeof SERVICE_CONTRACTS)[number];

export class Kernel {
  private static instance: Kernel | null = null;
  private services = new Map<string, unknown>();
  private registry: ProductRegistry;
  private initialized = false;
  private startTime = 0;

  private constructor() {
    this.registry = new ProductRegistry();
  }

  static getInstance(): Kernel {
    if (!Kernel.instance) {
      Kernel.instance = new Kernel();
    }
    return Kernel.instance;
  }

  static resetInstance(): void {
    Kernel.instance = null;
  }

  registerService<T>(contract: ServiceContract, implementation: T): void {
    this.services.set(contract, implementation);
  }

  getService<T>(contract: ServiceContract): T {
    const service = this.services.get(contract);
    if (!service) {
      throw new Error(`Service "${contract}" is not registered. Did you call initializeKernel()?`);
    }
    return service as T;
  }

  hasService(contract: string): boolean {
    return this.services.has(contract);
  }

  registerPlugin(plugin: ProductPlugin): void {
    const availableServices = Array.from(this.services.keys());
    for (const cap of plugin.requiredCapabilities) {
      if (!availableServices.includes(cap)) {
        throw new Error(
          `Plugin "${plugin.id}" requires capability "${cap}" which is not registered. Available: ${availableServices.join(", ")}`,
        );
      }
    }

    for (const [key, service] of this.services) {
      const depKey = key as keyof typeof plugin.dependencies;
      (plugin.dependencies as Record<string, unknown>)[depKey] = service;
    }

    this.registry.register(plugin);
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.startTime = Date.now();

    await this.registry.initializeAll();
    this.initialized = true;
  }

  async shutdown(): Promise<void> {
    if (!this.initialized) return;
    await this.registry.shutdownAll();
    this.initialized = false;
    Kernel.instance = null;
  }

  async healthCheck(): Promise<KernelHealthReport> {
    return this.registry.healthCheckAll();
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getRegistry(): ProductRegistry {
    return this.registry;
  }
}

let kernelInstance: Kernel | null = null;

export async function initializeKernel(): Promise<Kernel> {
  if (kernelInstance?.isInitialized()) return kernelInstance;

  kernelInstance = Kernel.getInstance();

  const { IdentityService } = await import("./implementations/identity-service");
  const { TenantService } = await import("./implementations/tenant-service");
  const { WorkflowEngineWrapper } = await import("./implementations/workflow-engine");
  const { PolicyEngineWrapper } = await import("./implementations/policy-engine");
  const { EventBusWrapper } = await import("./implementations/event-bus");
  const { AuditLedgerWrapper } = await import("./implementations/audit-ledger");
  const { FeatureFlagServiceWrapper } = await import("./implementations/feature-flag-service");
  const { CacheLayerWrapper } = await import("./implementations/cache-layer");
  const { EncryptionServiceWrapper } = await import("./implementations/encryption-service");
  const { SecretsVaultWrapper } = await import("./implementations/secrets-vault");
  const { NotificationServiceWrapper } = await import("./implementations/notification-service");
  const { FilesServiceWrapper } = await import("./implementations/files-service");
  const { SearchServiceWrapper } = await import("./implementations/search-service");
  const { KnowledgeServiceWrapper } = await import("./implementations/knowledge-service");
  const { AutomationServiceWrapper } = await import("./implementations/automation-service");
  const { SchedulingServiceWrapper } = await import("./implementations/scheduling-service");
  const { EvidenceServiceWrapper } = await import("./implementations/evidence-service");
  const { AIGatewayWrapper } = await import("./implementations/ai-gateway");

  kernelInstance.registerService("identity", new IdentityService());
  kernelInstance.registerService("tenant", new TenantService());
  kernelInstance.registerService("workflow", new WorkflowEngineWrapper());
  kernelInstance.registerService("policy", new PolicyEngineWrapper());
  kernelInstance.registerService("evidence", new EvidenceServiceWrapper());
  kernelInstance.registerService("ai", new AIGatewayWrapper());
  kernelInstance.registerService("events", new EventBusWrapper());
  kernelInstance.registerService("audit", new AuditLedgerWrapper());
  kernelInstance.registerService("notification", new NotificationServiceWrapper());
  kernelInstance.registerService("files", new FilesServiceWrapper());
  kernelInstance.registerService("search", new SearchServiceWrapper());
  kernelInstance.registerService("knowledge", new KnowledgeServiceWrapper());
  kernelInstance.registerService("automation", new AutomationServiceWrapper());
  kernelInstance.registerService("scheduling", new SchedulingServiceWrapper());
  kernelInstance.registerService("featureFlags", new FeatureFlagServiceWrapper());
  kernelInstance.registerService("secrets", new SecretsVaultWrapper());
  kernelInstance.registerService("encryption", new EncryptionServiceWrapper());
  kernelInstance.registerService("cache", new CacheLayerWrapper());

  const { getToolRegistry } = await import("@/lib/core/ai/tool-registry/registry");
  kernelInstance.registerService("toolRegistry", getToolRegistry());

  const { AuditOSPlugin } = await import("../../products/audit-os/audit-os-plugin");
  const { LocalContentOSPlugin } = await import("../../products/local-content-os/plugin");
  const { SalesOSPlugin } = await import("../../products/sales-os/sales-os-plugin");

  kernelInstance.registerPlugin(new AuditOSPlugin());
  kernelInstance.registerPlugin(new LocalContentOSPlugin());
  kernelInstance.registerPlugin(new SalesOSPlugin());

  await kernelInstance.initialize();

  return kernelInstance;
}
