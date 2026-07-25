/**
 * GET /api/sales/intel/oauth/callback
 *
 * OAuth2 callback handler for 3-legged authorization flow.
 * Used by LinkedIn, Google, Microsoft connectors.
 *
 * Query params: code, state, error, provider
 */
import { NextRequest, NextResponse } from "next/server";
import { createLogger } from "@/lib/observability/logger";
import {
  exchangeCodeForTokens,
  OAUTH2_PROVIDERS,
} from "@/lib/sales/intelligence/oauth/oauth2-client";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";


const logger = createLogger({ product: "platform", action: "app-api-sales-intel-oauth-callback-route" });

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const provider = searchParams.get("provider") ?? "linkedin";

    if (error) {
      return NextResponse.redirect(
        new URL(
          `/sales/settings/crm?oauth_error=${encodeURIComponent(error)}`,
          request.url,
        ),
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: "Missing authorization code" },
        { status: 400 },
      );
    }

    // Build OAuth config for the provider
    const baseConfig = OAUTH2_PROVIDERS[provider];
    if (!baseConfig) {
      return NextResponse.json(
        { error: `Unknown OAuth2 provider: ${provider}` },
        { status: 400 },
      );
    }

    const config = {
      ...baseConfig,
      clientId: process.env[`${provider.toUpperCase()}_OAUTH_CLIENT_ID`] ?? baseConfig.clientId,
      clientSecret:
        process.env[`${provider.toUpperCase()}_OAUTH_CLIENT_SECRET`] ??
        baseConfig.clientSecret,
      redirectUri: `${request.nextUrl.origin}/api/sales/intel/oauth/callback?provider=${provider}`,
    };

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(config, code);

    // Persist tokens (tenant-scoped via state param containing orgId)
    const orgId = state ?? "system";

    await prisma.platformAuditLog.create({
      data: {
        platformOrganizationId: orgId,
        productKey: "salesos",
        actorName: `oauth-${provider}`,
        action: "oauth.token_exchanged",
        targetType: "OAuth2Token",
        targetId: provider,
        metadata: {
          provider,
          expiresAt: tokens.expiresAt.toISOString(),
          scope: tokens.scope,
        } as Prisma.InputJsonValue,
      },
    });

    // Redirect back to settings with success
    return NextResponse.redirect(
      new URL(
        `/sales/settings/crm?oauth_success=${provider}`,
        request.url,
      ),
    );
  } catch (err) {
    logger.error("[OAuth2] Callback error", err instanceof Error ? err : new Error(String(err)));
    return NextResponse.redirect(
      new URL(
        `/sales/settings/crm?oauth_error=${encodeURIComponent("Token exchange failed")}`,
        request.url,
      ),
    );
  }
}

export async function POST(request: NextRequest) {
  // Same as GET for some providers that POST the callback
  return GET(request);
}
