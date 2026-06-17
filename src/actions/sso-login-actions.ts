"use server";

import "server-only";

import { prisma } from "@/lib/prisma";
import {
  dbSsoProviderAuthId,
} from "@/lib/auth/db-oauth-providers";
import { buildProviderConfig } from "@/lib/auth/sso-providers";
import { getProviderList } from "@/lib/auth/sso-providers";

export interface AvailableProvider {
  id: string;
  label: string;
  icon: string;
}

const ENV_PROVIDER_IDS = new Set(["google", "github", "azure-ad", "okta"]);

function envProviders(): AvailableProvider[] {
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

/** Env OAuth + enabled DB SSO providers for the login page. */
export async function getAvailableSsoProvidersAction(): Promise<
  AvailableProvider[]
> {
  const providers = envProviders();
  const envIds = new Set(providers.map((p) => p.id));

  try {
    const records = await prisma.ssoProvider.findMany({
      where: {
        enabled: true,
        providerType: { not: "saml" },
      },
      orderBy: { createdAt: "asc" },
    });

    for (const record of records) {
      const built = buildProviderConfig(record, {
        authProviderId: dbSsoProviderAuthId(record.id),
      });
      if (!built?.clientId) {
        continue;
      }

      const authId = dbSsoProviderAuthId(record.id);
      if (ENV_PROVIDER_IDS.has(record.providerType) && envIds.has(record.providerType)) {
        continue;
      }

      const icon =
        getProviderList().find((p) => p.id === record.providerType)?.icon ??
        record.providerType;

      providers.push({
        id: authId,
        label: record.label,
        icon,
      });
    }
  } catch {
    // DB unavailable — env providers still shown
  }

  return providers;
}
