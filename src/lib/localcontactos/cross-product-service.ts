"server-only";

import { prisma } from "@/lib/prisma";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CrossProductContactView {
  contact: {
    id: string;
    name: string;
    organizationName: string;
    sensitivityLevel: string;
    position: string;
    email: string;
    phone: string;
    tags: string[];
  };
  salesOS: {
    relatedAccounts: { id: string; name: string; industry: string | null }[];
    relatedDeals: { id: string; title: string; status: string; amount: number | null }[];
    recentInteractions: { id: string; type: string; subject: string | null; occurredAt: string }[];
    totalDealValue: number;
  };
  decisionOS: {
    relatedDecisions: { id: string; title: string; status: string; type: string }[];
    decisionsAsStakeholder: number;
  };
  localContactOS: {
    totalInteractions: number;
    totalRelations: number;
    lastInteraction: string | null;
    riskFlags: string[];
  };
  timeline: CrossProductTimelineEntry[];
}

export interface CrossProductTimelineEntry {
  date: string;
  product: "salesos" | "decisionos" | "localcontactos";
  action: string;
  description: string;
  link?: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export async function getCrossProductContactView(
  contactId: string,
  organizationId: string,
): Promise<CrossProductContactView> {
  const contact = await prisma.localContact.findFirst({
    where: { id: contactId, organizationId },
    select: {
      id: true,
      name: true,
      organizationName: true,
      sensitivityLevel: true,
      position: true,
      email: true,
      phone: true,
      tags: true,
      interactions: {
        orderBy: { occurredAt: "desc" },
        select: { id: true, interactionType: true, subject: true, occurredAt: true },
      },
      outgoingRelations: {
        select: {
          id: true,
          targetContact: { select: { id: true, name: true, organizationName: true } },
          relationType: true,
        },
      },
      incomingRelations: {
        select: {
          id: true,
          sourceContact: { select: { id: true, name: true, organizationName: true } },
          relationType: true,
        },
      },
    },
  });

  if (!contact) throw new Error("Contact not found");

  const contactOrgName = contact.organizationName ?? "";

  // ── SalesOS ──────────────────────────────────────────────────────────────
  const [salesAccounts, salesDeals, salesInteractions] = await Promise.all([
    prisma.salesAccount.findMany({
      where: {
        organizationId,
        OR: [
          { name: { contains: contactOrgName, mode: "insensitive" } },
          { contacts: { some: { name: { contains: contact.name, mode: "insensitive" } } } },
        ],
      },
      select: { id: true, name: true, industry: true },
      take: 10,
    }).catch(() => []),
    prisma.salesDeal.findMany({
      where: {
        organizationId,
        OR: [
          { account: { name: { contains: contactOrgName, mode: "insensitive" } } },
          { title: { contains: contact.name, mode: "insensitive" } },
        ],
      },
      select: { id: true, title: true, status: true, amount: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }).catch(() => []),
    prisma.salesInteraction.findMany({
      where: {
        organizationId,
        OR: [
          { subject: { contains: contact.name, mode: "insensitive" } },
          { summary: { contains: contact.name, mode: "insensitive" } },
          { account: { name: { contains: contactOrgName, mode: "insensitive" } } },
        ],
      },
      select: { id: true, type: true, subject: true, occurredAt: true },
      orderBy: { occurredAt: "desc" },
      take: 20,
    }).catch(() => []),
  ]);

  const totalDealValue = salesDeals.reduce((s, d) => s + (d.amount ?? 0), 0);

  // ── DecisionOS ───────────────────────────────────────────────────────────
  const relatedDecisions = await prisma.decision.findMany({
    where: {
      organizationId,
      OR: [
        { title: { contains: contactOrgName, mode: "insensitive" } },
        { title: { contains: contact.name, mode: "insensitive" } },
        { description: { contains: contact.name, mode: "insensitive" } },
      ],
    },
    select: { id: true, title: true, status: true, type: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  }).catch(() => []);

  // ── LocalContactOS ───────────────────────────────────────────────────────
  const totalInteractions = contact.interactions.length;
  const totalRelations =
    contact.outgoingRelations.length + contact.incomingRelations.length;
  const lastInteraction =
    contact.interactions[0]?.occurredAt?.toISOString() ?? null;

  const riskFlags: string[] = [];
  if (contact.sensitivityLevel === "confidential") riskFlags.push("حساسية عالية");
  if (!lastInteraction) riskFlags.push("لا يوجد تواصل سابق");
  else {
    const days = Math.floor(
      (Date.now() - new Date(lastInteraction).getTime()) / (24 * 60 * 60 * 1000),
    );
    if (days > 90) riskFlags.push(`آخر تواصل منذ ${days} يوم`);
    else if (days > 60) riskFlags.push(`التواصل يضعف — ${days} يوم`);
  }
  if (totalRelations === 0) riskFlags.push("لا توجد علاقات مسجلة");

  // ── Timeline ─────────────────────────────────────────────────────────────
  const timeline: CrossProductTimelineEntry[] = [];

  // LocalContactOS interactions
  for (const ix of contact.interactions.slice(0, 10)) {
    timeline.push({
      date: ix.occurredAt.toISOString(),
      product: "localcontactos",
      action: ix.interactionType,
      description: ix.subject ?? "تفاعل",
      link: `/contacts/${contact.id}`,
    });
  }

  // SalesOS interactions
  for (const ix of salesInteractions.slice(0, 5)) {
    timeline.push({
      date: ix.occurredAt.toISOString(),
      product: "salesos",
      action: ix.type,
      description: ix.subject ?? "تفاعل مبيعات",
      link: `/sales/deals`,
    });
  }

  // DecisionOS — decision creation as timeline entries
  for (const d of relatedDecisions.slice(0, 5)) {
    timeline.push({
      date: new Date().toISOString(), // approximate
      product: "decisionos",
      action: d.status,
      description: d.title,
      link: `/decisions/${d.id}`,
    });
  }

  // Sort timeline by date descending
  timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    contact: {
      id: contact.id,
      name: contact.name,
      organizationName: contact.organizationName ?? "غير محدد",
      sensitivityLevel: contact.sensitivityLevel,
      position: contact.position ?? "",
      email: contact.email ?? "",
      phone: contact.phone ?? "",
      tags: (contact.tags as string[]) ?? [],
    },
    salesOS: {
      relatedAccounts: salesAccounts,
      relatedDeals: salesDeals,
      recentInteractions: salesInteractions.map((ix) => ({
        id: ix.id,
        type: ix.type,
        subject: ix.subject,
        occurredAt: ix.occurredAt.toISOString(),
      })),
      totalDealValue,
    },
    decisionOS: {
      relatedDecisions,
      decisionsAsStakeholder: relatedDecisions.length,
    },
    localContactOS: {
      totalInteractions,
      totalRelations,
      lastInteraction,
      riskFlags,
    },
    timeline: timeline.slice(0, 30),
  };
}
