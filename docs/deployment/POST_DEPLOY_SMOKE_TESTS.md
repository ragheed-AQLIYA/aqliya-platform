# AQLIYA Post-Deploy Smoke Tests

**Purpose:** Run these tests after any deployment to verify the environment is healthy.

---

## 1. Infrastructure Health

```bash
# Terraform state
terraform show | head -20

# ECS service
aws ecs describe-services \
  --cluster aqliya-dev-cluster \
  --services aqliya-dev-service \
  --query 'services[0].{running:runningCount,desired:desiredCount}'

# RDS
aws rds describe-db-instances \
  --db-instance-identifier aqliya-dev-db \
  --query 'DBInstances[0].{status:DBInstanceStatus,retention:BackupRetentionPeriod}'

# CloudFront
aws cloudfront get-distribution --id <DISTRIBUTION_ID> \
  --query 'Distribution.{domain:DomainName,status:Status}'
```

---

## 2. Application Health

```bash
# Health endpoint (returns JSON with detailed checks)
curl -s https://dev.aqliya.com/api/health | jq .

# Expected response:
# {"status":"ok","checks":{"database":{"ok":true},"auth_secret":{"ok":true}}}

# Quick HTTP check
curl -s -o /dev/null -w "%{http_code}" https://dev.aqliya.com/api/health
# Expected: 200

# Liveness check
curl -s -o /dev/null -w "%{http_code}" https://dev.aqliya.com/api/health/live
# Expected: 200

# Readiness check
curl -s -o /dev/null -w "%{http_code}" https://dev.aqliya.com/api/health/ready
# Expected: 200
```

---

## 3. Page Rendering

```bash
# Main page
curl -s -o /dev/null -w "%{http_code}" https://dev.aqliya.com/
# Expected: 200

# Login page
curl -s -o /dev/null -w "%{http_code}" https://dev.aqliya.com/login
# Expected: 200

# Signup page
curl -s -o /dev/null -w "%{http_code}" https://dev.aqliya.com/signup
# Expected: 200

# Check HTML title
curl -s https://dev.aqliya.com/ | grep -o '<title>[^<]*</title>'
# Expected: Contains "AQLIYA"
```

---

## 4. Authentication

```bash
# Auth endpoint returns 200 (allows unauthenticated for login page)
curl -s -o /dev/null -w "%{http_code}" https://dev.aqliya.com/login
# Expected: 200

# Protected page should redirect or show error
curl -s -o /dev/null -w "%{http_code}" https://dev.aqliya.com/settings
# Expected: 302 (redirect to login)
```

---

## 5. Protected APIs

```bash
# All protected endpoints should return 401 or 302
for path in metrics monitoring notifications; do
  code=$(curl -s -o /dev/null -w "%{http_code}" https://dev.aqliya.com/api/$path)
  echo "/api/$path → $code"
done

# Expected: 401 (or 302)
```

---

## 6. Security Headers

```bash
curl -s -I https://dev.aqliya.com/api/health | grep -E "^HTTP|strict-transport|content-security|frame|x-content|referrer"

# Expected headers:
# Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
# Content-Security-Policy: default-src 'self'...
# X-Frame-Options: SAMEORIGIN
# X-Content-Type-Options: nosniff
# Referrer-Policy: strict-origin-when-cross-origin
```

---

## 7. TLS / Certificate

```bash
openssl s_client -connect dev.aqliya.com:443 -servername dev.aqliya.com 2>&1 | openssl x509 -noout -text | grep -E "Subject:|Issuer:|Not Before|Not After"
```

---

## 8. DNS Resolution

```bash
nslookup dev.aqliya.com
# Expected: resolves to CloudFront IP

dig dev.aqliya.com +short
# Expected: CloudFront IP or alias
```

---

## 9. Static Assets

```bash
# Check that static assets load (Next.js chunks, CSS)
curl -s -o /dev/null -w "%{http_code}" https://dev.aqliya.com/_next/static/chunks/webpack-*.js
# Expected: 200
```

---

## 10. Full Chain Test

```bash
# Verify the entire chain: DNS → CloudFront → WAF → ALB → ECS → RDS
curl -s https://dev.aqliya.com/api/health | jq '.status'
# Expected: "ok"
curl -s https://dev.aqliya.com/api/health | jq '.checks.database.ok'
# Expected: true
curl -s https://dev.aqliya.com/api/health | jq '.checks.auth_secret.ok'
# Expected: true
```
