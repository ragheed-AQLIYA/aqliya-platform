"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUserContext, isExpectedAccessDeniedError } from "@/lib/auth";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

async function safe<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (error) {
    if (isExpectedAccessDeniedError(error)) {
      return { ok: false, error: "Access denied", code: "FORBIDDEN" };
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Contact Actions]", message);
    return { ok: false, error: message };
  }
}

interface CreateContactData {
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  organizationName?: string;
  sensitivityLevel?: string;
  notes?: string;
  tags?: string;
}

interface ListContactsOptions {
  sensitivityLevel?: string;
  search?: string;
}

export async function listContacts(
  organizationId: string,
  options?: ListContactsOptions,
) {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    if (user.organizationId !== organizationId) {
      throw new Error("Access denied: organization access required");
    }

    const where: Record<string, unknown> = {
      organizationId,
      isActive: true,
    };

    if (options?.sensitivityLevel) {
      where.sensitivityLevel = options.sensitivityLevel;
    }

    if (options?.search) {
      where.OR = [
        { name: { contains: options.search } },
        { email: { contains: options.search } },
        { organizationName: { contains: options.search } },
        { position: { contains: options.search } },
      ];
    }

    const contacts = await prisma.localContact.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return contacts.map((c) => ({
      ...c,
      tags: typeof c.tags === "string" ? JSON.parse(c.tags) : c.tags,
    }));
  });
}

export async function createContact(data: CreateContactData) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");

    const tagsArray = data.tags
      ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const contact = await prisma.localContact.create({
      data: {
        organizationId: user.organizationId,
        platformOrganizationId: user.platformOrganizationId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        position: data.position,
        department: data.department,
        organizationName: data.organizationName,
        sensitivityLevel: data.sensitivityLevel || "normal",
        notes: data.notes,
        tags: tagsArray,
        createdById: user.id,
      },
    });

    revalidatePath("/contacts");
    return contact;
  });
}

export async function getContact(id: string) {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");

    const contact = await prisma.localContact.findFirst({
      where: { id, organizationId: user.organizationId },
      include: {
        outgoingRelations: {
          where: { isActive: true },
          include: { targetContact: true },
        },
        incomingRelations: {
          where: { isActive: true },
          include: { sourceContact: true },
        },
        interactions: {
          orderBy: { occurredAt: "desc" },
        },
      },
    });

    if (!contact) {
      throw new Error("Contact not found");
    }

    return {
      ...contact,
      tags: typeof contact.tags === "string" ? JSON.parse(contact.tags) : contact.tags,
    };
  });
}

export async function updateContact(id: string, data: Partial<CreateContactData>) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");

    const existing = await prisma.localContact.findFirst({
      where: { id, organizationId: user.organizationId },
    });

    if (!existing) {
      throw new Error("Contact not found");
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.department !== undefined) updateData.department = data.department;
    if (data.organizationName !== undefined) updateData.organizationName = data.organizationName;
    if (data.sensitivityLevel !== undefined) updateData.sensitivityLevel = data.sensitivityLevel;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.tags !== undefined) {
      updateData.tags = JSON.stringify(
        data.tags.split(",").map((t) => t.trim()).filter(Boolean),
      );
    }

    const contact = await prisma.localContact.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/contacts");
    revalidatePath(`/contacts/${id}`);
    return contact;
  });
}

export async function deleteContact(id: string) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");

    const existing = await prisma.localContact.findFirst({
      where: { id, organizationId: user.organizationId },
    });

    if (!existing) {
      throw new Error("Contact not found");
    }

    await prisma.localContact.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath("/contacts");
  });
}

export async function createContactRelation(
  sourceId: string,
  targetId: string,
  relationType: string,
  description?: string,
) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");

    const source = await prisma.localContact.findFirst({
      where: { id: sourceId, organizationId: user.organizationId },
    });
    const target = await prisma.localContact.findFirst({
      where: { id: targetId, organizationId: user.organizationId },
    });

    if (!source || !target) {
      throw new Error("Source or target contact not found");
    }

    const relation = await prisma.localContactRelation.create({
      data: {
        organizationId: user.organizationId,
        platformOrganizationId: user.platformOrganizationId,
        sourceContactId: sourceId,
        targetContactId: targetId,
        relationType,
        description,
        createdById: user.id,
      },
    });

    revalidatePath(`/contacts/${sourceId}`);
    revalidatePath(`/contacts/${targetId}`);
    return relation;
  });
}

export async function listContactRelations(contactId: string) {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");

    const relations = await prisma.localContactRelation.findMany({
      where: {
        organizationId: user.organizationId,
        isActive: true,
        OR: [
          { sourceContactId: contactId },
          { targetContactId: contactId },
        ],
      },
      include: {
        sourceContact: true,
        targetContact: true,
      },
    });

    return relations;
  });
}

export async function logContactInteraction(
  contactId: string,
  interactionType: string,
  subject: string,
  summary: string,
  occurredAt: string,
) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");

    const contact = await prisma.localContact.findFirst({
      where: { id: contactId, organizationId: user.organizationId },
    });

    if (!contact) {
      throw new Error("Contact not found");
    }

    const interaction = await prisma.localContactInteraction.create({
      data: {
        organizationId: user.organizationId,
        platformOrganizationId: user.platformOrganizationId,
        contactId,
        interactionType,
        subject,
        summary,
        occurredAt: new Date(occurredAt),
        createdById: user.id,
      },
    });

    revalidatePath(`/contacts/${contactId}`);
    return interaction;
  });
}

export async function listContactInteractions(contactId: string) {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");

    const interactions = await prisma.localContactInteraction.findMany({
      where: {
        organizationId: user.organizationId,
        contactId,
      },
      orderBy: { occurredAt: "desc" },
    });

    return interactions;
  });
}

// ─── Evidence ──────────────────────────────────────────

export async function uploadContactEvidence(params: {
  contactId: string;
  filename: string;
  fileType: string;
  storageKey?: string;
  fileHash?: string;
  sizeBytes?: number;
  description?: string;
  evidenceType?: string;
}) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    const contact = await prisma.localContact.findUnique({
      where: { id: params.contactId },
      select: { organizationId: true },
    });
    if (!contact || contact.organizationId !== user.organizationId) {
      throw new Error("Contact not found or access denied");
    }

    const evidence = await prisma.contactEvidence.create({
      data: {
        organizationId: user.organizationId,
        contactId: params.contactId,
        filename: params.filename,
        fileType: params.fileType,
        storageKey: params.storageKey,
        fileHash: params.fileHash,
        sizeBytes: params.sizeBytes,
        description: params.description,
        evidenceType: params.evidenceType ?? "document",
        uploadedById: user.id,
      },
    });

    revalidatePath(`/contacts/${params.contactId}`);
    return evidence;
  });
}

export async function listContactEvidence(contactId: string) {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    return prisma.contactEvidence.findMany({
      where: { organizationId: user.organizationId, contactId },
      orderBy: { createdAt: "desc" },
    });
  });
}

// ─── Review & Approval ─────────────────────────────────

export async function createContactReview(params: {
  contactId: string;
  reviewType?: string;
  reviewerId: string;
  reviewerName?: string;
  reason?: string;
  findings?: string;
}) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    const contact = await prisma.localContact.findUnique({
      where: { id: params.contactId },
      select: { organizationId: true },
    });
    if (!contact || contact.organizationId !== user.organizationId) {
      throw new Error("Contact not found or access denied");
    }

    const review = await prisma.contactReview.create({
      data: {
        organizationId: user.organizationId,
        contactId: params.contactId,
        reviewType: params.reviewType ?? "sensitivity",
        status: "pending",
        reviewerId: params.reviewerId,
        reviewerName: params.reviewerName,
        reason: params.reason,
        findings: params.findings ? JSON.parse(params.findings) : [],
      },
    });

    revalidatePath(`/contacts/${params.contactId}`);
    return review;
  });
}

export async function listContactReviews(contactId: string) {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    return prisma.contactReview.findMany({
      where: { organizationId: user.organizationId, contactId },
      include: { approvals: true },
      orderBy: { createdAt: "desc" },
    });
  });
}

export async function approveContactReview(reviewId: string, note?: string) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    const review = await prisma.contactReview.findUnique({
      where: { id: reviewId },
      select: { organizationId: true, id: true, contactId: true },
    });
    if (!review || review.organizationId !== user.organizationId) {
      throw new Error("Review not found or access denied");
    }

    const [updatedReview] = await prisma.$transaction([
      prisma.contactReview.update({
        where: { id: reviewId },
        data: { status: "approved" },
      }),
      prisma.contactApproval.create({
        data: {
          organizationId: user.organizationId,
          reviewId,
          approverId: user.id,
          approverName: user.name,
          status: "approved",
          note,
        },
      }),
    ]);

    revalidatePath(`/contacts/${review.contactId}`);
    return updatedReview;
  });
}

export async function rejectContactReview(reviewId: string, note?: string) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    const review = await prisma.contactReview.findUnique({
      where: { id: reviewId },
      select: { organizationId: true, id: true, contactId: true },
    });
    if (!review || review.organizationId !== user.organizationId) {
      throw new Error("Review not found or access denied");
    }

    const [updatedReview] = await prisma.$transaction([
      prisma.contactReview.update({
        where: { id: reviewId },
        data: { status: "rejected" },
      }),
      prisma.contactApproval.create({
        data: {
          organizationId: user.organizationId,
          reviewId,
          approverId: user.id,
          approverName: user.name,
          status: "rejected",
          note,
        },
      }),
    ]);

    revalidatePath(`/contacts/${review.contactId}`);
    return updatedReview;
  });
}

// ─── Risk Flags ────────────────────────────────────────

export interface RiskFlag {
  id: string;
  type: "compliance" | "data_privacy" | "relationship" | "contractual" | "financial" | "other";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  createdBy: string;
  createdAt: string;
  resolvedAt?: string;
}

function generateFlagId(): string {
  return `flag-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function logContactAuditEvent(params: {
  contactId: string;
  organizationId: string;
  platformOrganizationId?: string | null;
  actorId: string;
  actorName?: string | null;
  action: string;
  details?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.platformAuditLog.create({
      data: {
        platformOrganizationId: params.platformOrganizationId,
        clientWorkspaceId: null,
        productKey: "localcontactos",
        actorId: params.actorId,
        actorName: params.actorName,
        actorEmail: null,
        action: params.action,
        targetType: "LocalContact",
        targetId: params.contactId,
        targetLabel: null,
        severity: "info",
        metadata: (params.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  } catch (e) {
    console.error("[Contact Audit Log Error]", e);
  }
}

export async function getContactRiskFlags(contactId: string) {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    const contact = await prisma.localContact.findUnique({
      where: { id: contactId },
      select: { id: true, organizationId: true, metadata: true },
    });
    if (!contact || contact.organizationId !== user.organizationId) {
      throw new Error("Contact not found or access denied");
    }
    const metadata = (contact.metadata as Record<string, unknown>) || {};
    return (metadata.riskFlags as RiskFlag[]) || [];
  });
}

export async function addContactRiskFlag(
  contactId: string,
  flag: Omit<RiskFlag, "id" | "createdAt" | "createdBy">,
) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    const contact = await prisma.localContact.findUnique({
      where: { id: contactId },
      select: { id: true, organizationId: true, metadata: true },
    });
    if (!contact || contact.organizationId !== user.organizationId) {
      throw new Error("Contact not found or access denied");
    }

    const metadata = (contact.metadata as Record<string, unknown>) || {};
    const existingFlags = (metadata.riskFlags as RiskFlag[]) || [];

    const newFlag: RiskFlag = {
      id: generateFlagId(),
      ...flag,
      createdBy: user.name ?? user.email,
      createdAt: new Date().toISOString(),
    };

    await prisma.localContact.update({
      where: { id: contactId },
      data: {
        metadata: {
          ...metadata,
          riskFlags: [...existingFlags, newFlag],
        } as unknown as Prisma.InputJsonValue,
      },
    });

    // Audit event
    await logContactAuditEvent({
      contactId,
      organizationId: user.organizationId,
      platformOrganizationId: user.platformOrganizationId,
      actorId: user.id,
      actorName: user.name,
      action: "riskFlagAdded",
      details: `Risk flag added: ${flag.type} (${flag.severity}) — ${flag.description}`,
      metadata: { flagId: newFlag.id, ...flag },
    });

    revalidatePath(`/contacts/${contactId}`);
    return newFlag;
  });
}

export async function resolveContactRiskFlag(contactId: string, flagId: string) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    const contact = await prisma.localContact.findUnique({
      where: { id: contactId },
      select: { id: true, organizationId: true, metadata: true },
    });
    if (!contact || contact.organizationId !== user.organizationId) {
      throw new Error("Contact not found or access denied");
    }

    const metadata = (contact.metadata as Record<string, unknown>) || {};
    const existingFlags = (metadata.riskFlags as RiskFlag[]) || [];

    const updatedFlags = existingFlags.map((f) =>
      f.id === flagId ? { ...f, resolvedAt: new Date().toISOString() } : f,
    );

    await prisma.localContact.update({
      where: { id: contactId },
      data: {
        metadata: {
          ...metadata,
          riskFlags: updatedFlags,
        } as unknown as Prisma.InputJsonValue,
      },
    });

    await logContactAuditEvent({
      contactId,
      organizationId: user.organizationId,
      platformOrganizationId: user.platformOrganizationId,
      actorId: user.id,
      actorName: user.name,
      action: "riskFlagResolved",
      details: `Risk flag ${flagId} resolved by ${user.name}`,
      metadata: { flagId },
    });

    revalidatePath(`/contacts/${contactId}`);
    return { resolved: true };
  });
}

// ─── Audit Trail ────────────────────────────────────────

export interface AuditTrailEntry {
  id: string;
  actorName: string | null;
  actorEmail: string | null;
  action: string;
  createdAt: string;
  metadata: Record<string, unknown> | null;
}

export async function getContactAuditTrail(contactId: string) {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");

    const entries = await prisma.platformAuditLog.findMany({
      where: {
        targetType: "LocalContact",
        targetId: contactId,
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return entries.map((entry) => ({
      id: entry.id,
      actorName: entry.actorName,
      actorEmail: entry.actorEmail,
      action: entry.action,
      createdAt: entry.createdAt.toISOString(),
      metadata: entry.metadata as Record<string, unknown> | null,
    }));
  });
}

// ─── Export ────────────────────────────────────────────

import { format } from "date-fns";

export async function exportContactProfile(contactId: string) {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    const contact = await prisma.localContact.findUnique({
      where: { id: contactId },
      select: {
        id: true,
        organizationId: true,
        name: true,
        email: true,
        phone: true,
        position: true,
        department: true,
        organizationName: true,
        sensitivityLevel: true,
        exportStatus: true,
        notes: true,
        tags: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        evidence: { orderBy: { createdAt: "desc" } },
        reviews: { include: { approvals: true }, orderBy: { createdAt: "desc" } },
        interactions: { orderBy: { occurredAt: "desc" }, take: 50 },
        outgoingRelations: { include: { targetContact: { select: { name: true } } } },
        incomingRelations: { include: { sourceContact: { select: { name: true } } } },
      },
    });
    if (!contact || contact.organizationId !== user.organizationId) {
      throw new Error("Contact not found or access denied");
    }

    // L5: Export approval gate — only approved exports can proceed
    if (contact.sensitivityLevel !== "normal" && contact.exportStatus !== "approved") {
      throw new Error(
        "Export requires approval. Request export approval first.",
      );
    }

    const { buildExportMetadata } = await import("@/lib/platform/production-export");
    const exportHeader = buildExportMetadata({
      exportedBy: user.name ?? user.email,
      exportType: "contact_profile",
      organizationId: user.organizationId,
      source: "localcontactos",
    });

    return {
      ...exportHeader,
      contact: {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        position: contact.position,
        department: contact.department,
        organizationName: contact.organizationName,
        sensitivityLevel: contact.sensitivityLevel,
        notes: contact.notes,
        tags: contact.tags,
        isActive: contact.isActive,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
      },
      interactions: contact.interactions,
      evidence: contact.evidence.map((e) => ({
        id: e.id,
        filename: e.filename,
        fileType: e.fileType,
        evidenceType: e.evidenceType,
        description: e.description,
        createdAt: e.createdAt,
      })),
      reviews: contact.reviews.map((r) => ({
        id: r.id,
        reviewType: r.reviewType,
        status: r.status,
        reviewerName: r.reviewerName,
        reason: r.reason,
        createdAt: r.createdAt,
        approvals: r.approvals.map((a) => ({
          approverName: a.approverName,
          status: a.status,
          note: a.note,
          createdAt: a.createdAt,
        })),
      })),
      metadata: {
        disclaimer: exportHeader.disclaimer,
        generatedBy: "AQLIYA LocalContactOS v0.1",
        retentionDays: 730,
      },
    };
  });
}
