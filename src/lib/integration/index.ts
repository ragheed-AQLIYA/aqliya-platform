// ─── Integration Abstraction Layer — Public API (Sprint 1) ───
// Export everything needed to consume the integration layer.
// Products should import from this index, not from individual files.

export {
  type IntegrationRecord,
  type IntegrationSource,
  type ResolvedIntegration,
  resolveIntegrations,
  resolveBestIntegration,
  resolveIntegrationById,
  checkIntegrationHealth,
} from "./resolver";

export {
  IntegrationType,
  IntegrationStatus,
  AI_PROVIDERS,
  CRM_PROVIDERS,
  ERP_PROVIDERS,
  STORAGE_PROVIDERS,
  EMAIL_PROVIDERS,
  WEBHOOK_PROVIDERS,
  type AIProviderId,
  type CRMProviderId,
  type ERPProviderId,
  type StorageProviderId,
  type EmailProviderId,
  type WebhookProviderId,
  type AnyProviderId,
  type TenantIntegrationData,
  type ProviderConfig,
  type ProviderFactory,
  type ProviderRegistry,
  type ResolvedProvider,
  type ProviderHealth,
  type ConnectionTestResult,
  type HealthCheckResult,
  type AIProvider,
  type CRMProvider,
  type ERPProvider,
  type StorageProvider,
  type EmailProvider,
  type WebhookProvider,
  type TenantIntegrationCreateInput,
  type TenantIntegrationUpdateInput,
} from "./types";

export {
  SecretPurpose,
  type SecretSource,
  type SecretResult,
  type SecretResolver,
  type GovernanceSecretEvent,
  type OperationalSecretEvent,
  secretResolver,
  invalidateSecretCache,
  getSecretCacheSize,
  clearSecretCache,
} from "./secret-resolver";

export {
  incrementCounter,
  getCounter,
  getAllCounters,
  resetCounters,
  type MetricLabels,
  type MetricCounter,
} from "./metrics";
