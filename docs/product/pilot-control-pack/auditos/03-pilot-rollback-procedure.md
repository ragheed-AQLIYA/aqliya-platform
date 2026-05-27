# AuditOS Pilot Rollback Procedure

## When to Roll Back

Roll back if any of these occur:

1. **Data loss** — participant data deleted or corrupted
2. **Cross-tenant leak** — one organization sees another's data
3. **Auth bypass** — unauthenticated access to protected routes
4. **Export contains wrong data** — financial data from wrong engagement
5. **Unrecoverable state** — engagement stuck in invalid workflow state
6. **Participant requests removal** — explicit withdrawal from pilot
7. **Escalated security incident** — per incident procedure (04)

## Rollback Levels

### Level 1: Session Reset (within session)

**Use when:** Operator makes an error, engagement state is wrong, demo data is inconsistent.

**Steps:**

1. Note current state
2. Navigate away and back to reset client state
3. If that fails, log out and log back in
4. If still broken, use Level 2

### Level 2: Data Reset (between sessions)

**Use when:** Seed data is corrupted, test data needs to be refreshed.

**Steps:**

1. Export any participant-generated data that should be preserved
2. Run seed script: `npx prisma db seed`
3. Verify data integrity: check engagement count, evidence, findings
4. Confirm with participant before proceeding

### Level 3: Environment Reset (pilot abort)

**Use when:** Environment is compromised, database is corrupted, security incident.

**Steps:**

1. Record the reason for rollback
2. Preserve logs and database snapshot if safe
3. Restore database from last known-good backup
4. Verify deployment matches last known-good commit
5. Run seed data
6. Verify environment checklist (02) from scratch
7. Notify participant of reset and reason

## After Rollback

- Complete incident report (04)
- Determine root cause
- Fix root cause before next session
- Document rollback in post-session review (07)
- If rollback was Level 3, escalate to platform lead before next session

## Prohibited During Rollback

- Editing database directly (no raw SQL unless explicitly authorized)
- Skipping verification steps
- Continuing pilot after unresolved data integrity issue
- Deleting audit logs
- Silently resetting without participant knowledge
