import { CS_STRINGS } from './cs-strings'
import { ContentStudioError } from './types'
import type { CreateWorkspaceData, UpdateWorkspaceData, ContentWorkspace } from './types'
import { p, auditLog } from './common'

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
