# Production Environment Configuration

**Status:** Active ✅  
**Convention:** `prod` for Terraform env key, ECR repos, ECS clusters  
**Region:** eu-north-1

## Naming Convention

This repository uses **two distinct naming conventions** for the production environment:

| Context | Convention | Example |
|---------|-----------|---------|
| **Terraform env key** | `prod` | `environment = "prod"` |
| **ECR repository** | `aqliya/prod/app` | deploy.yml, CI/CD |
| **ECS cluster** | `aqliya-prod-cluster` | `ECS_CLUSTER` env var |
| **ECS service** | `aqliya-prod-service` | `ECS_SERVICE` env var |
| **GitHub Environment** | `production` | `environment: production` in workflows |
| **S3 bucket** | `aqliya-prod-*` | uploaded assets |

**Why two conventions?**
- `prod` (short form) keeps ECR/ECS resource names concise and aligns with the Terraform source directory naming.
- `production` (full form) is used only for GitHub Environment names, matching the `workflow_dispatch` input options.

## Deprecated Directory

The `infra/terraform/environments/production/` directory is **deprecated**. It used:
- Environment key: `production`
- Region: `me-south-1`
- ECR: `aqliya/production/app`

It is kept for historical reference only. Do not deploy from it.

## Related Files
- `deploy.yml` — uses `prod` convention for ECR/ECS
- `promote.yml` — uses `production` convention for GitHub Environment, `prod` for ECR/ECS (aligned 2026-07-12)
- `compute/main.tf` — detects both `"prod"` and `"production"` for failover/Multi-AZ
