import "server-only";

import type { OAuthConfig } from "next-auth/providers";
import { prisma } from "@/lib/prisma";
import { buildProviderConfig } from "@/lib/auth/sso-providers";

/** NextAuth provider id for a DB-backed SSO record (unique per org config). */
export function dbSsoProviderAuthId(ssoProviderId: string): string {
  return `sso-${ssoProviderId}`;
}

function hasOAuthCredentials(
  config: OAuthConfig<Record<string, unknown>> | null,
): config is OAuthConfig<Record<string, unknown>> {
  return Boolean(config?.clientId);
}

/**
 * Load enabled organization SSO configs into NextAuth OAuth providers.
 * SAML is excluded (not supported in NextAuth v5 yet).
 */
export async function loadEnabledDbOAuthProviders(): Promise<
  OAuthConfig<Record<string, unknown>>[]
> {
  try {
    const records = await prisma.ssoProvider.findMany({
      where: {
        enabled: true,
        providerType: { not: "saml" },
      },
      orderBy: { createdAt: "asc" },
    });

    const providers: OAuthConfig<Record<string, unknown>>[] = [];

    for (const record of records) {
      const built = buildProviderConfig(record, {
        authProviderId: dbSsoProviderAuthId(record.id),
      });
      if (hasOAuthCredentials(built)) {
        providers.push(built);
      }
    }

    return providers;
  } catch (error) {
    console.error("Failed to load DB SSO providers:", error);
    return [];
  }
}
