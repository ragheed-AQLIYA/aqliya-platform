"use server";

import { revalidatePath } from "next/cache";
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
