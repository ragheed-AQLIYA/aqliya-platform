// POST /api/auth/saml/[providerId]/callback
// Receives the SAMLResponse from the IdP (HTTP POST binding).
// Validates the assertion, looks up the user, creates a NextAuth JWT session,
// then redirects to the post-login destination.

import { NextRequest, NextResponse } from "next/server";
import { encode } from "@auth/core/jwt";
import { prisma } from "@/lib/prisma";
import { validateSamlResponse } from "@/lib/auth/saml/saml-sp";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";

export const runtime = "nodejs";

const SESSION_COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ providerId: string }> },
) {
  const { providerId } = await params;

  // ── Parse form body ──
  let samlResponseB64: string | null = null;
  let relayState: string | null = null;

  try {
    const formData = await req.formData();
    samlResponseB64 = formData.get("SAMLResponse") as string | null;
    relayState = formData.get("RelayState") as string | null;
  } catch {
    return loginError(req, "invalid_request");
  }

  if (!samlResponseB64) {
    return loginError(req, "missing_response");
  }

  // ── Resolve callback destination from RelayState ──
  let postLoginRedirect = "/";
  if (relayState) {
    try {
      const decoded = decodeURIComponent(relayState);
      if (decoded.startsWith("/") && !decoded.startsWith("//")) {
        postLoginRedirect = decoded;
      }
    } catch {
      // Ignore — use default
    }
  }

  // ── Load provider ──
  const provider = await prisma.ssoProvider.findFirst({
    where: {
      id: providerId,
      providerType: "saml",
      enabled: true,
    },
  });

  if (!provider) {
    return loginError(req, "provider_not_found");
  }

  const samlProvider = {
    id: provider.id,
    organizationId: provider.organizationId,
    providerType: provider.providerType,
    label: provider.label,
    issuerUrl: provider.issuerUrl,
    authorizationUrl: provider.authorizationUrl,
    tokenUrl: provider.tokenUrl,
    userInfoUrl: provider.userInfoUrl,
    jwksUri: provider.jwksUri,
    clientId: provider.clientId,
    clientSecret: provider.clientSecret,
    samlEntryPoint: provider.samlEntryPoint,
    samlIssuer: provider.samlIssuer,
    samlCert: provider.samlCert,
    attributeMapping: provider.attributeMapping as Record<string, unknown> | null,
    domains: provider.domains,
    enabled: provider.enabled,
    metadata: provider.metadata as Record<string, unknown> | null,
    createdAt: provider.createdAt,
    updatedAt: provider.updatedAt,
  };

  // ── Validate SAML assertion ──
  let samlProfile;
  try {
    const result = await validateSamlResponse(samlProvider, samlResponseB64);
    if (result.loggedOut) {
      return loginError(req, "saml_logout_unsupported");
    }
    samlProfile = result.profile;
  } catch (err) {
    await writePlatformAuditLog({
      productKey: "platform",
      action: "sso.saml.callback.invalid",
      platformOrganizationId: provider.organizationId,
      targetType: "SsoProvider",
      targetId: providerId,
      targetLabel: provider.label,
      severity: "warning",
      metadata: {
        error: err instanceof Error ? err.message : "unknown",
      },
    });
    return loginError(req, "saml_invalid");
  }

  // ── Look up user by email ──
  const dbUser = await prisma.user.findFirst({
    where: {
      email: samlProfile.email,
      organizationId: provider.organizationId,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      organizationId: true,
      mfaEnabled: true,
      organization: {
        select: { id: true, name: true, platformOrganizationId: true },
      },
    },
  });

  if (!dbUser) {
    await writePlatformAuditLog({
      productKey: "platform",
      action: "sso.saml.callback.user_not_found",
      platformOrganizationId: provider.organizationId,
      targetType: "SsoProvider",
      targetId: providerId,
      targetLabel: provider.label,
      severity: "warning",
      metadata: { email: samlProfile.email },
    });
    return loginError(req, "user_not_found");
  }

  // ── Build NextAuth-compatible JWT token ──
  const secret = process.env.AUTH_SECRET!;

  const jwtToken = await encode({
    token: {
      sub: dbUser.id,
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name ?? samlProfile.name,
      role: dbUser.role,
      organizationId: dbUser.organizationId,
      organization: dbUser.organization,
      platformOrganizationId:
        dbUser.organization?.platformOrganizationId ?? undefined,
      mfaEnabled: dbUser.mfaEnabled ?? false,
      mfaVerified: false,
      ssoProvider: `saml:${providerId}`,
    },
    secret,
    salt: SESSION_COOKIE,
    maxAge: COOKIE_MAX_AGE,
  });

  // ── Audit success ──
  await writePlatformAuditLog({
    productKey: "platform",
    action: "sso.saml.login",
    platformOrganizationId: provider.organizationId,
    actorId: dbUser.id,
    targetType: "User",
    targetId: dbUser.id,
    targetLabel: dbUser.email,
    severity: "info",
    metadata: { ssoProviderId: providerId, label: provider.label },
  });

  // ── Set session cookie and redirect ──
  const response = NextResponse.redirect(
    new URL(postLoginRedirect, req.nextUrl.origin),
  );

  response.cookies.set(SESSION_COOKIE, jwtToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  return response;
}

function loginError(req: NextRequest, code: string): NextResponse {
  return NextResponse.redirect(
    new URL(`/login?error=${encodeURIComponent(code)}`, req.nextUrl.origin),
  );
}
