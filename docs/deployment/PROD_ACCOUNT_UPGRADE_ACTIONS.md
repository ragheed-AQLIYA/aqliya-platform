# Production Account Upgrade Actions

**Status:** Pending | **Priority:** Medium-High

---

## Required Actions

### 1. Add Payment Method

In AWS Console → Billing → Add payment method to remove free-tier restrictions.

### 2. Apply Final Production Sizing

After upgrade, update `environments/prod/terraform.tfvars`:

| Variable | Current (temp) | Target |
|----------|---------------|--------|
| `db_instance_class` | `db.t4g.micro` | `db.t4g.medium` |
| `db_allocated_storage` | 20 GB | 100 GB |
| `db_max_allocated_storage` | 20 GB | 500 GB |
| `db_multi_az` | false | true |
| `db_deletion_protection` | false | true |
| `db_backup_retention_days` | 0 | 30 |
| `redis_node_type` | `cache.t4g.small` | `cache.t7g.medium` |

### 3. Run Terraform Apply

```bash
cd infra/terraform
terraform apply -var-file=environments/prod/terraform.tfvars -auto-approve
```

### 4. Verify

- [ ] Health check passes (`/api/health`)
- [ ] Route smoke tests pass
- [ ] Backups enabled for RDS
- [ ] Multi-AZ active
- [ ] Redis replication group with 2 nodes

### 5. Update Evidence

Save new evidence to:
```
docs/deployments/prod-upgrade-evidence-YYYY-MM-DD.txt
```
