import "server-only";

/** Purpose of secret resolution — enables observability, cost tracking, and audit provenance */
export enum SecretPurpose {
  CRM_SYNC      = "CRM_SYNC",
  ERP_SYNC      = "ERP_SYNC",
  EMAIL_SEND    = "EMAIL_SEND",
  AI_INFERENCE  = "AI_INFERENCE",
  AI_EMBED      = "AI_EMBED",
  AI_EVALUATE   = "AI_EVALUATE",
  HEALTH_CHECK  = "HEALTH_CHECK",
  STORAGE_READ  = "STORAGE_READ",
  STORAGE_WRITE = "STORAGE_WRITE",
  WEBHOOK_SEND  = "WEBHOOK_SEND",
}

/** Where the resolved credentials originated */
export type SecretSource = "vault" | "cache" | "legacy-crm" | "legacy-erp" | "legacy-env";

/** Result of a successful secret resolution */
export interface SecretResult {
  credentials: Record<string, string>;
  source: SecretSource;
  vaultEntryId?: string;
  version: number;
  resolvedAt: Date;
  rotatedAt?: Date;
  cacheHit: boolean;
}

/** Event types for governance audit trail */
export type GovernanceSecretEvent =
  | "SECRET_CREATED"
  | "SECRET_ROTATED"
  | "SECRET_REVOKED"
  | "SECRET_VIEWED";

/** Event types for operational telemetry */
export type OperationalSecretEvent =
  | "SECRET_USED"
  | "SECRET_FAILED";

export interface SecretResolver {
  /** Resolve credentials for a specific integration by ID.
   *  `purpose` enables provenance tracking in audit events and telemetry.
   *  Throws if integration not found or secret resolution fails. */
  getIntegrationSecret(
    organizationId: string,
    integrationId: string,
    purpose: SecretPurpose,
    actorId?: string,
  ): Promise<SecretResult>;

  /** Resolve by type+provider for factories that don't have integrationId yet.
   *  Falls back to legacy CrmConnection/ErpConnection for backward compat. */
  getIntegrationSecretByType(
    organizationId: string,
    type: string,
    provider: string,
    purpose: SecretPurpose,
    actorId?: string,
  ): Promise<SecretResult>;
}

export const GOVERNANCE_PRODUCT_KEY = "integration-layer";

export const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes
