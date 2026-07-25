import type { ProviderFactory, ProviderConfig } from "../types";

export const hubspotFactory: ProviderFactory = {
  async create(config: ProviderConfig) {
    const { HubSpotConnector } = await import(
      "@/lib/sales/crm/hubspot-connector"
    );
    const { wrapCrmConnector } = await import("../adapters/crm-adapter");
    return wrapCrmConnector(new HubSpotConnector({
      apiKey: config.credentials?.value ?? config.credentials?.accessToken,
      accessToken: config.credentials?.accessToken,
      apiEndpoint: config.configMetadata?.apiEndpoint as string | undefined,
    }));
  },
};

export const salesforceFactory: ProviderFactory = {
  async create(config: ProviderConfig) {
    const { SalesforceConnector } = await import(
      "@/lib/sales/crm/salesforce-connector"
    );
    const { wrapCrmConnector } = await import("../adapters/crm-adapter");
    return wrapCrmConnector(new SalesforceConnector({
      instanceUrl: (config.configMetadata?.apiEndpoint as string) ?? "",
      clientId: config.credentials?.clientId ?? "",
      accessToken: config.credentials?.value ?? config.credentials?.accessToken,
    }));
  },
};
