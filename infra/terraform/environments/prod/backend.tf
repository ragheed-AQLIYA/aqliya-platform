bucket         = "aqliya-terraform-state"
key            = "prod/terraform.tfstate"
region         = "eu-north-1"
encrypt        = true
dynamodb_table = "aqliya-terraform-locks"
