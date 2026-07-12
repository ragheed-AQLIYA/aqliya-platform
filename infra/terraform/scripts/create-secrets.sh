#!/usr/bin/env bash
set -euo pipefail

# ─── AQLIYA Secrets Manager Setup ───
# Creates ALL required secrets for a given environment.
#
# Usage:
#   ./create-secrets.sh <environment> [region]
#   environment: dev, staging, or production
#   region: me-south-1 (default)
#
# IMPORTANT:
# - ALL 13 secrets MUST exist before first deploy (24 env vars, 13 unique secrets)
#   ECS resolves every referenced secret at task start time; missing = task fails
# - For SSO/OAuth providers you don't use, store dummy JSON values
# - Individual plain-string secrets (storage-provider, s3-bucket): ECS passes raw value
# - JSON blob secrets (sso-config, google-oauth, etc.): ECS passes ENTIRE blob to EACH env var.
#   This means AUTH_GOOGLE_ID would get the full JSON, not just the value. SSO will NOT
#   work from these secrets until refactored to individual secrets.
# - Minimum password/secret length: 32 characters for auth-secret

ENV="${1:?Usage: $0 <environment> [region]}"
REGION="${2:-eu-north-1}"
PREFIX="aqliya/${ENV}"

echo "==> Creating secrets for ${ENV} in ${REGION}"
echo "    All secrets will be prefixed with: ${PREFIX}"
echo ""

create_secret() {
  local name="$1"
  local value="$2"
  local full_name="${PREFIX}/${name}"

  if aws secretsmanager describe-secret --secret-id "${full_name}" --region "${REGION}" --no-cli-pager &>/dev/null; then
    echo "   Already exists: ${full_name} — updating"
    aws secretsmanager put-secret-value \
      --secret-id "${full_name}" \
      --secret-string "${value}" \
      --region "${REGION}" \
      --no-cli-pager
  else
    echo "   Creating: ${full_name}"
    aws secretsmanager create-secret \
      --name "${full_name}" \
      --secret-string "${value}" \
      --region "${REGION}" \
      --no-cli-pager
  fi
}

echo "── Required secrets (terraform apply will fail without these) ──"
echo ""

# 1. db-password — RDS master password (plain string)
create_secret "db-password" "$(openssl rand -base64 32 | tr -dc 'A-Za-z0-9' | head -c 24)"

# 2. database-url — Full DATABASE_URL connection string
# Update the password placeholder to match the generated db-password
DB_PASS=$(aws secretsmanager get-secret-value --secret-id "${PREFIX}/db-password" --region "${REGION}" --query SecretString --output text 2>/dev/null || echo "CHANGE_ME")
create_secret "database-url" "postgresql://aqliya_admin:${DB_PASS}@localhost:5432/aqliya"

# 3. redis-url — Redis connection string
create_secret "redis-url" "redis://localhost:6379"

# 4. auth-secret — Shared between AUTH_SECRET and NEXTAUTH_SECRET (min 32 chars)
create_secret "auth-secret" "$(openssl rand -base64 48 | tr -dc 'A-Za-z0-9!@#$%^&*()_+-=' | head -c 64)"

# 5. storage-provider — Plain string: "s3" or "local"
create_secret "storage-provider" "s3"

# 6. s3-bucket — Plain string: S3 bucket name (NOT JSON — ECS passes raw value to env var)
create_secret "s3-bucket" "aqliya-${ENV}-uploads"

echo ""
echo "── Optional SSO/OAuth secrets (must exist but can have dummy values) ──"
echo ""

# 7. scim-api-key — SCIM API key
create_secret "scim-api-key" "$(openssl rand -base64 32 | head -c 40)"

# 8. sso-config — SSO_DEFAULT_ORG_ID
create_secret "sso-config" '{"SSO_DEFAULT_ORG_ID":"default"}'

# ⚠️ NOTE on SSO JSON secrets below: ECS passes the ENTIRE secret value to each env var.
#    For example, both AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET will get the same JSON blob.
#    This means SSO provider env vars won't work correctly until refactored to individual secrets.
#    For now, providers are unconfigured (empty values within JSON).

# 9. google-oauth — Google OAuth (JSON, but both vars get same blob)
create_secret "google-oauth" '{"AUTH_GOOGLE_ID":"","AUTH_GOOGLE_SECRET":""}'

# 10. github-oauth — GitHub OAuth
create_secret "github-oauth" '{"AUTH_GITHUB_ID":"","AUTH_GITHUB_SECRET":""}'

# 11. azure-ad-oauth — Azure AD OAuth
create_secret "azure-ad-oauth" '{"AUTH_AZURE_AD_ID":"","AUTH_AZURE_AD_TENANT_ID":"","AUTH_AZURE_AD_SECRET":""}'

# 12. okta-oauth — Okta OAuth
create_secret "okta-oauth" '{"AUTH_OKTA_ID":"","AUTH_OKTA_SECRET":"","AUTH_OKTA_ISSUER":""}'

# 13. oidc-config — Generic OIDC
create_secret "oidc-config" '{"AUTH_OIDC_ISSUER":"","AUTH_OIDC_CLIENT_ID":"","AUTH_OIDC_CLIENT_SECRET":""}'

echo ""
echo "==> All secrets created/updated for ${ENV}"
echo ""
echo "IMPORTANT: After first deploy, update these secrets with real values:"
echo "  - database-url: replace 'localhost' with the actual RDS endpoint"
echo "  - redis-url: replace 'localhost' with actual Redis endpoint"
echo "  - s3-bucket: confirm bucket name matches Terraform (aqliya-${ENV}-uploads)"
echo "  - SSO/OAuth secrets: will need individual-secret refactoring before SSO works"
echo ""
echo "KNOWN ISSUE: SSO/OAuth JSON secrets pass the whole JSON blob as each env var."
echo "  E.g., AUTH_GOOGLE_ID gets '{\"AUTH_GOOGLE_ID\":\"\",\"AUTH_GOOGLE_SECRET\":\"\"}'"
echo "  instead of just the ID value. SSO providers won't work until refactored."
