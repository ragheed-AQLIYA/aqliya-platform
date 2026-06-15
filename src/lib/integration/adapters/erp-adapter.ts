// ─── ErpConnector → ERPProvider Adapter ───
// Wraps a local ErpConnector (SAP/Oracle/Dynamics) into the
// integration layer's ERPProvider interface.

import { IntegrationType } from "../types";
import type {
  ERPProvider,
  ERPSpendRecord,
  ERPSupplier,
  ConnectionTestResult,
  ProviderHealth,
} from "../types";
import type { ErpConnector } from "@/lib/local-content/erp/connector";

/**
 * Adapter that wraps a local ErpConnector into the integration
 * layer's ERPProvider interface.
 */
export class ErpProviderAdapter implements ERPProvider {
  readonly providerId: string;
  readonly providerType = IntegrationType.ERP as const;

  private inner: ErpConnector;

  constructor(inner: ErpConnector) {
    this.inner = inner;
    this.providerId = "erp-adapter";
  }

  async fetchSpendRecords(since?: Date): Promise<ERPSpendRecord[]> {
    return this.inner.fetchSpendRecords(since);
  }

  async fetchSuppliers(since?: Date): Promise<ERPSupplier[]> {
    return this.inner.fetchSuppliers(since);
  }

  async testConnection(): Promise<ConnectionTestResult> {
    return this.inner.testConnection();
  }

  async health(): Promise<ProviderHealth> {
    const startMs = Date.now();
    try {
      const result = await this.inner.testConnection();
      return {
        healthy: result.success,
        latencyMs: Date.now() - startMs,
        lastCheck: new Date(),
        error: result.success ? undefined : result.message,
      };
    } catch (err) {
      return {
        healthy: false,
        latencyMs: Date.now() - startMs,
        lastCheck: new Date(),
        error: err instanceof Error ? err.message : "ERP health check failed",
      };
    }
  }
}

/**
 * Wrap an ErpConnector into an ERPProvider adapter.
 */
export function wrapErpConnector(connector: ErpConnector): ERPProvider {
  return new ErpProviderAdapter(connector);
}
