export {
  ContentStudioError,
  createWorkspace,
  getWorkspace,
  listWorkspaces,
  updateWorkspace,
  createContent,
  getContent,
  listContent,
  updateContent,
  approveContent,
  rejectContent,
  publishContent,
  archiveContent,
  createTemplate,
  getTemplate,
  listTemplates,
  createFromTemplate,
  getVersionHistory,
  getVersion,
  restoreVersion,
  getWorkspaceStats,
} from './content-studio-service'
// submitForReview intentionally omitted — conflicts with model-governance; use content-studio-service directly

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
} from './content-studio-service'

export { CS_STRINGS } from './cs-strings'
