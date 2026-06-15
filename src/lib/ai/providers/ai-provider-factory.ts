// ─── AI Provider Factory — SecretResolver-backed Credential Resolution ───
// All AI provider credentials SHOULD be resolved through this factory,
// never read directly from process.env by provider code.
//
// Pattern: try SecretResolver → catch → fall back to process.env (env-based ctor)

import "server-only";
import { secretResolver, SecretPurpose } from "@/lib/integration/secret-resolver";
import { OpenAIProvider } from "./openai-provider";
import { AnthropicProvider } from "./anthropic-provider";
import { CloudAIProvider } from "./cloud-provider";
import type { AIProvider } from "../types";

/**
 * Create an OpenAI provider with SecretResolver-backed credential resolution.
 * Falls back to `new OpenAIProvider()` (process.env) when resolver is unavailable
 * or no TenantIntegration/vault entry exists for the organization.
 */
export async function createOpenAIProviderFromResolver(
  organizationId: string,
): Promise<OpenAIProvider> {
  const secretResult = await secretResolver
    .getIntegrationSecretByType(
      organizationId,
      "AI",
      "openai",
      SecretPurpose.AI_INFERENCE,
    )
    .catch(() => null);

  if (secretResult) {
    const apiKey = secretResult.credentials.apiKey ?? secretResult.credentials.value;
    if (apiKey) {
      return new OpenAIProvider({ apiKey });
    }
  }

  // Fall back to process.env
  return new OpenAIProvider();
}

/**
 * Create an Anthropic provider with SecretResolver-backed credential resolution.
 * Falls back to `new AnthropicProvider()` (process.env) when resolver is unavailable.
 */
export async function createAnthropicProviderFromResolver(
  organizationId: string,
): Promise<AnthropicProvider> {
  const secretResult = await secretResolver
    .getIntegrationSecretByType(
      organizationId,
      "AI",
      "anthropic",
      SecretPurpose.AI_INFERENCE,
    )
    .catch(() => null);

  if (secretResult) {
    const apiKey = secretResult.credentials.apiKey ?? secretResult.credentials.value;
    if (apiKey) {
      return new AnthropicProvider({ apiKey });
    }
  }

  // Fall back to process.env
  return new AnthropicProvider();
}

/**
 * Create a Cloud AI provider with SecretResolver-backed credential resolution.
 * Falls back to `new CloudAIProvider()` (process.env) when resolver is unavailable.
 */
export async function createCloudAIProviderFromResolver(
  organizationId: string,
): Promise<CloudAIProvider> {
  const secretResult = await secretResolver
    .getIntegrationSecretByType(
      organizationId,
      "AI",
      "cloud",
      SecretPurpose.AI_INFERENCE,
    )
    .catch(() => null);

  if (secretResult) {
    const apiKey = secretResult.credentials.apiKey ?? secretResult.credentials.value;
    const baseUrl = secretResult.credentials.baseUrl;
    return new CloudAIProvider({
      ...(apiKey ? { apiKey } : {}),
      ...(baseUrl ? { baseUrl } : {}),
    });
  }

  // Fall back to process.env
  return new CloudAIProvider();
}

/**
 * Create any AI provider by name with SecretResolver-backed resolution.
 * Useful when provider is selected dynamically at runtime.
 */
export async function createAnyAIProviderFromResolver(
  organizationId: string,
  providerName: "openai" | "anthropic" | "cloud",
): Promise<AIProvider> {
  switch (providerName) {
    case "openai":
      return createOpenAIProviderFromResolver(organizationId);
    case "anthropic":
      return createAnthropicProviderFromResolver(organizationId);
    case "cloud":
      return createCloudAIProviderFromResolver(organizationId);
  }
}
