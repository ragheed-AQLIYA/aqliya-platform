terraform {
  backend "s3" {
    bucket         = "aqliya-terraform-state"
    key            = "dev/terraform.tfstate"
    region         = "me-south-1"
    encrypt        = true
    dynamodb_table = "aqliya-terraform-locks"
  }
}
