import "server-only";

import { prisma } from "@/lib/prisma";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { requireUserContext } from "@/lib/auth";
import type { Prisma } from "@prisma/client";

export interface TemplateExportData {
  version: "1.0";
  exportedAt: string;
  template: {
    name: string;
    description: string | null;
    category: string;
    steps: unknown[];
    metadata: Record<string, unknown> | null;
  };
}

export async function shareTemplate(
  templateId: string,
  targetOrganizationId: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await requireUserContext();
  const template = await prisma.workflowTemplate.findUnique({
    where: { id: templateId },
    select: {
      organizationId: true,
      name: true,
      description: true,
      category: true,
      steps: true,
      metadata: true,
      createdById: true,
    },
  });
  if (!template) return { success: false, error: "النموذج غير موجود" };
  if (template.organizationId !== user.organizationId) {
    return { success: false, error: "لا تملك صلاحية مشاركة هذا النموذج" };
  }

  await prisma.workflowTemplate.create({
    data: {
      organizationId: targetOrganizationId,
      platformOrganizationId: user.platformOrganizationId ?? null,
      name: template.name,
      description: template.description,
      category: template.category,
      steps: template.steps as Prisma.InputJsonValue,
      metadata: (template.metadata as Prisma.InputJsonValue) ?? undefined,
      createdById: user.id,
      status: "draft",
    },
  });

  await writePlatformAuditLog({
    productKey: "workflowos",
    action: "template_shared",
    actorId: user.id,
    targetType: "WorkflowTemplate",
    targetId: templateId,
    targetLabel: template.name,
    platformOrganizationId: user.platformOrganizationId ?? undefined,
    metadata: { sharedWith: targetOrganizationId },
  });

  return { success: true };
}

export async function exportTemplate(
  templateId: string,
): Promise<{ success: boolean; data?: TemplateExportData; error?: string }> {
  const user = await requireUserContext();
  const template = await prisma.workflowTemplate.findUnique({
    where: { id: templateId },
    select: {
      organizationId: true,
      name: true,
      description: true,
      category: true,
      steps: true,
      metadata: true,
    },
  });
  if (!template) return { success: false, error: "النموذج غير موجود" };
  if (template.organizationId !== user.organizationId) {
    return { success: false, error: "لا تملك صلاحية تصدير هذا النموذج" };
  }

  const exportData: TemplateExportData = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    template: {
      name: template.name,
      description: template.description,
      category: template.category,
      steps: template.steps as unknown[],
      metadata: template.metadata as Record<string, unknown> | null,
    },
  };

  await writePlatformAuditLog({
    productKey: "workflowos",
    action: "template_exported",
    actorId: user.id,
    targetType: "WorkflowTemplate",
    targetId: templateId,
    targetLabel: template.name,
    platformOrganizationId: user.platformOrganizationId ?? undefined,
  });

  return { success: true, data: exportData };
}

export async function importTemplate(
  data: TemplateExportData,
  organizationId: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await requireUserContext();
  if (user.organizationId !== organizationId) {
    return { success: false, error: "لا تملك صلاحية الاستيراد لهذه المنظمة" };
  }

  if (!data.template?.name || !data.template?.steps) {
    return { success: false, error: "بيانات النموذج غير صالحة" };
  }

  const template = await prisma.workflowTemplate.create({
    data: {
      organizationId,
      platformOrganizationId: user.platformOrganizationId ?? null,
      name: data.template.name,
      description: data.template.description ?? null,
      category: data.template.category ?? "general",
      steps: data.template.steps as Prisma.InputJsonValue,
      metadata: (data.template.metadata as Prisma.InputJsonValue) ?? undefined,
      createdById: user.id,
      status: "draft",
    },
  });

  await writePlatformAuditLog({
    productKey: "workflowos",
    action: "template_imported",
    actorId: user.id,
    targetType: "WorkflowTemplate",
    targetId: template.id,
    targetLabel: template.name,
    platformOrganizationId: user.platformOrganizationId ?? undefined,
  });

  return { success: true };
}

export async function listAvailableTemplates(
  organizationId: string,
): Promise<{ success: boolean; data?: unknown[]; error?: string }> {
  const user = await requireUserContext();
  if (user.organizationId !== organizationId) {
    return { success: false, error: "لا تملك صلاحية الوصول" };
  }

  const templates = await prisma.workflowTemplate.findMany({
    where: {
      OR: [
        { organizationId },
        {
          platformOrganizationId: user.platformOrganizationId ?? undefined,
          status: "active",
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      status: true,
      organizationId: true,
      createdAt: true,
    },
  });

  return { success: true, data: templates };
}
