environment   = "staging"
domain_name   = "staging.aqliya.ai"

container_image = "123456789012.dkr.ecr.me-south-1.amazonaws.com/aqliya/staging/app:latest"

s3_upload_bucket_name = "aqliya-staging-uploads"
s3_static_bucket_name = "aqliya-staging-static"

# HA/DR
db_multi_az              = false
db_deletion_protection   = false
db_backup_retention_days = 7
enable_cross_region_dr   = false

# Compute
ecs_task_cpu       = 512
ecs_task_memory    = 1024
ecs_desired_count  = 2
ecs_max_count      = 4
ecs_min_count      = 2

# Redis
redis_node_type       = "cache.t4g.small"
redis_num_cache_nodes = 1
