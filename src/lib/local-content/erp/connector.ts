// ERP Connector Interface
// All ERP providers implement this interface for uniform access.

import type { ErpSpendRecord, ErpSupplier, ErpProcurementLine } from "./types";

export interface RateLimitStatus {
  remaining: number;
  resetAt: Date;
}

export interface ErpConnector {
  testConnection(): Promise<{ success: boolean; message: string }>;
  fetchSpendRecords(since?: Date): Promise<ErpSpendRecord[]>;
  fetchSuppliers(since?: Date): Promise<ErpSupplier[]>;
  fetchProcurementLines(since?: Date): Promise<ErpProcurementLine[]>;
  getRateLimitStatus(): Promise<RateLimitStatus>;
}
