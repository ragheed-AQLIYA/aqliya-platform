---
name: eng-api-review
description: API route compliance — auth, RBAC, tenant isolation, rate limiting, error handling, download security
version: 1.0
date: 2026-07-13
status: active
owner: Layer 2 — Intelligence + Layer 4 — Security
inputs: API route or server action
outputs: API compliance report with security findings
dependencies: aqliya-security-gate, eng-security-audit
---

# Engineering API Review

## Checklist
1. **Auth**: Is route protected? In middleware matcher?
2. **RBAC**: Does action call enforce()/authorize()?
3. **Tenant**: Does query include organizationId? Download routes return 404?
4. **Rate Limiting**: Is API rate-limited?
5. **Error Handling**: Do errors leak internals? Are they actionable?
6. **Download Security**: Auth → tenant-safe 404 → audit trail
7. **Input Validation**: Server-side validation, not just client

## Output
```md
## API Review: <route>
| Finding | Severity | Category | Recommendation |
```
