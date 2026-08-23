# LCGPA Regulatory Governance

**Modules:** `governance.ts`, `change-journal.ts`, `alerts.ts`

---

## 1. No silent regulatory mutation

A new file can never become production truth by arriving. Forbidden:

```
new file → overwrite dataset → production uses new values
```

Required:

```
new file → verify → diff → classify → impact → governance
         → approve → publish → effective date → activate
```

## 2. Lifecycle

```
DETECTED → VERIFIED → PARSED → DIFFED → CLASSIFIED → IMPACT_ANALYZED
                                                          │
                                        ┌─────────────────┴────────────┐
                                        ▼                              ▼
                                  PENDING_REVIEW                 AUTO_APPROVED
                                   ┌────┴────┐                        │
                                   ▼         ▼                        │
                               APPROVED   REJECTED                    │
                                   └──────────┬───────────────────────┘
                                              ▼
                                          PUBLISHED
                                              │  (effective date reached)
                                              ▼
                                            ACTIVE
                                              │
                                              ▼
                                         ROLLED_BACK
```

Also reachable: `QUARANTINED` (integrity failure), `FAILED` (parser failure).

`ALLOWED_TRANSITIONS` is the single source of truth. `transitionCase` throws
`ILLEGAL_TRANSITION` on anything else — there is no force path. Every
transition records `{ from, to, at, actorId, actorName, reason, correlationId }`.

## 3. Attribution

- Every transition requires an actor: an authenticated user id, or the named
  system principal `system:lcgpa-regulatory-monitor` for automated steps.
- `approveCase` **refuses** a system principal —
  `HUMAN_APPROVAL_REQUIRED`. Human approval is human.
- `rejectCase` requires a reason.
- `publishCase` refuses without an approval record.

## 4. Auto-approval

Disabled by default. `DEFAULT_AUTO_APPROVAL_POLICY`:

```
policyId:              AUTO-LABEL-ONLY-V1
allowedChangeTypes:    PRODUCT_RENAMED, PRODUCT_DESCRIPTION_CHANGED
maxSeverity:           LOW
maxChangeCount:        25
requiredAuthorityTier: 1
enabled:               false
```

`evaluateAutoApproval` refuses with a specific reason —
`POLICY_DISABLED`, `TIER_INSUFFICIENT`, `CHANGE_TYPE_NOT_ALLOWED`,
`CHANGE_COUNT_EXCEEDED`, `SEVERITY_EXCEEDED` — and the approval record stores
`automatic: true` plus the `policyId`, so an automatic approval is as auditable
as a human one.

## 5. Activation

`activateDataset` refuses unless **all** hold:

- the governance case is `PUBLISHED`
- the dataset states an `effectiveFrom` (`EFFECTIVE_DATE_UNKNOWN` otherwise)
- `now >= effectiveFrom` (`NOT_YET_EFFECTIVE` otherwise)

On activation the previously active dataset becomes `SUPERSEDED` with a
`deactivatedAt` stamp. `assertGovernedActivation` is the runtime guard: an
`ACTIVE` dataset whose case is not `ACTIVE`, or which has no approval record or
no activation timestamp, raises `SILENT_MUTATION_DETECTED`.

## 6. Rollback

`rollbackDataset(active, previousVerified, case, { reason })`:

- the invalid dataset becomes `QUARANTINED` — **never destroyed**; products,
  provenance and artifact hash are preserved as evidence
- the previously verified dataset returns to `ACTIVE`
- the case moves to `ROLLED_BACK`
- a reason is mandatory; a non-`ACTIVE` dataset cannot be rolled back

## 7. Alerts

Every alert carries `alertId, category, severity, source, changeId, summary,
evidence[], effectiveDate, impactLevel, recommendedAction, createdAt, status`.

Categories: `NEW_REGULATION`, `DOCUMENT_UPDATED`, `PRODUCT_ADDED`,
`PRODUCT_REMOVED`, `PRODUCT_CHANGED`, `MINIMUM_LC_CHANGED`,
`EFFECTIVE_DATE_CHANGED`, `SOURCE_UNAVAILABLE`,
`SOURCE_AUTHENTICATION_FAILURE`, `PARSING_FAILURE`, `DATA_VALIDATION_FAILURE`,
`REGULATORY_CONFLICT`, `IMPACT_HIGH`, `POSSIBLE_CHANGE_DETECTED`.

Default alert threshold is `MEDIUM`, so label-only edits do not page anyone.
A third-party source produces exactly one `POSSIBLE_CHANGE_DETECTED` alert
whose recommended action is *"Search the official LCGPA sources for
confirmation. Do NOT update any registry from this signal."*

## 8. Change journal

Append-only, sequential, never deleted:

```
CHANGE-2026-00017

Detected:   2026-09-01T02:00:00.000Z
Source:     LCGPA Mandatory List
Artifact:   mandatory-list-2026-08.xlsx
SHA:        9f2a…
Dataset:    LCGPA_MANDATORY_LIST_2026-08
Change:     1 change(s): P-00421 MINIMUM_LC_CHANGED minimumLcPct: 40 → 50 (effective 2026-10-01) [impact HIGH]
Effective:  2026-10-01
Impact:     HIGH
Review:     APPROVED
Activated:  2026-09-03
```

The journal dedupes on `(artifactSha256, datasetVersion)`, so re-running the
monitor never produces a duplicate event.

## 9. Audit trail

`SOURCE_REGISTERED, SOURCE_VERIFIED, SOURCE_CHECKED, ARTIFACT_ACQUIRED,
ARTIFACT_VERIFIED, ARTIFACT_QUARANTINED, DATASET_CREATED, CHANGE_DETECTED,
CHANGE_CLASSIFIED, IMPACT_ANALYZED, REVIEW_REQUESTED, CHANGE_APPROVED,
CHANGE_REJECTED, DATASET_PUBLISHED, DATASET_ACTIVATED, DATASET_ROLLED_BACK,
CONFLICT_DETECTED, PARSER_FAILED`

Each event records `actor, timestamp, source, entityType, entityId, before,
after, reason, correlationId`. `createAuditEvent` throws
`AUDIT_ACTOR_REQUIRED` without an actor. Events are shaped for
`createLocalContentAuditEvent` → `PlatformAuditLog`.

## 10. Reviewer contract

A reviewer sees, for each pending case: what changed, old value, new value,
effective date, official source, artifact filename and SHA-256, impact level
with its rationale, affected entity counts, and the recommended action.
`buildReadModel().pendingReviews` is the queue.
