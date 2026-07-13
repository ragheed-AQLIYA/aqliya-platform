import type { ProductPlugin } from "./product-plugin";
import type { KernelHealth, KernelHealthReport } from "../types";

export class ProductRegistry {
  private plugins = new Map<string, ProductPlugin>();
  private initialized = new Set<string>();

  register(plugin: ProductPlugin): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin "${plugin.id}" is already registered`);
    }
    this.plugins.set(plugin.id, plugin);
  }

  unregister(id: string): void {
    this.plugins.delete(id);
    this.initialized.delete(id);
  }

  get(id: string): ProductPlugin | undefined {
    return this.plugins.get(id);
  }

  getAll(): ProductPlugin[] {
    return Array.from(this.plugins.values());
  }

  getInitialized(): ProductPlugin[] {
    return this.getAll().filter((p) => this.initialized.has(p.id));
  }

  async initializeAll(): Promise<void> {
    const plugins = this.getAll();
    for (const plugin of plugins) {
      if (this.initialized.has(plugin.id)) continue;
      await plugin.initialize();
      this.initialized.add(plugin.id);
    }
  }

  async shutdownAll(): Promise<void> {
    const plugins = this.getInitialized();
    for (const plugin of plugins) {
      await plugin.shutdown();
      this.initialized.delete(plugin.id);
    }
  }

  async healthCheckAll(): Promise<KernelHealthReport> {
    const plugins = this.getAll();
    const services: Record<string, KernelHealth> = {};
    let overallStatus: KernelHealth = "healthy";

    for (const plugin of plugins) {
      try {
        const result = await plugin.healthCheck();
        services[plugin.id] = result.status;
        if (result.status === "unhealthy") overallStatus = "unhealthy";
        else if (result.status === "degraded" && overallStatus === "healthy") {
          overallStatus = "degraded";
        }
      } catch {
        services[plugin.id] = "unhealthy";
        overallStatus = "unhealthy";
      }
    }

    return {
      status: overallStatus,
      services,
      uptime: process.uptime(),
    };
  }
}
