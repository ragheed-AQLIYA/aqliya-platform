# ═══════════════════════════════════════════════════════════════════════════
# ⚠️ DEPRECATED DIRECTORY — DO NOT DEPLOY FROM HERE (ADR-108 / P0 2026-07-19)
# Canonical production Terraform: infra/terraform/environments/prod/
# This file is historical reference only (me-south-1 / "production" naming).
# ═══════════════════════════════════════════════════════════════════════════

environment = "production"
domain_name = "aqliya.com"

# ⚠️ CRITICAL: Replace <ACCOUNT_ID> with real AWS account ID before deploy
# Get it from: aws sts get-caller-identity --query Account --output text
container_image = "<ACCOUNT_ID>.dkr.ecr.me-south-1.amazonaws.com/aqliya/production/app:latest"

s3_upload_bucket_name = "aqliya-production-uploads"
s3_static_bucket_name = "aqliya-production-static"

# HA/DR
db_multi_az              = true
db_deletion_protection   = true
db_backup_retention_days = 30
# Set to true 24h+ after first production deploy (requires automated snapshot to exist)
enable_cross_region_dr = false
dr_region              = "eu-central-1"

# Compute
ecs_task_cpu      = 1024
ecs_task_memory   = 2048
ecs_desired_count = 3
ecs_max_count     = 10
ecs_min_count     = 3

# Redis
redis_node_type       = "cache.r6g.large"
redis_num_cache_nodes = 2
