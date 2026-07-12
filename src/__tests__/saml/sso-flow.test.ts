// ─── SAML SSO Flow Tests ───
// Tests for saml-sp.ts: provider configuration, AuthnRequest generation,
// assertion validation, SP metadata, and error handling.

import { describe, expect, it, jest, beforeEach, afterEach } from "@jest/globals";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockGetAuthorizeUrlAsync = jest.fn() as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockValidatePostResponseAsync = jest.fn() as any;
let samlConstructorConfig: Record<string, unknown> | null = null;

jest.mock("@node-saml/node-saml", () => ({
  SAML: jest.fn().mockImplementation((config: Record<string, unknown>) => {
    samlConstructorConfig = config;
    return {
      getAuthorizeUrlAsync: mockGetAuthorizeUrlAsync,
      validatePostResponseAsync: mockValidatePostResponseAsync,
    };
  }),
  generateServiceProviderMetadata: jest.fn().mockReturnValue(
    "<?xml version=\"1.0\"?><md:EntityDescriptor></md:EntityDescriptor>",
  ),
  ValidateInResponseTo: { ifPresent: "ifPresent", never: "never", always: "always" },
}));

jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@auth/core/jwt", () => ({
  encode: jest.fn().mockResolvedValue("mock-jwt-token"),
}));

import {
  buildSamlInstance,
  getSamlAuthorizeUrl,
  validateSamlResponse,
  getSamlSpMetadataXml,
} from "@/lib/auth/saml/saml-sp";

function makeSamlProvider(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: "saml-provider-1",
    organizationId: "org-1",
    providerType: "saml",
    label: "Azure AD SAML",
    samlEntryPoint: "https://login.microsoftonline.com/tenant-id/saml2",
    samlIssuer: "https://sts.windows.net/tenant-id/",
    samlCert: "test-saml-cert",
    ...overrides,
    issuerUrl: overrides.issuerUrl ?? null,
    authorizationUrl: overrides.authorizationUrl ?? null,
    tokenUrl: overrides.tokenUrl ?? null,
    userInfoUrl: overrides.userInfoUrl ?? null,
    jwksUri: overrides.jwksUri ?? null,
    clientId: overrides.clientId ?? null,
    clientSecret: overrides.clientSecret ?? null,
    attributeMapping: overrides.attributeMapping ?? null,
    domains: overrides.domains ?? null,
    enabled: overrides.enabled ?? true,
    metadata: overrides.metadata ?? null,
    createdAt: overrides.createdAt ?? new Date("2025-01-01"),
    updatedAt: overrides.updatedAt ?? new Date("2025-01-01"),
  };
}

describe("SAML SSO Flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    samlConstructorConfig = null;
    process.env.NEXTAUTH_URL = "http://localhost:3000";
    process.env.AUTH_SECRET = "test-secret-for-saml";
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Provider Configuration", () => {
    it("returns SAML object when provider has valid config", () => {
      expect(buildSamlInstance(makeSamlProvider() as any)).not.toBeNull();
    });
    it("returns null when entryPoint is missing", () => {
      expect(buildSamlInstance(makeSamlProvider({ samlEntryPoint: null }) as any)).toBeNull();
    });
    it("returns null when cert is missing", () => {
      expect(buildSamlInstance(makeSamlProvider({ samlCert: null }) as any)).toBeNull();
    });
    it("returns null when both entryPoint and cert missing", () => {
      expect(buildSamlInstance(makeSamlProvider({ samlEntryPoint: null, samlCert: null }) as any)).toBeNull();
    });
    it("passes config with signature settings", () => {
      buildSamlInstance(makeSamlProvider() as any);
      expect(samlConstructorConfig).toMatchObject({
        wantAssertionsSigned: true,
        wantAuthnResponseSigned: true,
        signatureAlgorithm: "sha256",
      });
    });
    it("uses provider issuer when set", () => {
      buildSamlInstance(makeSamlProvider({ samlIssuer: "https://custom-issuer.example.com" }) as any);
      expect(samlConstructorConfig).toMatchObject({ issuer: "https://custom-issuer.example.com" });
    });
    it("falls back to NEXTAUTH_URL for issuer", () => {
      buildSamlInstance(makeSamlProvider({ samlIssuer: null }) as any);
      expect(samlConstructorConfig).toMatchObject({ issuer: "http://localhost:3000" });
    });
    it("sets callbackUrl based on provider id", () => {
      buildSamlInstance(makeSamlProvider({ id: "custom-provider-id" }) as any);
      expect(samlConstructorConfig).toMatchObject({
        callbackUrl: "http://localhost:3000/api/auth/saml/custom-provider-id/callback",
      });
    });
  });

  describe("AuthnRequest Generation", () => {
    it("returns URL on success", async () => {
      mockGetAuthorizeUrlAsync.mockResolvedValue("https://idp.example.com/saml?SAMLRequest=xxx");
      const url = await getSamlAuthorizeUrl(makeSamlProvider() as any);
      expect(url).toBe("https://idp.example.com/saml?SAMLRequest=xxx");
    });
    it("returns null when provider config missing", async () => {
      const url = await getSamlAuthorizeUrl(makeSamlProvider({ samlEntryPoint: null }) as any);
      expect(url).toBeNull();
    });
    it("passes relayState to IdP", async () => {
      mockGetAuthorizeUrlAsync.mockResolvedValue("https://idp.example.com/saml?RelayState=audit");
      await getSamlAuthorizeUrl(makeSamlProvider() as any, "/audit");
      expect(mockGetAuthorizeUrlAsync).toHaveBeenCalledWith("/audit", undefined, {});
    });
    it("passes empty string when relayState omitted", async () => {
      await getSamlAuthorizeUrl(makeSamlProvider() as any);
      expect(mockGetAuthorizeUrlAsync).toHaveBeenCalledWith("", undefined, {});
    });
    it("returns null when SAML call throws", async () => {
      mockGetAuthorizeUrlAsync.mockRejectedValue(new Error("IdP unreachable"));
      const url = await getSamlAuthorizeUrl(makeSamlProvider() as any);
      expect(url).toBeNull();
    });
  });

  describe("Assertion Validation", () => {
    it("extracts email from nameID when email attribute missing", async () => {
      mockValidatePostResponseAsync.mockResolvedValue({
        profile: { nameID: "user@example.com", nameIDFormat: "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress" },
        loggedOut: false,
      });
      const r = await validateSamlResponse(makeSamlProvider() as any, "resp");
      expect(r.profile.email).toBe("user@example.com");
    });
    it("extracts displayName from profile", async () => {
      mockValidatePostResponseAsync.mockResolvedValue({
        profile: { nameID: "user@example.com", email: "user@example.com", displayName: "John Doe" },
        loggedOut: false,
      });
      const r = await validateSamlResponse(makeSamlProvider() as any, "resp");
      expect(r.profile.name).toBe("John Doe");
    });
    it("extracts email from email attribute", async () => {
      mockValidatePostResponseAsync.mockResolvedValue({
        profile: { nameID: "uid", email: "john@example.com", displayName: "John" },
        loggedOut: false,
      });
      const r = await validateSamlResponse(makeSamlProvider() as any, "resp");
      expect(r.profile.email).toBe("john@example.com");
    });
    it("normalizes email to lowercase", async () => {
      mockValidatePostResponseAsync.mockResolvedValue({
        profile: { nameID: "User@Example.COM", email: "User@Example.COM" },
        loggedOut: false,
      });
      const r = await validateSamlResponse(makeSamlProvider() as any, "resp");
      expect(r.profile.email).toBe("user@example.com");
    });
    it("extracts sessionIndex when present", async () => {
      mockValidatePostResponseAsync.mockResolvedValue({
        profile: { nameID: "u@e.com", email: "u@e.com", sessionIndex: "_abc123" },
        loggedOut: false,
      });
      const r = await validateSamlResponse(makeSamlProvider() as any, "resp");
      expect(r.profile.sessionIndex).toBe("_abc123");
    });
    it("throws when email is missing from both email and nameID", async () => {
      mockValidatePostResponseAsync.mockResolvedValue({
        profile: { nameID: "not-an-email", nameIDFormat: "unspecified" },
        loggedOut: false,
      });
      await expect(validateSamlResponse(makeSamlProvider() as any, "resp")).rejects.toThrow("valid email");
    });
    it("throws when no profile in response", async () => {
      mockValidatePostResponseAsync.mockResolvedValue({ profile: null, loggedOut: false });
      await expect(validateSamlResponse(makeSamlProvider() as any, "resp")).rejects.toThrow("SAML response contained no profile");
    });
    it("throws when provider is not configured", async () => {
      await expect(validateSamlResponse(makeSamlProvider({ samlEntryPoint: null }) as any, "resp")).rejects.toThrow("SAML provider not configured");
    });
    it("sets loggedOut flag", async () => {
      mockValidatePostResponseAsync.mockResolvedValue({
        profile: { nameID: "u@e.com", email: "u@e.com" },
        loggedOut: true,
      });
      const r = await validateSamlResponse(makeSamlProvider() as any, "resp");
      expect(r.loggedOut).toBe(true);
    });
    it("uses default NameID format when none provided", async () => {
      mockValidatePostResponseAsync.mockResolvedValue({
        profile: { nameID: "u@e.com", email: "u@e.com", nameIDFormat: null },
        loggedOut: false,
      });
      const r = await validateSamlResponse(makeSamlProvider() as any, "resp");
      expect(r.profile.nameIDFormat).toBe("urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress");
    });
  });

  describe("SP Metadata Generation", () => {
    it("returns XML string for valid provider", () => {
      expect(getSamlSpMetadataXml(makeSamlProvider() as any)).not.toBeNull();
    });
    it("returns null when entryPoint missing", () => {
      expect(getSamlSpMetadataXml(makeSamlProvider({ samlEntryPoint: null }) as any)).toBeNull();
    });
    it("returns null when cert missing", () => {
      expect(getSamlSpMetadataXml(makeSamlProvider({ samlCert: null }) as any)).toBeNull();
    });
  });

  describe("Error Handling", () => {
    it("rejects assertion with invalid signature", async () => {
      mockValidatePostResponseAsync.mockRejectedValue(new Error("Invalid signature"));
      await expect(validateSamlResponse(makeSamlProvider() as any, "bad-sig")).rejects.toThrow("Invalid signature");
    });
    it("rejects expired assertion", async () => {
      mockValidatePostResponseAsync.mockRejectedValue(new Error("Assertion expired"));
      await expect(validateSamlResponse(makeSamlProvider() as any, "expired")).rejects.toThrow("Assertion expired");
    });
    it("rejects response with missing NameID", async () => {
      mockValidatePostResponseAsync.mockResolvedValue({
        profile: { nameID: null, email: null },
        loggedOut: false,
      });
      await expect(validateSamlResponse(makeSamlProvider() as any, "no-nameid")).rejects.toThrow("valid email");
    });
    it("rejects response where both email and nameID have no valid email", async () => {
      mockValidatePostResponseAsync.mockResolvedValue({
        profile: { nameID: "no-email", email: null },
        loggedOut: false,
      });
      await expect(validateSamlResponse(makeSamlProvider() as any, "bad")).rejects.toThrow("valid email");
    });
  });
});
