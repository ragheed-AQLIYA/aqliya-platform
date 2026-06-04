#!/usr/bin/env bash
set -euo pipefail

# ─── AQLIYA Terraform State Bootstrap ───
# Creates the S3 bucket and DynamoDB table that Terraform needs for remote state.
# Run this ONCE per AWS account before any `terraform init`.
#
# Usage:
#   ./bootstrap.sh [region]
#   Default region: me-south-1

REGION="${1:-me-south-1}"
BUCKET="aqliya-terraform-state"
TABLE="aqliya-terraform-locks"

echo "==> Bootstrapping Terraform backend in $REGION"

# ── S3 bucket ──
if aws s3api head-bucket --bucket "$BUCKET" --region "$REGION" 2>/dev/null; then
  echo "Bucket '$BUCKET' already exists — skipping creation"
else
  echo "Creating S3 bucket: $BUCKET"
  aws s3api create-bucket \
    --bucket "$BUCKET" \
    --region "$REGION" \
    --create-bucket-configuration LocationConstraint="$REGION" \
    --no-cli-pager

  aws s3api put-bucket-versioning \
    --bucket "$BUCKET" \
    --versioning-configuration Status=Enabled \
    --region "$REGION" \
    --no-cli-pager

  aws s3api put-bucket-encryption \
    --bucket "$BUCKET" \
    --server-side-encryption-configuration '{
      "Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}}]
    }' \
    --region "$REGION" \
    --no-cli-pager

  aws s3api put-public-access-block \
    --bucket "$BUCKET" \
    --public-access-block-configuration '{
      "BlockPublicAcls": true,
      "BlockPublicPolicy": true,
      "IgnorePublicAcls": true,
      "RestrictPublicBuckets": true
    }' \
    --region "$REGION" \
    --no-cli-pager

  echo "S3 bucket '$BUCKET' created and configured"
fi

# ── DynamoDB table ──
if aws dynamodb describe-table --table-name "$TABLE" --region "$REGION" --no-cli-pager 2>/dev/null; then
  echo "DynamoDB table '$TABLE' already exists — skipping creation"
else
  echo "Creating DynamoDB table: $TABLE"
  aws dynamodb create-table \
    --table-name "$TABLE" \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region "$REGION" \
    --no-cli-pager

  echo "DynamoDB table '$TABLE' created"
fi

echo ""
echo "==> Bootstrap complete."
echo "    Bucket:  s3://$BUCKET"
echo "    Table:   $TABLE"
echo ""
echo "You can now run: terraform init"
