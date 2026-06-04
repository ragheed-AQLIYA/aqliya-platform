import type { OAuthConfig } from "next-auth/providers";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Okta from "next-auth/providers/okta";

/** OAuth providers enabled via environment variables only (invite-only sign-in). */
export function getEnvOAuthProviders(): OAuthConfig<Record<string, unknown>>[] {
  const providers: OAuthConfig<Record<string, unknown>>[] = [];

  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
    providers.push(
      Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
      }) as OAuthConfig<Record<string, unknown>>,
    );
  }

  if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
    providers.push(
      GitHub({
        clientId: process.env.AUTH_GITHUB_ID,
        clientSecret: process.env.AUTH_GITHUB_SECRET,
      }) as OAuthConfig<Record<string, unknown>>,
    );
  }

  if (
    process.env.AUTH_AZURE_AD_ID &&
    process.env.AUTH_AZURE_AD_SECRET &&
    process.env.AUTH_AZURE_AD_TENANT_ID
  ) {
    const tenantId = process.env.AUTH_AZURE_AD_TENANT_ID;
    providers.push({
      id: "azure-ad",
      name: "Azure AD",
      type: "oidc",
      issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
      clientId: process.env.AUTH_AZURE_AD_ID,
      clientSecret: process.env.AUTH_AZURE_AD_SECRET,
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
    });
  }

  if (
    process.env.AUTH_OKTA_ID &&
    process.env.AUTH_OKTA_SECRET &&
    process.env.AUTH_OKTA_ISSUER
  ) {
    providers.push(
      Okta({
        clientId: process.env.AUTH_OKTA_ID,
        clientSecret: process.env.AUTH_OKTA_SECRET,
        issuer: process.env.AUTH_OKTA_ISSUER,
      }) as OAuthConfig<Record<string, unknown>>,
    );
  }

  return providers;
}
