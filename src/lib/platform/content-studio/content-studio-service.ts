import 'server-only'

export { ContentStudioError } from './types'
export type {
  ContentStatusValue,
  CreateWorkspaceData,
  UpdateWorkspaceData,
  CreateContentData,
  UpdateContentData,
  CreateTemplateData,
  ContentWorkspace,
  ContentItem,
  ContentVersion,
  ContentTemplate,
  WorkspaceStats,
} from './types'

export {
  createWorkspace,
  getWorkspace,
  listWorkspaces,
  updateWorkspace,
} from './workspace'

export {
  createContent,
  getContent,
  listContent,
  updateContent,
  submitForReview,
  approveContent,
  rejectContent,
  publishContent,
  archiveContent,
} from './content'

export {
  createTemplate,
  getTemplate,
  listTemplates,
  createFromTemplate,
} from './templates'

export {
  getVersionHistory,
  getVersion,
  restoreVersion,
} from './versions'

export { getWorkspaceStats } from './stats'
