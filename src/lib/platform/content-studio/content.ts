import { CS_STRINGS } from './cs-strings'
import { ContentStudioError } from './types'
import type { CreateContentData, UpdateContentData, ContentItem, ContentStatusValue } from './types'
import { p, auditLog, snapshotVersion, TRANSITIONS } from './common'

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
    where,
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
    data: updateData,
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
    data: updateData,
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
