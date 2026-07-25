import { CS_STRINGS } from './cs-strings'
import { ContentStudioError } from './types'
import type { CreateTemplateData, ContentTemplate, ContentItem } from './types'
import { p, auditLog, applyTemplate } from './common'

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
      metadataTemplate: data.metadataTemplate ?? undefined,
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
