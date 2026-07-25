import type { ProviderFactory, ProviderConfig } from "../types";

export const openAIFactory: ProviderFactory = {
  async create(config: ProviderConfig) {
    const { createOpenAIProviderFromResolver } = await import(
      "@/lib/core/ai/providers/ai-provider-factory"
    );
    return createOpenAIProviderFromResolver(config.organizationId);
  },
};

export const anthropicFactory: ProviderFactory = {
  async create(config: ProviderConfig) {
    const { createAnthropicProviderFromResolver } = await import(
      "@/lib/core/ai/providers/ai-provider-factory"
    );
    return createAnthropicProviderFromResolver(config.organizationId);
  },
};

export const cloudAIFactory: ProviderFactory = {
  async create(config: ProviderConfig) {
    const { createCloudAIProviderFromResolver } = await import(
      "@/lib/core/ai/providers/ai-provider-factory"
    );
    return createCloudAIProviderFromResolver(config.organizationId);
  },
};

export const ollamaFactory: ProviderFactory = {
  async create(_config: ProviderConfig) {
    const { LocalAIProvider } = await import("@/lib/core/ai/providers/local-provider");
    return new LocalAIProvider();
  },
};

export const vllmFactory: ProviderFactory = {
  async create(config: ProviderConfig) {
    const { CloudAIProvider } = await import("@/lib/core/ai/providers/cloud-provider");
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
