"use server";

import { createLogger } from "@/lib/observability/logger";

import {
  getCurrentUser,
  enforce,
  prisma,
  revalidatePath,
  isExpectedAccessDeniedError,
  mapAuthError,
} from "./common";
import type { Prisma } from "./common";

const logger = createLogger({ product: "platform", action: "unknown" });

export async function createWorkflowTemplate(data: {
  name: string;
  description?: string;
  category?: string;
  steps: unknown[];
}) {
  try {
    const user = await getCurrentUser();
    await enforce(user, { type: "organization", id: user.organizationId, tenantId: user.organizationId }, "update");
    const template = await prisma.workflowTemplate.create({
      data: {
        organizationId: user.organizationId,
        platformOrganizationId: user.platformOrganizationId ?? null,
        name: data.name,
        description: data.description ?? null,
        category: data.category ?? "general",
        steps: data.steps as Prisma.InputJsonValue,
        createdById: user.id,
      },
    });
    revalidatePath("/workflowos/templates");
    return { success: true, data: template };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      logger.error("Error creating Workflow template:", error instanceof Error ? error : undefined);
    return { success: false, error: mapAuthError(error) };
  }
}

export async function listWorkflowTemplates(organizationId: string, offset?: number) {
  try {
    const user = await getCurrentUser();
    await enforce(user, { type: "organization", id: organizationId, tenantId: organizationId }, "update");
    const PAGE_SIZE = 50;
    const [templates, totalCount] = await Promise.all([
      prisma.workflowTemplate.findMany({
        where: { organizationId, status: "active" },
        include: { _count: { select: { records: true } } },
        orderBy: { createdAt: "desc" },
        take: PAGE_SIZE,
        skip: offset || 0,
      }),
      prisma.workflowTemplate.count({ where: { organizationId, status: "active" } }),
    ]);
    return { success: true, data: templates, totalCount, hasMore: (offset || 0) + PAGE_SIZE < totalCount };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      logger.error("Error listing Workflow templates:", error instanceof Error ? error : undefined);
    return { success: false, error: "Failed to list templates" };
  }
}

export async function getWorkflowTemplate(id: string) {
  try {
    const user = await getCurrentUser();
    const template = await prisma.workflowTemplate.findUnique({
      where: { id },
      include: { _count: { select: { records: true } } },
    });
    if (!template) {
      return { success: false, error: "النموذج غير موجود" };
    }
    await enforce(user, { type: "organization", id: template.organizationId, tenantId: template.organizationId }, "update");
    return { success: true, data: template };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      logger.error("Error getting Workflow template:", error instanceof Error ? error : undefined);
    return { success: false, error: mapAuthError(error) };
  }
}

export async function startWorkflowFromTemplate(
  templateId: string,
  title: string,
  assignedToId?: string,
) {
  try {
    const user = await getCurrentUser();
    const template = await prisma.workflowTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template) {
      return { success: false, error: "النموذج غير موجود" };
    }
    await enforce(user, { type: "organization", id: template.organizationId, tenantId: template.organizationId }, "update");
    const record = await prisma.workflowRecord.create({
      data: {
        organizationId: user.organizationId,
        platformOrganizationId: user.platformOrganizationId ?? null,
        templateId: template.id,
        title,
        status: "pending",
        currentStep: 0,
        steps: template.steps as Prisma.InputJsonValue,
        stepResults: {} as Prisma.InputJsonValue,
        assignedToId: assignedToId ?? null,
        createdById: user.id,
      },
    });
    revalidatePath("/workflowos/records");
    return { success: true, data: record };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      logger.error("Error starting Workflow record:", error instanceof Error ? error : undefined);
    return { success: false, error: mapAuthError(error) };
  }
}

export async function workflow_listOrgRecords(
  organizationId: string,
  status?: string,
  searchQuery?: string,
  offset?: number,
) {
  try {
    const user = await getCurrentUser();
    await enforce(user, { type: "organization", id: organizationId, tenantId: organizationId }, "update");
    const where: Record<string, unknown> = { organizationId };
    if (status) where.status = status;
    if (searchQuery?.trim()) {
      where.title = { contains: searchQuery.trim(), mode: "insensitive" };
    }
    const PAGE_SIZE = 50;
    const [records, totalCount] = await Promise.all([
      prisma.workflowRecord.findMany({
        where,
        include: { template: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: PAGE_SIZE,
        skip: offset || 0,
      }),
      prisma.workflowRecord.count({ where }),
    ]);
    return { success: true, data: records, totalCount, hasMore: (offset || 0) + PAGE_SIZE < totalCount };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      logger.error("Error listing Workflow records:", error instanceof Error ? error : undefined);
    return { success: false, error: "Failed to list records" };
  }
}

export async function updateWorkflowRecordStatus(
  id: string,
  status: string,
  stepResult?: Record<string, unknown>,
) {
  try {
    const user = await getCurrentUser();
    const record = await prisma.workflowRecord.findUnique({
      where: { id },
    });
    if (!record) {
      return { success: false, error: "السجل غير موجود" };
    }
    await enforce(user, { type: "organization", id: record.organizationId, tenantId: record.organizationId }, "update");
    const existingResults =
      typeof record.stepResults === "object" && record.stepResults !== null
        ? (record.stepResults as Record<string, unknown>)
        : {};
    const stepResults = stepResult
      ? ({
          ...existingResults,
          [`step_${record.currentStep}`]: {
            ...stepResult,
            updatedAt: new Date().toISOString(),
          },
        } as Prisma.InputJsonValue)
      : undefined;
    const updated = await prisma.workflowRecord.update({
      where: { id },
      data: {
        status,
        ...(status === "completed" ? { completedAt: new Date() } : {}),
        ...(status === "in_progress" && record.currentStep === 0
          ? { currentStep: 1 }
          : {}),
        ...(stepResult ? { stepResults } : {}),
      },
    });
    revalidatePath("/workflowos/records");
    return { success: true, data: updated };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      logger.error("Error updating Workflow record status:", error instanceof Error ? error : undefined);
    return { success: false, error: mapAuthError(error) };
  }
}

export async function workflow_getRecordById(id: string) {
  try {
    const user = await getCurrentUser();
    const record = await prisma.workflowRecord.findUnique({
      where: { id },
      include: { template: { select: { name: true, steps: true } } },
    });
    if (!record) {
      return { success: false, error: "السجل غير موجود" };
    }
    await enforce(user, { type: "organization", id: record.organizationId, tenantId: record.organizationId }, "update");
    return { success: true, data: record };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      logger.error("Error getting Workflow record:", error instanceof Error ? error : undefined);
    return { success: false, error: mapAuthError(error) };
  }
}
