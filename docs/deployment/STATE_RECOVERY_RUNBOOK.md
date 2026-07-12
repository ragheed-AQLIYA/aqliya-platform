# Terraform State Recovery Runbook

**Status:** Action Required | **Priority:** High

---

## Issue

Terraform state is lost for both dev and prod environments due to backend switching without proper state persistence.

## Recovery Steps

### Option A: Re-import resources (recommended)

For each environment, run the following import commands:

**Prod — critical resources (priority order):**

```bash
# 1. Fix backend first
cd infra/terraform
rm -rf .terraform
terraform init -backend-config=environments/prod/backend.tf -reconfigure

# 2. Import core resources
terraform import module.networking.aws_vpc.main vpc-060a49d210f05d9d1
terraform import module.networking.aws_internet_gateway.main igw-xxxx
# ... continue with all resources
```

### Option B: Full re-apply

Since the state is empty, you can let Terraform detect existing resources:

```bash
cd infra/terraform
terraform init -backend-config=environments/prod/backend.tf -reconfigure

# This will show all resources as "to be created"
# Some will fail (AlreadyExists), Terraform stores the rest
terraform apply -var-file=environments/prod/terraform.tfvars -auto-approve
```

### Option C: Generate import script from AWS CLI

```bash
# List ECS clusters
aws ecs list-clusters
# Generate import commands for each resource manually
```
