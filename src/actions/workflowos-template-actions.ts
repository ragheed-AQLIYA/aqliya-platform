"use server";

import { prisma } from "@/lib/prisma";
import { requireUserContext, isExpectedAccessDeniedError } from "@/lib/auth";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import type { Prisma } from "@prisma/client";

function mapAuthError(error: unknown): string {
  const msg = error instanceof Error ? error.message : "";
  if (msg === "Unauthenticated") return "يجب تسجيل الدخول أولاً";
  if (msg.startsWith("Access denied:")) return "لا تملك صلاحية تنفيذ هذا الإجراء";
  return msg || "فشل العملية";
}

function validateSteps(steps: unknown[]): boolean {
  if (!Array.isArray(steps)) return false;
  const validTypes = new Set(["review", "approval", "evidence_upload", "notification", "escalation"]);
  return steps.every((step) => {
    const s = step as Record<string, unknown>;
    return (
      typeof s.name === "string" &&
      typeof s.type === "string" &&
      validTypes.has(s.type)
    );
  });
}

export async function createTemplate(data: {
  name: string;
  description?: string;
  category?: string;
  steps: unknown[];
  status?: string;
}) {
  try {
    const user = await requireUserContext();
    if (!data.name || data.name.trim().length === 0) {
      return { success: false, error: "اسم القالب مطلوب" };
    }
    if (!validateSteps(data.steps)) {
      return { success: false, error: "الخطوات غير صالحة. يجب تحديد اسم ونوع لكل خطوة" };
    }
    const template = await prisma.workflowTemplate.create({
      data: {
        organizationId: user.organizationId,
        platformOrganizationId: user.platformOrganizationId ?? null,
        name: data.name.trim(),
        description: data.description?.trim() ?? null,
        category: data.category ?? "general",
        steps: data.steps as Prisma.InputJsonValue,
        status: data.status ?? "draft",
        createdById: user.id,
      },
    });
    await writePlatformAuditLog({
      productKey: "workflowos",
      action: "template_created",
      actorId: user.id,
      targetType: "WorkflowTemplate",
      targetId: template.id,
      targetLabel: template.name,
      platformOrganizationId: user.platformOrganizationId ?? undefined,
      metadata: { category: data.category, stepCount: data.steps.length },
    });
    revalidatePath("/workflowos/templates");
    return { success: true, data: template };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) console.error("Error creating template:", error);
    return { success: false, error: mapAuthError(error) };
  }
}

export async function updateTemplate(
  id: string,
  data: {
    name?: string;
    description?: string;
    category?: string;
    steps?: unknown[];
    metadata?: Record<string, unknown>;
  },
) {
  try {
    const user = await requireUserContext();
    const existing = await prisma.workflowTemplate.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "النموذج غير موجود" };
    if (existing.organizationId !== user.organizationId) {
      return { success: false, error: "لا تملك صلاحية تعديل هذا النموذج" };
    }
    if (existing.status !== "draft") {
      return { success: false, error: "يمكن تعديل النماذج في حالة المسودة فقط" };
    }
    if (data.steps && !validateSteps(data.steps)) {
      return { success: false, error: "الخطوات غير صالحة" };
    }
    const template = await prisma.workflowTemplate.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name.trim() }),
        ...(data.description !== undefined && { description: data.description.trim() }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.steps !== undefined && { steps: data.steps as Prisma.InputJsonValue }),
        ...(data.metadata !== undefined && { metadata: data.metadata as Prisma.InputJsonValue }),
      },
    });
    await writePlatformAuditLog({
      productKey: "workflowos",
      action: "template_updated",
      actorId: user.id,
      targetType: "WorkflowTemplate",
      targetId: id,
      targetLabel: template.name,
      platformOrganizationId: user.platformOrganizationId ?? undefined,
      metadata: { changes: Object.keys(data) },
    });
    revalidatePath("/workflowos/templates");
    return { success: true, data: template };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) console.error("Error updating template:", error);
    return { success: false, error: mapAuthError(error) };
  }
}

export async function publishTemplate(id: string) {
  try {
    const user = await requireUserContext();
    const existing = await prisma.workflowTemplate.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "النموذج غير موجود" };
    if (existing.organizationId !== user.organizationId) {
      return { success: false, error: "لا تملك صلاحية نشر هذا النموذج" };
    }
    if (existing.status !== "draft") {
      return { success: false, error: "يمكن نشر النماذج في حالة المسودة فقط" };
    }
    const steps = existing.steps as unknown[];
    if (!Array.isArray(steps) || steps.length === 0) {
      return { success: false, error: "يجب إضافة خطوة واحدة على الأقل قبل النشر" };
    }
    const template = await prisma.workflowTemplate.update({
      where: { id },
      data: { status: "active" },
    });
    await writePlatformAuditLog({
      productKey: "workflowos",
      action: "template_published",
      actorId: user.id,
      targetType: "WorkflowTemplate",
      targetId: id,
      targetLabel: template.name,
      platformOrganizationId: user.platformOrganizationId ?? undefined,
    });
    revalidatePath("/workflowos/templates");
    return { success: true, data: template };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) console.error("Error publishing template:", error);
    return { success: false, error: mapAuthError(error) };
  }
}

export async function archiveTemplate(id: string) {
  try {
    const user = await requireUserContext();
    const existing = await prisma.workflowTemplate.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "النموذج غير موجود" };
    if (existing.organizationId !== user.organizationId) {
      return { success: false, error: "لا تملك صلاحية أرشفة هذا النموذج" };
    }
    const template = await prisma.workflowTemplate.update({
      where: { id },
      data: { status: "archived" },
    });
    await writePlatformAuditLog({
      productKey: "workflowos",
      action: "template_archived",
      actorId: user.id,
      targetType: "WorkflowTemplate",
      targetId: id,
      targetLabel: template.name,
      platformOrganizationId: user.platformOrganizationId ?? undefined,
    });
    revalidatePath("/workflowos/templates");
    return { success: true, data: template };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) console.error("Error archiving template:", error);
    return { success: false, error: mapAuthError(error) };
  }
}

export async function listTemplates(status?: string) {
  try {
    const user = await requireUserContext();
    const where: Record<string, unknown> = { organizationId: user.organizationId };
    if (status && status !== "all") where.status = status;
    const templates = await prisma.workflowTemplate.findMany({
      where,
      include: { _count: { select: { records: true } } },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: templates };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) console.error("Error listing templates:", error);
    return { success: false, error: "فشل جلب القوالب" };
  }
}

export async function shareTemplateAction(templateId: string, targetOrganizationId: string) {
  const { shareTemplate } = await import("@/lib/workflowos/template-service");
  const result = await shareTemplate(templateId, targetOrganizationId);
  if (result.success) revalidatePath("/workflowos/templates");
  return result;
}

export async function exportTemplateAction(templateId: string) {
  const { exportTemplate } = await import("@/lib/workflowos/template-service");
  return exportTemplate(templateId);
}

export async function importTemplateAction(
  data: string,
  organizationId: string,
) {
  try {
    const parsed = JSON.parse(data);
    const { importTemplate } = await import("@/lib/workflowos/template-service");
    const result = await importTemplate(parsed, organizationId);
    if (result.success) revalidatePath("/workflowos/templates");
    return result;
  } catch {
    return { success: false, error: "بيانات JSON غير صالحة" };
  }
}

export async function registerWebhookAction(
  organizationId: string,
  config: {
    url: string;
    label: string;
    events: string[];
    secret?: string;
  },
) {
  try {
    const user = await requireUserContext();
    if (user.organizationId !== organizationId) {
      return { success: false, error: "لا تملك صلاحية" };
    }
    const { getWebhookConfigs, saveWebhookConfigs } = await import("@/lib/workflowos/webhook-service");
    const configs = await getWebhookConfigs(organizationId);
    const newConfig = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      url: config.url,
      label: config.label,
      events: config.events,
      secret: config.secret,
      active: true,
    };
    configs.push(newConfig as (typeof configs)[number]);
    await saveWebhookConfigs(organizationId, configs);
    await writePlatformAuditLog({
      productKey: "workflowos",
      action: "webhook_registered",
      actorId: user.id,
      targetType: "webhook",
      targetId: newConfig.id,
      targetLabel: config.label,
      platformOrganizationId: user.platformOrganizationId ?? undefined,
      metadata: { url: config.url, events: config.events },
    });
    return { success: true, data: newConfig };
  } catch (error) {
    console.error("Error registering webhook:", error);
    return { success: false, error: "فشل تسجيل webhook" };
  }
}

export async function testWebhookAction(organizationId: string, webhookId: string) {
  try {
    const user = await requireUserContext();
    if (user.organizationId !== organizationId) {
      return { success: false, error: "لا تملك صلاحية" };
    }
    const { getWebhookConfigs, sendWebhook } = await import("@/lib/workflowos/webhook-service");
    const configs = await getWebhookConfigs(organizationId);
    const config = configs.find((c) => c.id === webhookId);
    if (!config) return { success: false, error: "Webhook غير موجود" };
    const result = await sendWebhook(
      "test",
      "record.created",
      { test: true, message: "اختبار اتصال webhook" },
      organizationId,
    );
    return { success: true, data: result };
  } catch (error) {
    console.error("Error testing webhook:", error);
    return { success: false, error: "فشل اختبار webhook" };
  }
}

export async function listWebhooksAction(organizationId: string) {
  try {
    const { getWebhookConfigs } = await import("@/lib/workflowos/webhook-service");
    const configs = await getWebhookConfigs(organizationId);
    return { success: true, data: configs };
  } catch (error) {
    console.error("Error listing webhooks:", error);
    return { success: false, error: "فشل جلب webhooks" };
  }
}

export async function deleteWebhookAction(organizationId: string, webhookId: string) {
  try {
    const user = await requireUserContext();
    if (user.organizationId !== organizationId) {
      return { success: false, error: "لا تملك صلاحية" };
    }
    const { getWebhookConfigs, saveWebhookConfigs } = await import("@/lib/workflowos/webhook-service");
    const configs = await getWebhookConfigs(organizationId);
    const filtered = configs.filter((c) => c.id !== webhookId);
    await saveWebhookConfigs(organizationId, filtered);
    await writePlatformAuditLog({
      productKey: "workflowos",
      action: "webhook_deleted",
      actorId: user.id,
      targetType: "webhook",
      targetId: webhookId,
      platformOrganizationId: user.platformOrganizationId ?? undefined,
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting webhook:", error);
    return { success: false, error: "فشل حذف webhook" };
  }
}


