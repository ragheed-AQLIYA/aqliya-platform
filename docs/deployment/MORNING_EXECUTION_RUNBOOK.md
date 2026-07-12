# AQLIYA — Morning Execution Runbook

**Date:** 2026-07-09 (target) | **Operator:** Platform Team

---

## Timeline

```
09:00–09:20  Phase 1: Redis HA apply + verify
09:20–09:35  Phase 2: Post-apply smoke test
09:35–10:00  Phase 3: Pilot account creation
10:00–11:00  Phase 4: AuditOS Pilot Session 01
11:15–...    Phase 5: Terraform state recovery kickoff
```

---

## Phase 1 — Redis HA Apply (09:00–09:20)

**Goal:** Fix Redis to run with 2 nodes + Multi-AZ + failover on prod.

### Steps

```bash
cd infra/terraform

# 1. Fix was already applied to code: "production" → "prod"
#    in modules/compute/main.tf line ~445

# 2. Apply to prod
terraform apply -var-file=environments/prod/terraform.tfvars -auto-approve
```

### Expected result

```
aws_elasticache_replication_group.redis:
  num_cache_clusters: 1 → 2
  automatic_failover_enabled: false → true
  multi_az_enabled: false → true
```

### Verify

```bash
aws elasticache describe-replication-groups \
  --replication-group-id aqliya-prod-redis-rg \
  --query "ReplicationGroups[0].{nodes:MemberClusters,automaticFailover:AutomaticFailover,multiAZ:MultiAZ}"
```

### Fallback

If apply fails or creates drift, roll back with:
```bash
terraform apply -var-file=environments/prod/terraform.tfvars -auto-approve
# Or disable domain_ready temporarily if CloudFront/WAF issues
```

---

## Phase 2 — Post-Apply Smoke (09:20–09:35)

**Goal:** Verify nothing broke before the pilot session.

```bash
# 1. Health
curl https://app.aqliya.com/api/health
# Expected: {"status":"ok","database":true}

# 2. Login page
curl -o /dev/null -w "%{http_code}" https://app.aqliya.com/login
# Expected: 200

# 3. Audit routes
curl -o /dev/null -w "%{http_code}" https://app.aqliya.com/audit
# Expected: 307

# 4. Marketing page
curl -o /dev/null -w "%{http_code}" https://app.aqliya.com/
# Expected: 200

# 5. ECS stability
aws ecs describe-services --cluster aqliya-prod-cluster --service aqliya-prod-service \
  --query "services[0].{running:runningCount,desired:desiredCount}"
# Expected: 1 1
```

### Verification Gate

| Check | Must Pass |
|-------|-----------|
| Health 200 | ✅ |
| Login 200 | ✅ |
| Audit 307 | ✅ |
| Main 200 | ✅ |
| ECS 1/1 | ✅ |

If any check fails → **DO NOT START PILOT** → Investigate and fix first.

---

## Phase 3 — Pilot Account Creation (09:35–10:00)

**Goal:** Create 4 pilot accounts for Session 01.

| Role | Email | Permission Level |
|------|-------|-----------------|
| Partner | `partner@aqliya.com` | Admin (full access) |
| Manager | `manager@aqliya.com` | Engagement management |
| Senior | `senior@aqliya.com` | Evidence + findings |
| Reviewer | `reviewer@aqliya.com` | Review + approval |

### Steps

```bash
# Access signup via browser:
# 1. Open https://app.aqliya.com/signup
# 2. Create account for partner@
# 3. Assign admin role via admin panel /settings/team
# 4. Create remaining accounts
# 5. Verify each can log in
```

### Verify

- [ ] `partner@` can log in and see `/audit`
- [ ] `manager@` can log in
- [ ] `senior@` can log in
- [ ] `reviewer@` can log in

---

## Phase 4 — Pilot Session 01 (10:00–11:00)

**Goal:** Run the first AuditOS pilot session with a known user.

### Pre-session checklist

- [ ] Redis fix applied and verified
- [ ] Smoke tests all green
- [ ] Accounts created and working
- [ ] Session script printed/accessible
- [ ] Feedback log ready
- [ ] Fallback plan clear

### Session flow

Follow `AUDITOS_PILOT_SESSION_01_PLAN.md`:
1. Login → 2. Dashboard → 3. Portfolio → 4. Engagement → 5. Evidence → 6. Review → 7. Export

### Evidence collection

- Record any errors or blockers in `AUDITOS_PILOT_FEEDBACK_LOG.md`
- Note what worked well
- Note what confused the user

---

## Phase 5 — Terraform State Recovery Kickoff (11:15–...)

**Goal:** Start importing critical prod resources into Terraform state.

### Priority import order

```bash
# 1. VPC
terraform import module.networking.aws_vpc.main vpc-060a49d210f05d9d1

# 2. ECS
terraform import module.compute.aws_ecs_cluster.main aqliya-prod-cluster
terraform import module.compute.aws_ecs_service.app aqliya-prod-service

# 3. RDS
terraform import module.database.aws_db_instance.primary aqliya-prod-db

# 4. ALB
terraform import module.compute.aws_lb.main aqliya-prod-alb

# 5. Redis
# (after apply completes)
terraform import module.compute.aws_elasticache_replication_group.redis aqliya-prod-redis-rg

# 6. S3
terraform import module.storage.aws_s3_bucket.static aqliya-prod-static
terraform import module.storage.aws_s3_bucket.uploads aqliya-prod-uploads

# 7. Security groups
# ... continue as needed
```

### After imports

```bash
terraform plan -var-file=environments/prod/terraform.tfvars
# Should show no changes if imports correct
```

---

## Evidence Checkpoints

### After Phase 1 — Redis HA Apply

Record in `docs/deployments/prod-redis-ha-evidence-YYYY-MM-DD.txt`:
```txt
Redis HA Apply Result:
- Resource type: aws_elasticache_replication_group
- Node count:
- Automatic failover: enabled/disabled
- Multi-AZ: enabled/disabled
- Endpoint:
- Apply success: yes/no
```

### After Phase 2 — Smoke Test

Record in `docs/deployments/prod-post-redis-smoke-YYYY-MM-DD.txt`:
```txt
Smoke Test Results:
- /api/health → pass/fail
- /login → pass/fail
- /audit → pass/fail (expected 307)
- / → pass/fail
- ECS running/desired → pass/fail
- Overall: GO/STOP
```

### After Phase 4 — Session 01

Create `docs/deployment/AUDITOS_PILOT_SESSION_01_REPORT.md`:
```txt
Session 01 Summary:
- Date:
- Participants:
- Flows tested:
- Blockers found:
- Feedback summary:
- Readiness verdict: proceed/modify/stop
```

---

## Success Criteria for Today

| Milestone | Time | Evidence | Status |
|-----------|------|----------|--------|
| Redis HA applied | 09:20 | `prod-redis-ha-evidence.txt` | ⬜ |
| Smoke tests green | 09:35 | `prod-post-redis-smoke.txt` | ⬜ |
| Accounts created | 10:00 | Accounts exist | ⬜ |
| Session 01 complete | 11:00 | `AUDITOS_PILOT_SESSION_01_REPORT.md` | ⬜ |
| State recovery started | 11:30 | Import commands executed | ⬜ |

---

## If Something Goes Wrong

| Issue | Action |
|-------|--------|
| Redis apply fails | Roll back, debug, attempt 2, skip to Phase 3 if critical |
| Smoke test fails | Block pilot, investigate, fix, re-test |
| Account creation fails | Create manually via DB or admin panel |
| Session has blocker bug | Record in feedback, continue with available flows |
| State recovery takes too long | Import only critical resources today |
