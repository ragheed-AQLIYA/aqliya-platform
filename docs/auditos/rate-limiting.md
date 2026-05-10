# Rate Limiting

## Overview

In-memory rate limiter for audit server actions. Located at `src/lib/audit/rate-limit.ts`.

## Categories and Limits

| Category | Limit | Applied To |
|----------|-------|------------|
| `default` | 60/min | General server actions |
| `upload` | 10/min | Trial balance upload |
| `mutation` | 30/min | Evidence, finding, recommendation create/update |
| `ai_generate` | 10/min | AI draft generation (notes, evidence, findings, recs, analytical) |
| `export` | 20/min | Financial statement, audit file, bilingual export |

## Architecture

```
Server Action
  → getAuditActor()
  → requireRole()
  → assertEngagementAccess()
  → enforceAuditRateLimit(actor, actionName, category)
  → service layer
```

The rate limiter uses an in-memory Map keyed by `organizationId:actorId:actionName`. Each key has a count and a reset timestamp. When the count exceeds the category limit within a 60-second window, the action throws:

> `"Rate limit exceeded. Please try again later."`

## Which Actions Are Rate Limited

| Action | Category |
|--------|----------|
| Upload trial balance | `upload` |
| Create evidence | `mutation` |
| Update evidence state | `mutation` |
| Create finding | `mutation` |
| Update finding status | `mutation` |
| Create recommendation | `mutation` |
| Create review comment | `mutation` |
| Create approval/rejection | `mutation` |
| Generate draft notes | `ai_generate` |
| Generate evidence suggestions | `ai_generate` |
| Generate finding drafts | `ai_generate` |
| Generate recommendation drafts | `ai_generate` |
| Generate analytical review | `ai_generate` |
| Export financial statements | `export` |
| Export audit file | `export` |
| Export bilingual | `export` |

## Production Recommendation

The current in-memory limiter is suitable for development and controlled pilot. For production deployment with multiple server instances, replace with:

- **Redis-based limiter** (recommended): Shared state across instances
- **Database-backed limiter**: Slower but simpler
- **API gateway rate limiting**: Best for cloud deployments

## Cleanup

A `setInterval` runs every 60 seconds to clear expired entries from the in-memory store, preventing memory leaks.
