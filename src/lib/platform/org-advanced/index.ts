// Constants (Prisma-free) — safe for client imports
export {
  LIFECYCLE_EVENT_TYPES,
  KNOWN_SETTINGS,
  ORG_HEALTH_WEIGHTS,
} from './constants'

export type {
  LifecycleEventType,
} from './constants'

// Service (includes Prisma) — server-only
export {
  OrgAdvError,
  createOrgNode,
  getOrgTree,
  getChildOrgs,
  getParentChain,
  getOrgSetting,
  setOrgSetting,
  getOrgSettings,
  deleteOrgSetting,
  recordLifecycleEvent,
  getLifecycleEvents,
  getOrgHealth,
} from './org-adv-service'

export type {
  OrgHierarchyNode,
  OrgSetting,
  OrgLifecycleEvent,
  OrgHealth,
  LifecycleEventFilter,
  CreateOrgNodeData,
} from './org-adv-service'

export { ORG_STRINGS } from './org-strings'
