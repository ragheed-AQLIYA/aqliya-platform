// SAP ERP Connector (v0.1 — stub implementation)
// Uses configurable REST endpoint pattern.
// In production, this would use RFC/BAPI calls via SAP NetWeaver Gateway.

import "server-only";

import type { ErpConnector, RateLimitStatus } from "./connector";
import type {
  ErpSpendRecord,
  ErpSupplier,
  ErpProcurementLine,
} from "./types";

export interface SapConnectorConfig {
  apiEndpoint: string;
  apiKey?: string;
  client?: string;
  language?: string;
  systemId?: string;
  timeoutMs?: number;
}

function mapEkpoToSpendRecord(row: Record<string, string>): ErpSpendRecord {
  return {
    sourceId: row.ebeln ?? "",
    amount: parseFloat(row.netwr ?? "0"),
    currency: row.waers ?? "SAR",
    category: row.maklz ?? "goods",
    supplierName: row.lifnr_name ?? "",
    supplierRegistrationNumber: row.stcd1,
    invoiceNumber: row.rebeln,
    contractReference: row.ebeln,
    period: row.budat ?? "",
    description: row.txz01,
    transactionDate: row.bedat,
    costCenter: row.kostl,
    metadata: { sourceTable: "EKPO", sourceSystem: "SAP" },
  };
}

function mapLfa1ToSupplier(row: Record<string, string>): ErpSupplier {
  return {
    sourceId: row.lifnr ?? "",
    name: row.name1 ?? "",
    registrationNumber: row.stcd1,
    taxId: row.stcd2,
    locality: row.land1 === "SA" ? "local" : "non_local",
    country: row.land1,
    city: row.ort01,
    isActive: row.loevm !== "X",
    metadata: { sourceTable: "LFA1", sourceSystem: "SAP" },
  };
}

function mapEkpoToProcurementLine(
  row: Record<string, string>,
): ErpProcurementLine {
  return {
    sourceId: `${row.ebeln ?? ""}-${row.ebelp ?? ""}`,
    purchaseOrderNumber: row.ebeln ?? "",
    supplierName: row.lifnr_name ?? "",
    supplierRegistrationNumber: row.stcd1,
    lineAmount: parseFloat(row.netwr ?? "0"),
    currency: row.waers ?? "SAR",
    category: row.maklz ?? "goods",
    description: row.txz01,
    quantity: parseInt(row.menge ?? "0", 10),
    unitPrice: parseFloat(row.netpr ?? "0"),
    unitOfMeasure: row.meins,
    orderDate: row.bedat,
    deliveryDate: row.eindt,
    period: row.budat ?? "",
    costCenter: row.kostl,
    metadata: { sourceTable: "EKPO", sourceSystem: "SAP" },
  };
}

export class SapConnector implements ErpConnector {
  private config: SapConnectorConfig;

  constructor(config: SapConnectorConfig) {
    this.config = config;
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.config.apiEndpoint) {
      return { success: false, message: "SAP endpoint غير مهيأ" };
    }
    try {
      const res = await fetch(`${this.config.apiEndpoint}/health`, {
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(this.config.timeoutMs ?? 10_000),
      });
      if (res.ok) {
        return { success: true, message: `SAP ${this.config.systemId ?? ""} متصل` };
      }
      return {
        success: false,
        message: `SAP endpoint استجاب بـ ${res.status}`,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "فشل الاتصال";
      return { success: false, message: `SAP: ${msg}` };
    }
  }

  async fetchSpendRecords(since?: Date): Promise<ErpSpendRecord[]> {
    const endpoint = `${this.config.apiEndpoint ?? ""}/spend-records`;
    const url = new URL(endpoint);
    if (since) url.searchParams.set("since", since.toISOString());
    url.searchParams.set("client", this.config.client ?? "100");

    const res = await fetch(url.toString(), {
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(this.config.timeoutMs ?? 30_000),
    });

    if (!res.ok) {
      throw new Error(`SAP fetchSpendRecords فشل: ${res.status}`);
    }

    const body: Record<string, unknown> = await res.json();
    const records = (body.data ?? body.results ?? []) as Record<string, string>[];
    return records.map(mapEkpoToSpendRecord);
  }

  async fetchSuppliers(since?: Date): Promise<ErpSupplier[]> {
    const endpoint = `${this.config.apiEndpoint ?? ""}/suppliers`;
    const url = new URL(endpoint);
    if (since) url.searchParams.set("since", since.toISOString());
    url.searchParams.set("client", this.config.client ?? "100");

    const res = await fetch(url.toString(), {
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(this.config.timeoutMs ?? 30_000),
    });

    if (!res.ok) {
      throw new Error(`SAP fetchSuppliers فشل: ${res.status}`);
    }

    const body: Record<string, unknown> = await res.json();
    const records = (body.data ?? body.results ?? []) as Record<string, string>[];
    return records.map(mapLfa1ToSupplier);
  }

  async fetchProcurementLines(since?: Date): Promise<ErpProcurementLine[]> {
    const endpoint = `${this.config.apiEndpoint ?? ""}/procurement-lines`;
    const url = new URL(endpoint);
    if (since) url.searchParams.set("since", since.toISOString());
    url.searchParams.set("client", this.config.client ?? "100");

    const res = await fetch(url.toString(), {
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(this.config.timeoutMs ?? 30_000),
    });

    if (!res.ok) {
      throw new Error(`SAP fetchProcurementLines فشل: ${res.status}`);
    }

    const body: Record<string, unknown> = await res.json();
    const records = (body.data ?? body.results ?? []) as Record<string, string>[];
    return records.map(mapEkpoToProcurementLine);
  }

  async getRateLimitStatus(): Promise<RateLimitStatus> {
    return {
      remaining: 100,
      resetAt: new Date(Date.now() + 60_000),
    };
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "X-SAP-Client": this.config.client ?? "100",
    };
    if (this.config.apiKey) {
      headers["X-API-Key"] = this.config.apiKey;
    }
    return headers;
  }
}
