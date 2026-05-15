type TimelineEventType =
  | "decision_created"
  | "inputs_updated"
  | "framework_defined"
  | "scenarios_defined"
  | "risk_analysis_complete"
  | "simulation_generated"
  | "recommendation_generated"
  | "submitted_for_review"
  | "approved"
  | "approved_with_conditions"
  | "rejected"
  | "revision_requested"
  | "published"
  | "unpublished"
  | "stale_publish_blocked"
  | "stale_publish_override"
  | "snapshot_published"
  | "current_published_without_approval"
  | "re_review_requested"

export type TimelineEvent = {
  type: TimelineEventType
  label: string
  date: Date
  actor: string | null
  details: string | null
  isCritical: boolean
  category: "content" | "governance" | "publication" | "system"
}

const typeConfig: Record<TimelineEventType, { label: string; isCritical: boolean; category: TimelineEvent["category"] }> = {
  decision_created: { label: "Decision Created", isCritical: false, category: "system" },
  inputs_updated: { label: "Inputs Updated", isCritical: false, category: "content" },
  framework_defined: { label: "Framework Defined", isCritical: false, category: "content" },
  scenarios_defined: { label: "Scenarios Defined", isCritical: false, category: "content" },
  risk_analysis_complete: { label: "Risk Analysis Complete", isCritical: false, category: "content" },
  simulation_generated: { label: "Simulation Generated", isCritical: false, category: "content" },
  recommendation_generated: { label: "Recommendation Generated", isCritical: false, category: "content" },
  submitted_for_review: { label: "Submitted for Review", isCritical: true, category: "governance" },
  approved: { label: "Approved", isCritical: true, category: "governance" },
  approved_with_conditions: { label: "Approved with Conditions", isCritical: true, category: "governance" },
  rejected: { label: "Rejected", isCritical: true, category: "governance" },
  revision_requested: { label: "Revision Requested", isCritical: true, category: "governance" },
  published: { label: "Published", isCritical: true, category: "publication" },
  unpublished: { label: "Unpublished", isCritical: false, category: "publication" },
  stale_publish_blocked: { label: "Stale Publish Blocked", isCritical: true, category: "publication" },
  stale_publish_override: { label: "Stale Publish Override", isCritical: true, category: "publication" },
  snapshot_published: { label: "Snapshot Published", isCritical: true, category: "publication" },
  current_published_without_approval: { label: "Published Without Approval", isCritical: true, category: "publication" },
  re_review_requested: { label: "Re-review Requested", isCritical: true, category: "governance" },
}

export function buildTimeline(args: {
  decisionCreatedAt: Date
  decisionUpdatedAt?: Date
  recommendationCreatedAt?: Date
  recommendationUpdatedAt?: Date
  recommendationPublishedAt?: Date
  approvals?: {
    status: string
    createdAt: Date
    approverName?: string
    comments?: string
    conditions?: string
    snapshotCreatedAt?: Date
    overrideReason?: string
  }[]
  auditLogs?: {
    action: string
    createdAt: Date
    userName?: string
    after?: string
  }[]
}): TimelineEvent[] {
  const events: TimelineEvent[] = []

  events.push({
    type: "decision_created",
    label: typeConfig.decision_created.label,
    date: args.decisionCreatedAt,
    actor: null,
    details: null,
    isCritical: typeConfig.decision_created.isCritical,
    category: typeConfig.decision_created.category,
  })

  if (args.decisionUpdatedAt && args.decisionUpdatedAt > args.decisionCreatedAt) {
    events.push({
      type: "inputs_updated",
      label: typeConfig.inputs_updated.label,
      date: args.decisionUpdatedAt,
      actor: null,
      details: null,
      isCritical: typeConfig.inputs_updated.isCritical,
      category: typeConfig.inputs_updated.category,
    })
  }

  if (args.recommendationCreatedAt) {
    events.push({
      type: "recommendation_generated",
      label: typeConfig.recommendation_generated.label,
      date: args.recommendationCreatedAt,
      actor: null,
      details: null,
      isCritical: typeConfig.recommendation_generated.isCritical,
      category: typeConfig.recommendation_generated.category,
    })
  }

  if (args.approvals) {
    for (const approval of args.approvals) {
      const eventType: TimelineEventType =
        approval.status === "APPROVED" && approval.conditions
          ? "approved_with_conditions"
          : approval.status === "APPROVED"
            ? "approved"
            : "rejected"

      const details = approval.comments || approval.conditions || approval.overrideReason || null

      events.push({
        type: eventType,
        label: typeConfig[eventType].label,
        date: approval.snapshotCreatedAt || approval.createdAt,
        actor: approval.approverName || null,
        details,
        isCritical: typeConfig[eventType].isCritical,
        category: typeConfig[eventType].category,
      })
    }
  }

  if (args.auditLogs) {
    for (const log of args.auditLogs) {
      const eventType = mapAuditActionToTimelineType(log.action)
      if (!eventType) continue

      let details = log.after ? parseAuditDetails(log.after) : null

      if (log.action === "STALE_PUBLISH_BLOCKED" || log.action === "STALE_PUBLISH_OVERRIDE") {
        details = log.after ? parseAuditDetails(log.after) : null
      }

      events.push({
        type: eventType,
        label: typeConfig[eventType].label,
        date: log.createdAt,
        actor: log.userName || null,
        details,
        isCritical: typeConfig[eventType].isCritical,
        category: typeConfig[eventType].category,
      })
    }
  }

  events.sort((a, b) => a.date.getTime() - b.date.getTime())

  return events
}

function mapAuditActionToTimelineType(action: string): TimelineEventType | null {
  switch (action) {
    case "SUBMITTED_FOR_REVIEW":
      return "submitted_for_review"
    case "DECISION_APPROVED":
      return "approved"
    case "DECISION_APPROVED_WITH_CONDITIONS":
      return "approved_with_conditions"
    case "DECISION_REJECTED":
      return "rejected"
    case "REVISION_REQUESTED":
      return "revision_requested"
    case "OUTPUT_PUBLISHED":
      return "published"
    case "OUTPUT_UNPUBLISHED":
      return "unpublished"
    case "SNAPSHOT_PUBLISHED":
      return "snapshot_published"
    case "CURRENT_PUBLISHED_WITHOUT_APPROVAL":
      return "current_published_without_approval"
    case "STALE_PUBLISH_BLOCKED":
      return "stale_publish_blocked"
    case "STALE_PUBLISH_OVERRIDE":
      return "stale_publish_override"
    default:
      return null
  }
}

function parseAuditDetails(after: string): string | null {
  try {
    const parsed = JSON.parse(after)
    const parts: string[] = []
    if (parsed.reason) parts.push(parsed.reason)
    if (parsed.conditions) parts.push(parsed.conditions)
    if (parsed.notes) parts.push(parsed.notes)
    if (parsed.overrideReason) parts.push(parsed.overrideReason)
    if (parsed.status) parts.push(`Status: ${parsed.status}`)
    if (parsed.publishedCurrentInstead) parts.push("Published current instead of snapshot")
    if (parsed.fromSnapshot !== undefined) parts.push(`From snapshot: ${parsed.fromSnapshot}`)
    return parts.length > 0 ? parts.join(" | ") : null
  } catch {
    return after
  }
}

export function getCriticalEvents(events: TimelineEvent[]): TimelineEvent[] {
  return events.filter((e) => e.isCritical)
}

export function getEventsByCategory(events: TimelineEvent[], category: TimelineEvent["category"]): TimelineEvent[] {
  return events.filter((e) => e.category === category)
}
