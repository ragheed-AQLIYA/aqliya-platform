# DecisionOS Publishing Policy

## Goal

Ensure published recommendations always reflect the approved immutable snapshot when available, preventing stale or unapproved content from being published silently.

## Publishing Behavior

### Decision Matrix

| Scenario | Behavior | Audit Action |
|----------|----------|--------------|
| Approved immutable snapshot exists, matches current | Publish from snapshot, mark `publishedFromSnapshot: true` | `SNAPSHOT_PUBLISHED` |
| Approved immutable snapshot exists, differs from current | **Blocked** — requires `forcePublishCurrent` override | `STALE_PUBLISH_BLOCKED` |
| Override provided, differs from snapshot | Publish current recommendation, mark `publishedFromSnapshot: false` | `STALE_PUBLISH_OVERRIDE` + `CURRENT_PUBLISHED_WITHOUT_APPROVAL` |
| No approval exists | Publish current recommendation | `CURRENT_PUBLISHED_WITHOUT_APPROVAL` |
| Legacy approval (no immutable snapshot) | Publish current recommendation | `CURRENT_PUBLISHED_WITHOUT_APPROVAL` |

### `publishRecommendationAction(decisionId, forcePublishCurrent?)`

1. Fetches latest approved Approval with immutable snapshot
2. If snapshot exists:
   - Compares `snapshotAction` and `snapshotRationale` against current recommendation
   - If **matches**: publishes from snapshot, sets `publishedFromSnapshot: true`, `publishedApprovalId: approval.id`
   - If **differs** and no override: returns error with `requiresOverride: true` and snapshot info
   - If **differs** and `forcePublishCurrent: true`: publishes current, logs override, sets `publishedFromSnapshot: false`
3. If no snapshot: publishes current recommendation

### `unpublishRecommendationAction(decisionId)`

- Sets `isClientVisible: false`, clears `publishedFromSnapshot` and `publishedApprovalId`
- Logs `OUTPUT_UNPUBLISHED`

## Published View Behavior

### `getPublishedRecommendationViewAction(decisionId)`

Returns `contentSource` and `snapshotMetadata`:

| `contentSource` | Meaning | `snapshotMetadata` |
|-----------------|---------|-------------------|
| `approved_snapshot` | Content from approved immutable snapshot | `{ approvedAt, approver, conditions, confidence, score }` |
| `current_recommendation` | Content from current recommendation (no approval or override used) | `null` |
| `legacy` | Published before immutable snapshots; approval exists but content may have changed | `null` |

### Source Detection Logic

1. **Direct snapshot publish**: If `recommendation.publishedFromSnapshot === true` and `publishedApprovalId` exists, fetch approval and return snapshot content → `approved_snapshot`
2. **Implicit match**: If not directly from snapshot but published, compare current recommendation against latest approval snapshot. If matches → `approved_snapshot`
3. **Legacy**: If published and approval exists but no immutable snapshot → `legacy`
4. **Default**: → `current_recommendation`

### Published Route (`/published/recommendation/[decisionId]`)

Displays:
- **Source badge**: Green "Approved Snapshot", gray "Legacy Recommendation", or outlined "Current Recommendation"
- **Approval metadata card** (snapshot-backed): Approver, timestamp, confidence, score, conditions
- **Legacy warning card**: Explains content may have changed since approval
- **Current recommendation card**: Notes no approved snapshot was used
- **All content fields**: Action, rationale, expected next state, scope exclusions, assumptions, risks
- **Publication metadata**: Content source label, version, published timestamp

## Recommendation Page UI

When editing a recommendation that has an approved snapshot:
- **Warning card**: Shows "Current Recommendation Differs from Approved Version" with diff summary
- **View Diff button**: Loads and displays side-by-side comparison of all 12 fields
- **Side-by-side diff**: Green panel (approved) vs red panel (current) for each changed field
- **Unchanged fields**: Summarized at bottom ("N field(s) unchanged: ...")
- **Publish button**: First click when differs shows override confirmation
- **Override confirmation**: Shows diff context, warns about audit trail logging
  - "Publish Current Version (Override)" — destructive, logs `STALE_PUBLISH_OVERRIDE`
  - "Cancel — Publish Approved Version" — publishes approved snapshot instead

## Governance Page UI

When `recommendationDiffers` is true:
- **Enhanced warning card**: Shows diff summary (e.g., "3 field(s) changed: Rationale, Risks Accepted, Expected Next State")
- **View Diff button**: Loads side-by-side diff inline
- **Request Re-review button**: Red CTA available when status is APPROVED or IN_REVIEW
- **Re-review form**: Requires reason, returns decision to DRAFT status, logs `REVISION_REQUESTED`
- **Diff display**: Same side-by-side format as recommendation page

## Diff Engine

### `src/lib/recommendation/recommendation-diff.ts`

Reusable helper that compares approved snapshot against current recommendation across 12 fields:

| Field | Type | Comparison |
|-------|------|------------|
| `recommendedAction` | String | Trimmed equality |
| `rationale` | String | Trimmed equality |
| `expectedNextState` | String | Trimmed equality |
| `scopeExclusions` | String | Trimmed equality |
| `assumptionsUsed` | String | Trimmed equality |
| `risksAccepted` | String | Trimmed equality |
| `risksRejected` | String | Trimmed equality |
| `conditions` | String? | Trimmed equality |
| `confidence` | Float? | Numeric equality |
| `score` | Float? | Numeric equality |
| `risks` | Json? | JSON string equality |
| `nextActions` | Json? | JSON string equality |

Returns `RecommendationDiff` with:
- `fields`: Array of `FieldDiff` (field, label, changed, approvedValue, currentValue)
- `changedFields`: List of changed field keys
- `changeCount`: Number of changed fields
- `hasChanges`: Boolean

### `getRecommendationDiff(decisionId)`

Server action that:
1. Fetches latest approval with immutable snapshot
2. Fetches current recommendation
3. Builds diff using `buildRecommendationDiff()`
4. Returns diff data with summary string and approval metadata

## Re-review Behavior

### `requestReReview(decisionId, reason)`

- Requires ADMIN role
- Only allowed when status is `APPROVED` or `IN_REVIEW`
- Sets decision status to `DRAFT`
- Logs `REVISION_REQUESTED` with before/after states
- Returns decision to draft for new review cycle
- Does NOT delete approval snapshot (preserved for audit)
- Does NOT delete recommendation (preserved for reference)

### Re-review Flow

1. Admin sees "Recommendation Changed Since Approval" warning on governance page
2. Reviews side-by-side diff to understand what changed
3. Clicks "Request Re-review"
4. Provides reason (required)
5. Decision returns to DRAFT
6. Owner must re-submit for review
7. New approval cycle creates new snapshot (old snapshot preserved in history)

## Audit Actions

| Action | When Logged |
|--------|-------------|
| `SNAPSHOT_PUBLISHED` | Published from approved immutable snapshot |
| `CURRENT_PUBLISHED_WITHOUT_APPROVAL` | Published current recommendation (no approval or override used) |
| `STALE_PUBLISH_BLOCKED` | Attempted to publish when current differs from snapshot (no override) |
| `STALE_PUBLISH_OVERRIDE` | Admin explicitly chose to publish current instead of snapshot |
| `REVISION_REQUESTED` | Re-review requested due to recommendation change (or standard revision) |

## Backward Compatibility

| Scenario | Behavior |
|----------|----------|
| Old published recommendation (pre-snapshot) | Shows as "Current Recommendation" or "Legacy" based on approval state |
| Old approval, no snapshot fields | Publishes current recommendation, marked as `current_recommendation` |
| New approval, recommendation edited | Publish blocks, requires override |
| Re-publish after unpublish | Re-evaluates snapshot state; may switch source |

## Changed Files

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Added `publishedFromSnapshot`, `publishedApprovalId` to Recommendation; new `AuditAction` enums |
| `src/actions/decisions.ts` | Rewrote `publishRecommendationAction` with snapshot guardrails; updated `getPublishedRecommendationViewAction` with source detection; updated `unpublishRecommendationAction` |
| `src/actions/approval.ts` | Added `getRecommendationDiff`, `requestReReview`; imported diff helper |
| `src/lib/recommendation/recommendation-diff.ts` | New: reusable diff engine comparing 12 fields between snapshot and current |
| `src/app/published/recommendation/[decisionId]/page.tsx` | Source badge, metadata cards, expanded fields |
| `src/app/(dashboard)/decisions/[id]/recommendation/page.tsx` | Side-by-side diff view, diff summary, enhanced override confirmation |
| `src/app/(dashboard)/decisions/[id]/governance/page.tsx` | Diff summary in warning card, View Diff button, Request Re-review CTA and form |

## Remaining Risks

1. **Admin can override** — `forcePublishCurrent` allows publishing unapproved content (logged but not prevented)
2. **Published version increments** — Both snapshot and current publish increment `publishedVersion`, making it unclear which version is which
3. **Diff is string-based** — No semantic diff for long text fields; compares full string equality
4. **Re-review creates new cycle** — Old approval snapshot preserved but new approval creates separate record; no linkage between old and new snapshots
5. **No diff on published view** — Published route doesn't show what changed; only shows source indicator

## Recommended TASK-015

**Title:** Decision Timeline & Export

**Scope:**
- Decision timeline visualization showing all lifecycle events (intake → framework → scenarios → risks → recommendation → approval → publish → re-review)
- PDF export of approved snapshot with full diff history
- CSV bulk decision status report
- Semantic diff for long text fields (word-level highlighting)
- Linkage between old and new approval snapshots after re-review
