/**
 * Odoo ERP connector (Cycle 4) — JSON-RPC + custom REST v0.1
 */

import type { ErpConnector, RateLimitStatus } from "./connector";
import type {
  ErpProcurementLine,
  ErpSpendRecord,
  ErpSupplier,
} from "./types";

export interface OdooConnectorConfig {
  apiEndpoint: string;
  apiKey?: string;
}

export class OdooErpConnector implements ErpConnector {
  private config: OdooConnectorConfig;

  constructor(config: OdooConnectorConfig) {
    this.config = config;
  }

  private get baseUrl(): string {
    return this.config.apiEndpoint.replace(/\/$/, "");
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/jsonrpc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "call",
          params: { service: "common", method: "version", args: [] },
          id: 1,
        }),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) {
        return { success: false, message: `HTTP ${res.status}` };
      }
      return { success: true, message: "Odoo JSON-RPC reachable" };
    } catch (e) {
      return {
        success: false,
        message: e instanceof Error ? e.message : "Connection failed",
      };
    }
  }

  async fetchSpendRecords(_since?: Date): Promise<ErpSpendRecord[]> {
    const res = await fetch(`${this.baseUrl}/aqliya/spend-records`, {
      headers: this.authHeaders(),
      signal: AbortSignal.timeout(30000),
    }).catch(() => null);

    if (!res?.ok) return [];
    const data = (await res.json()) as { records?: ErpSpendRecord[] };
    return data.records ?? [];
  }

  async fetchSuppliers(_since?: Date): Promise<ErpSupplier[]> {
    const res = await fetch(`${this.baseUrl}/aqliya/suppliers`, {
      headers: this.authHeaders(),
      signal: AbortSignal.timeout(30000),
    }).catch(() => null);

    if (!res?.ok) return [];
    const data = (await res.json()) as { suppliers?: ErpSupplier[] };
    return data.suppliers ?? [];
  }

  async fetchProcurementLines(since?: Date): Promise<ErpProcurementLine[]> {
    const spend = await this.fetchSpendRecords(since);
    return spend.map((s) => ({
      sourceId: s.sourceId,
      purchaseOrderNumber: s.invoiceNumber ?? s.sourceId,
      supplierName: s.supplierName,
      supplierRegistrationNumber: s.supplierRegistrationNumber,
      lineAmount: s.amount,
      currency: s.currency,
      category: s.category,
      description: s.description,
      quantity: 1,
      unitPrice: s.amount,
      period: s.period,
    }));
  }

  async getRateLimitStatus(): Promise<RateLimitStatus> {
    return { remaining: 100, resetAt: new Date(Date.now() + 60_000) };
  }

  private authHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.config.apiKey) {
      headers.Authorization = `Bearer ${this.config.apiKey}`;
    }
    return headers;
  }
}
