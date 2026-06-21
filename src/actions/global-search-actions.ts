"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export interface SearchResult {
  id: string
  label: string
  labelAr?: string
  description?: string
  type: "decision" | "account" | "opportunity" | "engagement" | "assessment"
  href: string
  icon: string
  score: number
}

function scoreField(fieldValue: string, query: string): number {
  const lower = fieldValue.toLowerCase()
  const q = query.toLowerCase()
  if (lower === q) return 100
  if (lower.startsWith(q)) return 80
  if (lower.includes(q)) return 50
  return 0
}

export async function globalSearchAction(query: string, limit = 20): Promise<SearchResult[]> {
  try {
    const user = await getCurrentUser()
    const orgId = user.organizationId

    if (!query || query.trim().length < 2) return []

    const q = query.trim()
    const results: SearchResult[] = []

    // 1. Decisions
    const decisions = await prisma.decision.findMany({
      where: {
        organizationId: orgId,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      take: limit,
      select: { id: true, title: true, description: true },
    })
    for (const d of decisions) {
      const titleScore = scoreField(d.title, q)
      const descScore = d.description ? scoreField(d.description, q) : 0
      results.push({
        id: d.id,
        label: d.title,
        labelAr: d.title,
        description: d.description ?? undefined,
        type: "decision",
        href: `/decisions/${d.id}`,
        icon: "Brain",
        score: Math.max(titleScore, descScore),
      })
    }

    // 2. Sales Accounts
    const accounts = await prisma.salesAccount.findMany({
      where: {
        organizationId: orgId,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { industry: { contains: q, mode: "insensitive" } },
        ],
      },
      take: limit,
      select: { id: true, name: true, industry: true },
    })
    for (const a of accounts) {
      const nameScore = scoreField(a.name, q)
      const indScore = a.industry ? scoreField(a.industry, q) : 0
      results.push({
        id: a.id,
        label: a.name,
        labelAr: a.name,
        description: a.industry ?? undefined,
        type: "account",
        href: `/sales`,
        icon: "Building2",
        score: Math.max(nameScore, indScore),
      })
    }

    // 3. Sales Deals (opportunities)
    const deals = await prisma.salesDeal.findMany({
      where: {
        organizationId: orgId,
        title: { contains: q, mode: "insensitive" },
      },
      take: limit,
      select: { id: true, title: true, amount: true },
    })
    for (const de of deals) {
      results.push({
        id: de.id,
        label: de.title,
        labelAr: de.title,
        description: de.amount ? `${de.amount} SAR` : undefined,
        type: "opportunity",
        href: `/sales`,
        icon: "TrendingUp",
        score: scoreField(de.title, q),
      })
    }

    // 4. Audit Engagements (via fiscalPeriod + client name)
    const engagements = await prisma.auditEngagement.findMany({
      where: {
        organizationId: orgId,
        OR: [
          { fiscalPeriod: { contains: q, mode: "insensitive" } },
          { client: { name: { contains: q, mode: "insensitive" } } },
        ],
      },
      take: limit,
      select: { id: true, fiscalPeriod: true, client: { select: { id: true, name: true } } },
    })
    for (const eng of engagements) {
      const label = `${eng.client.name} — ${eng.fiscalPeriod}`
      const fpScore = scoreField(eng.fiscalPeriod, q)
      const clientScore = scoreField(eng.client.name, q)
      results.push({
        id: eng.id,
        label,
        description: eng.fiscalPeriod,
        type: "engagement",
        href: `/audit/engagements/${eng.id}`,
        icon: "ShieldCheck",
        score: Math.max(fpScore, clientScore),
      })
    }

    // 5. Local Content Projects (as assessment)
    const projects = await prisma.localContentProject.findMany({
      where: {
        organizationId: orgId,
        name: { contains: q, mode: "insensitive" },
      },
      take: limit,
      select: { id: true, name: true, status: true },
    })
    for (const p of projects) {
      results.push({
        id: p.id,
        label: p.name,
        labelAr: p.name,
        description: p.status,
        type: "assessment",
        href: `/local-content/assessments/${p.id}`,
        icon: "Globe",
        score: scoreField(p.name, q),
      })
    }

    results.sort((a, b) => b.score - a.score)
    return results.slice(0, limit)
  } catch (error) {
    console.error("Global search error:", error)
    return []
  }
}
