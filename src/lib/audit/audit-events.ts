// ─── AuditOS Audit Event Service ───
// Records every state transition as an immutable audit event.

import type { AuditEvent, UserRole } from "@/types/audit"
import { mockAuditEvents } from "./mock-data"

const events: AuditEvent[] = [...mockAuditEvents]
let sequence = mockAuditEvents.length

export class AuditEventService {
  static record(params: {
    engagementId: string
    eventType: string
    actorId: string
    actorName: string
    actorRole: UserRole
    targetType: string
    targetId: string
    previousState?: string
    newState?: string
    description: string
    aiRelated?: boolean
    metadata?: Record<string, unknown>
  }): AuditEvent {
    sequence++
    const event: AuditEvent = {
      id: `ae-${sequence}-${Date.now()}`,
      engagementId: params.engagementId,
      eventType: params.eventType,
      actorId: params.actorId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      targetType: params.targetType,
      targetId: params.targetId,
      previousState: params.previousState ?? '',
      newState: params.newState ?? '',
      description: params.description,
      aiRelated: params.aiRelated ?? false,
      metadata: params.metadata,
      timestamp: new Date().toISOString(),
    }
    events.push(event)
    return event
  }

  static getEvents(engagementId: string): AuditEvent[] {
    return events.filter(e => e.engagementId === engagementId).sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  }

  static getAll(): AuditEvent[] {
    return [...events]
  }
}
