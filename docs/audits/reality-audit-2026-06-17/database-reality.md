# Database Reality — AQLIYA Deep Reality Audit

**Audit date:** 2026-06-17

---

## Schema Overview — VERIFIED

| Metric | Value | Command |
|--------|------:|---------|
| Prisma models | 100 | `grep ^model prisma/schema.prisma` |
| `organizationId` references | 310 | grep count in schema |
| Migrations | 43 SQL migrations + metadata | `prisma/migrations/` |
| Schema validation | PASS | `npx prisma validate` |
| Latest migration | `20260615110000_add_lead_schedule` | Directory sort |

---

## Model Domains

| Domain | Models (approx) | Key Models |
|--------|----------------:|------------|
| Platform | 8 | PlatformOrganization, PlatformAuditLog, PlatformSecret, ClientWorkspace, Project |
| AuditOS | 40+ | AuditEngagement, AuditTrialBalance, AuditEvidence, AuditFinding, AuditEvent |
| LocalContentOS | 12+ | LocalContentProject, LcWorkbook, LcWorkbookLine |
| Content Studio (LC) | 7 | ContentStudioProject, ContentStudioCampaign, ContentStudioItem |
| DecisionOS | 20+ | Decision, DecisionEvidence, Approval, DecisionOutcome |
| WorkflowOS/Sunbul | 10 | WorkflowTemplate, SunbulClient, SunbulRecord |
| SalesOS | 11 | SalesAccount, SalesDeal, SalesPipeline, SalesAuditEvent |
| LocalContactOS | 7 | LocalContact, ContactReview, ContactExportRequest |
| Office AI | 3 | OfficeAiTask, OfficeAiOutput, OfficeAiFile |
| AI/RAG | 5+ | DocumentChunk (pgvector), IntelligenceQuery, AgentMemory |
| Auth/SSO | 4+ | User (MFA fields), ScimProvisioningEvent, SsoProvider |

---

## Schema Quality Issues — VERIFIED

| Issue | Severity | Evidence | Recommendation |
|-------|----------|----------|----------------|
| `platformAuditEvent` in code, not schema | **Critical** | `audit-event-service.ts:47` | Add model or revert to PlatformAuditLog |
| Untracked `diff_platform_models.sql` | High | git status `??` | Review and migrate properly |
| Content Studio standalone models missing | High | `content-studio-service.ts` uses `contentWorkspace` etc. | Add models or deprecate route |
| Enum vs String drift history | Medium | Phase 7 notes reverted incompatible enums | Maintain migration discipline |

---

## Migration Safety — PARTIALLY VERIFIED

**Positive signals:**
- 43 incremental migrations since init (20260506103224)
- Deletion protection in Terraform RDS config
- No `prisma migrate reset` in CI

**Risks:**
- `migration-evidence.test.ts` expects stale latest migration name — process drift indicator
- Untracked SQL diff file suggests local schema changes not committed
- Integration tests require separate test DB (port 5433)

---

## Tenant Isolation — VERIFIED (pattern)

Standard pattern across product models:
```prisma
organizationId String
organization   Organization @relation(...)
@@index([organizationId])
```

Product-specific guards enforce at query time (not DB RLS).

**PostgreSQL RLS:** NOT IMPLEMENTED — application-layer isolation only.

---

## Indexing — PARTIALLY VERIFIED

Schema includes `@@index` on common query fields (organizationId, status, foreign keys).  
Full index audit not performed (would require `EXPLAIN` on production queries).

**pgvector:** Optional extension; fallback to `embeddingJson` column when unavailable.

---

## Seed Data — VERIFIED

| Seed | File | Wired to `prisma db seed` |
|------|------|---------------------------|
| Main | `prisma/seed.ts` | YES |
| AuditOS | `prisma/seed-audit.ts` | Manual (`npm run seed:audit`) |
| LocalContent | `prisma/seed-local-content.ts` | Partial |
| SalesOS | `prisma/seed-sales.ts` | NO (manual) |
| Office AI | `scripts/seed-office-ai.ts` | NO (manual) |

---

## N+1 / Query Patterns — UNVERIFIED

Static review only. Prisma `include` patterns used in services; no runtime query profiling performed.

---

## Data Integrity — PARTIALLY VERIFIED

- SHA-256 on decision evidence uploads — VERIFIED in actions
- Audit event logging on mutations — VERIFIED pattern
- `createdById` governance pass documented — VERIFIED in schema for key models
- Cascade deletes — model-specific; not fully audited

---

## Scalability Assessment

| Aspect | Rating | Notes |
|--------|--------|-------|
| Multi-tenant row isolation | Good | organizationId pervasive |
| Connection pooling | Standard | Prisma + RDS |
| Read replicas | Terraform-defined (prod) | Not verified live |
| Vector search | pgvector + JSON fallback | Hybrid approach sensible |
| Large file storage | S3/local | Off-DB blobs |

---

**Database score: 74/100** — Rich, well-modeled schema undermined by current code-schema drift blocking build.
