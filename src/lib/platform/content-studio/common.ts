import 'server-only'

import { prisma } from '@/lib/prisma'
import { writePlatformAuditLog } from '@/lib/platform/audit-log'
import type { ContentWorkspace, ContentItem, ContentVersion, ContentTemplate, ContentStatusValue } from './types'

export interface ContentStudioDb {
  contentWorkspace: {
    create(args: { data: Record<string, unknown> }): Promise<ContentWorkspace>
    findUnique(args: {
      where: { id: string }
      select?: Record<string, boolean>
    }): Promise<ContentWorkspace | null>
    findMany(args?: {
      where?: Record<string, unknown>
      orderBy?: Record<string, unknown>
    }): Promise<ContentWorkspace[]>
    update(args: {
      where: { id: string }
      data: Record<string, unknown>
    }): Promise<ContentWorkspace>
  }
  contentItem: {
    create(args: { data: Record<string, unknown> }): Promise<ContentItem>
    findUnique(args: { where: { id: string } }): Promise<ContentItem | null>
    findMany(args?: {
      where?: Record<string, unknown>
      orderBy?: Record<string, unknown>
      select?: Record<string, boolean>
    }): Promise<ContentItem[]>
    update(args: {
      where: { id: string }
      data: Record<string, unknown>
    }): Promise<ContentItem>
    count(args?: { where?: Record<string, unknown> }): Promise<number>
    groupBy(args: Record<string, unknown>): Promise<{ status: string; _count: { id: number } }[]>
  }
  contentVersion: {
    create(args: { data: Record<string, unknown> }): Promise<ContentVersion>
    findUnique(args: { where: { id: string } }): Promise<ContentVersion | null>
    findMany(args?: {
      where?: Record<string, unknown>
      orderBy?: Record<string, unknown>
    }): Promise<ContentVersion[]>
    count(args?: { where?: Record<string, unknown> }): Promise<number>
  }
  contentTemplate: {
    create(args: { data: Record<string, unknown> }): Promise<ContentTemplate>
    findUnique(args: { where: { id: string } }): Promise<ContentTemplate | null>
    findMany(args?: {
      where?: Record<string, unknown>
      orderBy?: Record<string, unknown>
    }): Promise<ContentTemplate[]>
  }
}

export const p = prisma as unknown as ContentStudioDb

export const TRANSITIONS: Record<string, { from: ContentStatusValue[]; to: ContentStatusValue }> = {
  SUBMIT: { from: ['DRAFT'], to: 'IN_REVIEW' },
  APPROVE: { from: ['IN_REVIEW'], to: 'APPROVED' },
  REJECT: { from: ['IN_REVIEW'], to: 'DRAFT' },
  PUBLISH: { from: ['APPROVED'], to: 'PUBLISHED' },
  ARCHIVE: { from: ['PUBLISHED'], to: 'ARCHIVED' },
}

export function applyTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => variables[key] ?? `{{${key}}}`)
}

export async function snapshotVersion(
  contentId: string,
  existing: {
    version: number
    title: string
    body: string
    summary: string | null
    tags: string[]
  },
  changeSummary: string | undefined | null,
  userId: string,
): Promise<void> {
  await p.contentVersion.create({
    data: {
      contentId,
      version: existing.version,
      title: existing.title,
      body: existing.body,
      summary: existing.summary,
      tags: existing.tags,
      changeSummary: changeSummary ?? null,
      createdById: userId,
    },
  })
}

export async function auditLog(
  action: string,
  extra: {
    organizationId?: string
    actorId?: string
    targetType?: string
    targetId?: string
    targetLabel?: string
    metadata?: Record<string, unknown>
  },
): Promise<void> {
  try {
    await writePlatformAuditLog({
      productKey: 'platform',
      sourceSystem: 'content_studio',
      action,
      platformOrganizationId: extra.organizationId,
      actorId: extra.actorId,
      targetType: extra.targetType,
      targetId: extra.targetId,
      targetLabel: extra.targetLabel,
      metadata: extra.metadata as Record<string, unknown> | undefined,
    })
  } catch {
    // Non-blocking
  }
}
