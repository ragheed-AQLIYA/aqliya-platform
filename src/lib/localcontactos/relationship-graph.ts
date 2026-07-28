"server-only";

import { prisma } from "@/lib/prisma";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GraphNode {
  id: string;
  name: string;
  group: "contact" | "organization";
  sensitivityLevel: string;
  organizationName: string;
  position: string;
  email: string;
  interactionCount: number;
  lastInteraction: string | null;
}

export interface GraphLink {
  source: string;
  target: string;
  relationType: string;
  strength: number;
  label: string;
}

export interface RelationshipGraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface GetGraphParams {
  organizationId: string;
  sensitivityLevel?: string;
  relationType?: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export async function getRelationshipGraphData(
  params: GetGraphParams,
): Promise<RelationshipGraphData> {
  const { organizationId, sensitivityLevel, relationType } = params;

  // Fetch all active contacts
  const contacts = await prisma.localContact.findMany({
    where: {
      organizationId,
      isActive: true,
      ...(sensitivityLevel && sensitivityLevel !== "all"
        ? { sensitivityLevel }
        : {}),
    },
    select: {
      id: true,
      name: true,
      sensitivityLevel: true,
      organizationName: true,
      position: true,
      email: true,
      interactions: {
        orderBy: { occurredAt: "desc" },
        take: 1,
        select: { occurredAt: true },
      },
      _count: { select: { interactions: true } },
    },
    orderBy: { name: "asc" },
  });

  // Fetch relations
  const relations = await prisma.localContactRelation.findMany({
    where: {
      organizationId,
      isActive: true,
      ...(relationType && relationType !== "all" ? { relationType } : {}),
    },
    select: {
      sourceContactId: true,
      targetContactId: true,
      relationType: true,
      strength: true,
      description: true,
    },
  });

  // Build nodes
  const nodes: GraphNode[] = contacts.map((c) => ({
    id: c.id,
    name: c.name,
    group: "contact" as const,
    sensitivityLevel: c.sensitivityLevel,
    organizationName: c.organizationName ?? "غير محدد",
    position: c.position ?? "",
    email: c.email ?? "",
    interactionCount: c._count.interactions,
    lastInteraction:
      c.interactions[0]?.occurredAt?.toISOString() ?? null,
  }));

  // Build links (only between contacts that exist)
  const contactIds = new Set(contacts.map((c) => c.id));
  const links: GraphLink[] = relations
    .filter((r) => contactIds.has(r.sourceContactId) && contactIds.has(r.targetContactId))
    .map((r) => ({
      source: r.sourceContactId,
      target: r.targetContactId,
      relationType: r.relationType,
      strength: r.strength,
      label: r.description ?? getRelationLabel(r.relationType),
    }));

  return { nodes, links };
}

// ─── Graph Stats ─────────────────────────────────────────────────────────────

export interface GraphStats {
  totalContacts: number;
  totalRelations: number;
  avgStrength: number;
  sensitivityDistribution: Record<string, number>;
  relationTypeDistribution: Record<string, number>;
  isolatedContacts: number;
  mostConnected: { name: string; connections: number } | null;
}

export async function getGraphStats(
  organizationId: string,
): Promise<GraphStats> {
  const [contacts, relations] = await Promise.all([
    prisma.localContact.findMany({
      where: { organizationId, isActive: true },
      select: { id: true, name: true, sensitivityLevel: true },
    }),
    prisma.localContactRelation.findMany({
      where: { organizationId, isActive: true },
      select: { sourceContactId: true, targetContactId: true, relationType: true, strength: true },
    }),
  ]);

  // Connection counts
  const connectionCount = new Map<string, number>();
  for (const r of relations) {
    connectionCount.set(r.sourceContactId, (connectionCount.get(r.sourceContactId) ?? 0) + 1);
    connectionCount.set(r.targetContactId, (connectionCount.get(r.targetContactId) ?? 0) + 1);
  }

  // Sensitivity distribution
  const sensitivityDistribution: Record<string, number> = {};
  for (const c of contacts) {
    sensitivityDistribution[c.sensitivityLevel] =
      (sensitivityDistribution[c.sensitivityLevel] ?? 0) + 1;
  }

  // Relation type distribution
  const relationTypeDistribution: Record<string, number> = {};
  for (const r of relations) {
    relationTypeDistribution[r.relationType] =
      (relationTypeDistribution[r.relationType] ?? 0) + 1;
  }

  // Most connected
  let mostConnected: { name: string; connections: number } | null = null;
  for (const c of contacts) {
    const conns = connectionCount.get(c.id) ?? 0;
    if (!mostConnected || conns > mostConnected.connections) {
      mostConnected = { name: c.name, connections: conns };
    }
  }

  // Isolated contacts (no relations at all)
  const isolatedContacts = contacts.filter((c) => !connectionCount.has(c.id)).length;

  const avgStrength =
    relations.length > 0
      ? Math.round(relations.reduce((s, r) => s + r.strength, 0) / relations.length)
      : 0;

  return {
    totalContacts: contacts.length,
    totalRelations: relations.length,
    avgStrength,
    sensitivityDistribution,
    relationTypeDistribution,
    isolatedContacts,
    mostConnected,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const RELATION_LABELS: Record<string, string> = {
  colleague: "زميل",
  manager: "مدير",
  subordinate: "مرؤوس",
  partner: "شريك",
  client: "عميل",
  vendor: "مورّد",
  board_member: "عضو مجلس",
  investor: "مستثمر",
  other: "أخرى",
};

function getRelationLabel(type: string): string {
  return RELATION_LABELS[type] ?? type;
}
