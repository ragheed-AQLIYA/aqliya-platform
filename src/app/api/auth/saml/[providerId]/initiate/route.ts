// GET /api/auth/saml/[providerId]/initiate?callbackUrl=/audit
// Redirects the user to the IdP to begin SAML authentication.
// Accepts an optional `callbackUrl` query param (validated server-side).

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSamlAuthorizeUrl } from "@/lib/auth/saml/saml-sp";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ providerId: string }> },
) {
  const { providerId } = await params;
  const rawCallback = req.nextUrl.searchParams.get("callbackUrl") ?? "/";
  // Validate callback — only allow internal relative paths
  const callbackUrl =
    rawCallback.startsWith("/") && !rawCallback.startsWith("//")
      ? rawCallback
      : "/";

  const provider = await prisma.ssoProvider.findFirst({
    where: {
      id: providerId,
      providerType: "saml",
      enabled: true,
    },
  });

  if (!provider) {
    return NextResponse.json({ error: "SAML provider not found" }, { status: 404 });
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

  // RelayState carries the callback URL for post-login redirect
  const relayState = encodeURIComponent(callbackUrl);

  const authorizeUrl = await getSamlAuthorizeUrl(samlProvider, relayState);

  if (!authorizeUrl) {
    await writePlatformAuditLog({
      productKey: "platform",
      action: "sso.saml.initiate.failed",
      platformOrganizationId: provider.organizationId,
      targetType: "SsoProvider",
      targetId: providerId,
      targetLabel: provider.label,
      severity: "warning",
      metadata: { reason: "Missing cert or entryPoint" },
    });

    return NextResponse.redirect(
      new URL(
        `/login?error=SamlConfigError`,
        req.nextUrl.origin,
      ),
    );
  }

  await writePlatformAuditLog({
    productKey: "platform",
    action: "sso.saml.initiate",
    platformOrganizationId: provider.organizationId,
    targetType: "SsoProvider",
    targetId: providerId,
    targetLabel: provider.label,
    severity: "info",
  });

  return NextResponse.redirect(authorizeUrl);
}
