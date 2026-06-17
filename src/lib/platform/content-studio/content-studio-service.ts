import 'server-only'

import { prisma } from '@/lib/prisma'
import { writePlatformAuditLog } from '@/lib/platform/audit-log'
import type { Prisma } from '@prisma/client'
import { CS_STRINGS } from './cs-strings'

// ContentWorkspace / ContentItem / ContentVersion / ContentTemplate are standalone models
// for the Content Studio feature (separate from ContentStudio* campaign models).
// These models exist in the Prisma schema but Prisma client typings lag behind the
// generated client — typed access via (prisma as unknown) until schema types are regenerated.
// TODO (R-03): Run `npx prisma generate` to resolve once DB is available.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const p = prisma as any

export class ContentStudioError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ContentStudioError'
  }
}

export type ContentStatusValue = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED'

export interface CreateWorkspaceData {
  name: string
  description?: string
  category?: string
}

export interface UpdateWorkspaceData {
  name?: string
  description?: string
  category?: string
  isActive?: boolean
}

export interface CreateContentData {
  title: string
  body: string
  summary?: string
  locale?: string
  tags?: string[]
  contentType?: string
  templateId?: string
}

export interface UpdateContentData {
  title?: string
  body?: string
  summary?: string
  locale?: string
  tags?: string[]
  contentType?: string
  changeSummary?: string
}

export interface CreateTemplateData {
  name: string
  description?: string
  category?: string
  bodyTemplate: string
  metadataTemplate?: Record<string, unknown>
  defaultReviewRoles?: string[]
}

export interface ContentWorkspace {
  id: string
  organizationId: string
  name: string
  description: string | null
  category: string | null
  isActive: boolean
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export interface ContentItem {
  id: string
  workspaceId: string
  organizationId: string
  title: string
  body: string
  summary: string | null
  locale: string
  tags: string[]
  status: ContentStatusValue
  contentType: string
  version: number
  templateId: string | null
  createdById: string
  reviewedById: string | null
  approvedById: string | null
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface ContentVersion {
  id: string
  contentId: string
  version: number
  title: string
  body: string
  summary: string | null
  tags: string[]
  metadata: Record<string, unknown> | null
  changeSummary: string | null
  createdById: string
  createdAt: Date
}

export interface ContentTemplate {
  id: string
  organizationId: string
  name: string
  description: string | null
  category: string | null
  bodyTemplate: string
  metadataTemplate: Record<string, unknown> | null
  defaultReviewRoles: string[]
  isActive: boolean
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export interface WorkspaceStats {
  totalContent: number
  contentByStatus: Record<string, number>
  publishedPercentage: number
  totalVersions: number
  recentActivity: number
  templatesUsed: number
}

const TRANSITIONS: Record<string, { from: ContentStatusValue[]; to: ContentStatusValue }> = {
  SUBMIT: { from: ['DRAFT'], to: 'IN_REVIEW' },
  APPROVE: { from: ['IN_REVIEW'], to: 'APPROVED' },
  REJECT: { from: ['IN_REVIEW'], to: 'DRAFT' },
  PUBLISH: { from: ['APPROVED'], to: 'PUBLISHED' },
  ARCHIVE: { from: ['PUBLISHED'], to: 'ARCHIVED' },
}

function applyTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => variables[key] ?? `{{${key}}}`)
}

async function snapshotVersion(
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

async function auditLog(
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

export async function createWorkspace(
  orgId: string,
  data: CreateWorkspaceData,
  createdById: string,
): Promise<ContentWorkspace> {
  if (!orgId) throw new ContentStudioError(CS_STRINGS.error.ORG_ID_REQUIRED)
  if (!data.name || data.name.trim().length === 0) {
    throw new ContentStudioError(CS_STRINGS.error.WORKSPACE_NAME_REQUIRED)
  }

  const workspace = await p.contentWorkspace.create({
    data: {
      organizationId: orgId,
      name: data.name.trim(),
      description: data.description ?? null,
      category: data.category ?? null,
      createdById,
    },
  })

  await auditLog('content_studio.workspace_created', {
    organizationId: orgId,
    actorId: createdById,
    targetType: 'contentWorkspace',
    targetId: workspace.id,
    targetLabel: workspace.name,
    metadata: { category: data.category },
  })

  return workspace as unknown as ContentWorkspace
}

export async function getWorkspace(
  workspaceId: string,
): Promise<ContentWorkspace | null> {
  const workspace = await p.contentWorkspace.findUnique({
    where: { id: workspaceId },
  })
  return workspace as unknown as ContentWorkspace | null
}

export async function listWorkspaces(orgId: string): Promise<ContentWorkspace[]> {
  const workspaces = await p.contentWorkspace.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: 'desc' },
  })
  return workspaces as unknown as ContentWorkspace[]
}

export async function updateWorkspace(
  workspaceId: string,
  data: UpdateWorkspaceData,
): Promise<ContentWorkspace> {
  const existing = await p.contentWorkspace.findUnique({
    where: { id: workspaceId },
  })
  if (!existing) throw new ContentStudioError(CS_STRINGS.error.WORKSPACE_NOT_FOUND)

  const updated = await p.contentWorkspace.update({
    where: { id: workspaceId },
    data: {
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.category !== undefined ? { category: data.category } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    },
  })

  await auditLog('content_studio.workspace_updated', {
    organizationId: updated.organizationId,
    targetType: 'contentWorkspace',
    targetId: workspaceId,
    targetLabel: updated.name,
    metadata: { updatedFields: Object.keys(data) },
  })

  return updated as unknown as ContentWorkspace
}

export async function createContent(
  workspaceId: string,
  data: CreateContentData,
  userId: string,
): Promise<ContentItem> {
  if (!workspaceId) throw new ContentStudioError(CS_STRINGS.error.WORKSPACE_ID_REQUIRED)
  if (!data.title || data.title.trim().length === 0) {
    throw new ContentStudioError(CS_STRINGS.error.TITLE_REQUIRED)
  }

  const workspace = await p.contentWorkspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, organizationId: true },
  })
  if (!workspace) throw new ContentStudioError(CS_STRINGS.error.WORKSPACE_NOT_FOUND)

  const content = await p.contentItem.create({
    data: {
      workspaceId,
      organizationId: workspace.organizationId,
      title: data.title.trim(),
      body: data.body ?? '',
      summary: data.summary ?? null,
      locale: data.locale ?? 'ar',
      tags: data.tags ?? [],
      contentType: data.contentType ?? 'article',
      templateId: data.templateId ?? null,
      createdById: userId,
      version: 1,
    },
  })

  await auditLog('content_studio.content_created', {
    organizationId: workspace.organizationId,
    actorId: userId,
    targetType: 'contentItem',
    targetId: content.id,
    targetLabel: content.title,
    metadata: { workspaceId, contentType: data.contentType, templateId: data.templateId },
  })

  return content as unknown as ContentItem
}

export async function getContent(contentId: string): Promise<ContentItem | null> {
  const content = await p.contentItem.findUnique({
    where: { id: contentId },
  })
  return content as unknown as ContentItem | null
}

export async function listContent(
  workspaceId: string,
  filter?: { status?: ContentStatusValue },
): Promise<ContentItem[]> {
  const where: Record<string, unknown> = { workspaceId }
  if (filter?.status) {
    where.status = filter.status
  }
  const items = await p.contentItem.findMany({
    where: where as any,
    orderBy: { updatedAt: 'desc' },
  })
  return items as unknown as ContentItem[]
}

export async function updateContent(
  contentId: string,
  data: UpdateContentData,
  userId: string,
): Promise<ContentItem> {
  const existing = await p.contentItem.findUnique({
    where: { id: contentId },
  })
  if (!existing) throw new ContentStudioError(CS_STRINGS.error.CONTENT_NOT_FOUND)

  await snapshotVersion(
    contentId,
    {
      version: existing.version,
      title: existing.title,
      body: existing.body,
      summary: existing.summary,
      tags: existing.tags,
    },
    data.changeSummary,
    userId,
  )

  const updateData: Record<string, unknown> = {
    version: existing.version + 1,
  }
  if (data.title !== undefined) updateData.title = data.title.trim()
  if (data.body !== undefined) updateData.body = data.body
  if (data.summary !== undefined) updateData.summary = data.summary
  if (data.locale !== undefined) updateData.locale = data.locale
  if (data.tags !== undefined) updateData.tags = data.tags
  if (data.contentType !== undefined) updateData.contentType = data.contentType

  const updated = await p.contentItem.update({
    where: { id: contentId },
    data: updateData as any,
  })

  await auditLog('content_studio.content_updated', {
    organizationId: existing.organizationId,
    actorId: userId,
    targetType: 'contentItem',
    targetId: contentId,
    targetLabel: updated.title,
    metadata: { updatedFields: Object.keys(data).filter(k => k !== 'changeSummary'), newVersion: existing.version + 1 },
  })

  return updated as unknown as ContentItem
}

async function transitionContent(
  contentId: string,
  action: string,
  userId: string,
  extra?: { reason?: string; notes?: string },
): Promise<ContentItem> {
  const content = await p.contentItem.findUnique({
    where: { id: contentId },
  })
  if (!content) throw new ContentStudioError(CS_STRINGS.error.CONTENT_NOT_FOUND)

  const transition = TRANSITIONS[action]
  if (!transition) throw new ContentStudioError(CS_STRINGS.error.INVALID_TRANSITION)
  if (!transition.from.includes(content.status as ContentStatusValue)) {
    throw new ContentStudioError(CS_STRINGS.error.INVALID_TRANSITION)
  }

  if (action === 'REJECT' && (!extra?.reason || extra.reason.trim().length === 0)) {
    throw new ContentStudioError(CS_STRINGS.error.REASON_REQUIRED)
  }

  const updateData: Record<string, unknown> = { status: transition.to }
  if (action === 'SUBMIT') updateData.reviewedById = userId
  if (action === 'APPROVE') updateData.approvedById = userId
  if (action === 'PUBLISH') updateData.publishedAt = new Date()

  const updated = await p.contentItem.update({
    where: { id: contentId },
    data: updateData as any,
  })

  const auditActionMap: Record<string, string> = {
    SUBMIT: 'content_studio.submitted_for_review',
    APPROVE: 'content_studio.content_approved',
    REJECT: 'content_studio.content_rejected',
    PUBLISH: 'content_studio.content_published',
    ARCHIVE: 'content_studio.content_archived',
  }

  await auditLog(auditActionMap[action] ?? 'content_studio.content_updated', {
    organizationId: content.organizationId,
    actorId: userId,
    targetType: 'contentItem',
    targetId: contentId,
    targetLabel: updated.title,
    metadata: {
      fromStatus: content.status,
      toStatus: transition.to,
      reason: extra?.reason,
      notes: extra?.notes,
    },
  })

  return updated as unknown as ContentItem
}

export async function submitForReview(
  contentId: string,
  userId: string,
): Promise<ContentItem> {
  return transitionContent(contentId, 'SUBMIT', userId)
}

export async function approveContent(
  contentId: string,
  userId: string,
  notes?: string,
): Promise<ContentItem> {
  return transitionContent(contentId, 'APPROVE', userId, { notes })
}

export async function rejectContent(
  contentId: string,
  userId: string,
  reason: string,
): Promise<ContentItem> {
  return transitionContent(contentId, 'REJECT', userId, { reason })
}

export async function publishContent(
  contentId: string,
  userId: string,
): Promise<ContentItem> {
  return transitionContent(contentId, 'PUBLISH', userId)
}

export async function archiveContent(
  contentId: string,
  userId: string,
): Promise<ContentItem> {
  return transitionContent(contentId, 'ARCHIVE', userId)
}

export async function createTemplate(
  orgId: string,
  data: CreateTemplateData,
  userId: string,
): Promise<ContentTemplate> {
  if (!orgId) throw new ContentStudioError(CS_STRINGS.error.ORG_ID_REQUIRED)
  if (!data.name || data.name.trim().length === 0) {
    throw new ContentStudioError(CS_STRINGS.error.TEMPLATE_NAME_REQUIRED)
  }
  if (!data.bodyTemplate || data.bodyTemplate.trim().length === 0) {
    throw new ContentStudioError(CS_STRINGS.error.BODY_TEMPLATE_REQUIRED)
  }

  const template = await p.contentTemplate.create({
    data: {
      organizationId: orgId,
      name: data.name.trim(),
      description: data.description ?? null,
      category: data.category ?? null,
      bodyTemplate: data.bodyTemplate,
      metadataTemplate: (data.metadataTemplate ?? undefined) as any,
      defaultReviewRoles: data.defaultReviewRoles ?? [],
      createdById: userId,
    },
  })

  await auditLog('content_studio.template_created', {
    organizationId: orgId,
    actorId: userId,
    targetType: 'contentTemplate',
    targetId: template.id,
    targetLabel: template.name,
    metadata: { category: data.category },
  })

  return template as unknown as ContentTemplate
}

export async function getTemplate(templateId: string): Promise<ContentTemplate | null> {
  const template = await p.contentTemplate.findUnique({
    where: { id: templateId },
  })
  return template as unknown as ContentTemplate | null
}

export async function listTemplates(orgId: string): Promise<ContentTemplate[]> {
  const templates = await p.contentTemplate.findMany({
    where: { organizationId: orgId, isActive: true },
    orderBy: { createdAt: 'desc' },
  })
  return templates as unknown as ContentTemplate[]
}

export async function createFromTemplate(
  templateId: string,
  workspaceId: string,
  userId: string,
  variables?: Record<string, string>,
): Promise<ContentItem> {
  const template = await p.contentTemplate.findUnique({
    where: { id: templateId },
  })
  if (!template) throw new ContentStudioError(CS_STRINGS.error.TEMPLATE_NOT_FOUND)

  const workspace = await p.contentWorkspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, organizationId: true },
  })
  if (!workspace) throw new ContentStudioError(CS_STRINGS.error.WORKSPACE_NOT_FOUND)

  const body = applyTemplate(template.bodyTemplate, variables ?? {})

  const metadata = template.metadataTemplate
    ? (template.metadataTemplate as Record<string, unknown>)
    : {}

  const titleFromMeta = metadata.title as string | undefined
  const resolvedTitle = titleFromMeta
    ? applyTemplate(titleFromMeta, variables ?? {})
    : `From ${template.name}`

  const content = await p.contentItem.create({
    data: {
      workspaceId,
      organizationId: workspace.organizationId,
      title: resolvedTitle,
      body,
      locale: 'ar',
      tags: [],
      contentType: 'article',
      templateId,
      createdById: userId,
      version: 1,
    },
  })

  await auditLog('content_studio.content_created_from_template', {
    organizationId: workspace.organizationId,
    actorId: userId,
    targetType: 'contentItem',
    targetId: content.id,
    targetLabel: content.title,
    metadata: { templateId, templateName: template.name, variables: variables ?? {} },
  })

  return content as unknown as ContentItem
}

export async function getVersionHistory(contentId: string): Promise<ContentVersion[]> {
  const versions = await p.contentVersion.findMany({
    where: { contentId },
    orderBy: { version: 'desc' },
  })
  return versions as unknown as ContentVersion[]
}

export async function getVersion(versionId: string): Promise<ContentVersion | null> {
  const version = await p.contentVersion.findUnique({
    where: { id: versionId },
  })
  return version as unknown as ContentVersion | null
}

export async function restoreVersion(
  versionId: string,
  userId: string,
): Promise<ContentItem> {
  const version = await p.contentVersion.findUnique({
    where: { id: versionId },
  })
  if (!version) throw new ContentStudioError(CS_STRINGS.error.VERSION_NOT_FOUND)

  const content = await p.contentItem.findUnique({
    where: { id: version.contentId },
  })
  if (!content) throw new ContentStudioError(CS_STRINGS.error.CONTENT_NOT_FOUND)

  await snapshotVersion(
    content.id,
    {
      version: content.version,
      title: content.title,
      body: content.body,
      summary: content.summary,
      tags: content.tags,
    },
    `Restored from version ${version.version}`,
    userId,
  )

  const updated = await p.contentItem.update({
    where: { id: content.id },
    data: {
      title: version.title,
      body: version.body,
      summary: version.summary,
      tags: version.tags,
      version: content.version + 1,
    },
  })

  await auditLog('content_studio.version_restored', {
    organizationId: content.organizationId,
    actorId: userId,
    targetType: 'contentItem',
    targetId: content.id,
    targetLabel: updated.title,
    metadata: { restoredVersion: version.version, newVersion: content.version + 1 },
  })

  return updated as unknown as ContentItem
}

export async function getWorkspaceStats(workspaceId: string): Promise<WorkspaceStats> {
  const workspace = await p.contentWorkspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, organizationId: true },
  })
  if (!workspace) throw new ContentStudioError(CS_STRINGS.error.WORKSPACE_NOT_FOUND)

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [totalContent, contentByStatus, recentContent, versionCount, templateUsage] =
    await Promise.all([
      p.contentItem.count({ where: { workspaceId } }),
      p.contentItem.groupBy({
        by: ['status'],
        where: { workspaceId },
        _count: { id: true },
      }),
      p.contentItem.count({
        where: { workspaceId, updatedAt: { gte: thirtyDaysAgo } },
      }),
      p.contentVersion.count({
        where: {
          contentId: { in: (await p.contentItem.findMany({
            where: { workspaceId },
            select: { id: true },
          })).map((c: { id: string }) => c.id) },
        },
      }),
      p.contentItem.count({
        where: { workspaceId, templateId: { not: null } },
      }),
    ])

  const statusMap: Record<string, number> = {}
  for (const group of contentByStatus) {
    statusMap[group.status] = group._count.id
  }

  const publishedCount = statusMap['PUBLISHED'] ?? 0
  const publishedPercentage = totalContent > 0 ? Math.round((publishedCount / totalContent) * 100) : 0

  return {
    totalContent,
    contentByStatus: statusMap,
    publishedPercentage,
    totalVersions: versionCount,
    recentActivity: recentContent,
    templatesUsed: templateUsage,
  }
}
