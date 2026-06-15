import { describe, expect, it, jest, beforeEach, afterAll } from "@jest/globals";

// Mock the secret resolver — define mock before jest.mock to avoid hoisting issues
const mockGetIntegrationSecretByType = jest.fn<() => Promise<{
  credentials: Record<string, string>;
  source: string;
  version: number;
  resolvedAt: Date;
  cacheHit: boolean;
}>>();

jest.mock("@/lib/integration/secret-resolver", () => ({
  secretResolver: {
    getIntegrationSecretByType: mockGetIntegrationSecretByType,
  },
  SecretPurpose: {
    AI_INFERENCE: "AI_INFERENCE",
  },
}));

// Stub process.env for fallback tests
const ORIGINAL_OPENAI_KEY = process.env.OPENAI_API_KEY;

import {
  createOpenAIProviderFromResolver,
  createAnthropicProviderFromResolver,
  createCloudAIProviderFromResolver,
  createAnyAIProviderFromResolver,
} from "../ai-provider-factory";

function makeSecretResult(overrides: Record<string, unknown> = {}) {
  return {
    credentials: { value: "sk-resolved-key-12345" },
    source: "vault" as const,
    version: 3,
    resolvedAt: new Date(),
    cacheHit: false,
    ...overrides,
  };
}

describe("AI Provider Factory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    if (ORIGINAL_OPENAI_KEY) {
      process.env.OPENAI_API_KEY = ORIGINAL_OPENAI_KEY;
    } else {
      delete process.env.OPENAI_API_KEY;
    }
  });

  describe("createOpenAIProviderFromResolver", () => {
    it("resolves apiKey from vault and creates OpenAIProvider", async () => {
      mockGetIntegrationSecretByType.mockResolvedValueOnce(
        makeSecretResult({ credentials: { apiKey: "sk-vault-key" } }),
      );
      const provider = await createOpenAIProviderFromResolver("org-1");
      expect(provider).toBeDefined();
      expect(provider.providerId).toBe("openai");
    });

    it("falls back to process.env when resolver throws", async () => {
      process.env.OPENAI_API_KEY = "sk-env-fallback";
      mockGetIntegrationSecretByType.mockRejectedValueOnce(new Error("Not found"));
      const provider = await createOpenAIProviderFromResolver("org-1");
      expect(provider).toBeDefined();
      expect(provider.providerId).toBe("openai");
    });

    it("uses value field when apiKey is not in credentials", async () => {
      mockGetIntegrationSecretByType.mockResolvedValueOnce(
        makeSecretResult({ credentials: { value: "sk-value-key" } }),
      );
      const provider = await createOpenAIProviderFromResolver("org-1");
      expect(provider).toBeDefined();
      expect(provider.providerId).toBe("openai");
    });

    it("falls back when credentials have no usable apiKey", async () => {
      process.env.OPENAI_API_KEY = "sk-env-fallback";
      mockGetIntegrationSecretByType.mockResolvedValueOnce(
        makeSecretResult({ credentials: { someOther: "not-an-api-key" } }),
      );
      const provider = await createOpenAIProviderFromResolver("org-1");
      expect(provider).toBeDefined();
      expect(provider.providerId).toBe("openai");
    });
  });

  describe("createAnthropicProviderFromResolver", () => {
    it("resolves apiKey from vault and creates AnthropicProvider", async () => {
      mockGetIntegrationSecretByType.mockResolvedValueOnce(
        makeSecretResult({ credentials: { apiKey: "sk-ant-vault-key" } }),
      );
      const provider = await createAnthropicProviderFromResolver("org-2");
      expect(provider).toBeDefined();
      expect(provider.providerId).toBe("anthropic");
    });

    it("falls back to process.env when resolver throws", async () => {
      process.env.ANTHROPIC_API_KEY = "sk-ant-env-fallback";
      mockGetIntegrationSecretByType.mockRejectedValueOnce(new Error("Not found"));
      const provider = await createAnthropicProviderFromResolver("org-2");
      expect(provider).toBeDefined();
      expect(provider.providerId).toBe("anthropic");
    });
  });

  describe("createCloudAIProviderFromResolver", () => {
    it("resolves apiKey from vault and creates CloudAIProvider", async () => {
      mockGetIntegrationSecretByType.mockResolvedValueOnce(
        makeSecretResult({
          credentials: { apiKey: "cloud-key", baseUrl: "https://cloud.example.com" },
        }),
      );
      const provider = await createCloudAIProviderFromResolver("org-3");
      expect(provider).toBeDefined();
      expect(provider.providerId).toBe("cloud");
    });

    it("falls back to process.env when resolver throws", async () => {
      process.env.AI_CLOUD_API_KEY = "cloud-env";
      process.env.AI_CLOUD_BASE_URL = "https://env.example.com";
      mockGetIntegrationSecretByType.mockRejectedValueOnce(new Error("Not found"));
      const provider = await createCloudAIProviderFromResolver("org-3");
      expect(provider).toBeDefined();
      expect(provider.providerId).toBe("cloud");
    });
  });

  describe("createAnyAIProviderFromResolver", () => {
    it("creates OpenAI by name", async () => {
      mockGetIntegrationSecretByType.mockResolvedValueOnce(
        makeSecretResult({ credentials: { apiKey: "sk-any" } }),
      );
      const provider = await createAnyAIProviderFromResolver("org-1", "openai");
      expect(provider.providerId).toBe("openai");
    });

    it("creates Anthropic by name", async () => {
      mockGetIntegrationSecretByType.mockResolvedValueOnce(
        makeSecretResult({ credentials: { apiKey: "sk-ant-any" } }),
      );
      const provider = await createAnyAIProviderFromResolver("org-1", "anthropic");
      expect(provider.providerId).toBe("anthropic");
    });

    it("creates Cloud by name", async () => {
      mockGetIntegrationSecretByType.mockResolvedValueOnce(
        makeSecretResult({ credentials: { apiKey: "cloud-any" } }),
      );
      const provider = await createAnyAIProviderFromResolver("org-1", "cloud");
      expect(provider.providerId).toBe("cloud");
    });
  });
});
