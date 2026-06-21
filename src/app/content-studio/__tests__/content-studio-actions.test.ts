import { describe, expect, it, jest, beforeEach } from '@jest/globals'

// ─── Mocks ───

const mockRevalidatePath = jest.fn()
jest.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}))

const mockRequireUserContext = jest.fn()
jest.mock('@/lib/auth', () => ({
  requireUserContext: (...args: unknown[]) => mockRequireUserContext(...args),
  isExpectedAccessDeniedError: jest.fn((error: unknown) =>
    error instanceof Error &&
    (error.message.startsWith('Access denied:') || error.message === 'Unauthenticated'),
  ),
}))

const mockWritePlatformAuditLog = jest.fn()
jest.mock('@/lib/platform/audit-log', () => ({
  writePlatformAuditLog: (...args: unknown[]) => mockWritePlatformAuditLog(...args),
}))

// Mock the CS service layer
const mockCsCreateWorkspace = jest.fn()
const mockCsGetWorkspace = jest.fn()
const mockCsListWorkspaces = jest.fn()
const mockCsCreateContent = jest.fn()
const mockCsGetContent = jest.fn()
const mockCsListContent = jest.fn()
const mockCsUpdateContent = jest.fn()
const mockCsApproveContent = jest.fn()
const mockCsRejectContent = jest.fn()
const mockCsPublishContent = jest.fn()
const mockCsArchiveContent = jest.fn()
const mockCsCreateTemplate = jest.fn()
const mockCsGetTemplate = jest.fn()
const mockCsListTemplates = jest.fn()
const mockCsGetVersionHistory = jest.fn()
const mockCsGetVersion = jest.fn()
const mockCsRestoreVersion = jest.fn()
const mockCsGetWorkspaceStats = jest.fn()
const mockCsSubmitForReview = jest.fn()
const mockBuildContentStudioPDF = jest.fn()
const mockPrismaFindUnique = jest.fn()

jest.mock('@/lib/platform/content-studio', () => ({
  ContentStudioError: class extends Error {
    name = 'ContentStudioError'
  },
  createWorkspace: (...args: unknown[]) => mockCsCreateWorkspace(...args),
  getWorkspace: (...args: unknown[]) => mockCsGetWorkspace(...args),
  listWorkspaces: (...args: unknown[]) => mockCsListWorkspaces(...args),
  createContent: (...args: unknown[]) => mockCsCreateContent(...args),
  getContent: (...args: unknown[]) => mockCsGetContent(...args),
  listContent: (...args: unknown[]) => mockCsListContent(...args),
  updateContent: (...args: unknown[]) => mockCsUpdateContent(...args),
  approveContent: (...args: unknown[]) => mockCsApproveContent(...args),
  rejectContent: (...args: unknown[]) => mockCsRejectContent(...args),
  publishContent: (...args: unknown[]) => mockCsPublishContent(...args),
  archiveContent: (...args: unknown[]) => mockCsArchiveContent(...args),
  createTemplate: (...args: unknown[]) => mockCsCreateTemplate(...args),
  getTemplate: (...args: unknown[]) => mockCsGetTemplate(...args),
  listTemplates: (...args: unknown[]) => mockCsListTemplates(...args),
  getVersionHistory: (...args: unknown[]) => mockCsGetVersionHistory(...args),
  getVersion: (...args: unknown[]) => mockCsGetVersion(...args),
  restoreVersion: (...args: unknown[]) => mockCsRestoreVersion(...args),
  getWorkspaceStats: (...args: unknown[]) => mockCsGetWorkspaceStats(...args),
}))

jest.mock('@/lib/platform/content-studio/content-studio-service', () => ({
  submitForReview: (...args: unknown[]) => mockCsSubmitForReview(...args),
}))

jest.mock('@/lib/platform/content-studio/content-export', () => ({
  buildContentStudioPDF: (...args: unknown[]) => mockBuildContentStudioPDF(...args),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockPrismaFindUnique(...args),
    },
  },
}))

import {
  createWorkspaceAction,
  listWorkspacesAction,
  getWorkspaceAction,
  createContentAction,
  getContentAction,
  submitForReviewAction,
  approveContentAction,
  rejectContentAction,
  publishContentAction,
  archiveContentAction,
  exportContentAction,
} from '../actions'

const DEFAULT_USER = {
  id: 'user-1',
  organizationId: 'org-1',
  platformOrganizationId: 'org-1',
  role: 'ADMIN',
  name: 'Admin User',
}

function mockUser(overrides: Record<string, unknown> = {}) {
  mockRequireUserContext.mockResolvedValue({ ...DEFAULT_USER, ...overrides })
}

function resetAll() {
  jest.clearAllMocks()
  mockUser()
}

describe('createWorkspaceAction', () => {
  beforeEach(resetAll)

  it('creates a workspace successfully', async () => {
    mockCsCreateWorkspace.mockResolvedValue({ id: 'ws-1', name: 'Test WS' })

    const result = await createWorkspaceAction({ name: 'Test WS' })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toEqual({ id: 'ws-1', name: 'Test WS' })
    }
    expect(mockCsCreateWorkspace).toHaveBeenCalledWith('org-1', { name: 'Test WS' }, 'user-1')
    expect(mockWritePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'content_studio.workspace_created',
        targetLabel: 'Test WS',
      }),
    )
  })

  it('returns error when user lacks permission', async () => {
    mockRequireUserContext.mockRejectedValue(new Error('Access denied: insufficient role'))

    const result = await createWorkspaceAction({ name: 'Test WS' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.code).toBe('FORBIDDEN')
    }
  })

  it('returns error when service throws', async () => {
    mockCsCreateWorkspace.mockRejectedValue(new Error('Organization ID required'))

    const result = await createWorkspaceAction({ name: 'Test WS' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('Organization ID required')
    }
  })
})

describe('listWorkspacesAction', () => {
  beforeEach(resetAll)

  it('lists workspaces for the organization', async () => {
    const workspaces = [
      { id: 'ws-1', name: 'WS 1', organizationId: 'org-1' },
      { id: 'ws-2', name: 'WS 2', organizationId: 'org-1' },
    ]
    mockCsListWorkspaces.mockResolvedValue(workspaces)

    const result = await listWorkspacesAction()

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toEqual(workspaces)
      expect(result.data).toHaveLength(2)
    }
    expect(mockCsListWorkspaces).toHaveBeenCalledWith('org-1')
  })
})

describe('getWorkspaceAction', () => {
  beforeEach(resetAll)

  it('returns workspace when found and owned by org', async () => {
    mockCsGetWorkspace.mockResolvedValue({ id: 'ws-1', name: 'WS 1', organizationId: 'org-1' })

    const result = await getWorkspaceAction('ws-1')

    expect(result.ok).toBe(true)
  })

  it('returns ok false when workspace not found', async () => {
    mockCsGetWorkspace.mockResolvedValue(null)

    const result = await getWorkspaceAction('nonexistent')

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('not found')
    }
  })

  it('returns forbidden when workspace belongs to other org', async () => {
    mockCsGetWorkspace.mockResolvedValue({ id: 'ws-1', name: 'WS 1', organizationId: 'org-2' })

    const result = await getWorkspaceAction('ws-1')

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.code).toBe('FORBIDDEN')
    }
  })
})

describe('createContentAction', () => {
  beforeEach(resetAll)

  it('creates content successfully', async () => {
    mockCsGetWorkspace.mockResolvedValue({ id: 'ws-1', organizationId: 'org-1', name: 'WS 1' })
    mockCsCreateContent.mockResolvedValue({
      id: 'cnt-1',
      title: 'My Article',
      workspaceId: 'ws-1',
    })

    const result = await createContentAction('ws-1', {
      title: 'My Article',
      body: 'Body text',
    })

    expect(result.ok).toBe(true)
    expect(mockCsCreateContent).toHaveBeenCalledWith('ws-1', { title: 'My Article', body: 'Body text' }, 'user-1')
    expect(mockWritePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'content_studio.content_created',
        targetLabel: 'My Article',
      }),
    )
  })

  it('returns not found when workspace missing', async () => {
    mockCsGetWorkspace.mockResolvedValue(null)

    const result = await createContentAction('nonexistent', { title: 'Test', body: 'Body' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('not found')
    }
  })

  it('returns forbidden when workspace belongs to other org', async () => {
    mockCsGetWorkspace.mockResolvedValue({ id: 'ws-1', organizationId: 'org-2' })

    const result = await createContentAction('ws-1', { title: 'Test', body: 'Body' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.code).toBe('FORBIDDEN')
    }
  })
})

describe('getContentAction', () => {
  beforeEach(resetAll)

  it('returns content when found', async () => {
    mockCsGetContent.mockResolvedValue({ id: 'cnt-1', title: 'My Content' })

    const result = await getContentAction('cnt-1')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.title).toBe('My Content')
    }
  })

  it('returns error when content not found', async () => {
    mockCsGetContent.mockResolvedValue(null)

    const result = await getContentAction('nonexistent')

    expect(result.ok).toBe(false)
  })
})

describe('content lifecycle actions', () => {
  const contentId = 'cnt-1'

  beforeEach(resetAll)

  it('submitForReviewAction succeeds', async () => {
    mockCsSubmitForReview.mockResolvedValue({ id: contentId, status: 'IN_REVIEW' })

    const result = await submitForReviewAction(contentId)

    expect(result.ok).toBe(true)
    expect(mockCsSubmitForReview).toHaveBeenCalledWith(contentId, 'user-1')
  })

  it('approveContentAction succeeds', async () => {
    mockCsApproveContent.mockResolvedValue({ id: contentId, status: 'APPROVED' })

    const result = await approveContentAction(contentId, 'Looks good')

    expect(result.ok).toBe(true)
    expect(mockCsApproveContent).toHaveBeenCalledWith(contentId, 'user-1', 'Looks good')
  })

  it('rejectContentAction succeeds', async () => {
    mockCsRejectContent.mockResolvedValue({ id: contentId, status: 'DRAFT' })

    const result = await rejectContentAction(contentId, 'Needs revisions')

    expect(result.ok).toBe(true)
    expect(mockCsRejectContent).toHaveBeenCalledWith(contentId, 'user-1', 'Needs revisions')
  })

  it('publishContentAction succeeds', async () => {
    mockCsPublishContent.mockResolvedValue({ id: contentId, status: 'PUBLISHED' })

    const result = await publishContentAction(contentId)

    expect(result.ok).toBe(true)
    expect(mockCsPublishContent).toHaveBeenCalledWith(contentId, 'user-1')
  })

  it('archiveContentAction succeeds', async () => {
    mockCsArchiveContent.mockResolvedValue({ id: contentId, status: 'ARCHIVED' })

    const result = await archiveContentAction(contentId)

    expect(result.ok).toBe(true)
    expect(mockCsArchiveContent).toHaveBeenCalledWith(contentId, 'user-1')
  })

  it('returns error when service throws', async () => {
    mockCsSubmitForReview.mockRejectedValue(new Error('Invalid transition'))

    const result = await submitForReviewAction(contentId)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('Invalid transition')
    }
  })
})

describe('exportContentAction', () => {
  const contentId = 'cnt-1'

  beforeEach(resetAll)

  it('exports content with valid base64 PDF', async () => {
    mockCsGetContent.mockResolvedValue({
      id: contentId,
      title: 'Exported Content',
      body: 'Body text',
      summary: null,
      status: 'PUBLISHED',
      contentType: 'article',
      version: 1,
      locale: 'ar',
      tags: [],
      workspaceId: 'ws-1',
      organizationId: 'org-1',
      createdById: 'user-1',
      reviewedById: null,
      approvedById: null,
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    mockCsGetWorkspace.mockResolvedValue({ id: 'ws-1', name: 'Test WS', organizationId: 'org-1' })
    mockPrismaFindUnique.mockResolvedValue({ name: 'Admin User' })
    mockBuildContentStudioPDF.mockResolvedValue({
      format: 'pdf',
      filename: 'content_studio_cnt-1.pdf',
      mimeType: 'application/pdf',
      content: Buffer.from('mock-pdf-binary'),
    })

    const result = await exportContentAction(contentId)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.content).toBeTruthy()
      expect(result.mimeType).toBe('application/pdf')
      expect(result.filename).toContain('.pdf')
    }
    expect(mockWritePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'content_studio.content_exported',
      }),
    )
  })

  it('returns error when content not found', async () => {
    mockCsGetContent.mockResolvedValue(null)

    const result = await exportContentAction(contentId)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('not found')
    }
  })

  it('returns error when content belongs to other org', async () => {
    mockCsGetContent.mockResolvedValue({
      id: contentId,
      organizationId: 'org-2',
      workspaceId: 'ws-1',
    })

    const result = await exportContentAction(contentId)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('Access denied')
    }
  })

  it('returns error when workspace not found', async () => {
    mockCsGetContent.mockResolvedValue({
      id: contentId,
      title: 'Test',
      body: 'Body',
      summary: null,
      status: 'PUBLISHED',
      contentType: 'article',
      version: 1,
      locale: 'ar',
      tags: [],
      workspaceId: 'ws-missing',
      organizationId: 'org-1',
      createdById: 'user-1',
      reviewedById: null,
      approvedById: null,
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    mockCsGetWorkspace.mockResolvedValue(null)

    const result = await exportContentAction(contentId)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('not found')
    }
  })

  it('returns error when user lacks permissions', async () => {
    mockRequireUserContext.mockRejectedValue(new Error('Access denied: insufficient role'))

    const result = await exportContentAction(contentId)

    expect(result.success).toBe(false)
    expect(mockBuildContentStudioPDF).not.toHaveBeenCalled()
  })
})
