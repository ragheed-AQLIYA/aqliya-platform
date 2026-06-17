// GET /api/auth/saml/[providerId]/metadata
// Returns the SAML Service Provider metadata XML for IdP configuration.
// Public endpoint — the IdP admin needs this to register AQLIYA as an SP.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSamlSpMetadataXml } from "@/lib/auth/saml/saml-sp";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ providerId: string }> },
) {
  const { providerId } = await params;

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

  const xml = getSamlSpMetadataXml(samlProvider);

  if (!xml) {
    return NextResponse.json(
      { error: "SAML provider is missing required configuration (cert or entryPoint)" },
      { status: 422 },
    );
  }

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Content-Disposition": `inline; filename="saml-metadata-${providerId}.xml"`,
    },
  });
}
