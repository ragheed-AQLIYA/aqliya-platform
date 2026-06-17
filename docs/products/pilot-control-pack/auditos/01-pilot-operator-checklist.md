# AuditOS Pilot Operator Checklist

## Pre-Session (24h before)

- [ ] Confirm pilot environment is isolated from production
- [ ] Verify database connectivity (prisma generate + migrate current)
- [ ] Confirm `AUDIT_ALLOW_MOCK_FALLBACK` is **not set** (or explicitly `false`)
- [ ] Confirm `STORAGE_PROVIDER` is set correctly (default: local)
- [ ] Verify seed data loaded (at least 1 engagement with trial balance, mapped accounts, evidence)
- [ ] Confirm pilot user has correct role (admin / operator / reviewer)
- [ ] Confirm pilot user has organization assignment
- [ ] Smoke test: login → navigate to `/audit` → see dashboard
- [ ] Smoke test: open engagement → see financial statements
- [ ] Smoke test: verify evidence upload and retrieval
- [ ] Smoke test: verify export generates without error
- [ ] Confirm `DOWNLOAD_TOKEN_SECRET` is set (if token-based download is used)
- [ ] Confirm rate limiter is not blocking legitimate use
- [ ] Confirm audit log is recording events
- [ ] Print this checklist and the session runbook (02)

## Session Start

- [ ] Open session evidence capture document (05)
- [ ] Record session start time
- [ ] Confirm operator identity and role
- [ ] Read controlled pilot constraints aloud or display on screen (08)
- [ ] Confirm pilot participant understands:
  - This is a **controlled pilot**, not production
  - Data may be reset
  - Some AI outputs are deterministic (not real LLM)
  - All actions are logged
  - Human always decides, evidence always governs
- [ ] Begin session per runbook (06)

## During Session

- [ ] Document all unexpected behavior
- [ ] Record participant questions and confusion points
- [ ] Capture screenshots of errors or unexpected states
- [ ] Note any workflow steps that feel unnatural
- [ ] Do not skip steps even if they seem obvious
- [ ] If blocked, follow escalation procedure (04)

## Session End

- [ ] Record session end time
- [ ] Complete evidence capture document (05)
- [ ] Collect participant feedback verbally
- [ ] Record feedback in post-session review (07)
- [ ] Do not delete session data without explicit approval
- [ ] Archive session evidence (screenshots, logs, notes)
- [ ] Tag any critical issues in the issue tracker
- [ ] Submit post-session review within 24h
