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
import { getToken } from "next-auth/jwt";
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

    // ── CSRF protection: validate state against HTTP-only cookie ──
    const cookieState = request.cookies.get("oauth_state")?.value;
    if (!state || !cookieState || state !== cookieState) {
      return NextResponse.redirect(
        new URL(
          `/sales/settings/crm?oauth_error=${encodeURIComponent("Invalid or missing state parameter")}`,
          request.url,
        ),
      );
    }

    // ── Authenticate user to scope tokens to their organization ──
    const sessionToken = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      salt: "authjs.session-token",
    });
    if (!sessionToken?.sub) {
      return NextResponse.redirect(
        new URL(
          `/sales/settings/crm?oauth_error=${encodeURIComponent("Session expired — please log in again")}`,
          request.url,
        ),
      );
    }

    const orgId = (sessionToken.organizationId as string) ?? "system";

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

    // Retrieve PKCE code verifier from HTTP-only cookie
    const codeVerifier = request.cookies.get("oauth_verifier")?.value;

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(config, code, codeVerifier);

    await prisma.platformAuditLog.create({
      data: {
        platformOrganizationId: orgId,
        productKey: "salesos",
        actorName: `oauth-${provider}`,
        actorId: sessionToken.sub as string,
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

    // Clear OAuth cookies
    const response = NextResponse.redirect(
      new URL(
        `/sales/settings/crm?oauth_success=${provider}`,
        request.url,
      ),
    );
    response.cookies.set("oauth_state", "", { maxAge: 0, path: "/" });
    response.cookies.set("oauth_verifier", "", { maxAge: 0, path: "/" });
    return response;
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
