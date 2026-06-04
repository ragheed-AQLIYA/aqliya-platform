// ─── SSO Provider Registry ───
// Builds NextAuth OAuth provider configs from SsoProvider records.
// Well-known providers (Google, GitHub, Azure AD, Okta) use env vars.
// Custom OIDC/SAML built from stored config.

import type { SsoProvider } from "@prisma/client";
import type { OAuthConfig, OIDCConfig } from "next-auth/providers";

// ─── Supported Provider Types ───

export const SUPPORTED_PROVIDERS = [
  { id: "google", label: "Google", icon: "google" },
  { id: "github", label: "GitHub", icon: "github" },
  { id: "azure-ad", label: "Azure AD", icon: "azure" },
  { id: "okta", label: "Okta", icon: "okta" },
  { id: "custom-oidc", label: "Custom OIDC", icon: "oidc" },
  { id: "saml", label: "SAML", icon: "saml" },
] as const;

export type SupportedProviderId = (typeof SUPPORTED_PROVIDERS)[number]["id"];

export function getProviderList(): ReadonlyArray<{ id: string; label: string; icon: string }> {
  return SUPPORTED_PROVIDERS;
}

export function isSupportedProvider(id: string): id is SupportedProviderId {
  return SUPPORTED_PROVIDERS.some((p) => p.id === id);
}

// ─── OAuth Provider Config Builder ───

export interface OAuthProviderConfig {
  clientId: string;
  clientSecret: string;
  issuer?: string;
  wellKnown?: string;
  authorization?: { params?: Record<string, string> };
  token?: string;
  userinfo?: string;
  jwksUri?: string;
}

export function buildProviderConfig(
  ssoProvider: SsoProvider,
): OAuthConfig<Record<string, unknown>> | OIDCConfig<Record<string, unknown>> | null {
  const providerType = ssoProvider.providerType;

  switch (providerType) {
    case "google":
      return buildGoogleProvider(ssoProvider);
    case "github":
      return buildGitHubProvider(ssoProvider);
    case "azure-ad":
      return buildAzureAdProvider(ssoProvider);
    case "okta":
      return buildOktaProvider(ssoProvider);
    case "custom-oidc":
      return buildCustomOidcProvider(ssoProvider);
    case "saml":
      return buildSamlProvider(ssoProvider);
    default:
      return null;
  }
}

function buildGoogleProvider(
  ssoProvider: SsoProvider,
): OAuthConfig<Record<string, unknown>> {
  const clientId = ssoProvider.clientId || process.env.AUTH_GOOGLE_ID || "";
  const clientSecret = ssoProvider.clientSecret || process.env.AUTH_GOOGLE_SECRET || "";

  return {
    id: "google",
    name: "Google",
    type: "oidc" as const,
    issuer: "https://accounts.google.com",
    clientId,
    clientSecret,
    authorization: {
      params: {
        scope: "openid email profile",
        prompt: "consent",
        access_type: "offline",
        response_type: "code",
      },
    },
    checks: ["pkce", "state"],
    profile(profile: Record<string, unknown>) {
      return {
        id: String(profile.sub),
        email: String(profile.email),
        name: String(profile.name),
        image: String(profile.picture),
      };
    },
  } satisfies OAuthConfig<Record<string, unknown>>;
}

function buildGitHubProvider(
  ssoProvider: SsoProvider,
): OAuthConfig<Record<string, unknown>> {
  const clientId = ssoProvider.clientId || process.env.AUTH_GITHUB_ID || "";
  const clientSecret = ssoProvider.clientSecret || process.env.AUTH_GITHUB_SECRET || "";

  return {
    id: "github",
    name: "GitHub",
    type: "oauth" as const,
    clientId,
    clientSecret,
    authorization: {
      url: "https://github.com/login/oauth/authorize",
      params: { scope: "read:user user:email" },
    },
    token: "https://github.com/login/oauth/access_token",
    userinfo: {
      url: "https://api.github.com/user",
      async request({ tokens, provider }: { tokens: any; provider: any }) {
        const url = new URL(provider.userinfo?.url as string);
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const user = await res.json();
        // Get verified primary email
        const emailsRes = await fetch("https://api.github.com/user/emails", {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const emails = await emailsRes.json();
        const primary = emails.find((e: { primary: boolean; verified: boolean }) => e.primary && e.verified);
        if (primary) {
          user.email = primary.email;
        }
        return user;
      },
    },
    profile(profile: Record<string, unknown>) {
      return {
        id: String(profile.id),
        email: String(profile.email),
        name: String(profile.name || profile.login),
        image: String(profile.avatar_url),
      };
    },
  } satisfies OAuthConfig<Record<string, unknown>>;
}

function buildAzureAdProvider(
  ssoProvider: SsoProvider,
): OAuthConfig<Record<string, unknown>> {
  const tenantId = ssoProvider.issuerUrl || process.env.AUTH_AZURE_AD_TENANT_ID || "common";
  const clientId = ssoProvider.clientId || process.env.AUTH_AZURE_AD_ID || "";
  const clientSecret = ssoProvider.clientSecret || process.env.AUTH_AZURE_AD_SECRET || "";

  return {
    id: "azure-ad",
    name: "Azure AD",
    type: "oidc" as const,
    issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
    clientId,
    clientSecret,
    authorization: {
      params: {
        scope: "openid email profile",
        response_type: "code",
      },
    },
    profile(profile: Record<string, unknown>) {
      return {
        id: String(profile.sub || profile.oid),
        email: String(profile.email || profile.preferred_username || ""),
        name: String(profile.name || ""),
        image: null,
      };
    },
  } satisfies OAuthConfig<Record<string, unknown>>;
}

function buildOktaProvider(
  ssoProvider: SsoProvider,
): OAuthConfig<Record<string, unknown>> {
  const issuer = ssoProvider.issuerUrl || "";
  const clientId = ssoProvider.clientId || "";
  const clientSecret = ssoProvider.clientSecret || "";

  return {
    id: "okta",
    name: "Okta",
    type: "oidc" as const,
    issuer: issuer || undefined,
    clientId,
    clientSecret,
    authorization: {
      params: {
        scope: "openid email profile",
        response_type: "code",
      },
    },
    profile(profile: Record<string, unknown>) {
      return {
        id: String(profile.sub),
        email: String(profile.email),
        name: String(profile.name),
        image: String(profile.picture || ""),
      };
    },
  } satisfies OAuthConfig<Record<string, unknown>>;
}

function buildCustomOidcProvider(
  ssoProvider: SsoProvider,
): OIDCConfig<Record<string, unknown>> | null {
  const clientId = ssoProvider.clientId;
  const clientSecret = ssoProvider.clientSecret;
  const issuer = ssoProvider.issuerUrl;
  const authUrl = ssoProvider.authorizationUrl;
  const tokenUrl = ssoProvider.tokenUrl;
  const userInfoUrl = ssoProvider.userInfoUrl;

  if (!clientId) return null;

  const config: OIDCConfig<Record<string, unknown>> = {
    id: "custom-oidc",
    name: ssoProvider.label || "Custom OIDC",
    type: "oidc" as const,
    clientId,
    clientSecret: clientSecret || "",
    issuer: issuer || undefined,
    authorization: authUrl ? {
      url: authUrl,
      params: {
        scope: "openid email profile",
        response_type: "code",
      },
    } : {
      params: {
        scope: "openid email profile",
        response_type: "code",
      },
    },
    token: tokenUrl || undefined,
    userinfo: userInfoUrl || undefined,
    checks: ["pkce", "state"],
    profile(profile: Record<string, unknown>) {
      return {
        id: String(profile.sub || profile.id || ""),
        email: String(profile.email || ""),
        name: String(profile.name || profile.preferred_username || ""),
        image: String(profile.picture || ""),
      };
    },
  };

  return config;
}

function buildSamlProvider(
  _ssoProvider: SsoProvider,
): OAuthConfig<Record<string, unknown>> | null {
  // SAML is not natively supported in NextAuth v5.
  // Placeholder for future SAML integration via custom adapter.
  return null;
}
