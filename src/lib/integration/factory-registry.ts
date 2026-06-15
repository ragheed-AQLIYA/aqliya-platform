// ─── Factory Registry — Register All Known Provider Factories ───
// Called once at app startup. Registers adapters for AI, CRM, ERP,
// Storage, and Email providers into the ProviderRegistry.

import "server-only";
import { providerRegistry } from "./provider-registry";
import { IntegrationType } from "./types";
import type { ProviderFactory, ProviderConfig } from "./types";

// ═══════════════════════════════════════════════════
//  AI PROVIDER FACTORIES
// ═══════════════════════════════════════════════════

const openAIFactory: ProviderFactory = {
  async create(config: ProviderConfig) {
    const { createOpenAIProviderFromResolver } = await import(
      "@/lib/ai/providers/ai-provider-factory"
    );
    return createOpenAIProviderFromResolver(config.organizationId);
  },
};

const anthropicFactory: ProviderFactory = {
  async create(config: ProviderConfig) {
    const { createAnthropicProviderFromResolver } = await import(
      "@/lib/ai/providers/ai-provider-factory"
    );
    return createAnthropicProviderFromResolver(config.organizationId);
  },
};

const cloudAIFactory: ProviderFactory = {
  async create(config: ProviderConfig) {
    const { createCloudAIProviderFromResolver } = await import(
      "@/lib/ai/providers/ai-provider-factory"
    );
    return createCloudAIProviderFromResolver(config.organizationId);
  },
};

const ollamaFactory: ProviderFactory = {
  async create(_config: ProviderConfig) {
    const { LocalAIProvider } = await import("@/lib/ai/providers/local-provider");
    return new LocalAIProvider();
  },
};

const vllmFactory: ProviderFactory = {
  async create(config: ProviderConfig) {
    const { CloudAIProvider } = await import("@/lib/ai/providers/cloud-provider");
    const baseUrl =
      (config.configMetadata?.baseUrl as string) ??
      process.env.VLLM_BASE_URL ??
      "http://localhost:8000/v1";
    const model =
      (config.configMetadata?.model as string) ??
      process.env.VLLM_MODEL ??
      "default";
    return new CloudAIProvider({
      apiKey: config.credentials?.apiKey ?? "vllm",
      baseUrl,
      defaultModel: model,
      providerName: "vllm",
    });
  },
};

// ═══════════════════════════════════════════════════
//  CRM PROVIDER FACTORIES
// ═══════════════════════════════════════════════════

const hubspotFactory: ProviderFactory = {
  async create(config: ProviderConfig) {
    const { HubSpotConnector } = await import(
      "@/lib/sales/crm/hubspot-connector"
    );
    const { wrapCrmConnector } = await import("./adapters/crm-adapter");
    return wrapCrmConnector(new HubSpotConnector({
      apiKey: config.credentials?.value ?? config.credentials?.accessToken,
      accessToken: config.credentials?.accessToken,
      apiEndpoint: config.configMetadata?.apiEndpoint as string | undefined,
    }));
  },
};

const salesforceFactory: ProviderFactory = {
  async create(config: ProviderConfig) {
    const { SalesforceConnector } = await import(
      "@/lib/sales/crm/salesforce-connector"
    );
    const { wrapCrmConnector } = await import("./adapters/crm-adapter");
    return wrapCrmConnector(new SalesforceConnector({
      instanceUrl: (config.configMetadata?.apiEndpoint as string) ?? "",
      clientId: config.credentials?.clientId ?? "",
      accessToken: config.credentials?.value ?? config.credentials?.accessToken,
    }));
  },
};

// ═══════════════════════════════════════════════════
//  ERP PROVIDER FACTORIES
// ═══════════════════════════════════════════════════

const sapFactory: ProviderFactory = {
  async create(config: ProviderConfig) {
    const { SapConnector } = await import(
      "@/lib/local-content/erp/sap-connector"
    );
    const { wrapErpConnector } = await import("./adapters/erp-adapter");
    return wrapErpConnector(new SapConnector({
      apiEndpoint: (config.configMetadata?.apiEndpoint as string) ?? "",
      apiKey: config.credentials?.value ?? config.credentials?.apiKey,
    }));
  },
};

const oracleFactory: ProviderFactory = {
  async create(config: ProviderConfig) {
    const { OracleEbsConnector } = await import(
      "@/lib/local-content/erp/oracle-connector"
    );
    const { wrapErpConnector } = await import("./adapters/erp-adapter");
    return wrapErpConnector(new OracleEbsConnector({
      apiEndpoint: (config.configMetadata?.apiEndpoint as string) ?? "",
      apiKey: config.credentials?.value ?? config.credentials?.apiKey,
      apiSecret: config.credentials?.apiSecret,
    }));
  },
};

const dynamicsErpFactory: ProviderFactory = {
  async create(config: ProviderConfig) {
    const { DynamicsErpConnector } = await import(
      "@/lib/local-content/erp/dynamics-connector"
    );
    const { wrapErpConnector } = await import("./adapters/erp-adapter");
    return wrapErpConnector(new DynamicsErpConnector({
      apiEndpoint: (config.configMetadata?.apiEndpoint as string) ?? "",
      tenantId: config.credentials?.tenantId ?? config.credentials?.apiKey ?? "",
      clientId: config.credentials?.clientId ?? config.credentials?.apiSecret ?? "",
      clientSecret: config.credentials?.clientSecret ?? "",
    }));
  },
};

const odooErpFactory: ProviderFactory = {
  async create(config: ProviderConfig) {
    const { OdooErpConnector } = await import(
      "@/lib/local-content/erp/odoo-connector"
    );
    const { wrapErpConnector } = await import("./adapters/erp-adapter");
    return wrapErpConnector(
      new OdooErpConnector({
        apiEndpoint: (config.configMetadata?.apiEndpoint as string) ?? "",
        apiKey: config.credentials?.apiKey ?? config.credentials?.value,
      }),
    );
  },
};

// ═══════════════════════════════════════════════════
//  STORAGE PROVIDER FACTORIES
// ═══════════════════════════════════════════════════

const s3StorageFactory: ProviderFactory = {
  async create(config: ProviderConfig) {
    const { S3StorageProvider } = await import(
      "@/lib/platform/storage/s3-storage-provider"
    );
    const { wrapStorageProvider } = await import("./adapters/storage-adapter");
    const provider = new S3StorageProvider({
      endpoint: config.credentials?.endpoint ?? "",
      region: config.credentials?.region ?? "us-east-1",
      accessKeyId: config.credentials?.accessKeyId ?? config.credentials?.accessKey ?? "",
      secretAccessKey: config.credentials?.secretAccessKey ?? config.credentials?.secretKey ?? "",
      bucket: config.credentials?.bucket ?? "aqliya-storage",
      forcePathStyle: config.credentials?.forcePathStyle === "true",
    });
    return wrapStorageProvider(provider, "s3");
  },
};

const localStorageFactory: ProviderFactory = {
  async create(_config: ProviderConfig) {
    const { LocalStorageProvider } = await import(
      "@/lib/platform/storage/local-storage-provider"
    );
    const { wrapStorageProvider } = await import("./adapters/storage-adapter");
    return wrapStorageProvider(new LocalStorageProvider(), "local");
  },
};

// ═══════════════════════════════════════════════════
//  EMAIL PROVIDER FACTORIES
// ═══════════════════════════════════════════════════

const smtpFactory: ProviderFactory = {
  async create(config: ProviderConfig) {
    const { SmtpEmailProviderAdapter } = await import(
      "@/lib/platform/notification/email-provider-adapter"
    );
    return new SmtpEmailProviderAdapter({
      host: config.credentials?.host ?? (config.configMetadata?.host as string) ?? "",
      port: parseInt(config.credentials?.port ?? "587", 10),
      user: config.credentials?.user ?? (config.configMetadata?.user as string) ?? "",
      pass: config.credentials?.pass ?? (config.configMetadata?.pass as string) ?? "",
      from: config.credentials?.from ?? (config.configMetadata?.from as string) ?? "noreply@aqliya.ai",
      secure: config.credentials?.secure === "true",
    });
  },
};

// ═══════════════════════════════════════════════════
//  REGISTRATION
// ═══════════════════════════════════════════════════

/**
 * Register all known provider factories into the ProviderRegistry.
 * Safe to call multiple times — factories are replaced, not duplicated.
 */
export function registerAllFactories(): void {
  // ── AI Providers ──
  providerRegistry.register(IntegrationType.AI, "openai", openAIFactory);
  providerRegistry.register(IntegrationType.AI, "anthropic", anthropicFactory);
  providerRegistry.register(IntegrationType.AI, "cloud", cloudAIFactory);
  providerRegistry.register(IntegrationType.AI, "ollama", ollamaFactory);
  providerRegistry.register(IntegrationType.AI, "vllm", vllmFactory);

  // ── CRM Providers ──
  providerRegistry.register(IntegrationType.CRM, "hubspot", hubspotFactory);
  providerRegistry.register(IntegrationType.CRM, "salesforce", salesforceFactory);

  // ── ERP Providers ──
  providerRegistry.register(IntegrationType.ERP, "sap", sapFactory);
  providerRegistry.register(IntegrationType.ERP, "oracle", oracleFactory);
  providerRegistry.register(IntegrationType.ERP, "microsoft-dynamics", dynamicsErpFactory);
  providerRegistry.register(IntegrationType.ERP, "odoo", odooErpFactory);

  // ── Storage Providers ──
  providerRegistry.register(IntegrationType.STORAGE, "s3", s3StorageFactory);
  providerRegistry.register(IntegrationType.STORAGE, "minio", s3StorageFactory);
  providerRegistry.register(IntegrationType.STORAGE, "local", localStorageFactory);

  // ── Email Providers ──
  providerRegistry.register(IntegrationType.EMAIL, "smtp", smtpFactory);
}
