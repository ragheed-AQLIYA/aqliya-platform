"use server";

import {
  createWorkflowClient,
  listWorkflowClientsForUser,
  getWorkflowClient,
  updateWorkflowClientStatus,
  createWorkflowMembership,
  listWorkflowMemberships,
  updateWorkflowMembershipRole,
  updateWorkflowMembershipStatus,
  findUserByEmail,
  createWorkflowRecord,
  listWorkflowRecords,
  getWorkflowRecord,
  updateWorkflowRecord,
  submitWorkflowRecordForReview,
  approveWorkflowRecord,
  returnWorkflowRecord,
  archiveWorkflowRecord,
  createWorkflowDocumentMetadata,
  listWorkflowDocuments,
  createWorkflowReview,
  listWorkflowReviews,
} from "@/lib/workflowos/services";
import {
  uploadWorkflowDocument,
  deleteStoredWorkflowDocument,
} from "@/lib/workflowos/storage";
import { listWorkflowAuditEvents, recordWorkflowAuditEvent } from "@/lib/workflowos/audit";
import { getUserWorkflowRole } from "@/lib/workflowos/tenant-guard";
import { isExpectedAccessDeniedError, requireUserContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

function mapAuthError(error: unknown): string {
  const msg = error instanceof Error ? error.message : "";
  if (msg === "Unauthenticated") return "يجب تسجيل الدخول أولاً";
  if (msg.startsWith("Access denied:"))
    return "لا تملك صلاحية تنفيذ هذا الإجراء";
  if (msg.includes("slug already exists"))
    return "الرابط المختصر مستخدم بالفعل";
  return msg || "فشل العملية";
}

// ─── Clients ───────────────────────────────────────────

export async function workflow_createClient(data: {
  name: string;
  slug: string;
}) {
  try {
    const client = await createWorkflowClient(data);
    return { success: true, data: client };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error creating Workflow client:", error);
    return { success: false, error: mapAuthError(error) };
  }
}

export async function workflow_listClients() {
  try {
    const clients = await listWorkflowClientsForUser();
    return { success: true, data: clients };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error listing Workflow clients:", error);
    return { success: false, error: "Failed to list clients" };
  }
}

export async function workflow_getClient(clientId: string) {
  try {
    const client = await getWorkflowClient(clientId);
    return { success: true, data: client };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error getting Workflow client:", error);
    return { success: false, error: "Failed to get client" };
  }
}

export async function workflow_updateClientStatus(
  clientId: string,
  status: string,
) {
  try {
    const client = await updateWorkflowClientStatus(clientId, status);
    return { success: true, data: client };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error updating Workflow client status:", error);
    return { success: false, error: mapAuthError(error) };
  }
}

// ─── Memberships ───────────────────────────────────────

export async function workflow_createMembership(data: {
  clientId: string;
  userId: string;
  role: string;
}) {
  try {
    const membership = await createWorkflowMembership(data);
    return { success: true, data: membership };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error creating Workflow membership:", error);
    return { success: false, error: mapAuthError(error) };
  }
}

export async function workflow_listMemberships(clientId: string) {
  try {
    const memberships = await listWorkflowMemberships(clientId);
    return { success: true, data: memberships };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error listing Workflow memberships:", error);
    return { success: false, error: "Failed to list memberships" };
  }
}

export async function workflow_addMembershipByEmail(data: {
  clientId: string;
  email: string;
  role: string;
}) {
  try {
    const user = await findUserByEmail(data.email);
    if (!user) {
      return { success: false, error: "المستخدم غير موجود حالياً" };
    }
    const membership = await createWorkflowMembership({
      clientId: data.clientId,
      userId: user.id,
      role: data.role,
    });
    return { success: true, data: membership };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error adding Workflow membership:", error);
    return { success: false, error: mapAuthError(error) };
  }
}

export async function workflow_updateMembershipRole(
  membershipId: string,
  role: string,
) {
  try {
    const membership = await updateWorkflowMembershipRole(membershipId, role);
    return { success: true, data: membership };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error updating Workflow membership role:", error);
    return { success: false, error: mapAuthError(error) };
  }
}

export async function workflow_updateMembershipStatus(
  membershipId: string,
  status: string,
) {
  try {
    const membership = await updateWorkflowMembershipStatus(
      membershipId,
      status,
    );
    return { success: true, data: membership };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error updating Workflow membership status:", error);
    return { success: false, error: mapAuthError(error) };
  }
}

// ─── Records ───────────────────────────────────────────

export async function workflow_createRecord(
  clientId: string,
  data: {
    title: string;
    description?: string;
    type?: string;
    priority?: string;
  },
) {
  try {
    const record = await createWorkflowRecord(clientId, data);
    return { success: true, data: record };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error creating Workflow record:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create record",
    };
  }
}

export async function workflow_listRecords(clientId: string) {
  try {
    const records = await listWorkflowRecords(clientId);
    return { success: true, data: records };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error listing Workflow records:", error);
    return { success: false, error: "Failed to list records" };
  }
}

export async function workflow_getRecord(clientId: string, recordId: string) {
  try {
    const record = await getWorkflowRecord(clientId, recordId);
    return { success: true, data: record };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error getting Workflow record:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get record",
    };
  }
}

export async function workflow_updateRecord(
  clientId: string,
  recordId: string,
  data: { title?: string; description?: string; priority?: string },
) {
  try {
    const record = await updateWorkflowRecord(clientId, recordId, data);
    return { success: true, data: record };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error updating Workflow record:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update record",
    };
  }
}

// ─── Workflow ──────────────────────────────────────────

export async function workflow_submitRecord(
  clientId: string,
  recordId: string,
) {
  try {
    const record = await submitWorkflowRecordForReview(clientId, recordId);
    return { success: true, data: record };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error submitting Workflow record:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit record",
    };
  }
}

export async function workflow_approveRecord(
  clientId: string,
  recordId: string,
) {
  try {
    const record = await approveWorkflowRecord(clientId, recordId);
    return { success: true, data: record };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error approving Workflow record:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to approve record",
    };
  }
}

export async function workflow_returnRecord(
  clientId: string,
  recordId: string,
  notes?: string,
) {
  try {
    const record = await returnWorkflowRecord(clientId, recordId, notes);
    return { success: true, data: record };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error returning Workflow record:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to return record",
    };
  }
}

export async function workflow_archiveRecord(
  clientId: string,
  recordId: string,
) {
  try {
    const record = await archiveWorkflowRecord(clientId, recordId);
    return { success: true, data: record };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error archiving Workflow record:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to archive record",
    };
  }
}

// ─── Documents ─────────────────────────────────────────

export async function workflow_createDocumentMetadata(
  clientId: string,
  recordId: string,
  data: {
    fileName: string;
    fileType: string;
    fileSize: number;
    storageKey: string;
  },
) {
  try {
    const doc = await createWorkflowDocumentMetadata(clientId, recordId, data);
    return { success: true, data: doc };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error creating Workflow document metadata:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create document metadata",
    };
  }
}

export async function workflow_listDocuments(
  clientId: string,
  recordId: string,
) {
  try {
    const docs = await listWorkflowDocuments(clientId, recordId);
    return { success: true, data: docs };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error listing Workflow documents:", error);
    return { success: false, error: "Failed to list documents" };
  }
}

export async function workflow_uploadDocument(
  clientId: string,
  recordId: string,
  data: { fileName: string; fileType: string; contentBase64: string },
) {
  try {
    const content = Buffer.from(data.contentBase64, "base64");
    const doc = await uploadWorkflowDocument({
      clientId,
      recordId,
      fileName: data.fileName,
      fileType: data.fileType,
      content,
    });
    return { success: true, data: doc };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error uploading Workflow document:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to upload document",
    };
  }
}

export async function workflow_deleteDocument(
  clientId: string,
  recordId: string,
  documentId: string,
) {
  try {
    await deleteStoredWorkflowDocument(clientId, recordId, documentId);
    return { success: true, data: null };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error deleting Workflow document:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete document",
    };
  }
}

// ─── Reviews ───────────────────────────────────────────

export async function workflow_createReview(
  clientId: string,
  recordId: string,
  data: { status: "Approved" | "Returned"; notes?: string },
) {
  try {
    const review = await createWorkflowReview(clientId, recordId, data);
    return { success: true, data: review };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error creating Workflow review:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create review",
    };
  }
}

export async function workflow_listReviews(clientId: string, recordId: string) {
  try {
    const reviews = await listWorkflowReviews(clientId, recordId);
    return { success: true, data: reviews };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error listing Workflow reviews:", error);
    return { success: false, error: "Failed to list reviews" };
  }
}

// ─── Audit ─────────────────────────────────────────────

export async function workflow_getUserRole(clientId: string) {
  try {
    const role = await getUserWorkflowRole(clientId);
    return { success: true, data: role };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error getting Workflow user role:", error);
    return { success: false, error: "Failed to get user role" };
  }
}

export async function workflow_listAuditEvents(
  clientId: string,
  options?: { recordId?: string; limit?: number; offset?: number },
) {
  try {
    const result = await listWorkflowAuditEvents({
      clientId,
      ...(options ?? {}),
    });
    return { success: true, data: result };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error listing Workflow audit events:", error);
    return { success: false, error: "Failed to list audit events" };
  }
}

// ─── Templates ──────────────────────────────────────────

export async function createWorkflowTemplate(data: {
  name: string;
  description?: string;
  category?: string;
  steps: unknown[];
}) {
  try {
    const user = await requireUserContext();
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
      console.error("Error creating Workflow template:", error);
    return { success: false, error: mapAuthError(error) };
  }
}

export async function listWorkflowTemplates(organizationId: string) {
  try {
    const user = await requireUserContext();
    if (user.organizationId !== organizationId) {
      return { success: false, error: "لا تملك صلاحية الوصول لهذه المنظمة" };
    }
    const templates = await prisma.workflowTemplate.findMany({
      where: { organizationId, status: "active" },
      include: { _count: { select: { records: true } } },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: templates };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error listing Workflow templates:", error);
    return { success: false, error: "Failed to list templates" };
  }
}

export async function getWorkflowTemplate(id: string) {
  try {
    const user = await requireUserContext();
    const template = await prisma.workflowTemplate.findUnique({
      where: { id },
      include: { _count: { select: { records: true } } },
    });
    if (!template) {
      return { success: false, error: "النموذج غير موجود" };
    }
    if (template.organizationId !== user.organizationId) {
      return { success: false, error: "لا تملك صلاحية الوصول لهذا النموذج" };
    }
    return { success: true, data: template };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error getting Workflow template:", error);
    return { success: false, error: mapAuthError(error) };
  }
}

export async function startWorkflowFromTemplate(
  templateId: string,
  title: string,
  assignedToId?: string,
) {
  try {
    const user = await requireUserContext();
    const template = await prisma.workflowTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template) {
      return { success: false, error: "النموذج غير موجود" };
    }
    if (template.organizationId !== user.organizationId) {
      return { success: false, error: "لا تملك صلاحية الوصول لهذا النموذج" };
    }
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
      console.error("Error starting Workflow record:", error);
    return { success: false, error: mapAuthError(error) };
  }
}

export async function workflow_listOrgRecords(
  organizationId: string,
  status?: string,
  searchQuery?: string,
) {
  try {
    const user = await requireUserContext();
    if (user.organizationId !== organizationId) {
      return { success: false, error: "لا تملك صلاحية الوصول لهذه المنظمة" };
    }
    const where: Record<string, unknown> = { organizationId };
    if (status) where.status = status;
    if (searchQuery?.trim()) {
      where.title = { contains: searchQuery.trim(), mode: "insensitive" };
    }
    const records = await prisma.workflowRecord.findMany({
      where,
      include: { template: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: records };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error listing Workflow records:", error);
    return { success: false, error: "Failed to list records" };
  }
}

export async function updateWorkflowRecordStatus(
  id: string,
  status: string,
  stepResult?: Record<string, unknown>,
) {
  try {
    const user = await requireUserContext();
    const record = await prisma.workflowRecord.findUnique({
      where: { id },
    });
    if (!record) {
      return { success: false, error: "السجل غير موجود" };
    }
    if (record.organizationId !== user.organizationId) {
      return { success: false, error: "لا تملك صلاحية الوصول لهذا السجل" };
    }
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
      console.error("Error updating Workflow record status:", error);
    return { success: false, error: mapAuthError(error) };
  }
}

export async function workflow_getRecordById(id: string) {
  try {
    const user = await requireUserContext();
    const record = await prisma.workflowRecord.findUnique({
      where: { id },
      include: { template: { select: { name: true, steps: true } } },
    });
    if (!record) {
      return { success: false, error: "السجل غير موجود" };
    }
    if (record.organizationId !== user.organizationId) {
      return { success: false, error: "لا تملك صلاحية الوصول لهذا السجل" };
    }
    return { success: true, data: record };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error getting Workflow record:", error);
    return { success: false, error: mapAuthError(error) };
  }
}

// ─── Audit ─────────────────────────────────────────────

export async function logWorkflowAuditEvent(params: {
  recordId: string;
  organizationId: string;
  actorId: string;
  actorName?: string;
  action: string;
  fromStatus?: string;
  toStatus?: string;
  comment?: string;
}) {
  try {
    await recordWorkflowAuditEvent({
      organizationId: params.organizationId,
      recordId: params.recordId,
      actorId: params.actorId,
      actorName: params.actorName,
      action: params.action,
      fromStatus: params.fromStatus,
      toStatus: params.toStatus,
      comment: params.comment,
    });
    return { success: true };
  } catch (error) {
    console.error("Error logging audit event:", error);
    return { success: false, error: "Failed to log audit event" };
  }
}

// ─── Evidence ──────────────────────────────────────────

export async function uploadWorkflowEvidence(params: {
  recordId: string;
  filename: string;
  fileType: string;
  storageKey?: string;
  fileHash?: string;
  sizeBytes?: number;
  description?: string;
  stepIndex?: number;
}) {
  try {
    const user = await requireUserContext();
    const record = await prisma.workflowRecord.findUnique({
      where: { id: params.recordId },
      select: { organizationId: true },
    });
    if (!record) return { success: false, error: "Record not found" };
    if (record.organizationId !== user.organizationId)
      return { success: false, error: "Access denied" };

    const evidence = await prisma.workflowEvidence.create({
      data: {
        organizationId: record.organizationId,
        recordId: params.recordId,
        filename: params.filename,
        fileType: params.fileType,
        storageKey: params.storageKey,
        fileHash: params.fileHash,
        sizeBytes: params.sizeBytes,
        description: params.description,
        stepIndex: params.stepIndex,
        uploadedById: user.id,
      },
    });
    revalidatePath(`/workflowos/records/${params.recordId}`);
    return { success: true, data: evidence };
  } catch (error) {
    console.error("Error uploading workflow evidence:", error);
    return { success: false, error: "Failed to upload evidence" };
  }
}

export async function listWorkflowEvidence(recordId: string) {
  try {
    const user = await requireUserContext();
    const evidence = await prisma.workflowEvidence.findMany({
      where: { organizationId: user.organizationId, recordId },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: evidence };
  } catch (error) {
    console.error("Error listing workflow evidence:", error);
    return { success: false, error: "Failed to list evidence" };
  }
}

// ─── Dashboard Stats ───────────────────────────────────

export async function getWorkflowDashboardStats(organizationId: string) {
  try {
    const user = await requireUserContext();
    if (user.organizationId !== organizationId)
      return { success: false, error: "Access denied" };

    const [
      totalTemplates,
      totalRecords,
      activeRecords,
      completedToday,
      overdueRecords,
      statusDistribution,
      priorityDistribution,
      recentRecords,
    ] = await Promise.all([
      prisma.workflowTemplate.count({ where: { organizationId, status: "active" } }),
      prisma.workflowRecord.count({ where: { organizationId } }),
      prisma.workflowRecord.count({ where: { organizationId, status: { notIn: ["completed", "cancelled"] } } }),
      prisma.workflowRecord.count({
        where: {
          organizationId,
          status: "completed",
          completedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      prisma.workflowRecord.count({
        where: {
          organizationId,
          dueDate: { lt: new Date() },
          status: { notIn: ["completed", "cancelled"] },
        },
      }),
      prisma.workflowRecord.groupBy({
        by: ["status"],
        where: { organizationId },
        _count: true,
      }),
      prisma.workflowRecord.groupBy({
        by: ["priority"],
        where: { organizationId },
        _count: true,
      }),
      prisma.workflowRecord.findMany({
        where: { organizationId },
        orderBy: { updatedAt: "desc" },
        take: 10,
        select: { id: true, title: true, status: true, priority: true, updatedAt: true },
      }),
    ]);

    return {
      success: true,
      data: {
        totalTemplates,
        totalRecords,
        activeRecords,
        completedToday,
        overdueRecords,
        statusDistribution,
        priorityDistribution,
        recentRecords,
      },
    };
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    return { success: false, error: "Failed to get dashboard stats" };
  }
}
