terraform {
  required_version = ">= 1.6, < 2.0"

  # Backend configured per environment via -backend-config=environments/<env>/backend.tf
  # dev:  S3 key = dev/terraform.tfstate
  # prod: S3 key = prod/terraform.tfstate

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.80"
    }
  }
}
