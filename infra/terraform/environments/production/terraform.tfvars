environment   = "production"
domain_name   = "aqliya.com"

container_image = "123456789012.dkr.ecr.me-south-1.amazonaws.com/aqliya/production/app:latest"

s3_upload_bucket_name = "aqliya-production-uploads"
s3_static_bucket_name = "aqliya-production-static"

# HA/DR
db_multi_az              = true
db_deletion_protection   = true
db_backup_retention_days = 30
enable_cross_region_dr   = true
dr_region                = "eu-central-1"

# Compute
ecs_task_cpu       = 1024
ecs_task_memory    = 2048
ecs_desired_count  = 3
ecs_max_count      = 10
ecs_min_count      = 3

# Redis
redis_node_type        = "cache.r6g.large"
redis_num_cache_nodes  = 2
