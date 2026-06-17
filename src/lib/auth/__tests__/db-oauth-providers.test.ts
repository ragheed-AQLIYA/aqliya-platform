import { buildProviderConfig } from "@/lib/auth/sso-providers";
import { dbSsoProviderAuthId } from "@/lib/auth/db-oauth-providers";
import type { SsoProvider } from "@prisma/client";

describe("db SSO provider wiring", () => {
  it("generates stable NextAuth provider ids for DB records", () => {
    expect(dbSsoProviderAuthId("clxyz123")).toBe("sso-clxyz123");
  });

  it("buildProviderConfig uses authProviderId override for DB-backed providers", () => {
    const record = {
      id: "prov-1",
      providerType: "custom-oidc",
      label: "Corp OIDC",
      clientId: "client-id",
      clientSecret: "secret",
      issuerUrl: "https://idp.example.com",
      authorizationUrl: null,
      tokenUrl: null,
      userInfoUrl: null,
      jwksUri: null,
      samlEntryPoint: null,
      samlIssuer: null,
      samlCert: null,
      attributeMapping: null,
      domains: null,
      enabled: true,
      metadata: null,
      organizationId: "org-1",
      createdById: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } satisfies SsoProvider;

    const config = buildProviderConfig(record, {
      authProviderId: dbSsoProviderAuthId(record.id),
    });

    expect(config).not.toBeNull();
    expect(config?.id).toBe("sso-prov-1");
    expect(config?.clientId).toBe("client-id");
  });
});
