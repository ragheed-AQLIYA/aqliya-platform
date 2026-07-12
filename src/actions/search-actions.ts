"use server"

import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export interface SearchResult {
  id: string
  type: "engagement" | "decision" | "project" | "client" | "contact" | "evidence" | "finding"
  title: string
  subtitle: string
  url: string
  matchField: string
}

export async function globalSearch(query: string, limit = 10): Promise<SearchResult[]> {
  if (!query || query.length < 2) return []

  const user = await getCurrentUser()
  if (!user) return []

  const orgId = user.organizationId!
  const results: SearchResult[] = []

  // Search engagements
  try {
    const engagements = await prisma.auditEngagement.findMany({
      where: {
        organizationId: orgId,
        client: { name: { contains: query, mode: "insensitive" } },
      },
      take: limit,
      select: { id: true, fiscalPeriod: true, client: { select: { name: true } } },
    })
    for (const e of engagements) {
      results.push({
        id: e.id,
        type: "engagement",
        title: `${e.client.name} — ${e.fiscalPeriod}`,
        subtitle: e.client.name,
        url: `/audit/engagements/${e.id}`,
        matchField: "client",
      })
    }
  } catch { /* silent */ }

  // Search decisions
  try {
    const decisions = await prisma.decision.findMany({
      where: {
        organizationId: orgId,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limit,
      select: { id: true, title: true, description: true },
    })
    for (const d of decisions) {
      results.push({
        id: d.id,
        type: "decision",
        title: d.title,
        subtitle: d.description?.slice(0, 80) ?? "",
        url: `/decisions/${d.id}`,
        matchField: "title",
      })
    }
  } catch { /* silent */ }

  // Search local content projects
  try {
    const projects = await prisma.localContentProject.findMany({
      where: {
        organizationId: orgId,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { scopeDescription: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limit,
      select: { id: true, name: true, scopeDescription: true },
    })
    for (const p of projects) {
      results.push({
        id: p.id,
        type: "project",
        title: p.name,
        subtitle: p.scopeDescription?.slice(0, 80) ?? "",
        url: `/local-content/projects/${p.id}`,
        matchField: "name",
      })
    }
  } catch { /* silent */ }

  // Search clients
  try {
    const clients = await prisma.auditClient.findMany({
      where: {
        organizationId: orgId,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { contactEmail: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limit,
      select: { id: true, name: true, contactEmail: true },
    })
    for (const c of clients) {
      results.push({
        id: c.id,
        type: "client",
        title: c.name,
        subtitle: c.contactEmail ?? "",
        url: `/audit/clients/${c.id}`,
        matchField: "name",
      })
    }
  } catch { /* silent */ }

  return results.slice(0, limit)
}
