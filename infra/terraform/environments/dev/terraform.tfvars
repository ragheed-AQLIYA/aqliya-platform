environment        = "dev"
domain_name        = "dev.aqliya.com"
aws_region         = "eu-north-1"
availability_zones = ["eu-north-1a", "eu-north-1b", "eu-north-1c"]

container_image = "308621094029.dkr.ecr.eu-north-1.amazonaws.com/aqliya/dev/app:latest"

s3_upload_bucket_name = "aqliya-dev-uploads"
s3_static_bucket_name = "aqliya-dev-static"

# HA/DR
db_multi_az              = false
db_deletion_protection   = false
db_backup_retention_days = 1
enable_cross_region_dr   = false

# RDS (free-tier compatible for dev)
db_instance_class        = "db.t4g.micro"
db_allocated_storage     = 20
db_max_allocated_storage = 20
db_engine_version        = "16.14"

# Compute
ecs_task_cpu      = 512
ecs_task_memory   = 1024
ecs_desired_count = 1
ecs_max_count     = 2
ecs_min_count     = 1

# Redis
redis_node_type       = "cache.t4g.small"
redis_num_cache_nodes = 1

# Set to true once DNS delegation + ACM validation complete
domain_ready = true