"use server";

import "server-only";

export interface AvailableProvider {
  id: string;
  label: string;
  icon: string;
}

/** Providers enabled via env — shown on login when configured. */
export async function getAvailableSsoProvidersAction(): Promise<
  AvailableProvider[]
> {
  const providers: AvailableProvider[] = [];

  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
    providers.push({ id: "google", label: "Google", icon: "google" });
  }

  if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
    providers.push({ id: "github", label: "GitHub", icon: "github" });
  }

  if (
    process.env.AUTH_AZURE_AD_ID &&
    process.env.AUTH_AZURE_AD_SECRET &&
    process.env.AUTH_AZURE_AD_TENANT_ID
  ) {
    providers.push({ id: "azure-ad", label: "Azure AD", icon: "azure" });
  }

  if (
    process.env.AUTH_OKTA_ID &&
    process.env.AUTH_OKTA_SECRET &&
    process.env.AUTH_OKTA_ISSUER
  ) {
    providers.push({ id: "okta", label: "Okta", icon: "okta" });
  }

  return providers;
}
