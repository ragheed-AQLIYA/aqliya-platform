import type { ProviderFactory, ProviderConfig } from "../types";

export const sapFactory: ProviderFactory = {
  async create(config: ProviderConfig) {
    const { SapConnector } = await import(
      "@/lib/local-content/erp/sap-connector"
    );
    const { wrapErpConnector } = await import("../adapters/erp-adapter");
    return wrapErpConnector(new SapConnector({
      apiEndpoint: (config.configMetadata?.apiEndpoint as string) ?? "",
      apiKey: config.credentials?.value ?? config.credentials?.apiKey,
    }));
  },
};

export const oracleFactory: ProviderFactory = {
  async create(config: ProviderConfig) {
    const { OracleEbsConnector } = await import(
      "@/lib/local-content/erp/oracle-connector"
    );
    const { wrapErpConnector } = await import("../adapters/erp-adapter");
    return wrapErpConnector(new OracleEbsConnector({
      apiEndpoint: (config.configMetadata?.apiEndpoint as string) ?? "",
      apiKey: config.credentials?.value ?? config.credentials?.apiKey,
      apiSecret: config.credentials?.apiSecret,
    }));
  },
};

export const dynamicsErpFactory: ProviderFactory = {
  async create(config: ProviderConfig) {
    const { DynamicsErpConnector } = await import(
      "@/lib/local-content/erp/dynamics-connector"
    );
    const { wrapErpConnector } = await import("../adapters/erp-adapter");
    return wrapErpConnector(new DynamicsErpConnector({
      apiEndpoint: (config.configMetadata?.apiEndpoint as string) ?? "",
      tenantId: config.credentials?.tenantId ?? config.credentials?.apiKey ?? "",
      clientId: config.credentials?.clientId ?? config.credentials?.apiSecret ?? "",
      clientSecret: config.credentials?.clientSecret ?? "",
    }));
  },
};

export const odooErpFactory: ProviderFactory = {
  async create(config: ProviderConfig) {
    const { OdooErpConnector } = await import(
      "@/lib/local-content/erp/odoo-connector"
    );
    const { wrapErpConnector } = await import("../adapters/erp-adapter");
    return wrapErpConnector(
      new OdooErpConnector({
        apiEndpoint: (config.configMetadata?.apiEndpoint as string) ?? "",
        apiKey: config.credentials?.apiKey ?? config.credentials?.value,
      }),
    );
  },
};
