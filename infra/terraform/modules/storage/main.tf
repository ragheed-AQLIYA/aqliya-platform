variable "project_name"   { type = string }
variable "environment"     { type = string }
variable "domain_name"     { type = string }
variable "s3_upload_bucket_name"  { type = string }
variable "s3_static_bucket_name"  { type = string }
variable "alb_dns_name"    { type = string }

resource "aws_s3_bucket" "uploads" {
  bucket = var.s3_upload_bucket_name

  tags = {
    Name = "${var.project_name}-${var.environment}-uploads"
  }
}

resource "aws_s3_bucket_versioning" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  rule {
    id     = "expire-old-uploads"
    status = "Enabled"

    expiration {
      days = 365
    }

    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }

  rule {
    id     = "glacier-transition"
    status = "Enabled"

    transition {
      days          = 90
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 365
      storage_class = "GLACIER"
    }
  }
}

resource "aws_s3_bucket" "static" {
  bucket = var.s3_static_bucket_name

  tags = {
    Name = "${var.project_name}-${var.environment}-static"
  }
}

resource "aws_s3_bucket_versioning" "static" {
  bucket = aws_s3_bucket.static.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "static" {
  bucket = aws_s3_bucket.static.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "cloudfront_access" {
  bucket = aws_s3_bucket.static.id
  policy = data.aws_iam_policy_document.cloudfront_access.json
}

data "aws_iam_policy_document" "cloudfront_access" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.static.arn}/*"]
    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.main.iam_arn]
    }
  }
}

resource "aws_cloudfront_origin_access_identity" "main" {
  comment = "${var.project_name}-${var.environment}-oai"
}

resource "aws_cloudfront_distribution" "main" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100"
  aliases             = ["static.${var.domain_name}"]

  origin {
    domain_name = aws_s3_bucket.static.bucket_regional_domain_name
    origin_id   = "staticS3"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.main.cloudfront_access_identity_path
    }
  }

  origin {
    domain_name = var.alb_dns_name
    origin_id   = "appALB"
    origin_path = ""

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id = "staticS3"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  ordered_cache_behavior {
    path_pattern     = "/_next/*"
    target_origin_id = "appALB"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000
    compress               = true
  }

  ordered_cache_behavior {
    path_pattern     = "/api/*"
    target_origin_id = "appALB"
    allowed_methods  = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]

    forwarded_values {
      query_string = true
      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "https-only"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = data.aws_acm_certificate.cloudfront.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-cloudfront"
  }
}

data "aws_acm_certificate" "cloudfront" {
  domain   = "*.${var.domain_name}"
  statuses = ["ISSUED"]
  provider = aws.us_east_1
}

# ─── WAFv2 for CloudFront ───

resource "aws_wafv2_web_acl" "cloudfront" {
  name        = "${var.project_name}-${var.environment}-waf"
  description = "WAF for AQLIYA CloudFront distribution"
  scope       = "CLOUDFRONT"
  provider    = aws.us_east_1

  default_action {
    allow {}
  }

  rule {
    name     = "rate-limit"
    priority = 0

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 5000
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name               = "${var.project_name}-${var.environment}-rate-limit"
      sampled_requests_enabled  = true
    }
  }

  rule {
    name     = "aws-managed-common"
    priority = 1

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesCommonRuleSet"

        excluded_rule {
          name = "SizeRestrictions_BODY"
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name               = "${var.project_name}-${var.environment}-common-rules"
      sampled_requests_enabled  = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name               = "${var.project_name}-${var.environment}-waf"
    sampled_requests_enabled  = true
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-waf"
  }
}

resource "aws_wafv2_web_acl_association" "cloudfront" {
  resource_arn = aws_cloudfront_distribution.main.arn
  web_acl_arn  = aws_wafv2_web_acl.cloudfront.arn
}

# ─── Route53 DNS ───

data "aws_route53_zone" "main" {
  name = var.domain_name
}

resource "aws_route53_record" "static" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "static.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.main.domain_name
    zone_id                = aws_cloudfront_distribution.main.hosted_zone_id
    evaluate_target_health = false
  }
}

output "upload_bucket_id"      { value = aws_s3_bucket.uploads.id }
output "upload_bucket_arn"     { value = aws_s3_bucket.uploads.arn }
output "static_bucket_id"      { value = aws_s3_bucket.static.id }
output "static_bucket_arn"     { value = aws_s3_bucket.static.arn }
output "cloudfront_domain"     { value = aws_cloudfront_distribution.main.domain_name }
output "cloudfront_dist_id"    { value = aws_cloudfront_distribution.main.id }
