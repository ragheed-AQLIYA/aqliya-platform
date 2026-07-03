// ─── SSO Admin Actions Tests ───
// Tests for sso-admin-actions.ts (CRUD, toggle, test config)
// Uses mocked PrismaClient and @/lib/auth.

import { PrismaClient } from "@prisma/client";

// We need to mock next/cache BEFORE any imports that reference it
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// Mock the encryption module for predictable test data
jest.mock("@/lib/auth/encryption", () => ({
  encrypt: (plain: string) => `enc:mocked:${plain}`,
  decrypt: (stored: string | null) => {
    if (!stored) return null;
    if (!stored.startsWith("enc:")) return stored;
    return stored.replace("enc:mocked:", "");
  },
}));

import {
  listSsoProvidersAction,
  createSsoProviderAction,
  updateSsoProviderAction,
  deleteSsoProviderAction,
  toggleSsoProviderAction,
  getSsoProviderAction,
  testSsoProviderConfigAction,
} from "@/actions/sso-admin-actions";
import { mockUser } from "@/lib/auth";

const prisma = new PrismaClient();

function seedProvider(overrides: Record<string, unknown> = {}) {
  return prisma.ssoProvider.create({
    data: {
      organizationId: "test-org-id",
      providerType: "google",
      label: "Test Google SSO",
      clientId: "test-client-id",
      clientSecret: "enc:mocked:test-secret",
      enabled: true,
      domains: ["@test.com"],
      ...overrides,
    },
  });
}

function seedProviderRaw(overrides: Record<string, unknown> = {}) {
  return prisma.ssoProvider.create({
    data: {
      organizationId: "test-org-id",
      providerType: "custom-oidc",
      label: "Test OIDC",
      clientId: "oidc-client-id",
      clientSecret: "enc:mocked:oidc-secret",
      issuerUrl: "https://issuer.example.com",
      authorizationUrl: "https://issuer.example.com/auth",
      tokenUrl: "https://issuer.example.com/token",
      userInfoUrl: "https://issuer.example.com/userinfo",
      enabled: true,
      ...overrides,
    },
  });
}

describe("SSO Admin Actions", () => {
  beforeEach(async () => {
    // Clear all in-memory stores
    await prisma.ssoProvider.deleteMany({});
    await prisma.platformAuditLog.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ─── listSsoProvidersAction ───

  describe("listSsoProvidersAction", () => {
    it("returns empty array when no providers exist", async () => {
      const result = await listSsoProvidersAction();
      expect(result).toEqual([]);
    });

    it("returns providers scoped to organization", async () => {
      await seedProvider({ organizationId: "test-org-id", label: "Org A" });
      await seedProvider({ organizationId: "other-org", label: "Other Org" });

      const result = await listSsoProvidersAction();
      expect(result).toHaveLength(1);
      expect(result[0].label).toBe("Org A");
      expect(result[0].organizationId).toBe("test-org-id");
    });

    it("returns multiple providers ordered by createdAt", async () => {
      await seedProvider({ label: "First" });
      await seedProvider({ label: "Second" });

      const result = await listSsoProvidersAction();
      expect(result).toHaveLength(2);
      expect(result[0].label).toBe("First");
      expect(result[1].label).toBe("Second");
    });
  });

  // ─── createSsoProviderAction ───

  describe("createSsoProviderAction", () => {
    it("creates a provider with valid data", async () => {
      const result = await createSsoProviderAction({
        providerType: "github",
        label: "GitHub Enterprise",
        clientId: "gh-client",
        clientSecret: "gh-secret",
        domains: ["@github.com"],
      });

      expect(result.label).toBe("GitHub Enterprise");
      expect(result.providerType).toBe("github");
      expect(result.enabled).toBe(true);
      expect(result.organizationId).toBe("test-org-id");
      expect(result.clientSecret).toBe("gh-secret"); // decrypted
    });

    it("creates a SAML provider with entry point", async () => {
      const result = await createSsoProviderAction({
        providerType: "saml",
        label: "SAML Provider",
        samlEntryPoint: "https://saml.example.com/login",
        samlIssuer: "urn:example:saml",
        samlCert: "---BEGIN CERTIFICATE---...",
      });

      expect(result.providerType).toBe("saml");
      expect(result.samlEntryPoint).toBe("https://saml.example.com/login");
      expect(result.samlIssuer).toBe("urn:example:saml");
    });

    it("creates an OIDC provider with full endpoint URLs", async () => {
      const result = await createSsoProviderAction({
        providerType: "custom-oidc",
        label: "Custom OIDC",
        clientId: "oidc-client",
        clientSecret: "oidc-secret",
        issuerUrl: "https://accounts.example.com",
        authorizationUrl: "https://accounts.example.com/auth",
        tokenUrl: "https://accounts.example.com/token",
        userInfoUrl: "https://accounts.example.com/userinfo",
      });

      expect(result.issuerUrl).toBe("https://accounts.example.com");
      expect(result.authorizationUrl).toBe("https://accounts.example.com/auth");
      expect(result.tokenUrl).toBe("https://accounts.example.com/token");
      expect(result.userInfoUrl).toBe("https://accounts.example.com/userinfo");
    });

    it("throws if providerType is missing", async () => {
      await expect(
        createSsoProviderAction({
          providerType: "",
          label: "No Type",
        }),
      ).rejects.toThrow("نوع المزود مطلوب");
    });

    it("throws if label is missing", async () => {
      await expect(
        createSsoProviderAction({
          providerType: "google",
          label: "",
        }),
      ).rejects.toThrow("الاسم التعريفي للمزود مطلوب");
    });

    it("logs audit event on creation", async () => {
      await createSsoProviderAction({
        providerType: "azure-ad",
        label: "Azure AD Tenant",
        clientId: "az-client",
        clientSecret: "az-secret",
      });

      const logs = await prisma.platformAuditLog.findMany({
        where: { action: "sso.provider.created" },
      });
      expect(logs).toHaveLength(1);
      expect(logs[0].targetLabel).toBe("Azure AD Tenant");
      expect(logs[0].actorId).toBe(mockUser.id);
    });
  });

  // ─── updateSsoProviderAction ───

  describe("updateSsoProviderAction", () => {
    it("updates provider label", async () => {
      const created = await seedProvider({ label: "Old Label" });

      const result = await updateSsoProviderAction(created.id, {
        label: "New Label",
      });
      expect(result.label).toBe("New Label");
    });

    it("updates provider client credentials", async () => {
      const created = await seedProvider({ clientId: "old-id" });

      const result = await updateSsoProviderAction(created.id, {
        clientId: "new-id",
        clientSecret: "new-secret",
      });
      expect(result.clientId).toBe("new-id");
      expect(result.clientSecret).toBe("new-secret");
    });

    it("updates SAML configuration", async () => {
      const created = await seedProvider({
        providerType: "saml",
        samlEntryPoint: "https://old.example.com/login",
      });

      const result = await updateSsoProviderAction(created.id, {
        samlEntryPoint: "https://new.example.com/login",
        samlIssuer: "urn:new:issuer",
      });
      expect(result.samlEntryPoint).toBe("https://new.example.com/login");
      expect(result.samlIssuer).toBe("urn:new:issuer");
    });

    it("updates domain allowlist", async () => {
      const created = await seedProvider({ domains: ["@old.com"] });

      const result = await updateSsoProviderAction(created.id, {
        domains: ["@new.com", "@also.com"],
      });
      expect(result.domains).toEqual(["@new.com", "@also.com"]);
    });

    it("throws when provider does not exist", async () => {
      await expect(
        updateSsoProviderAction("nonexistent-id", { label: "Nope" }),
      ).rejects.toThrow("مزود الدخول الموحد غير موجود");
    });

    it("throws when updating provider from different org", async () => {
      const created = await seedProvider({ organizationId: "other-org" });

      await expect(
        updateSsoProviderAction(created.id, { label: "Hacked" }),
      ).rejects.toThrow("مزود الدخول الموحد غير موجود");
    });

    it("logs audit event on update", async () => {
      const created = await seedProvider({ label: "Pre-update" });

      await updateSsoProviderAction(created.id, { label: "Post-update" });

      const logs = await prisma.platformAuditLog.findMany({
        where: { action: "sso.provider.updated" },
      });
      expect(logs).toHaveLength(1);
      expect(logs[0].targetId).toBe(created.id);
    });
  });

  // ─── deleteSsoProviderAction ───

  describe("deleteSsoProviderAction", () => {
    it("deletes an existing provider", async () => {
      const created = await seedProvider();

      await deleteSsoProviderAction(created.id);

      const after = await prisma.ssoProvider.findMany({
        where: { id: created.id },
      });
      expect(after).toHaveLength(0);
    });

    it("throws when provider does not exist", async () => {
      await expect(
        deleteSsoProviderAction("nonexistent-id"),
      ).rejects.toThrow("مزود الدخول الموحد غير موجود");
    });

    it("throws when deleting provider from different org", async () => {
      const created = await seedProvider({ organizationId: "other-org" });

      await expect(
        deleteSsoProviderAction(created.id),
      ).rejects.toThrow("مزود الدخول الموحد غير موجود");
    });

    it("logs audit event on deletion", async () => {
      const created = await seedProvider({ label: "To Delete" });

      await deleteSsoProviderAction(created.id);

      const logs = await prisma.platformAuditLog.findMany({
        where: { action: "sso.provider.deleted" },
      });
      expect(logs).toHaveLength(1);
      expect(logs[0].targetLabel).toBe("To Delete");
      expect(logs[0].severity).toBe("warning");
    });
  });

  // ─── toggleSsoProviderAction ───

  describe("toggleSsoProviderAction", () => {
    it("disables an enabled provider", async () => {
      const created = await seedProvider({ enabled: true });

      const result = await toggleSsoProviderAction(created.id, false);
      expect(result.enabled).toBe(false);
    });

    it("enables a disabled provider", async () => {
      const created = await seedProvider({ enabled: false });

      const result = await toggleSsoProviderAction(created.id, true);
      expect(result.enabled).toBe(true);
    });

    it("throws when provider does not exist", async () => {
      await expect(
        toggleSsoProviderAction("nonexistent-id", false),
      ).rejects.toThrow("مزود الدخول الموحد غير موجود");
    });

    it("logs audit event on toggle", async () => {
      const created = await seedProvider({ enabled: true });

      await toggleSsoProviderAction(created.id, false);

      const logs = await prisma.platformAuditLog.findMany({
        where: { action: "sso.provider.updated" },
      });
      expect(logs).toHaveLength(1);
    });
  });

  // ─── getSsoProviderAction ───

  describe("getSsoProviderAction", () => {
    it("returns provider by id", async () => {
      const created = await seedProvider({ label: "Find Me" });

      const result = await getSsoProviderAction(created.id);
      expect(result).not.toBeNull();
      expect(result!.label).toBe("Find Me");
    });

    it("returns null for nonexistent provider", async () => {
      const result = await getSsoProviderAction("nonexistent-id");
      expect(result).toBeNull();
    });

    it("is scoped to organization", async () => {
      const created = await seedProvider({
        organizationId: "other-org",
        label: "Not Mine",
      });

      const result = await getSsoProviderAction(created.id);
      expect(result).toBeNull();
    });
  });

  // ─── testSsoProviderConfigAction ───

  describe("testSsoProviderConfigAction", () => {
    const origEnv = process.env;

    beforeEach(() => {
      process.env = { ...origEnv };
    });

    afterAll(() => {
      process.env = origEnv;
    });

    it("returns success for google when env vars are set", async () => {
      process.env.AUTH_GOOGLE_ID = "google-id";
      process.env.AUTH_GOOGLE_SECRET = "google-secret";

      const result = await testSsoProviderConfigAction("google");
      expect(result.success).toBe(true);
      expect(result.message).toContain("صحيح");
    });

    it("returns failure for google when env vars are missing", async () => {
      delete process.env.AUTH_GOOGLE_ID;
      delete process.env.AUTH_GOOGLE_SECRET;

      const result = await testSsoProviderConfigAction("google");
      expect(result.success).toBe(false);
      expect(result.message).toContain("AUTH_GOOGLE_ID");
    });

    it("returns success for github when env vars are set", async () => {
      process.env.AUTH_GITHUB_ID = "gh-id";
      process.env.AUTH_GITHUB_SECRET = "gh-secret";

      const result = await testSsoProviderConfigAction("github");
      expect(result.success).toBe(true);
    });

    it("checks Azure AD tenant id", async () => {
      process.env.AUTH_AZURE_AD_ID = "az-id";
      process.env.AUTH_AZURE_AD_SECRET = "az-secret";
      // No tenant ID
      delete process.env.AUTH_AZURE_AD_TENANT_ID;

      const result = await testSsoProviderConfigAction("azure-ad");
      expect(result.success).toBe(false);
      expect(result.message).toContain("AUTH_AZURE_AD_TENANT_ID");
    });

    it("returns success for Azure AD when all vars are set", async () => {
      process.env.AUTH_AZURE_AD_ID = "az-id";
      process.env.AUTH_AZURE_AD_SECRET = "az-secret";
      process.env.AUTH_AZURE_AD_TENANT_ID = "az-tenant";

      const result = await testSsoProviderConfigAction("azure-ad");
      expect(result.success).toBe(true);
    });

    it("returns success for custom-oidc (db-based, no env check)", async () => {
      const result = await testSsoProviderConfigAction("custom-oidc");
      expect(result.success).toBe(true);
      expect(result.message).toContain("قاعدة البيانات");
    });

    it("returns success for saml (db-based, no env check)", async () => {
      const result = await testSsoProviderConfigAction("saml");
      expect(result.success).toBe(true);
      expect(result.message).toContain("قاعدة البيانات");
    });

    it("returns failure for unknown provider type", async () => {
      const result = await testSsoProviderConfigAction("unknown-provider");
      expect(result.success).toBe(false);
      expect(result.message).toContain("غير معروف");
    });
  });
});
