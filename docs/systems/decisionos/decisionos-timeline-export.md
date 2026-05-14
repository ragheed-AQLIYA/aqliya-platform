# DecisionOS Timeline & Export

## Goal

Provide decision lifecycle visualization and export capability for approved decisions, snapshots, audit trail, and recommendation diffs.

## Timeline

### `src/lib/decision/decision-timeline.ts`

Reusable helper that builds a chronological timeline of all decision lifecycle events.

### Timeline Events

| Event Type | Label | Critical | Category |
|------------|-------|----------|----------|
| `decision_created` | Decision Created | No | System |
| `inputs_updated` | Inputs Updated | No | Content |
| `framework_defined` | Framework Defined | No | Content |
| `scenarios_defined` | Scenarios Defined | No | Content |
| `risk_analysis_complete` | Risk Analysis Complete | No | Content |
| `simulation_generated` | Simulation Generated | No | Content |
| `recommendation_generated` | Recommendation Generated | No | Content |
| `submitted_for_review` | Submitted for Review | **Yes** | Governance |
| `approved` | Approved | **Yes** | Governance |
| `approved_with_conditions` | Approved with Conditions | **Yes** | Governance |
| `rejected` | Rejected | **Yes** | Governance |
| `revision_requested` | Revision Requested | **Yes** | Governance |
| `published` | Published | **Yes** | Publication |
| `unpublished` | Unpublished | No | Publication |
| `stale_publish_blocked` | Stale Publish Blocked | **Yes** | Publication |
| `stale_publish_override` | Stale Publish Override | **Yes** | Publication |
| `snapshot_published` | Snapshot Published | **Yes** | Publication |
| `current_published_without_approval` | Published Without Approval | **Yes** | Publication |
| `re_review_requested` | Re-review Requested | **Yes** | Governance |

### `getDecisionTimeline(decisionId)`

Server action that:
1. Fetches decision with recommendation, approvals, and audit logs
2. Builds timeline using `buildTimeline()` helper
3. Returns chronologically sorted `TimelineEvent[]`

### Timeline UI (Governance Page)

- **Load Timeline** button fetches and displays events
- **Visual indicators**: Red dot for critical events, amber for governance, blue for publication, gray for content/system
- **Vertical timeline**: Connected dots with date, label, actor, and details
- **Critical badge**: Red badge on critical governance/publication events

## Export

### `src/actions/decision-export.ts`

Server action `getDecisionExportData(decisionId)` returns comprehensive export data.

### Export Data Structure

| Section | Content |
|---------|---------|
| `metadata` | ID, title, type, status, priority, description, dates, owner, organization |
| `recommendation` | Current recommendation content, publication status, version |
| `approvedSnapshot` | Immutable snapshot content (or legacy fallback), approver, timestamp |
| `approvalHistory` | All approvals with status, approver, comments, conditions |
| `diffSummary` | Summary of changes between snapshot and current recommendation |
| `timeline` | Full chronological timeline of all events |
| `exportMetadata` | Export timestamp, exporter, snapshot source, warnings |

### Export Formats

#### JSON (`formatExportJSON`)
- Full structured data, machine-readable
- Suitable for programmatic processing, archiving, API integration

#### Markdown (`formatExportMarkdown`)
- Human-readable report format
- Tables for metadata, approval history, timeline
- Sections for recommendation, snapshot, diff summary
- Warnings highlighted at top

### Export UI (Governance Page)

- **Export JSON** button: Generates and displays JSON
- **Export Markdown** button: Generates and displays markdown
- **Download** button: Downloads as `.json` or `.md` file
- **Copy** button: Copies to clipboard with confirmation feedback

### Audit-Friendly Export

Export includes:
- **Generated timestamp**: `exportMetadata.exportedAt`
- **Exporter identity**: `exportMetadata.exportedBy`
- **Snapshot source**: `approved_immutable_snapshot`, `legacy_approval_relation`, or `none`
- **Warnings**:
  - "No approval snapshot exists"
  - "Legacy approval — content not frozen, may have changed since approval"
  - "Current recommendation differs from approved snapshot"
  - "Published content may not match approved version"

## Backward Compatibility

| Scenario | Behavior |
|----------|----------|
| No approvals | Timeline shows content events only; export has null snapshot |
| Legacy approval (no immutable snapshot) | Timeline shows approval event; export marks snapshot as legacy with warning |
| No recommendation | Timeline skips recommendation event; export has null recommendation |
| Pre-existing decisions | Timeline infers events from audit logs; export includes whatever data exists |

## Changed Files

| File | Change |
|------|--------|
| `src/lib/decision/decision-timeline.ts` | New: timeline builder with 18 event types, category classification, critical flagging |
| `src/lib/decision/decision-export-formats.ts` | New: JSON and Markdown export formatters (client-compatible) |
| `src/actions/decision-export.ts` | New: `getDecisionExportData` server action with comprehensive data collection |
| `src/actions/approval.ts` | Added `getDecisionTimeline` server action |
| `src/app/(dashboard)/decisions/[id]/governance/page.tsx` | Added timeline section with visual timeline, export section with JSON/Markdown buttons, download and copy functionality |

## Remaining Risks

1. **No PDF export** — Markdown/JSON only; PDF would require additional library
2. **Timeline is append-only** — No edit/update events tracked, only state transitions
3. **Export is point-in-time** — No versioned exports or export history
4. **Large exports unbounded** — No pagination or size limits for decisions with extensive audit trails
5. **Pre-existing UI component issue** — `command.tsx` has radix-ui type incompatibility (unrelated to this task)

## Recommended TASK-016

**Title:** Decision Intelligence Dashboard v2

**Scope:**
- Executive dashboard with decision portfolio analytics
- Cross-decision comparison and pattern detection
- Decision health scoring across organization
- Automated re-review triggers for stale approvals
- Decision template library for recurring decision types
- Bulk decision operations (status updates, exports, notifications)
