export { type CrmConnector, type ConnectionTestResult, type RateLimitStatus } from "./connector";
export {
  type CrmAccount,
  type CrmContact,
  type CrmOpportunity,
  type CrmProvider,
  type ConflictPolicy,
  type SyncDirection,
  type SyncResourceType,
  type SyncStatus,
  type SyncOptions,
  type SyncResult,
  type SyncResourceResult,
  type FieldMapping,
  type ConnectionConfig,
  type HubSpotConfig,
  type SalesforceConfig,
  CrmConnectionError,
  CrmAuthError,
  CrmRateLimitError,
} from "./types";
export { HubSpotConnector } from "./hubspot-connector";
export { SalesforceConnector } from "./salesforce-connector";
export { createConnector } from "./connector-factory";
export {
  type MappingDirection,
  type MappedAccount,
  type MappedContact,
  type MappedOpportunity,
  applyAccountMapping,
  applyContactMapping,
  applyOpportunityMapping,
  getDefaultMappings,
  DEFAULT_HUBSPOT_ACCOUNT_MAPPINGS,
  DEFAULT_HUBSPOT_CONTACT_MAPPINGS,
  DEFAULT_HUBSPOT_OPPORTUNITY_MAPPINGS,
  DEFAULT_SALESFORCE_ACCOUNT_MAPPINGS,
  DEFAULT_SALESFORCE_CONTACT_MAPPINGS,
  DEFAULT_SALESFORCE_OPPORTUNITY_MAPPINGS,
} from "./field-mapping";
export {
  runSync,
} from "./sync-orchestrator";
export {
  createCrmConnection,
  updateCrmConnection,
  deleteCrmConnection,
  triggerSync,
  testCrmConnection,
  toggleSync,
  listCrmConnections,
  getCrmConnection,
  listSyncLogs,
} from "./actions";
