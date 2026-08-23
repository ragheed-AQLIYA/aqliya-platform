# LCGPA Monitoring Policy

**Modules:** `source-monitor.ts`, `source-registry.ts`, `observability.ts`

---

## 1. Cadence

| Frequency | Interval | Applied to |
|---|---|---|
| `HOURLY` | 1 h | reserved for high-volatility endpoints |
| `DAILY` | 24 h | LCGPA mandatory list + documents library, SPA announcements |
| `WEEKLY` | 7 d | factories list, mechanisms page, consultations, third-party trackers |
| `ON_DEMAND` | never scheduled | manual trigger only |

No interval is hardcoded outside `CHECK_INTERVAL_MS`. A source is due when
`now >= lastCheckedAt + interval × backoff`.

## 2. Backoff

`backoffMultiplier(consecutiveFailures) = min(2^failures, 16)`

A failing daily source is retried after 2, 4, 8 then 16 days at most, so a
broken source is still retried rather than silently abandoned.

## 3. Check outcomes

| Outcome | Meaning |
|---|---|
| `FIRST_OBSERVATION` | no prior hash recorded for this source |
| `NO_CHANGE` | content hash identical to the previous observation |
| `CHANGE_DETECTED` | content hash differs — hand to the ingestion pipeline |
| `SOURCE_UNAVAILABLE` | fetch failed, non-2xx, or empty body |
| `INTEGRITY_FAILURE` | body retrieved but could not be fingerprinted |
| `SKIPPED_NOT_DUE` / `SKIPPED_DISABLED` | scheduler decisions |

## 4. Identity is content, not metadata

`ETag`, `Last-Modified`, `Content-Length` and `Content-Type` are **recorded** on
every check and are useful diagnostics, but artifact identity is **always** the
SHA-256 of the raw body. A source that changes its ETag without changing its
bytes produces `NO_CHANGE`.

## 5. Source failure handling

When a source is unreachable:

- The **currently active dataset stays active**. It is never invalidated,
  deleted or marked stale by a failed check.
- `lastArtifactHash` is preserved.
- `status` becomes `DEGRADED`, and `UNAVAILABLE` only after
  `FAILURE_TOLERANCE = 3` consecutive failures.
- A `SourceFailureRecord` is produced: `{ sourceId, failureAt, errorCode,
  errorMessage, retryAt, attemptCount }`.
- A `SOURCE_UNAVAILABLE` (or `SOURCE_AUTHENTICATION_FAILURE` on 401/403) alert
  is raised.

## 6. Integrity failure

If the content changes but fails validation, the source is `QUARANTINED` and
the artifact is never activated. A quarantined source cannot update
authoritative state until an operator releases the quarantine.

## 7. Idempotency

Running the monitor repeatedly against unchanged bytes yields:

- one artifact version (`sourceId:sha256`)
- one dataset version
- no duplicate change events (the journal dedupes on artifact + dataset)

This is covered by tests in `source-monitor.test.ts` and `pipeline.test.ts`.

## 8. Metrics

Emitted through `observability.ts` on top of the platform structured logger:

```
source_check_total{source,outcome}
source_check_failure_total{source,error}
artifact_acquired_total{source,status}
artifact_changed_total{source}
parse_failure_total{source}
validation_failure_total{source}
regulatory_change_total{source,type,severity}
high_impact_change_total{source,level}
review_pending_total{source}
activation_total{source}
rollback_total{source}
conflict_total{source}
alert_total{source,category,severity}
```

## 9. Source health

`buildSourceHealth()` exposes: status, enabled, last check, last successful
check, last failure, last change, last artifact SHA-256, consecutive failures,
next check. `buildReadModel()` aggregates these plus
`authoritativeSourcesAwaitingVerification` — the TIER 1 sources still blocked
at the evidence boundary.
