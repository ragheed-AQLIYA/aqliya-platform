// ─── CRM Sync shared types (S7-03) ───

export type CrmProvider = "hubspot" | "salesforce" | "apollo" | "custom";

export type SyncDirection = "import" | "export";

export type SyncResourceType = "account" | "contact" | "opportunity" | "interaction";

export type SyncStatus = "running" | "success" | "partial" | "failed";

export type ConflictPolicy = "crm_wins" | "local_wins" | "manual";

// ─── External CRM DTOs ───

export interface CrmAccount {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  description?: string;
  ownerEmail?: string;
  ownerName?: string;
  createdAt: string;
  updatedAt: string;
  raw?: Record<string, unknown>;
}

export interface CrmContact {
  id: string;
  accountId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  title?: string;
  ownerEmail?: string;
  createdAt: string;
  updatedAt: string;
  raw?: Record<string, unknown>;
}

export interface CrmOpportunity {
  id: string;
  accountId: string;
  name: string;
  amount?: number;
  currency?: string;
  stage?: string;
  probability?: number;
  closeDate?: string;
  ownerEmail?: string;
  ownerName?: string;
  createdAt: string;
  updatedAt: string;
  raw?: Record<string, unknown>;
}

// ─── Connection config ───

export interface HubSpotConfig {
  apiKey?: string;
  accessToken?: string;
  apiEndpoint?: string;
}

export interface SalesforceConfig {
  instanceUrl: string;
  clientId: string;
  clientSecret?: string;
  username?: string;
  password?: string;
  accessToken?: string;
  refreshToken?: string;
  apiVersion?: string;
}

export type ConnectionConfig = HubSpotConfig | SalesforceConfig | Record<string, string>;

// ─── Sync options ───

export interface SyncOptions {
  resourceTypes?: SyncResourceType[];
  since?: Date;
  conflictPolicy?: ConflictPolicy;
  dryRun?: boolean;
}

// ─── Sync result ───

export interface SyncResult {
  connectionId: string;
  organizationId: string;
  startedAt: string;
  completedAt: string;
  overallStatus: SyncStatus;
  resources: SyncResourceResult[];
  error?: string;
}

export interface SyncResourceResult {
  resourceType: SyncResourceType;
  direction: SyncDirection;
  status: SyncStatus;
  totalRecords: number;
  createdRecords: number;
  updatedRecords: number;
  failedRecords: number;
  skippedRecords: number;
  syncLogId: string;
  errorDetails?: string;
  requiresReview: boolean;
}

// ─── Field mapping ───

export interface FieldMapping {
  salesField: string;
  crmField: string;
  transform?: string;
}

export interface FieldMappingConfig {
  mappings: FieldMapping[];
  conflictPolicy: ConflictPolicy;
}

// ─── Pipeline stage alignment ───

export interface StageMapping {
  crmStage: string;
  salesStage: string;
  probability?: number;
}

// ─── Connector errors ───

export class CrmConnectionError extends Error {
  constructor(
    message: string,
    public provider: CrmProvider,
    public statusCode?: number,
  ) {
    super(message);
    this.name = "CrmConnectionError";
  }
}

export class CrmAuthError extends CrmConnectionError {
  constructor(message: string, provider: CrmProvider) {
    super(message, provider, 401);
    this.name = "CrmAuthError";
  }
}

export class CrmRateLimitError extends CrmConnectionError {
  constructor(
    message: string,
    provider: CrmProvider,
    public retryAfterSeconds?: number,
  ) {
    super(message, provider, 429);
    this.name = "CrmRateLimitError";
  }
}
