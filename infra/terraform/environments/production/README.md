# ⚠️ DEPRECATED — Do Not Use

This directory (`infra/terraform/environments/production/`) is **deprecated**.

## Why Deprecated

This configuration used:
- **Environment key:** `production`
- **Region:** `me-south-1` (Middle East South)
- **ECR repository:** `aqliya/production/app`

These are no longer the active production configuration.

## Active Configuration

Use instead: **`infra/terraform/environments/prod/`**

The active production environment:
- Uses `prod` for Terraform env key, ECR repos, and ECS clusters
- Deploys to `eu-north-1`
- Uses `aqliya/prod/app` ECR repository

See `infra/terraform/environments/prod/README.md` for the full naming convention.

## Migration Note

This directory is kept for historical reference. If you need to restore from this config:
1. Update `environment` from `"production"` to `"prod"` 
2. Update region from `me-south-1` to `eu-north-1`
3. Update `container_image` with real AWS account ID
4. Align with the active naming convention documented in `prod/README.md`
