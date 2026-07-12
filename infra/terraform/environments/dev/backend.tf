terraform {
  backend "s3" {
    bucket         = "aqliya-terraform-state"
    key            = "dev/terraform.tfstate"
    region         = "eu-north-1"
    encrypt        = true
    dynamodb_table = "aqliya-terraform-locks"
  }
}
