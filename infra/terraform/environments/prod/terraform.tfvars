# AQLIYA Production Environment
# =============================
# Derived from dev baseline (2026-07-08).
# Set domain_ready = true only after ACM validation + DNS propagation.

environment = "prod"
domain_name = "app.aqliya.com" # Product application
# aqliya.com reserved for marketing/corporate site
aws_region            = "eu-north-1"
availability_zones    = ["eu-north-1a", "eu-north-1b", "eu-north-1c"]
private_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
public_subnet_cidrs   = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
database_subnet_cidrs = ["10.0.201.0/24", "10.0.202.0/24", "10.0.203.0/24"]

# Container image — push to this repo before deployment
container_image = "308621094029.dkr.ecr.eu-north-1.amazonaws.com/aqliya/prod/app:latest"

# ECR image pushed: sha256:10a2091f5b887319a550c84f0a21cfe84512eddaa47bf7ba692c836af0ec661b

# S3 buckets
s3_upload_bucket_name = "aqliya-prod-uploads"
s3_static_bucket_name = "aqliya-prod-static"

# ─────────────────────────────────────────────
# Database — production grade
# ─────────────────────────────────────────────
# Note: The RDS values below were originally set to free-tier limits.
# As of 2026-07-10 Hardening Fix Pack, the settings that do not require
# an AWS account upgrade have been hardened to production-safe values.
# The remaining free-tier-limited values are marked with ACCOUNT-BLOCKED.
db_instance_class        = "db.t4g.micro"   # ACCOUNT-BLOCKED: free-tier limit. Requires AWS account upgrade to db.t4g.medium
db_allocated_storage     = 20               # ACCOUNT-BLOCKED: free-tier limit. Requires AWS account upgrade to 100
db_max_allocated_storage = 20               # ACCOUNT-BLOCKED: free-tier limit. Requires AWS account upgrade to 500
db_multi_az              = true             # Hardened 2026-07-10: enabled. (t4g.micro supports Multi-AZ; verify cost)
db_deletion_protection   = true             # Hardened 2026-07-10: enabled. No account upgrade needed.
db_backup_retention_days = 30               # Hardened 2026-07-10: increased from 0. No account upgrade needed.
db_engine_version        = "16.14"

# ─────────────────────────────────────────────
# Compute — scaled for production
# ─────────────────────────────────────────────
ecs_task_cpu      = 1024 # 1 vCPU
ecs_task_memory   = 2048 # 2 GB RAM
ecs_desired_count = 2    # Minimum 2 for HA
ecs_max_count     = 10   # Autoscaling ceiling
ecs_min_count     = 2    # Minimum for HA

# ─────────────────────────────────────────────
# Redis — production sizing
# ─────────────────────────────────────────────
redis_node_type       = "cache.t4g.small" # Production: 2-node replication group with automatic failover
redis_num_cache_nodes = 2

# ─────────────────────────────────────────────
# HA / DR
# ─────────────────────────────────────────────
enable_cross_region_dr = true
dr_region              = "eu-central-1" # Frankfurt — cross-region DR

domain_ready = true # ✅ DNS delegation + ACM validated — CloudFront + WAF active

# ─────────────────────────────────────────────
# REMAINING POST-LAUNCH UPGRADE TARGETS
# Items 1–3 are still blocked by AWS free-tier account limits.
# Items 4–6 were resolved in the 2026-07-10 Hardening Fix Pack.
# After AWS account upgrade from free tier:
#   1. db_instance_class        → "db.t4g.medium"    # ACCOUNT-BLOCKED
#   2. db_allocated_storage     → 100                 # ACCOUNT-BLOCKED
#   3. db_max_allocated_storage → 500                 # ACCOUNT-BLOCKED
#   4. db_multi_az              → true  ✅ HARDENED 2026-07-10
#   5. db_deletion_protection   → true  ✅ HARDENED 2026-07-10
#   6. db_backup_retention_days → 30    ✅ HARDENED 2026-07-10
#   7. redis_node_type          → "cache.t7g.medium"  # Performance upgrade
#   8. enable_cross_region_dr   → true (already set)
# ─────────────────────────────────────────────
