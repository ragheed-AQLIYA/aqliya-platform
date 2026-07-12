# ─── Default provider (primary region) ───

locals {
  common_tags = {
    Environment          = var.environment
    Product              = "AQLIYA"
    ManagedBy            = "terraform"
    "AQLIYA:application" = "aqliya-platform"
  }
}

# ─── Default provider (primary region: eu-north-1 Stockholm) ───

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.common_tags
  }
}

# ─── us-east-1 — CloudFront + ACM certificates ───

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = local.common_tags
  }
}

# ─── DR region — cross-region snapshot copy ───

provider "aws" {
  alias  = "dr"
  region = var.dr_region

  default_tags {
    tags = local.common_tags
  }
}
