"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import type { CurrentUser } from "@/lib/auth";
import { signDownloadToken } from "@/lib/download-token";
import { auditLogger, Product } from "@/lib/platform/audit-logger";

async function verifyDownloadPermission(
  user: CurrentUser,
  resourceType: string,
  resourceId: string,
): Promise<void> {
  switch (resourceType) {
    case "audit_evidence": {
      const evidence = await prisma.auditEvidence.findUnique({
        where: { id: resourceId },
        include: { engagement: { select: { organizationId: true } } },
      });
      if (
        !evidence ||
        evidence.engagement.organizationId !== user.organizationId
      ) {
        throw new Error("Resource not found");
      }
      return;
    }
    case "office_ai_output": {
      const output = await prisma.officeAiOutput.findUnique({
        where: { id: resourceId },
        include: { task: { select: { platformOrganizationId: true } } },
      });
      if (
        !output ||
        output.task.platformOrganizationId !== user.platformOrganizationId
      ) {
        throw new Error("Resource not found");
      }
      return;
    }
    default:
      throw new Error(`Unsupported resource type: ${resourceType}`);
  }
}

export async function requestDownloadTokenAction(params: {
  resourceType: string;
  resourceId: string;
}): Promise<
  { url: string; token: string; expiresInMinutes: number } | { error: string }
> {
  try {
    const user = await getCurrentUser();
    await verifyDownloadPermission(
      user,
      params.resourceType,
      params.resourceId,
    );

    const token = await signDownloadToken({
      userId: user.id,
      organizationId: user.organizationId,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
    });

    const alog = auditLogger({
      productKey: Product.PLATFORM,
      sourceSystem: "download_token_actions",
      organization: { platformOrganizationId: user.platformOrganizationId },
      actor: { id: user.id, name: user.name, type: user.role },
    });
    await alog.record(
      "download_token.issued",
      {
        type: params.resourceType,
        id: params.resourceId,
      },
      { status: "success" },
    );

    return { url: `?token=${token}`, token, expiresInMinutes: 5 };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate download token";
    return { error: message };
  }
}
