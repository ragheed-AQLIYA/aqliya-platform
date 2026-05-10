# Pilot Launch Checklist

## 1. Pre-Launch Technical Checks
- Confirm `npx prisma migrate status` reports the database schema is up to date.
- Confirm `npx jest --verbose` passes.
- Confirm `npx tsc --noEmit` passes.
- Confirm `npm run build` passes.
- Confirm ESLint is clean on the latest changed code files.
- Confirm PostgreSQL is reachable from the application runtime.
- Confirm recommendation publication flow works end-to-end.
- Confirm org-scoping tests pass and cross-org access is denied.

## 2. Required Env Variables
- `DATABASE_URL`
  - Example:
  - `postgresql://postgres:postgres@localhost:5432/aqliya?schema=public`
- Any deployment environment must expose the same `DATABASE_URL` format with production credentials.

## 3. PostgreSQL Readiness
- PostgreSQL instance is running and reachable.
- Application user has permission to read/write schema objects.
- Latest Prisma migrations are applied.
- Backup/snapshot capability is confirmed before pilot use.
- Restore procedure is documented and tested at least once.
- Disk space and connection limits are sufficient for 1-3 pilot clients.

## 4. First Pilot Setup Steps

### Create organization
- Create one `Organization` for the pilot client.
- Confirm all pilot users belong to that organization.

### Create admin/operator/viewer
- Create one internal `ADMIN` user.
- Create one internal `OPERATOR` user.
- Create one client `VIEWER` user.
- Confirm each user is assigned to the correct organization.

### Create decision
- Sign in as `ADMIN` or `OPERATOR`.
- Create a new decision inside the pilot organization.
- Confirm the decision is not visible from another organization.

### Complete recommendation
- Complete intake.
- Complete framework.
- Complete scenarios.
- Complete risk analysis.
- Save recommendation output.

### Publish recommendation
- Sign in as `ADMIN`.
- Publish the recommendation.
- Confirm `publishedVersion` increments.
- Confirm an `OUTPUT_PUBLISHED` audit record is created.

### Test published viewer link
- Open `/published/recommendation/[decisionId]` as same-org `VIEWER`.
- Confirm the page shows only:
  - recommendation
  - rationale
  - expected next state
  - publication metadata
- Confirm the page does not show internal tabs, editing controls, or workflow details.

### Browser smoke test for published recommendation
- Sign in as same-org `VIEWER` in a real browser session.
- Navigate directly to `/published/recommendation/[decisionId]`.
- Confirm the page loads without redirects to internal workflow tabs.
- Confirm the page displays:
  - recommended action
  - rationale
  - expected next state
  - published version
  - published timestamp
- Confirm the page does not display:
  - intake
  - framework
  - scenarios
  - risks
  - internal decision tabs
  - publish/unpublish buttons
  - edit/save controls
- Unpublish the recommendation as `ADMIN`.
- Refresh the same viewer page and confirm access is denied.
- Re-publish and confirm the same-org viewer can access again.
- Try the same URL as a `VIEWER` from another organization and confirm access is denied.

## 5. Access-Control Checks
- Same-org `OPERATOR` can create and update decisions.
- Same-org `VIEWER` cannot perform write actions.
- Same-org `VIEWER` cannot access unpublished recommendation output.
- Same-org `VIEWER` can access published recommendation output.
- Cross-org `VIEWER` cannot access published recommendation output.
- Cross-org users cannot access another organization's decision pages or write actions.
- Only `ADMIN` can publish or unpublish recommendation output.

## 6. Rollback Steps
1. Stop pilot user access if a security or data-isolation issue is found.
2. Revert the application to the last known good commit.
3. Restore PostgreSQL from the latest snapshot/backup if data rollback is required.
4. Re-run `npx prisma migrate status` and smoke-check core routes.
5. Re-verify org scoping and recommendation access before reopening pilot access.

## 7. Known Non-Blocking Issues
- Jest reports an open-handle warning after tests complete, even though tests pass.
- Expected authorization denials are still logged with `console.error` in some server actions.
- Next.js build warns about multiple lockfiles when inferring workspace root.
- Recommendation publication exists, but reports and overview outputs are not yet using the same publication model.

## 8. Go / No-Go Criteria

### Go
- All required verification commands pass.
- PostgreSQL is running, migrated, and backed up.
- Org scoping blocks cross-org access.
- Same-org `VIEWER` access works only for published recommendation output.
- Recommendation publish/unpublish works for `ADMIN` only.
- Audit logs include organization context and publication events.

### No-Go
- Any cross-org access is possible.
- Same-org `VIEWER` can see unpublished recommendation output.
- `OPERATOR` or `VIEWER` can publish/unpublish recommendation output.
- Prisma migrations are not applied or PostgreSQL is unstable.
- Build, tests, or typecheck fail.
