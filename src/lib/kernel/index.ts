export type { Principal, TenantContext, KernelResult, PaginatedResult, KernelHealth, KernelHealthReport, ProductRoute, ProductSchema } from "./types";
export type { PrincipalRole, ResourceType, AccessAction } from "./types";

export type { IIdentityService, CurrentUserInfo } from "./contracts/identity";
export type { ITenantService, TenantValidationResult } from "./contracts/tenant";
export type { IWorkflowEngine, WorkflowTransitionResult, WorkflowTemplate, WorkflowTransitionAction } from "./contracts/workflow";
export type { IPolicyEngine, PolicyEvaluationRequest, PolicyEvaluationResult } from "./contracts/policy";
export type { IEvidenceService, EvidenceItem, CreateEvidenceInput } from "./contracts/evidence";
export type { IAIGateway, AIRequest, AIResponse, AIProviderInfo, AIProvider, AITaskType } from "./contracts/ai-gateway";
export type { IEventBus, DomainEvent, EventHandler, EventDomain } from "./contracts/event-bus";
export type { IAuditLedger, AuditEntry } from "./contracts/audit-ledger";
export type { INotificationService, NotificationMessage, NotificationPreferences, NotificationChannel, NotificationPriority } from "./contracts/notification";
export type { IFilesService, FileMetadata } from "./contracts/files";
export type { ISearchService, SearchResult } from "./contracts/search";
export type { IKnowledgeService, KnowledgeItem } from "./contracts/knowledge";
export type { IAutomationService, AutomationRule, AutomationRun, AutomationTrigger } from "./contracts/automation";
export type { ISchedulingService, ScheduledJob, ScheduleFrequency } from "./contracts/scheduling";
export type { IFeatureFlagService, FeatureFlag, FlagVariant } from "./contracts/feature-flags";
export type { ISecretsVault, SecretValue } from "./contracts/secrets";
export type { IEncryptionService } from "./contracts/encryption";
export type { ICacheLayer, CacheEntry } from "./contracts/cache";

export type { ProductPlugin, PluginDependencies } from "./plugin/product-plugin";
export { ProductRegistry } from "./plugin/product-registry";

export { Kernel, initializeKernel } from "./bootstrap";
