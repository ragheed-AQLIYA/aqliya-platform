# ClamAV Scanner Runbook

**Document Owner:** Infrastructure Agent
**Last Updated:** 2026-07-11
**Status:** Verified against code and IaC
**Applies to:** AQLIYA Platform — File Scanning Service

---

## 1. Overview

AQLIYA uses **ClamAV** as its file scanning service to detect malicious content in uploaded files before storage. ClamAV runs as a **sidecar container** alongside the main Next.js application in ECS Fargate.

### Architecture Summary

| Component | Detail |
|-----------|--------|
| **ClamAV image** | `clamav/clamav:1.3` (production), `clamav/clamav:latest` (staging) |
| **Port** | 3310 (TCP, ClamD protocol) |
| **Protocol** | ClamD INSTREAM (binary chunked upload over TCP) |
| **Placement** | ECS Fargate sidecar (same task definition as app) |
| **DNS** | `127.0.0.1` in ECS (localhost within task), `clamav` in Docker Compose |
| **Env vars** | `SCANNER_PROVIDER=clamav`, `CLAMAV_HOST=127.0.0.1`, `CLAMAV_PORT=3310` |
| **Resource allocation** | 128 CPU / 256 MB memory (ECS task definition) |

---

## 2. How File Scanning Works

### Request Flow

```
User uploads file
  → Server Action receives file
    → scanEvidenceFile() in src/lib/audit/file-scanner.ts
      → SCANNER_PROVIDER check:
        ├── "clamav" → scanBufferWithClamAv() / pingClamAv()
        │     → TCP socket to ClamAV on CLAMAV_HOST:CLAMAV_PORT
        │     → INSTREAM chunked scan
        │     → Response: "OK" (clean) or "FOUND" (infected)
        ├── "" (not set) → error: "File scanning not configured"
        └── dev mode → skipped ("skipped_dev")
      → File scan result:
        ├── clean → file stored to disk/S3
        ├── infected → upload REJECTED, audit log entry
        ├── error → upload REJECTED, audit log entry
        └── skipped_dev → file stored (dev only)
```

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/audit/clamav-client.ts` | TCP socket client — `pingClamAv()`, `scanBufferWithClamAv()` |
| `src/lib/audit/file-scanner.ts` | Scanner orchestrator — `scanEvidenceFile()`, `isScanRejected()` |
| `src/__tests__/unit/file-scanner.test.ts` | Unit tests for scanner |
| `infra/terraform/modules/compute/main.tf` | ECS sidecar container definition (lines 221-249) |
| `docker-compose.yml` | Local Docker Compose clamav service (lines 53-67) |
| `docker-compose.staging.yml` | Staging Docker Compose clamav service (lines 55-67) |

### ClamAV Client Protocol

The client communicates over TCP using ClamD's binary protocol:

1. **Ping:** Send `zPING\0` → expect `PONG` response
2. **Scan:** Send `zINSTREAM\0` followed by 64KB chunks with 4-byte big-endian length prefix, terminated by zero-length chunk → expect `OK` or `FOUND`

Socket timeout: 30 seconds per command.

---

## 3. Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SCANNER_PROVIDER` | **Yes (production)** | `""` (empty = blocked) | Must be `"clamav"` to enable scanning |
| `CLAMAV_HOST` | No | `127.0.0.1` | ClamAV daemon hostname |
| `CLAMAV_PORT` | No | `3310` | ClamAV daemon port |

### Production Safety

In production (`NODE_ENV=production`):
- If `SCANNER_PROVIDER` is not set → `scanEvidenceFile()` returns `status: "error"` → upload is **blocked**
- If `SCANNER_PROVIDER` is not `"clamav"` → returns `status: "error"` → upload is **blocked**
- The `isScanRejected()` function returns `true` for both `"infected"` and `"error"` statuses

In development (`NODE_ENV !== "production"`):
- Scanning is skipped with `"skipped_dev"` status → files are stored without scanning
- This is intentional for development speed

---

## 4. ECS Sidecar Configuration

From `infra/terraform/modules/compute/main.tf`:

```hcl
{
  name      = "clamav"
  image     = "clamav/clamav:1.3"
  essential = true
  cpu       = 128
  memory    = 256
  portMappings = [{
    containerPort = 3310
    hostPort      = 3310
    protocol      = "tcp"
  }]
  healthCheck = {
    command     = ["CMD-SHELL", "clamdcheck.sh || exit 1"]
    interval    = 30
    timeout     = 10
    retries     = 3
    startPeriod = 120
  }
}
```

### Key Points

- **Essential container:** If ClamAV fails health checks, ECS will restart the entire task
- **120-second start period:** ClamAV needs time to load virus definitions on startup
- **Shared localhost:** The app container communicates with ClamAV via `127.0.0.1:3310` (same ECS task network namespace)
- **Ephemeral definitions:** ClamAV loads definitions from `clamav/clamav:1.3` base image; for production, consider a `freshclam` sidecar or volume mount for updated definitions

---

## 5. Health Checks

### ClamAV Daemon Health

**Check from within the ECS task or Docker container:**

```bash
# TCP ping (ClamD protocol)
echo -n "zPING\0" | nc -w 5 127.0.0.1 3310
# Expected: PONG

# Or via clamdcheck.sh (used by Docker healthcheck)
clamdcheck.sh
# Expected: exit 0
```

### Application Health (includes scanner check)

```bash
curl -s http://localhost:3000/api/health/ready | jq '.checks'
# Look for: storage check should pass if SCANNER_PROVIDER is configured
```

### ECS Health Check Monitoring

In the ECS console or via AWS CLI:

```bash
aws ecs describe-services \
  --cluster aqliya-prod-cluster \
  --services aqliya-prod-service \
  --query 'services[0].healthCheckGracePeriodSeconds'
```

---

## 6. Troubleshooting

### ClamAV Won't Start

**Symptoms:** ECS task fails to reach steady state. ClamAV container reports unhealthy.

**Causes:**
1. Virus definitions too old or corrupt (freshclam failed)
2. Insufficient memory (256 MB may be tight for large definitions)
3. Network issues downloading definitions at startup

**Resolution:**
```bash
# Check ClamAV logs in CloudWatch
aws logs get-log-events \
  --log-group-name /ecs/aqliya-prod \
  --log-stream-prefix clamav

# In Docker locally:
docker compose logs clamav --tail 50

# Force fresh definitions:
docker compose exec clamav freshclam
```

### Scan Timeouts

**Symptoms:** `ClamAV timeout connecting to 127.0.0.1:3310` in app logs.

**Causes:**
- Large files (>100MB) may exceed the 30-second socket timeout
- ClamAV CPU constrained at 128 CPU units

**Resolution:**
1. Check if ClamAV is overloaded: `docker compose exec clamav top`
2. Increase ECS task CPU for the ClamAV container if consistently slow
3. For very large files, consider streaming scan with progress monitoring
4. Monitor scan duration in audit logs

### False Positives (Clean Files Flagged as Infected)

**Symptoms:** Legitimate user files rejected with `"infected"` status.

**Causes:**
- Overly aggressive ClamAV signatures
- Files containing patterns that match malware signatures (e.g., SQL scripts, encoded content)

**Resolution:**
1. Check the ClamAV scan response message for the specific signature name
2. If confirmed false positive, add a signature exclusion in ClamAV config:
   ```bash
   # In clamd.conf (or via Docker volume mount):
   ExclusionPath some/path
   ```
3. Log the false positive for audit trail
4. Consider adding the file type to a whitelist if it's a known-safe pattern

### Uploads Blocked in Production (Error Status)

**Symptoms:** All file uploads fail with `"error"` status and message "File scanning is not configured."

**Causes:**
- `SCANNER_PROVIDER` environment variable not set in ECS task definition
- ClamAV container not running or unreachable

**Resolution:**
```bash
# 1. Verify env var in ECS task definition
aws ecs describe-task-definition \
  --task-definition aqliya-prod-app \
  --query 'taskDefinition.containerDefinitions[?name==`app`].environment'

# 2. Verify ClamAV is running
aws ecs describe-services \
  --cluster aqliya-prod-cluster \
  --services aqliya-prod-service

# 3. If SCANNER_PROVIDER is missing, update the task definition
# and redeploy
```

---

## 7. Updating ClamAV

### Version Updates

1. Update the image tag in `infra/terraform/modules/compute/main.tf` (line 223):
   ```hcl
   image = "clamav/clamav:1.4"  # or latest stable
   ```
2. Update `docker-compose.yml` and `docker-compose.staging.yml` to match
3. Run `terraform plan` to verify the change
4. Deploy via the standard deploy pipeline

### Virus Definition Updates

ClamAV downloads definitions at startup via `freshclam`. For production:

- **ECS Fargate:** Definitions are baked into the container image at build time; ECS downloads fresh definitions at task start
- **Staging Docker Compose:** Uses a named volume `clamav_staging` for definition persistence
- **Local Docker Compose:** Uses a named volume `clamav_db` for definition persistence

For more frequent definition updates, add a `freshclam` init container or sidecar that runs `freshclam` on a schedule.

---

## 8. Security Considerations

- **Fail-closed design:** If ClamAV is unreachable or `SCANNER_PROVIDER` is unset, uploads are **blocked** in production — never allowed through
- **No bypass:** There is no admin override to skip scanning in production
- **Audit trail:** Every scan result (clean, infected, error) is logged via `writePlatformAuditLog`
- **Resource isolation:** ClamAV runs in its own container with limited CPU/memory — cannot affect the app container's memory
- **Network isolation:** ClamAV is only accessible on localhost within the ECS task — no external exposure

---

## 9. Reference

| Document | Path |
|----------|------|
| ClamAV client | `src/lib/audit/clamav-client.ts` |
| File scanner | `src/lib/audit/file-scanner.ts` |
| Scanner tests | `src/__tests__/unit/file-scanner.test.ts` |
| ECS sidecar definition | `infra/terraform/modules/compute/main.tf` (lines 221-249) |
| Docker Compose | `docker-compose.yml` (lines 53-67) |
| Staging Compose | `docker-compose.staging.yml` (lines 55-67) |
| Terraform variables | `infra/terraform/variables.tf` |

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-07-11 | Documentation Agent | Initial runbook created from codebase and IaC verification |
