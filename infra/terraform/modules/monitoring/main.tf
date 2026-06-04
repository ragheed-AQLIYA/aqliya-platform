variable "project_name"             { type = string }
variable "environment"               { type = string }
variable "log_retention_days"        { type = number }
variable "db_backup_retention_days"  { type = number }
variable "ecs_cluster_name"          { type = string }
variable "ecs_service_name"          { type = string }
variable "rds_arn"                   { type = string }
variable "alb_arn_suffix"            { type = string }

resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project_name}-${var.environment}-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ECS", "CPUUtilization", { stat = "Average" }],
            ["AWS/ECS", "MemoryUtilization", { stat = "Average" }],
          ]
          period = 300
          stat   = "Average"
          region = data.aws_region.current.name
          title  = "ECS CPU / Memory"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/RDS", "CPUUtilization", { stat = "Average" }],
            ["AWS/RDS", "DatabaseConnections", { stat = "Average" }],
            ["AWS/RDS", "FreeStorageSpace", { stat = "Average" }],
          ]
          period = 300
          stat   = "Average"
          region = data.aws_region.current.name
          title  = "RDS Metrics"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "TargetResponseTime", { stat = "Average" }],
            ["AWS/ApplicationELB", "RequestCount", { stat = "Sum" }],
            ["AWS/ApplicationELB", "HTTPCode_Target_5XX", { stat = "Sum" }],
          ]
          period = 300
          stat   = "Average"
          region = data.aws_region.current.name
          title  = "ALB Metrics"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ElastiCache", "CPUUtilization", { stat = "Average" }],
            ["AWS/ElastiCache", "CurrConnections", { stat = "Average" }],
            ["AWS/ElastiCache", "FreeableMemory", { stat = "Average" }],
          ]
          period = 300
          stat   = "Average"
          region = data.aws_region.current.name
          title  = "Redis Metrics"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            [{ expression: "m1 / m2", label: "Error Rate", id: "expr1", stat: "Average" }],
            ["AWS/ApplicationELB", "HTTPCode_Target_5XX", { id: "m1", stat: "Sum", visible: false }],
            ["AWS/ApplicationELB", "RequestCount",         { id: "m2", stat: "Sum", visible: false }],
          ]
          period = 300
          stat   = "Average"
          region = data.aws_region.current.name
          title  = "Error Rate (%)"
        }
      },
    ]
  })
}

data "aws_region" "current" {}

resource "aws_cloudwatch_metric_alarm" "ecs_cpu_high" {
  alarm_name          = "${var.project_name}-${var.environment}-ecs-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 300
  statistic           = "Average"
  threshold           = 85
  alarm_description   = "ECS CPU utilization above 85% for 15 minutes"
  alarm_actions       = [aws_sns_topic.alarms.arn]

  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = var.ecs_service_name
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-ecs-cpu-high"
  }
}

resource "aws_cloudwatch_metric_alarm" "rds_cpu_high" {
  alarm_name          = "${var.project_name}-${var.environment}-rds-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "RDS CPU utilization above 80% for 15 minutes"
  alarm_actions       = [aws_sns_topic.alarms.arn]

  dimensions = {
    DBInstanceIdentifier = var.project_name
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-rds-cpu-high"
  }
}

resource "aws_cloudwatch_metric_alarm" "rds_free_storage" {
  alarm_name          = "${var.project_name}-${var.environment}-rds-free-storage"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 10737418240
  alarm_description   = "RDS free storage below 10GB"
  alarm_actions       = [aws_sns_topic.alarms.arn]

  dimensions = {
    DBInstanceIdentifier = var.project_name
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-rds-free-storage"
  }
}

resource "aws_cloudwatch_metric_alarm" "alb_5xx_high" {
  alarm_name          = "${var.project_name}-${var.environment}-alb-5xx-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HTTPCode_Target_5XX"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "ALB 5XX errors above 10 in 10 minutes"
  alarm_actions       = [aws_sns_topic.alarms.arn]

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-alb-5xx-high"
  }
}

resource "aws_cloudwatch_metric_alarm" "alb_high_latency" {
  alarm_name          = "${var.project_name}-${var.environment}-alb-high-latency"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  extended_statistic  = "p95"
  threshold           = 3
  alarm_description   = "ALB p95 latency above 3 seconds"
  alarm_actions       = [aws_sns_topic.alarms.arn]

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-alb-high-latency"
  }
}

resource "aws_sns_topic" "alarms" {
  name = "${var.project_name}-${var.environment}-alarms"

  tags = {
    Name = "${var.project_name}-${var.environment}-alarms"
  }
}

resource "aws_sns_topic_subscription" "alarm_email" {
  count     = var.environment == "production" ? 1 : 0
  topic_arn = aws_sns_topic.alarms.arn
  protocol  = "email"
  endpoint  = "ops@${var.domain_name}"
}

resource "aws_backup_vault" "main" {
  name        = "${var.project_name}-${var.environment}-backup-vault"
  kms_key_arn = aws_kms_key.backup.arn

  tags = {
    Name = "${var.project_name}-${var.environment}-backup-vault"
  }
}

resource "aws_kms_key" "backup" {
  description             = "KMS key for AWS Backup"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    Name = "${var.project_name}-${var.environment}-backup-kms"
  }
}

resource "aws_backup_plan" "main" {
  name = "${var.project_name}-${var.environment}-backup-plan"

  rule {
    rule_name         = "daily-backup"
    target_vault_name = aws_backup_vault.main.name
    schedule          = "cron(0 2 * * ? *)"
    start_window      = 60
    completion_window = 120

    lifecycle {
      delete_after = var.db_backup_retention_days
    }

    recovery_point_tags = {
      Environment = var.environment
      Product     = "AQLIYA"
    }
  }

  rule {
    rule_name         = "weekly-backup"
    target_vault_name = aws_backup_vault.main.name
    schedule          = "cron(0 3 * * SUN ? *)"
    start_window      = 60
    completion_window = 120

    lifecycle {
      delete_after = var.db_backup_retention_days * 4
    }

    recovery_point_tags = {
      Environment = var.environment
      Product     = "AQLIYA"
    }
  }

  rule {
    rule_name         = "monthly-backup"
    target_vault_name = aws_backup_vault.main.name
    schedule          = "cron(0 4 1 * ? *)"
    start_window      = 60
    completion_window = 120

    lifecycle {
      delete_after = var.db_backup_retention_days * 12
    }

    recovery_point_tags = {
      Environment = var.environment
      Product     = "AQLIYA"
    }
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-backup-plan"
  }
}

resource "aws_backup_selection" "rds" {
  name         = "${var.project_name}-${var.environment}-backup-rds"
  plan_id      = aws_backup_plan.main.id
  iam_role_arn = aws_iam_role.backup.arn

  resources = [var.rds_arn]
}

resource "aws_iam_role" "backup" {
  name = "${var.project_name}-${var.environment}-backup-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "backup.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-${var.environment}-backup-role"
  }
}

resource "aws_iam_role_policy_attachment" "backup" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForBackup"
  role       = aws_iam_role.backup.name
}

output "dashboard_name"   { value = aws_cloudwatch_dashboard.main.dashboard_name }
output "backup_vault_name" { value = aws_backup_vault.main.name }
output "sns_topic_arn"    { value = aws_sns_topic.alarms.arn }
