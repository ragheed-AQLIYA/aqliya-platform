# DecisionOS Immutable Approval Snapshot

## Problem

A recommendation can change after approval, making approval history unreliable. An approved decision could reference a recommendation that no longer matches what was reviewed. Storing only a foreign key to the recommendation means the approved content can drift or be lost if the recommendation is deleted.

## Solution

Each Approval record now stores **immutable snapshot fields** that copy the recommendation content directly at approval time. The `recommendationId` relation is kept for reference, but the approved content survives any recommendation edits or deletions.

## Schema Changes

| Model | Field | Type | Purpose |
|-------|-------|------|---------|
| Approval | `recommendationId` | String? | Reference to the recommendation at approval time |
| Approval | `recommendation` | Recommendation? | Relation for reference only |
| Approval | `snapshotAction` | String? | Frozen copy of recommendedAction |
| Approval | `snapshotRationale` | String? | Frozen copy of rationale |
| Approval | `snapshotExpectedNextState` | String? | Frozen copy of expectedNextState |
| Approval | `snapshotScopeExclusions` | String? | Frozen copy of scopeExclusions |
| Approval | `snapshotAssumptionsUsed` | String? | Frozen copy of assumptionsUsed |
| Approval | `snapshotRisksAccepted` | String? | Frozen copy of risksAccepted |
| Approval | `snapshotRisksRejected` | String? | Frozen copy of risksRejected |
| Approval | `snapshotConditions` | String? | Conditional approval conditions |
| Approval | `snapshotRisks` | Json? | Structured risk data at approval time |
| Approval | `snapshotNextActions` | Json? | Structured next actions at approval time |
| Approval | `snapshotConfidence` | Float? | Confidence score at approval time |
| Approval | `snapshotScore` | Float? | Overall score at approval time |
| Approval | `snapshotOverrideReason` | String? | Reason for approval without recommendation |
| Approval | `snapshotCreatedAt` | DateTime? | Timestamp when snapshot was captured |
| Recommendation | `approvals` | Approval[] | Opposite relation — all approvals referencing this recommendation |
| Recommendation | `publishedFromSnapshot` | Boolean | Whether published content came from approved snapshot |
| Recommendation | `publishedApprovalId` | String? | ID of the approval snapshot used for publishing |

**Additive only** — no destructive changes. All snapshot fields are nullable. Existing approvals without snapshot fields continue to work via legacy fallback.

## Snapshot Capture

### `buildSnapshotData(recommendation, overrideReason?)`

Called on every approval action (approve, approve with conditions, reject). Copies all recommendation fields into `snapshot*` fields on the Approval record.

- If recommendation exists: copies all content fields
- If no recommendation: sets all snapshot fields to null, stores `overrideReason`
- `snapshotCreatedAt` is always set to `new Date()`

### Approval Actions

| Action | Snapshot Behavior |
|--------|-------------------|
| `approveDecision` | Captures full recommendation snapshot |
| `approveWithConditions` | Captures full snapshot + stores conditions in `snapshotConditions` |
| `rejectDecision` | Captures snapshot for audit trail |
| Override (no recommendation) | All snapshot fields null, `snapshotOverrideReason` stored |

## `getApprovalStatus` Behavior

Returns three key flags:

| Flag | Type | Meaning |
|------|------|---------|
| `approvedSnapshot` | object \| null | The frozen approval content (immutable or legacy) |
| `recommendationDiffers` | boolean | Current recommendation differs from approved snapshot |
| `isLegacySnapshot` | boolean | Approval predates immutable snapshots |

### Snapshot Resolution Logic

1. **Immutable snapshot**: If `snapshotAction` AND `snapshotRationale` exist, use snapshot fields directly. `isImmutable: true`.
2. **Legacy fallback**: If snapshot fields are null but `recommendation` relation exists, read from relation. `isImmutable: false`, `isLegacySnapshot: true`.
3. **No snapshot**: Return null.

### Diff Detection

**Simple detection** (`getApprovalStatus`): Compares `approvedSnapshot.recommendedAction` and `approvedSnapshot.rationale` against current recommendation. Sets `recommendationDiffers: true` if either differs.

**Full diff** (`getRecommendationDiff`): Compares all 12 snapshot fields against current recommendation using `src/lib/recommendation/recommendation-diff.ts`. Returns per-field change status with approved vs current values. See `docs/decisionos-publishing-policy.md` for full diff engine details.

### Re-review

When recommendation differs from approved snapshot:
- **Governance page**: Shows diff summary, "View Diff" button, and "Request Re-review" CTA
- **Re-review action** (`requestReReview`): Returns decision to DRAFT, requires reason, logs `REVISION_REQUESTED`
- **Old snapshot preserved**: Previous approval snapshot remains in history for audit
- **New cycle**: Owner must re-submit; new approval creates new snapshot

## Governance UI Behavior

### Approved Version Display

- **Header**: "Approved Recommendation Snapshot" with badge:
  - `Immutable Snapshot` (green) — content frozen at approval time
  - `Legacy — Not Frozen` (gray) — content from linked recommendation, may have changed
- **Border styling**: Primary border for immutable, amber border for legacy
- **Fields displayed**: Action, rationale, expected next state, scope exclusions, assumptions, risks accepted/rejected, conditions (amber text), override reason (red text), confidence, score, risks (JSON), next actions (JSON)

### Recommendation Changed Warning

When `recommendationDiffers` is true:
- Amber warning card with diff summary (e.g., "3 field(s) changed: Rationale, Risks Accepted, Expected Next State")
- **View Diff button**: Loads side-by-side comparison of all 12 fields (green = approved, red = current)
- **Request Re-review button**: Red CTA available when status is APPROVED or IN_REVIEW
- Re-review form requires reason, returns decision to DRAFT
- "Current Recommendation (Differs from Approved)" section below snapshot shows current action and update timestamp

### Legacy Approval Warning

When `isLegacySnapshot` is true:
- Amber warning card: "Legacy Approval Snapshot — content not frozen"
- Explains content is from linked recommendation record, which may have changed

### Override Without Recommendation

- Approval forms show override reason field when no recommendation exists
- Override reason displayed in red text in snapshot card
- Audit trail captures override reason

## Backward Compatibility

| Scenario | Behavior |
|----------|----------|
| Old approval, no snapshot fields | Falls back to recommendation relation, shows legacy warning |
| Old approval, recommendation deleted | Shows "No snapshot available" |
| New approval, recommendation later edited | Snapshot preserved, diff warning shown |
| New approval, recommendation later deleted | Snapshot preserved, no data loss |
| Override approval (no recommendation) | All snapshot fields null, override reason stored |

## Publishing Behavior

See `docs/decisionos-publishing-policy.md` for full details.

### Summary

- **Approved snapshot exists**: Publishing uses the approved immutable snapshot by default
- **Current recommendation differs**: Publish is blocked; requires explicit `forcePublishCurrent` override
- **No approval**: Publishes current recommendation (existing behavior)
- **Published view**: Shows content source badge (Approved Snapshot / Current Recommendation / Legacy)
- **Audit logging**: `SNAPSHOT_PUBLISHED`, `CURRENT_PUBLISHED_WITHOUT_APPROVAL`, `STALE_PUBLISH_BLOCKED`, `STALE_PUBLISH_OVERRIDE`

## Changed Files

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Added 12 `snapshot*` fields to Approval; added `approvals`, `publishedFromSnapshot`, `publishedApprovalId` fields |
| `src/actions/approval.ts` | `buildSnapshotData` helper; updated all approval actions; `getApprovalStatus` with immutable/legacy resolution; `getRecommendationDiff` for full field diff; `requestReReview` for re-review cycle |
| `src/actions/decisions.ts` | Updated `publishRecommendationAction` with snapshot guardrails; updated `getPublishedRecommendationViewAction` with source detection; added new audit actions |
| `src/lib/recommendation/recommendation-diff.ts` | New: reusable diff engine comparing 12 fields between snapshot and current |
| `src/app/(dashboard)/decisions/[id]/governance/page.tsx` | Immutable/legacy visual distinction, expanded snapshot fields, diff summary, View Diff button, Request Re-review CTA and form |
| `src/app/(dashboard)/decisions/[id]/recommendation/page.tsx` | Side-by-side diff view, diff summary, enhanced override confirmation with diff context |
| `src/app/published/recommendation/[decisionId]/page.tsx` | Source indicator badge, approval metadata display, expanded fields |

## Remaining Risks

1. **Diff is string-based** — No semantic/word-level diff for long text fields; compares full string equality
2. **Re-review creates separate snapshot** — Old and new approval snapshots are not linked; no chain of custody
3. **Override reason is free-text** — No structured validation.
4. **JSON fields untyped** — `snapshotRisks` and `snapshotNextActions` are Json, no schema validation.
5. **Force override bypasses snapshot** — Admin can publish changed recommendation with explicit override; logged but not prevented.
6. **No approval expiry** — Approved decisions don't have expiration or automatic re-review trigger.
