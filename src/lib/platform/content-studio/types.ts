export type ContentStatusValue = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED'

export class ContentStudioError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ContentStudioError'
  }
}

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
