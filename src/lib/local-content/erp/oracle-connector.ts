// Oracle EBS Connector (v0.1 — stub implementation)
// Uses Oracle REST Data Services (ORDS) pattern.

import "server-only";

import type { ErpConnector, RateLimitStatus } from "./connector";
import type {
  ErpSpendRecord,
  ErpSupplier,
  ErpProcurementLine,
} from "./types";

export interface OracleConnectorConfig {
  apiEndpoint: string;
  apiKey?: string;
  apiSecret?: string;
  instanceName?: string;
  timeoutMs?: number;
}

function mapPoToSpendRecord(row: Record<string, string>): ErpSpendRecord {
  return {
    sourceId: row.po_header_id ?? "",
    amount: parseFloat(row.amount ?? "0"),
    currency: row.currency_code ?? "SAR",
    category: row.category_name ?? "goods",
    supplierName: row.vendor_name ?? "",
    supplierRegistrationNumber: row.vendor_registration_number,
    invoiceNumber: row.invoice_num,
    contractReference: row.segment1,
    period: row.period_name ?? "",
    description: row.description,
    transactionDate: row.creation_date,
    costCenter: row.segment3,
    metadata: { sourceTable: "PO_HEADERS", sourceSystem: "OracleEBS" },
  };
}

function mapApToSpendRecord(row: Record<string, string>): ErpSpendRecord {
  return {
    sourceId: row.invoice_id ?? "",
    amount: parseFloat(row.invoice_amount ?? "0"),
    currency: row.invoice_currency_code ?? "SAR",
    category: row.category_name ?? "goods",
    supplierName: row.vendor_name ?? "",
    supplierRegistrationNumber: row.vendor_registration_number,
    invoiceNumber: row.invoice_num,
    contractReference: row.po_number,
    period: row.gl_date ?? "",
    description: row.description,
    transactionDate: row.invoice_date,
    costCenter: row.segment3,
    taxAmount: parseFloat(row.tax_amount ?? "0"),
    metadata: { sourceTable: "AP_INVOICES", sourceSystem: "OracleEBS" },
  };
}

function mapVendorToSupplier(row: Record<string, string>): ErpSupplier {
  return {
    sourceId: row.vendor_id ?? "",
    name: row.vendor_name ?? "",
    registrationNumber: row.registration_number,
    taxId: row.tax_reference,
    locality: row.country === "SA" ? "local" : "non_local",
    country: row.country,
    city: row.city,
    isActive: row.enabled_flag === "Y",
    metadata: { sourceTable: "PO_VENDORS", sourceSystem: "OracleEBS" },
  };
}

function mapPoLineToProcurementLine(
  row: Record<string, string>,
): ErpProcurementLine {
  return {
    sourceId: `${row.po_header_id ?? ""}-${row.po_line_id ?? ""}`,
    purchaseOrderNumber: row.segment1 ?? "",
    supplierName: row.vendor_name ?? "",
    supplierRegistrationNumber: row.vendor_registration_number,
    lineAmount: parseFloat(row.amount ?? "0"),
    currency: row.currency_code ?? "SAR",
    category: row.category_name ?? "goods",
    description: row.description,
    quantity: parseInt(row.quantity ?? "0", 10),
    unitPrice: parseFloat(row.unit_price ?? "0"),
    unitOfMeasure: row.uom_code,
    orderDate: row.creation_date,
    deliveryDate: row.promised_date,
    period: row.period_name ?? "",
    costCenter: row.segment3,
    metadata: { sourceTable: "PO_LINES", sourceSystem: "OracleEBS" },
  };
}

export class OracleEbsConnector implements ErpConnector {
  private config: OracleConnectorConfig;

  constructor(config: OracleConnectorConfig) {
    this.config = config;
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.config.apiEndpoint) {
      return { success: false, message: "Oracle EBS endpoint غير مهيأ" };
    }
    try {
      const res = await fetch(`${this.config.apiEndpoint}/ords/_info`, {
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(this.config.timeoutMs ?? 10_000),
      });
      if (res.ok) {
        return { success: true, message: `Oracle EBS ${this.config.instanceName ?? ""} متصل` };
      }
      return {
        success: false,
        message: `Oracle EBS استجاب بـ ${res.status}`,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "فشل الاتصال";
      return { success: false, message: `Oracle EBS: ${msg}` };
    }
  }

  async fetchSpendRecords(since?: Date): Promise<ErpSpendRecord[]> {
    const records: ErpSpendRecord[] = [];
    const endpoint = `${this.config.apiEndpoint ?? ""}/ords/api/spend`;
    const url = new URL(endpoint);
    if (since) url.searchParams.set("since", since.toISOString().split("T")[0]!);

    const res = await fetch(url.toString(), {
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(this.config.timeoutMs ?? 30_000),
    });

    if (!res.ok) {
      throw new Error(`Oracle EBS fetchSpendRecords فشل: ${res.status}`);
    }

    const body: Record<string, unknown> = await res.json();
    const items = (body.items ?? body.data ?? []) as Record<string, string>[];

    for (const item of items) {
      const source = item.source_type ?? "PO";
      if (source === "AP") {
        records.push(mapApToSpendRecord(item));
      } else {
        records.push(mapPoToSpendRecord(item));
      }
    }

    return records;
  }

  async fetchSuppliers(since?: Date): Promise<ErpSupplier[]> {
    const endpoint = `${this.config.apiEndpoint ?? ""}/ords/api/suppliers`;
    const url = new URL(endpoint);
    if (since) url.searchParams.set("since", since.toISOString().split("T")[0]!);

    const res = await fetch(url.toString(), {
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(this.config.timeoutMs ?? 30_000),
    });

    if (!res.ok) {
      throw new Error(`Oracle EBS fetchSuppliers فشل: ${res.status}`);
    }

    const body: Record<string, unknown> = await res.json();
    const items = (body.items ?? body.data ?? []) as Record<string, string>[];
    return items.map(mapVendorToSupplier);
  }

  async fetchProcurementLines(since?: Date): Promise<ErpProcurementLine[]> {
    const endpoint = `${this.config.apiEndpoint ?? ""}/ords/api/procurement-lines`;
    const url = new URL(endpoint);
    if (since) url.searchParams.set("since", since.toISOString().split("T")[0]!);

    const res = await fetch(url.toString(), {
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(this.config.timeoutMs ?? 30_000),
    });

    if (!res.ok) {
      throw new Error(`Oracle EBS fetchProcurementLines فشل: ${res.status}`);
    }

    const body: Record<string, unknown> = await res.json();
    const items = (body.items ?? body.data ?? []) as Record<string, string>[];
    return items.map(mapPoLineToProcurementLine);
  }

  async getRateLimitStatus(): Promise<RateLimitStatus> {
    const endpoint = `${this.config.apiEndpoint ?? ""}/ords/api/rate-limit`;
    try {
      const res = await fetch(endpoint, {
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(5_000),
      });
      if (res.ok) {
        const remaining = parseInt(res.headers.get("X-RateLimit-Remaining") ?? "100", 10);
        const resetSeconds = parseInt(res.headers.get("X-RateLimit-Reset") ?? "60", 10);
        return {
          remaining: Number.isNaN(remaining) ? 100 : remaining,
          resetAt: new Date(Date.now() + (Number.isNaN(resetSeconds) ? 60 : resetSeconds) * 1000),
        };
      }
    } catch {
      // fallback
    }
    return { remaining: 100, resetAt: new Date(Date.now() + 60_000) };
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
    if (this.config.apiKey) {
      headers["X-API-Key"] = this.config.apiKey;
    }
    return headers;
  }
}
