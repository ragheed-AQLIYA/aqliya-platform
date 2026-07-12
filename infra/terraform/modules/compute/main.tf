variable "project_name" { type = string }
variable "environment" { type = string }
variable "private_subnet_ids" { type = list(string) }
variable "ecs_security_group_id" { type = string }
variable "alb_security_group_id" { type = string }
variable "public_subnet_ids" { type = list(string) }
variable "ecs_task_cpu" { type = number }
variable "ecs_task_memory" { type = number }
variable "ecs_desired_count" { type = number }
variable "ecs_max_count" { type = number }
variable "ecs_min_count" { type = number }
variable "container_port" { type = number }
variable "container_image" { type = string }
variable "domain_name" { type = string }
variable "domain_ready" { type = bool }
variable "log_retention_days" { type = number }
variable "redis_node_type" { type = string }
variable "redis_num_cache_nodes" { type = number }
variable "redis_security_group_id" { type = string }
variable "vpc_id" { type = string }

resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-${var.environment}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-cluster"
  }
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name = aws_ecs_cluster.main.name

  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
    base              = 1
  }
}

resource "aws_ecr_repository" "app" {
  name                 = "${var.project_name}/${var.environment}/app"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-ecr"
  }
}

resource "aws_ecr_lifecycle_policy" "app" {
  repository = aws_ecr_repository.app.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 30 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 30
      }
      action = {
        type = "expire"
      }
    }]
  })
}

data "aws_iam_policy_document" "ecs_task_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "ecs_task_execution" {
  statement {
    actions = [
      "ecr:GetAuthorizationToken",
      "ecr:BatchCheckLayerAvailability",
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage",
    ]
    resources = ["*"]
  }

  statement {
    actions   = ["logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["arn:aws:logs:*:*:*"]
  }

  statement {
    actions   = ["secretsmanager:GetSecretValue"]
    resources = ["arn:aws:secretsmanager:*:*:secret:*"]
  }

  statement {
    actions   = ["ssm:GetParameters"]
    resources = ["*"]
  }

  statement {
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:ListBucket",
    ]
    resources = ["arn:aws:s3:::*"]
  }
}

resource "aws_iam_role" "ecs_task_execution" {
  name               = "${var.project_name}-${var.environment}-ecs-execution"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume.json

  tags = {
    Name = "${var.project_name}-${var.environment}-ecs-execution"
  }
}

resource "aws_iam_role_policy" "ecs_task_execution" {
  name   = "${var.project_name}-${var.environment}-ecs-execution-policy"
  role   = aws_iam_role.ecs_task_execution.id
  policy = data.aws_iam_policy_document.ecs_task_execution.json
}

resource "aws_iam_role" "ecs_task" {
  name               = "${var.project_name}-${var.environment}-ecs-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume.json

  tags = {
    Name = "${var.project_name}-${var.environment}-ecs-task"
  }
}

resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/${var.project_name}-${var.environment}"
  retention_in_days = var.log_retention_days

  tags = {
    Name = "${var.project_name}-${var.environment}-ecs-logs"
  }
}

resource "aws_ecs_task_definition" "app" {
  family                   = "${var.project_name}-${var.environment}-app"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.ecs_task_cpu
  memory                   = var.ecs_task_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name  = "app"
      image = var.container_image
      portMappings = [
        {
          containerPort = var.container_port
          hostPort      = var.container_port
          protocol      = "tcp"
        }
      ]
      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "APP_ENV", value = var.environment },
        { name = "NEXT_PUBLIC_DEPLOY_ENV", value = var.environment },
        { name = "DOMAIN_NAME", value = var.domain_name },
        { name = "RATE_LIMITER", value = "redis" },
        { name = "SCANNER_PROVIDER", value = "clamav" },
        { name = "CLAMAV_HOST", value = "127.0.0.1" },
        { name = "CLAMAV_PORT", value = "3310" },
        { name = "FF_AI_RAG", value = "true" },
        { name = "FF_AI_REAL_PROVIDERS", value = var.environment == "production" ? "false" : "true" },
        { name = "FF_QUEUE_ENABLED", value = "true" },
        { name = "FF_TENANT_LIFECYCLE", value = var.environment == "production" ? "true" : "false" },
        { name = "S3_REGION", value = data.aws_region.current.name },
        { name = "S3_ENDPOINT", value = "https://s3.${data.aws_region.current.name}.amazonaws.com" },
      ]
      secrets = [
        { name = "DATABASE_URL", valueFrom = data.aws_secretsmanager_secret.app["database-url"].arn },
        { name = "REDIS_URL", valueFrom = data.aws_secretsmanager_secret.app["redis-url"].arn },
        { name = "AUTH_SECRET", valueFrom = data.aws_secretsmanager_secret.app["auth-secret"].arn },
        { name = "NEXTAUTH_SECRET", valueFrom = data.aws_secretsmanager_secret.app["auth-secret"].arn },
        # Individual secrets (ECS passes raw value; JSON blobs would break plain env var reads)
        { name = "STORAGE_PROVIDER", valueFrom = data.aws_secretsmanager_secret.app["storage-provider"].arn },
        { name = "S3_BUCKET", valueFrom = data.aws_secretsmanager_secret.app["s3-bucket"].arn },
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "ecs"
        }
      }
      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:${var.container_port}/api/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
      dependsOn = []
    },
    {
      name      = "clamav"
      image     = "clamav/clamav:1.3"
      essential = true
      cpu       = 128
      memory    = 256
      portMappings = [
        {
          containerPort = 3310
          hostPort      = 3310
          protocol      = "tcp"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "clamav"
        }
      }
      healthCheck = {
        command     = ["CMD-SHELL", "clamdcheck.sh || exit 1"]
        interval    = 30
        timeout     = 10
        retries     = 3
        startPeriod = 120
      }
    },
  ])
}

data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

locals {
  secret_names = toset([
    "database-url", "redis-url", "auth-secret", "storage-provider",
    "s3-bucket", "scim-api-key", "sso-config", "google-oauth",
    "github-oauth", "azure-ad-oauth", "okta-oauth", "oidc-config",
  ])
  has_cert = try(data.aws_acm_certificate.main.arn, null) != null
}

data "aws_secretsmanager_secret" "app" {
  for_each = local.secret_names
  name     = "${var.project_name}/${var.environment}/${each.key}"
}

resource "aws_lb" "main" {
  name               = "${var.project_name}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_security_group_id]
  subnets            = var.public_subnet_ids

  enable_deletion_protection = var.environment == "production"

  tags = {
    Name = "${var.project_name}-${var.environment}-alb"
  }
}

resource "aws_lb_target_group" "app" {
  name        = "${var.project_name}-${var.environment}-tg"
  port        = var.container_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    path                = "/api/health"
    port                = var.container_port
    protocol            = "HTTP"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
    timeout             = 5
    matcher             = "200"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-tg"
  }
}

# HTTPS listener — enabled when domain is ready (DNS + ACM validated)
resource "aws_lb_listener" "https" {
  count             = var.domain_ready ? 1 : 0
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = data.aws_acm_certificate.main.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}

# HTTP listener — prod mode: redirect to HTTPS
resource "aws_lb_listener" "http_redirect" {
  count             = var.environment == "production" ? 1 : 0
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# HTTP listener — dev mode: forward directly to target group (no HTTPS)
resource "aws_lb_listener" "http_forward" {
  count             = var.environment != "production" ? 1 : 0
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}

data "aws_acm_certificate" "main" {
  domain   = var.domain_name
  statuses = ["ISSUED", "PENDING_VALIDATION"]
}

resource "aws_ecs_service" "app" {
  name            = "${var.project_name}-${var.environment}-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = var.ecs_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.ecs_security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "app"
    container_port   = var.container_port
  }

  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200

  health_check_grace_period_seconds = 60

  enable_execute_command = var.environment != "production"

  tags = {
    Name = "${var.project_name}-${var.environment}-service"
  }
}

resource "aws_appautoscaling_target" "ecs" {
  max_capacity       = var.ecs_max_count
  min_capacity       = var.ecs_min_count
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.app.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "cpu" {
  name               = "${var.project_name}-${var.environment}-cpu-autoscaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 70
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}

resource "aws_appautoscaling_policy" "memory" {
  name               = "${var.project_name}-${var.environment}-memory-autoscaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
    target_value       = 75
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}

resource "aws_elasticache_subnet_group" "redis" {
  name       = "${var.project_name}-${var.environment}-redis-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "${var.project_name}-${var.environment}-redis-subnet-group"
  }
}

resource "aws_elasticache_replication_group" "redis" {
  replication_group_id = "${var.project_name}-${var.environment}-redis-rg"
  description          = "AQLIYA ${var.environment} Redis"
  engine               = "redis"
  engine_version       = "7.1"
  node_type            = var.redis_node_type
  parameter_group_name = "default.redis7"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.redis.name
  security_group_ids   = [var.redis_security_group_id]

  # Production environment detection: both "production" and "prod" env keys are valid.
  num_cache_clusters            = var.redis_num_cache_nodes
  automatic_failover_enabled    = var.environment == "production" || var.environment == "prod"
  multi_az_enabled              = var.environment == "production" || var.environment == "prod"

  # Security hardening (2026-07-12): enable encryption in transit and at rest
  transit_encryption_enabled = true
  at_rest_encryption_enabled = true

  apply_immediately = var.environment != "production" && var.environment != "prod"

  tags = {
    Name = "${var.project_name}-${var.environment}-redis"
  }
}

# ─── Route53 DNS ───

data "aws_route53_zone" "main" {
  name = var.domain_name
}

resource "aws_route53_record" "root" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "wildcard" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "*.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

output "alb_dns_name" { value = aws_lb.main.dns_name }
output "alb_arn" { value = aws_lb.main.arn }
output "alb_arn_suffix" { value = aws_lb.main.arn_suffix }
output "ecs_cluster_name" { value = aws_ecs_cluster.main.name }
output "ecs_service_name" { value = aws_ecs_service.app.name }
output "ecr_repository_url" { value = aws_ecr_repository.app.repository_url }
output "redis_endpoint" { value = aws_elasticache_replication_group.redis.primary_endpoint_address }