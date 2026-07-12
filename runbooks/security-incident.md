# Security Incident Runbook

**Document Owner:** Security Agent
**Last Updated:** 2026-07-11
**Status:** Verified against code and infrastructure
**Applies to:** AQLIYA Platform — Security Operations

---

## 1. Overview

This runbook covers security incident detection, response, and recovery for the AQLIYA platform. AQLIYA's security posture includes CSP headers, TLS termination, ClamAV file scanning, Redis authentication, and comprehensive audit logging.

### Security Layers

| Layer | Component | Purpose |
|-------|-----------|---------|
| **Transport** | TLS (HTTPS) | Encrypt data in transit |
| **Application** | CSP headers, security headers | Prevent XSS, clickjacking, MIME sniffing |
| **Authentication** | NextAuth v5 | Session management, OAuth, email magic links |
| **Authorization** | RBAC + middleware | Role-based access, tenant isolation |
| **Data** | PostgreSQL with RLS | Row-level security, tenant isolation |
| **Files** | ClamAV scanning | Malware detection in uploads |
| **Cache** | Redis auth + TLS | Secure rate limiting and caching |
| **Monitoring** | Audit logs, alerts | Security event tracking |
| **Infra** | WAF, CloudWatch | DDoS protection, monitoring |

---

## 2. Incident Severity Classification

| Severity | Description | Response Time | Examples |
|----------|-------------|---------------|----------|
| **P0 — Critical** | Active breach, data exfiltration, system compromise | Immediate | Unauthorized data access, admin account takeover, SQL injection exploit |
| **P1 — High** | Vulnerability actively exploited or critical system failure | < 1 hour | ClamAV bypass, auth bypass, CSP bypass, Redis unauthorized access |
| **P2 — Medium** | Suspicious activity, potential vulnerability, service degradation | < 4 hours | Unusual audit log patterns, failed auth spikes, rate limiter abuse |
| **P3 — Low** | Minor security issue, best practice deviation | < 24 hours | Header misconfiguration, outdated dependency, info disclosure |

---

## 3. Detection Sources

### Application-Level

| Source | What to Monitor | Location |
|--------|----------------|----------|
| Audit logs | All mutations, file scans, auth events | `AuditEvent` table |
| CSP violation reports | XSS attempts, injection attempts | `/api/csp-report` endpoint |
| Rate limiter blocks | Brute force, abuse patterns | Memory rate limiter / Redis keys |
| Health check failures | Service degradation | `/api/health/ready` |
| Error logs | Exceptions, stack traces | Application logs |

### Infrastructure-Level

| Source | What to Monitor | Location |
|--------|----------------|----------|
| WAF logs | Blocked requests, SQL injection, XSS | AWS WAF logs |
| ALB access logs | Request patterns, IP anomalies | S3 bucket |
| CloudWatch alarms | CPU, memory, connections | CloudWatch dashboard |
| ECS service events | Container crashes, OOM | ECS console |
| ElastiCache metrics | Memory, connections, evictions | CloudWatch |

### External

| Source | What to Monitor |
|--------|----------------|
| GitHub Security Advisories | Dependency vulnerabilities |
| CVE databases | Known vulnerabilities in stack |
| User reports | Phishing, social engineering attempts |

---

## 4. Common Security Incidents

### 4.1 Unauthorized Data Access

**Indicators:**
- Audit log shows access to data outside user's organization/tenant
- Unusual IP addresses accessing sensitive endpoints
- Multiple failed auth attempts followed by success

**Response:**
```bash
# 1. Check audit logs for the suspicious session/user
psql -c "SELECT * FROM \"AuditEvent\" WHERE \"userId\" = '<user-id>' ORDER BY \"createdAt\" DESC LIMIT 50;"

# 2. Check for tenant boundary violations
psql -c "SELECT * FROM \"AuditEvent\" WHERE \"organizationId\" != '<expected-org>' AND \"userId\" = '<user-id>';"

# 3. Terminate sessions if needed
psql -c "DELETE FROM \"Session\" WHERE \"userId\" = '<user-id>';"

# 4. Check for data exfiltration in download logs
psql -c "SELECT * FROM \"AuditEvent\" WHERE action LIKE '%download%' AND \"userId\" = '<user-id>';"
```

### 4.2 Brute Force Attack

**Indicators:**
- Rate limiter shows high block count on `/api/auth` routes
- Multiple failed sign-in attempts from same IP
- `AUTH_200` (success) after many `AUTH_401` (failures)

**Response:**
```bash
# 1. Check rate limiter status
redis-cli -a <password> keys 'ratelimit:*' | grep auth

# 2. Check memory rate limiter (if not using Redis)
# Look for high block counts in application logs

# 3. Block IP at WAF level if confirmed attack
aws waf update-web-acl --web-acl-id <acl-id> --changes '...'

# 4. Force password reset for targeted accounts
# via admin panel or database
```

### 4.3 Malicious File Upload

**Indicators:**
- ClamAV scan returns `FOUND` status
- Audit log shows `file_scan` event with `infected` status
- User account associated with multiple infected upload attempts

**Response:**
```bash
# 1. Check file scan audit logs
psql -c "SELECT * FROM \"AuditEvent\" WHERE action = 'file_scan' AND details->>'status' = 'infected';"

# 2. Identify the user and file
psql -c "SELECT e.*, u.email FROM \"AuditEvent\" e JOIN \"User\" u ON e.\"userId\" = u.id WHERE e.action = 'file_scan' AND e.details->>'status' = 'infected';"

# 3. Check if any infected files were stored (should be blocked)
# The system blocks infected files — verify no storage events
psql -c "SELECT * FROM \"AuditEvent\" WHERE action = 'file_upload' AND \"createdAt\" > '<incident-time>';"

# 4. Review user account for abuse
# Consider temporary suspension if confirmed abuse
```

### 4.4 CSP Violation / XSS Attempt

**Indicators:**
- CSP violation reports received at `/api/csp-report`
- Unusual script sources or inline script attempts

**Response:**
```bash
# 1. Check CSP violation reports
# Review /api/csp-report endpoint logs

# 2. Analyze the violation
# Look for:
# - Script sources (script-src)
# - Inline styles (style-src)
# - Connection attempts (connect-src)

# 3. Determine if it's a legitimate violation or attack
# Legitimate: New feature trying to load external resource
# Attack: Suspicious script sources, encoded payloads

# 4. If attack: Check user session and audit trail
# If legitimate: Update CSP policy in next.config
```

### 4.5 Redis Unauthorized Access

**Indicators:**
- Unusual Redis memory usage
- Unknown keys in Redis
- Redis connection count spike

**Response:**
```bash
# 1. Check connected clients
redis-cli -a <password> client list

# 2. Check for unknown keys
redis-cli -a <password> keys '*' | grep -v 'aqliya:cache:' | grep -v 'ratelimit:'

# 3. Check Redis slow log for suspicious commands
redis-cli -a <password> slowlog get 20

# 4. If confirmed compromise:
# Rotate REDIS_PASSWORD immediately
# Update ECS task definition
# Deploy new task
```

### 4.6 Rate Limiter Abuse

**Indicators:**
- High block rate across multiple endpoints
- Distributed attacks from multiple IPs
- Legitimate users being rate limited due to shared IP

**Response:**
```bash
# 1. Check rate limiter metrics
redis-cli -a <password> keys 'ratelimit:*' | wc -l

# 2. Identify attack patterns
# Check if single IP or distributed

# 3. Temporary: Add IP block at WAF
# Long-term: Consider more aggressive rate limits for specific endpoints

# 4. Monitor for false positives on legitimate users
```

---

## 5. CSP Configuration

### Current Policy

From `next.config`:

```javascript
contentSecurityPolicy: {
  "default-src": ["'self'"],
  "script-src": ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": ["'self'", "data:", "https:"],
  "font-src": ["'self'"],
  "connect-src": ["'self'", "http://localhost:54329"],
  "frame-ancestors": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "worker-src": ["'none'"],
  "manifest-src": ["'self'"],
}
```

### CSP Violation Report Endpoint

Reports are sent to `/api/csp-report` and logged for analysis.

---

## 6. Response Procedures

### General Incident Response Flow

```
1. DETECT
   └── Identify indicators of compromise
   └── Classify severity (P0-P3)

2. CONTAIN
   └── Isolate affected systems
   └── Terminate compromised sessions
   └── Block attacking IPs/accounts

3. ERADICATE
   └── Remove malicious content
   └── Patch vulnerabilities
   └── Rotate compromised credentials

4. RECOVER
   └── Restore from clean backups if needed
   └── Verify system integrity
   └── Resume normal operations

5. DOCUMENT
   └── Log all actions in audit trail
   └── Create incident report
   └── Update runbooks if needed
```

### Credential Rotation

| Credential | How to Rotate | Impact |
|------------|---------------|--------|
| `AUTH_SECRET` | Update ECS task definition, redeploy | All sessions invalidated |
| `REDIS_PASSWORD` | Update ECS task definition, redeploy | Rate limiter resets, cache cleared |
| `DATABASE_URL` | Update ECS task definition, redeploy | All sessions invalidated |
| `CSRF_SECRET` | Update ECS task definition, redeploy | CSRF tokens reset |

---

## 7. AWS WAF Integration

### WAF Rules

| Rule | Type | Value | Purpose |
|------|------|-------|---------|
| Rate-based | Rate | 5000 requests / 5min / IP | DDoS protection |
| AWS Managed Rules | Group | AWSManagedRulesCommonRuleSet | SQL injection, XSS, etc. |
| Geo Blocking | Optional | Configurable | Block specific countries |

### Blocking an IP at WAF

```bash
# Get WAF Web ACL ID
aws wafv2 list-web-acls --scope REGIONAL

# Add IP to block list (requires IP set)
aws wafv2 create-ip-set --name "blocked-ips" --scope REGIONAL --addresses "1.2.3.4/32"

# Update WAF rule to reference IP set
aws wafv2 update-web-acl --web-acl-id <acl-id> ...
```

---

## 8. Audit Trail for Security Events

All security events are logged via `writePlatformAuditLog()`:

| Event | Action | Logged Details |
|-------|--------|----------------|
| Login success | `auth_login_success` | userId, email, ip, userAgent |
| Login failure | `auth_login_failure` | email, reason, ip, userAgent |
| File scan clean | `file_scan` | fileName, fileSize, status: "clean" |
| File scan infected | `file_scan` | fileName, fileSize, status: "infected" |
| Rate limit hit | `rate_limit_exceeded` | path, limit, window |
| Permission denied | `permission_denied` | userId, resource, action |
| Data access | `data_access` | userId, resource, resourceId |

### Querying Security Events

```sql
-- Failed logins in last 24 hours
SELECT * FROM "AuditEvent" 
WHERE action = 'auth_login_failure' 
AND "createdAt" > NOW() - INTERVAL '24 hours'
ORDER BY "createdAt" DESC;

-- File scan infections
SELECT * FROM "AuditEvent" 
WHERE action = 'file_scan' 
AND details->>'status' = 'infected';

-- Rate limit hits
SELECT * FROM "AuditEvent" 
WHERE action = 'rate_limit_exceeded'
ORDER BY "createdAt" DESC;
```

---

## 9. Post-Incident Checklist

After any security incident:

- [ ] Confirm all compromised sessions are terminated
- [ ] Verify affected credentials have been rotated
- [ ] Check for data exfiltration in audit logs
- [ ] Review and update CSP policy if needed
- [ ] Check ClamAV for any bypass attempts
- [ ] Verify Redis integrity (no unauthorized keys)
- [ ] Document incident timeline
- [ ] Create incident report
- [ ] Update security policies if needed
- [ ] Schedule post-mortem meeting for P0/P1 incidents
- [ ] Notify affected users if data breach confirmed
- [ ] Update this runbook with new findings

---

## 10. Contact & Escalation

| Severity | Primary | Escalation | Timeline |
|----------|---------|------------|----------|
| P0 | Security Lead | CTO | Immediate |
| P1 | Security Lead | CTO | < 1 hour |
| P2 | Security Agent | Security Lead | < 4 hours |
| P3 | Security Agent | Security Lead | < 24 hours |

---

## 11. Reference

| Document | Path |
|----------|------|
| CSP configuration | `next.config` (securityHeaders.csp) |
| CSP report endpoint | `src/app/api/csp-report/route.ts` |
| Rate limiter | `src/lib/platform/rate-limiter/` |
| ClamAV client | `src/lib/audit/clamav-client.ts` |
| Redis client | `src/lib/platform/redis-client.ts` |
| Audit logging | `src/lib/platform/audit.ts` |
| Security skill | `.skills/aqliya/aqliya-security-gate.md` |

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-07-11 | Documentation Agent | Initial runbook created from codebase verification |
