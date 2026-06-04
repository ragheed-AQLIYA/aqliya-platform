output "vpc_id" {
  description = "VPC ID"
  value       = module.networking.vpc_id
}

output "alb_dns_name" {
  description = "ALB DNS name"
  value       = module.compute.alb_dns_name
}

output "cloudfront_domain" {
  description = "CloudFront distribution domain"
  value       = module.storage.cloudfront_domain
}

output "rds_endpoint" {
  description = "RDS primary endpoint"
  value       = module.database.rds_endpoint
  sensitive   = true
}

output "rds_reader_endpoint" {
  description = "RDS reader endpoint (read replica)"
  value       = module.database.rds_reader_endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = module.compute.redis_endpoint
  sensitive   = true
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.compute.ecs_cluster_name
}

output "ecs_service_name" {
  description = "ECS service name"
  value       = module.compute.ecs_service_name
}

output "s3_upload_bucket" {
  description = "S3 upload bucket name"
  value       = module.storage.upload_bucket_id
}

output "s3_static_bucket" {
  description = "S3 static assets bucket name"
  value       = module.storage.static_bucket_id
}

output "ecr_repository_url" {
  description = "ECR repository URL"
  value       = module.compute.ecr_repository_url
}

output "cloudwatch_dashboard_name" {
  description = "CloudWatch dashboard name"
  value       = module.monitoring.dashboard_name
}

output "backup_vault_name" {
  description = "AWS Backup vault name"
  value       = module.monitoring.backup_vault_name
}
