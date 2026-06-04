// ─── SSO Provider Management Service ───
// CRUD for organization-scoped SSO provider configurations.
// All mutations logged to PlatformAuditLog.

import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import type { SsoProvider } from "@prisma/client";

// ─── Types ───

export interface CreateSsoProviderInput {
  providerType: string;
  label: string;
  issuerUrl?: string;
  authorizationUrl?: string;
  tokenUrl?: string;
  userInfoUrl?: string;
  jwksUri?: string;
  clientId?: string;
  clientSecret?: string;
  samlEntryPoint?: string;
  samlIssuer?: string;
  samlCert?: string;
  attributeMapping?: Record<string, string>;
  domains?: string[];
  enabled?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpdateSsoProviderInput {
  label?: string;
  issuerUrl?: string;
  authorizationUrl?: string;
  tokenUrl?: string;
  userInfoUrl?: string;
  jwksUri?: string;
  clientId?: string;
  clientSecret?: string;
  samlEntryPoint?: string;
  samlIssuer?: string;
  samlCert?: string;
  attributeMapping?: Record<string, string>;
  domains?: string[];
  enabled?: boolean;
  metadata?: Record<string, unknown>;
}

export interface SsoProviderResponse {
  id: string;
  organizationId: string;
  providerType: string;
  label: string;
  issuerUrl: string | null;
  authorizationUrl: string | null;
  tokenUrl: string | null;
  userInfoUrl: string | null;
  jwksUri: string | null;
  clientId: string | null;
  clientSecret: string | null;
  samlEntryPoint: string | null;
  samlIssuer: string | null;
  samlCert: string | null;
  attributeMapping: Record<string, unknown> | null;
  domains: unknown;
  enabled: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

function toResponse(provider: SsoProvider): SsoProviderResponse {
  return {
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
}

// ─── Service ───

export async function getSsoProviders(organizationId: string): Promise<SsoProviderResponse[]> {
  const providers = await prisma.ssoProvider.findMany({
    where: { organizationId },
    orderBy: { createdAt: "asc" },
  });
  return providers.map(toResponse);
}

export async function getEnabledSsoProviders(organizationId: string): Promise<SsoProviderResponse[]> {
  const providers = await prisma.ssoProvider.findMany({
    where: { organizationId, enabled: true },
    orderBy: { createdAt: "asc" },
  });
  return providers.map(toResponse);
}

export async function createProvider(
  organizationId: string,
  data: CreateSsoProviderInput,
  actorId?: string,
): Promise<SsoProviderResponse> {
  const provider = await prisma.ssoProvider.create({
    data: {
      organizationId,
      providerType: data.providerType,
      label: data.label,
      issuerUrl: data.issuerUrl ?? null,
      authorizationUrl: data.authorizationUrl ?? null,
      tokenUrl: data.tokenUrl ?? null,
      userInfoUrl: data.userInfoUrl ?? null,
      jwksUri: data.jwksUri ?? null,
      clientId: data.clientId ?? null,
      clientSecret: data.clientSecret ?? null,
      samlEntryPoint: data.samlEntryPoint ?? null,
      samlIssuer: data.samlIssuer ?? null,
      samlCert: data.samlCert ?? null,
      attributeMapping: (data.attributeMapping ?? undefined) as Prisma.InputJsonValue | undefined,
      domains: (data.domains ?? undefined) as Prisma.InputJsonValue | undefined,
      enabled: data.enabled ?? true,
      metadata: (data.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });

  await writePlatformAuditLog({
    productKey: "platform",
    action: "sso.provider.created",
    platformOrganizationId: organizationId,
    targetType: "SsoProvider",
    targetId: provider.id,
    targetLabel: data.label,
    actorId,
    severity: "info",
    metadata: { providerType: data.providerType },
  });

  return toResponse(provider);
}

export async function updateProvider(
  organizationId: string,
  providerId: string,
  data: UpdateSsoProviderInput,
  actorId?: string,
): Promise<SsoProviderResponse | null> {
  const existing = await prisma.ssoProvider.findFirst({
    where: { id: providerId, organizationId },
  });
  if (!existing) return null;

  const updateData: Prisma.SsoProviderUpdateInput = {};

  if (data.label !== undefined) updateData.label = data.label;
  if (data.issuerUrl !== undefined) updateData.issuerUrl = data.issuerUrl;
  if (data.authorizationUrl !== undefined) updateData.authorizationUrl = data.authorizationUrl;
  if (data.tokenUrl !== undefined) updateData.tokenUrl = data.tokenUrl;
  if (data.userInfoUrl !== undefined) updateData.userInfoUrl = data.userInfoUrl;
  if (data.jwksUri !== undefined) updateData.jwksUri = data.jwksUri;
  if (data.clientId !== undefined) updateData.clientId = data.clientId;
  if (data.clientSecret !== undefined) updateData.clientSecret = data.clientSecret;
  if (data.samlEntryPoint !== undefined) updateData.samlEntryPoint = data.samlEntryPoint;
  if (data.samlIssuer !== undefined) updateData.samlIssuer = data.samlIssuer;
  if (data.samlCert !== undefined) updateData.samlCert = data.samlCert;
  if (data.attributeMapping !== undefined) {
    updateData.attributeMapping = data.attributeMapping as Prisma.InputJsonValue;
  }
  if (data.domains !== undefined) {
    updateData.domains = data.domains as Prisma.InputJsonValue;
  }
  if (data.enabled !== undefined) updateData.enabled = data.enabled;
  if (data.metadata !== undefined) {
    updateData.metadata = data.metadata as Prisma.InputJsonValue;
  }

  const updated = await prisma.ssoProvider.update({
    where: { id: providerId },
    data: updateData,
  });

  await writePlatformAuditLog({
    productKey: "platform",
    action: "sso.provider.updated",
    platformOrganizationId: organizationId,
    targetType: "SsoProvider",
    targetId: providerId,
    targetLabel: data.label || existing.label,
    actorId,
    severity: "info",
  });

  return toResponse(updated);
}

export async function deleteProvider(
  organizationId: string,
  providerId: string,
  actorId?: string,
): Promise<boolean> {
  const existing = await prisma.ssoProvider.findFirst({
    where: { id: providerId, organizationId },
  });
  if (!existing) return false;

  await prisma.ssoProvider.delete({
    where: { id: providerId },
  });

  await writePlatformAuditLog({
    productKey: "platform",
    action: "sso.provider.deleted",
    platformOrganizationId: organizationId,
    targetType: "SsoProvider",
    targetId: providerId,
    targetLabel: existing.label,
    actorId,
    severity: "warning",
  });

  return true;
}

export async function getProviderConfig(
  organizationId: string,
  providerType: string,
): Promise<SsoProviderResponse | null> {
  const provider = await prisma.ssoProvider.findFirst({
    where: { organizationId, providerType, enabled: true },
  });
  return provider ? toResponse(provider) : null;
}

export async function getProviderById(
  organizationId: string,
  providerId: string,
): Promise<SsoProviderResponse | null> {
  const provider = await prisma.ssoProvider.findFirst({
    where: { id: providerId, organizationId },
  });
  return provider ? toResponse(provider) : null;
}
