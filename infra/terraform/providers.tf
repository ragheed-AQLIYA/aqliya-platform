# ─── Default provider (primary region) ───

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = var.environment
      Product     = "AQLIYA"
      ManagedBy   = "terraform"
    }
  }
}

# ─── us-east-1 — CloudFront + ACM certificates ───

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Environment = var.environment
      Product     = "AQLIYA"
      ManagedBy   = "terraform"
    }
  }
}

# ─── DR region — cross-region snapshot copy ───

provider "aws" {
  alias  = "dr"
  region = var.dr_region

  default_tags {
    tags = {
      Environment = var.environment
      Product     = "AQLIYA"
      ManagedBy   = "terraform"
    }
  }
}
