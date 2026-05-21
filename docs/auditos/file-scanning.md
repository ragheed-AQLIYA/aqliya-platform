# File Scanning

## Current Architecture

AuditOS currently stores **evidence metadata only** (filename, type, size, hash). No actual file bytes are uploaded or stored. The scanner abstraction validates that the security check is performed before evidence creation is allowed.

## Scanner Modes

### Development Mode (`NODE_ENV=development`)

- Mock scanner returns `skipped_dev` status
- Evidence creation proceeds
- Every scan result is clearly labeled as "DEV ONLY — No real virus scan performed"
- Scan AuditEvent is recorded for traceability

### Production Mode (`NODE_ENV=production`)

- **Fail-closed**: If `SCANNER_PROVIDER` is not configured, ALL evidence creation is blocked
- Error: `"File scanning is not configured. Upload blocked for production safety."`
- Even if `SCANNER_PROVIDER` is set, the only supported result is `error` until a real scanner is integrated

## Configuration

| Variable           | Required   | Description                                         |
| ------------------ | ---------- | --------------------------------------------------- |
| `SCANNER_PROVIDER` | Production | Set to `"clamav"`, `"s3"`, or other once integrated |

## How It Works

```
createEvidenceAction
  → validate file type (whitelist)
  → validate file size (20MB max)
  → scanEvidenceFile()
    → dev: returns skipped_dev (mock clean)
    → prod + no provider: returns error → blocks upload
    → prod + provider: returns error (not integrated yet)
  → if scan passes → create evidence
  → record AuditEvent evidence.file_scanned
```

## Scan Result Flow

| Result        | Dev Behavior               | Production Behavior               |
| ------------- | -------------------------- | --------------------------------- |
| `clean`       | N/A (dev uses skipped_dev) | Requires real scanner integration |
| `skipped_dev` | ✅ Allow                   | Never returned in production      |
| `infected`    | ❌ Block                   | ❌ Block                          |
| `error`       | Allow (dev)                | ❌ Block                          |

## Audit Trail

Every scan creates an `evidence.file_scanned` AuditEvent with:

- `scanStatus`: clean / infected / error / skipped_dev
- `scanProvider`: provider name
- `scannedAt`: ISO timestamp

## Recommended Providers

| Provider                   | Type        | Notes                                  |
| -------------------------- | ----------- | -------------------------------------- |
| ClamAV                     | Open source | Can run as daemon, REST API available  |
| AWS S3 Virus Scanning      | Cloud       | Uses ClamAV integration with S3 events |
| Azure Defender for Storage | Cloud       | Built-in malware scanning              |
| VirusTotal API             | Cloud API   | For low-volume scans                   |

## Limitations

- No real scanner is currently integrated
- Production deployment requires configuring a scanner provider
- File bytes are not currently persisted — only metadata
- When real file upload is implemented, scanner must be integrated before production use

## Production Blocker

See `Virus/malware scanning` in the Production Blockers tracker. Currently open. When a real scanner is integrated and tested, mark resolved.
