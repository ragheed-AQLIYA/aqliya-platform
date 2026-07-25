import "server-only";
import { providerRegistry } from "../provider-registry";
import { IntegrationType } from "../types";

import { openAIFactory, anthropicFactory, cloudAIFactory, ollamaFactory, vllmFactory } from "./ai";
import { hubspotFactory, salesforceFactory } from "./crm";
import { sapFactory, oracleFactory, dynamicsErpFactory, odooErpFactory } from "./erp";
import { s3StorageFactory, localStorageFactory } from "./storage";
import { smtpFactory } from "./email";

export function registerAllFactories(): void {
  providerRegistry.register(IntegrationType.AI, "openai", openAIFactory);
  providerRegistry.register(IntegrationType.AI, "anthropic", anthropicFactory);
  providerRegistry.register(IntegrationType.AI, "cloud", cloudAIFactory);
  providerRegistry.register(IntegrationType.AI, "ollama", ollamaFactory);
  providerRegistry.register(IntegrationType.AI, "vllm", vllmFactory);

  providerRegistry.register(IntegrationType.CRM, "hubspot", hubspotFactory);
  providerRegistry.register(IntegrationType.CRM, "salesforce", salesforceFactory);

  providerRegistry.register(IntegrationType.ERP, "sap", sapFactory);
  providerRegistry.register(IntegrationType.ERP, "oracle", oracleFactory);
  providerRegistry.register(IntegrationType.ERP, "microsoft-dynamics", dynamicsErpFactory);
  providerRegistry.register(IntegrationType.ERP, "odoo", odooErpFactory);

  providerRegistry.register(IntegrationType.STORAGE, "s3", s3StorageFactory);
  providerRegistry.register(IntegrationType.STORAGE, "minio", s3StorageFactory);
  providerRegistry.register(IntegrationType.STORAGE, "local", localStorageFactory);

  providerRegistry.register(IntegrationType.EMAIL, "smtp", smtpFactory);
}
