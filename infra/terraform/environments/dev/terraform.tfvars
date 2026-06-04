environment   = "dev"
domain_name   = "dev.aqliya.ai"

container_image = "123456789012.dkr.ecr.me-south-1.amazonaws.com/aqliya/dev/app:latest"

s3_upload_bucket_name = "aqliya-dev-uploads"
s3_static_bucket_name = "aqliya-dev-static"

# HA/DR
db_multi_az              = false
db_deletion_protection   = false
db_backup_retention_days = 3
enable_cross_region_dr   = false

# Compute
ecs_task_cpu       = 256
ecs_task_memory    = 512
ecs_desired_count  = 1
ecs_max_count      = 2
ecs_min_count      = 1

# Redis
redis_node_type       = "cache.t4g.small"
redis_num_cache_nodes = 1
