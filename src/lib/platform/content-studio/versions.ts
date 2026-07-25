import { CS_STRINGS } from './cs-strings'
import { ContentStudioError } from './types'
import type { ContentVersion, ContentItem } from './types'
import { p, auditLog, snapshotVersion } from './common'

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
