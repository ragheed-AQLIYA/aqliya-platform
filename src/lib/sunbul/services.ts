import "server-only";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  requireClientAccess,
  requireSunbulAdmin,
} from "@/lib/sunbul/tenant-guard";
import { createSunbulAuditEvent } from "@/lib/sunbul/audit";
import type {
  CreateSunbulRecordInput,
  UpdateSunbulRecordInput,
  CreateSunbulDocumentInput,
  CreateSunbulReviewInput,
  CreateSunbulClientInput,
} from "@/lib/sunbul/types";

// ─── Clients ───────────────────────────────────────────

export async function listSunbulClientsForUser() {
  const user = await getCurrentUser();

  const isPlatformAdmin =
    (
      await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true },
      })
    )?.role === "ADMIN";

  if (isPlatformAdmin) {
    return prisma.sunbulClient.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  const memberships = await prisma.sunbulUserMembership.findMany({
    where: { userId: user.id, status: "Active" },
    include: { client: true },
  });

  return memberships.map((m) => m.client);
}

export async function getSunbulClient(clientId: string) {
  await requireClientAccess(clientId);
  return prisma.sunbulClient.findUnique({
    where: { id: clientId },
  });
}

export async function createSunbulClient(input: CreateSunbulClientInput) {
  const user = await requireSunbulAdmin();

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
    },
  });

  await createSunbulAuditEvent({
    clientId: client.id,
    actorId: user.id,
    action: "CLIENT_CREATED",
    entityType: "SunbulClient",
    entityId: client.id,
    metadata: { name: client.name, slug: client.slug },
  });

  return client;
}

export async function updateSunbulClientStatus(
  clientId: string,
  status: string,
) {
  const user = await requireSunbulAdmin();

  const client = await prisma.sunbulClient.update({
    where: { id: clientId },
    data: { status },
  });

  await createSunbulAuditEvent({
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

export async function createSunbulMembership(input: {
  clientId: string;
  userId: string;
  role: string;
}) {
  const user = await requireSunbulAdmin();

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

  await createSunbulAuditEvent({
    clientId: input.clientId,
    actorId: user.id,
    action: "MEMBERSHIP_CREATED",
    entityType: "SunbulUserMembership",
    entityId: membership.id,
    metadata: { userId: input.userId, role: input.role },
  });

  return membership;
}

export async function listSunbulMemberships(clientId: string) {
  await requireClientAccess(clientId);
  return prisma.sunbulUserMembership.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateSunbulMembershipRole(
  membershipId: string,
  role: string,
) {
  const user = await requireSunbulAdmin();
  const validRoles = ["PlatformAdmin", "Operator", "Reviewer"];
  if (!validRoles.includes(role)) {
    throw new Error(`Invalid role: ${role}`);
  }

  const membership = await prisma.sunbulUserMembership.update({
    where: { id: membershipId },
    data: { role: role as "PlatformAdmin" | "Operator" | "Reviewer" },
  });

  await createSunbulAuditEvent({
    clientId: membership.clientId,
    actorId: user.id,
    action: "MEMBERSHIP_CREATED",
    entityType: "SunbulUserMembership",
    entityId: membership.id,
    metadata: { action: "role_changed", newRole: role },
  });

  return membership;
}

export async function updateSunbulMembershipStatus(
  membershipId: string,
  status: string,
) {
  const user = await requireSunbulAdmin();
  const validStatuses = ["Active", "Suspended"];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  const membership = await prisma.sunbulUserMembership.update({
    where: { id: membershipId },
    data: { status: status as "Active" | "Suspended" },
  });

  await createSunbulAuditEvent({
    clientId: membership.clientId,
    actorId: user.id,
    action: "MEMBERSHIP_CREATED",
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

export async function createSunbulRecord(
  clientId: string,
  input: CreateSunbulRecordInput,
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

  await createSunbulAuditEvent({
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

export async function listSunbulRecords(clientId: string) {
  const ctx = await requireClientAccess(clientId);
  const isPlatformAdmin =
    ctx.sunbulRole === "PlatformAdmin" ||
    (
      await prisma.user.findUnique({
        where: { id: ctx.id },
        select: { role: true },
      })
    )?.role === "ADMIN";

  const where: { clientId: string; createdById?: string } = { clientId };

  if (!isPlatformAdmin && ctx.sunbulRole === "Operator") {
    where.createdById = ctx.id;
  }

  return prisma.sunbulRecord.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function getSunbulRecord(clientId: string, recordId: string) {
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

  if (ctx.sunbulRole === "Operator" && record.createdById !== ctx.id) {
    throw new Error("Access denied: can only view own records");
  }

  return record;
}

export async function updateSunbulRecord(
  clientId: string,
  recordId: string,
  input: UpdateSunbulRecordInput,
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

  await createSunbulAuditEvent({
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

export async function submitSunbulRecordForReview(
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

  await createSunbulAuditEvent({
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

export async function approveSunbulRecord(clientId: string, recordId: string) {
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

  await createSunbulAuditEvent({
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

export async function returnSunbulRecord(
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

  await createSunbulReview(clientId, recordId, { status: "Returned", notes });

  await createSunbulAuditEvent({
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

export async function archiveSunbulRecord(clientId: string, recordId: string) {
  const ctx = await requireClientAccess(clientId, "Reviewer");
  if (ctx.sunbulRole !== "PlatformAdmin") {
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

  await createSunbulAuditEvent({
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

export async function createSunbulDocumentMetadata(
  clientId: string,
  recordId: string,
  input: CreateSunbulDocumentInput,
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

  await createSunbulAuditEvent({
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

export async function listSunbulDocuments(clientId: string, recordId: string) {
  await requireClientAccess(clientId);

  return prisma.sunbulDocument.findMany({
    where: { clientId, recordId },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteSunbulDocument(
  clientId: string,
  recordId: string,
  documentId: string,
) {
  const ctx = await requireClientAccess(clientId, "Reviewer");
  if (ctx.sunbulRole !== "PlatformAdmin") {
    throw new Error("Access denied: only PlatformAdmin can delete documents");
  }

  const doc = await prisma.sunbulDocument.findFirst({
    where: { id: documentId, clientId, recordId },
  });
  if (!doc) throw new Error("Document not found");

  await prisma.sunbulDocument.delete({ where: { id: documentId } });

  await createSunbulAuditEvent({
    clientId,
    recordId,
    actorId: ctx.id,
    action: "DOCUMENT_CREATED",
    entityType: "SunbulDocument",
    entityId: documentId,
    metadata: { action: "deleted", fileName: doc.fileName },
  });
}

// ─── Reviews ───────────────────────────────────────────

export async function createSunbulReview(
  clientId: string,
  recordId: string,
  input: CreateSunbulReviewInput,
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

  await createSunbulAuditEvent({
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

export async function listSunbulReviews(clientId: string, recordId: string) {
  await requireClientAccess(clientId);

  return prisma.sunbulReview.findMany({
    where: { clientId, recordId },
    orderBy: { createdAt: "desc" },
  });
}
