"server-only";

import { prisma } from "@/lib/prisma";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ContactAnalytics {
  overview: {
    total: number;
    active: number;
    inactive: number;
    bySensitivity: Record<string, number>;
    byDepartment: Record<string, number>;
  };
  interactions: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    byType: Record<string, number>;
    monthlyTrend: { month: string; count: number }[];
  };
  relations: {
    total: number;
    byType: Record<string, number>;
    avgStrength: number;
    strongestRelation: { source: string; target: string; type: string; strength: number } | null;
  };
  riskFlags: {
    stale: ContactSummary[];        // no interaction in 60+ days
    highSensitivity: ContactSummary[];  // confidential contacts
    inactive: ContactSummary[];     // isActive = false
  };
  recommendations: Recommendation[];
}

export interface ContactSummary {
  id: string;
  name: string;
  organizationName: string;
  sensitivityLevel: string;
  lastInteraction: string | null;
  daysSinceInteraction: number | null;
}

export interface Recommendation {
  type: "stale" | "follow_up" | "sensitivity_review" | "missing_info";
  contactId: string;
  contactName: string;
  message: string;
  messageAr: string;
  priority: "high" | "medium" | "low";
}

// ─── Main Analytics ──────────────────────────────────────────────────────────

export async function getContactAnalytics(
  organizationId: string,
): Promise<ContactAnalytics> {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const staleThreshold = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000); // 60 days

  const [
    contacts,
    interactions,
    relations,
  ] = await Promise.all([
    prisma.localContact.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        sensitivityLevel: true,
        department: true,
        organizationName: true,
        isActive: true,
        email: true,
        interactions: {
          orderBy: { occurredAt: "desc" },
          take: 1,
          select: { occurredAt: true },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.localContactInteraction.findMany({
      where: { organizationId },
      select: { interactionType: true, occurredAt: true },
      orderBy: { occurredAt: "desc" },
    }),
    prisma.localContactRelation.findMany({
      where: { organizationId, isActive: true },
      select: {
        sourceContactId: true,
        targetContactId: true,
        relationType: true,
        strength: true,
      },
    }),
  ]);

  // ── Overview ──
  const bySensitivity: Record<string, number> = {};
  const byDepartment: Record<string, number> = {};
  for (const c of contacts) {
    bySensitivity[c.sensitivityLevel] = (bySensitivity[c.sensitivityLevel] ?? 0) + 1;
    const dept = c.department ?? "غير محدد";
    byDepartment[dept] = (byDepartment[dept] ?? 0) + 1;
  }

  // ── Interactions ──
  const byType: Record<string, number> = {};
  let thisMonth = 0;
  let lastMonth = 0;
  const monthlyTrendMap = new Map<string, number>();

  for (const ix of interactions) {
    byType[ix.interactionType] = (byType[ix.interactionType] ?? 0) + 1;

    const d = ix.occurredAt;
    if (d >= thisMonthStart) thisMonth++;
    else if (d >= lastMonthStart && d < thisMonthStart) lastMonth++;

    // Monthly trend (last 6 months)
    if (d >= new Date(now.getFullYear(), now.getMonth() - 5, 1)) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyTrendMap.set(key, (monthlyTrendMap.get(key) ?? 0) + 1);
    }
  }

  const monthlyTrend = Array.from(monthlyTrendMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));

  // ── Relations ──
  const byRelationType: Record<string, number> = {};
  let strongest: ContactAnalytics["relations"]["strongestRelation"] = null;
  for (const r of relations) {
    byRelationType[r.relationType] = (byRelationType[r.relationType] ?? 0) + 1;
    if (!strongest || r.strength > strongest.strength) {
      const src = contacts.find((c) => c.id === r.sourceContactId);
      const tgt = contacts.find((c) => c.id === r.targetContactId);
      strongest = {
        source: src?.name ?? r.sourceContactId,
        target: tgt?.name ?? r.targetContactId,
        type: r.relationType,
        strength: r.strength,
      };
    }
  }

  const avgStrength =
    relations.length > 0
      ? Math.round(relations.reduce((s, r) => s + r.strength, 0) / relations.length)
      : 0;

  // ── Risk Flags ──
  const stale: ContactSummary[] = [];
  const highSensitivity: ContactSummary[] = [];
  const inactive: ContactSummary[] = [];

  for (const c of contacts) {
    const lastIx = c.interactions[0]?.occurredAt ?? null;
    const daysSince = lastIx
      ? Math.floor((now.getTime() - lastIx.getTime()) / (24 * 60 * 60 * 1000))
      : null;

    const summary: ContactSummary = {
      id: c.id,
      name: c.name,
      organizationName: c.organizationName ?? "غير محدد",
      sensitivityLevel: c.sensitivityLevel,
      lastInteraction: lastIx?.toISOString() ?? null,
      daysSinceInteraction: daysSince,
    };

    if (lastIx && lastIx < staleThreshold) stale.push(summary);
    if (c.sensitivityLevel === "confidential") highSensitivity.push(summary);
    if (!c.isActive) inactive.push(summary);
  }

  // ── Recommendations ──
  const recommendations = generateRecommendations(contacts, interactions, relations);

  return {
    overview: {
      total: contacts.length,
      active: contacts.filter((c) => c.isActive).length,
      inactive: contacts.filter((c) => !c.isActive).length,
      bySensitivity,
      byDepartment,
    },
    interactions: {
      total: interactions.length,
      thisMonth,
      lastMonth,
      byType,
      monthlyTrend,
    },
    relations: {
      total: relations.length,
      byType: byRelationType,
      avgStrength,
      strongestRelation: strongest,
    },
    riskFlags: { stale, highSensitivity, inactive },
    recommendations,
  };
}

// ─── Recommendations Engine ─────────────────────────────────────────────────

function generateRecommendations(
  contacts: { id: string; name: string; email: string | null; isActive: boolean; interactions: { occurredAt: Date }[] }[],
  interactions: { occurredAt: Date }[],
  _relations: { sourceContactId: string; targetContactId: string }[],
): Recommendation[] {
  const now = new Date();
  const recs: Recommendation[] = [];

  for (const c of contacts) {
    const lastIx = c.interactions[0]?.occurredAt;
    const daysSince = lastIx
      ? Math.floor((now.getTime() - lastIx.getTime()) / (24 * 60 * 60 * 1000))
      : null;

    // Stale contacts (90+ days)
    if (daysSince && daysSince > 90) {
      recs.push({
        type: "stale",
        contactId: c.id,
        contactName: c.name,
        message: `No interaction with ${c.name} in ${daysSince} days. Schedule a follow-up.`,
        messageAr: `لا يوجد تواصل مع ${c.name} منذ ${daysSince} يوماً. يوصى بجدولة متابعة.`,
        priority: "high",
      });
    } else if (daysSince && daysSince > 60) {
      recs.push({
        type: "stale",
        contactId: c.id,
        contactName: c.name,
        message: `Contact ${c.name} is becoming stale (${daysSince} days). Consider reaching out.`,
        messageAr: `التواصل مع ${c.name} بدأ يضعف (${daysSince} يوماً). يُنصح بالتواصل.`,
        priority: "medium",
      });
    }

    // No interactions at all
    if (!lastIx && c.isActive) {
      recs.push({
        type: "follow_up",
        contactId: c.id,
        contactName: c.name,
        message: `${c.name} has no recorded interactions. Log your first interaction.`,
        messageAr: `${c.name} ليس لديه أي تفاعلات مسجلة. سجّل أول تفاعل.`,
        priority: "medium",
      });
    }

    // Missing email
    if (!c.email) {
      recs.push({
        type: "missing_info",
        contactId: c.id,
        contactName: c.name,
        message: `${c.name} is missing an email address.`,
        messageAr: `ينقص ${c.name} عنوان البريد الإلكتروني.`,
        priority: "low",
      });
    }
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recs.slice(0, 10); // Top 10
}
