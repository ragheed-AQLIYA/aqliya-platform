# AQLIYA Incident & Rollback Runbook

**Purpose:** Documented procedures for common incidents and rollback scenarios.

---

## Scenario 1: Deployment fails (Terraform apply error)

### Symptoms
- `terraform apply` exits with non-zero code
- Some resources created, some failed

### Actions

```bash
# 1. Identify the failure
terraform plan -var-file=environments/<env>/terraform.tfvars

# 2. If the error is in a single resource (e.g., WAF association):
#    Fix the resource definition and re-apply
#    See ADR-DEPLOY-001 for CloudFront WAF attachment

# 3. If state is corrupted:
terraform state list | grep -i <failed_resource>
terraform state rm <failed_resource>
# Then re-apply to recreate

# 4. If the issue is environmental (e.g., ACM cert not ready):
#    Temporarily set domain_ready = false
#    Apply to remove CloudFront/HTTPS
#    Fix the DNS/ACM issue
#    Set domain_ready = true
#    Apply again
```

---

## Scenario 2: Application returns 503

### Symptoms
- ALB returns 503
- Health endpoint unavailable

### Diagnosis

```bash
# 1. Check ECS service status
aws ecs describe-services --cluster <cluster> --services <service> \
  --query 'services[0].{running:runningCount,desired:desiredCount,events:events[0].message}'

# 2. Check stopped tasks for errors
aws ecs list-tasks --cluster <cluster> --desired-status STOPPED

# 3. Check ECS task logs
aws logs tail /ecs/aqliya-dev --since 5m

# 4. Check ALB target group
aws elbv2 describe-target-health \
  --target-group-arn $(aws elbv2 describe-target-groups --names aqliya-dev-tg --query 'TargetGroups[0].TargetGroupArn' --output text)
```

### Common causes and fixes

| Cause | Check | Fix |
|-------|-------|-----|
| Secrets not resolved | Task stopped with `ResourceInitializationError` | Verify secret ARN in task definition has random suffix |
| Container OOM | Task stopped after running briefly | Increase `ecs_task_memory` |
| Database unreachable | Health check shows `database.ok: false` | Check RDS SG, SSL mode, connection string |
| Outdated image | Task running old code | Force new deployment: `aws ecs update-service --force-new-deployment` |

### Force re-deploy

```bash
aws ecs update-service \
  --cluster <cluster> \
  --service <service> \
  --force-new-deployment
```

---

## Scenario 3: Database connection failure

### Symptoms
- `health` → `database.ok: false`
- Prisma error: `Can't reach database server`
- Error: `no pg_hba.conf entry for host`

### Diagnosis

```bash
# Check RDS status
aws rds describe-db-instances --db-instance-identifier <instance> \
  --query 'DBInstances[0].{status:DBInstanceStatus,endpoint:Endpoint.Address}'

# Check security group rules (allow ECS SG on port 5432)
aws ec2 describe-security-group-rules \
  --filter Name=group-id,Values=<rds-sg-id>

# Test connection from ECS (via ECS Exec)
aws ecs execute-command \
  --cluster <cluster> \
  --task <task-id> \
  --container app \
  --interactive \
  --command "nc -zv <rds-endpoint> 5432"
```

### Fixes

1. SSL mode: Add `?sslmode=no-verify` (dev) or `?sslmode=require` (prod with CA bundle)
2. SG rules: Ensure ECS security group allows outbound to RDS SG on port 5432
3. Subnet: Ensure RDS subnet group and ECS task are in the same VPC

---

## Scenario 4: ACM certificate not issuing

### Symptoms
- ACM cert stays `PENDING_VALIDATION`
- terraform apply fails on HTTPS listener or CloudFront

### Diagnosis

```bash
# Check cert status
aws acm describe-certificate --certificate-arn <arn> \
  --query 'Certificate.{domain:DomainName,status:Status,validation:DomainValidationOptions[].ValidationStatus}'

# Check DNS validation record exists
aws route53 list-resource-record-sets \
  --hosted-zone-id <zone-id> \
  --query "ResourceRecordSets[?Type=='CNAME']"
```

### Fixes

1. ✅ Validation CNAME records exist in Route53 zone
2. ✅ Nameserver delegation correct at domain registrar
3. ⚠️ Wait for DNS propagation (24-48h)
4. If still failing: delete cert, re-request, re-deploy validation records

---

## Scenario 5: Secrets Manager access failure

### Symptoms
- ECS task fails with `unable to retrieve secret from asm`
- Error: `AccessDeniedException` or `ResourceNotFoundException`

### Diagnosis

```bash
# Check secret exists
aws secretsmanager list-secrets \
  --query "SecretList[?contains(Name, 'aqliya')].[Name,ARN]"

# Check ECS execution role has permission
aws iam get-role-policy \
  --role-name aqliya-dev-ecs-execution \
  --policy-name aqliya-dev-ecs-execution-policy \
  --query 'PolicyDocument.Statement[?contains(Action, `secretsmanager`)]'
```

### Fixes

1. Ensure task definition uses full ARN with random suffix (e.g., `.../auth-secret-ZWkW5p`)
2. Ensure execution role has `secretsmanager:GetSecretValue` on `arn:aws:secretsmanager:*:*:secret:*`
3. If secret deleted: recreate via `scripts/create-secrets.sh`

---

## Scenario 6: Full environment rollback

### When to roll back
- Breaking change deployed
- Data corruption
- Security incident

### Steps

```bash
# 1. Identify the last known good Terraform state
git log --oneline infra/terraform/

# 2. Checkout previous Terraform version
git checkout <last-good-commit> -- infra/terraform/

# 3. Revert infrastructure
cd infra/terraform
terraform apply -var-file=environments/<env>/terraform.tfvars -auto-approve

# 4. Revert application image
aws ecs update-service \
  --cluster <cluster> \
  --service <service> \
  --force-new-deployment

# 5. Verify health
curl https://<domain>/api/health
```

### RDS restore from snapshot

```bash
# List snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier aqliya-dev-db \
  --query 'DBSnapshots[?Status==`available`].[DBSnapshotIdentifier,SnapshotCreateTime]'

# Restore (creates new instance)
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier aqliya-dev-db-restored \
  --db-snapshot-identifier <snapshot-id>

# Update task definition to point to restored DB
# Update database-url secret with new endpoint
```

---

## Communication

For any incident:
1. Check health endpoint: `https://<domain>/api/health`
2. Check CloudWatch alarms
3. Check ECS events
4. Document findings in `docs/incidents/YYYY-MM-DD-description.md`
5. Follow the fix procedures above
6. Verify resolution
7. Document post-mortem
