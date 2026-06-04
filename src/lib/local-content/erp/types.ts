// ERP Integration types and DTOs

export type ErpProvider = "sap" | "oracle" | "microsoft-dynamics" | "csv-upload" | "custom";

export type ErpConnectionType = "api" | "file_drop" | "sftp" | "custom";

export type ErpSyncDirection = "import" | "export";

export type ErpSyncStatus = "running" | "success" | "partial" | "failed";

export type ErpImportBatchStatus =
  | "pending"
  | "validated"
  | "needs_review"
  | "approved"
  | "rejected"
  | "imported";

export type ImportSourceType = "api" | "csv" | "excel" | "sftp" | "manual";

export interface ErpSpendRecord {
  sourceId: string;
  amount: number;
  currency: string;
  category: string;
  supplierName: string;
  supplierRegistrationNumber?: string;
  invoiceNumber?: string;
  contractReference?: string;
  period: string;
  description?: string;
  transactionDate?: string;
  costCenter?: string;
  taxAmount?: number;
  metadata?: Record<string, unknown>;
}

export interface ErpSupplier {
  sourceId: string;
  name: string;
  registrationNumber?: string;
  taxId?: string;
  locality?: string;
  ownershipType?: string;
  country?: string;
  city?: string;
  isActive: boolean;
  metadata?: Record<string, unknown>;
}

export interface ErpProcurementLine {
  sourceId: string;
  purchaseOrderNumber: string;
  supplierName: string;
  supplierRegistrationNumber?: string;
  lineAmount: number;
  currency: string;
  category: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  unitOfMeasure?: string;
  orderDate?: string;
  deliveryDate?: string;
  period: string;
  costCenter?: string;
  projectReference?: string;
  metadata?: Record<string, unknown>;
}

export interface ErpConnectionConfig {
  id: string;
  organizationId: string;
  provider: ErpProvider;
  label: string;
  connectionType: ErpConnectionType;
  apiEndpoint?: string;
  syncEnabled: boolean;
  syncIntervalMin?: number;
  fieldMapping?: Record<string, string>;
  sourceSystem?: string;
  defaultCurrency: string;
  metadata?: Record<string, unknown>;
}

export interface ColumnMapping {
  sourceField: string;
  targetField: string;
  transform?: string;
  required?: boolean;
  defaultValue?: string;
}

export interface ParsedImportRow<T = Record<string, unknown>> {
  rowNumber: number;
  data: T;
  errors: string[];
  warnings: string[];
}

export interface FileImportResult<T = Record<string, unknown>> {
  totalRows: number;
  validRows: ParsedImportRow<T>[];
  errorRows: ParsedImportRow<T>[];
  fileHash: string;
  headers: string[];
  columnMapping: ColumnMapping[];
}

export interface ImportValidationFlag {
  rowNumber: number;
  field: string;
  reason: string;
  severity: "error" | "warning";
}

export interface RecordIssue {
  rowNumber: number;
  field: string;
  issue: string;
  severity: "error" | "warning";
}

export interface PipelineResult {
  batchId: string;
  connectionId: string;
  status: ErpImportBatchStatus;
  totalRecords: number;
  importedRecords: number;
  failedRecords: number;
  issues: RecordIssue[];
  syncLogId: string;
}

export interface ErpConnectorHealth {
  success: boolean;
  message: string;
  rateLimitRemaining?: number;
  rateLimitResetAt?: Date;
}
