#!/usr/bin/env bash
set -euo pipefail

# ─── AQLIYA Terraform Pre-flight Validation ───
# Run BEFORE terraform init/plan/apply to catch common issues.
#
# Usage:
#   ./preflight.sh [environment]
#   environment: dev, staging, or production (default: dev)
#
# Example:
#   ./preflight.sh production

ENV="${1:-dev}"
TFVARS="environments/${ENV}/terraform.tfvars"
REGION="eu-north-1"

echo "============================================"
echo "  AQLIYA Pre-flight Validation: ${ENV}"
echo "============================================"
echo ""

# ── Check tfvars exists ──
if [ ! -f "$TFVARS" ]; then
  echo "❌ CRITICAL: $TFVARS not found"
  exit 1
fi
echo "✅ tfvars file exists: $TFVARS"

# ── Check container_image placeholder ──
if grep -q '<ACCOUNT_ID>\|123456789012' "$TFVARS" 2>/dev/null; then
  echo "❌ CRITICAL: container_image contains placeholder in $TFVARS"
  echo "   Run: aws sts get-caller-identity --query Account --output text"
  echo "   Then update container_image in $TFVARS"
  exit 1
fi
echo "✅ container_image is not a placeholder"

# ── Check AWS CLI is configured ──
if ! aws sts get-caller-identity &>/dev/null; then
  echo "❌ CRITICAL: AWS CLI not configured or no credentials"
  echo "   Run: aws configure"
  exit 1
fi
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "✅ AWS CLI configured — Account: $ACCOUNT_ID"

# ── Check region accessible ──
if ! aws ec2 describe-regions --region "$REGION" --no-cli-pager &>/dev/null; then
  echo "⚠️  WARNING: Region $REGION not accessible — may need to enable it"
else
  echo "✅ Region $REGION accessible"
fi

# ── Check bootstrap state bucket ──
BUCKET="aqliya-terraform-state"
if aws s3api head-bucket --bucket "$BUCKET" --region "$REGION" 2>/dev/null; then
  echo "✅ State bucket exists: s3://$BUCKET"
else
  echo "⚠️  WARNING: State bucket s3://$BUCKET not found"
  echo "   Run: ./bootstrap.sh"
fi

# ── Check DynamoDB lock table ──
TABLE="aqliya-terraform-locks"
if aws dynamodb describe-table --table-name "$TABLE" --region "$REGION" --no-cli-pager &>/dev/null; then
  echo "✅ DynamoDB lock table exists: $TABLE"
else
  echo "⚠️  WARNING: DynamoDB lock table not found"
  echo "   Run: ./bootstrap.sh"
fi

# ── Check required Secrets Manager secrets ──
# 13 unique secrets → 24 env vars. ALL must exist before ECS task can start.
SECRETS=(
  "${ENV}/db-password"
  "${ENV}/database-url"
  "${ENV}/redis-url"
  "${ENV}/auth-secret"
  "${ENV}/storage-provider"
  "${ENV}/s3-bucket"
)

SSO_SECRETS=(
  "${ENV}/scim-api-key"
  "${ENV}/sso-config"
  "${ENV}/google-oauth"
  "${ENV}/github-oauth"
  "${ENV}/azure-ad-oauth"
  "${ENV}/okta-oauth"
  "${ENV}/oidc-config"
)

ALL_SECRETS_EXIST=true
for SECRET_NAME in "${SECRETS[@]}" "${SSO_SECRETS[@]}"; do
  FULL_NAME="aqliya/${SECRET_NAME}"
  if aws secretsmanager describe-secret --secret-id "$FULL_NAME" --region "$REGION" --no-cli-pager &>/dev/null; then
    echo "✅ Secret exists: $FULL_NAME"
  else
    echo "❌ CRITICAL: Secret missing: $FULL_NAME"
    ALL_SECRETS_EXIST=false
  fi
done

if [ "$ALL_SECRETS_EXIST" = false ]; then
  echo ""
  echo "⚠️  Some secrets are missing. Create them before terraform apply."
  echo "   Usage: aws secretsmanager create-secret --name <name> --secret-string <value> --region $REGION"
  echo ""
  echo "   Required (6):"
  echo "   - aqliya/${ENV}/db-password       (RDS master password)"
  echo "   - aqliya/${ENV}/database-url      (DATABASE_URL connection string)"
  echo "   - aqliya/${ENV}/redis-url         (REDIS_URL connection string)"
  echo "   - aqliya/${ENV}/auth-secret       (AUTH_SECRET / NEXTAUTH_SECRET)"
  echo "   - aqliya/${ENV}/storage-provider  (STORAGE_PROVIDER = s3 or local)"
  echo "   - aqliya/${ENV}/s3-bucket         (S3_BUCKET bucket name)"
  echo ""
  echo "   SSO/OAuth (7 — must exist, can have dummy values):"
  echo "   - aqliya/${ENV}/scim-api-key"
  echo "   - aqliya/${ENV}/sso-config"
  echo "   - aqliya/${ENV}/google-oauth"
  echo "   - aqliya/${ENV}/github-oauth"
  echo "   - aqliya/${ENV}/azure-ad-oauth"
  echo "   - aqliya/${ENV}/okta-oauth"
  echo "   - aqliya/${ENV}/oidc-config"
  echo ""
  echo "   Run: scripts/create-secrets.sh ${ENV}"
  exit 1
fi

# ── Check ACM certificate (for production) ──
if [ "$ENV" = "production" ]; then
  DOMAIN="*.aqliya.com"
else
  DOMAIN="*.${ENV}.aqliya.com"
fi

if aws acm list-certificates --region "$REGION" --no-cli-pager \
  --query "CertificateSummaryList[?contains(DomainName, '$DOMAIN')].[DomainName]" \
  --output text | grep -q "$DOMAIN"; then
  echo "✅ ACM certificate found for $DOMAIN"
else
  echo "⚠️  WARNING: ACM certificate not found for $DOMAIN in $REGION"
  echo "   Request one at: https://$REGION.console.aws.amazon.com/acm/home?region=$REGION"
fi

# ── Check Route53 hosted zone (for production) ──
if [ "$ENV" = "production" ]; then
  DOMAIN_BASE="aqliya.com"
else
  DOMAIN_BASE="${ENV}.aqliya.com"
fi

if aws route53 list-hosted-zones --no-cli-pager \
  --query "HostedZones[?contains(Name, '$DOMAIN_BASE')].[Name]" \
  --output text | grep -qi "$DOMAIN_BASE"; then
  echo "✅ Route53 hosted zone exists for $DOMAIN_BASE"
else
  echo "⚠️  WARNING: Route53 hosted zone not found for $DOMAIN_BASE"
  echo "   Create one before deploying."
fi

# ── Summary ──
echo ""
echo "============================================"
echo "  Pre-flight complete for ${ENV}"
echo "============================================"
echo ""
echo "Next steps:"
echo "  1. cd infra/terraform"
echo "  2. terraform init -backend-config=environments/${ENV}/backend.tf"
echo "  3. terraform plan -var-file=environments/${ENV}/terraform.tfvars"
echo "  4. terraform apply -var-file=environments/${ENV}/terraform.tfvars"
