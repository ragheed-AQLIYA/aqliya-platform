// ─── SSO Service Tests ───
// Tests for sso-service.ts (encryption, audit trail, org scoping, CRUD)

import { PrismaClient } from "@prisma/client";

// Mock encryption for predictable test data
// The real sso-service.ts wraps: encrypt → stores "enc:" + result; decrypt strips "enc:" then calls decrypt
// Our mock uses simple "enc:" prefix for round-trip consistency.
jest.mock("@/lib/auth/encryption", () => ({
  encrypt: (plain: string) => `enc:${plain}`,
  decrypt: (stored: string | null) => {
    if (!stored) return null;
    if (!stored.startsWith("enc:")) return stored; // legacy plaintext passthrough
    return stored.slice(4); // strip "enc:" prefix
  },
}));

import {
  getSsoProviders,
  getEnabledSsoProviders,
  createProvider,
  updateProvider,
  deleteProvider,
  getProviderConfig,
  getProviderById,
} from "@/lib/auth/sso-service";

const prisma = new PrismaClient();

// Simulate what the real sso-service's encryptSecret() produces.
// encrypt("plain") returns mock "enc:plain", so encryptSecret returns "enc:enc:plain".
function storedSecret(plain: string): string {
  return `enc:enc:${plain}`;
}

function seedProvider(overrides: Record<string, unknown> = {}) {
  return prisma.ssoProvider.create({
    data: {
      organizationId: "test-org-id",
      providerType: "google",
      label: "Test Provider",
      clientId: "test-client-id",
      clientSecret: storedSecret("super-secret-value"),
      enabled: true,
      domains: ["@test.com"],
      ...overrides,
    },
  });
}

describe("SSO Service", () => {
  beforeEach(async () => {
    await prisma.ssoProvider.deleteMany({});
    await prisma.platformAuditLog.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ─── getSsoProviders ───

  describe("getSsoProviders", () => {
    it("returns empty array when no providers", async () => {
      const result = await getSsoProviders("test-org-id");
      expect(result).toEqual([]);
    });

    it("returns only providers in the specified org", async () => {
      await seedProvider({ organizationId: "org-a", label: "Org A" });
      await seedProvider({ organizationId: "org-b", label: "Org B" });

      const resultA = await getSsoProviders("org-a");
      expect(resultA).toHaveLength(1);
      expect(resultA[0].label).toBe("Org A");
    });

    it("does not return clientSecret; reports hasClientSecret", async () => {
      await seedProvider({
        clientSecret: storedSecret("my-secret"),
        label: "Secret Test",
      });

      const result = await getSsoProviders("test-org-id");
      expect(result[0]).not.toHaveProperty("clientSecret");
      expect(result[0].hasClientSecret).toBe(true);
    });

    it("orders by createdAt ascending", async () => {
      await seedProvider({ label: "First" });
      await seedProvider({ label: "Second" });

      const result = await getSsoProviders("test-org-id");
      expect(result).toHaveLength(2);
      expect(result[0].label).toBe("First");
      expect(result[1].label).toBe("Second");
    });
  });

  // ─── getEnabledSsoProviders ───

  describe("getEnabledSsoProviders", () => {
    it("returns only enabled providers", async () => {
      await seedProvider({ label: "Enabled One", enabled: true });
      await seedProvider({ label: "Disabled One", enabled: false });

      const result = await getEnabledSsoProviders("test-org-id");
      expect(result).toHaveLength(1);
      expect(result[0].label).toBe("Enabled One");
    });

    it("excludes disabled providers from other orgs", async () => {
      await seedProvider({ organizationId: "other-org", enabled: true });

      const result = await getEnabledSsoProviders("test-org-id");
      expect(result).toHaveLength(0);
    });
  });

  // ─── createProvider ───

  describe("createProvider", () => {
    it("creates a provider with minimal fields", async () => {
      const result = await createProvider("test-org-id", {
        providerType: "github",
        label: "GitHub SSO",
      });

      expect(result.providerType).toBe("github");
      expect(result.label).toBe("GitHub SSO");
      expect(result.enabled).toBe(true); // default
      expect(result.organizationId).toBe("test-org-id");
      expect(result.id).toBeTruthy();
    });

    it("encrypts clientSecret on creation", async () => {
      const result = await createProvider("test-org-id", {
        providerType: "google",
        label: "Google SSO",
        clientSecret: "plain-secret",
      });

      expect(result.hasClientSecret).toBe(true);
      expect(result).not.toHaveProperty("clientSecret");
    });

    it("creates provider with all optional fields", async () => {
      const result = await createProvider("test-org-id", {
        providerType: "custom-oidc",
        label: "Full OIDC",
        clientId: "full-client",
        clientSecret: "full-secret",
        issuerUrl: "https://issuer.example.com",
        authorizationUrl: "https://issuer.example.com/auth",
        tokenUrl: "https://issuer.example.com/token",
        userInfoUrl: "https://issuer.example.com/userinfo",
        jwksUri: "https://issuer.example.com/jwks",
        domains: ["@example.com", "@sub.example.com"],
        attributeMapping: { email: "email", name: "name" },
        metadata: { customField: "value" },
        enabled: false,
      });

      expect(result.clientId).toBe("full-client");
      expect(result.issuerUrl).toBe("https://issuer.example.com");
      expect(result.authorizationUrl).toBe("https://issuer.example.com/auth");
      expect(result.tokenUrl).toBe("https://issuer.example.com/token");
      expect(result.userInfoUrl).toBe("https://issuer.example.com/userinfo");
      expect(result.jwksUri).toBe("https://issuer.example.com/jwks");
      expect(result.domains).toEqual(["@example.com", "@sub.example.com"]);
      expect(result.attributeMapping).toEqual({ email: "email", name: "name" });
      expect(result.enabled).toBe(false);
    });

    it("logs an audit event on creation", async () => {
      await createProvider("test-org-id", {
        providerType: "azure-ad",
        label: "Azure AD",
      }, "actor-123");

      const logs = await prisma.platformAuditLog.findMany({
        where: { action: "sso.provider.created" },
      });
      expect(logs).toHaveLength(1);
      expect(logs[0].actorId).toBe("actor-123");
      expect(logs[0].targetLabel).toBe("Azure AD");
    });
  });

  // ─── updateProvider ───

  describe("updateProvider", () => {
    it("updates a provider label", async () => {
      const created = await seedProvider({ label: "Old" });

      const result = await updateProvider(
        "test-org-id",
        created.id,
        { label: "New" },
        "actor-456",
      );

      expect(result!.label).toBe("New");
    });

    it("encrypts new clientSecret on update", async () => {
      const created = await seedProvider({ clientSecret: storedSecret("old-secret") });

      const result = await updateProvider(
        "test-org-id",
        created.id,
        { clientSecret: "new-plain-secret" },
      );

      expect(result!.hasClientSecret).toBe(true);
      expect(result!).not.toHaveProperty("clientSecret");
    });

    it("clears clientSecret when set to empty string", async () => {
      const created = await seedProvider({ clientSecret: storedSecret("some-secret") });

      const result = await updateProvider(
        "test-org-id",
        created.id,
        { clientSecret: "" },
      );

      expect(result!.hasClientSecret).toBe(false);
      expect(result!).not.toHaveProperty("clientSecret");
    });

    it("updates SAML fields", async () => {
      const created = await seedProvider({
        providerType: "saml",
        samlEntryPoint: "https://old.example.com",
      });

      const result = await updateProvider(
        "test-org-id",
        created.id,
        {
          samlEntryPoint: "https://new.example.com",
          samlIssuer: "urn:new:issuer",
          samlCert: "---BEGIN CERTIFICATE---\nABCD\n---END CERTIFICATE---",
        },
      );

      expect(result!.samlEntryPoint).toBe("https://new.example.com");
      expect(result!.samlIssuer).toBe("urn:new:issuer");
      expect(result!.samlCert).toContain("BEGIN CERTIFICATE");
    });

    it("returns null for nonexistent provider", async () => {
      const result = await updateProvider("test-org-id", "nonexistent-id", {
        label: "Nope",
      });
      expect(result).toBeNull();
    });

    it("returns null for cross-org update", async () => {
      const created = await seedProvider({ organizationId: "other-org" });

      const result = await updateProvider("test-org-id", created.id, {
        label: "Hacked",
      });
      expect(result).toBeNull();
    });

    it("logs audit event on update", async () => {
      const created = await seedProvider({ label: "Before" });

      await updateProvider("test-org-id", created.id, { label: "After" }, "actor-789");

      const logs = await prisma.platformAuditLog.findMany({
        where: { action: "sso.provider.updated" },
      });
      expect(logs).toHaveLength(1);
      expect(logs[0].actorId).toBe("actor-789");
    });
  });

  // ─── deleteProvider ───

  describe("deleteProvider", () => {
    it("deletes an existing provider", async () => {
      const created = await seedProvider();

      const result = await deleteProvider("test-org-id", created.id);
      expect(result).toBe(true);

      const after = await getSsoProviders("test-org-id");
      expect(after).toHaveLength(0);
    });

    it("returns false for nonexistent provider", async () => {
      const result = await deleteProvider("test-org-id", "nonexistent-id");
      expect(result).toBe(false);
    });

    it("returns false for cross-org delete", async () => {
      const created = await seedProvider({ organizationId: "other-org" });

      const result = await deleteProvider("test-org-id", created.id);
      expect(result).toBe(false);
    });

    it("logs audit event on deletion", async () => {
      const created = await seedProvider({ label: "Delete Me" });

      await deleteProvider("test-org-id", created.id, "actor-del");

      const logs = await prisma.platformAuditLog.findMany({
        where: { action: "sso.provider.deleted" },
      });
      expect(logs).toHaveLength(1);
      expect(logs[0].targetLabel).toBe("Delete Me");
      expect(logs[0].actorId).toBe("actor-del");
    });
  });

  // ─── getProviderConfig ───

  describe("getProviderConfig", () => {
    it("returns enabled provider by type", async () => {
      await seedProvider({
        providerType: "google",
        label: "My Google SSO",
        enabled: true,
      });

      const result = await getProviderConfig("test-org-id", "google");
      expect(result).not.toBeNull();
      expect(result!.label).toBe("My Google SSO");
    });

    it("returns null for disabled provider", async () => {
      await seedProvider({
        providerType: "google",
        enabled: false,
      });

      const result = await getProviderConfig("test-org-id", "google");
      expect(result).toBeNull();
    });

    it("returns null for wrong org", async () => {
      await seedProvider({
        organizationId: "other-org",
        providerType: "google",
        enabled: true,
      });

      const result = await getProviderConfig("test-org-id", "google");
      expect(result).toBeNull();
    });

    it("returns null for nonexistent provider type", async () => {
      const result = await getProviderConfig("test-org-id", "nonexistent");
      expect(result).toBeNull();
    });
  });

  // ─── getProviderById ───

  describe("getProviderById", () => {
    it("returns provider by id within org", async () => {
      const created = await seedProvider({ label: "Find Me" });

      const result = await getProviderById("test-org-id", created.id);
      expect(result).not.toBeNull();
      expect(result!.label).toBe("Find Me");
    });

    it("returns null for cross-org lookup", async () => {
      const created = await seedProvider({ organizationId: "other-org" });

      const result = await getProviderById("test-org-id", created.id);
      expect(result).toBeNull();
    });

    it("returns null for nonexistent id", async () => {
      const result = await getProviderById("test-org-id", "nonexistent");
      expect(result).toBeNull();
    });
  });

  // ─── ClientSecret encryption integration ───

  describe("ClientSecret encryption/decryption", () => {
    it("round-trips through create and read", async () => {
      const created = await createProvider("test-org-id", {
        providerType: "okta",
        label: "Okta Tenant",
        clientId: "okta-client",
        clientSecret: "0okta-s3cret-value!",
      });

      expect(created.hasClientSecret).toBe(true);
      expect(created).not.toHaveProperty("clientSecret");
      expect(created.clientId).toBe("okta-client");

      const providers = await getSsoProviders("test-org-id");
      const found = providers.find((p) => p.id === created.id);
      expect(found).toBeDefined();
      expect(found!).not.toHaveProperty("clientSecret");
      expect(found!.hasClientSecret).toBe(true);

      const authProviders = await getEnabledSsoProviders("test-org-id");
      const authFound = authProviders.find((p) => p.id === created.id);
      expect(authFound!.clientSecret).toBe("0okta-s3cret-value!");
    });

    it("handles legacy plaintext clientSecret", async () => {
      // Insert a record with plaintext (non-encrypted) clientSecret directly
      const raw = await prisma.ssoProvider.create({
        data: {
          organizationId: "test-org-id",
          providerType: "google",
          label: "Legacy Provider",
          clientId: "legacy-client",
          clientSecret: "legacy-plain-secret",
          enabled: true,
        },
      });

      const result = await getProviderById("test-org-id", raw.id);
      expect(result).not.toBeNull();
      expect(result!).not.toHaveProperty("clientSecret");
      expect(result!.hasClientSecret).toBe(true);
      const auth = await getProviderConfig("test-org-id", "google");
      expect(auth!.clientSecret).toBe("legacy-plain-secret");
    });
  });
});
