import { prisma } from "@/lib/prisma";

export type SalesEvidenceSource =
  | "decision"
  | "local_content"
  | "audit"
  | "external";

export interface ResolvedSalesEvidenceRef {
  id: string;
  source: SalesEvidenceSource;
  title: string;
  type: string;
  organizationId: string;
}

async function resolveDecisionEvidence(
  evidenceId: string,
  organizationId: string,
): Promise<ResolvedSalesEvidenceRef | null> {
  const row = await prisma.decisionEvidence.findFirst({
    where: { id: evidenceId, organizationId },
    select: {
      id: true,
      organizationId: true,
      filename: true,
      fileType: true,
      description: true,
    },
  });
  if (!row) return null;
  return {
    id: row.id,
    source: "decision",
    title: row.description?.trim() || row.filename,
    type: row.fileType,
    organizationId: row.organizationId,
  };
}

async function resolveLocalContentEvidence(
  evidenceId: string,
  organizationId: string,
): Promise<ResolvedSalesEvidenceRef | null> {
  const row = await prisma.localContentEvidence.findFirst({
    where: { id: evidenceId, project: { organizationId } },
    select: {
      id: true,
      filename: true,
      evidenceType: true,
      project: { select: { organizationId: true } },
    },
  });
  if (!row) return null;
  return {
    id: row.id,
    source: "local_content",
    title: row.filename,
    type: row.evidenceType,
    organizationId: row.project.organizationId,
  };
}

async function resolveAuditEvidence(
  evidenceId: string,
  platformOrganizationId: string | null | undefined,
): Promise<ResolvedSalesEvidenceRef | null> {
  if (!platformOrganizationId) return null;

  const row = await prisma.auditEvidence.findFirst({
    where: { id: evidenceId },
    select: {
      id: true,
      filename: true,
      fileType: true,
      engagement: { select: { organizationId: true } },
    },
  });
  if (!row) return null;

  const auditOrg = await prisma.auditOrganization.findUnique({
    where: { id: row.engagement.organizationId },
    select: { platformOrganizationId: true },
  });
  if (auditOrg?.platformOrganizationId !== platformOrganizationId) {
    return null;
  }

  return {
    id: row.id,
    source: "audit",
    title: row.filename,
    type: row.fileType,
    organizationId: platformOrganizationId,
  };
}

export async function resolveEvidenceForSalesOrg(params: {
  evidenceId: string;
  organizationId: string;
  platformOrganizationId?: string | null;
  preferredSource?: SalesEvidenceSource;
}): Promise<ResolvedSalesEvidenceRef | null> {
  const { evidenceId, organizationId, platformOrganizationId, preferredSource } =
    params;

  const resolvers: Array<() => Promise<ResolvedSalesEvidenceRef | null>> = [];

  if (!preferredSource || preferredSource === "decision") {
    resolvers.push(() => resolveDecisionEvidence(evidenceId, organizationId));
  }
  if (!preferredSource || preferredSource === "local_content") {
    resolvers.push(() =>
      resolveLocalContentEvidence(evidenceId, organizationId),
    );
  }
  if (!preferredSource || preferredSource === "audit") {
    resolvers.push(() =>
      resolveAuditEvidence(evidenceId, platformOrganizationId),
    );
  }

  for (const resolve of resolvers) {
    const resolved = await resolve();
    if (resolved) return resolved;
  }

  return null;
}

export async function assertEvidenceAccessibleInSalesOrg(params: {
  evidenceId: string;
  organizationId: string;
  platformOrganizationId?: string | null;
  preferredSource?: SalesEvidenceSource;
}): Promise<ResolvedSalesEvidenceRef> {
  const resolved = await resolveEvidenceForSalesOrg(params);
  if (!resolved) {
    throw new Error(
      "SalesOS: evidence not found or not accessible in this organization",
    );
  }

  if (
    resolved.source !== "audit" &&
    resolved.organizationId !== params.organizationId
  ) {
    throw new Error("SalesOS: evidence belongs to another organization");
  }

  return resolved;
}
