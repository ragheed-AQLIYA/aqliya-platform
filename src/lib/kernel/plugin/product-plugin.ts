import type { IIdentityService } from "../contracts/identity";
import type { ITenantService } from "../contracts/tenant";
import type { IWorkflowEngine } from "../contracts/workflow";
import type { IPolicyEngine } from "../contracts/policy";
import type { IEvidenceService } from "../contracts/evidence";
import type { IAIGateway } from "../contracts/ai-gateway";
import type { IEventBus } from "../contracts/event-bus";
import type { IAuditLedger } from "../contracts/audit-ledger";
import type { INotificationService } from "../contracts/notification";
import type { IFilesService } from "../contracts/files";
import type { ISearchService } from "../contracts/search";
import type { IKnowledgeService } from "../contracts/knowledge";
import type { IAutomationService } from "../contracts/automation";
import type { ISchedulingService } from "../contracts/scheduling";
import type { IFeatureFlagService } from "../contracts/feature-flags";
import type { ISecretsVault } from "../contracts/secrets";
import type { IEncryptionService } from "../contracts/encryption";
import type { ICacheLayer } from "../contracts/cache";
import type { KernelHealth, ProductRoute, ProductSchema } from "../types";

export interface PluginDependencies {
  identity?: IIdentityService;
  tenant?: ITenantService;
  workflow?: IWorkflowEngine;
  policy?: IPolicyEngine;
  evidence?: IEvidenceService;
  ai?: IAIGateway;
  events?: IEventBus;
  audit?: IAuditLedger;
  notification?: INotificationService;
  files?: IFilesService;
  search?: ISearchService;
  knowledge?: IKnowledgeService;
  automation?: IAutomationService;
  scheduling?: ISchedulingService;
  featureFlags?: IFeatureFlagService;
  secrets?: ISecretsVault;
  encryption?: IEncryptionService;
  cache?: ICacheLayer;
}

export interface ProductPlugin {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly requiredCapabilities: string[];

  dependencies: PluginDependencies;

  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  healthCheck(): Promise<{ status: KernelHealth }>;
  getRoutes(): ProductRoute[];
  getSchemas(): ProductSchema[];
}
