import "server-only";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  requireClientAccess,
  requireWorkflowAdmin,
} from "@/lib/workflowos/tenant-guard";
import { createWorkflowAuditEvent } from "@/lib/workflowos/audit";
import type {
  CreateWorkflowRecordInput,
  UpdateWorkflowRecordInput,
  CreateWorkflowDocumentInput,
  CreateWorkflowReviewInput,
  CreateWorkflowClientInput,
} from "@/lib/workflowos/types";

// ─── Clients ───────────────────────────────────────────

export async function listWorkflowClientsForUser() {
  const user = await getCurrentUser();

  if (user.role === "ADMIN") {
    const filter = user.platformOrganizationId
      ? { platformOrganizationId: user.platformOrganizationId }
      : {};
    return prisma.sunbulClient.findMany({
      where: filter,
      orderBy: { createdAt: "desc" },
    });
  }

  const memberships = await prisma.sunbulUserMembership.findMany({
    where: { userId: user.id, status: "Active" },
    include: { client: true },
  });

  return memberships.map((m) => m.client);
}

export async function getWorkflowClient(clientId: string) {
  await requireClientAccess(clientId);
  return prisma.sunbulClient.findUnique({
    where: { id: clientId },
  });
}

export async function createWorkflowClient(input: CreateWorkflowClientInput) {
  const user = await requireWorkflowAdmin();

  const existing = await prisma.sunbulClient.findUnique({
    where: { slug: input.slug },
  });
  if (existing) {
    throw new Error("Client with this slug already exists");
  }

  const client = await prisma.sunbulClient.create({
    data: {
      name: input.name,
      slug: input.slug,
      platformOrganizationId: user.platformOrganizationId ?? undefined,
    },
  });

  await createWorkflowAuditEvent({
    clientId: client.id,
    actorId: user.id,
    action: "CLIENT_CREATED",
    entityType: "SunbulClient",
    entityId: client.id,
    metadata: { name: client.name, slug: client.slug },
  });

  return client;
}

export async function updateWorkflowClientStatus(
  clientId: string,
  status: string,
) {
  const user = await requireWorkflowAdmin();

  const existing = await prisma.sunbulClient.findUnique({
    where: { id: clientId },
    select: { platformOrganizationId: true },
  });
  if (!existing) {
    throw new Error("Client not found");
  }
  if (
    existing.platformOrganizationId &&
    existing.platformOrganizationId !== user.platformOrganizationId
  ) {
    throw new Error(
      "Access denied: client belongs to a different organization",
    );
  }

  const client = await prisma.sunbulClient.update({
    where: { id: clientId },
    data: { status },
  });

  await createWorkflowAuditEvent({
    clientId: client.id,
    actorId: user.id,
    action: "CLIENT_UPDATED",
    entityType: "SunbulClient",
    entityId: client.id,
    metadata: { status },
  });

  return client;
}

// ─── User Memberships ──────────────────────────────────

export async function createWorkflowMembership(input: {
  clientId: string;
  userId: string;
  role: string;
}) {
  const user = await requireWorkflowAdmin();

  const validRoles = ["PlatformAdmin", "Operator", "Reviewer"];
  if (!validRoles.includes(input.role)) {
    throw new Error(`Invalid role: ${input.role}`);
  }

  const membership = await prisma.sunbulUserMembership.create({
    data: {
      clientId: input.clientId,
      userId: input.userId,
      role: input.role as "PlatformAdmin" | "Operator" | "Reviewer",
    },
  });

  await createWorkflowAuditEvent({
    clientId: input.clientId,
    actorId: user.id,
    action: "MEMBERSHIP_CREATED",
    entityType: "SunbulUserMembership",
    entityId: membership.id,
    metadata: { userId: input.userId, role: input.role },
  });

  return membership;
}

export async function listWorkflowMemberships(clientId: string) {
  await requireClientAccess(clientId);
  return prisma.sunbulUserMembership.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateWorkflowMembershipRole(
  membershipId: string,
  role: string,
) {
  const user = await requireWorkflowAdmin();
  const validRoles = ["PlatformAdmin", "Operator", "Reviewer"];
  if (!validRoles.includes(role)) {
    throw new Error(`Invalid role: ${role}`);
  }

  const membership = await prisma.sunbulUserMembership.update({
    where: { id: membershipId },
    data: { role: role as "PlatformAdmin" | "Operator" | "Reviewer" },
  });

  await createWorkflowAuditEvent({
    clientId: membership.clientId,
    actorId: user.id,
    action: "MEMBERSHIP_ROLE_CHANGED",
    entityType: "SunbulUserMembership",
    entityId: membership.id,
    metadata: { action: "role_changed", newRole: role },
  });

  return membership;
}

export async function updateWorkflowMembershipStatus(
  membershipId: string,
  status: string,
) {
  const user = await requireWorkflowAdmin();
  const validStatuses = ["Active", "Suspended"];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  const membership = await prisma.sunbulUserMembership.update({
    where: { id: membershipId },
    data: { status: status as "Active" | "Suspended" },
  });

  await createWorkflowAuditEvent({
    clientId: membership.clientId,
    actorId: user.id,
    action: "MEMBERSHIP_STATUS_CHANGED",
    entityType: "SunbulUserMembership",
    entityId: membership.id,
    metadata: { action: "status_changed", newStatus: status },
  });

  return membership;
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true },
  });
}

// ─── Records ───────────────────────────────────────────

export async function createWorkflowRecord(
  clientId: string,
  input: CreateWorkflowRecordInput,
) {
  const ctx = await requireClientAccess(clientId, "Operator");

  if (!input.title || input.title.trim().length === 0) {
    throw new Error("Record title is required");
  }

  const record = await prisma.sunbulRecord.create({
    data: {
      clientId,
      title: input.title.trim(),
      description: input.description?.trim() ?? null,
      type: input.type ?? "CASE",
      priority: input.priority ?? "medium",
      createdById: ctx.id,
    },
  });

  await createWorkflowAuditEvent({
    clientId,
    recordId: record.id,
    actorId: ctx.id,
    action: "RECORD_CREATED",
    entityType: "SunbulRecord",
    entityId: record.id,
    metadata: { title: record.title, type: record.type },
  });

  return record;
}

export async function listWorkflowRecords(clientId: string) {
  const ctx = await requireClientAccess(clientId);
  const isPlatformAdmin =
    ctx.workflowRole === "PlatformAdmin" ||
    (
      await prisma.user.findUnique({
        where: { id: ctx.id },
        select: { role: true },
      })
    )?.role === "ADMIN";

  const where: { clientId: string; createdById?: string } = { clientId };

  if (!isPlatformAdmin && ctx.workflowRole === "Operator") {
    where.createdById = ctx.id;
  }

  return prisma.sunbulRecord.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function getWorkflowRecord(clientId: string, recordId: string) {
  const ctx = await requireClientAccess(clientId);

  const record = await prisma.sunbulRecord.findFirst({
    where: { id: recordId, clientId },
    include: {
      documents: {
        orderBy: { createdAt: "desc" },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!record) {
    throw new Error("Record not found");
  }

  if (ctx.workflowRole === "Operator" && record.createdById !== ctx.id) {
    throw new Error("Access denied: can only view own records");
  }

  return record;
}

export async function updateWorkflowRecord(
  clientId: string,
  recordId: string,
  input: UpdateWorkflowRecordInput,
) {
  const ctx = await requireClientAccess(clientId, "Operator");

  const record = await prisma.sunbulRecord.findFirst({
    where: { id: recordId, clientId },
  });

  if (!record) throw new Error("Record not found");
  if (record.status !== "Draft")
    throw new Error("Can only edit records in Draft status");
  if (record.createdById !== ctx.id)
    throw new Error("Access denied: can only edit own records");

  const updated = await prisma.sunbulRecord.update({
    where: { id: recordId },
    data: {
      ...(input.title !== undefined && { title: input.title.trim() }),
      ...(input.description !== undefined && {
        description: input.description.trim(),
      }),
      ...(input.priority !== undefined && { priority: input.priority }),
    },
  });

  await createWorkflowAuditEvent({
    clientId,
    recordId,
    actorId: ctx.id,
    action: "RECORD_UPDATED",
    entityType: "SunbulRecord",
    entityId: record.id,
    metadata: { changes: input },
  });

  return updated;
}

// ─── Workflow ──────────────────────────────────────────

export async function submitWorkflowRecordForReview(
  clientId: string,
  recordId: string,
) {
  const ctx = await requireClientAccess(clientId, "Operator");

  const record = await prisma.sunbulRecord.findFirst({
    where: { id: recordId, clientId },
  });
  if (!record) throw new Error("Record not found");
  if (record.status !== "Draft")
    throw new Error("Only draft records can be submitted");
  if (record.createdById !== ctx.id)
    throw new Error("Access denied: can only submit own records");

  const updated = await prisma.sunbulRecord.update({
    where: { id: recordId },
    data: { status: "UnderReview", submittedAt: new Date() },
  });

  await createWorkflowAuditEvent({
    clientId,
    recordId,
    actorId: ctx.id,
    action: "RECORD_SUBMITTED",
    entityType: "SunbulRecord",
    entityId: record.id,
    metadata: { previousStatus: "Draft", newStatus: "UnderReview" },
  });

  return updated;
}

export async function approveWorkflowRecord(
  clientId: string,
  recordId: string,
) {
  const ctx = await requireClientAccess(clientId, "Reviewer");

  const record = await prisma.sunbulRecord.findFirst({
    where: { id: recordId, clientId },
  });
  if (!record) throw new Error("Record not found");
  if (record.status !== "UnderReview")
    throw new Error("Only records under review can be approved");

  const updated = await prisma.sunbulRecord.update({
    where: { id: recordId },
    data: { status: "Approved", approvedAt: new Date() },
  });

  await createWorkflowAuditEvent({
    clientId,
    recordId,
    actorId: ctx.id,
    action: "RECORD_APPROVED",
    entityType: "SunbulRecord",
    entityId: record.id,
    metadata: { previousStatus: "UnderReview", newStatus: "Approved" },
  });

  return updated;
}

export async function returnWorkflowRecord(
  clientId: string,
  recordId: string,
  notes?: string,
) {
  const ctx = await requireClientAccess(clientId, "Reviewer");

  const record = await prisma.sunbulRecord.findFirst({
    where: { id: recordId, clientId },
  });
  if (!record) throw new Error("Record not found");
  if (record.status !== "UnderReview")
    throw new Error("Only records under review can be returned");

  const updated = await prisma.sunbulRecord.update({
    where: { id: recordId },
    data: { status: "Draft", submittedAt: null },
  });

  await createWorkflowReview(clientId, recordId, { status: "Returned", notes });

  await createWorkflowAuditEvent({
    clientId,
    recordId,
    actorId: ctx.id,
    action: "RECORD_RETURNED",
    entityType: "SunbulRecord",
    entityId: record.id,
    metadata: { previousStatus: "UnderReview", newStatus: "Draft", notes },
  });

  return updated;
}

export async function archiveWorkflowRecord(
  clientId: string,
  recordId: string,
) {
  const ctx = await requireClientAccess(clientId, "Reviewer");
  if (ctx.workflowRole !== "PlatformAdmin") {
    throw new Error("Access denied: only PlatformAdmin can archive records");
  }

  const record = await prisma.sunbulRecord.findFirst({
    where: { id: recordId, clientId },
  });
  if (!record) throw new Error("Record not found");
  if (record.status !== "Approved")
    throw new Error("Only approved records can be archived");

  const updated = await prisma.sunbulRecord.update({
    where: { id: recordId },
    data: { status: "Archived", archivedAt: new Date() },
  });

  await createWorkflowAuditEvent({
    clientId,
    recordId,
    actorId: ctx.id,
    action: "RECORD_ARCHIVED",
    entityType: "SunbulRecord",
    entityId: record.id,
    metadata: { previousStatus: "Approved", newStatus: "Archived" },
  });

  return updated;
}

// ─── Documents ─────────────────────────────────────────

export async function createWorkflowDocumentMetadata(
  clientId: string,
  recordId: string,
  input: CreateWorkflowDocumentInput,
) {
  const ctx = await requireClientAccess(clientId, "Operator");

  const record = await prisma.sunbulRecord.findFirst({
    where: { id: recordId, clientId },
  });
  if (!record) throw new Error("Record not found");

  const doc = await prisma.sunbulDocument.create({
    data: {
      clientId,
      recordId,
      fileName: input.fileName,
      fileType: input.fileType,
      fileSize: input.fileSize,
      storageKey: input.storageKey,
      uploadedById: ctx.id,
    },
  });

  await createWorkflowAuditEvent({
    clientId,
    recordId,
    actorId: ctx.id,
    action: "DOCUMENT_CREATED",
    entityType: "SunbulDocument",
    entityId: doc.id,
    metadata: { fileName: input.fileName, fileType: input.fileType },
  });

  return doc;
}

export async function listWorkflowDocuments(
  clientId: string,
  recordId: string,
) {
  await requireClientAccess(clientId);

  return prisma.sunbulDocument.findMany({
    where: { clientId, recordId },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteWorkflowDocument(
  clientId: string,
  recordId: string,
  documentId: string,
) {
  const ctx = await requireClientAccess(clientId, "Reviewer");
  if (ctx.workflowRole !== "PlatformAdmin") {
    throw new Error("Access denied: only PlatformAdmin can delete documents");
  }

  const doc = await prisma.sunbulDocument.findFirst({
    where: { id: documentId, clientId, recordId },
  });
  if (!doc) throw new Error("Document not found");

  await prisma.sunbulDocument.delete({ where: { id: documentId } });

  await createWorkflowAuditEvent({
    clientId,
    recordId,
    actorId: ctx.id,
    action: "DOCUMENT_DELETED",
    entityType: "SunbulDocument",
    entityId: documentId,
    metadata: { action: "deleted", fileName: doc.fileName },
  });
}

// ─── Reviews ───────────────────────────────────────────

export async function createWorkflowReview(
  clientId: string,
  recordId: string,
  input: CreateWorkflowReviewInput,
) {
  const ctx = await requireClientAccess(clientId, "Reviewer");

  const record = await prisma.sunbulRecord.findFirst({
    where: { id: recordId, clientId },
  });
  if (!record) throw new Error("Record not found");
  if (input.status === "Approved" && record.status !== "UnderReview") {
    throw new Error("Can only approve records under review");
  }

  const review = await prisma.sunbulReview.create({
    data: {
      clientId,
      recordId,
      reviewerId: ctx.id,
      status: input.status,
      notes: input.notes ?? null,
    },
  });

  await createWorkflowAuditEvent({
    clientId,
    recordId,
    actorId: ctx.id,
    action: "REVIEW_CREATED",
    entityType: "SunbulReview",
    entityId: review.id,
    metadata: { status: input.status },
  });

  return review;
}

export async function listWorkflowReviews(clientId: string, recordId: string) {
  await requireClientAccess(clientId);

  return prisma.sunbulReview.findMany({
    where: { clientId, recordId },
    orderBy: { createdAt: "desc" },
  });
}
