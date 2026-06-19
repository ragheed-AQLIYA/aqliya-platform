# AuditOS — Pilot Runbook

**Phase:** 5 — Pilot Hardening  
**Target:** First controlled pilot customer

## Platform pilot quick reference (2026-06)

Multi-product pilots on AQLIYA share these prerequisites:

| Step | Command / route | Pass |
|------|-----------------|------|
| Health | `STAGING_BASE_URL=https://aqliya.com node scripts/platform/staging-probe.mjs` | HTTP 200 + DB |
| Smoke | `node scripts/platform/post-deploy-smoke.mjs --base-url https://aqliya.com` | 28/30 critical |
| AuditOS data | `npm run seed:audit` | 23 TB lines on `eng-gulf-2025` |
| E2E (local) | `npm run build && npm run start:standalone:e2e` + `npx cypress run` | 11 specs |
| Truth doc | `docs/source-of-truth/AQLIYA_CURRENT_STATE.md` | Current score + limits |

**Blockers:** Staging DNS (`staging.aqliya.com` ENOTFOUND), AWS CLI/terraform on operator machine, external pen test.

Product-specific sections below start with **AuditOS**.

---

## 1. Pilot Objective

Test AuditOS with one real audit engagement using a pilot customer's trial balance data. Validate that the governed workspace workflow (Engagement → Trial Balance → Mapping → Statements → Notes → Evidence → Findings → Review → Validation → Publication → Approval) operates correctly in a real setting.

## 2. Pilot Scope

**In scope:**
- One audit engagement with real trial balance data
- Full workflow cycle (end-to-end)
- Evidence linking with real files
- Validation run and issue disposition
- Publication and approval

**Out of scope:**
- Multi-tenant concurrent usage
- SSO / OAuth authentication
- Production malware scanning (fail-closed — uploads blocked without SCANNER_PROVIDER)
- PDF/DOCX export (JSON-only)
- Client-facing portal access

## 3. Pre-Pilot Checklist

- [ ] Database backup performed (see Section 7)
- [ ] Health check passes: `npm run audit:health` (7/7)
- [ ] Backup verification passes: `npm run backup:verify`
- [ ] Build passes: `npm run build`
- [ ] Pilot organization and users provisioned via `/audit/admin/users`
- [ ] Pilot client created via engagement form
- [ ] Team roles assigned (operator, reviewer, partner)
- [ ] Known limitations communicated to pilot participants

## 4. Environment Checklist

- [ ] PostgreSQL 16+ accessible
- [ ] `DATABASE_URL` configured in `.env`
- [ ] `AUTH_SECRET` configured in `.env`
- [ ] `NODE_ENV` set appropriately (development for pilot, not production)
- [ ] `SCANNER_PROVIDER` set to any value to enable upload scanning in dev (returns "skipped_dev")
- [ ] `RESEND_API_KEY` optional (only for custom product email notifications)
- [ ] Node.js 18+ with npm available

## 5. User / Role Setup

| Role | Purpose | Actions Allowed |
|---|---|---|
| admin | System administrator | User provisioning, role assignment |
| operator | Staff auditor | Create engagements, upload TB, map accounts, create evidence/findings/recommendations |
| reviewer | Senior auditor | Review findings, add review comments, run validation, dispose issues |
| partner | Engagement partner | Approve/reject, publish engagement |
| viewer | Client contact | Read-only access |

Setup via: `/audit/admin/users`

## 6. Data Handling Rules

- **No production client data in development environment.** Use only pilot customer data explicitly consented for this pilot.
- **Backup before every session.** Run backup before loading pilot data.
- **Restore procedure is guarded.** Dry-run by default. Requires explicit confirmation.
- **Evidence files are stored as references only.** No binary file storage in current implementation. File metadata is tracked; actual files managed externally.
- **Demo route (`/auditos`) is mock-backed and never touches real data.** Do not confuse demo data with pilot data.

## 7. Backup Before Pilot

```bash
npm run db:backup
```

This creates a timestamped dump in `backups/` using `pg_dump`. Verify:

```bash
npm run backup:verify
```

### Restore (if needed)

```bash
npm run db:restore -- backups/aqliya_backup_YYYY-MM-DDTHH-MM-SS.dump
```

**By default, this is a dry run.** To execute:

```bash
CONFIRM_RESTORE=true npm run db:restore -- backups/aqliya_backup_YYYY-MM-DDTHH-MM-SS.dump
```

See `docker-compose.test.yml` for test DB setup.
See `docs/operations/backup-schedule.md` for scheduling guidance.

## 8. Demo vs Workspace

| Route | Purpose | Real Data? | Auth Required? |
|---|---|---|---|
| `/audit` | AuditOS governed workspace | Yes | Yes |
| `/auditos` | AuditOS guided demo | No (mock only) | No |

**Do not send pilot customers to `/auditos` expecting real data.** Always use `/audit`.

## 9. Engagement Setup

1. Log in to `/audit` as an admin or operator
2. Click "New Engagement" or provision users via `/audit/admin/users`
3. Fill in client name, fiscal period, engagement type, team members
4. Engagement is created with status `setup`

## 10. Trial Balance Import

1. Navigate to `/audit/engagements/[id]/trial-balance`
2. Upload CSV/XLSX file with columns: accountCode, accountName, debit, credit
3. System parses and validates: checks total debits = total credits
4. Trust state assigned: trusted, conditional, or blocked

## 11. Mapping / Review Flow

1. Navigate to `/audit/engagements/[id]/mapping`
2. AI suggests canonical account mappings
3. Operator accepts or manually maps each account
4. On manual mapping, financial statements are rebuilt automatically

## 12. Validation Run and Disposition

1. Navigate to `/audit/engagements/[id]/validation`
2. Click "Run Validation"
3. System runs 5 checks: TB balance, unmapped accounts, mapping amounts, missing evidence, statement existence
4. Results persist to database with audit event
5. Operator/reviewer disposes each issue: Accept, Dismiss, or Investigate
6. Dispositions are persisted with actor attribution and audit event

## 13. Publication Workflow

1. Complete review and approval stages
2. Navigate to `/audit/engagements/[id]/publication`
3. Review package contents (statements, notes, findings, evidence summary)
4. Export to JSON for review
5. Click "Publish" (requires admin or partner role)
6. Publication sets `publishedAt`, `publishedBy`, `lockedAt`
7. Audit event `publication.published` recorded

## 14. Evidence Upload Rules

- Allowed types: PDF, XLSX, XLS, DOCX, JPG, JPEG, PNG, CSV
- Max size: 20MB
- Evidence uploaded via `/audit/engagements/[id]/evidence`
- Link evidence to accounts, findings, or notes
- File scanning: "skipped_dev" in development (dev mock only)
- In production: uploads blocked unless SCANNER_PROVIDER is configured

## 15. Issue Escalation

| Severity | Required Action | Reviewer Level |
|---|---|---|
| Low | Document and close | Operator or Reviewer |
| Medium | Review and resolve before publication | Reviewer |
| High | Escalate to manager | Manager or Partner |
| Critical | Escalate to partner immediately | Partner |

## 16. Daily Pilot Checklist

- [ ] Start-of-day backup: `npm run db:backup`
- [ ] Health check: `npm run audit:health`
- [ ] Check open production blockers: 0
- [ ] Record completed workflow stages
- [ ] Log any UX issues, bugs, or feedback
- [ ] Verify audit event coverage for the day's operations
- [ ] End-of-day backup

## 17. End-of-Pilot Checklist

- [ ] All workflow stages completed for pilot engagement
- [ ] Validation run performed and issues disposed
- [ ] Publication executed
- [ ] Final backup taken and verified
- [ ] Pilot feedback collected and categorized
- [ ] Known limitations documented for debrief
- [ ] Go/no-go decision recorded with evidence

## 18. Go / No-Go Criteria

**Go indicators:**
- Full workflow cycle completed without data loss
- All dispositions persisted and attributable
- Audit event coverage confirmed at all stages
- No unexpected tenant isolation breaches
- Backup/restore verified successfully
- Pilot participant feedback positive without critical issues

**No-Go indicators:**
- Data loss or corruption during pilot
- Tenant isolation breach
- Publication or validation failure blocking completion
- Critical security issue discovered
- Pilot participant cannot complete workflow

## 19. Known Limitations

- JSON-only exports (no PDF/DOCX)
- No real malware scanning in dev (fail-closed in production)
- Credentials-only authentication (no SSO)
- Evidence files stored as metadata only (no binary storage)
- No optimistic concurrency
- Jest tests require PostgreSQL (not yet containerized in CI)
- 9 ESLint errors remaining in pre-existing code
- Statement of Cash Flows not implemented
- Backup not automated/scheduled (manual only)
