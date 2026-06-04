variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "me-south-1"
}

variable "environment" {
  description = "Deployment environment (dev, staging, production)"
  type        = string
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "aqliya"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of AZs to deploy across"
  type        = list(string)
  default     = ["me-south-1a", "me-south-1b", "me-south-1c"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets (one per AZ)"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets (one per AZ)"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}

variable "database_subnet_cidrs" {
  description = "CIDR blocks for database subnets (one per AZ)"
  type        = list(string)
  default     = ["10.0.201.0/24", "10.0.202.0/24", "10.0.203.0/24"]
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.medium"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 100
}

variable "db_max_allocated_storage" {
  description = "RDS maximum autoscaling storage in GB"
  type        = number
  default     = 500
}

variable "db_multi_az" {
  description = "Enable Multi-AZ for RDS"
  type        = bool
  default     = false
}

variable "db_deletion_protection" {
  description = "Enable deletion protection on RDS"
  type        = bool
  default     = false
}

variable "db_backup_retention_days" {
  description = "RDS backup retention period in days"
  type        = number
  default     = 7
}

variable "db_engine_version" {
  description = "PostgreSQL engine version"
  type        = string
  default     = "16.3"
}

variable "db_parameter_group_family" {
  description = "RDS parameter group family"
  type        = string
  default     = "postgres16"
}

variable "ecs_task_cpu" {
  description = "ECS task CPU units"
  type        = number
  default     = 512
}

variable "ecs_task_memory" {
  description = "ECS task memory in MB"
  type        = number
  default     = 1024
}

variable "ecs_desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 2
}

variable "ecs_max_count" {
  description = "Maximum number of ECS tasks for autoscaling"
  type        = number
  default     = 6
}

variable "ecs_min_count" {
  description = "Minimum number of ECS tasks for autoscaling"
  type        = number
  default     = 2
}

variable "container_port" {
  description = "Container port for the Next.js app"
  type        = number
  default     = 3000
}

variable "container_image" {
  description = "Docker image URI for the Next.js app"
  type        = string
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
}

variable "allowed_cidrs_https" {
  description = "CIDR blocks allowed for HTTPS access"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 30
}

variable "s3_upload_bucket_name" {
  description = "Name for the file upload S3 bucket"
  type        = string
}

variable "s3_static_bucket_name" {
  description = "Name for the static assets S3 bucket"
  type        = string
}

variable "enable_cross_region_dr" {
  description = "Enable cross-region DR snapshot copy"
  type        = bool
  default     = false
}

variable "dr_region" {
  description = "DR region for cross-region snapshot copy"
  type        = string
  default     = "eu-central-1"
}

variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t4g.small"
}

variable "redis_num_cache_nodes" {
  description = "Number of Redis cache nodes"
  type        = number
  default     = 1
}
