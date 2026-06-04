variable "project_name"          { type = string }
variable "environment"            { type = string }
variable "db_subnet_group_name"   { type = string }
variable "rds_security_group_id"  { type = string }
variable "db_instance_class"      { type = string }
variable "db_allocated_storage"   { type = number }
variable "db_max_allocated_storage" { type = number }
variable "db_multi_az"            { type = bool }
variable "db_deletion_protection" { type = bool }
variable "db_backup_retention_days" { type = number }
variable "db_engine_version"       { type = string }
variable "db_parameter_group_family" { type = string }
variable "enable_cross_region_dr" { type = bool }
variable "dr_region"              { type = string }

resource "aws_db_parameter_group" "postgres" {
  name        = "${var.project_name}-${var.environment}-pg16"
  family      = var.db_parameter_group_family
  description = "Custom parameter group for AQLIYA PostgreSQL 16"

  parameter {
    name  = "log_statement"
    value = "ddl"
  }

  parameter {
    name         = "shared_preload_libraries"
    value        = "pg_stat_statements"
    apply_method = "pending-reboot"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-pg16"
  }
}

resource "aws_db_instance" "primary" {
  identifier     = "${var.project_name}-${var.environment}-db"
  engine         = "postgres"
  engine_version = var.db_engine_version

  instance_class        = var.db_instance_class
  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_max_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = "aqliya"
  username = "aqliya_admin"
  password = data.aws_secretsmanager_secret_version.db_password.secret_string

  db_subnet_group_name   = var.db_subnet_group_name
  vpc_security_group_ids = [var.rds_security_group_id]

  multi_az               = var.db_multi_az
  deletion_protection    = var.db_deletion_protection
  backup_retention_period = var.db_backup_retention_days
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:05:00-sun:06:00"

  parameter_group_name = aws_db_parameter_group.postgres.name

  skip_final_snapshot     = var.environment == "production" ? false : true
  final_snapshot_identifier = var.environment == "production" ? "${var.project_name}-${var.environment}-db-final-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  tags = {
    Name = "${var.project_name}-${var.environment}-db"
  }
}

data "aws_secretsmanager_secret" "db_password" {
  name = "${var.project_name}/${var.environment}/db-password"
}

data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = data.aws_secretsmanager_secret.db_password.id
}

resource "aws_db_instance" "read_replica" {
  count = var.environment == "production" ? 1 : 0

  identifier     = "${var.project_name}-${var.environment}-db-replica"
  engine         = "postgres"
  engine_version = var.db_engine_version

  instance_class        = var.db_instance_class
  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_max_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true

  username = "aqliya_admin"
  password = data.aws_secretsmanager_secret_version.db_password.secret_string

  vpc_security_group_ids = [var.rds_security_group_id]

  replicate_source_db = aws_db_instance.primary.identifier

  backup_retention_period = var.db_backup_retention_days
  backup_window           = "04:00-05:00"

  skip_final_snapshot     = true
  parameter_group_name    = aws_db_parameter_group.postgres.name

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  tags = {
    Name = "${var.project_name}-${var.environment}-db-replica"
  }
}

resource "aws_db_snapshot_copy" "cross_region_dr" {
  count = var.enable_cross_region_dr && var.environment == "production" ? 1 : 0

  provider = aws.dr

  source_db_snapshot_identifier = aws_db_instance.primary.latest_snapshot
  target_snapshot_identifier    = "${var.project_name}-${var.environment}-dr-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"
  destination_region            = var.dr_region

  tags = {
    Name = "${var.project_name}-${var.environment}-dr-snapshot"
  }
}

output "rds_endpoint" {
  value = aws_db_instance.primary.endpoint
}

output "rds_reader_endpoint" {
  value = var.environment == "production" ? aws_db_instance.read_replica[0].endpoint : aws_db_instance.primary.endpoint
}

output "rds_arn" {
  value = aws_db_instance.primary.arn
}
