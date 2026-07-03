// ─── SSO Provider Seed ───
// Seeds sample SSO provider configurations for demo/training environments.
// Only seeds into the platform organization.

import type { PrismaClient, Prisma } from "@prisma/client";
import { createHash, randomBytes, createCipheriv } from "crypto";

function encryptForSeed(plaintext: string): string {
  const secret = process.env.AUTH_SECRET || "dev-seed-secret-2026";
  const key = createHash("sha256").update(secret).digest();
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `enc:${iv.toString("hex")}:${authTag}:${encrypted}`;
}

const SEED_SSO_PROVIDERS: Array<{
  providerType: string;
  label: string;
  clientId: string;
  clientSecret: string;
  issuerUrl?: string;
  authorizationUrl?: string;
  tokenUrl?: string;
  userInfoUrl?: string;
  jwksUri?: string;
  samlEntryPoint?: string;
  samlIssuer?: string;
  samlCert?: string;
  domains: string[];
  enabled: boolean;
  metadata: Record<string, unknown>;
}> = [
  {
    providerType: "google",
    label: "Google Workspace - المؤسسة",
    clientId: "seed-google-client-id.apps.googleusercontent.com",
    clientSecret: "seed-google-client-secret",
    domains: ["@aqliya.com"],
    enabled: true,
    metadata: { note: "Seed data — replace with real credentials in production" },
  },
  {
    providerType: "github",
    label: "GitHub - فريق التطوير",
    clientId: "seed-github-client-id",
    clientSecret: "seed-github-client-secret",
    domains: ["@github.com"],
    enabled: true,
    metadata: { note: "Seed data — replace with real credentials in production" },
  },
  {
    providerType: "azure-ad",
    label: "Azure AD - المؤسسة",
    clientId: "seed-azure-ad-client-id",
    clientSecret: "seed-azure-ad-client-secret",
    issuerUrl: "https://login.microsoftonline.com/seed-tenant-id/v2.0",
    domains: ["@aqliya.com"],
    enabled: false,
    metadata: {
      tenantId: "seed-tenant-id",
      note: "Seed data — replace with real Azure AD tenant details",
    },
  },
  {
    providerType: "saml",
    label: "SAML - النظام الداخلي",
    clientId: "",
    clientSecret: "",
    samlEntryPoint: "https://saml.example.com/idp/login",
    samlIssuer: "urn:example:internal-idp",
    samlCert: `-----BEGIN CERTIFICATE-----
MIIDazCCAlMCFAjxRAndoQp7vEXAMPLEONLY
-----END CERTIFICATE-----`,
    domains: [],
    enabled: false,
    metadata: { note: "Seed data — replace with real SAML IdP metadata" },
  },
];

export async function seedSsoProviders(
  prisma: PrismaClient,
  platformOrganizationId: string,
): Promise<void> {
  for (const provider of SEED_SSO_PROVIDERS) {
    const encrypted = provider.clientSecret
      ? encryptForSeed(provider.clientSecret)
      : null;

    await prisma.ssoProvider.upsert({
      where: {
        // Use composite unique — we need to rely on (organizationId, providerType) or just create new
        id: `seed-${provider.providerType}`,
      },
      create: {
        id: `seed-${provider.providerType}`,
        organizationId: platformOrganizationId,
        providerType: provider.providerType,
        label: provider.label,
        clientId: provider.clientId || null,
        clientSecret: encrypted,
        issuerUrl: provider.issuerUrl ?? null,
        authorizationUrl: provider.authorizationUrl ?? null,
        tokenUrl: provider.tokenUrl ?? null,
        userInfoUrl: provider.userInfoUrl ?? null,
        jwksUri: provider.jwksUri ?? null,
        samlEntryPoint: provider.samlEntryPoint ?? null,
        samlIssuer: provider.samlIssuer ?? null,
        samlCert: provider.samlCert ?? null,
        domains: provider.domains as Prisma.InputJsonValue,
        enabled: provider.enabled,
        metadata: provider.metadata as unknown as Prisma.InputJsonValue,
      },
      update: {
        label: provider.label,
        clientId: provider.clientId || null,
        clientSecret: encrypted,
        issuerUrl: provider.issuerUrl ?? null,
        authorizationUrl: provider.authorizationUrl ?? null,
        tokenUrl: provider.tokenUrl ?? null,
        userInfoUrl: provider.userInfoUrl ?? null,
        jwksUri: provider.jwksUri ?? null,
        samlEntryPoint: provider.samlEntryPoint ?? null,
        samlIssuer: provider.samlIssuer ?? null,
        samlCert: provider.samlCert ?? null,
        domains: provider.domains as Prisma.InputJsonValue,
        enabled: provider.enabled,
        metadata: provider.metadata as unknown as Prisma.InputJsonValue,
      },
    });
  }
}
