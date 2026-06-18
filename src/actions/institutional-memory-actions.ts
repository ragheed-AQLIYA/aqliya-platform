"use server";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUserContext } from "@/lib/auth";
import { auditLogger, Product } from "@/lib/platform/audit-logger";

// ─── Types ───

export type MemoryEventData = {
  id: string;
  sourceProduct: string;
  sourceEntityId: string;
  sourceEntityType: string;
  targetProduct: string;
  targetEntityId: string;
  targetEntityType: string;
  eventType: string;
  description: string;
  confidence: number;
  createdBy: { id: string; name: string | null } | null;
  createdAt: Date;
};

export type CollectionData = {
  id: string;
  name: string;
  description: string;
  filterCriteria: Record<string, unknown>;
  createdBy: { id: string; name: string | null } | null;
  eventCount: number;
  createdAt: Date;
};

export type GraphNodeData = {
  id: string;
  name: string;
  type: string;
  metadata: Record<string, unknown> | null;
};

export type GraphEdgeData = {
  id: string;
  sourceId: string;
  targetId: string;
  relationType: string;
  weight: number;
};

export type MemoryStats = {
  totalEvents: number;
  totalCollections: number;
  totalGraphNodes: number;
  totalGraphEdges: number;
  recentEvents: number;
  eventsByProduct: Record<string, number>;
};

// ─── Helpers ───

const EVENT_INCLUDE = {
  createdBy: { select: { id: true, name: true } },
} as const;

type EventWithCreator = Prisma.InstitutionalMemoryEventGetPayload<{
  include: typeof EVENT_INCLUDE;
}>;

type CollectionWithCreator = Prisma.InstitutionalMemoryCollectionGetPayload<{
  include: { createdBy: { select: { id: true; name: true } } };
}>;

function mapEvent(e: EventWithCreator): MemoryEventData {
  return {
    id: e.id,
    sourceProduct: e.sourceProduct,
    sourceEntityId: e.sourceEntityId,
    sourceEntityType: e.sourceEntityType,
    targetProduct: e.targetProduct,
    targetEntityId: e.targetEntityId,
    targetEntityType: e.targetEntityType,
    eventType: e.eventType,
    description: e.description ?? "",
    confidence: e.confidence ?? 1,
    createdBy: e.createdBy ?? null,
    createdAt: e.createdAt,
  };
}

function isAuthRedirectError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.message.includes("unauthorized") ||
    error.message.includes("NEXT_REDIRECT")
  );
}

async function getUserCtx() {
  const user = await requireUserContext();
  return {
    organizationId: user.platformOrganizationId ?? user.organizationId,
    userId: user.id,
  };
}

// ─── Server Actions ───

export async function getMemoryEvents(
  organizationId?: string,
  limit = 50,
): Promise<{ success: boolean; data?: MemoryEventData[]; error?: string }> {
  try {
    const { organizationId: orgId } = await getUserCtx();
    void organizationId;
    const events = await prisma.institutionalMemoryEvent.findMany({
      where: { organizationId: orgId },
      include: EVENT_INCLUDE,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return { success: true, data: events.map(mapEvent) };
  } catch (error: unknown) {
    if (isAuthRedirectError(error)) throw error;
    return { success: false, error: "Failed to fetch memory events" };
  }
}

export async function createMemoryEvent(input: {
  sourceProduct: string;
  sourceEntityId: string;
  sourceEntityType: string;
  targetProduct: string;
  targetEntityId: string;
  targetEntityType: string;
  eventType: string;
  description?: string;
  confidence?: number;
}): Promise<{ success: boolean; data?: MemoryEventData; error?: string }> {
  try {
    const { organizationId: orgId, userId } = await getUserCtx();
    const event = await prisma.institutionalMemoryEvent.create({
      data: {
        organizationId: orgId,
        sourceProduct: input.sourceProduct,
        sourceEntityId: input.sourceEntityId,
        sourceEntityType: input.sourceEntityType,
        targetProduct: input.targetProduct,
        targetEntityId: input.targetEntityId,
        targetEntityType: input.targetEntityType,
        eventType: input.eventType,
        description: input.description ?? "",
        confidence: input.confidence ?? 1,
        createdById: userId,
      },
      include: EVENT_INCLUDE,
    });
    await auditLogger({
      productKey: Product.PLATFORM,
      sourceSystem: "institutional_memory",
      organization: { platformOrganizationId: orgId },
      actor: { id: userId, type: "user" },
    }).record("MEMORY_EVENT_CREATED", { type: "institutional_memory_event", id: event.id }, {
      severity: "info",
      status: "recorded",
      sourceModel: "InstitutionalMemoryEvent",
      sourceId: event.id,
      metadata: { sourceProduct: input.sourceProduct, targetProduct: input.targetProduct, eventType: input.eventType },
    });
    return { success: true, data: mapEvent(event) };
  } catch (error: unknown) {
    if (isAuthRedirectError(error)) throw error;
    return { success: false, error: "Failed to create memory event" };
  }
}

export async function deleteMemoryEvent(
  eventId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { organizationId: orgId } = await getUserCtx();
    const existing = await prisma.institutionalMemoryEvent.findUnique({
      where: { id: eventId },
      select: { id: true, organizationId: true },
    });
    if (!existing) return { success: false, error: "Event not found" };
    if (existing.organizationId !== orgId) return { success: false, error: "Unauthorized" };
    await prisma.institutionalMemoryEvent.delete({ where: { id: eventId } });
    return { success: true };
  } catch (error: unknown) {
    if (isAuthRedirectError(error)) throw error;
    return { success: false, error: "Failed to delete memory event" };
  }
}

export async function getCollections(): Promise<{
  success: boolean;
  data?: CollectionData[];
  error?: string;
}> {
  try {
    const { organizationId: orgId } = await getUserCtx();
    const collections = await prisma.institutionalMemoryCollection.findMany({
      where: { organizationId: orgId },
      include: { createdBy: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
    const data: CollectionData[] = await Promise.all(
      collections.map(async (c: CollectionWithCreator) => {
        const eventCount = await prisma.institutionalMemoryEvent.count({
          where: { organizationId: orgId },
        });
        return {
          id: c.id,
          name: c.name,
          description: c.description ?? "",
          filterCriteria: (c.filterCriteria as Record<string, unknown>) ?? {},
          createdBy: c.createdBy ?? null,
          eventCount,
          createdAt: c.createdAt,
        };
      }),
    );
    return { success: true, data };
  } catch (error: unknown) {
    if (isAuthRedirectError(error)) throw error;
    return { success: false, error: "Failed to fetch collections" };
  }
}

export async function createCollection(input: {
  name: string;
  description?: string;
}): Promise<{ success: boolean; data?: CollectionData; error?: string }> {
  try {
    const { organizationId: orgId, userId } = await getUserCtx();
    const collection = await prisma.institutionalMemoryCollection.create({
      data: {
        organizationId: orgId,
        name: input.name,
        description: input.description ?? "",
        filterCriteria: {} as Prisma.InputJsonValue,
        createdById: userId,
        updatedById: userId,
      },
      include: { createdBy: { select: { id: true, name: true } } },
    });
    return {
      success: true,
      data: {
        id: collection.id,
        name: collection.name,
        description: collection.description ?? "",
        filterCriteria: {},
        createdBy: collection.createdBy ?? null,
        eventCount: 0,
        createdAt: collection.createdAt,
      },
    };
  } catch (error: unknown) {
    if (isAuthRedirectError(error)) throw error;
    return { success: false, error: "Failed to create collection" };
  }
}

export async function deleteCollection(
  collectionId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { organizationId: orgId } = await getUserCtx();
    const existing = await prisma.institutionalMemoryCollection.findUnique({
      where: { id: collectionId },
      select: { id: true, organizationId: true },
    });
    if (!existing) return { success: false, error: "Collection not found" };
    if (existing.organizationId !== orgId) return { success: false, error: "Unauthorized" };
    await prisma.institutionalMemoryCollection.delete({ where: { id: collectionId } });
    return { success: true };
  } catch (error: unknown) {
    if (isAuthRedirectError(error)) throw error;
    return { success: false, error: "Failed to delete collection" };
  }
}

export async function getGraphData(): Promise<{
  success: boolean;
  data?: { nodes: GraphNodeData[]; edges: GraphEdgeData[] };
  error?: string;
}> {
  try {
    const { organizationId: orgId } = await getUserCtx();
    const [nodes, edges] = await Promise.all([
      prisma.intelligenceGraphNode.findMany({
        where: { organizationId: orgId },
        select: { id: true, name: true, type: true, metadata: true },
        orderBy: { updatedAt: "desc" },
        take: 100,
      }),
      prisma.intelligenceGraphEdge.findMany({
        where: { organizationId: orgId },
        select: { id: true, sourceId: true, targetId: true, relationType: true, weight: true },
        take: 200,
      }),
    ]);
    return {
      success: true,
      data: {
        nodes: nodes.map((n) => ({
          id: n.id,
          name: n.name,
          type: n.type,
          metadata: n.metadata as Record<string, unknown> | null,
        })),
        edges: edges.map((e) => ({
          id: e.id,
          sourceId: e.sourceId,
          targetId: e.targetId,
          relationType: e.relationType,
          weight: e.weight,
        })),
      },
    };
  } catch (error: unknown) {
    if (isAuthRedirectError(error)) throw error;
    return { success: false, error: "Failed to fetch graph data" };
  }
}

export async function getMemoryDashboardStats(): Promise<{
  success: boolean;
  data?: MemoryStats;
  error?: string;
}> {
  try {
    const { organizationId: orgId } = await getUserCtx();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [
      totalEvents,
      totalCollections,
      totalGraphNodes,
      totalGraphEdges,
      recentEvents,
      eventsByProduct,
    ] = await Promise.all([
      prisma.institutionalMemoryEvent.count({ where: { organizationId: orgId } }),
      prisma.institutionalMemoryCollection.count({ where: { organizationId: orgId } }),
      prisma.intelligenceGraphNode.count({ where: { organizationId: orgId } }),
      prisma.intelligenceGraphEdge.count({ where: { organizationId: orgId } }),
      prisma.institutionalMemoryEvent.count({
        where: { organizationId: orgId, createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.institutionalMemoryEvent.groupBy({
        by: ["sourceProduct"],
        where: { organizationId: orgId },
        _count: { id: true },
      }),
    ]);
    return {
      success: true,
      data: {
        totalEvents,
        totalCollections,
        totalGraphNodes,
        totalGraphEdges,
        recentEvents,
        eventsByProduct: Object.fromEntries(
          eventsByProduct.map((e) => [e.sourceProduct, e._count.id]),
        ),
      },
    };
  } catch (error: unknown) {
    if (isAuthRedirectError(error)) throw error;
    return { success: false, error: "Failed to fetch dashboard stats" };
  }
}

// ─── Product names for display ───

export const PRODUCT_LABELS: Record<string, string> = {
  audit: "AuditOS",
  decisions: "DecisionOS",
  workflow: "WorkflowOS",
  sales: "SalesOS",
  contacts: "LocalContactOS",
  platform: "المنصة",
};

export const PRODUCT_LABELS_AR: Record<string, string> = {
  audit: "أوديت أو إس",
  decisions: "ديجنشن أو إس",
  workflow: "ورك فلو أو إس",
  sales: "سيلز أو إس",
  contacts: "جهات الاتصال المحلية",
  platform: "المنصة",
};

export const EVENT_TYPE_LABELS_AR: Record<string, string> = {
  linked: "مرتبط",
  referenced: "مشار إليه",
  generated_by: "منشأ بواسطة",
  approved_by: "معتمد بواسطة",
  related_to: "مرتبط بـ",
  created: "منشأ",
  updated: "مُحدَّث",
};
