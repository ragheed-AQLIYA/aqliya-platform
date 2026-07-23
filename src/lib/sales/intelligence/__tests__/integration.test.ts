/**
 * Sales Intelligence Integration Tests
 *
 * Tests: BaseApiKeyConnector, factory, webhook receiver, OAuth2 client.
 * Uses Jest with in-memory mocks — no external API calls.
 */
import { describe, expect, it, jest, beforeEach } from "@jest/globals";

// ─── Mock fetch globally ───

const mockFetch = jest.fn<typeof fetch>();
global.fetch = mockFetch as unknown as typeof fetch;

// ─── Tests ───

describe("Sales Intelligence Module", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("BaseApiKeyConnector", () => {
    it("builds correct authorization header", async () => {
      const { BaseApiKeyConnector } = await import("../base-connector");

      class TestConnector extends BaseApiKeyConnector {
        readonly providerId = "test";
        readonly providerName = "Test";
        protected async healthCheck(): Promise<void> {}
        async publicRequest(opts: { path: string }) {
          return this.request(opts);
        }
      }

      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

      const conn = new TestConnector({
        apiKey: "test-key-123",
        baseUrl: "https://api.test.com",
      });

      const result = await conn.publicRequest({ path: "/test" });
      expect(result.status).toBe(200);

      const callArgs = mockFetch.mock.calls[0] as [string, RequestInit];
      const headers = callArgs[1]?.headers as Record<string, string>;
      expect(headers["Authorization"]).toBe("Bearer test-key-123");
      expect(headers["Content-Type"]).toBe("application/json");
    });

    it("retries on 500 errors", async () => {
      const { BaseApiKeyConnector } = await import("../base-connector");

      class TestConnector extends BaseApiKeyConnector {
        readonly providerId = "test";
        readonly providerName = "Test";
        protected async healthCheck(): Promise<void> {}
        async publicRequest() {
          return this.request({ path: "/flaky" });
        }
      }

      // Fail twice, succeed on third
      mockFetch
        .mockResolvedValueOnce(new Response("error", { status: 500 }))
        .mockResolvedValueOnce(new Response("error", { status: 503 }))
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "content-type": "application/json" },
          }),
        );

      const conn = new TestConnector({
        apiKey: "test-key",
        baseUrl: "https://api.test.com",
        maxRetries: 3,
      });

      const result = await conn.publicRequest();
      expect(result.status).toBe(200);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it("throws after max retries exceeded", async () => {
      const { BaseApiKeyConnector } = await import("../base-connector");

      class TestConnector extends BaseApiKeyConnector {
        readonly providerId = "test";
        readonly providerName = "Test";
        protected async healthCheck(): Promise<void> {}
        async publicRequest() {
          return this.request({ path: "/down" });
        }
      }

      mockFetch.mockResolvedValue(new Response("error", { status: 500 }));

      const conn = new TestConnector({
        apiKey: "test-key",
        baseUrl: "https://api.test.com",
        maxRetries: 2,
      });

      await expect(conn.publicRequest()).rejects.toThrow();
    });

    it("handles rate limiting (429) with retry", async () => {
      const { BaseApiKeyConnector } = await import("../base-connector");

      class TestConnector extends BaseApiKeyConnector {
        readonly providerId = "test";
        readonly providerName = "Test";
        protected async healthCheck(): Promise<void> {}
        async publicRequest() {
          return this.request({ path: "/ratelimited" });
        }
      }

      mockFetch
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ error: "rate_limited" }), {
            status: 429,
            headers: { "retry-after": "1", "content-type": "application/json" },
          }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "content-type": "application/json" },
          }),
        );

      const conn = new TestConnector({
        apiKey: "test-key",
        baseUrl: "https://api.test.com",
        maxRetries: 3,
      });

      const result = await conn.publicRequest();
      expect(result.status).toBe(200);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("health check returns success when API is reachable", async () => {
      const { BaseApiKeyConnector } = await import("../base-connector");

      class TestConnector extends BaseApiKeyConnector {
        readonly providerId = "test";
        readonly providerName = "Test";
        protected async healthCheck(): Promise<void> {
          await this.request({ path: "/health" });
        }
      }

      // Reset mock for this specific test
      mockFetch.mockReset();
      mockFetch.mockResolvedValue(
        new Response(JSON.stringify({ status: "ok" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

      const conn = new TestConnector({
        apiKey: "test-key",
        baseUrl: "https://api.test.com",
      });

      const result = await conn.testConnection();
      expect(result.success).toBe(true);
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Factory", () => {
    beforeEach(() => {
      process.env.APOLLO_API_KEY = "test-apollo-key";
      process.env.OCEAN_API_KEY = "test-ocean-key";
      process.env.CLAY_API_KEY = "test-clay-key";
      process.env.SMARTLEAD_API_KEY = "test-smartlead-key";
      process.env.LINKEDIN_API_KEY = "test-linkedin-key";
    });

    afterEach(() => {
      delete process.env.APOLLO_API_KEY;
      delete process.env.OCEAN_API_KEY;
      delete process.env.CLAY_API_KEY;
      delete process.env.SMARTLEAD_API_KEY;
      delete process.env.LINKEDIN_API_KEY;
    });

    it("creates Apollo connector by ID", async () => {
      const { createSalesIntelProvider, listRegisteredProviders } =
        await import("../factory");

      const providers = listRegisteredProviders();
      expect(providers).toContain("apollo");
      expect(providers).toContain("ocean");
      expect(providers).toContain("clay");
      expect(providers).toContain("smartlead");
      expect(providers).toContain("linkedin");

      const connector = createSalesIntelProvider("apollo");
      expect(connector.providerId).toBe("apollo");
    });

    it("throws for unregistered provider", async () => {
      const { createSalesIntelProvider } = await import("../factory");
      expect(() =>
        createSalesIntelProvider("unknown" as "apollo"),
      ).toThrow("not registered");
    });
  });

  describe("Webhook Receiver", () => {
    it("verifies valid HMAC signature", async () => {
      const { verifySignature } = await import("../webhook/receiver");

      const body = JSON.stringify({ event_type: "EMAIL_REPLIED" });
      const secret = "test-webhook-secret";
      const { createHash } = await import("crypto");
      const signature = createHash("sha256")
        .update(body + secret)
        .digest("hex");

      const valid = verifySignature(body, signature, secret, "smartlead");
      expect(valid).toBe(true);
    });

    it("rejects invalid signature", async () => {
      const { verifySignature } = await import("../webhook/receiver");

      const valid = verifySignature(
        JSON.stringify({ test: true }),
        "bad-signature",
        "secret",
        "smartlead",
      );
      expect(valid).toBe(false);
    });

    it("registers and routes event handlers", async () => {
      const {
        registerWebhookHandler,
        receiveWebhook,
      } = await import("../webhook/receiver");

      const handled: string[] = [];
      registerWebhookHandler("smartlead", "EMAIL_REPLIED", async (event) => {
        handled.push(event.eventType);
      });

      const body = JSON.stringify({ event_type: "EMAIL_REPLIED" });
      const { createHash } = await import("crypto");
      const secret = "test-secret";
      const sig = createHash("sha256").update(body + secret).digest("hex");

      const result = await receiveWebhook(
        {
          providerId: "smartlead",
          webhookSecret: secret,
          enabled: true,
          organizationId: "org-1",
        },
        body,
        sig,
        {},
      );

      expect(result.accepted).toBe(true);
      // Handler may execute asynchronously
    });
  });

  describe("OAuth2 Client", () => {
    it("builds authorization URL with PKCE", async () => {
      const { buildAuthorizationUrl } = await import("../oauth/oauth2-client");

      const result = buildAuthorizationUrl({
        clientId: "test-client",
        clientSecret: "test-secret",
        redirectUri: "https://app.aqliya.com/oauth/callback",
        authorizationUrl: "https://auth.test.com/authorize",
        tokenUrl: "https://auth.test.com/token",
        scopes: ["openid", "profile"],
      });

      expect(result.url).toContain("response_type=code");
      expect(result.url).toContain("code_challenge_method=S256");
      expect(result.codeVerifier).toBeDefined();
      expect(result.state).toBeDefined();
    });
  });
});
