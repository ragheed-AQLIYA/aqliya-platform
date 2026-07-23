/**
 * Sales Intelligence Provider Factory
 *
 * Creates and configures all sales intelligence connectors.
 * Integrates with the existing integration layer (failover, health checks, circuit breaker).
 */
import "server-only";
import type { SalesIntelligenceProvider, SalesIntelProviderId } from "./types";
import { ApolloConnector } from "./apollo/apollo-connector";
import { OceanConnector } from "./ocean/ocean-connector";
import { ClayConnector } from "./clay/clay-connector";
import { SmartLeadConnector } from "./smartlead/smartlead-connector";
import { LinkedInConnector } from "./linkedin/linkedin-connector";

const factoryRegistry = new Map<
  SalesIntelProviderId,
  (config: Record<string, unknown>) => SalesIntelligenceProvider
>();

// ── Register all built-in providers ──

factoryRegistry.set("apollo", (config) => {
  const apiKey = (config.apiKey as string) ?? process.env.APOLLO_API_KEY;
  if (!apiKey) throw new Error("Apollo API key not configured");
  return new ApolloConnector({ apiKey });
});

factoryRegistry.set("ocean", (config) => {
  const apiKey = (config.apiKey as string) ?? process.env.OCEAN_API_KEY;
  if (!apiKey) throw new Error("Ocean.io API key not configured");
  return new OceanConnector({ apiKey });
});

factoryRegistry.set("clay", (config) => {
  const apiKey = (config.apiKey as string) ?? process.env.CLAY_API_KEY;
  if (!apiKey) throw new Error("Clay API key not configured");
  return new ClayConnector({ apiKey });
});

factoryRegistry.set("smartlead", (config) => {
  const apiKey =
    (config.apiKey as string) ?? process.env.SMARTLEAD_API_KEY;
  if (!apiKey) throw new Error("SmartLead API key not configured");
  return new SmartLeadConnector({ apiKey });
});

factoryRegistry.set("linkedin", (config) => {
  const apiKey =
    (config.apiKey as string) ?? process.env.LINKEDIN_API_KEY;
  if (!apiKey) throw new Error("LinkedIn API key not configured");
  return new LinkedInConnector({
    apiKey,
    baseUrl: config.baseUrl as string | undefined,
  });
});

// ── Public API ──

export function createSalesIntelProvider(
  providerId: SalesIntelProviderId,
  config?: Record<string, unknown>,
): SalesIntelligenceProvider {
  const factory = factoryRegistry.get(providerId);
  if (!factory) {
    throw new Error(
      `Sales intelligence provider "${providerId}" not registered. Available: ${Array.from(factoryRegistry.keys()).join(", ")}`,
    );
  }
  return factory(config ?? {});
}

export function listRegisteredProviders(): SalesIntelProviderId[] {
  return Array.from(factoryRegistry.keys());
}

export function isProviderRegistered(
  providerId: string,
): providerId is SalesIntelProviderId {
  return factoryRegistry.has(providerId as SalesIntelProviderId);
}

// ── Re-exports ──

export { ApolloConnector } from "./apollo/apollo-connector";
export { OceanConnector } from "./ocean/ocean-connector";
export { ClayConnector } from "./clay/clay-connector";
export { SmartLeadConnector } from "./smartlead/smartlead-connector";
export { LinkedInConnector } from "./linkedin/linkedin-connector";
export { BaseApiKeyConnector } from "./base-connector";
export * from "./types";
