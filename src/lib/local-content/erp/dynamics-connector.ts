// Dynamics 365 Finance & Operations ERP Connector (v0.1)
// Uses Dynamics OData REST API pattern with Azure AD OAuth2 authentication.
//
// Endpoints:
//   - Spend records:  /api/services/SpendService/getSpendRecords
//   - Suppliers:      /api/services/SupplierService/getSuppliers
//   - Procurement:    /api/services/ProcurementService/getProcurementLines
//
// Auth: OAuth2 client credentials (tenantId + clientId + clientSecret)
// Base URL: https://<org>.operations.dynamics.com

import "server-only";

import type { ErpConnector, RateLimitStatus } from "./connector";
import type {
  ErpSpendRecord,
  ErpSupplier,
  ErpProcurementLine,
} from "./types";

export interface DynamicsConnectorConfig {
  apiEndpoint: string;
  tenantId: string;
  clientId: string;
  clientSecret: string;
  environment?: string;
  company?: string;
  timeoutMs?: number;
}

const DEFAULTS = {
  timeoutMs: 30_000,
  company: "USMF",
};

interface OAuthTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface DynamicsApiResponse<T> {
  value?: T[];
  error?: { message: string };
}

function mapDynamicsSpendRecord(row: Record<string, unknown>): ErpSpendRecord {
  return {
    sourceId: String(row.PurchaseOrderNumber ?? row.PurchId ?? ""),
    amount: Number(row.InvoiceAmount ?? row.Amount ?? 0),
    currency: String(row.CurrencyCode ?? "SAR"),
    category: String(row.ProcurementCategory ?? row.Category ?? "goods"),
    supplierName: String(row.VendorName ?? row.Vendor ?? ""),
    supplierRegistrationNumber: String(row.VendorRegistrationNumber ?? ""),
    invoiceNumber: String(row.InvoiceNumber ?? ""),
    contractReference: String(row.PurchaseAgreementId ?? ""),
    period: String(row.Period ?? row.FiscalPeriod ?? ""),
    description: String(row.Description ?? ""),
    transactionDate: String(row.TransactionDate ?? row.InvoiceDate ?? ""),
    costCenter: String(row.CostCenter ?? ""),
    taxAmount: Number(row.TaxAmount ?? 0),
    metadata: { sourceSystem: "Dynamics365FO" },
  };
}

function mapDynamicsSupplier(row: Record<string, unknown>): ErpSupplier {
  return {
    sourceId: String(row.VendorAccountNumber ?? row.VendId ?? ""),
    name: String(row.VendorName ?? row.Name ?? ""),
    registrationNumber: String(row.RegistrationNumber ?? row.CommercialId ?? ""),
    taxId: String(row.TaxId ?? ""),
    locality: String(row.Country ?? "") === "SA" ? "local" : "non_local",
    country: String(row.Country ?? ""),
    city: String(row.City ?? ""),
    isActive: row.IsActive !== false && row.Blocked !== "Yes",
    metadata: { sourceSystem: "Dynamics365FO" },
  };
}

function mapDynamicsProcurementLine(
  row: Record<string, unknown>,
): ErpProcurementLine {
  return {
    sourceId: `${String(row.PurchaseOrderNumber ?? "")}-${String(row.LineNumber ?? "0")}`,
    purchaseOrderNumber: String(row.PurchaseOrderNumber ?? ""),
    supplierName: String(row.VendorName ?? ""),
    supplierRegistrationNumber: String(row.VendorRegistrationNumber ?? ""),
    lineAmount: Number(row.LineAmount ?? row.Amount ?? 0),
    currency: String(row.CurrencyCode ?? "SAR"),
    category: String(row.ProcurementCategory ?? row.Category ?? "goods"),
    description: String(row.Description ?? ""),
    quantity: Number(row.Quantity ?? 0),
    unitPrice: Number(row.UnitPrice ?? 0),
    unitOfMeasure: String(row.UnitOfMeasure ?? ""),
    orderDate: String(row.OrderDate ?? ""),
    deliveryDate: String(row.DeliveryDate ?? ""),
    period: String(row.Period ?? ""),
    costCenter: String(row.CostCenter ?? ""),
    projectReference: String(row.ProjectId ?? ""),
    metadata: { sourceSystem: "Dynamics365FO" },
  };
}

export class DynamicsErpConnector implements ErpConnector {
  private config: DynamicsConnectorConfig;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(config: DynamicsConnectorConfig) {
    this.config = {
      ...DEFAULTS,
      ...config,
    };
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.config.apiEndpoint) {
      return { success: false, message: "Dynamics endpoint غير مهيأ" };
    }
    try {
      const token = await this.getAccessToken();
      const res = await fetch(
        `${this.config.apiEndpoint}/api/services/HealthService/ping`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(this.config.timeoutMs ?? 10_000),
        },
      );
      if (res.ok) {
        return {
          success: true,
          message: `Dynamics 365 ${this.config.environment ?? ""} متصل`,
        };
      }
      return {
        success: false,
        message: `Dynamics 365 استجاب بـ ${res.status}`,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "فشل الاتصال";
      return { success: false, message: `Dynamics 365: ${msg}` };
    }
  }

  async fetchSpendRecords(since?: Date): Promise<ErpSpendRecord[]> {
    const token = await this.getAccessToken();
    const endpoint = `${this.config.apiEndpoint}/api/services/SpendService/getSpendRecords`;
    const url = new URL(endpoint);

    if (since) url.searchParams.set("since", since.toISOString());
    if (this.config.company) url.searchParams.set("company", this.config.company);

    const res = await fetch(url.toString(), {
      headers: this.getAuthHeaders(token),
      signal: AbortSignal.timeout(this.config.timeoutMs ?? DEFAULTS.timeoutMs),
    });

    if (!res.ok) {
      throw new Error(`Dynamics fetchSpendRecords فشل: ${res.status}`);
    }

    const body = (await res.json()) as DynamicsApiResponse<Record<string, unknown>>;

    if (body.error) {
      throw new Error(`Dynamics API خطأ: ${body.error.message}`);
    }

    return (body.value ?? []).map(mapDynamicsSpendRecord);
  }

  async fetchSuppliers(since?: Date): Promise<ErpSupplier[]> {
    const token = await this.getAccessToken();
    const endpoint = `${this.config.apiEndpoint}/api/services/SupplierService/getSuppliers`;
    const url = new URL(endpoint);

    if (since) url.searchParams.set("since", since.toISOString());
    if (this.config.company) url.searchParams.set("company", this.config.company);

    const res = await fetch(url.toString(), {
      headers: this.getAuthHeaders(token),
      signal: AbortSignal.timeout(this.config.timeoutMs ?? DEFAULTS.timeoutMs),
    });

    if (!res.ok) {
      throw new Error(`Dynamics fetchSuppliers فشل: ${res.status}`);
    }

    const body = (await res.json()) as DynamicsApiResponse<Record<string, unknown>>;

    if (body.error) {
      throw new Error(`Dynamics API خطأ: ${body.error.message}`);
    }

    return (body.value ?? []).map(mapDynamicsSupplier);
  }

  async fetchProcurementLines(since?: Date): Promise<ErpProcurementLine[]> {
    const token = await this.getAccessToken();
    const endpoint = `${this.config.apiEndpoint}/api/services/ProcurementService/getProcurementLines`;
    const url = new URL(endpoint);

    if (since) url.searchParams.set("since", since.toISOString());
    if (this.config.company) url.searchParams.set("company", this.config.company);

    const res = await fetch(url.toString(), {
      headers: this.getAuthHeaders(token),
      signal: AbortSignal.timeout(this.config.timeoutMs ?? DEFAULTS.timeoutMs),
    });

    if (!res.ok) {
      throw new Error(`Dynamics fetchProcurementLines فشل: ${res.status}`);
    }

    const body = (await res.json()) as DynamicsApiResponse<Record<string, unknown>>;

    if (body.error) {
      throw new Error(`Dynamics API خطأ: ${body.error.message}`);
    }

    return (body.value ?? []).map(mapDynamicsProcurementLine);
  }

  async getRateLimitStatus(): Promise<RateLimitStatus> {
    try {
      const token = await this.getAccessToken();
      const res = await fetch(
        `${this.config.apiEndpoint}/api/services/ProcurementService/getProcurementLines?\$top=1`,
        {
          headers: this.getAuthHeaders(token),
          signal: AbortSignal.timeout(5_000),
        },
      );
      if (res.ok) {
        const remaining = parseInt(
          res.headers.get("x-ratelimit-remaining") ?? "100",
          10,
        );
        const resetSeconds = parseInt(
          res.headers.get("x-ratelimit-reset") ?? "60",
          10,
        );
        return {
          remaining: Number.isNaN(remaining) ? 100 : remaining,
          resetAt: new Date(
            Date.now() +
              (Number.isNaN(resetSeconds) ? 60 : resetSeconds) * 1000,
          ),
        };
      }
    } catch {
      // fallback
    }
    return { remaining: 100, resetAt: new Date(Date.now() + 60_000) };
  }

  // ─── OAuth2 Helpers ───

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60_000) {
      return this.accessToken;
    }
    return this.refreshAccessToken();
  }

  private async refreshAccessToken(): Promise<string> {
    const tokenUrl = `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`;

    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      scope: `${this.config.apiEndpoint}/.default`,
    });

    const res = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      const errorBody = await res.text().catch(() => "");
      throw new Error(
        `Dynamics OAuth2 فشل: ${res.status} ${errorBody.slice(0, 200)}`,
      );
    }

    const tokenResponse = (await res.json()) as OAuthTokenResponse;
    this.accessToken = tokenResponse.access_token;
    this.tokenExpiresAt = Date.now() + tokenResponse.expires_in * 1000;

    return this.accessToken!;
  }

  private getAuthHeaders(token: string): Record<string, string> {
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }
}
