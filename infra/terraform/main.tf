# AQLIYA Platform — Infrastructure as Code
# Root composition that assembles all modules for the target environment.
# Apply with: terraform apply -var-file=environments/<env>/terraform.tfvars

# ─── Networking ───

module "networking" {
  source = "./modules/networking"

  project_name        = var.project_name
  environment         = var.environment
  vpc_cidr            = var.vpc_cidr
  availability_zones  = var.availability_zones
  private_subnet_cidrs  = var.private_subnet_cidrs
  public_subnet_cidrs   = var.public_subnet_cidrs
  database_subnet_cidrs = var.database_subnet_cidrs
  container_port     = var.container_port
}

# ─── Database ───

module "database" {
  source = "./modules/database"

  project_name              = var.project_name
  environment               = var.environment
  db_subnet_group_name      = module.networking.db_subnet_group_name
  rds_security_group_id     = module.networking.rds_security_group_id
  db_instance_class         = var.db_instance_class
  db_allocated_storage      = var.db_allocated_storage
  db_max_allocated_storage  = var.db_max_allocated_storage
  db_multi_az               = var.db_multi_az
  db_deletion_protection    = var.db_deletion_protection
  db_backup_retention_days  = var.db_backup_retention_days
  db_engine_version         = var.db_engine_version
  db_parameter_group_family = var.db_parameter_group_family
  enable_cross_region_dr    = var.enable_cross_region_dr
  dr_region                = var.dr_region
}

# ─── Compute (ECS Fargate + ALB + Redis) ───

module "compute" {
  source = "./modules/compute"

  project_name         = var.project_name
  environment          = var.environment
  private_subnet_ids   = module.networking.private_subnet_ids
  ecs_security_group_id = module.networking.ecs_security_group_id
  alb_security_group_id = module.networking.alb_security_group_id
  public_subnet_ids    = module.networking.public_subnet_ids
  ecs_task_cpu         = var.ecs_task_cpu
  ecs_task_memory      = var.ecs_task_memory
  ecs_desired_count    = var.ecs_desired_count
  ecs_max_count        = var.ecs_max_count
  ecs_min_count        = var.ecs_min_count
  container_port       = var.container_port
  container_image      = var.container_image
  domain_name          = var.domain_name
  log_retention_days   = var.log_retention_days
  redis_node_type      = var.redis_node_type
  redis_num_cache_nodes = var.redis_num_cache_nodes
  redis_security_group_id = module.networking.redis_security_group_id
  vpc_id               = module.networking.vpc_id
}

# ─── Storage (S3 + CloudFront) ───

module "storage" {
  source = "./modules/storage"

  project_name    = var.project_name
  environment     = var.environment
  domain_name     = var.domain_name
  s3_upload_bucket_name = var.s3_upload_bucket_name
  s3_static_bucket_name = var.s3_static_bucket_name
  alb_dns_name    = module.compute.alb_dns_name
}

# ─── Monitoring (CloudWatch + Alarms + Backup) ───

module "monitoring" {
  source = "./modules/monitoring"

  project_name            = var.project_name
  environment             = var.environment
  log_retention_days      = var.log_retention_days
  db_backup_retention_days = var.db_backup_retention_days
  ecs_cluster_name        = module.compute.ecs_cluster_name
  ecs_service_name        = module.compute.ecs_service_name
  rds_arn                 = module.database.rds_arn
  alb_arn_suffix          = module.compute.alb_arn_suffix
}
