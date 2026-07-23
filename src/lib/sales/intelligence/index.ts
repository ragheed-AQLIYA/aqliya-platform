/**
 * Sales Intelligence Module — Barrel Export
 *
 * Provides: Apollo, Ocean, Clay, SmartLead, LinkedIn connectors
 * plus webhook receiver and OAuth2 infrastructure.
 */
export {
  createSalesIntelProvider,
  listRegisteredProviders,
  isProviderRegistered,
  ApolloConnector,
  OceanConnector,
  ClayConnector,
  SmartLeadConnector,
  LinkedInConnector,
  BaseApiKeyConnector,
} from "./factory";

export type {
  SalesIntelligenceProvider,
  SalesIntelProviderId,
  SalesIntelProviderFactory,
  EnrichedCompany,
  EnrichedContact,
  CompanySearchCriteria,
  ContactSearchCriteria,
  WaterfallEnrichmentRequest,
  WaterfallEnrichmentResult,
  OutreachCampaign,
  OutreachStep,
  OutreachEvent,
} from "./types";

export {
  receiveWebhook,
  verifySignature,
  registerWebhookHandler,
  registerWildcardHandler,
  convertToOutreachEvent,
} from "./webhook/receiver";

export type { WebhookProvider, WebhookConfig, WebhookEventPayload } from "./webhook/receiver";

export {
  buildAuthorizationUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  OAUTH2_PROVIDERS,
} from "./oauth/oauth2-client";

export type { OAuth2Config, OAuth2Tokens, AuthorizationUrlResult } from "./oauth/oauth2-client";
