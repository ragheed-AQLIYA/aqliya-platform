import 'server-only'

export interface BridgeEventData {
  sourceId: string
  source: string
  eventType: string
  actorId: string
  action: string
  resourceType: string
  resourceId: string
  details: Record<string, unknown>
  organizationId: string
  timestamp: Date
}

export interface BridgeAdapter {
  source: string
  fetchEvent(eventId: string): Promise<BridgeEventData | null>
  listEvents(filter?: Record<string, unknown>): Promise<BridgeEventData[]>
}

export interface BridgeResult {
  ok: boolean
  targetLogId?: string
  error?: string
  sourceEventId: string
}

export interface BulkBridgeResult {
  totalProcessed: number
  succeeded: number
  failed: number
  results: BridgeResult[]
}

export interface CreateBridgeRuleData {
  name: string
  source: string
  eventTypeFilter?: string
  fieldMappings?: Record<string, string>
  maxRetries?: number
  retryIntervalMs?: number
  createdById: string
}

export interface UpdateBridgeRuleData {
  name?: string
  source?: string
  eventTypeFilter?: string
  fieldMappings?: Record<string, string>
  isActive?: boolean
  maxRetries?: number
  retryIntervalMs?: number
}

export interface AuditBridgeRule {
  id: string
  organizationId: string
  name: string
  source: string
  eventTypeFilter: string
  fieldMappings: Record<string, string> | null
  isActive: boolean
  maxRetries: number
  retryIntervalMs: number
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export interface BridgeLogEntry {
  id: string
  ruleId: string
  organizationId: string
  sourceEventId: string
  source: string
  eventType: string
  targetLogId: string | null
  status: string
  errorMessage: string | null
  retryCount: number
  createdAt: Date
  lastRetryAt: Date | null
}

export interface BridgeLogFilter {
  status?: string
  source?: string
  ruleId?: string
  limit?: number
  offset?: number
}

export class AuditBridgeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuditBridgeError'
  }
}
