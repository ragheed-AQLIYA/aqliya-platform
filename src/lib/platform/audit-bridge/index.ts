export {
  AuditBridgeError,
  registerAdapter,
  getAdapter,
  bridgeAuditEvent,
  bridgeGenericEvent,
  bulkBridge,
  createBridgeRule,
  getBridgeRule,
  listBridgeRules,
  updateBridgeRule,
  deleteBridgeRule,
  getBridgeLog,
  retryFailed,
  verifyBridgeRuleAccess,
} from './audit-bridge-service'

export type {
  BridgeEventData,
  BridgeAdapter,
  BridgeResult,
  BulkBridgeResult,
  CreateBridgeRuleData,
  UpdateBridgeRuleData,
  AuditBridgeRule,
  BridgeLogEntry,
  BridgeLogFilter,
} from './audit-bridge-service'

export { BRIDGE_STRINGS } from './bridge-strings'
